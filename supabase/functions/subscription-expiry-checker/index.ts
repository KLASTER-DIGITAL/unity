/**
 * Subscription Expiry Checker Edge Function
 *
 * Автоматически проверяет истекшие подписки и деактивирует Premium:
 * - Проверяет subscriptions.end_date < NOW() AND status = 'active'
 * - Обновляет profiles.is_premium = false
 * - Обновляет subscriptions.status = 'expired'
 * - Отправляет уведомление пользователю через unified-notification-sender
 *
 * Запускается через Supabase Cron (ежедневно в 00:00 UTC)
 *
 * API:
 * POST /subscription-expiry-checker
 * Headers: Authorization: Bearer <service_role_key>
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
 * Expired Subscription
 */
interface ExpiredSubscription {
	id: string;
	user_id: string;
	plan_type: string;
	end_date: string;
	metadata: {
		is_trial?: boolean;
		trial_days?: number;
		[key: string]: any;
	};
}

/**
 * Send notification via unified-notification-sender
 */
async function sendExpiryNotification(userId: string, isTrial: boolean): Promise<void> {
	try {
		const title = isTrial ? 'Trial завершен' : 'Подписка завершена';
		const body = isTrial
			? 'Ваш 14-дневный Premium trial завершен. Оформите подписку чтобы продолжить использовать Premium функции.'
			: 'Ваша Premium подписка завершена. Продлите подписку чтобы продолжить использовать Premium функции.';

		const response = await fetch(`${supabaseUrl}/functions/v1/unified-notification-sender`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${supabaseServiceKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				user_ids: [userId],
				title,
				body,
				icon: '⏰',
				data: {
					action: 'open_settings',
					screen: 'premium',
				},
			}),
		});

		if (!response.ok) {
			console.error('[Notification] Failed to send:', await response.text());
		} else {
			console.log(`[Notification] Sent to user ${userId}`);
		}
	} catch (error) {
		console.error('[Notification] Error:', error);
	}
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
		console.log('[Expiry Checker] Starting...');

		// 1. Get all expired subscriptions
		const { data: expiredSubs, error: fetchError } = await supabaseAdmin
			.from('subscriptions')
			.select('id, user_id, plan_type, end_date, metadata')
			.eq('status', 'active')
			.lt('end_date', new Date().toISOString())
			.not('end_date', 'is', null); // Exclude lifetime subscriptions

		if (fetchError) {
			throw new Error(`Failed to fetch expired subscriptions: ${fetchError.message}`);
		}

		if (!expiredSubs || expiredSubs.length === 0) {
			console.log('[Expiry Checker] No expired subscriptions found');
			return new Response(
				JSON.stringify({
					success: true,
					message: 'No expired subscriptions',
					processed: 0,
				}),
				{
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			);
		}

		console.log(`[Expiry Checker] Found ${expiredSubs.length} expired subscriptions`);

		// 2. Process each expired subscription
		const results = [];
		for (const sub of expiredSubs as ExpiredSubscription[]) {
			try {
				console.log(`[Expiry Checker] Processing subscription ${sub.id} for user ${sub.user_id}`);

				// Update profiles.is_premium = false
				const { error: profileError } = await supabaseAdmin
					.from('profiles')
					.update({ is_premium: false })
					.eq('id', sub.user_id);

				if (profileError) {
					throw new Error(`Failed to update profile: ${profileError.message}`);
				}

				// Update subscriptions.status = 'expired'
				const { error: subError } = await supabaseAdmin
					.from('subscriptions')
					.update({
						status: 'expired',
						updated_at: new Date().toISOString(),
					})
					.eq('id', sub.id);

				if (subError) {
					throw new Error(`Failed to update subscription: ${subError.message}`);
				}

				// Send notification
				const isTrial = sub.metadata?.is_trial === true;
				await sendExpiryNotification(sub.user_id, isTrial);

				results.push({
					subscription_id: sub.id,
					user_id: sub.user_id,
					success: true,
					is_trial: isTrial,
				});

				console.log(`[Expiry Checker] ✅ Processed subscription ${sub.id}`);
			} catch (error) {
				console.error(`[Expiry Checker] ❌ Error processing subscription ${sub.id}:`, error);
				results.push({
					subscription_id: sub.id,
					user_id: sub.user_id,
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error',
				});
			}
		}

		const successCount = results.filter((r) => r.success).length;
		const failedCount = results.filter((r) => !r.success).length;

		console.log(`[Expiry Checker] Completed: ${successCount} success, ${failedCount} failed`);

		return new Response(
			JSON.stringify({
				success: true,
				message: `Processed ${expiredSubs.length} expired subscriptions`,
				processed: expiredSubs.length,
				success_count: successCount,
				failed_count: failedCount,
				results,
			}),
			{
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		);
	} catch (error) {
		console.error('[Expiry Checker] Fatal error:', error);
		return new Response(
			JSON.stringify({
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			}),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		);
	}
});
