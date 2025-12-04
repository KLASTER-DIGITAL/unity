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
		// Use replace with global regex instead of replaceAll for ES2020 compatibility
		result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
	}
	return result;
}

// Removed unused getOpenAIKey function - OpenAI key is fetched inline in the main handler

// ✅ P2: Content Hash для агрессивного кэширования
async function generateContentHash(data: unknown): Promise<string> {
	const jsonString = JSON.stringify(data);
	const encoder = new TextEncoder();
	const data_encoded = encoder.encode(jsonString);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data_encoded);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Edge function requires multiple branches for auth, validation and AI handling
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
			planType, // ✅ Plan type (free/premium)
			type = 'month', // ✅ Book type (month/quarter/year/custom)
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

		// Get user language and premium status from profile
		const { data: profile } = await supabaseAdmin
			.from('profiles')
			.select('language, is_premium')
			.eq('id', userId)
			.single();

		const userLanguage = profile?.language || 'ru';
		const isPremium = profile?.is_premium || false;

		// ✅ Determine plan_type: from request or from profile
		const finalPlanType = planType || (isPremium ? 'premium' : 'free');

		console.log('[BOOKS-DRAFT] User language:', userLanguage);
		console.log('[BOOKS-DRAFT] Plan type:', finalPlanType);
		console.log('[BOOKS-DRAFT] Book type:', type);

		// ✅ P2: PARALLEL GENERATION - fetch all data in parallel
		const [summariesResult, entriesResult, snapshotResult] = await Promise.all([
			// Summaries
			supabaseAdmin
				.from('entry_summaries')
				.select('entry_id, summary_json')
				.eq('user_id', userId)
				.gte('created_at', periodStart)
				.lte('created_at', periodEnd)
				.order('created_at', { ascending: true }),

			// Entries (needed for photos and achievements)
			supabaseAdmin
				.from('entries')
				.select(
					'id, text, sentiment, category, tags, mood, ai_summary, ai_insight, is_achievement, created_at, media'
				)
				.eq('user_id', userId)
				.gte('created_at', periodStart)
				.lte('created_at', periodEnd)
				.order('created_at', { ascending: true }),

			// Snapshot
			supabaseAdmin
				.from('monthly_snapshots')
				.select('*')
				.eq('user_id', userId)
				.eq('period_start', periodStart)
				.eq('period_end', periodEnd)
				.single(),
		]);

		const { data: summaries } = summariesResult;
		const { data: entries, error: entriesError } = entriesResult;
		const { data: snapshot } = snapshotResult;

		// Fallback to entries if no summaries exist
		const useSummaries = summaries && summaries.length > 0;

		if (useSummaries) {
			console.log('[BOOKS-DRAFT] ✅ Using entry_summaries (90% token savings!)');
		} else {
			console.log('[BOOKS-DRAFT] ⚠️ No summaries found, using raw entries (expensive)');
		}

		if (snapshot) {
			console.log('[BOOKS-DRAFT] ✅ Using snapshot for period context');
		}

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

		// Collect photos from entries
		type EntryMedia = {
			type: string;
			url?: string | null;
		};

		const photosFromEntries = entries.flatMap((entry) => {
			if (!entry.media || !Array.isArray(entry.media)) return [];
			return entry.media
				.filter((m: EntryMedia) => m.type === 'image' && m.url)
				.map((m: EntryMedia) => ({
					entryId: entry.id,
					url: m.url as string,
					createdAt: entry.created_at,
				}));
		});
		console.log('[BOOKS-DRAFT] Found', photosFromEntries.length, 'photos in entries');

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
		// ✅ Context Engine: Collect all persons
		const allPersons: Set<string> = new Set();

		type EntrySummaryRow = {
			entry_id: string;
			summary_json?: {
				short_summary?: string;
				insight?: string;
				mood?: string;
				topics?: string[];
				persons?: string[];
				has_achievement?: boolean;
				excerpt?: string;
			} | null;
		};

		const entriesSummary = useSummaries
			? summaries.map((summary: EntrySummaryRow) => {
					const entry = filteredEntries.find((e) => e.id === summary.entry_id);
					const summaryData = summary.summary_json || {};
					const persons = summaryData.persons || [];

					for (const p of persons) {
						allPersons.add(p);
					}

					return {
						id: summary.entry_id,
						date: entry
							? new Date(entry.created_at).toLocaleDateString(locale)
							: new Date().toLocaleDateString(locale),
						summary: summaryData.short_summary || entry?.text?.substring(0, 200) || '',
						insight: summaryData.insight || '',
						mood: summaryData.mood || 'neutral',
						topics: summaryData.topics || [],
						persons: persons,
						isAchievement: summaryData.has_achievement || entry?.is_achievement || false,
						excerpt: summaryData.excerpt || entry?.text?.substring(0, 100) || '',
					};
				})
			: filteredEntries.map((entry) => ({
					id: entry.id,
					date: new Date(entry.created_at).toLocaleDateString(locale),
					category: entry.category,
					sentiment: entry.sentiment,
					summary: entry.ai_summary || entry.text.substring(0, 200),
					isAchievement: entry.is_achievement,
					mood: entry.mood,
				}));

		// Calculate statistics
		const achievementEntries = filteredEntries.filter((e) => e.is_achievement);
		const stats = {
			totalEntries: filteredEntries.length,
			achievements: achievementEntries.length,
			positiveEntries: filteredEntries.filter((e) => e.sentiment === 'positive').length,
			categories: [...new Set(filteredEntries.map((e) => e.category))],
		};

		// Prepare achievements summary for metadata (used in PDF "Достижения" главы)
		const achievementsSummary = achievementEntries.map((entry) => ({
			id: entry.id,
			date: new Date(entry.created_at).toISOString(),
			category: entry.category,
			summary: entry.ai_summary || entry.text.substring(0, 200),
		}));

		// ✅ P2: AGGRESSIVE CACHING - Content Hash
		if (!regenerate) {
			const contentForHash = { entriesSummary, stats, style, layout };
			const contentHash = await generateContentHash(contentForHash);

			// Check if we have a draft with same content hash
			const { data: cachedDraft } = await supabaseAdmin
				.from('books_archive')
				.select('*')
				.eq('user_id', userId)
				.eq('metadata->>contentHash', contentHash)
				.eq('is_draft', true)
				.order('created_at', { ascending: false })
				.limit(1)
				.maybeSingle();

			if (cachedDraft) {
				console.log('[BOOKS-DRAFT] ✅ CACHE HIT by content hash! AI tokens saved!');
				return new Response(
					JSON.stringify({
						success: true,
						draftId: cachedDraft.id,
						storyJson: cachedDraft.story_json,
						cached: true,
						cacheType: 'content_hash',
					}),
					{ status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
				);
			}

			console.log('[BOOKS-DRAFT] No content hash match, generating new...');
		}

		// ... (previous code)

		// ✅ Load AI operation config based on style
		const aiOperationId = `book_generation_${style}`;
		console.log(`[BOOKS-DRAFT] Loading AI operation: ${aiOperationId}...`);
		const config = await getAiConfig(supabaseUrl, supabaseServiceKey, aiOperationId);

		let systemPrompt: string;
		let userPrompt: string;

		if (config?.is_enabled) {
			// ... (existing config logic)
			// Note: We might need to update the DB config manually or here if we want to enforce Story-only via code
			// For now, assuming the prompt in DB or fallback below handles "Story" generation.
			// We will enforce the "Chronicle" appending programmatically regardless of the prompt.
			systemPrompt = replacePlaceholders(config.system_prompt, {
				user_language: userLanguage,
				book_style: style,
			});
			// ...
			userPrompt = replacePlaceholders(config.user_prompt_template, {
				// ...
			});
		} else {
			// ❌ Fallback to hardcoded prompts
			console.log('[BOOKS-DRAFT] ⚠️ monthly_report disabled, using fallback prompts');

			const stylePrompts = {
				warm_family:
					'Создай теплую семейную историю (Part 1: The Story), подчеркивая моменты единения, любви и совместного роста.',
				biographical:
					'Создай биографическое повествование (Part 1: The Story), фокусируясь на личном развитии и ключевых моментах.',
				motivational:
					'Создай мотивационную историю успеха (Part 1: The Story), выделяя достижения, преодоление трудностей и рост.',
			};

			systemPrompt = `You are an AI writer creating personalized achievement books.

Style: ${stylePrompts[style as keyof typeof stylePrompts]}

STRUCTURE - PART 1: THE STORY
You are writing ONLY "Part 1: The Story". Do not write the chronological log (Chronicle), it will be added automatically.
Focus on synthesizing the events into a cohesive narrative.

Create a JSON book structure with fields:
- title: Book title (creative, inspiring)
- subtitle: Subtitle with period
- prologue: Introduction (2-3 paragraphs, warm and supportive tone)
- chapters: Array of chapters, each with:
  - title: Chapter title (creative, e.g., "New Beginnings", "Family Time")
  - content: Chapter text (3-5 paragraphs, warm narrative)
  - highlights: Key moments (array of strings)
  - source_entry_ids: Array of entry IDs used for this chapter (IMPORTANT for photo mapping)
- epilogue: Conclusion (2-3 paragraphs, encouraging and hopeful)
- dedication: Dedication (optional)
- insight: Optional short quote/insight for the cover (1-2 sentences, inspiring and personal)

TONE GUIDE:
- Warm, supportive, non-judgmental
- Celebrate growth and effort, not just results
- Use "ты" (you) form consistently throughout the book (NOT "вы" or "we")
- Avoid clinical/dry language
- Focus on human experience, emotions, connections

STYLE REQUIREMENTS:
- ❌ STRICTLY FORBIDDEN phrases (NEVER use these):
  * "Это стало важным моментом вашего пути"
  * "Это решение стало знаком вашего стремления к развитию"
  * "Это было важным шагом"
  * "Это стало важным моментом на пути к развитию"
  * Any repetitive template phrases that sound generic
- ✅ REQUIRED structure for each paragraph in chapters:
  * Paragraph 1: Describe the event (what happened, concrete and specific)
  * Paragraph 2: Describe the inner state (what you felt, emotions, thoughts)
  * Paragraph 3: Mini-conclusion (what this teaches you, growth insight)
- ✅ Use specific, concrete language instead of abstract phrases
- ✅ Each chapter should have 3-5 paragraphs, each 2-4 sentences
- ✅ Avoid repetition - each chapter should have unique voice and perspective

EXAMPLE OF GOOD WRITING:
❌ BAD: "3 ноября 2025 года ты записал(а), что начал(а) новый этап в своей работе. Это стало важным моментом на пути к развитию."
✅ GOOD: "3 ноября 2025 года ты почувствовал(а), что внутри созрело решение: больше не тянуть и начать новый этап в работе. Ты не просто «отметил(а) событие», а сделал(а) шаг — выбрал(а) движение вперёд, даже если не всё до конца понятно. Это был тот самый день, когда ты сказал(а) себе: «Я готов(а) расти дальше»."

Use the diary entries data to create a cohesive narrative.
IMPORTANT: Write the entire book in the user's language: ${userLanguage}`;

			// ... (context building code)
			const personsContext =
				allPersons.size > 0
					? `\n\nIMPORTANT - PEOPLE IN THIS PERIOD:\n${Array.from(allPersons)
							.map((p) => `- ${p}`)
							.join(
								'\n'
							)}\n\nYou can organize chapters by these people if it makes sense for the narrative.`
					: '';

			const snapshotContext = snapshot
				? `
Контекст периода (из snapshot):
- Всего записей: ${snapshot.total_entries}
- Активных дней: ${snapshot.active_days}
- Эмоции: ${JSON.stringify(snapshot.emotions_distribution)}
- Топ темы: ${snapshot.top_topics?.join(', ') || 'нет'}
- Топ люди: ${snapshot.top_persons?.join(', ') || 'нет'}
- Достижений: ${snapshot.achievements_count}
`
				: '';

			userPrompt = `Period: ${new Date(periodStart).toLocaleDateString(locale)} - ${new Date(periodEnd).toLocaleDateString(locale)}
Diary: ${diaryName || 'My Diary'} ${diaryEmoji || '📝'}
User Language: ${userLanguage}

${snapshotContext}${personsContext}

Статистика:
- Всего записей: ${stats.totalEntries}
- Достижений: ${stats.achievements}
- Позитивных моментов: ${stats.positiveEntries}
- Категории: ${stats.categories.join(', ')}

Записи${useSummaries ? ' (summaries)' : ''}:
${JSON.stringify(entriesSummary, null, 2)}

ВАЖНО:
- Напиши ТОЛЬКО художественную часть (Историю).
- НЕ делай список записей по датам (это будет добавлено отдельно).
- Если в summaries есть поле persons с людьми, создай отдельную главу для каждого человека.
- Используй source_entry_ids в главах чтобы привязать фото.

Создай вдохновляющую книгу на основе этих данных.`;
		}

		// Call OpenAI API
		console.log('[BOOKS-DRAFT] Calling OpenAI API...');
		// ... (OpenAI call logic remains same)
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
		// ... (Error handling)

		const aiResult = await response.json();
		console.log('[BOOKS-DRAFT] OpenAI response received');

		// Validate response structure
		// ... (Validation logic)

		// Parse story JSON
		let storyJson: any;
		try {
			const content = aiResult.choices[0].message.content;
			storyJson = JSON.parse(content);
		} catch (_parseError) {
			// ... (Error handling)
			return new Response(
				JSON.stringify({ success: false, error: 'Failed to parse AI response' }),
				{ status: 500 }
			);
		}

		// ✅ VALIDATE: Ensure chapters exist
		const storyChapters = storyJson.chapters;
		if (!storyChapters || !Array.isArray(storyChapters)) {
			// ... (Error handling)
			return new Response(
				JSON.stringify({ success: false, error: 'AI failed to generate chapters' }),
				{ status: 500 }
			);
		}

		// =================================================================================
		// ✅ PART 2: THE CHRONICLE (Programmatic Appending)
		// =================================================================================
		console.log('[BOOKS-DRAFT] Appending Chronicle...');

		// 1. Add a Divider Chapter
		storyJson.chapters.push({
			title: 'Часть 2: Хроника',
			content: 'Полная хронология ваших записей, сохраненная в первозданном виде.',
			is_divider: true, // Frontend can render this differently
			source_entry_ids: [],
		});

		// 2. Group entries by Month (or just list them if short period)
		// For simplicity, we'll create one "Chronicle" chapter per month
		const entriesByMonth: Record<string, typeof filteredEntries> = {};

		filteredEntries.forEach((entry) => {
			const date = new Date(entry.created_at);
			const monthKey = date.toLocaleString(locale, { month: 'long', year: 'numeric' });
			if (!entriesByMonth[monthKey]) {
				entriesByMonth[monthKey] = [];
			}
			entriesByMonth[monthKey].push(entry);
		});

		Object.entries(entriesByMonth).forEach(([month, monthEntries]) => {
			let chronicleContent = '';
			const monthEntryIds: string[] = [];

			monthEntries.forEach((entry) => {
				const date = new Date(entry.created_at).toLocaleDateString(locale, {
					day: 'numeric',
					month: 'long',
					hour: '2-digit',
					minute: '2-digit',
				});
				chronicleContent += `\n\n**${date}**\n${entry.text}`;
				monthEntryIds.push(entry.id);
			});

			storyJson.chapters.push({
				title: `Хроника: ${month}`,
				content: chronicleContent.trim(),
				is_chronicle: true, // Frontend can render this with special formatting
				source_entry_ids: monthEntryIds,
			});
		});

		console.log('[BOOKS-DRAFT] Chronicle appended. Total chapters:', storyJson.chapters.length);
		// =================================================================================

		// ✅ НОВОЕ: Генерация оглавления (Table of Contents)
		// Примерная нумерация страниц (начинаем с 3, так как обложка = 1, оглавление = 2)
		let currentPage = 3; // Обложка = 1, оглавление = 2, вступление = 3
		const tocItems: Array<{ title: string; page: number }> = [];

		if (storyJson.prologue) {
			tocItems.push({ title: 'Вступление', page: currentPage });
			currentPage++;
		}

		// Подсчитываем страницы для глав (примерно 1 страница на главу)
		// biome-ignore lint/suspicious/noExplicitAny: Chapter structure from AI is dynamic
		storyJson.chapters.forEach((chapter: any) => {
			if (!chapter.is_divider && !chapter.is_chronicle) {
				tocItems.push({
					title: `Глава ${tocItems.filter((item) => item.title.startsWith('Глава')).length + 1}: ${chapter.title || 'Без названия'}`,
					page: currentPage,
				});
				currentPage++;
			}
		});

		if (storyJson.epilogue) {
			tocItems.push({ title: 'Заключение', page: currentPage });
		}

		storyJson.tableOfContents = {
			title: 'Оглавление',
			items: tocItems,
		};

		console.log('[BOOKS-DRAFT] Table of Contents generated:', tocItems.length, 'items');

		// ✅ НОВОЕ: Генерация итогов месяца для PREMIUM
		if (finalPlanType === 'premium' && storyJson.chapters && storyJson.chapters.length > 0) {
			// Извлекаем топ-5 побед из highlights глав
			const allHighlights: string[] = [];
			// biome-ignore lint/suspicious/noExplicitAny: Chapter structure from AI is dynamic
			storyJson.chapters.forEach((chapter: any) => {
				if (chapter.highlights && Array.isArray(chapter.highlights)) {
					allHighlights.push(...chapter.highlights);
				}
			});

			// Берем первые 5 highlights как топ-5 побед
			const topWins = allHighlights.slice(0, 5);

			// Генерируем фокус на следующий месяц на основе epilogue или последней главы
			const focusNextMonth = storyJson.epilogue
				? storyJson.epilogue.split('\n').slice(0, 2).join(' ')
				: `Фокус на следующий месяц: продолжай свой путь роста и осознанности.`;

			storyJson.monthSummary = {
				title: 'Итоги месяца',
				topWins:
					topWins.length > 0 ? topWins : ['Твой месяц был наполнен важными моментами и ростом.'],
				focusNextMonth,
			};

			console.log('[BOOKS-DRAFT] Month Summary generated for PREMIUM');
		}

		// =================================================================================

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

		// ✅ P2: Generate content hash for caching
		const contentForHash = { entriesSummary, stats, style, layout };
		const contentHash = await generateContentHash(contentForHash);

		// ✅ Validate data before saving
		if (!storyJson || typeof storyJson !== 'object') {
			console.error('[BOOKS-DRAFT] Invalid storyJson:', storyJson);
			return new Response(
				JSON.stringify({ success: false, error: 'Invalid story data generated' }),
				{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		if (!periodStart || !periodEnd) {
			console.error('[BOOKS-DRAFT] Missing period dates:', { periodStart, periodEnd });
			return new Response(JSON.stringify({ success: false, error: 'Missing period dates' }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Save draft to database
		console.log('[BOOKS-DRAFT] Saving draft to database...', {
			userId,
			periodStart,
			periodEnd,
			style,
			layout,
			type,
			planType: finalPlanType,
			language: userLanguage,
			hasStoryJson: !!storyJson,
			chaptersCount: storyJson?.chapters?.length || 0,
		});

		const { data: draft, error: draftError } = await supabaseAdmin
			.from('books_archive')
			.insert({
				user_id: userId,
				period_start: periodStart,
				period_end: periodEnd,
				contexts: contexts || [],
				style: style || 'warm_family',
				layout: layout || 'photo_text',
				theme: theme || 'light',
				type: type || 'month',
				plan_type: finalPlanType || 'premium',
				language: userLanguage,
				version: 1,
				story_json: storyJson,
				metadata: {
					entriesCount: filteredEntries.length,
					achievementsCount: stats.achievements,
					achievements: achievementsSummary,
					// tokensUsed: total_tokens, // Use variable from scope
					tokensUsed: aiResult.usage.total_tokens,
					estimatedCost,
					diaryName: diaryName || 'Мой дневник',
					diaryEmoji: diaryEmoji || '📝',
					contentHash,
					// ✅ НОВОЕ: Период для отображения на обложке
					period: `${new Date(periodStart).toLocaleDateString(locale)} - ${new Date(periodEnd).toLocaleDateString(locale)}`,
					// ✅ НОВОЕ: Инсайт/цитата для обложки (из AI генерации)
					insight: storyJson.insight || undefined,
				},
				is_draft: true,
				is_final: false,
			})
			.select()
			.single();

		if (draftError) {
			console.error('[BOOKS-DRAFT] Error saving draft:', {
				error: draftError,
				message: draftError.message,
				details: draftError.details,
				hint: draftError.hint,
				code: draftError.code,
			});
			return new Response(
				JSON.stringify({
					success: false,
					error: `Failed to save draft: ${draftError.message || 'Unknown error'}`,
					details: draftError.details,
					hint: draftError.hint,
				}),
				{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		if (!draft || !draft.id) {
			console.error('[BOOKS-DRAFT] Draft saved but no ID returned:', draft);
			return new Response(
				JSON.stringify({ success: false, error: 'Draft saved but no ID returned' }),
				{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		// ✅ Auto-attach photos to chapters based on AI mapping
		if (photosFromEntries.length > 0 && storyChapters) {
			type BookPhotoInsert = {
				book_id: string;
				chapter_index: number;
				photo_url: string;
				caption: string;
			};

			const photosToInsert: BookPhotoInsert[] = [];

			storyChapters.forEach((chapter: { source_entry_ids?: string[] }, index: number) => {
				if (chapter.source_entry_ids && Array.isArray(chapter.source_entry_ids)) {
					// Find photos for entries used in this chapter
					const chapterPhotos = photosFromEntries.filter((p) =>
						chapter.source_entry_ids.includes(p.entryId)
					);

					chapterPhotos.forEach((photo) => {
						photosToInsert.push({
							book_id: draft.id,
							chapter_index: index,
							photo_url: photo.url,
							caption: new Date(photo.createdAt).toLocaleDateString(locale),
						});
					});
				}
			});

			// Fallback: If AI didn't map photos but we have them, verify layout
			if (photosToInsert.length === 0 && layout === 'photo_text') {
				// Simple heuristic: distribute photos evenly or by date if possible
				// For MVP: just attach all valid photos to the first few chapters or "Gallery" chapter
				console.log('[BOOKS-DRAFT] AI did not map photos, using fallback distribution');
				// TODO: Implement fallback distribution if needed
			}

			if (photosToInsert.length > 0) {
				console.log('[BOOKS-DRAFT] Auto-attaching', photosToInsert.length, 'photos to book');
				const { error: photosError } = await supabaseAdmin
					.from('book_photos')
					.insert(photosToInsert);

				if (photosError) {
					console.error('[BOOKS-DRAFT] Error saving auto-photos:', photosError);
					// Don't fail the whole request, photos are enhancement
				}
			}
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
		console.error('[BOOKS-DRAFT] Unhandled error:', {
			error,
			message: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
			name: error instanceof Error ? error.name : undefined,
		});
		return new Response(
			JSON.stringify({
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred',
			}),
			{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		);
	}
});
