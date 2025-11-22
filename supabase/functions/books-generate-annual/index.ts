/**
 * Books Generate Annual API
 *
 * Generates annual book from 12 monthly reports using user_reports data.
 *
 * Endpoint:
 * - POST /books-generate-annual - Generate annual book
 *
 * Request body:
 * {
 *   userId: string,
 *   year: number (e.g. 2025),
 *   style: 'warm_family' | 'biographical' | 'motivational',
 *   layout: 'photo_text' | 'text_only' | 'minimal',
 *   theme: 'light' | 'dark',
 *   diaryName?: string,
 *   diaryEmoji?: string
 * }
 *
 * @author UNITY Team
 * @date 2025-11-21
 * @version 1.0
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import {
	getAiOperationConfig,
	isOperationAvailable,
	replacePlaceholders,
} from '../_shared/ai/getAiOperationConfig.ts';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function resolveOpenAiKey(req: Request, supabaseAdmin: any): Promise<string | null> {
	const headerKey = req.headers.get('X-OPENAI-KEY') ?? req.headers.get('x-openai-key');
	if (headerKey) return headerKey;

	const { data: setting } = await supabaseAdmin
		.from('admin_settings')
		.select('value')
		.eq('key', 'openai_api_key')
		.single();

	if (setting?.value) return setting.value;

	const envKey = Deno.env.get('OPENAI_API_KEY');
	return envKey || null;
}

Deno.serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
		const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
		const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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

		// Check Premium status
		const { data: profile } = await supabaseAdmin
			.from('profiles')
			.select('is_premium, language, name')
			.eq('id', user.id)
			.single();

		if (!profile?.is_premium) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Premium subscription required',
					message: 'Годовая книга доступна только в Premium-подписке.',
				}),
				{ status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		const body = await req.json();
		const {
			userId,
			year,
			style = 'warm_family',
			layout = 'text_only',
			theme = 'light',
			diaryName,
			diaryEmoji,
		} = body;

		if (user.id !== userId) {
			return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
				status: 403,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		const userLanguage = profile.language || 'ru';
		const userName = profile.name || 'User';

		console.log('[BOOKS-ANNUAL] Generating annual book for year:', year);

		// Load 12 monthly reports for the year
		const monthlyReports: any[] = [];
		for (let month = 1; month <= 12; month++) {
			const periodKey = `${year}-${String(month).padStart(2, '0')}`;
			const { data: report, error: reportError } = await supabaseAdmin
				.from('user_reports')
				.select('*')
				.eq('user_id', userId)
				.eq('period_type', 'monthly')
				.eq('period_key', periodKey)
				.eq('language', userLanguage)
				.single();

			if (!reportError && report) {
				monthlyReports.push(report);
			}
		}

		if (monthlyReports.length === 0) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'No monthly reports found',
					message: `Не найдено месячных отчетов за ${year} год. Сначала создайте отчеты за каждый месяц.`,
				}),
				{ status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		console.log(`[BOOKS-ANNUAL] Found ${monthlyReports.length} monthly reports`);

		// Aggregate statistics
		const totalEntries = monthlyReports.reduce((sum, r) => sum + (r.stats?.total_entries || 0), 0);
		const totalAchievements = monthlyReports.reduce(
			(sum, r) => sum + (Array.isArray(r.stats?.achievements) ? r.stats.achievements.length : 0),
			0
		);

		// Prepare monthly summaries for AI
		const monthlySummaries = monthlyReports.map((report, index) => {
			const month = index + 1;
			const stats = report.stats || {};
			const aiInsights = report.ai_insights || {};
			return {
				month,
				monthName: new Date(year, month - 1, 1).toLocaleDateString(
					userLanguage === 'ru' ? 'ru-RU' : 'en-US',
					{
						month: 'long',
					}
				),
				entries: stats.total_entries || 0,
				achievements: Array.isArray(stats.achievements) ? stats.achievements.length : 0,
				summary: report.ai_summary || '',
				insights: aiInsights.insights || [],
				keyAchievements: aiInsights.key_achievements || [],
			};
		});

		// Load AI operation config for annual book
		// Try annual_book first, fallback to monthly_report if not available
		let config = await getAiOperationConfig(supabaseAdmin as any, 'annual_book');
		if (!config || !isOperationAvailable(config)) {
			console.log('[BOOKS-ANNUAL] annual_book operation not found, using monthly_report');
			config = await getAiOperationConfig(supabaseAdmin as any, 'monthly_report');
		}

		if (!isOperationAvailable(config)) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'AI operation disabled',
					message: 'AI операции временно недоступны',
				}),
				{ status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		// Get OpenAI key
		const openaiKey = await resolveOpenAiKey(req, supabaseAdmin);
		if (!openaiKey) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'OpenAI API key not configured',
					message: 'OpenAI API ключ не настроен',
				}),
				{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		// Prepare AI prompt for annual book
		const stylePrompts = {
			warm_family:
				'Создай теплую семейную историю года, подчеркивая моменты единения, любви и совместного роста.',
			biographical:
				'Создай биографическое повествование года, фокусируясь на личном развитии и ключевых моментах.',
			motivational:
				'Создай мотивационную историю успеха года, выделяя достижения, преодоление трудностей и рост.',
		};

		const systemPrompt = `You are an AI writer creating an annual achievement book.

Style: ${stylePrompts[style as keyof typeof stylePrompts]}

Create a JSON book structure with fields:
- title: Book title (creative, inspiring, about the year)
- subtitle: Subtitle with year
- prologue: Introduction (3-4 paragraphs about the year)
- chapters: Array of 12 chapters (one per month), each with:
  - title: Chapter title (month name + key theme)
  - content: Chapter text (4-6 paragraphs summarizing the month)
  - highlights: Key moments from the month (array of strings)
- epilogue: Conclusion (3-4 paragraphs summarizing the year and looking forward)

Use the monthly summaries to create a cohesive narrative that flows through the year.
IMPORTANT: Write the entire book in the user's language: ${userLanguage}`;

		const userPrompt = `Год: ${year}
Пользователь: ${userName}
Всего записей за год: ${totalEntries}
Всего достижений за год: ${totalAchievements}

Данные по месяцам:
${JSON.stringify(monthlySummaries, null, 2)}

Создай годовую книгу достижений, объединяя все месяцы в единое повествование.`;

		// Call OpenAI API
		console.log('[BOOKS-ANNUAL] Calling OpenAI API...');
		const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${openaiKey}`,
			},
			body: JSON.stringify({
				model: config.model || 'gpt-4o-mini',
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt },
				],
				temperature: config.temperature || 0.7,
				max_tokens: config.max_tokens || 3000,
				response_format: { type: 'json_object' },
			}),
		});

		if (!openaiResponse.ok) {
			const errorText = await openaiResponse.text();
			console.error('[BOOKS-ANNUAL] OpenAI API error:', errorText);
			return new Response(
				JSON.stringify({
					success: false,
					error: 'AI generation failed',
					message: 'Не удалось сгенерировать книгу. Попробуйте позже.',
				}),
				{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		const openaiData = await openaiResponse.json();
		const aiResponse = openaiData.choices?.[0]?.message?.content;

		if (!aiResponse) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Empty AI response',
					message: 'AI не вернул ответ',
				}),
				{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		// Parse AI response
		let storyJson: any;
		try {
			storyJson = JSON.parse(aiResponse);
		} catch {
			// Fallback if not JSON
			storyJson = {
				title: `Мой ${year} год`,
				subtitle: `Годовая книга достижений за ${year}`,
				prologue: aiResponse,
				chapters: monthlySummaries.map((m) => ({
					title: m.monthName,
					content: m.summary || `Месяц ${m.month}`,
					highlights: m.keyAchievements || [],
				})),
				epilogue: `Это был ${year} год.`,
			};
		}

		// Calculate period dates
		const periodStart = `${year}-01-01`;
		const periodEnd = `${year}-12-31`;

		// Save annual book to books_archive
		// ✅ Use plan_type: 'premium', type: 'year', language from profile
		const { data: draft, error: draftError } = await supabaseAdmin
			.from('books_archive')
			.insert({
				user_id: userId,
				period_start: periodStart,
				period_end: periodEnd,
				contexts: [], // Annual book includes all contexts
				style,
				layout,
				theme,
				plan_type: 'premium', // ✅ Annual books are always Premium
				type: 'year', // ✅ Annual book type
				language: userLanguage, // ✅ User's language
				story_json: {
					...storyJson,
					metadata: {
						type: 'annual',
						year,
						monthlyReportsCount: monthlyReports.length,
						totalEntries,
						totalAchievements,
					},
				},
				metadata: {
					entriesCount: totalEntries,
					achievementsCount: totalAchievements,
					monthlyReportsCount: monthlyReports.length,
					diaryName: diaryName || 'Мой дневник',
					diaryEmoji: diaryEmoji || '📖',
					year,
					type: 'annual',
				},
				is_draft: true,
				is_final: false,
			})
			.select()
			.single();

		if (draftError) {
			console.error('[BOOKS-ANNUAL] Error saving draft:', draftError);
			return new Response(JSON.stringify({ success: false, error: 'Failed to save draft' }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		console.log('[BOOKS-ANNUAL] Annual book draft saved:', draft.id);

		return new Response(
			JSON.stringify({
				success: true,
				draftId: draft.id,
				storyJson,
				estimatedPages: Math.ceil(totalEntries / 10),
				monthlyReportsCount: monthlyReports.length,
			}),
			{ status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		);
	} catch (error: any) {
		console.error('[BOOKS-ANNUAL] Error:', error);
		return new Response(
			JSON.stringify({
				success: false,
				error: error?.message || 'Unknown error',
				message: 'Произошла ошибка при создании годовой книги',
			}),
			{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		);
	}
});
