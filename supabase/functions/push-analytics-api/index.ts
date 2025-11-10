/**
 * Push Analytics API
 *
 * Provides analytics data for push notifications
 *
 * Endpoints:
 * - GET /push-analytics-api - Get analytics overview
 * - GET /push-analytics-api/campaigns - Get campaign-specific analytics
 * - GET /push-analytics-api/trends - Get trends over time
 *
 * Features:
 * - Overall metrics (sent, delivered, opened, failed)
 * - Campaign-specific metrics
 * - Time-based trends
 * - Device/Browser breakdown
 * - Super_admin verification
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
	// Handle CORS preflight
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		// Get authorization header
		const authHeader = req.headers.get('Authorization');
		if (!authHeader) {
			return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
				status: 401,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Create Supabase client
		const supabaseUrl = Deno.env.get('SUPABASE_URL');
		const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

		if (!supabaseUrl || !supabaseKey) {
			throw new Error('Missing Supabase environment variables');
		}

		const supabase = createClient(supabaseUrl, supabaseKey, {
			global: {
				headers: { Authorization: authHeader },
			},
		});

		// Verify user is super_admin
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		const { data: profile } = await supabase
			.from('profiles')
			.select('role')
			.eq('id', user.id)
			.single();

		if (!profile || profile.role !== 'super_admin') {
			return new Response(JSON.stringify({ error: 'Forbidden: Super admin access required' }), {
				status: 403,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Parse URL and method
		const url = new URL(req.url);
		const path = url.pathname.replace('/push-analytics-api', '');

		// Route handling
		if (req.method === 'GET') {
			if (path === '' || path === '/') {
				// Get overall analytics
				return await getOverallAnalytics(supabase);
			}
			if (path === '/campaigns') {
				// Get campaign-specific analytics
				return await getCampaignAnalytics(supabase);
			}
			if (path === '/trends') {
				// Get trends over time
				const days = parseInt(url.searchParams.get('days') || '7', 10);
				return await getTrends(supabase, days);
			}
		}

		return new Response(JSON.stringify({ error: 'Not found' }), {
			status: 404,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('Error in push-analytics-api:', error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});

/**
 * Get overall analytics
 */
async function getOverallAnalytics(supabase: unknown) {
	const { data, error } = await supabase
		.from('push_notification_analytics')
		.select('status, opened_at, device_type, browser, os');

	if (error) throw error;

	const total = data.length;
	const sent = data.filter((r: unknown) => r.status === 'sent').length;
	const delivered = data.filter((r: unknown) => r.status === 'delivered').length;
	const failed = data.filter((r: unknown) => r.status === 'failed').length;
	const opened = data.filter((r: unknown) => r.opened_at !== null).length;

	const deliveryRate = total > 0 ? ((delivered / total) * 100).toFixed(2) : '0.00';
	const openRate = delivered > 0 ? ((opened / delivered) * 100).toFixed(2) : '0.00';
	const failureRate = total > 0 ? ((failed / total) * 100).toFixed(2) : '0.00';

	// Device breakdown
	const deviceBreakdown = data.reduce((acc: unknown, r: unknown) => {
		const device = r.device_type || 'unknown';
		acc[device] = (acc[device] || 0) + 1;
		return acc;
	}, {});

	// Browser breakdown
	const browserBreakdown = data.reduce((acc: unknown, r: unknown) => {
		const browser = r.browser || 'unknown';
		acc[browser] = (acc[browser] || 0) + 1;
		return acc;
	}, {});

	return new Response(
		JSON.stringify({
			total,
			sent,
			delivered,
			failed,
			opened,
			deliveryRate: parseFloat(deliveryRate),
			openRate: parseFloat(openRate),
			failureRate: parseFloat(failureRate),
			deviceBreakdown,
			browserBreakdown,
		}),
		{
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		}
	);
}

/**
 * Get campaign-specific analytics
 */
async function getCampaignAnalytics(supabase: unknown) {
	const { data, error } = await supabase
		.from('push_notification_analytics')
		.select('campaign_id, status, opened_at')
		.not('campaign_id', 'is', null);

	if (error) throw error;

	// Group by campaign_id
	const campaigns = data.reduce((acc: unknown, r: unknown) => {
		const id = r.campaign_id;
		if (!acc[id]) {
			acc[id] = { total: 0, delivered: 0, opened: 0, failed: 0 };
		}
		acc[id].total++;
		if (r.status === 'delivered') acc[id].delivered++;
		if (r.status === 'failed') acc[id].failed++;
		if (r.opened_at) acc[id].opened++;
		return acc;
	}, {});

	// Calculate rates
	const campaignStats = Object.entries(campaigns).map(([id, stats]: [string, unknown]) => ({
		campaign_id: id,
		...stats,
		deliveryRate: stats.total > 0 ? ((stats.delivered / stats.total) * 100).toFixed(2) : '0.00',
		openRate: stats.delivered > 0 ? ((stats.opened / stats.delivered) * 100).toFixed(2) : '0.00',
	}));

	return new Response(JSON.stringify(campaignStats), {
		headers: { ...corsHeaders, 'Content-Type': 'application/json' },
	});
}

/**
 * Get trends over time
 */
async function getTrends(supabase: unknown, days: number) {
	const { data, error } = await supabase
		.from('push_notification_analytics')
		.select('created_at, status, opened_at')
		.gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

	if (error) throw error;

	// Group by date
	const trends = data.reduce((acc: unknown, r: unknown) => {
		const date = new Date(r.created_at).toISOString().split('T')[0];
		if (!acc[date]) {
			acc[date] = { total: 0, delivered: 0, opened: 0, failed: 0 };
		}
		acc[date].total++;
		if (r.status === 'delivered') acc[date].delivered++;
		if (r.status === 'failed') acc[date].failed++;
		if (r.opened_at) acc[date].opened++;
		return acc;
	}, {});

	// Convert to array and sort by date
	const trendData = Object.entries(trends)
		.map(([date, stats]: [string, unknown]) => ({
			date,
			...stats,
			deliveryRate: stats.total > 0 ? ((stats.delivered / stats.total) * 100).toFixed(2) : '0.00',
			openRate: stats.delivered > 0 ? ((stats.opened / stats.delivered) * 100).toFixed(2) : '0.00',
		}))
		.sort((a, b) => a.date.localeCompare(b.date));

	return new Response(JSON.stringify(trendData), {
		headers: { ...corsHeaders, 'Content-Type': 'application/json' },
	});
}
