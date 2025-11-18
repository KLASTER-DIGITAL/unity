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
	maxGapDays: number;
	// Уровень и прогресс уровня, чтобы AchievementsScreen мог полностью полагаться на серверную статистику
	level: number;
	nextLevelProgress: number;
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

		// Create Supabase client (fail fast if env vars are not set)
		const supabaseUrl = Deno.env.get('SUPABASE_URL');
		const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
		if (!supabaseUrl || !supabaseKey) {
			throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
		}
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
				stats,
				total_achievements: achievements?.length || 0,
				calculated: results.length,
				results,
			}),
			{
				status: 200,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		);
	} catch (error: unknown) {
		console.error('[achievements-calculate] Error:', error);
		const message = error instanceof Error ? error.message : 'Unknown error';
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function normalizeString(value: string | null | undefined): string {
	return (value || '').trim().toLowerCase();
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: streak calculation requires multiple branches but is well-tested
function calculateStreakFromEntries(entries: Array<{ created_at: string }>): {
	current: number;
	longest: number;
} {
	if (!entries || entries.length === 0) {
		return { current: 0, longest: 0 };
	}

	const sorted = [...entries].sort(
		(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
	);

	let currentStreak = 0;
	let longestStreak = 0;
	let tempStreak = 1;
	let lastDate = new Date(sorted[0].created_at);

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const lastEntryDate = new Date(sorted[0].created_at);
	lastEntryDate.setHours(0, 0, 0, 0);

	const daysDiff = Math.floor((today.getTime() - lastEntryDate.getTime()) / MS_PER_DAY);

	if (daysDiff <= 1) {
		currentStreak = 1;

		for (let i = 1; i < sorted.length; i++) {
			const currentDate = new Date(sorted[i].created_at);
			currentDate.setHours(0, 0, 0, 0);

			const diff = Math.floor((lastDate.getTime() - currentDate.getTime()) / MS_PER_DAY);

			if (diff === 1) {
				currentStreak++;
				tempStreak++;
			} else if (diff > 1) {
				break;
			}

			lastDate = currentDate;
		}
	}

	tempStreak = 1;
	lastDate = new Date(sorted[0].created_at);

	for (let i = 1; i < sorted.length; i++) {
		const currentDate = new Date(sorted[i].created_at);
		currentDate.setHours(0, 0, 0, 0);
		lastDate.setHours(0, 0, 0, 0);

		const diff = Math.floor((lastDate.getTime() - currentDate.getTime()) / MS_PER_DAY);

		if (diff === 1) {
			tempStreak++;
			longestStreak = Math.max(longestStreak, tempStreak);
		} else if (diff > 1) {
			tempStreak = 1;
		}

		lastDate = currentDate;
	}

	longestStreak = Math.max(longestStreak, currentStreak, tempStreak);

	return { current: currentStreak, longest: longestStreak };
}

async function getUserStats(supabase: any, userId: string): Promise<UserStats> {
	const { data: entries, error } = await supabase
		.from('entries')
		.select('id, created_at, category, mood, sentiment, is_achievement')
		.eq('user_id', userId)
		.order('created_at', { ascending: true });

	if (error) {
		console.error('[achievements-calculate] Error loading entries for stats:', error);
		throw error;
	}

	if (!entries || entries.length === 0) {
		return {
			totalEntries: 0,
			currentStreak: 0,
			longestStreak: 0,
			categoryCounts: {},
			achievementsCount: 0,
			sentimentNegativeCount: 0,
			moodVariety: 0,
			daysSinceFirstEntry: 0,
			maxGapDays: 0,
			level: 1,
			nextLevelProgress: 0,
		};
	}

	const totalEntries = entries.length;
	let achievementsCount = 0;
	const categoryCounts: Record<string, number> = {};
	const moodSet = new Set<string>();
	let sentimentNegativeCount = 0;

	entries.forEach((entry: any) => {
		if (entry.is_achievement) {
			achievementsCount += 1;
		}

		const normalizedCategory = normalizeString(entry.category);
		if (normalizedCategory) {
			categoryCounts[normalizedCategory] = (categoryCounts[normalizedCategory] || 0) + 1;
		}

		const normalizedMood = normalizeString(entry.mood);
		if (normalizedMood) {
			moodSet.add(normalizedMood);
		}

		if (entry.sentiment === 'negative') {
			sentimentNegativeCount += 1;
		}
	});

	const moodVariety = moodSet.size;
	const streak = calculateStreakFromEntries(entries);

	const firstEntryDate = new Date(entries[0].created_at);
	firstEntryDate.setHours(0, 0, 0, 0);
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const daysSinceFirstEntry = Math.max(
		0,
		Math.floor((today.getTime() - firstEntryDate.getTime()) / MS_PER_DAY)
	);

	let maxGapDays = 0;
	let previousDate = new Date(entries[0].created_at);
	previousDate.setHours(0, 0, 0, 0);

	for (let i = 1; i < entries.length; i++) {
		const currentDate = new Date(entries[i].created_at);
		currentDate.setHours(0, 0, 0, 0);

		const diff = Math.floor((currentDate.getTime() - previousDate.getTime()) / MS_PER_DAY);

		if (diff > maxGapDays) {
			maxGapDays = diff;
		}

		previousDate = currentDate;
	}

	// Вычисление уровня: 1 запись = 10 XP, уровень каждые 100 XP
	const totalXP = totalEntries * 10;
	const level = Math.floor(totalXP / 100) + 1;
	const xpInCurrentLevel = totalXP % 100;
	const nextLevelProgress = Math.round(xpInCurrentLevel);

	return {
		totalEntries,
		currentStreak: streak.current,
		longestStreak: streak.longest,
		categoryCounts,
		achievementsCount,
		sentimentNegativeCount,
		moodVariety,
		daysSinceFirstEntry,
		maxGapDays,
		level,
		nextLevelProgress,
	};
}

function calculateProgress(achievement: Achievement, stats: UserStats): number {
	const { condition } = achievement;
	const { type, operator, value, category } = condition;

	let currentValue = 0;

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
		case 'category_count': {
			const normalizedCategory = normalizeString(category);
			currentValue = normalizedCategory ? stats.categoryCounts[normalizedCategory] || 0 : 0;
			break;
		}
		case 'sentiment_negative_count':
			currentValue = stats.sentimentNegativeCount;
			break;
		case 'mood_variety':
			currentValue = stats.moodVariety;
			break;
		case 'days_since_first_entry':
			currentValue = stats.daysSinceFirstEntry;
			break;
		case 'all_categories': {
			const mainCategories = ['семья', 'здоровье', 'работа', 'благодарность'];
			const counts = mainCategories.map((cat) => stats.categoryCounts[cat] || 0);
			currentValue = counts.length ? Math.min(...counts) : 0;
			break;
		}
		case 'comeback_after_days':
			currentValue = stats.maxGapDays;
			break;
		default:
			return 0;
	}

	if (operator === '>=') {
		const progress = Math.min(100, Math.floor((currentValue / value) * 100));
		return progress;
	}

	return 0;
}
