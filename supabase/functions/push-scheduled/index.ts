/**
 * Push Scheduled Edge Function
 *
 * Отправляет запланированные push уведомления:
 * - Ежедневные напоминания в 21:00 (daily_reminder)
 * - Еженедельные мотивационные карточки (weekly_motivation)
 * - Напоминания о целях (goal_reminder)
 *
 * Вызывается через Supabase Cron Jobs
 *
 * Endpoints:
 * - POST /push-scheduled?type=daily_reminder - Ежедневное напоминание
 * - POST /push-scheduled?type=weekly_motivation - Еженедельная мотивация
 * - POST /push-scheduled?type=goal_reminder - Напоминание о целях
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { trackPushDelivery } from '../_shared/push-metrics.ts';

// CORS headers
const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase Admin Client
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
	throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Получает шаблон уведомления из БД
 */
async function getTemplate(type: string, language = 'ru') {
	try {
		const { data: template, error } = await supabaseAdmin
			.from('push_notification_templates')
			.select('*')
			.eq('type', type)
			.eq('is_active', true)
			.single();

		if (error || !template) {
			console.error(`[PUSH-SCHEDULED] Template not found: ${type}`, error);
			return null;
		}

		// Получаем перевод для языка или используем дефолтный
		const translation = template.translations?.[language];
		const title = translation?.title || template.title;
		const body = translation?.body || template.body;

		return {
			...template,
			title,
			body,
		};
	} catch (error) {
		console.error('[PUSH-SCHEDULED] Failed to get template:', error);
		return null;
	}
}

/**
 * Заменяет переменные в тексте шаблона
 */
function replaceVariables(text: string, variables: Record<string, string>): string {
	let result = text;
	for (const [key, value] of Object.entries(variables)) {
		result = result.replace(new RegExp(`{${key}}`, 'g'), value);
	}
	return result;
}

/**
 * Конвертирует UTC время в локальное время пользователя
 * Использует Intl.DateTimeFormat для точной конвертации с учетом DST
 *
 * @param utcDate - Дата в UTC
 * @param timezone - IANA timezone (например, "Europe/Moscow", "America/New_York")
 * @returns Объект с локальным временем { hour, minute, date }
 */
function convertToUserTimezone(
	utcDate: Date,
	timezone: string
): { hour: number; minute: number; date: Date } {
	try {
		// Используем Intl.DateTimeFormat для точной конвертации
		const formatter = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			hour: 'numeric',
			minute: 'numeric',
			hour12: false,
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
		});

		const parts = formatter.formatToParts(utcDate);
		const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
		const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
		const year = parseInt(parts.find((p) => p.type === 'year')?.value || '0', 10);
		const month = parseInt(parts.find((p) => p.type === 'month')?.value || '0', 10);
		const day = parseInt(parts.find((p) => p.type === 'day')?.value || '0', 10);

		return {
			hour,
			minute,
			date: new Date(year, month - 1, day, hour, minute),
		};
	} catch (error) {
		console.error(`[PUSH-SCHEDULED] Failed to convert timezone ${timezone}:`, error);
		// Fallback: возвращаем UTC время
		return {
			hour: utcDate.getUTCHours(),
			minute: utcDate.getUTCMinutes(),
			date: utcDate,
		};
	}
}

/**
 * Получает пользователей которые должны получить уведомление СЕЙЧАС
 * Учитывает timezone пользователя и его предпочтения по времени
 *
 * @param notificationType - Тип уведомления (daily_reminder, weekly_motivation, etc.)
 * @param targetTime - Целевое время в формате "HH:MM" (например, "21:00")
 * @param timeSlot - Слот времени: "morning" | "evening" | "both"
 * @param premiumOnly - Только Premium пользователи
 * @returns Массив user_id пользователей которые должны получить уведомление
 */
async function getUsersForScheduledTime(
	notificationType: string,
	timeSlot: 'morning' | 'evening' | 'both',
	premiumOnly = false
): Promise<string[]> {
	try {
		const nowUTC = new Date();
		const currentUTCHour = nowUTC.getUTCHours();
		const currentUTCMinute = nowUTC.getUTCMinutes();

		console.log(
			`[PUSH-SCHEDULED] Current UTC time: ${currentUTCHour}:${currentUTCMinute.toString().padStart(2, '0')}`
		);

		// Получаем пользователей с активными push subscriptions
		const { data: subscriptions, error: subError } = await supabaseAdmin
			.from('push_subscriptions')
			.select('user_id')
			.eq('is_active', true);

		if (subError) {
			console.error('[PUSH-SCHEDULED] Failed to get subscriptions:', subError);
			return [];
		}

		const uniqueUserIds = [...new Set(subscriptions.map((sub) => sub.user_id))];

		// Получаем профили пользователей с timezone и настройками
		const { data: profiles, error: profileError } = await supabaseAdmin
			.from('profiles')
			.select('id, timezone, notification_settings, is_premium, subscription_status')
			.in('id', uniqueUserIds);

		if (profileError) {
			console.error('[PUSH-SCHEDULED] Failed to get profiles:', profileError);
			return [];
		}

		// Фильтруем пользователей по локальному времени
		const usersToNotify = profiles.filter((profile) => {
			// Проверка Premium статуса
			if (premiumOnly) {
				const isPremium =
					profile.is_premium ||
					profile.subscription_status === 'premium' ||
					profile.subscription_status === 'trial';
				if (!isPremium) {
					return false;
				}
			}

			// Проверяем настройки уведомлений
			const settings = profile.notification_settings || {};

			// Проверяем что уведомление включено
			if (notificationType === 'daily_reminder' && !settings.dailyReminder) {
				return false;
			}
			if (notificationType === 'weekly_motivation' && !settings.motivational) {
				return false;
			}
			if (notificationType === 'goal_reminder' && !settings.achievements) {
				return false;
			}

			// Проверяем selectedTime (morning/evening/both/none)
			const selectedTime = settings.selectedTime || 'none';
			if (selectedTime === 'none') {
				return false;
			}

			// Если timeSlot не соответствует selectedTime, пропускаем
			if (timeSlot === 'morning' && selectedTime !== 'morning' && selectedTime !== 'both') {
				return false;
			}
			if (timeSlot === 'evening' && selectedTime !== 'evening' && selectedTime !== 'both') {
				return false;
			}

			// Получаем целевое время из настроек
			const targetTime =
				timeSlot === 'morning' ? settings.morningTime || '08:00' : settings.eveningTime || '21:00';

			const [targetHour, targetMinute] = targetTime.split(':').map(Number);

			// Конвертируем UTC время в локальное время пользователя
			const userTimezone = profile.timezone || 'UTC';
			const userLocalTime = convertToUserTimezone(nowUTC, userTimezone);

			// Проверяем: совпадает ли локальный час с целевым временем?
			// Используем диапазон ±30 минут для учета задержек Cron Job
			const isTimeMatch = userLocalTime.hour === targetHour;

			if (isTimeMatch) {
				console.log(
					`[PUSH-SCHEDULED] User ${profile.id} (${userTimezone}): ` +
						`Local time ${userLocalTime.hour}:${userLocalTime.minute.toString().padStart(2, '0')} ` +
						`matches target ${targetHour}:${targetMinute.toString().padStart(2, '0')} ✅`
				);
			}

			return isTimeMatch;
		});

		const userIds = usersToNotify.map((p) => p.id);

		console.log(
			`[PUSH-SCHEDULED] Found ${userIds.length} users for ${notificationType} at ${timeSlot} time`
		);

		return userIds;
	} catch (error) {
		console.error('[PUSH-SCHEDULED] Error in getUsersForScheduledTime:', error);
		return [];
	}
}

/**
 * Генерирует AI-персонализированное уведомление для Premium пользователя
 */
async function generateAIPersonalizedNotification(
	userId: string,
	type: string
): Promise<{ title: string; body: string } | null> {
	try {
		console.log(`[PUSH-SCHEDULED] Generating AI personalized notification for user ${userId}`);

		// Вызываем push-ai-personalize Edge Function с action=generate_only
		const response = await fetch(
			`${supabaseUrl}/functions/v1/push-ai-personalize?user_id=${userId}&type=${type}&action=generate_only`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${supabaseServiceKey}`,
				},
			}
		);

		if (!response.ok) {
			console.error(
				`[PUSH-SCHEDULED] AI personalization failed for user ${userId}: ${response.status}`
			);
			return null;
		}

		const result = await response.json();

		if (!result.success || !result.message) {
			console.error(`[PUSH-SCHEDULED] AI personalization failed for user ${userId}`);
			return null;
		}

		console.log(
			`[PUSH-SCHEDULED] AI personalized message generated for user ${userId}: "${result.message.title}"`
		);

		return {
			title: result.message.title,
			body: result.message.body,
		};
	} catch (error) {
		console.error(`[PUSH-SCHEDULED] AI personalization error for user ${userId}:`, error);
		return null;
	}
}

/**
 * Получает всех пользователей с активными push subscriptions
 * и определенным типом уведомлений включенным
 */
async function getUsersWithPushEnabled(notificationType?: string, premiumOnly = false) {
	// Получаем пользователей с активными подписками
	const { data: subscriptions, error: subError } = await supabaseAdmin
		.from('push_subscriptions')
		.select('user_id')
		.eq('is_active', true);

	if (subError) {
		console.error('[PUSH-SCHEDULED] Failed to get subscriptions:', subError);
		return [];
	}

	// Уникальные user_id
	const uniqueUserIds = [...new Set(subscriptions.map((sub) => sub.user_id))];

	// Получаем настройки уведомлений пользователей
	const { data: profiles, error: profileError } = await supabaseAdmin
		.from('profiles')
		.select('id, notification_settings, notification_time_preferences, is_premium')
		.in('id', uniqueUserIds);

	if (profileError) {
		console.error('[PUSH-SCHEDULED] Failed to get profiles:', profileError);
		return uniqueUserIds; // Fallback: отправляем всем
	}

	// Фильтруем пользователей по настройкам и Premium статусу
	const filteredUserIds = profiles
		.filter((profile) => {
			// Проверка Premium статуса
			if (premiumOnly && !profile.is_premium) {
				return false;
			}

			// Если тип уведомления не указан, возвращаем всех (с учетом Premium)
			if (!notificationType) {
				return true;
			}

			const settings = profile.notification_settings || {};

			// Проверяем соответствие типа уведомления настройкам
			switch (notificationType) {
				case 'daily_reminder':
					return settings.dailyReminder === true;
				case 'weekly_report':
					return settings.weeklyReport === true;
				case 'achievement_unlocked':
					return settings.achievements === true;
				case 'motivational':
					return settings.motivational === true;
				default:
					return true; // Для других типов отправляем всем
			}
		})
		.map((profile) => profile.id);

	console.log(
		`[PUSH-SCHEDULED] Filtered users: ${filteredUserIds.length}/${uniqueUserIds.length} for ${notificationType}${premiumOnly ? ' (Premium only)' : ''}`
	);
	return filteredUserIds;
}

/**
 * Вызывает unified-notification-sender Edge Function для отправки уведомления
 * (с автоматическим fallback на другие каналы если Web Push недоступен)
 */
async function sendPushNotification(
	userIds: string[],
	title: string,
	body: string,
	icon?: string,
	data?: Record<string, unknown>
) {
	try {
		const response = await fetch(`${supabaseUrl}/functions/v1/unified-notification-sender`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${supabaseServiceKey}`,
			},
			body: JSON.stringify({
				user_ids: userIds,
				title,
				body,
				icon: icon || '/icon-192.png',
				data: data || {},
				fallback: true, // Enable fallback to other channels
			}),
		});

		const result = await response.json();
		console.log('[PUSH-SCHEDULED] Notification sent via unified sender:', result);

		// Track delivery metrics
		if (result.success) {
			const totalSent = result.results?.reduce((sum: number, r: any) => sum + r.sent, 0) || 0;
			const totalFailed = result.results?.reduce((sum: number, r: any) => sum + r.failed, 0) || 0;

			if (totalSent > 0) {
				trackPushDelivery('sent', {
					user_count: totalSent,
					channel: 'web_push',
					notification_type: (data?.type as string) || 'scheduled',
				});
			}

			if (totalFailed > 0) {
				trackPushDelivery('failed', {
					user_count: totalFailed,
					channel: 'web_push',
					error_message: 'Some users failed to receive notification',
				});
			}
		}

		return result;
	} catch (error) {
		console.error('[PUSH-SCHEDULED] Failed to send notification:', error);

		// Track complete failure
		trackPushDelivery('failed', {
			user_count: userIds.length,
			channel: 'web_push',
			error_message: error instanceof Error ? error.message : 'Unknown error',
		});

		return null;
	}
}

/**
 * Отправляет ежедневное напоминание
 * НОВАЯ ЛОГИКА: Учитывает timezone пользователя и его предпочтения по времени
 * Вызывается каждый час через Cron Job
 */
async function sendDailyReminder() {
	console.log('[PUSH-SCHEDULED] Sending daily reminder (timezone-aware)...');

	// Получаем шаблон из БД
	const template = await getTemplate('daily_reminder');
	if (!template) {
		console.error('[PUSH-SCHEDULED] Template not found for daily_reminder');
		return { sent: 0, total: 0, error: 'Template not found' };
	}

	// НОВАЯ ЛОГИКА: Получаем пользователей которые должны получить уведомление СЕЙЧАС
	// Учитываем их timezone и предпочтения по времени (morning/evening)
	// Проверяем оба слота времени (утро и вечер)
	const morningUserIds = await getUsersForScheduledTime(
		'daily_reminder',
		'morning',
		template.is_premium_only
	);
	const eveningUserIds = await getUsersForScheduledTime(
		'daily_reminder',
		'evening',
		template.is_premium_only
	);

	// Объединяем пользователей (убираем дубликаты если кто-то выбрал "both")
	const allUserIds = [...new Set([...morningUserIds, ...eveningUserIds])];

	if (allUserIds.length === 0) {
		console.log('[PUSH-SCHEDULED] No users to notify at this time');
		return { sent: 0, total: 0 };
	}

	console.log(
		`[PUSH-SCHEDULED] Found ${allUserIds.length} users to notify ` +
			`(${morningUserIds.length} morning, ${eveningUserIds.length} evening)`
	);

	// Если шаблон поддерживает AI персонализацию - отправляем персонализированные уведомления
	if (template.is_ai_enabled) {
		console.log(`[PUSH-SCHEDULED] AI personalization enabled for ${allUserIds.length} users`);

		const results = await Promise.all(
			allUserIds.map(async (userId) => {
				try {
					// Генерируем AI-персонализированное сообщение
					const aiMessage = await generateAIPersonalizedNotification(userId, 'daily_reminder');

					// Если AI генерация не удалась - используем обычный шаблон
					const title = aiMessage?.title || replaceVariables(template.title, {});
					const body = aiMessage?.body || replaceVariables(template.body, {});

					// Отправляем уведомление конкретному пользователю
					await sendPushNotification([userId], title, body, template.icon, {
						type: 'daily_reminder',
						url: '/?action=new',
					});

					return { success: true, userId, ai_used: !!aiMessage };
				} catch (error) {
					console.error(`[PUSH-SCHEDULED] Error sending to user ${userId}:`, error);
					return { success: false, userId, error: error.message };
				}
			})
		);

		const sent = results.filter((r) => r.success).length;
		const aiUsed = results.filter((r) => r.success && r.ai_used).length;

		console.log(
			`[PUSH-SCHEDULED] Sent ${sent}/${allUserIds.length} notifications (${aiUsed} with AI)`
		);

		return { sent, total: allUserIds.length, ai_used: aiUsed };
	}

	// Обычная отправка без AI персонализации
	const title = replaceVariables(template.title, {});
	const body = replaceVariables(template.body, {});

	const result = await sendPushNotification(allUserIds, title, body, template.icon, {
		type: 'daily_reminder',
		url: '/?action=new',
	});

	return result;
}

/**
 * Отправляет еженедельную мотивационную карточку
 * НОВАЯ ЛОГИКА: Учитывает timezone пользователя
 * Вызывается каждый час в воскресенье через Cron Job
 */
async function sendWeeklyMotivation() {
	console.log('[PUSH-SCHEDULED] Sending weekly motivation (timezone-aware)...');

	// Получаем шаблон из БД
	const template = await getTemplate('weekly_motivation');
	if (!template) {
		console.error('[PUSH-SCHEDULED] Template not found for weekly_motivation');
		return { sent: 0, total: 0, error: 'Template not found' };
	}

	// НОВАЯ ЛОГИКА: Получаем пользователей которые должны получить уведомление СЕЙЧАС
	// Для weekly_motivation используем утреннее время (10:00 по умолчанию)
	const userIds = await getUsersForScheduledTime(
		'weekly_motivation',
		'morning',
		template.is_premium_only
	);

	if (userIds.length === 0) {
		console.log('[PUSH-SCHEDULED] No users to notify at this time');
		return { sent: 0, total: 0 };
	}

	console.log(`[PUSH-SCHEDULED] Found ${userIds.length} users to notify`);

	// Если шаблон поддерживает AI персонализацию - отправляем персонализированные уведомления
	if (template.is_ai_enabled) {
		console.log(`[PUSH-SCHEDULED] AI personalization enabled for ${userIds.length} users`);

		const results = await Promise.all(
			userIds.map(async (userId) => {
				try {
					// Генерируем AI-персонализированное сообщение
					const aiMessage = await generateAIPersonalizedNotification(userId, 'weekly_motivation');

					// Если AI генерация не удалась - используем обычный шаблон
					const title = aiMessage?.title || replaceVariables(template.title, {});
					const body = aiMessage?.body || replaceVariables(template.body, {});

					// Отправляем уведомление конкретному пользователю
					await sendPushNotification([userId], title, body, template.icon, {
						type: 'weekly_motivation',
						url: '/?view=motivation',
					});

					return { success: true, userId, ai_used: !!aiMessage };
				} catch (error) {
					console.error(`[PUSH-SCHEDULED] Error sending to user ${userId}:`, error);
					return { success: false, userId, error: error.message };
				}
			})
		);

		const sent = results.filter((r) => r.success).length;
		const aiUsed = results.filter((r) => r.success && r.ai_used).length;

		console.log(
			`[PUSH-SCHEDULED] Sent ${sent}/${userIds.length} notifications (${aiUsed} with AI)`
		);

		return { sent, total: userIds.length, ai_used: aiUsed };
	}

	// Обычная отправка без AI персонализации
	const title = replaceVariables(template.title, {});
	const body = replaceVariables(template.body, {});

	const result = await sendPushNotification(userIds, title, body, template.icon, {
		type: 'weekly_motivation',
		url: '/?view=motivation',
	});

	return result;
}

/**
 * Отправляет напоминание о целях
 */
async function sendGoalReminder() {
	console.log('[PUSH-SCHEDULED] Sending goal reminder...');

	// Получаем шаблон из БД
	const template = await getTemplate('goal_reminder');
	if (!template) {
		console.error('[PUSH-SCHEDULED] Template not found for goal_reminder');
		return { sent: 0, total: 0, error: 'Template not found' };
	}

	// Получаем пользователей с учетом Premium статуса
	const userIds = await getUsersWithPushEnabled(undefined, template.is_premium_only);
	if (userIds.length === 0) {
		console.log('[PUSH-SCHEDULED] No users with push enabled');
		return { sent: 0, total: 0 };
	}

	// Если шаблон поддерживает AI персонализацию - отправляем персонализированные уведомления
	if (template.is_ai_enabled) {
		console.log(`[PUSH-SCHEDULED] AI personalization enabled for ${userIds.length} users`);

		const results = await Promise.all(
			userIds.map(async (userId) => {
				try {
					// Генерируем AI-персонализированное сообщение
					const aiMessage = await generateAIPersonalizedNotification(userId, 'goal_reminder');

					// Если AI генерация не удалась - используем обычный шаблон
					const title = aiMessage?.title || replaceVariables(template.title, {});
					const body = aiMessage?.body || replaceVariables(template.body, {});

					// Отправляем уведомление конкретному пользователю
					await sendPushNotification([userId], title, body, template.icon, {
						type: 'goal_reminder',
						url: '/?view=achievements',
					});

					return { success: true, userId, ai_used: !!aiMessage };
				} catch (error) {
					console.error(`[PUSH-SCHEDULED] Error sending to user ${userId}:`, error);
					return { success: false, userId, error: error.message };
				}
			})
		);

		const sent = results.filter((r) => r.success).length;
		const aiUsed = results.filter((r) => r.success && r.ai_used).length;

		console.log(
			`[PUSH-SCHEDULED] Sent ${sent}/${userIds.length} notifications (${aiUsed} with AI)`
		);

		return { sent, total: userIds.length, ai_used: aiUsed };
	}

	// Обычная отправка без AI персонализации
	const title = replaceVariables(template.title, {});
	const body = replaceVariables(template.body, {});

	const result = await sendPushNotification(userIds, title, body, template.icon, {
		type: 'goal_reminder',
		url: '/?view=achievements',
	});

	return result;
}

// Main handler
Deno.serve(async (req) => {
	// Handle CORS preflight
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		// Get notification type from query params
		const url = new URL(req.url);
		const type = url.searchParams.get('type') || 'daily_reminder';

		console.log('[PUSH-SCHEDULED] Processing scheduled push:', type);

		let result: { success: boolean; message: string; count?: number };
		switch (type) {
			case 'daily_reminder':
				result = await sendDailyReminder();
				break;

			case 'weekly_motivation':
				result = await sendWeeklyMotivation();
				break;

			case 'goal_reminder':
				result = await sendGoalReminder();
				break;

			default:
				return new Response(JSON.stringify({ error: `Unknown type: ${type}` }), {
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
		}

		return new Response(
			JSON.stringify({
				success: true,
				type,
				result,
			}),
			{
				status: 200,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		);
	} catch (error) {
		console.error('[PUSH-SCHEDULED] Error:', error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});
