/**
 * Reports Generate PDF API
 *
 * Generates PDF reports from user's diary entries.
 * FREE users: Statistics + list of entries (NO AI)
 * PREMIUM users: Statistics + list of entries + AI analysis
 *
 * Endpoint:
 * - POST /reports-generate-pdf - Generate PDF report
 *
 * Request body:
 * {
 *   userId: string,
 *   periodStart: string (ISO date),
 *   periodEnd: string (ISO date),
 *   categories?: string[] (optional filter)
 * }
 *
 * @author UNITY Team
 * @date 2025-11-10
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
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
		const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
		const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
		const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

		// Verify authentication
		const authHeader = req.headers.get('Authorization');
		if (!authHeader) {
			return new Response(
				JSON.stringify({ success: false, error: 'Missing authorization header' }),
				{ status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		const token = authHeader.replace('Bearer ', '');
		const {
			data: { user },
			error: authError,
		} = await supabaseAdmin.auth.getUser(token);

		if (authError || !user) {
			return new Response(JSON.stringify({ success: false, error: 'Invalid access token' }), {
				status: 401,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Parse request body
		const body = await req.json();
		const { userId, periodStart, periodEnd, categories } = body;

		console.log('[REPORTS-PDF] Generating report for user:', userId);
		console.log('[REPORTS-PDF] Period:', periodStart, '-', periodEnd);

		// Validate user owns this request
		if (user.id !== userId) {
			return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
				status: 403,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Check if user is Premium
		const { data: profile } = await supabaseAdmin
			.from('profiles')
			.select('is_premium, language, name')
			.eq('id', userId)
			.single();

		const isPremium = profile?.is_premium || false;
		const userLanguage = profile?.language || 'ru';
		const userName = profile?.name || 'Пользователь';

		console.log('[REPORTS-PDF] User Premium status:', isPremium);

		// Fetch entries for the period
		const query = supabaseAdmin
			.from('entries')
			.select(
				'id, text, sentiment, category, tags, mood, ai_summary, ai_insight, is_achievement, created_at'
			)
			.eq('user_id', userId)
			.gte('created_at', periodStart)
			.lte('created_at', periodEnd)
			.order('created_at', { ascending: true });

		// Filter by categories if specified
		if (categories && categories.length > 0) {
			query.in('category', categories);
		}

		const { data: entries, error: entriesError } = await query;

		if (entriesError) {
			console.error('[REPORTS-PDF] Error fetching entries:', entriesError);
			return new Response(JSON.stringify({ success: false, error: 'Failed to fetch entries' }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		if (!entries || entries.length === 0) {
			return new Response(
				JSON.stringify({ success: false, error: 'No entries found for this period' }),
				{ status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		console.log('[REPORTS-PDF] Found', entries.length, 'entries');

		// Calculate statistics
		const stats = {
			totalEntries: entries.length,
			achievements: entries.filter((e) => e.is_achievement).length,
			positiveEntries: entries.filter((e) => e.sentiment === 'positive').length,
			neutralEntries: entries.filter((e) => e.sentiment === 'neutral').length,
			negativeEntries: entries.filter((e) => e.sentiment === 'negative').length,
			categories: [...new Set(entries.map((e) => e.category))],
			topCategory: getTopCategory(entries),
			topMood: getTopMood(entries),
		};

		// Prepare report data
		const reportData = {
			userName,
			userLanguage,
			isPremium,
			periodStart,
			periodEnd,
			stats,
			entries: entries.map((entry) => ({
				id: entry.id,
				date: entry.created_at,
				text: entry.text,
				category: entry.category,
				sentiment: entry.sentiment,
				mood: entry.mood,
				isAchievement: entry.is_achievement,
				// ✅ AI data ONLY for Premium users
				aiSummary: isPremium ? entry.ai_summary : null,
				aiInsight: isPremium ? entry.ai_insight : null,
			})),
		};

		console.log('[REPORTS-PDF] Report data prepared successfully');

		return new Response(
			JSON.stringify({
				success: true,
				reportData,
				message: isPremium ? 'PDF отчет с AI анализом готов' : 'PDF отчет готов (без AI анализа)',
			}),
			{ status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		);
	} catch (error) {
		console.error('[REPORTS-PDF] Error:', error);
		return new Response(
			JSON.stringify({
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			}),
			{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		);
	}
});

/**
 * Get top category from entries
 */
function getTopCategory(entries: any[]): string {
	const categoryCounts: Record<string, number> = {};
	entries.forEach((entry) => {
		const category = entry.category || 'другое';
		categoryCounts[category] = (categoryCounts[category] || 0) + 1;
	});

	let topCategory = 'другое';
	let maxCount = 0;
	Object.entries(categoryCounts).forEach(([category, count]) => {
		if (count > maxCount) {
			maxCount = count;
			topCategory = category;
		}
	});

	return topCategory;
}

/**
 * Get top mood from entries
 */
function getTopMood(entries: any[]): string {
	const moodCounts: Record<string, number> = {};
	entries.forEach((entry) => {
		const mood = entry.mood || 'neutral';
		moodCounts[mood] = (moodCounts[mood] || 0) + 1;
	});

	let topMood = 'neutral';
	let maxCount = 0;
	Object.entries(moodCounts).forEach(([mood, count]) => {
		if (count > maxCount) {
			maxCount = count;
			topMood = mood;
		}
	});

	return topMood;
}
