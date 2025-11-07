/**
 * Books Generate Draft API
 *
 * Generates AI-powered book draft from user's diary entries.
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
 * @date 2025-11-07
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
		} = body;

		console.log('[BOOKS-DRAFT] Generating draft for user:', userId);
		console.log('[BOOKS-DRAFT] Period:', periodStart, '-', periodEnd);
		console.log('[BOOKS-DRAFT] Style:', style, 'Layout:', layout, 'Theme:', theme);

		// Validate user owns this request
		if (user.id !== userId) {
			return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
				status: 403,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Check user's Premium status
		const { data: profile } = await supabaseAdmin
			.from('profiles')
			.select('is_premium')
			.eq('id', userId)
			.single();

		const isPremium = profile?.is_premium || false;

		// Free users CANNOT use AI generation (Premium only feature)
		if (!isPremium) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Premium required',
					message:
						'AI-генерация книг доступна только для Premium пользователей. Обновите подписку для доступа к этой функции.',
				}),
				{ status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
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

		// Validate minimum entries (5 required for meaningful book)
		if (entries.length < 5) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Insufficient entries',
					message: `Для создания книги нужно минимум 5 записей. У вас: ${entries.length}`,
				}),
				{ status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

		// Prepare data for AI
		const entriesSummary = filteredEntries.map((entry) => ({
			date: new Date(entry.created_at).toLocaleDateString('ru-RU'),
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

		// Build AI prompt based on style
		const stylePrompts = {
			warm_family:
				'Создай теплую семейную историю, подчеркивая моменты единения, любви и совместного роста.',
			biographical:
				'Создай биографическое повествование, фокусируясь на личном развитии и ключевых моментах.',
			motivational:
				'Создай мотивационную историю успеха, выделяя достижения, преодоление трудностей и рост.',
		};

		const systemPrompt = `Ты - AI писатель, создающий персональные книги достижений.

Стиль: ${stylePrompts[style as keyof typeof stylePrompts]}

Создай JSON с полями:
{
  "title": "Название книги (креативное, вдохновляющее)",
  "subtitle": "Подзаголовок с периодом",
  "prologue": "Вступление (2-3 абзаца)",
  "chapters": [
    {
      "title": "Название главы",
      "content": "Текст главы (3-5 абзацев)",
      "highlights": ["Ключевой момент 1", "Ключевой момент 2"]
    }
  ],
  "epilogue": "Заключение (2-3 абзаца)",
  "dedication": "Посвящение (опционально)"
}

Используй данные записей для создания связного повествования. Отвечай ТОЛЬКО валидным JSON.`;

		const userPrompt = `Период: ${new Date(periodStart).toLocaleDateString('ru-RU')} - ${new Date(periodEnd).toLocaleDateString('ru-RU')}
Дневник: ${diaryName || 'Мой дневник'} ${diaryEmoji || '📝'}

Статистика:
- Записей: ${stats.totalEntries}
- Достижений: ${stats.achievements}
- Позитивных: ${stats.positiveEntries}
- Категории: ${stats.categories.join(', ')}

Записи (summary):
${entriesSummary.map((e) => `${e.date}: ${e.summary}`).join('\n')}

Создай вдохновляющую книгу.`;

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

		// Log OpenAI usage
		const { prompt_tokens, completion_tokens, total_tokens } = aiResult.usage;
		// GPT-4o-mini pricing: $0.15/1M input tokens, $0.60/1M output tokens (33x cheaper than gpt-4o!)
		const estimatedCost = (prompt_tokens * 0.15) / 1000000 + (completion_tokens * 0.6) / 1000000;

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
