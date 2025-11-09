/**
 * Push Campaign Scheduler Edge Function
 *
 * Runs periodically (via Cron) to check for scheduled campaigns
 * and trigger push-campaign-sender for campaigns that are due
 *
 * Cron schedule: Every 5 minutes
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (_req) => {
	try {
		console.log('[Push Campaign Scheduler] Running scheduled campaigns check');

		// Get campaigns that are scheduled and due to be sent
		const now = new Date().toISOString();

		const { data: campaigns, error } = await supabase
			.from('push_campaigns')
			.select('*')
			.eq('status', 'scheduled')
			.lte('scheduled_at', now)
			.order('scheduled_at', { ascending: true });

		if (error) {
			throw new Error(`Failed to get scheduled campaigns: ${error.message}`);
		}

		if (!campaigns || campaigns.length === 0) {
			console.log('[Push Campaign Scheduler] No campaigns due');
			return new Response(JSON.stringify({ message: 'No campaigns due', count: 0 }), {
				headers: { 'Content-Type': 'application/json' },
			});
		}

		console.log(`[Push Campaign Scheduler] Found ${campaigns.length} campaigns due`);

		// Trigger push-campaign-sender for each campaign
		const results = [];
		for (const campaign of campaigns) {
			try {
				console.log(`[Push Campaign Scheduler] Triggering campaign: ${campaign.id}`);

				// Call push-campaign-sender Edge Function
				const response = await fetch(`${SUPABASE_URL}/functions/v1/push-campaign-sender`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
					},
					body: JSON.stringify({ campaign_id: campaign.id }),
				});

				if (!response.ok) {
					throw new Error(`Failed to trigger campaign: ${await response.text()}`);
				}

				const result = await response.json();
				results.push({
					campaign_id: campaign.id,
					success: true,
					stats: result.stats,
				});

				console.log(`[Push Campaign Scheduler] Campaign ${campaign.id} triggered successfully`);
			} catch (error) {
				console.error(
					`[Push Campaign Scheduler] Failed to trigger campaign ${campaign.id}:`,
					error
				);

				// Mark campaign as failed
				await supabase
					.from('push_campaigns')
					.update({
						status: 'failed',
						metadata: {
							error: error.message,
							failed_at: new Date().toISOString(),
						},
					})
					.eq('id', campaign.id);

				results.push({
					campaign_id: campaign.id,
					success: false,
					error: error.message,
				});
			}
		}

		console.log(`[Push Campaign Scheduler] Completed: ${results.length} campaigns processed`);

		return new Response(
			JSON.stringify({
				success: true,
				campaigns_processed: results.length,
				results,
			}),
			{ headers: { 'Content-Type': 'application/json' } }
		);
	} catch (error) {
		console.error('[Push Campaign Scheduler] Error:', error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
});
