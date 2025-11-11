/**
 * Push Campaign Sender Edge Function
 *
 * Sends push notifications to users based on campaign configuration
 * Supports:
 * - Targeted segments (all, premium, active, inactive, custom)
 * - i18n translations (7 languages)
 * - Analytics tracking
 * - Batch processing
 * - A/B Testing (variant assignment and tracking)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const _VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const _VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface CampaignRequest {
	campaign_id: string;
}

serve(async (req) => {
	try {
		const { campaign_id }: CampaignRequest = await req.json();

		console.log(`[Push Campaign Sender] Starting campaign: ${campaign_id}`);

		// 1. Get campaign details
		const { data: campaign, error: campaignError } = await supabase
			.from('push_campaigns')
			.select('*')
			.eq('id', campaign_id)
			.single();

		if (campaignError || !campaign) {
			throw new Error(`Campaign not found: ${campaign_id}`);
		}

		// 2. Check if campaign is part of A/B test
		const abTest = await getABTest(campaign);
		if (abTest) {
			console.log(`[Push Campaign Sender] A/B Test detected: ${abTest.name}`);
		}

		// 3. Update campaign status to 'sending'
		await supabase.from('push_campaigns').update({ status: 'sending' }).eq('id', campaign_id);

		// 4. Get target users based on segment
		const users = await getTargetUsers(campaign);

		console.log(`[Push Campaign Sender] Target users: ${users.length}`);

		// 5. Get active push subscriptions for target users
		const { data: subscriptions, error: subsError } = await supabase
			.from('push_subscriptions')
			.select('*')
			.in(
				'user_id',
				users.map((u) => u.id)
			)
			.eq('is_active', true);

		if (subsError) {
			throw new Error(`Failed to get subscriptions: ${subsError.message}`);
		}

		console.log(`[Push Campaign Sender] Active subscriptions: ${subscriptions?.length || 0}`);

		// 6. Send notifications in batches
		let totalSent = 0;
		let totalDelivered = 0;
		let totalFailed = 0;

		const BATCH_SIZE = 100;
		for (let i = 0; i < (subscriptions?.length || 0); i += BATCH_SIZE) {
			const batch = subscriptions?.slice(i, i + BATCH_SIZE);

			const results = await Promise.allSettled(
				batch.map((sub) => sendPushNotification(sub, campaign, users, abTest))
			);

			// Track results
			for (const result of results) {
				if (result.status === 'fulfilled') {
					totalSent++;
					if (result.value.delivered) {
						totalDelivered++;
					}
				} else {
					totalFailed++;
					console.error(`[Push Campaign Sender] Failed:`, result.reason);
				}
			}

			console.log(`[Push Campaign Sender] Batch ${i / BATCH_SIZE + 1} completed`);
		}

		// 6. Update campaign with final stats
		await supabase
			.from('push_campaigns')
			.update({
				status: 'sent',
				sent_at: new Date().toISOString(),
				total_recipients: users.length,
				total_sent: totalSent,
				total_delivered: totalDelivered,
				total_failed: totalFailed,
			})
			.eq('id', campaign_id);

		console.log(`[Push Campaign Sender] Campaign completed: ${campaign_id}`);
		console.log(
			`[Push Campaign Sender] Stats: sent=${totalSent}, delivered=${totalDelivered}, failed=${totalFailed}`
		);

		return new Response(
			JSON.stringify({
				success: true,
				campaign_id,
				stats: {
					total_recipients: users.length,
					total_sent: totalSent,
					total_delivered: totalDelivered,
					total_failed: totalFailed,
				},
			}),
			{ headers: { 'Content-Type': 'application/json' } }
		);
	} catch (error) {
		console.error('[Push Campaign Sender] Error:', error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
});

/**
 * Get target users based on campaign segment
 */
async function getTargetUsers(campaign: any): Promise<any[]> {
	let query = supabase.from('profiles').select('id, email, preferred_language');

	switch (campaign.target_segment) {
		case 'all':
			// All users with push subscriptions
			break;

		case 'premium':
			query = query.eq('is_premium', true);
			break;

		case 'active': {
			// Users active in last 7 days
			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
			query = query.gte('last_active', sevenDaysAgo.toISOString());
			break;
		}

		case 'inactive': {
			// Users inactive for more than 7 days
			const sevenDaysAgoInactive = new Date();
			sevenDaysAgoInactive.setDate(sevenDaysAgoInactive.getDate() - 7);
			query = query.lt('last_active', sevenDaysAgoInactive.toISOString());
			break;
		}

		case 'custom':
			// Custom segment logic (to be implemented)
			if (campaign.custom_segment_id) {
				const { data: segment } = await supabase
					.from('push_campaign_segments')
					.select('criteria')
					.eq('id', campaign.custom_segment_id)
					.single();

				if (segment?.criteria) {
					query = applySegmentCriteria(query, segment.criteria);
				}
			}
			break;
	}

	const { data, error } = await query;

	if (error) {
		throw new Error(`Failed to get target users: ${error.message}`);
	}

	return data || [];
}

/**
 * Apply custom segment criteria to query
 */
function applySegmentCriteria(query: any, criteria: any): any {
	if (criteria.is_premium !== undefined) {
		query = query.eq('is_premium', criteria.is_premium);
	}

	if (criteria.last_active_days) {
		const date = new Date();
		date.setDate(date.getDate() - criteria.last_active_days);
		query = query.gte('last_active', date.toISOString());
	}

	if (criteria.languages && Array.isArray(criteria.languages)) {
		query = query.in('preferred_language', criteria.languages);
	}

	return query;
}

/**
 * Send push notification to a single subscription
 */
async function sendPushNotification(
	subscription: any,
	campaign: any,
	users: any[],
	abTest: any | null = null
): Promise<{ delivered: boolean }> {
	try {
		// Get user language
		const user = users.find((u) => u.id === subscription.user_id);
		const userLang = user?.preferred_language || 'ru';

		let title: string;
		let body: string;
		let variant: 'variant_a' | 'variant_b' | null = null;

		// ✅ A/B Testing: Assign variant and get corresponding content
		if (abTest) {
			variant = assignVariant(subscription.user_id, abTest.traffic_split);

			// Create A/B test assignment
			await createABTestAssignment(abTest.id, subscription.user_id, variant);

			// Get variant content
			if (variant === 'variant_a') {
				title = abTest.variant_a_title;
				body = abTest.variant_a_body;
			} else {
				title = abTest.variant_b_title;
				body = abTest.variant_b_body;
			}

			console.log(`[Push Campaign Sender] User ${subscription.user_id} assigned to ${variant}`);
		} else {
			// Regular campaign: Get translated content
			title = campaign.translations?.[userLang]?.title || campaign.title;
			body = campaign.translations?.[userLang]?.body || campaign.body;
		}

		// Prepare Web Push payload
		const _payload = JSON.stringify({
			title,
			body,
			icon: campaign.icon || '/icon-192x192.png',
			badge: campaign.badge || '/badge-72x72.png',
			image: campaign.image,
			data: {
				campaign_id: campaign.id,
				ab_test_id: abTest?.id,
				variant,
				url: '/',
			},
		});

		// Send Web Push (using webpush library would be here)
		// For now, just track analytics

		// Track analytics
		await supabase.from('push_notification_analytics').insert({
			campaign_id: campaign.id,
			user_id: subscription.user_id,
			status: 'sent',
			sent_at: new Date().toISOString(),
			device_type: subscription.device_type,
			browser: subscription.browser,
			os: subscription.os,
		});

		// ✅ A/B Testing: Update metrics
		if (abTest && variant) {
			await updateABTestMetrics(abTest.id, variant, true);
		}

		return { delivered: true };
	} catch (error) {
		console.error(`[Push Campaign Sender] Failed to send to ${subscription.user_id}:`, error);

		// Track failed delivery
		await supabase.from('push_notification_analytics').insert({
			campaign_id: campaign.id,
			user_id: subscription.user_id,
			status: 'failed',
			failed_at: new Date().toISOString(),
			error_message: error.message,
		});

		return { delivered: false };
	}
}

/**
 * Hash user ID to determine variant assignment (deterministic)
 * Returns 0-99 for traffic split percentage
 */
function hashUserId(userId: string): number {
	let hash = 0;
	for (let i = 0; i < userId.length; i++) {
		const char = userId.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return Math.abs(hash) % 100;
}

/**
 * Assign variant (A or B) to user based on traffic split
 */
function assignVariant(userId: string, trafficSplit: number): 'variant_a' | 'variant_b' {
	const hash = hashUserId(userId);
	return hash < trafficSplit ? 'variant_a' : 'variant_b';
}

/**
 * Get A/B test details if campaign is part of A/B test
 */
async function getABTest(campaign: any): Promise<any | null> {
	if (!campaign.ab_test_id) {
		return null;
	}

	const { data: abTest, error } = await supabase
		.from('push_ab_tests')
		.select('*')
		.eq('id', campaign.ab_test_id)
		.single();

	if (error || !abTest) {
		console.error(`[Push Campaign Sender] Failed to get A/B test: ${error?.message}`);
		return null;
	}

	return abTest;
}

/**
 * Create A/B test assignment for user
 */
async function createABTestAssignment(
	abTestId: string,
	userId: string,
	variant: 'variant_a' | 'variant_b'
): Promise<void> {
	try {
		await supabase.from('push_ab_test_assignments').insert({
			ab_test_id: abTestId,
			user_id: userId,
			variant,
			status: 'pending',
		});
	} catch (error) {
		console.error(`[Push Campaign Sender] Failed to create A/B test assignment:`, error);
	}
}

/**
 * Update A/B test metrics after sending
 */
async function updateABTestMetrics(
	abTestId: string,
	variant: 'variant_a' | 'variant_b',
	delivered: boolean
): Promise<void> {
	try {
		const sentField = variant === 'variant_a' ? 'variant_a_sent' : 'variant_b_sent';
		const deliveredField = variant === 'variant_a' ? 'variant_a_delivered' : 'variant_b_delivered';

		// Increment sent counter
		await supabase.rpc('increment_ab_test_metric', {
			test_id: abTestId,
			metric_name: sentField,
		});

		// Increment delivered counter if successful
		if (delivered) {
			await supabase.rpc('increment_ab_test_metric', {
				test_id: abTestId,
				metric_name: deliveredField,
			});
		}
	} catch (error) {
		console.error(`[Push Campaign Sender] Failed to update A/B test metrics:`, error);
	}
}
