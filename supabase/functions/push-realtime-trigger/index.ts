/**
 * Push Realtime Trigger Edge Function
 *
 * Автоматически отправляет push уведомления при событиях в БД:
 * - Новая запись создана (entries INSERT)
 * - Новое достижение (achievements INSERT)
 * - AI-анализ готов (entry_summaries INSERT)
 * - Streak Milestones достигнуты (3, 7, 14, 30, 60, 90, 100, 180, 365 дней)
 *
 * Вызывается через Database Webhooks или Supabase Realtime
 *
 * Endpoints:
 * - POST /push-realtime-trigger - Обработать событие и отправить push
 *
 * Body:
 * {
 *   "type": "INSERT",
 *   "table": "entries",
 *   "record": {...},
 *   "old_record": null
 * }
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { trackPushDelivery } from '../_shared/push-metrics.ts';

// CORS headers
const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase Admin Client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Получает push subscriptions для пользователя
 */
async function getUserPushSubscriptions(userId: string) {
	const { data, error } = await supabaseAdmin
		.from('push_subscriptions')
		.select('*')
		.eq('user_id', userId)
		.eq('is_active', true);

	if (error) {
		console.error('[PUSH-REALTIME] Failed to get subscriptions:', error);
		return [];
	}

	return data || [];
}

/**
 * Вызывает unified-notification-sender Edge Function для отправки уведомления
 * (с автоматическим fallback на другие каналы если Web Push недоступен)
 */
async function sendPushNotification(
	userId: string,
	title: string,
	body: string,
	icon?: string,
	data?: Record<string, any>
) {
	try {
		const response = await fetch(`${supabaseUrl}/functions/v1/unified-notification-sender`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${supabaseServiceKey}`,
			},
			body: JSON.stringify({
				user_ids: [userId],
				title,
				body,
				icon: icon || '/icon-192.png',
				data: data || {},
				fallback: true, // Enable fallback to other channels
			}),
		});

		const result = await response.json();
		console.log('[PUSH-REALTIME] Notification sent via unified sender:', result);

		// Track delivery metrics
		if (result.success) {
			const totalSent = result.results?.reduce((sum: number, r: any) => sum + r.sent, 0) || 0;
			const totalFailed = result.results?.reduce((sum: number, r: any) => sum + r.failed, 0) || 0;

			if (totalSent > 0) {
				trackPushDelivery('sent', {
					user_count: totalSent,
					channel: 'web_push',
					notification_type: (data?.type as string) || 'realtime',
				});
			}

			if (totalFailed > 0) {
				trackPushDelivery('failed', {
					user_count: totalFailed,
					channel: 'web_push',
					error_message: 'Failed to deliver realtime notification',
				});
			}
		}

		return result;
	} catch (error) {
		console.error('[PUSH-REALTIME] Failed to send notification:', error);

		// Track complete failure
		trackPushDelivery('failed', {
			user_count: 1,
			channel: 'web_push',
			error_message: error instanceof Error ? error.message : 'Unknown error',
		});

		return null;
	}
}

/**
 * Рассчитывает текущий streak пользователя
 */
async function calculateCurrentStreak(userId: string): Promise<number> {
	try {
		// Получаем все записи пользователя
		const { data: entries } = await supabaseAdmin
			.from('entries')
			.select('created_at')
			.eq('user_id', userId)
			.order('created_at', { ascending: false });

		if (!entries || entries.length === 0) return 0;

		// Получаем уникальные даты (YYYY-MM-DD format)
		const uniqueDates = new Set<string>();
		entries.forEach((entry) => {
			const date = new Date(entry.created_at).toISOString().split('T')[0];
			uniqueDates.add(date);
		});

		const dates = Array.from(uniqueDates).sort((a, b) => b.localeCompare(a)); // Newest first

		if (dates.length === 0) return 0;

		// Проверяем есть ли запись сегодня
		const today = new Date().toISOString().split('T')[0];
		let streak = 0;
		const currentDate = new Date(today);

		for (const dateStr of dates) {
			const entryDate = dateStr;
			const expectedDate = currentDate.toISOString().split('T')[0];

			if (entryDate === expectedDate) {
				streak++;
				// Переходим к предыдущему дню
				currentDate.setDate(currentDate.getDate() - 1);
			} else {
				// Streak прерван
				break;
			}
		}

		return streak;
	} catch (error) {
		console.error('[PUSH-REALTIME] Error calculating streak:', error);
		return 0;
	}
}

/**
 * Получает язык пользователя из profiles
 */
async function getUserLanguage(userId: string): Promise<string> {
	try {
		const { data: profile } = await supabaseAdmin
			.from('profiles')
			.select('language')
			.eq('id', userId)
			.single();

		return profile?.language || 'ru';
	} catch (error) {
		console.error('[PUSH-REALTIME] Error getting user language:', error);
		return 'ru';
	}
}

/**
 * Streak Milestone шаблоны для 7 языков
 */
const STREAK_MILESTONE_TEMPLATES: Record<
	number,
	Record<string, { title: string; body: string }>
> = {
	3: {
		ru: {
			title: '🔥 3 дня подряд!',
			body: 'Отличное начало! Продолжайте в том же духе!',
		},
		en: {
			title: '🔥 3 days in a row!',
			body: 'Great start! Keep it up!',
		},
		es: {
			title: '🔥 ¡3 días seguidos!',
			body: '¡Excelente comienzo! ¡Sigue así!',
		},
		de: {
			title: '🔥 3 Tage in Folge!',
			body: 'Toller Start! Weiter so!',
		},
		fr: {
			title: "🔥 3 jours d'affilée!",
			body: 'Excellent début! Continuez comme ça!',
		},
		zh: {
			title: '🔥 连续3天！',
			body: '很好的开始！继续保持！',
		},
		ja: {
			title: '🔥 3日連続！',
			body: '素晴らしいスタート！その調子で！',
		},
	},
	7: {
		ru: {
			title: '🎉 Неделя подряд!',
			body: 'Невероятно! Вы создали привычку!',
		},
		en: {
			title: '🎉 A week in a row!',
			body: "Amazing! You've built a habit!",
		},
		es: {
			title: '🎉 ¡Una semana seguida!',
			body: '¡Increíble! ¡Has creado un hábito!',
		},
		de: {
			title: '🎉 Eine Woche in Folge!',
			body: 'Unglaublich! Sie haben eine Gewohnheit aufgebaut!',
		},
		fr: {
			title: "🎉 Une semaine d'affilée!",
			body: 'Incroyable! Vous avez créé une habitude!',
		},
		zh: {
			title: '🎉 连续一周！',
			body: '太棒了！你已经养成了习惯！',
		},
		ja: {
			title: '🎉 1週間連続！',
			body: '素晴らしい！習慣ができました！',
		},
	},
	14: {
		ru: {
			title: '🏆 2 недели подряд!',
			body: 'Вы на пути к мастерству! Так держать!',
		},
		en: {
			title: '🏆 2 weeks in a row!',
			body: "You're on the path to mastery! Keep going!",
		},
		es: {
			title: '🏆 ¡2 semanas seguidas!',
			body: '¡Estás en el camino hacia la maestría! ¡Sigue adelante!',
		},
		de: {
			title: '🏆 2 Wochen in Folge!',
			body: 'Sie sind auf dem Weg zur Meisterschaft! Weiter so!',
		},
		fr: {
			title: "🏆 2 semaines d'affilée!",
			body: 'Vous êtes sur la voie de la maîtrise! Continuez!',
		},
		zh: {
			title: '🏆 连续2周！',
			body: '你正在走向精通！继续前进！',
		},
		ja: {
			title: '🏆 2週間連続！',
			body: 'マスターへの道を歩んでいます！続けましょう！',
		},
	},
	30: {
		ru: {
			title: '💎 Месяц подряд!',
			body: 'Потрясающе! Вы настоящий чемпион!',
		},
		en: {
			title: '💎 A month in a row!',
			body: "Phenomenal! You're a true champion!",
		},
		es: {
			title: '💎 ¡Un mes seguido!',
			body: '¡Fenomenal! ¡Eres un verdadero campeón!',
		},
		de: {
			title: '💎 Ein Monat in Folge!',
			body: 'Phänomenal! Sie sind ein wahrer Champion!',
		},
		fr: {
			title: "💎 Un mois d'affilée!",
			body: 'Phénoménal! Vous êtes un vrai champion!',
		},
		zh: {
			title: '💎 连续一个月！',
			body: '太棒了！你是真正的冠军！',
		},
		ja: {
			title: '💎 1ヶ月連続！',
			body: '素晴らしい！あなたは真のチャンピオンです！',
		},
	},
	60: {
		ru: {
			title: '⭐ 2 месяца подряд!',
			body: 'Невероятная дисциплина! Вы вдохновляете!',
		},
		en: {
			title: '⭐ 2 months in a row!',
			body: 'Incredible discipline! You inspire!',
		},
		es: {
			title: '⭐ ¡2 meses seguidos!',
			body: '¡Disciplina increíble! ¡Inspiras!',
		},
		de: {
			title: '⭐ 2 Monate in Folge!',
			body: 'Unglaubliche Disziplin! Sie inspirieren!',
		},
		fr: {
			title: "⭐ 2 mois d'affilée!",
			body: 'Discipline incroyable! Vous inspirez!',
		},
		zh: {
			title: '⭐ 连续2个月！',
			body: '令人难以置信的纪律！你很鼓舞人心！',
		},
		ja: {
			title: '⭐ 2ヶ月連続！',
			body: '信じられない規律！あなたは刺激的です！',
		},
	},
	90: {
		ru: {
			title: '🌟 3 месяца подряд!',
			body: 'Выдающееся достижение! Вы мастер привычек!',
		},
		en: {
			title: '🌟 3 months in a row!',
			body: 'Outstanding achievement! You are a habit master!',
		},
		es: {
			title: '🌟 ¡3 meses seguidos!',
			body: '¡Logro sobresaliente! ¡Eres un maestro de hábitos!',
		},
		de: {
			title: '🌟 3 Monate in Folge!',
			body: 'Herausragende Leistung! Sie sind ein Gewohnheitsmeister!',
		},
		fr: {
			title: "🌟 3 mois d'affilée!",
			body: 'Réalisation exceptionnelle! Vous êtes un maître des habitudes!',
		},
		zh: {
			title: '🌟 连续3个月！',
			body: '杰出的成就！你是习惯大师！',
		},
		ja: {
			title: '🌟 3ヶ月連続！',
			body: '素晴らしい成果！あなたは習慣のマスターです！',
		},
	},
	100: {
		ru: {
			title: '👑 100 дней подряд!',
			body: 'Легендарно! Вы достигли невероятного!',
		},
		en: {
			title: '👑 100 days in a row!',
			body: "Legendary! You've achieved the incredible!",
		},
		es: {
			title: '👑 ¡100 días seguidos!',
			body: '¡Legendario! ¡Has logrado lo increíble!',
		},
		de: {
			title: '👑 100 Tage in Folge!',
			body: 'Legendär! Sie haben das Unglaubliche erreicht!',
		},
		fr: {
			title: "👑 100 jours d'affilée!",
			body: "Légendaire! Vous avez accompli l'incroyable!",
		},
		zh: {
			title: '👑 连续100天！',
			body: '传奇！你已经达到了不可思议的成就！',
		},
		ja: {
			title: '👑 100日連続！',
			body: '伝説的！信じられないことを達成しました！',
		},
	},
	180: {
		ru: {
			title: '💫 Полгода подряд!',
			body: 'Феноменально! Вы изменили свою жизнь!',
		},
		en: {
			title: '💫 Half a year in a row!',
			body: "Phenomenal! You've transformed your life!",
		},
		es: {
			title: '💫 ¡Medio año seguido!',
			body: '¡Fenomenal! ¡Has transformado tu vida!',
		},
		de: {
			title: '💫 Ein halbes Jahr in Folge!',
			body: 'Phänomenal! Sie haben Ihr Leben verändert!',
		},
		fr: {
			title: "💫 Six mois d'affilée!",
			body: 'Phénoménal! Vous avez transformé votre vie!',
		},
		zh: {
			title: '💫 连续半年！',
			body: '太棒了！你改变了你的生活！',
		},
		ja: {
			title: '💫 半年連続！',
			body: '素晴らしい！あなたは人生を変えました！',
		},
	},
	365: {
		ru: {
			title: '🏅 ГОД ПОДРЯД!',
			body: 'НЕВЕРОЯТНО! Вы достигли абсолютного мастерства!',
		},
		en: {
			title: '🏅 A FULL YEAR!',
			body: "INCREDIBLE! You've achieved absolute mastery!",
		},
		es: {
			title: '🏅 ¡UN AÑO COMPLETO!',
			body: '¡INCREÍBLE! ¡Has alcanzado la maestría absoluta!',
		},
		de: {
			title: '🏅 EIN GANZES JAHR!',
			body: 'UNGLAUBLICH! Sie haben absolute Meisterschaft erreicht!',
		},
		fr: {
			title: '🏅 UNE ANNÉE ENTIÈRE!',
			body: 'INCROYABLE! Vous avez atteint la maîtrise absolue!',
		},
		zh: {
			title: '🏅 整整一年！',
			body: '难以置信！你已经达到了绝对的精通！',
		},
		ja: {
			title: '🏅 丸1年！',
			body: '信じられない！絶対的なマスタリーを達成しました！',
		},
	},
};

/**
 * Проверяет и отправляет уведомление о streak milestone
 */
async function checkAndSendStreakMilestone(userId: string, currentStreak: number) {
	const milestones = [3, 7, 14, 30, 60, 90, 100, 180, 365];

	// Проверяем достигнут ли milestone
	if (!milestones.includes(currentStreak)) {
		return;
	}

	console.log(`[PUSH-REALTIME] Streak milestone reached: ${currentStreak} days for user ${userId}`);

	// Получаем язык пользователя
	const language = await getUserLanguage(userId);

	// Получаем шаблон для milestone и языка
	const template =
		STREAK_MILESTONE_TEMPLATES[currentStreak]?.[language] ||
		STREAK_MILESTONE_TEMPLATES[currentStreak]?.ru;

	if (!template) {
		console.error('[PUSH-REALTIME] No template found for milestone:', currentStreak);
		return;
	}

	// Отправляем уведомление
	await sendPushNotification(userId, template.title, template.body, '/icon-192.png', {
		type: 'streak_milestone',
		streak: currentStreak,
		url: '/?view=home',
	});
}

/**
 * Обрабатывает INSERT события для entries
 */
async function handleEntryInsert(record: any) {
	const userId = record.user_id;

	// Проверяем есть ли активные subscriptions
	const subscriptions = await getUserPushSubscriptions(userId);
	if (subscriptions.length === 0) {
		console.log('[PUSH-REALTIME] No active subscriptions for user:', userId);
		return;
	}

	// Отправляем уведомление о создании записи
	await sendPushNotification(
		userId,
		'✅ Запись сохранена!',
		'Ваша запись успешно добавлена в дневник',
		'/icon-192.png',
		{
			type: 'entry_created',
			entry_id: record.id,
			url: `/?view=history&entry=${record.id}`,
		}
	);

	// Рассчитываем текущий streak
	const currentStreak = await calculateCurrentStreak(userId);
	console.log(`[PUSH-REALTIME] Current streak for user ${userId}: ${currentStreak} days`);

	// Проверяем и отправляем уведомление о streak milestone
	await checkAndSendStreakMilestone(userId, currentStreak);
}

/**
 * Обрабатывает INSERT события для achievements
 */
async function handleAchievementInsert(record: any) {
	const userId = record.user_id;

	// Проверяем есть ли активные subscriptions
	const subscriptions = await getUserPushSubscriptions(userId);
	if (subscriptions.length === 0) {
		console.log('[PUSH-REALTIME] No active subscriptions for user:', userId);
		return;
	}

	// Отправляем уведомление
	await sendPushNotification(
		userId,
		'🎉 Новое достижение!',
		`Поздравляем! Вы достигли: ${record.title || 'новой цели'}`,
		'/icon-192.png',
		{
			type: 'achievement_unlocked',
			achievement_id: record.id,
			url: `/?view=achievements&achievement=${record.id}`,
		}
	);
}

/**
 * Обрабатывает INSERT события для entry_summaries (AI-анализ готов)
 */
async function handleSummaryInsert(record: any) {
	// Получаем entry для определения user_id
	const { data: entry } = await supabaseAdmin
		.from('entries')
		.select('user_id')
		.eq('id', record.entry_id)
		.single();

	if (!entry) {
		console.error('[PUSH-REALTIME] Entry not found for summary:', record.entry_id);
		return;
	}

	const userId = entry.user_id;

	// Проверяем есть ли активные subscriptions
	const subscriptions = await getUserPushSubscriptions(userId);
	if (subscriptions.length === 0) {
		console.log('[PUSH-REALTIME] No active subscriptions for user:', userId);
		return;
	}

	// Отправляем уведомление
	await sendPushNotification(
		userId,
		'🤖 AI-анализ готов!',
		'Ваша запись проанализирована. Посмотрите результаты!',
		'/icon-192.png',
		{
			type: 'ai_analysis_ready',
			entry_id: record.entry_id,
			url: `/?view=history&entry=${record.entry_id}`,
		}
	);
}

// Main handler
Deno.serve(async (req) => {
	// Handle CORS preflight
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		// Parse webhook payload
		const payload = await req.json();
		console.log('[PUSH-REALTIME] Received webhook:', payload);

		const { type, table, record } = payload;

		// Обрабатываем только INSERT события
		if (type !== 'INSERT') {
			console.log('[PUSH-REALTIME] Ignoring non-INSERT event:', type);
			return new Response(JSON.stringify({ success: true, message: 'Event ignored' }), {
				status: 200,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Обрабатываем события по таблицам
		switch (table) {
			case 'entries':
				// Проверяем is_achievement флаг для достижений
				if (record.is_achievement) {
					await handleAchievementInsert(record);
				} else {
					await handleEntryInsert(record);
				}
				break;

			case 'entry_summaries':
				await handleSummaryInsert(record);
				break;

			default:
				console.log('[PUSH-REALTIME] Unknown table:', table);
		}

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('[PUSH-REALTIME] Error:', error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});
