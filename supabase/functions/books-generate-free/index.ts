/**
 * Books Generate Free API v1 - NO AI
 *
 * Generates simple FREE book from user's diary entries WITHOUT AI.
 * Just a simple list of entries with basic formatting.
 *
 * Endpoint:
 * - POST /books-generate-free - Generate simple FREE book
 *
 * Request body:
 * {
 *   userId: string,
 *   periodStart: string (ISO date),
 *   periodEnd: string (ISO date),
 *   contexts: string[],
 *   diaryName?: string,
 *   diaryEmoji?: string
 * }
 *
 * @author UNITY Team
 * @date 2025-11-22
 * @version 1.0 - FREE tier books (no AI)
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
		const { userId, periodStart, periodEnd, contexts, diaryName, diaryEmoji } = body;

		console.log('[BOOKS-FREE] Generating FREE book for user:', userId);
		console.log('[BOOKS-FREE] Period:', periodStart, '-', periodEnd);

		// Validate user owns this request
		if (user.id !== userId) {
			return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
				status: 403,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Get user language from profile
		const { data: profile } = await supabaseAdmin
			.from('profiles')
			.select('language')
			.eq('id', userId)
			.single();

		const userLanguage = profile?.language || 'ru';
		console.log('[BOOKS-FREE] User language:', userLanguage);

		// Fetch entries for the period
		const { data: entries, error: entriesError } = await supabaseAdmin
			.from('entries')
			.select('id, text, category, tags, is_achievement, created_at, media')
			.eq('user_id', userId)
			.gte('created_at', periodStart)
			.lte('created_at', periodEnd)
			.order('created_at', { ascending: true });

		if (entriesError) {
			console.error('[BOOKS-FREE] Error fetching entries:', entriesError);
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

		console.log('[BOOKS-FREE] Found', entries.length, 'entries');

		// Filter by contexts if specified
		let filteredEntries = entries;
		if (contexts && contexts.length > 0) {
			filteredEntries = entries.filter((entry) =>
				contexts.some((ctx: string) => entry.category?.toLowerCase() === ctx.toLowerCase())
			);
			console.log('[BOOKS-FREE] Filtered to', filteredEntries.length, 'entries by contexts');
		}

		// Collect photos from entries
		const photosFromEntries = filteredEntries.flatMap((entry) => {
			if (!entry.media || !Array.isArray(entry.media)) return [];
			return entry.media
				.filter((m: any) => m.type === 'image' && m.url)
				.map((m: any) => ({
					entryId: entry.id,
					url: m.url,
					createdAt: entry.created_at,
				}));
		});

		console.log('[BOOKS-FREE] Found', photosFromEntries.length, 'photos');

		// Map language code to locale for date formatting
		const localeMap: Record<string, string> = {
			ru: 'ru-RU',
			en: 'en-US',
			es: 'es-ES',
			de: 'de-DE',
			fr: 'fr-FR',
			zh: 'zh-CN',
			ja: 'ja-JP',
			kk: 'kk-KZ',
			ka: 'ka-GE',
		};
		const locale = localeMap[userLanguage] || `${userLanguage}-${userLanguage.toUpperCase()}`;

		// Calculate statistics
		const achievementEntries = filteredEntries.filter((e) => e.is_achievement);
		const stats = {
			totalEntries: filteredEntries.length,
			achievements: achievementEntries.length,
			categories: [...new Set(filteredEntries.map((e) => e.category))],
		};

		// Get translations for FREE book
		const { data: translations } = await supabaseAdmin
			.from('translations')
			.select('translation_key, translation_value')
			.eq('lang_code', userLanguage)
			.in('translation_key', [
				'books_free_title',
				'books_free_subtitle',
				'books_free_intro',
				'books_my_entries',
				'books_statistics',
				'books_total_entries',
				'books_achievements_count',
			]);

		const t: Record<string, string> = {};
		translations?.forEach((tr) => {
			t[tr.translation_key] = tr.translation_value;
		});

		// Fallback translations (Russian)
		const fallbackT = {
			books_free_title: 'Моя книга',
			books_free_subtitle: 'Дневник',
			books_free_intro:
				'Эта книга содержит записи из вашего дневника. Каждая запись — это момент вашей жизни.',
			books_my_entries: 'Мои записи',
			books_statistics: 'Статистика',
			books_total_entries: 'Всего записей',
			books_achievements_count: 'Достижений',
		};

		// Merge translations with fallbacks
		const getText = (key: string) => t[key] || fallbackT[key as keyof typeof fallbackT] || key;

		// Create simple FREE story structure (NO AI)
		const storyJson = {
			title: `${getText('books_free_title')} - ${new Date(periodStart).toLocaleDateString(locale, { month: 'long', year: 'numeric' })}`,
			subtitle: `${new Date(periodStart).toLocaleDateString(locale)} - ${new Date(periodEnd).toLocaleDateString(locale)}`,
			prologue: getText('books_free_intro'),
			chapters: [
				{
					title: getText('books_my_entries'),
					content: '', // Will be filled with entry list in PDF
					entries: filteredEntries.map((entry) => ({
						id: entry.id,
						date: new Date(entry.created_at).toLocaleDateString(locale, {
							weekday: 'long',
							year: 'numeric',
							month: 'long',
							day: 'numeric',
						}),
						text: entry.text.substring(0, 500), // Limit to 500 chars
						category: entry.category,
						tags: entry.tags || [],
						isAchievement: entry.is_achievement,
						hasPhoto: entry.media && Array.isArray(entry.media) && entry.media.length > 0,
					})),
					source_entry_ids: filteredEntries.map((e) => e.id),
				},
			],
			statistics: {
				title: getText('books_statistics'),
				totalEntries: stats.totalEntries,
				achievements: stats.achievements,
				categories: stats.categories,
			},
			epilogue: '',
			dedication: '',
		};

		// Save FREE draft to database
		const { data: draft, error: draftError } = await supabaseAdmin
			.from('books_archive')
			.insert({
				user_id: userId,
				period_start: periodStart,
				period_end: periodEnd,
				contexts: contexts || [],
				style: 'warm_family', // Default style (not used in FREE)
				layout: 'text_only', // FREE books are text-only by default
				theme: 'light',
				plan_type: 'free', // ✅ NEW: Mark as FREE
				type: 'month', // ✅ NEW: Book type
				language: userLanguage, // ✅ NEW: User language
				story_json: storyJson,
				metadata: {
					entriesCount: filteredEntries.length,
					achievementsCount: stats.achievements,
					achievements: achievementEntries.map((e) => ({
						id: e.id,
						date: e.created_at,
						category: e.category,
						summary: e.text.substring(0, 200),
					})),
					diaryName: diaryName || getText('books_free_subtitle'),
					diaryEmoji: diaryEmoji || '📝',
					isFree: true, // Flag for frontend
				},
				is_draft: true,
				is_final: false,
			})
			.select()
			.single();

		if (draftError) {
			console.error('[BOOKS-FREE] Error saving draft:', draftError);
			return new Response(JSON.stringify({ success: false, error: 'Failed to save draft' }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Attach photos as a simple photo collage (first chapter)
		if (photosFromEntries.length > 0) {
			// Take max 9 photos for FREE version (3x3 grid)
			const photosToInsert = photosFromEntries.slice(0, 9).map((photo, index) => ({
				book_id: draft.id,
				chapter_index: 0, // All photos in first chapter
				photo_url: photo.url,
				caption: new Date(photo.createdAt).toLocaleDateString(locale),
			}));

			const { error: photosError } = await supabaseAdmin.from('book_photos').insert(photosToInsert);

			if (photosError) {
				console.error('[BOOKS-FREE] Error saving photos:', photosError);
				// Don't fail the whole request
			}
		}

		console.log('[BOOKS-FREE] FREE draft saved:', draft.id);

		return new Response(
			JSON.stringify({
				success: true,
				draftId: draft.id,
				storyJson,
				estimatedPages: Math.ceil(filteredEntries.length / 5), // ~5 entries per page
				isFree: true,
			}),
			{ status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		);
	} catch (error) {
		console.error('[BOOKS-FREE] Error:', error);
		return new Response(JSON.stringify({ success: false, error: error.message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});
