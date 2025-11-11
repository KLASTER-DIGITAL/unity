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
 *   user_ids: string[] | 'all',
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
 * Notification Channel Types
 */
type NotificationChannel = 'web_push' | 'email' | 'telegram';

/**
 * Notification Payload
 */
interface NotificationPayload {
	user_ids: string[] | 'all';
	title: string;
	body: string;
	icon?: string;
	badge?: string;
	data?: Record<string, any>;
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
	data?: Record<string, any>
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

		return {
			channel: 'web_push',
			success: true,
			sent: result.sent || 0,
			failed: result.failed || 0,
		};
	} catch (error) {
		console.error('[UNIFIED-SENDER] Web Push failed:', error);
		return {
			channel: 'web_push',
			success: false,
			sent: 0,
			failed: userIds.length,
			error: error.message,
		};
	}
}

/**
 * Send notification via Telegram
 * (Подготовка для будущего - пока возвращает placeholder)
 */
async function sendViaTelegram(
	userIds: string[],
	title: string,
	body: string
): Promise<ChannelResult> {
	console.log('[UNIFIED-SENDER] Telegram channel not implemented yet');
	return {
		channel: 'telegram',
		success: false,
		sent: 0,
		failed: userIds.length,
		error: 'Telegram channel not implemented',
	};
}

/**
 * Send notification via Email
 * (Подготовка для будущего - пока возвращает placeholder)
 */
async function sendViaEmail(
	userIds: string[],
	title: string,
	body: string
): Promise<ChannelResult> {
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
async function sendUnifiedNotification(payload: NotificationPayload) {
	const { user_ids, title, body, icon, badge, data, channels, fallback = true } = payload;

	// Resolve user IDs
	let userIds: string[];
	if (user_ids === 'all') {
		const { data: profiles } = await supabaseAdmin.from('profiles').select('id');
		userIds = profiles?.map((p) => p.id) || [];
	} else {
		userIds = user_ids;
	}

	if (userIds.length === 0) {
		return {
			success: true,
			total_users: 0,
			results: [],
			message: 'No users to send notifications to',
		};
	}

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

	return {
		success: totalSent > 0,
		total_users: userIds.length,
		total_sent: totalSent,
		total_failed: totalFailed,
		channels_tried: results.map((r) => r.channel),
		results,
	};
}

// Main handler
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

		console.log('[UNIFIED-SENDER] Sending notification:', {
			users: payload.user_ids === 'all' ? 'all' : payload.user_ids.length,
			channels: payload.channels || ['web_push'],
		});

		const result = await sendUnifiedNotification(payload);

		return new Response(JSON.stringify(result), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('[UNIFIED-SENDER] Error:', error);
		return new Response(
			JSON.stringify({
				error: 'Internal server error',
				message: error.message,
			}),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		);
	}
});
