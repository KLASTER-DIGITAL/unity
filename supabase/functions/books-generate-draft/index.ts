/**
 * Books Generate Draft API v2 - AI-POWERED
 *
 * Generates AI-powered book draft from user's diary entries using monthly_report operation.
 *
 * Endpoint:
 * - POST /books-generate-draft - Generate book draft
 *
 * Request body:
 * {
 *   userId: string,
 *   periodStart: string (ISO date),
 *   periodEnd: string (ISO date),
 *   contexts: string[],
 *   style: 'warm_family' | 'biographical' | 'motivational',
 *   layout: 'photo_text' | 'text_only' | 'minimal',
 *   theme: 'light' | 'dark',
 *   diaryName?: string,
 *   diaryEmoji?: string
 * }
 *
 * @author UNITY Team
 * @date 2025-11-15
 * @version 2.0 - AI Control Center integration
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

// AI helpers (inline to avoid imports)
async function getAiConfig(url: string, key: string, id: string) {
	const res = await fetch(`${url}/rest/v1/ai_operations?id=eq.${id}&select=*`, {
		headers: { apikey: key, Authorization: `Bearer ${key}` },
	});
	const data = await res.json();
	return data?.[0] || null;
}

function replacePlaceholders(template: string, vars: Record<string, string>): string {
	let result = template;
	for (const [key, value] of Object.entries(vars)) {
		result = result.replaceAll(`{{${key}}}`, value);
	}
	return result;
}

// Removed unused getOpenAIKey function - OpenAI key is fetched inline in the main handler

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
		const {
			userId,
			periodStart,
			periodEnd,
			contexts,
			style,
			layout,
			theme,
			diaryName,
			diaryEmoji,
			regenerate = false, // ✅ NEW: Force regeneration flag
		} = body;

		console.log('[BOOKS-DRAFT] Generating draft for user:', userId);
		console.log('[BOOKS-DRAFT] Period:', periodStart, '-', periodEnd);
		console.log('[BOOKS-DRAFT] Style:', style, 'Layout:', layout, 'Theme:', theme);
		console.log('[BOOKS-DRAFT] Regenerate:', regenerate);

		// Validate user owns this request
		if (user.id !== userId) {
			return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
				status: 403,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Get OpenAI API key
		const { data: setting } = await supabaseAdmin
			.from('admin_settings')
			.select('value')
			.eq('key', 'openai_api_key')
			.single();

		const openaiApiKey = setting?.value || Deno.env.get('OPENAI_API_KEY');
		if (!openaiApiKey) {
			return new Response(
				JSON.stringify({ success: false, error: 'OpenAI API key not configured' }),
				{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		// Get user language from profile
		const { data: profile } = await supabaseAdmin
			.from('profiles')
			.select('language')
			.eq('id', userId)
			.single();

		const userLanguage = profile?.language || 'ru';
		console.log('[BOOKS-DRAFT] User language:', userLanguage);

		// ✅ CHECK FOR EXISTING DRAFT (AI Optimization - save tokens!)
		if (!regenerate) {
			const { data: existingDraft } = await supabaseAdmin
				.from('books_archive')
				.select('*')
				.eq('user_id', userId)
				.eq('period_start', periodStart)
				.eq('period_end', periodEnd)
				.eq('style', style)
				.eq('is_draft', true)
				.order('created_at', { ascending: false })
				.limit(1)
				.single();

			if (existingDraft?.story_json) {
				console.log('[BOOKS-DRAFT] ✅ Using cached story_json (AI tokens saved!)');
				return new Response(
					JSON.stringify({
						success: true,
						draftId: existingDraft.id,
						storyJson: existingDraft.story_json,
						cached: true, // ✅ Flag that this is cached
						estimatedPages: Math.ceil(existingDraft.metadata?.entriesCount || 0 / 10),
					}),
					{ status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
				);
			}

			console.log('[BOOKS-DRAFT] No cached draft found, generating new...');
		} else {
			console.log('[BOOKS-DRAFT] Regenerate flag set, generating new draft...');
		}

		// Fetch entries for the period
		const { data: entries, error: entriesError } = await supabaseAdmin
			.from('entries')
			.select(
				'id, text, sentiment, category, tags, mood, ai_summary, ai_insight, is_achievement, created_at'
			)
			.eq('user_id', userId)
			.gte('created_at', periodStart)
			.lte('created_at', periodEnd)
			.order('created_at', { ascending: true });

		if (entriesError) {
			console.error('[BOOKS-DRAFT] Error fetching entries:', entriesError);
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

		console.log('[BOOKS-DRAFT] Found', entries.length, 'entries');

		// Filter by contexts if specified
		let filteredEntries = entries;
		if (contexts && contexts.length > 0) {
			filteredEntries = entries.filter((entry) =>
				contexts.some((ctx: string) => entry.category?.toLowerCase() === ctx.toLowerCase())
			);
			console.log('[BOOKS-DRAFT] Filtered to', filteredEntries.length, 'entries by contexts');
		}

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

		// Prepare data for AI
		const entriesSummary = filteredEntries.map((entry) => ({
			date: new Date(entry.created_at).toLocaleDateString(locale),
			category: entry.category,
			sentiment: entry.sentiment,
			summary: entry.ai_summary || entry.text.substring(0, 200),
			isAchievement: entry.is_achievement,
			mood: entry.mood,
		}));

		// Calculate statistics
		const stats = {
			totalEntries: filteredEntries.length,
			achievements: filteredEntries.filter((e) => e.is_achievement).length,
			positiveEntries: filteredEntries.filter((e) => e.sentiment === 'positive').length,
			categories: [...new Set(filteredEntries.map((e) => e.category))],
		};

		// ✅ Load AI operation config for monthly_report
		console.log('[BOOKS-DRAFT] Loading monthly_report AI operation...');
		const config = await getAiConfig(supabaseUrl, supabaseServiceKey, 'monthly_report');

		let systemPrompt: string;
		let userPrompt: string;

		if (config && config.is_enabled) {
			// ✅ Use AI operation from database
			console.log('[BOOKS-DRAFT] Using monthly_report from AI Control Center');

			systemPrompt = replacePlaceholders(config.system_prompt, {
				user_language: userLanguage,
				book_style: style,
			});

			userPrompt = replacePlaceholders(config.user_prompt_template, {
				user_language: userLanguage,
				period_start: new Date(periodStart).toLocaleDateString(locale),
				period_end: new Date(periodEnd).toLocaleDateString(locale),
				diary_name: diaryName || 'My Diary',
				diary_emoji: diaryEmoji || '📝',
				total_entries: String(stats.totalEntries),
				achievements_count: String(stats.achievements),
				positive_count: String(stats.positiveEntries),
				categories_list: stats.categories.join(', '),
				entries_summary: JSON.stringify(entriesSummary, null, 2),
			});
		} else {
			// ❌ Fallback to hardcoded prompts
			console.log('[BOOKS-DRAFT] ⚠️ monthly_report disabled, using fallback prompts');

			const stylePrompts = {
				warm_family:
					'Создай теплую семейную историю, подчеркивая моменты единения, любви и совместного роста.',
				biographical:
					'Создай биографическое повествование, фокусируясь на личном развитии и ключевых моментах.',
				motivational:
					'Создай мотивационную историю успеха, выделяя достижения, преодоление трудностей и рост.',
			};

			systemPrompt = `You are an AI writer creating personalized achievement books.

Style: ${stylePrompts[style as keyof typeof stylePrompts]}

Create a JSON book structure with fields:
- title: Book title (creative, inspiring)
- subtitle: Subtitle with period
- prologue: Introduction (2-3 paragraphs)
- chapters: Array of chapters, each with:
  - title: Chapter title
  - content: Chapter text (3-5 paragraphs)
  - highlights: Key moments (array of strings)
- epilogue: Conclusion (2-3 paragraphs)
- dedication: Dedication (optional)

Use the diary entries data to create a cohesive narrative.
IMPORTANT: Write the entire book in the user's language: ${userLanguage}`;

			userPrompt = `Period: ${new Date(periodStart).toLocaleDateString(locale)} - ${new Date(periodEnd).toLocaleDateString(locale)}
Diary: ${diaryName || 'My Diary'} ${diaryEmoji || '📝'}
User Language: ${userLanguage}

Статистика:
- Всего записей: ${stats.totalEntries}
- Достижений: ${stats.achievements}
- Позитивных моментов: ${stats.positiveEntries}
- Категории: ${stats.categories.join(', ')}

Записи:
${JSON.stringify(entriesSummary, null, 2)}

Создай вдохновляющую книгу на основе этих данных.`;
		}

		// Call OpenAI API
		console.log('[BOOKS-DRAFT] Calling OpenAI API...');
		console.log('[BOOKS-DRAFT] Prompt length:', systemPrompt.length + userPrompt.length, 'chars');

		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${openaiApiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model: 'gpt-4o-mini',
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt },
				],
				temperature: 0.8,
				max_tokens: 3000,
				response_format: { type: 'json_object' },
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('[BOOKS-DRAFT] OpenAI API error status:', response.status);
			console.error('[BOOKS-DRAFT] OpenAI API error body:', errorText);

			// Parse error details if possible
			try {
				const errorJson = JSON.parse(errorText);
				console.error('[BOOKS-DRAFT] OpenAI error details:', errorJson);
			} catch (_e) {
				// Error text is not JSON
			}

			return new Response(
				JSON.stringify({
					success: false,
					error: 'OpenAI API failed',
					details: `Status: ${response.status}`,
				}),
				{
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			);
		}

		const aiResult = await response.json();
		console.log('[BOOKS-DRAFT] OpenAI response received');

		// Validate response structure
		if (!aiResult.choices || !aiResult.choices[0] || !aiResult.choices[0].message) {
			console.error('[BOOKS-DRAFT] Invalid OpenAI response structure:', JSON.stringify(aiResult));
			return new Response(
				JSON.stringify({ success: false, error: 'Invalid OpenAI response structure' }),
				{
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			);
		}

		// Parse story JSON
		let storyJson: unknown;
		try {
			const content = aiResult.choices[0].message.content;
			console.log('[BOOKS-DRAFT] AI content length:', content.length, 'chars');
			storyJson = JSON.parse(content);
			console.log('[BOOKS-DRAFT] Story JSON parsed successfully');
		} catch (parseError) {
			console.error('[BOOKS-DRAFT] Failed to parse story JSON:', parseError);
			console.error(
				'[BOOKS-DRAFT] AI content:',
				aiResult.choices[0].message.content.substring(0, 500)
			);
			return new Response(
				JSON.stringify({ success: false, error: 'Failed to parse AI response as JSON' }),
				{
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			);
		}

		// Log OpenAI usage (GPT-4o-mini pricing: $0.15/1M input, $0.60/1M output)
		const { prompt_tokens, completion_tokens, total_tokens } = aiResult.usage;
		const estimatedCost = prompt_tokens * 0.00015 + completion_tokens * 0.0006;

		await supabaseAdmin.from('openai_usage').insert({
			user_id: userId,
			operation_type: 'book_draft',
			model: 'gpt-4o-mini',
			prompt_tokens,
			completion_tokens,
			total_tokens,
			estimated_cost: estimatedCost,
		});

		console.log('[BOOKS-DRAFT] AI generation complete. Tokens:', total_tokens);

		// Save draft to database
		const { data: draft, error: draftError } = await supabaseAdmin
			.from('books_archive')
			.insert({
				user_id: userId,
				period_start: periodStart,
				period_end: periodEnd,
				contexts: contexts || [],
				style,
				layout,
				theme,
				story_json: storyJson,
				metadata: {
					entriesCount: filteredEntries.length,
					achievementsCount: stats.achievements,
					tokensUsed: total_tokens,
					estimatedCost,
					diaryName: diaryName || 'Мой дневник',
					diaryEmoji: diaryEmoji || '📝',
				},
				is_draft: true,
				is_final: false,
			})
			.select()
			.single();

		if (draftError) {
			console.error('[BOOKS-DRAFT] Error saving draft:', draftError);
			return new Response(JSON.stringify({ success: false, error: 'Failed to save draft' }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		console.log('[BOOKS-DRAFT] Draft saved:', draft.id);

		return new Response(
			JSON.stringify({
				success: true,
				draftId: draft.id,
				storyJson,
				estimatedPages: Math.ceil(filteredEntries.length / 10),
			}),
			{ status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		);
	} catch (error) {
		console.error('[BOOKS-DRAFT] Error:', error);
		return new Response(JSON.stringify({ success: false, error: error.message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});
