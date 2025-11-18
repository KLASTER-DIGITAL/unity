// =====================================================
// STATS AGGREGATOR EDGE FUNCTION
// =====================================================
// Version: 1.0
// Date: 2025-11-17
// Purpose: Aggregate entries into user_stats_daily and user_stats_monthly
// Refs: docs/new/reports-review-and-plan.md

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

Deno.serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		const supabaseUrl = Deno.env.get('SUPABASE_URL');
		const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

		if (!supabaseUrl || !supabaseKey) {
			throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
		}

		const supabase = createClient(supabaseUrl, supabaseKey, {
			auth: { autoRefreshToken: false, persistSession: false },
		});

		const now = new Date();
		const from = new Date(now.getTime() - 90 * MS_PER_DAY); // last 90 days

		console.log('[stats-aggregator] Start aggregation from', from.toISOString());

		const entries = await loadEntries(supabase, from.toISOString());
		console.log('[stats-aggregator] Loaded entries:', entries.length);

		const dailyMap = buildDailyStats(entries);
		const dailyRecords = Array.from(dailyMap.values());

		await upsertDailyStats(supabase, dailyRecords);

		const monthlyRecords = buildMonthlyStats(dailyRecords);
		await upsertMonthlyStats(supabase, monthlyRecords);

		return new Response(
			JSON.stringify({
				success: true,
				days: dailyRecords.length,
				months: monthlyRecords.length,
			}),
			{ status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		);
	} catch (error) {
		console.error('[stats-aggregator] Error:', error);
		return new Response(JSON.stringify({ error: (error as Error).message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});

async function loadEntries(supabase: any, fromIso: string) {
	const all: any[] = [];
	let page = 0;
	const pageSize = 1000;

	while (true) {
		const { data, error } = await supabase
			.from('entries')
			.select('id, user_id, created_at, category, sentiment, is_achievement, mood')
			.gte('created_at', fromIso)
			.order('created_at', { ascending: true })
			.range(page * pageSize, page * pageSize + pageSize - 1);

		if (error) {
			throw error;
		}

		if (!data || data.length === 0) {
			break;
		}

		all.push(...data);

		if (data.length < pageSize) {
			break;
		}

		page += 1;
	}

	return all;
}

function normalizeString(value: string | null | undefined): string {
	return (value || '').trim().toLowerCase();
}

type DailyStatInternal = {
	user_id: string;
	date: string;
	entries_count: number;
	achievements_count: number;
	positive_count: number;
	neutral_count: number;
	negative_count: number;
	categoryCounts: Record<string, number>;
};

function buildDailyStats(entries: any[]): Map<string, DailyStatInternal> {
	const map = new Map<string, DailyStatInternal>();

	for (const entry of entries) {
		const userId = entry.user_id as string;
		if (!userId) continue;

		const d = new Date(entry.created_at);
		d.setHours(0, 0, 0, 0);
		const dateKey = d.toISOString().slice(0, 10);
		const key = `${userId}:${dateKey}`;

		let stat = map.get(key);
		if (!stat) {
			stat = {
				user_id: userId,
				date: dateKey,
				entries_count: 0,
				achievements_count: 0,
				positive_count: 0,
				neutral_count: 0,
				negative_count: 0,
				categoryCounts: {},
			};
			map.set(key, stat);
		}

		stat.entries_count += 1;

		if (entry.is_achievement) {
			stat.achievements_count += 1;
		}

		const sentiment = normalizeString(entry.sentiment);
		if (sentiment === 'positive') stat.positive_count += 1;
		else if (sentiment === 'negative') stat.negative_count += 1;
		else stat.neutral_count += 1;

		const category = normalizeString(entry.category);
		if (category) {
			stat.categoryCounts[category] = (stat.categoryCounts[category] || 0) + 1;
		}
	}

	return map;
}

async function upsertDailyStats(supabase: any, daily: DailyStatInternal[]) {
	if (!daily.length) return;

	const payload = daily.map((d) => {
		const topCategoryEntry = Object.entries(d.categoryCounts).sort((a, b) => b[1] - a[1])[0];
		const top_category = topCategoryEntry ? topCategoryEntry[0] : null;

		return {
			user_id: d.user_id,
			date: d.date,
			entries_count: d.entries_count,
			achievements_count: d.achievements_count,
			positive_count: d.positive_count,
			neutral_count: d.neutral_count,
			negative_count: d.negative_count,
			top_category,
		};
	});

	const { error } = await supabase
		.from('user_stats_daily')
		.upsert(payload, { onConflict: 'user_id,date' });

	if (error) {
		throw error;
	}
}

type MonthlyStatRecord = {
	user_id: string;
	year: number;
	month: number;
	entries_count: number;
	achievements_count: number;
	avg_mood: number | null;
	top_categories: any;
};

function buildMonthlyStats(daily: DailyStatInternal[]): MonthlyStatRecord[] {
	const map = new Map<
		string,
		{
			user_id: string;
			year: number;
			month: number;
			entries_count: number;
			achievements_count: number;
			moodScoreSum: number;
			moodCount: number;
			categoryCounts: Record<string, number>;
		}
	>();

	for (const d of daily) {
		const date = new Date(d.date + 'T00:00:00Z');
		const year = date.getUTCFullYear();
		const month = date.getUTCMonth() + 1;
		const key = `${d.user_id}:${year}-${month}`;

		let stat = map.get(key);
		if (!stat) {
			stat = {
				user_id: d.user_id,
				year,
				month,
				entries_count: 0,
				achievements_count: 0,
				moodScoreSum: 0,
				moodCount: 0,
				categoryCounts: {},
			};
			map.set(key, stat);
		}

		stat.entries_count += d.entries_count;
		stat.achievements_count += d.achievements_count;

		const dayTotal = d.positive_count + d.neutral_count + d.negative_count;
		if (dayTotal > 0) {
			const dayScore = (d.positive_count - d.negative_count) / dayTotal;
			stat.moodScoreSum += dayScore * dayTotal;
			stat.moodCount += dayTotal;
		}

		for (const [category, count] of Object.entries(d.categoryCounts)) {
			stat.categoryCounts[category] = (stat.categoryCounts[category] || 0) + count;
		}
	}

	const result: MonthlyStatRecord[] = [];

	for (const stat of map.values()) {
		const avg_mood = stat.moodCount > 0 ? stat.moodScoreSum / stat.moodCount : null;
		const sortedCats = Object.entries(stat.categoryCounts)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([name, count]) => ({ name, count }));

		result.push({
			user_id: stat.user_id,
			year: stat.year,
			month: stat.month,
			entries_count: stat.entries_count,
			achievements_count: stat.achievements_count,
			avg_mood,
			top_categories: sortedCats,
		});
	}

	return result;
}

async function upsertMonthlyStats(supabase: any, monthly: MonthlyStatRecord[]) {
	if (!monthly.length) return;

	const { error } = await supabase
		.from('user_stats_monthly')
		.upsert(monthly, { onConflict: 'user_id,year,month' });

	if (error) {
		throw error;
	}
}
