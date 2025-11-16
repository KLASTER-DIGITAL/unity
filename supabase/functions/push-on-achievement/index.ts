/**
 * Push on Achievement Edge Function
 *
 * Отправляет push уведомления при событиях с достижениями:
 * - achievement_unlocked: когда пользователь получает новое достижение (progress = 100%)
 * - achievement_near: когда пользователь близок к достижению (progress 70-90%)
 *
 * Вызывается через Database Trigger на user_achievements INSERT/UPDATE
 *
 * Endpoints:
 * - POST /push-on-achievement - Обработать событие и отправить push
 *
 * Body:
 * {
 *   "type": "INSERT" | "UPDATE",
 *   "table": "user_achievements",
 *   "record": {...},
 *   "old_record": {...} | null,
 *   "notification_type": "achievement_unlocked" | "achievement_near"
 * }
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Получает активные push subscriptions пользователя
 */
async function getUserPushSubscriptions(userId: string) {
	const supabase = createClient(supabaseUrl, supabaseServiceKey);

	const { data, error } = await supabase
		.from('push_subscriptions')
		.select('*')
		.eq('user_id', userId)
		.eq('is_active', true);

	if (error) {
		console.error('[PUSH-ACHIEVEMENT] Error fetching subscriptions:', error);
		return [];
	}

	return data || [];
}

/**
 * Получает информацию о достижении из каталога
 */
async function getAchievementInfo(achievementId: string) {
	const supabase = createClient(supabaseUrl, supabaseServiceKey);

	const { data, error } = await supabase
		.from('achievements_catalog')
		.select('*')
		.eq('id', achievementId)
		.single();

	if (error) {
		console.error('[PUSH-ACHIEVEMENT] Error fetching achievement:', error);
		return null;
	}

	return data;
}

/**
 * Отправляет push уведомление через unified-notification-sender
 */
async function sendPushNotification(
	userId: string,
	title: string,
	body: string,
	icon: string,
	data: Record<string, unknown>
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
				icon,
				data,
				fallback: true,
			}),
		});

		if (!response.ok) {
			const error = await response.text();
			console.error('[PUSH-ACHIEVEMENT] Error sending push:', error);
			return false;
		}

		const result = await response.json();
		console.log('[PUSH-ACHIEVEMENT] Push sent successfully:', result);
		return true;
	} catch (error) {
		console.error('[PUSH-ACHIEVEMENT] Error calling unified-notification-sender:', error);
		return false;
	}
}

/**
 * Обрабатывает событие achievement_unlocked (новое достижение)
 */
async function handleAchievementUnlocked(record: any) {
	const userId = record.user_id;
	const achievementId = record.achievement_id;

	console.log('[PUSH-ACHIEVEMENT] Achievement unlocked:', { userId, achievementId });

	// Проверяем есть ли активные subscriptions
	const subscriptions = await getUserPushSubscriptions(userId);
	if (subscriptions.length === 0) {
		console.log('[PUSH-ACHIEVEMENT] No active subscriptions for user:', userId);
		return;
	}

	// Получаем информацию о достижении
	const achievement = await getAchievementInfo(achievementId);
	if (!achievement) {
		console.error('[PUSH-ACHIEVEMENT] Achievement not found:', achievementId);
		return;
	}

	// Отправляем уведомление
	await sendPushNotification(
		userId,
		'🎉 Новое достижение!',
		`Поздравляем! Вы получили: ${achievement.name}`,
		'/icon-192.png',
		{
			type: 'achievement_unlocked',
			achievement_id: achievementId,
			url: `/?view=achievements&achievement=${achievementId}`,
		}
	);
}

/**
 * Обрабатывает событие achievement_near (близко к достижению)
 */
async function handleAchievementNear(record: any) {
	const userId = record.user_id;
	const achievementId = record.achievement_id;
	const progress = record.progress;

	console.log('[PUSH-ACHIEVEMENT] Achievement near:', { userId, achievementId, progress });

	// Проверяем есть ли активные subscriptions
	const subscriptions = await getUserPushSubscriptions(userId);
	if (subscriptions.length === 0) {
		console.log('[PUSH-ACHIEVEMENT] No active subscriptions for user:', userId);
		return;
	}

	// Получаем информацию о достижении
	const achievement = await getAchievementInfo(achievementId);
	if (!achievement) {
		console.error('[PUSH-ACHIEVEMENT] Achievement not found:', achievementId);
		return;
	}

	// Отправляем уведомление
	await sendPushNotification(
		userId,
		'🎯 Почти достигли!',
		`Вы на ${progress}% к достижению: ${achievement.name}. Продолжайте!`,
		'/icon-192.png',
		{
			type: 'achievement_near',
			achievement_id: achievementId,
			progress,
			url: `/?view=achievements&achievement=${achievementId}`,
		}
	);
}

/**
 * Main handler
 */
Deno.serve(async (req) => {
	// Handle CORS preflight
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		const payload = await req.json();
		const { type, table, record, notification_type } = payload;

		console.log('[PUSH-ACHIEVEMENT] Received event:', {
			type,
			table,
			notification_type,
			user_id: record?.user_id,
			achievement_id: record?.achievement_id,
			progress: record?.progress,
		});

		// Проверяем что это событие для user_achievements
		if (table !== 'user_achievements') {
			console.log('[PUSH-ACHIEVEMENT] Ignoring event for table:', table);
			return new Response(JSON.stringify({ success: true, message: 'Ignored' }), {
				status: 200,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Обрабатываем событие по типу уведомления
		switch (notification_type) {
			case 'achievement_unlocked':
				await handleAchievementUnlocked(record);
				break;

			case 'achievement_near':
				await handleAchievementNear(record);
				break;

			default:
				console.log('[PUSH-ACHIEVEMENT] Unknown notification type:', notification_type);
		}

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('[PUSH-ACHIEVEMENT] Error:', error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});
