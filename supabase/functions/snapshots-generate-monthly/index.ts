/**
 * Snapshots Generate Monthly API v1
 *
 * Generates monthly snapshots for all users (Cron job).
 * Aggregates entries, calculates statistics, creates AI summary.
 *
 * Endpoint:
 * - POST /snapshots-generate-monthly - Generate snapshots (Cron)
 *
 * @author UNITY Team
 * @date 2025-11-22
 * @version 1.0 - Monthly snapshots generation
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: legacy code
Deno.serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
		const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
		const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

		console.log('[SNAPSHOTS-MONTHLY] Starting monthly snapshots generation...');

		// Determine period (last month)
		const now = new Date();
		const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

		const periodStart = lastMonth.toISOString().split('T')[0];
		const periodEnd = lastMonthEnd.toISOString().split('T')[0];

		console.log('[SNAPSHOTS-MONTHLY] Period:', periodStart, '-', periodEnd);

		// Get all active users
		const { data: users, error: usersError } = await supabaseAdmin
			.from('profiles')
			.select('id, language');

		if (usersError) {
			console.error('[SNAPSHOTS-MONTHLY] Error fetching users:', usersError);
			return new Response(JSON.stringify({ success: false, error: 'Failed to fetch users' }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		let totalProcessed = 0;
		let totalCreated = 0;
		let totalSkipped = 0;
		let totalErrors = 0;

		// Process each user
		for (const user of users || []) {
			try {
				totalProcessed++;

				// Check if snapshot already exists
				const { data: existing } = await supabaseAdmin
					.from('monthly_snapshots')
					.select('id')
					.eq('user_id', user.id)
					.eq('period_start', periodStart)
					.eq('period_end', periodEnd)
					.single();

				if (existing) {
					console.log(`[SNAPSHOTS-MONTHLY] Snapshot already exists for user ${user.id}`);
					totalSkipped++;
					continue;
				}

				// Get entries for period
				const { data: entries, error: entriesError } = await supabaseAdmin
					.from('entries')
					.select(
						'id, text, category, tags, mood, sentiment, is_achievement, created_at, person_tags'
					)
					.eq('user_id', user.id)
					.gte('created_at', periodStart)
					.lte('created_at', periodEnd)
					.order('created_at', { ascending: true });

				if (entriesError || !entries || entries.length === 0) {
					console.log(`[SNAPSHOTS-MONTHLY] No entries for user ${user.id}, skipping`);
					totalSkipped++;
					continue;
				}

				// Calculate statistics
				const totalEntries = entries.length;
				const activeDays = new Set(entries.map((e) => e.created_at.split('T')[0])).size;

				// Emotions distribution
				const emotionsDistribution: Record<string, number> = {};
				entries.forEach((e) => {
					if (e.mood) {
						emotionsDistribution[e.mood] = (emotionsDistribution[e.mood] || 0) + 1;
					}
				});

				// Top topics (from categories and tags)
				const topicsCount: Record<string, number> = {};
				entries.forEach((e) => {
					if (e.category) topicsCount[e.category] = (topicsCount[e.category] || 0) + 1;
					e.tags?.forEach((tag: string) => {
						topicsCount[tag] = (topicsCount[tag] || 0) + 1;
					});
				});
				const topTopics = Object.entries(topicsCount)
					.sort((a, b) => b[1] - a[1])
					.slice(0, 5)
					.map(([topic]) => topic);

				// Top persons (from person_tags)
				const personsCount: Record<string, number> = {};
				entries.forEach((e) => {
					e.person_tags?.forEach((person: string) => {
						personsCount[person] = (personsCount[person] || 0) + 1;
					});
				});
				const topPersons = Object.entries(personsCount)
					.sort((a, b) => b[1] - a[1])
					.slice(0, 5)
					.map(([person]) => person);

				// Achievements
				const achievementsCount = entries.filter((e) => e.is_achievement).length;

				// Calculate streaks
				const dates = entries.map((e) => e.created_at.split('T')[0]).sort();
				let currentStreak = 0;
				let longestStreak = 0;
				let tempStreak = 1;

				for (let i = 1; i < dates.length; i++) {
					const prev = new Date(dates[i - 1]);
					const curr = new Date(dates[i]);
					const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

					if (diffDays === 1) {
						tempStreak++;
					} else {
						longestStreak = Math.max(longestStreak, tempStreak);
						tempStreak = 1;
					}
				}
				longestStreak = Math.max(longestStreak, tempStreak);
				currentStreak = tempStreak;

				const streaks = {
					current: currentStreak,
					longest: longestStreak,
				};

				// Significant events (simple summary without AI for now)
				// TODO: Add AI summary in future version
				const significantEvents = {
					summary: `Месяц с ${totalEntries} записями и ${achievementsCount} достижениями.`,
					themes: topTopics,
					topPersons,
				};

				// Insert snapshot
				const { error: insertError } = await supabaseAdmin.from('monthly_snapshots').insert({
					user_id: user.id,
					period_start: periodStart,
					period_end: periodEnd,
					total_entries: totalEntries,
					active_days: activeDays,
					emotions_distribution: emotionsDistribution,
					streaks,
					top_topics: topTopics,
					top_persons: topPersons,
					achievements_count: achievementsCount,
					significant_events: significantEvents,
					tokens_used: 0, // No AI used yet
				});

				if (insertError) {
					console.error(
						`[SNAPSHOTS-MONTHLY] Error inserting snapshot for user ${user.id}:`,
						insertError
					);
					totalErrors++;
				} else {
					console.log(`[SNAPSHOTS-MONTHLY] ✅ Created snapshot for user ${user.id}`);
					totalCreated++;
				}
			} catch (error) {
				console.error(`[SNAPSHOTS-MONTHLY] Error processing user ${user.id}:`, error);
				totalErrors++;
			}
		}

		console.log('[SNAPSHOTS-MONTHLY] Generation complete');
		console.log('[SNAPSHOTS-MONTHLY] Total processed:', totalProcessed);
		console.log('[SNAPSHOTS-MONTHLY] Created:', totalCreated);
		console.log('[SNAPSHOTS-MONTHLY] Skipped:', totalSkipped);
		console.log('[SNAPSHOTS-MONTHLY] Errors:', totalErrors);

		return new Response(
			JSON.stringify({
				success: true,
				results: {
					total: totalProcessed,
					created: totalCreated,
					skipped: totalSkipped,
					errors: totalErrors,
				},
			}),
			{ status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		);
	} catch (error) {
		console.error('[SNAPSHOTS-MONTHLY] Error:', error);
		return new Response(JSON.stringify({ success: false, error: error.message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});
