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
		return result;
	} catch (error) {
		console.error('[PUSH-SCHEDULED] Failed to send notification:', error);
		return null;
	}
}

/**
 * Отправляет ежедневное напоминание в 21:00
 */
async function sendDailyReminder() {
	console.log('[PUSH-SCHEDULED] Sending daily reminder...');

	// Получаем шаблон из БД
	const template = await getTemplate('daily_reminder');
	if (!template) {
		console.error('[PUSH-SCHEDULED] Template not found for daily_reminder');
		return { sent: 0, total: 0, error: 'Template not found' };
	}

	// Получаем только пользователей с включенным dailyReminder
	// Учитываем Premium статус если шаблон только для Premium
	const userIds = await getUsersWithPushEnabled('daily_reminder', template.is_premium_only);
	if (userIds.length === 0) {
		console.log('[PUSH-SCHEDULED] No users with daily reminder enabled');
		return { sent: 0, total: 0 };
	}

	// Если шаблон поддерживает AI персонализацию - отправляем персонализированные уведомления
	if (template.is_ai_enabled) {
		console.log(`[PUSH-SCHEDULED] AI personalization enabled for ${userIds.length} users`);

		const results = await Promise.all(
			userIds.map(async (userId) => {
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
			`[PUSH-SCHEDULED] Sent ${sent}/${userIds.length} notifications (${aiUsed} with AI)`
		);

		return { sent, total: userIds.length, ai_used: aiUsed };
	}

	// Обычная отправка без AI персонализации
	const title = replaceVariables(template.title, {});
	const body = replaceVariables(template.body, {});

	const result = await sendPushNotification(userIds, title, body, template.icon, {
		type: 'daily_reminder',
		url: '/?action=new',
	});

	return result;
}

/**
 * Отправляет еженедельную мотивационную карточку
 */
async function sendWeeklyMotivation() {
	console.log('[PUSH-SCHEDULED] Sending weekly motivation...');

	// Получаем шаблон из БД
	const template = await getTemplate('weekly_motivation');
	if (!template) {
		console.error('[PUSH-SCHEDULED] Template not found for weekly_motivation');
		return { sent: 0, total: 0, error: 'Template not found' };
	}

	// Получаем только пользователей с включенным motivational
	// Учитываем Premium статус если шаблон только для Premium
	const userIds = await getUsersWithPushEnabled('motivational', template.is_premium_only);
	if (userIds.length === 0) {
		console.log('[PUSH-SCHEDULED] No users with motivational enabled');
		return { sent: 0, total: 0 };
	}

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
