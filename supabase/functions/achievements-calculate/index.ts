// =====================================================
// ACHIEVEMENTS CALCULATE EDGE FUNCTION
// =====================================================
// Version: 1.0
// Date: 2025-11-16
// Description: Расчет и обновление достижений пользователя
// Refs: docs/new/achievements-review-and-plan.md

import { createClient } from 'jsr:@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// =====================================================
// TYPES
// =====================================================

interface AchievementCondition {
	type: string;
	operator: string;
	value: number;
	category?: string;
}

interface Achievement {
	id: string;
	name: string;
	description: string;
	icon: string;
	rarity: string;
	condition: AchievementCondition;
}

interface UserStats {
	totalEntries: number;
	currentStreak: number;
	longestStreak: number;
	categoryCounts: Record<string, number>;
	achievementsCount: number;
	sentimentNegativeCount: number;
	moodVariety: number;
	daysSinceFirstEntry: number;
}

// =====================================================
// MAIN HANDLER
// =====================================================

Deno.serve(async (req) => {
	// Handle CORS preflight
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		// Get user_id from request
		const { user_id } = await req.json();

		if (!user_id) {
			return new Response(JSON.stringify({ error: 'user_id is required' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Create Supabase client
		const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
		const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
		const supabase = createClient(supabaseUrl, supabaseKey);

		console.log('[achievements-calculate] Calculating achievements for user:', user_id);

		// 1. Get user stats
		const stats = await getUserStats(supabase, user_id);
		console.log('[achievements-calculate] User stats:', stats);

		// 2. Get all enabled achievements
		const { data: achievements, error: achievementsError } = await supabase
			.from('achievements_catalog')
			.select('*')
			.eq('is_enabled', true);

		if (achievementsError) throw achievementsError;

		console.log('[achievements-calculate] Found achievements:', achievements?.length);

		// 3. Calculate progress for each achievement
		const results = [];
		for (const achievement of achievements || []) {
			const progress = calculateProgress(achievement, stats);
			results.push({
				achievement_id: achievement.id,
				progress,
				is_earned: progress >= 100,
			});

			// 4. Upsert user_achievement if progress > 0
			if (progress > 0) {
				const { error: upsertError } = await supabase.from('user_achievements').upsert(
					{
						user_id,
						achievement_id: achievement.id,
						progress,
						earned_at: progress >= 100 ? new Date().toISOString() : null,
					},
					{
						onConflict: 'user_id,achievement_id',
					}
				);

				if (upsertError) {
					console.error('[achievements-calculate] Upsert error:', upsertError);
				}
			}
		}

		console.log('[achievements-calculate] Calculated achievements:', results.length);

		return new Response(
			JSON.stringify({
				success: true,
				user_id,
				total_achievements: achievements?.length || 0,
				calculated: results.length,
				results,
			}),
			{
				status: 200,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		);
	} catch (error: any) {
		console.error('[achievements-calculate] Error:', error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function getUserStats(supabase: any, userId: string): Promise<UserStats> {
	// Get total entries
	const { count: totalEntries } = await supabase
		.from('entries')
		.select('*', { count: 'exact', head: true })
		.eq('user_id', userId);

	// Get entries with is_achievement = true
	const { count: achievementsCount } = await supabase
		.from('entries')
		.select('*', { count: 'exact', head: true })
		.eq('user_id', userId)
		.eq('is_achievement', true);

	// TODO: Calculate streak, category counts, etc.
	// For now, return basic stats

	return {
		totalEntries: totalEntries || 0,
		currentStreak: 0, // TODO
		longestStreak: 0, // TODO
		categoryCounts: {}, // TODO
		achievementsCount: achievementsCount || 0,
		sentimentNegativeCount: 0, // TODO
		moodVariety: 0, // TODO
		daysSinceFirstEntry: 0, // TODO
	};
}

function calculateProgress(achievement: Achievement, stats: UserStats): number {
	const { condition } = achievement;
	const { type, operator, value, category } = condition;

	let currentValue = 0;

	// Get current value based on condition type
	switch (type) {
		case 'entries_count':
			currentValue = stats.totalEntries;
			break;
		case 'streak_days':
			currentValue = stats.currentStreak;
			break;
		case 'achievements_count':
			currentValue = stats.achievementsCount;
			break;
		case 'category_count':
			currentValue = category ? stats.categoryCounts[category] || 0 : 0;
			break;
		case 'sentiment_negative_count':
			currentValue = stats.sentimentNegativeCount;
			break;
		case 'mood_variety':
			currentValue = stats.moodVariety;
			break;
		case 'days_since_first_entry':
			currentValue = stats.daysSinceFirstEntry;
			break;
		default:
			return 0;
	}

	// Calculate progress percentage
	if (operator === '>=') {
		const progress = Math.min(100, Math.floor((currentValue / value) * 100));
		return progress;
	}

	return 0;
}
