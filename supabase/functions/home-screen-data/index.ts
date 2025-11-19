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
		const supabaseUrl = Deno.env.get('SUPABASE_URL');
		const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

		if (!supabaseUrl || !supabaseKey) {
			console.error(
				'[HOME_SCREEN_DATA] ❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars'
			);
			return new Response(JSON.stringify({ error: 'Server configuration error' }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

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

		// ✅ OPTIMIZATION: Fetch entries data
		const entriesResult = await supabase
			.from('entries')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: false });

		if (entriesResult.error) {
			throw new Error(`Failed to fetch entries: ${entriesResult.error.message}`);
		}

		const allEntries = entriesResult.data || [];

		// ✅ Calculate stats from entries
		const stats = calculateStats(allEntries);

		// ✅ Get recent 3 entries
		const recentEntries = allEntries.slice(0, 3);

		// ✅ Call motivations Edge Function to generate cards
		// NOTE: motivation_cards table is a LOG of viewed cards, NOT a source of cards to show
		// Cards are generated dynamically from entries by motivations Edge Function
		let motivationCards: unknown[] = [];
		try {
			const motivationsUrl = `${supabaseUrl}/functions/v1/motivations/cards/${userId}`;
			console.log('[HOME_SCREEN_DATA] Calling motivations Edge Function:', motivationsUrl);

			const motivationsResponse = await fetch(motivationsUrl, {
				headers: {
					Authorization: `Bearer ${supabaseKey}`,
					'Content-Type': 'application/json',
				},
			});

			if (motivationsResponse.ok) {
				const motivationsData: { cards?: unknown[] } = await motivationsResponse.json();
				motivationCards = motivationsData.cards ?? [];
				console.log('[HOME_SCREEN_DATA] ✅ Got cards from motivations:', motivationCards.length);
			} else {
				console.error(
					'[HOME_SCREEN_DATA] ⚠️ Motivations Edge Function failed:',
					motivationsResponse.status
				);
				// Fallback: return empty array (frontend will handle)
				motivationCards = [];
			}
		} catch (motivationsError: unknown) {
			const errorMessage =
				motivationsError instanceof Error ? motivationsError.message : String(motivationsError);
			console.error('[HOME_SCREEN_DATA] ⚠️ Motivations call error:', errorMessage);
			// Fallback: return empty array
			motivationCards = [];
		}

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
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('[HOME_SCREEN_DATA] ❌ Error:', errorMessage);
		return new Response(JSON.stringify({ error: errorMessage }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});

/**
 * Entry shape used for statistics and streak calculation
 * Standalone type: не импортируем shared-типы, чтобы Edge Function была self-contained
 */
interface HomeScreenEntry {
	created_at: string;
	category?: string | null;
	sentiment?: string | null;
}

/**
 * Calculate user statistics from entries
 */
function calculateStats(entries: HomeScreenEntry[]) {
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
function calculateStreak(entries: HomeScreenEntry[]): number {
	if (!entries || entries.length === 0) {
		return 0;
	}

	const sortedEntries = [...entries].sort(
		(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
	);

	let currentStreak = 0;

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const lastEntryDate = new Date(sortedEntries[0].created_at);
	lastEntryDate.setHours(0, 0, 0, 0);

	const daysDiff = Math.floor((today.getTime() - lastEntryDate.getTime()) / (1000 * 60 * 60 * 24));

	if (daysDiff <= 1) {
		currentStreak = 1;
		let lastDate = lastEntryDate;

		for (let i = 1; i < sortedEntries.length; i++) {
			const currentDate = new Date(sortedEntries[i].created_at);
			currentDate.setHours(0, 0, 0, 0);

			const diff = Math.floor((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

			if (diff === 1) {
				currentStreak++;
			} else if (diff > 1) {
				break;
			}

			lastDate = currentDate;
		}
	}

	return currentStreak;
}
