/**
 * Unified Notification Sender Edge Function
 *
 * Централизованный сервис для отправки уведомлений через разные каналы:
 * - Web Push (основной канал)
 * - Email (подготовка для будущего)
 * - Telegram (подготовка для будущего)
 *
 * Автоматически выбирает канал на основе:
 * - User preferences (notification_settings в profiles)
 * - Channel availability (есть ли push subscription, telegram_chat_id, email)
 * - Fallback механизм (если основной канал недоступен)
 *
 * API:
 * POST /unified-notification-sender
 * Body: {
 *   user_ids?: string[] | 'all',  // Optional if segment_id provided
 *   segment_id?: string,           // Optional: send to users in segment
 *   title: string,
 *   body: string,
 *   icon?: string,
 *   badge?: string,
 *   data?: Record<string, any>,
 *   channels?: ('web_push' | 'email' | 'telegram')[],  // Optional: force specific channels
 *   fallback?: boolean  // Default: true
 * }
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import {
	trackPushCampaignStats,
	trackPushDelivery,
	trackRateLimitEvent,
} from '../_shared/push-metrics.ts';

// CORS headers
const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase Admin Client
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if (!(supabaseUrl && supabaseServiceKey)) {
	throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Notification Channel Types
 */
type NotificationChannel = 'web_push' | 'email' | 'telegram';

/**
 * Notification Payload
 */
interface NotificationPayload {
	user_ids?: string[] | 'all';
	segment_id?: string;
	title: string;
	body: string;
	icon?: string;
	badge?: string;
	data?: Record<string, unknown>;
	channels?: NotificationChannel[];
	fallback?: boolean;
}

/**
 * Channel Delivery Result
 */
interface ChannelResult {
	channel: NotificationChannel;
	success: boolean;
	sent: number;
	failed: number;
	error?: string;
}

/**
 * Rate Limit Check Result
 */
interface RateLimitResult {
	allowed: boolean;
	count_hour: number;
	count_day: number;
	limit_hour: number;
	limit_day: number;
	remaining_hour: number;
	remaining_day: number;
}

/**
 * Check if user has exceeded rate limits
 */
async function checkRateLimit(userId: string): Promise<RateLimitResult> {
	try {
		// Get rate limit settings from admin_settings
		const { data: settings } = await supabaseAdmin
			.from('admin_settings')
			.select('key, value')
			.in('key', [
				'push_rate_limit_per_hour',
				'push_rate_limit_per_day',
				'push_rate_limit_enabled',
			]);

		const settingsMap = new Map(
			settings?.map((s: { key: string; value: string }) => [s.key, s.value]) || []
		);

		// Check if rate limiting is enabled
		const isEnabled = settingsMap.get('push_rate_limit_enabled') === 'true';
		if (!isEnabled) {
			// Rate limiting disabled - allow all
			return {
				allowed: true,
				count_hour: 0,
				count_day: 0,
				limit_hour: 100,
				limit_day: 500,
				remaining_hour: 100,
				remaining_day: 500,
			};
		}

		const maxPerHour = Number.parseInt(settingsMap.get('push_rate_limit_per_hour') || '100', 10);
		const maxPerDay = Number.parseInt(settingsMap.get('push_rate_limit_per_day') || '500', 10);

		// Call database function to check rate limit
		const { data, error } = await supabaseAdmin.rpc('check_push_rate_limit', {
			p_user_id: userId,
			p_max_per_hour: maxPerHour,
			p_max_per_day: maxPerDay,
		});

		if (error) {
			console.error('[RATE-LIMIT] Error checking rate limit:', error);
			// On error, allow (fail open)
			return {
				allowed: true,
				count_hour: 0,
				count_day: 0,
				limit_hour: maxPerHour,
				limit_day: maxPerDay,
				remaining_hour: maxPerHour,
				remaining_day: maxPerDay,
			};
		}

		return data as RateLimitResult;
	} catch (error) {
		console.error('[RATE-LIMIT] Exception checking rate limit:', error);
		// On exception, allow (fail open)
		return {
			allowed: true,
			count_hour: 0,
			count_day: 0,
			limit_hour: 100,
			limit_day: 500,
			remaining_hour: 100,
			remaining_day: 500,
		};
	}
}

/**
 * Record push notification send for rate limiting
 */
async function recordPushSend(
	userId: string,
	notificationType: string,
	campaignId?: string
): Promise<void> {
	try {
		await supabaseAdmin.rpc('record_push_send', {
			p_user_id: userId,
			p_notification_type: notificationType,
			p_campaign_id: campaignId || null,
		});
	} catch (error) {
		console.error('[RATE-LIMIT] Error recording push send:', error);
		// Don't throw - recording failure shouldn't block notification
	}
}

/**
 * Get users by segment criteria
 */
async function getUsersBySegmentCriteria(
	criteria: Record<string, unknown>
): Promise<{ id: string }[]> {
	let query = supabaseAdmin
		.from('profiles')
		.select('id, email, full_name, role, created_at, last_active');

	// Apply filters based on criteria
	if (criteria.is_premium !== undefined) {
		// Check if user has active subscription
		const { data: subscriptions } = await supabaseAdmin
			.from('subscriptions')
			.select('user_id')
			.eq('status', 'active');

		const premiumUserIds = subscriptions?.map((s: { user_id: string }) => s.user_id) || [];

		if (criteria.is_premium) {
			query = query.in(
				'id',
				premiumUserIds.length > 0 ? premiumUserIds : ['00000000-0000-0000-0000-000000000000']
			);
		}
	}

	if (criteria.language) {
		query = query.eq('language', criteria.language);
	}

	if (criteria.last_active_days) {
		const daysAgo = new Date();
		daysAgo.setDate(daysAgo.getDate() - Number(criteria.last_active_days));
		query = query.gte('last_active', daysAgo.toISOString());
	}

	if (criteria.registered_within_days) {
		const daysAgo = new Date();
		daysAgo.setDate(daysAgo.getDate() - Number(criteria.registered_within_days));
		query = query.gte('created_at', daysAgo.toISOString());
	}

	const { data: users, error } = await query;

	if (error) {
		console.error('[UNIFIED-SENDER] Error fetching users by segment:', error);
		return [];
	}

	return users || [];
}

/**
 * Get user's available notification channels
 */
async function getUserChannels(userId: string): Promise<NotificationChannel[]> {
	const { data: profile } = await supabaseAdmin
		.from('profiles')
		.select('notification_settings, telegram_chat_id, email')
		.eq('id', userId)
		.single();

	if (!profile) return [];

	const channels: NotificationChannel[] = [];

	// Check Web Push availability
	const { data: pushSub } = await supabaseAdmin
		.from('push_subscriptions')
		.select('id')
		.eq('user_id', userId)
		.eq('is_active', true)
		.limit(1)
		.single();

	if (pushSub) channels.push('web_push');

	// Check Telegram availability
	if (profile.telegram_chat_id) channels.push('telegram');

	// Check Email availability
	if (profile.email) channels.push('email');

	return channels;
}

/**
 * Send notification via Web Push
 */
async function sendViaWebPush(
	userIds: string[],
	title: string,
	body: string,
	icon?: string,
	badge?: string,
	data?: Record<string, unknown>
): Promise<ChannelResult> {
	try {
		const response = await fetch(`${supabaseUrl}/functions/v1/push-sender`, {
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
				badge: badge || '/badge-72.png',
				data: data || {},
			}),
		});

		const result = await response.json();

		// Track successful sends
		trackPushDelivery('sent', {
			user_count: result.sent || 0,
			channel: 'web_push',
			campaign_id: data?.campaign_id,
			notification_type: data?.type || 'unknown',
		});

		// Track failures
		if (result.failed > 0) {
			trackPushDelivery('failed', {
				user_count: result.failed,
				channel: 'web_push',
				campaign_id: data?.campaign_id,
				error_message: 'Some users failed to receive notification',
			});
		}

		return {
			channel: 'web_push',
			success: true,
			sent: result.sent || 0,
			failed: result.failed || 0,
		};
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		console.error('[UNIFIED-SENDER] Web Push failed:', error);

		// Track complete failure
		trackPushDelivery('failed', {
			user_count: userIds.length,
			channel: 'web_push',
			error_message: errorMessage,
		});

		return {
			channel: 'web_push',
			success: false,
			sent: 0,
			failed: userIds.length,
			error: errorMessage,
		};
	}
}

/**
 * Send notification via Telegram Bot API
 */
async function sendViaTelegram(
	userIds: string[],
	title: string,
	body: string
): Promise<ChannelResult> {
	const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
	if (!botToken) {
		console.error('[UNIFIED-SENDER] TELEGRAM_BOT_TOKEN not configured');
		return {
			channel: 'telegram',
			success: false,
			sent: 0,
			failed: userIds.length,
			error: 'TELEGRAM_BOT_TOKEN not configured',
		};
	}

	let sent = 0;
	let failed = 0;

	for (const userId of userIds) {
		try {
			// Получаем telegram_chat_id пользователя
			const { data: profile, error: profileError } = await supabaseAdmin
				.from('profiles')
				.select('telegram_chat_id')
				.eq('id', userId)
				.single();

			if (profileError || !profile?.telegram_chat_id) {
				console.log(`[UNIFIED-SENDER] User ${userId} has no telegram_chat_id`);
				failed++;
				continue;
			}

			// Форматируем сообщение для Telegram
			const message = `<b>${title}</b>\n\n${body}`;

			// Отправляем через Telegram Bot API
			const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					chat_id: profile.telegram_chat_id,
					text: message,
					parse_mode: 'HTML',
				}),
			});

			if (response.ok) {
				console.log(`[UNIFIED-SENDER] Telegram sent to user ${userId}`);
				sent++;
			} else {
				const error = await response.text();
				console.error(`[UNIFIED-SENDER] Telegram failed for user ${userId}:`, error);
				failed++;
			}
		} catch (error) {
			console.error(`[UNIFIED-SENDER] Error sending Telegram to user ${userId}:`, error);
			failed++;
		}
	}

	return {
		channel: 'telegram',
		success: sent > 0,
		sent,
		failed,
	};
}

/**
 * Send notification via Email
 * (Подготовка для будущего - пока возвращает placeholder)
 */
function sendViaEmail(userIds: string[], _title: string, _body: string): ChannelResult {
	console.log('[UNIFIED-SENDER] Email channel not implemented yet');
	return {
		channel: 'email',
		success: false,
		sent: 0,
		failed: userIds.length,
		error: 'Email channel not implemented',
	};
}

/**
 * Get preferred channels for a user based on preferences and availability
 */
async function getPreferredChannels(userId: string): Promise<NotificationChannel[]> {
	const availableChannels = await getUserChannels(userId);

	if (availableChannels.length === 0) {
		return [];
	}

	// Priority order: Web Push > Telegram > Email
	// (можно настроить через user preferences в будущем)
	const priorityOrder: NotificationChannel[] = ['web_push', 'telegram', 'email'];

	return priorityOrder.filter((channel) => availableChannels.includes(channel));
}

/**
 * Send notification through unified sender with channel selection and fallback
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: unified sender handles multiple channel flows
async function sendUnifiedNotification(payload: NotificationPayload) {
	const { user_ids, title, body, icon, badge, data, channels, fallback = true } = payload;

	// Resolve user IDs
	let userIds: string[];
	if (user_ids === 'all') {
		const { data: profiles } = await supabaseAdmin.from('profiles').select('id');
		userIds = profiles?.map((p: { id: string }) => p.id) || [];
	} else {
		userIds = user_ids || [];
	}

	if (userIds.length === 0) {
		return {
			success: true,
			total_users: 0,
			results: [],
			message: 'No users to send notifications to',
		};
	}

	// ✅ RATE LIMITING: Check and filter users who haven't exceeded limits
	const rateLimitResults = await Promise.all(
		userIds.map(async (userId) => ({
			userId,
			rateLimit: await checkRateLimit(userId),
		}))
	);

	// Filter out users who exceeded rate limits
	const allowedUsers = rateLimitResults.filter((r) => r.rateLimit.allowed).map((r) => r.userId);

	const blockedUsers = rateLimitResults
		.filter((r) => !r.rateLimit.allowed)
		.map((r) => ({
			userId: r.userId,
			reason: 'rate_limit_exceeded',
			count_hour: r.rateLimit.count_hour,
			count_day: r.rateLimit.count_day,
		}));

	if (blockedUsers.length > 0) {
		console.warn(
			`[RATE-LIMIT] Blocked ${blockedUsers.length} users due to rate limits:`,
			blockedUsers
		);

		// Track rate limit events
		for (const blocked of blockedUsers) {
			trackRateLimitEvent({
				user_id: blocked.userId,
				count_hour: blocked.count_hour,
				count_day: blocked.count_day,
				limit_hour:
					rateLimitResults.find((r) => r.userId === blocked.userId)?.rateLimit.limit_hour || 100,
				limit_day:
					rateLimitResults.find((r) => r.userId === blocked.userId)?.rateLimit.limit_day || 500,
			});
		}
	}

	if (allowedUsers.length === 0) {
		return {
			success: false,
			total_users: userIds.length,
			allowed_users: 0,
			blocked_users: blockedUsers.length,
			results: [],
			message: 'All users exceeded rate limits',
			blocked: blockedUsers,
		};
	}

	// Update userIds to only allowed users
	userIds = allowedUsers;

	console.log(`[RATE-LIMIT] Allowed ${allowedUsers.length}/${rateLimitResults.length} users`);

	// Determine channels to use
	let channelsToUse: NotificationChannel[] = channels || [];

	// If no specific channels requested, auto-detect best channel
	if (!channels || channels.length === 0) {
		// For batch sending (multiple users), use Web Push as default
		if (userIds.length > 1) {
			channelsToUse = ['web_push'];
		} else {
			// For single user, check their preferred channels
			const preferredChannels = await getPreferredChannels(userIds[0]);
			channelsToUse = preferredChannels.length > 0 ? preferredChannels : ['web_push'];
		}
	}

	const results: ChannelResult[] = [];

	// Try each channel with fallback
	for (const channel of channelsToUse) {
		let result: ChannelResult;

		switch (channel) {
			case 'web_push':
				result = await sendViaWebPush(userIds, title, body, icon, badge, data);
				break;

			case 'telegram':
				result = await sendViaTelegram(userIds, title, body);
				break;

			case 'email':
				result = await sendViaEmail(userIds, title, body);
				break;

			default:
				result = {
					channel,
					success: false,
					sent: 0,
					failed: userIds.length,
					error: `Unknown channel: ${channel}`,
				};
		}

		results.push(result);

		// If successful, no need to try fallback
		if (result.success && result.sent > 0) {
			console.log(`[UNIFIED-SENDER] Successfully sent via ${channel}`);

			// ✅ RATE LIMITING: Record successful sends
			const notificationType = data?.campaign_id
				? 'campaign'
				: data?.type === 'realtime'
					? 'realtime'
					: data?.type === 'scheduled'
						? 'scheduled'
						: data?.type === 'ai_personalized'
							? 'ai_personalized'
							: 'unknown';

			// Record for each successfully sent user
			await Promise.all(
				userIds.map((userId) => recordPushSend(userId, notificationType, data?.campaign_id))
			);

			console.log(`[RATE-LIMIT] Recorded ${userIds.length} push sends`);

			break;
		}

		// If fallback disabled, stop after first attempt
		if (!fallback) {
			console.log('[UNIFIED-SENDER] Fallback disabled, stopping after first attempt');
			break;
		}

		// Try next channel in fallback
		console.log(`[UNIFIED-SENDER] ${channel} failed, trying next channel...`);
	}

	const totalSent = results.reduce((sum, r) => sum + r.sent, 0);
	const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);

	// Track campaign statistics
	if (data?.campaign_id) {
		trackPushCampaignStats({
			campaign_id: data.campaign_id,
			total_users: rateLimitResults.length, // Original user count before rate limiting
			sent: totalSent,
			failed: totalFailed,
			rate_limited: blockedUsers.length,
		});
	}

	return {
		success: totalSent > 0,
		total_users: allowedUsers.length,
		allowed_users: allowedUsers.length,
		blocked_users: blockedUsers.length,
		total_sent: totalSent,
		total_failed: totalFailed,
		channels_tried: results.map((r) => r.channel),
		results,
		blocked: blockedUsers.length > 0 ? blockedUsers : undefined,
	};
}

// Main handler
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: handler orchestrates routing and auth
Deno.serve(async (req) => {
	// Handle CORS preflight
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		// Verify authentication
		const authHeader = req.headers.get('Authorization');
		if (!authHeader) {
			return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
				status: 401,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		const token = authHeader.replace('Bearer ', '');
		const {
			data: { user },
			error: authError,
		} = await supabaseAdmin.auth.getUser(token);

		if (authError || !user) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Verify super_admin role
		const { data: profile } = await supabaseAdmin
			.from('profiles')
			.select('role')
			.eq('id', user.id)
			.single();

		if (profile?.role !== 'super_admin') {
			return new Response(JSON.stringify({ error: 'Forbidden' }), {
				status: 403,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		const payload: NotificationPayload = await req.json();

		// Validate required fields
		if (!payload.title || !payload.body) {
			return new Response(JSON.stringify({ error: 'Missing title or body' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Validate user_ids or segment_id
		if (!payload.user_ids && !payload.segment_id) {
			return new Response(JSON.stringify({ error: 'Missing user_ids or segment_id' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// If segment_id provided, fetch users from segment
		if (payload.segment_id) {
			const { data: segment } = await supabaseAdmin
				.from('push_campaign_segments')
				.select('criteria')
				.eq('id', payload.segment_id)
				.single();

			if (!segment) {
				return new Response(JSON.stringify({ error: 'Segment not found' }), {
					status: 404,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			// Get users matching segment criteria
			const users = await getUsersBySegmentCriteria(segment.criteria);
			payload.user_ids = users.map((u: { id: string }) => u.id);

			console.log('[UNIFIED-SENDER] Segment users:', {
				segment_id: payload.segment_id,
				user_count: payload.user_ids.length,
			});
		}

		console.log('[UNIFIED-SENDER] Sending notification:', {
			users: payload.user_ids === 'all' ? 'all' : payload.user_ids?.length || 0,
			channels: payload.channels || ['web_push'],
		});

		const result = await sendUnifiedNotification(payload);

		return new Response(JSON.stringify(result), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		console.error('[UNIFIED-SENDER] Error:', error);
		return new Response(
			JSON.stringify({
				error: 'Internal server error',
				message: errorMessage,
			}),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		);
	}
});
