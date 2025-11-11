/**
 * Trial Expiry Reminder Edge Function
 *
 * Отправляет уведомления пользователям за 3 дня до окончания trial:
 * - Проверяет subscriptions.end_date BETWEEN NOW() AND NOW() + INTERVAL '3 days'
 * - Проверяет metadata.is_trial = true
 * - Проверяет metadata.reminder_sent != true
 * - Отправляет уведомление через unified-notification-sender
 * - Обновляет metadata.reminder_sent = true
 *
 * Запускается через Supabase Cron (ежедневно в 09:00 UTC)
 *
 * API:
 * POST /trial-expiry-reminder
 * Headers: Authorization: Bearer <service_role_key>
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase Admin Client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Trial Subscription
 */
interface TrialSubscription {
	id: string;
	user_id: string;
	end_date: string;
	metadata: {
		is_trial?: boolean;
		trial_days?: number;
		reminder_sent?: boolean;
		[key: string]: unknown;
	};
}

/**
 * Send trial expiry reminder notification
 */
async function sendTrialExpiryReminder(userId: string, daysLeft: number): Promise<void> {
	try {
		const title = `Trial заканчивается через ${daysLeft} дня`;
		const body =
			'Ваш Premium trial скоро закончится. Оформите подписку чтобы продолжить использовать AI-анализ, Offline режим и другие Premium функции.';

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
		console.log('[Trial Reminder] Starting...');

		const now = new Date();
		const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

		// 1. Get trial subscriptions expiring in 3 days
		const { data: expiringSubs, error: fetchError } = await supabaseAdmin
			.from('subscriptions')
			.select('id, user_id, end_date, metadata')
			.eq('status', 'active')
			.gte('end_date', now.toISOString())
			.lte('end_date', threeDaysLater.toISOString())
			.not('end_date', 'is', null);

		if (fetchError) {
			throw new Error(`Failed to fetch expiring subscriptions: ${fetchError.message}`);
		}

		if (!expiringSubs || expiringSubs.length === 0) {
			console.log('[Trial Reminder] No expiring subscriptions found');
			return new Response(
				JSON.stringify({
					success: true,
					message: 'No expiring subscriptions',
					processed: 0,
				}),
				{
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			);
		}

		// Filter only trial subscriptions that haven't received reminder
		const trialSubs = (expiringSubs as TrialSubscription[]).filter(
			(sub) => sub.metadata?.is_trial === true && sub.metadata?.reminder_sent !== true
		);

		if (trialSubs.length === 0) {
			console.log('[Trial Reminder] No trial subscriptions need reminder');
			return new Response(
				JSON.stringify({
					success: true,
					message: 'No trial subscriptions need reminder',
					processed: 0,
				}),
				{
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			);
		}

		console.log(`[Trial Reminder] Found ${trialSubs.length} trial subscriptions expiring soon`);

		// 2. Process each trial subscription
		const results = [];
		for (const sub of trialSubs) {
			try {
				console.log(`[Trial Reminder] Processing subscription ${sub.id} for user ${sub.user_id}`);

				// Calculate days left
				const endDate = new Date(sub.end_date);
				const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

				// Send notification
				await sendTrialExpiryReminder(sub.user_id, daysLeft);

				// Update metadata.reminder_sent = true
				const updatedMetadata = {
					...sub.metadata,
					reminder_sent: true,
					reminder_sent_at: now.toISOString(),
				};

				const { error: updateError } = await supabaseAdmin
					.from('subscriptions')
					.update({
						metadata: updatedMetadata,
						updated_at: now.toISOString(),
					})
					.eq('id', sub.id);

				if (updateError) {
					throw new Error(`Failed to update subscription: ${updateError.message}`);
				}

				results.push({
					subscription_id: sub.id,
					user_id: sub.user_id,
					days_left: daysLeft,
					success: true,
				});

				console.log(`[Trial Reminder] ✅ Processed subscription ${sub.id}`);
			} catch (error) {
				console.error(`[Trial Reminder] ❌ Error processing subscription ${sub.id}:`, error);
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

		console.log(`[Trial Reminder] Completed: ${successCount} success, ${failedCount} failed`);

		return new Response(
			JSON.stringify({
				success: true,
				message: `Processed ${trialSubs.length} trial subscriptions`,
				processed: trialSubs.length,
				success_count: successCount,
				failed_count: failedCount,
				results,
			}),
			{
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		);
	} catch (error) {
		console.error('[Trial Reminder] Fatal error:', error);
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
