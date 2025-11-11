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
 * Получает всех пользователей с активными push subscriptions
 * и определенным типом уведомлений включенным
 */
async function getUsersWithPushEnabled(notificationType?: string) {
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

	// Если тип уведомления не указан, возвращаем всех
	if (!notificationType) {
		return uniqueUserIds;
	}

	// Получаем настройки уведомлений пользователей
	const { data: profiles, error: profileError } = await supabaseAdmin
		.from('profiles')
		.select('id, notification_settings, notification_time_preferences')
		.in('id', uniqueUserIds);

	if (profileError) {
		console.error('[PUSH-SCHEDULED] Failed to get profiles:', profileError);
		return uniqueUserIds; // Fallback: отправляем всем
	}

	// Фильтруем пользователей по настройкам
	const filteredUserIds = profiles
		.filter((profile) => {
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
		`[PUSH-SCHEDULED] Filtered users: ${filteredUserIds.length}/${uniqueUserIds.length} for ${notificationType}`
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

	// Получаем только пользователей с включенным dailyReminder
	const userIds = await getUsersWithPushEnabled('daily_reminder');
	if (userIds.length === 0) {
		console.log('[PUSH-SCHEDULED] No users with daily reminder enabled');
		return { sent: 0, total: 0 };
	}

	const result = await sendPushNotification(
		userIds,
		'📝 Время записать достижения!',
		'Не забудьте записать свои достижения за сегодня',
		'/icon-192.png',
		{
			type: 'daily_reminder',
			url: '/?action=new',
		}
	);

	return result;
}

/**
 * Отправляет еженедельную мотивационную карточку
 */
async function sendWeeklyMotivation() {
	console.log('[PUSH-SCHEDULED] Sending weekly motivation...');

	// Получаем только пользователей с включенным motivational
	const userIds = await getUsersWithPushEnabled('motivational');
	if (userIds.length === 0) {
		console.log('[PUSH-SCHEDULED] No users with motivational enabled');
		return { sent: 0, total: 0 };
	}

	// Получаем случайную мотивационную карточку
	const { data: cards } = await supabaseAdmin
		.from('motivation_cards')
		.select('title, description')
		.limit(1);

	const card = cards?.[0];
	const title = card?.title || '💪 Мотивация недели';
	const body = card?.description || 'Продолжайте двигаться к своим целям!';

	const result = await sendPushNotification(userIds, title, body, '/icon-192.png', {
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

	const userIds = await getUsersWithPushEnabled();
	if (userIds.length === 0) {
		console.log('[PUSH-SCHEDULED] No users with push enabled');
		return { sent: 0, total: 0 };
	}

	const result = await sendPushNotification(
		userIds,
		'🎯 Проверьте свои цели',
		'Как продвигается работа над вашими целями?',
		'/icon-192.png',
		{
			type: 'goal_reminder',
			url: '/?view=achievements',
		}
	);

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
