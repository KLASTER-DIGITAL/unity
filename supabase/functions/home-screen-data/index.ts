/**
 * Unified Home Screen Data API
 *
 * Объединяет 3 запроса в 1:
 * 1. getUserStats() - статистика пользователя
 * 2. getMotivationCards() - мотивационные карточки
 * 3. getEntries(limit=3) - последние 3 записи
 *
 * Ожидаемый результат:
 * - API requests: 3 → 1 (↓67%)
 * - FCP: 1500ms → 900-1050ms (↓30-40%)
 * - LCP: 2000ms → 1200-1400ms (↓30-40%)
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

// CORS headers
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
		const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
		const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
		const supabase = createClient(supabaseUrl, supabaseKey, {
			global: {
				headers: { Authorization: authHeader },
			},
		});

		// Get user from JWT
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		const userId = user.id;
		console.log('[HOME_SCREEN_DATA] Fetching data for user:', userId);

		// ✅ OPTIMIZATION: Fetch all data in parallel
		const [entriesResult, motivationCardsResult] = await Promise.all([
			// 1. Fetch ALL entries (for stats calculation)
			supabase
				.from('entries')
				.select('*')
				.eq('user_id', userId)
				.order('created_at', { ascending: false }),

			// 2. Fetch motivation cards
			supabase
				.from('motivation_cards')
				.select('*')
				.eq('user_id', userId)
				.order('created_at', { ascending: false }),
		]);

		if (entriesResult.error) {
			throw new Error(`Failed to fetch entries: ${entriesResult.error.message}`);
		}

		if (motivationCardsResult.error) {
			throw new Error(`Failed to fetch motivation cards: ${motivationCardsResult.error.message}`);
		}

		const allEntries = entriesResult.data || [];
		const motivationCards = motivationCardsResult.data || [];

		// ✅ Calculate stats from entries
		const stats = calculateStats(allEntries);

		// ✅ Get recent 3 entries
		const recentEntries = allEntries.slice(0, 3);

		// ✅ Return unified response
		const response = {
			stats,
			motivationCards,
			recentEntries,
			timestamp: new Date().toISOString(),
		};

		console.log('[HOME_SCREEN_DATA] ✅ Success:', {
			totalEntries: allEntries.length,
			motivationCards: motivationCards.length,
			recentEntries: recentEntries.length,
		});

		return new Response(JSON.stringify(response), {
			status: 200,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	} catch (error: any) {
		console.error('[HOME_SCREEN_DATA] ❌ Error:', error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});

/**
 * Calculate user statistics from entries
 */
function calculateStats(entries: any[]) {
	const totalEntries = entries.length;

	// Calculate current streak
	const currentStreak = calculateStreak(entries);

	// Calculate category counts
	const categoryCounts: Record<string, number> = {};
	entries.forEach((entry) => {
		const category = entry.category || 'Другое';
		categoryCounts[category] = (categoryCounts[category] || 0) + 1;
	});

	// Calculate sentiment counts
	const sentimentCounts: Record<string, number> = {};
	entries.forEach((entry) => {
		const sentiment = entry.sentiment || 'neutral';
		sentimentCounts[sentiment] = (sentimentCounts[sentiment] || 0) + 1;
	});

	// Get last entry date
	const lastEntryDate = entries.length > 0 ? entries[0].created_at : null;

	return {
		totalEntries,
		currentStreak,
		categoryCounts,
		sentimentCounts,
		lastEntryDate,
	};
}

/**
 * Calculate current streak from entries
 */
function calculateStreak(entries: any[]): number {
	if (entries.length === 0) return 0;

	// Sort entries by date (newest first)
	const sortedEntries = [...entries].sort(
		(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
	);

	// Get unique dates (YYYY-MM-DD format)
	const uniqueDates = new Set<string>();
	sortedEntries.forEach((entry) => {
		const date = new Date(entry.created_at).toISOString().split('T')[0];
		uniqueDates.add(date);
	});

	const dates = Array.from(uniqueDates).sort((a, b) => b.localeCompare(a)); // Newest first

	if (dates.length === 0) return 0;

	// Check if today has an entry
	const today = new Date().toISOString().split('T')[0];
	let streak = 0;
	const currentDate = new Date(today);

	for (const dateStr of dates) {
		const entryDate = dateStr;
		const expectedDate = currentDate.toISOString().split('T')[0];

		if (entryDate === expectedDate) {
			streak++;
			// Move to previous day
			currentDate.setDate(currentDate.getDate() - 1);
		} else {
			// Streak broken
			break;
		}
	}

	return streak;
}
