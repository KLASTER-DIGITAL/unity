// 🚀 MOTIVATIONS MICROSERVICE v11 - AI-POWERED CARDS
// Purpose: Generate motivation cards using AI operations from database
// Architecture: Pure Deno.serve() with REST API + AI Control Center integration
// Status: PRODUCTION - AI-powered card generation

console.log('[MOTIVATIONS v11] 🚀 Starting microservice (AI-powered)...');

// ======================
// ENVIRONMENT VARIABLES
// ======================

function getEnvVars() {
	const supabaseUrl = Deno.env.get('SUPABASE_URL');
	const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

	if (!(supabaseUrl && supabaseServiceKey)) {
		throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
	}

	return { supabaseUrl, supabaseServiceKey };
}

console.log('[MOTIVATIONS v11] ✅ Environment ready');

// ======================
// AI OPERATIONS HELPERS
// ======================

interface AIOperationConfig {
	id: string;
	group_name: string;
	display_name: string;
	description: string;
	model: string;
	max_tokens: number;
	temperature: number;
	system_prompt: string;
	user_prompt_template: string;
	is_enabled: boolean;
	extra_config: Record<string, unknown>;
}

/**
 * Load AI operation config from database
 */
async function getAiOperationConfig(
	supabaseUrl: string,
	supabaseServiceKey: string,
	operationId: string
): Promise<AIOperationConfig | null> {
	try {
		const response = await fetch(
			`${supabaseUrl}/rest/v1/ai_operations?id=eq.${operationId}&select=*`,
			{
				headers: {
					apikey: supabaseServiceKey,
					Authorization: `Bearer ${supabaseServiceKey}`,
					'Content-Type': 'application/json',
				},
			}
		);

		if (!response.ok) {
			console.error(`[AI-CONFIG] Failed to fetch config for ${operationId}:`, response.status);
			return null;
		}

		const data = await response.json();
		if (!data || data.length === 0) {
			console.error(`[AI-CONFIG] No config found for ${operationId}`);
			return null;
		}

		return data[0];
	} catch (error) {
		console.error(`[AI-CONFIG] Error fetching config for ${operationId}:`, error);
		return null;
	}
}

/**
 * Replace placeholders in prompt template
 */
function replacePlaceholders(template: string, variables: Record<string, string>): string {
	let result = template;
	for (const [key, value] of Object.entries(variables)) {
		const placeholder = `{{${key}}}`;
		result = result.replaceAll(placeholder, value);
	}
	return result;
}

/**
 * Check if AI operation is available
 */
function isOperationAvailable(config: AIOperationConfig | null): boolean {
	return config !== null && config.is_enabled === true;
}

/**
 * Get OpenAI API key from admin_settings or env
 */
async function getOpenAIKey(
	supabaseUrl: string,
	supabaseServiceKey: string
): Promise<string | null> {
	try {
		const response = await fetch(
			`${supabaseUrl}/rest/v1/admin_settings?key=eq.openai_api_key&select=value`,
			{
				headers: {
					apikey: supabaseServiceKey,
					Authorization: `Bearer ${supabaseServiceKey}`,
					'Content-Type': 'application/json',
				},
			}
		);

		if (response.ok) {
			const data = await response.json();
			if (data && data.length > 0 && data[0].value) {
				console.log('[MOTIVATIONS v11] ✅ Using OpenAI key from admin_settings');
				return data[0].value;
			}
		}
	} catch (error) {
		console.error('[MOTIVATIONS v11] Error fetching OpenAI key from DB:', error);
	}

	// Fallback to env variable
	const envKey = Deno.env.get('OPENAI_API_KEY');
	if (envKey) {
		console.log('[MOTIVATIONS v11] ⚠️ Using OpenAI key from env variable (fallback)');
		return envKey;
	}

	console.error('[MOTIVATIONS v11] ❌ No OpenAI API key found');
	return null;
}

console.log('[MOTIVATIONS v11] ✅ AI helpers ready');

/**
 * Generate progress card using AI operation progress_card
 */
async function generateProgressCard(
	userId: string,
	userLanguage: string,
	supabaseUrl: string,
	supabaseServiceKey: string
): Promise<{ title: string; body: string; optional_step: string } | null> {
	try {
		// Load AI operation config
		const config = await getAiOperationConfig(supabaseUrl, supabaseServiceKey, 'progress_card');

		if (!isOperationAvailable(config)) {
			console.log('[MOTIVATIONS v11] ⚠️ progress_card operation disabled');
			return null;
		}

		// Get OpenAI API key
		const openaiApiKey = await getOpenAIKey(supabaseUrl, supabaseServiceKey);
		if (!openaiApiKey) {
			console.error('[MOTIVATIONS v11] ❌ No OpenAI API key');
			return null;
		}

		// Fetch user statistics
		// 1. Total active days (days with entries)
		const entriesResponse = await fetch(
			`${supabaseUrl}/rest/v1/entries?user_id=eq.${userId}&select=created_at`,
			{
				headers: {
					apikey: supabaseServiceKey,
					Authorization: `Bearer ${supabaseServiceKey}`,
					'Content-Type': 'application/json',
				},
			}
		);

		if (!entriesResponse.ok) {
			console.error('[MOTIVATIONS v11] ❌ Failed to fetch entries for progress');
			return null;
		}

		const allEntries = await entriesResponse.json();
		const uniqueDays = new Set(allEntries.map((e: any) => new Date(e.created_at).toDateString()));
		const totalActiveDays = uniqueDays.size;

		// 2. Current streak (consecutive days)
		const today = new Date();
		let currentStreak = 0;
		const checkDate = new Date(today);

		while (true) {
			const dateStr = checkDate.toDateString();
			if (uniqueDays.has(dateStr)) {
				currentStreak++;
				checkDate.setDate(checkDate.getDate() - 1);
			} else {
				break;
			}
		}

		// 3. Longest streak
		let longestStreak = 0;
		let tempStreak = 0;
		const sortedDates = Array.from(uniqueDays)
			.map((d) => new Date(d))
			.sort((a, b) => a.getTime() - b.getTime());

		for (let i = 0; i < sortedDates.length; i++) {
			if (i === 0) {
				tempStreak = 1;
			} else {
				const diff = Math.floor(
					(sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
				);
				if (diff === 1) {
					tempStreak++;
				} else {
					longestStreak = Math.max(longestStreak, tempStreak);
					tempStreak = 1;
				}
			}
		}
		longestStreak = Math.max(longestStreak, tempStreak);

		// 4. Recent categories (last 30 days)
		const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
		const recentEntriesResponse = await fetch(
			`${supabaseUrl}/rest/v1/entries?user_id=eq.${userId}&created_at=gte.${thirtyDaysAgo.toISOString()}&select=category`,
			{
				headers: {
					apikey: supabaseServiceKey,
					Authorization: `Bearer ${supabaseServiceKey}`,
					'Content-Type': 'application/json',
				},
			}
		);

		const recentEntries = await recentEntriesResponse.json();
		const categoryCounts: Record<string, number> = {};
		recentEntries.forEach((e: any) => {
			if (e.category) {
				categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
			}
		});

		const recentCategories = Object.entries(categoryCounts)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 3)
			.map(([cat]) => cat);

		// Replace placeholders in prompts
		const systemPrompt = replacePlaceholders(config.system_prompt, {
			user_language: userLanguage,
		});

		const userPrompt = replacePlaceholders(config.user_prompt_template, {
			user_language: userLanguage,
			total_active_days: String(totalActiveDays),
			streak_days: String(longestStreak),
			current_streak_days: String(currentStreak),
			recent_categories_json: JSON.stringify(recentCategories),
			notable_shifts_json: JSON.stringify([]), // TODO: implement trend analysis
		});

		console.log('[MOTIVATIONS v11] 🤖 Calling OpenAI for progress card...');
		console.log('[MOTIVATIONS v11] Stats:', {
			totalActiveDays,
			currentStreak,
			longestStreak,
			recentCategories,
		});

		// Call OpenAI API
		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${openaiApiKey}`,
			},
			body: JSON.stringify({
				model: config.model,
				temperature: config.temperature,
				max_tokens: config.max_tokens,
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt },
				],
				...(config.extra_config || {}),
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('[MOTIVATIONS v11] ❌ OpenAI API error:', response.status, errorText);
			return null;
		}

		const result = await response.json();
		const content = result.choices[0]?.message?.content;

		if (!content) {
			console.error('[MOTIVATIONS v11] ❌ No content in OpenAI response');
			return null;
		}

		// Parse JSON response
		const cardData = JSON.parse(content);
		console.log('[MOTIVATIONS v11] ✅ Progress card generated:', cardData.title);

		return {
			title: cardData.title || '',
			body: cardData.body || '',
			optional_step: cardData.optional_step || '',
		};
	} catch (error) {
		console.error('[MOTIVATIONS v11] ❌ Error generating progress card:', error);
		return null;
	}
}

/**
 * Generate card using AI operation card_from_entry
 */
async function generateCardWithAI(
	entry: any,
	userLanguage: string,
	supabaseUrl: string,
	supabaseServiceKey: string
): Promise<{ title: string; body: string; optional_step: string } | null> {
	try {
		// Load AI operation config
		const config = await getAiOperationConfig(supabaseUrl, supabaseServiceKey, 'card_from_entry');

		if (!isOperationAvailable(config)) {
			console.log('[MOTIVATIONS v11] ⚠️ card_from_entry operation disabled, using fallback');
			return null;
		}

		// Get OpenAI API key
		const openaiApiKey = await getOpenAIKey(supabaseUrl, supabaseServiceKey);
		if (!openaiApiKey) {
			console.error('[MOTIVATIONS v11] ❌ No OpenAI API key, using fallback');
			return null;
		}

		// Detect card type based on entry
		let cardType = 'generic';
		if (entry.is_achievement) {
			cardType = 'celebrate';
		} else if (entry.sentiment === 'negative') {
			cardType = 'reflect';
		} else if (entry.category === 'goals' || entry.category === 'цели') {
			cardType = 'focus';
		} else if (entry.sentiment === 'positive') {
			cardType = 'gratitude';
		}

		// Replace placeholders in prompts
		const systemPrompt = replacePlaceholders(config.system_prompt, {
			user_language: userLanguage,
		});

		const userPrompt = replacePlaceholders(config.user_prompt_template, {
			user_language: userLanguage,
			card_type: cardType,
			ai_summary: entry.ai_summary || entry.text?.substring(0, 200) || '',
			ai_insight: entry.ai_insight || '',
			sentiment: entry.sentiment || 'neutral',
			mood: entry.mood || '',
			category: entry.category || '',
			tags_json: JSON.stringify(entry.tags || []),
		});

		console.log('[MOTIVATIONS v11] 🤖 Calling OpenAI for card generation...');
		console.log('[MOTIVATIONS v11] Card type:', cardType);

		// Call OpenAI API
		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${openaiApiKey}`,
			},
			body: JSON.stringify({
				model: config.model,
				temperature: config.temperature,
				max_tokens: config.max_tokens,
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt },
				],
				...(config.extra_config || {}),
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('[MOTIVATIONS v11] ❌ OpenAI API error:', response.status, errorText);
			return null;
		}

		const result = await response.json();
		const content = result.choices[0]?.message?.content;

		if (!content) {
			console.error('[MOTIVATIONS v11] ❌ No content in OpenAI response');
			return null;
		}

		// Parse JSON response
		const cardData = JSON.parse(content);
		console.log('[MOTIVATIONS v11] ✅ AI card generated:', cardData.title);

		return {
			title: cardData.title || '',
			body: cardData.body || '',
			optional_step: cardData.optional_step || '',
		};
	} catch (error) {
		console.error('[MOTIVATIONS v11] ❌ Error generating card with AI:', error);
		return null;
	}
}

// ======================
// HELPER FUNCTIONS
// ======================

/**
 * Уникальные градиенты для каждой карточки (вдохновлено hypercolor.dev)
 * Каждая карточка получает свой уникальный градиент на основе индекса
 */
const UNIQUE_GRADIENTS = [
	// 1. Sunset (Закат) - теплые оранжево-розовые тона
	'from-pink-500 via-red-500 to-yellow-500',
	// 2. Oceanic (Океан) - холодные сине-фиолетовые тона
	'from-green-300 via-blue-500 to-purple-600',
	// 3. Cotton Candy (Сахарная вата) - нежные розово-голубые тона
	'from-pink-300 via-purple-300 to-indigo-400',
	// 4. Peachy (Персиковый) - мягкие желто-розовые тона
	'from-yellow-200 via-pink-200 to-pink-400',
	// 5. Seafoam (Морская пена) - свежие зелено-фиолетовые тона
	'from-green-200 via-green-400 to-purple-700',
	// 6. Creamsicle (Кремовый) - теплые желто-оранжевые тона
	'from-yellow-100 via-yellow-300 to-yellow-500',
	// 7. Flare (Вспышка) - яркие красно-желтые тона
	'from-indigo-200 via-red-200 to-yellow-100',
	// 8. Lavender (Лаванда) - нежные фиолетовые тона
	'from-purple-200 via-purple-400 to-pink-500',
];

/**
 * Градиенты для карточек в зависимости от sentiment (fallback)
 * Используются если UNIQUE_GRADIENTS недостаточно
 */
const GRADIENTS_BY_SENTIMENT: Record<string, string[]> = {
	positive: [
		'from-pink-500 via-red-500 to-yellow-500', // Sunset
		'from-yellow-200 via-pink-200 to-pink-400', // Peachy
		'from-yellow-100 via-yellow-300 to-yellow-500', // Creamsicle
		'from-indigo-200 via-red-200 to-yellow-100', // Flare
	],
	neutral: [
		'from-green-300 via-blue-500 to-purple-600', // Oceanic
		'from-green-200 via-green-400 to-purple-700', // Seafoam
	],
	negative: [
		'from-pink-300 via-purple-300 to-indigo-400', // Cotton Candy
		'from-purple-200 via-purple-400 to-pink-500', // Lavender
	],
};

/**
 * Получает уникальный градиент для карточки на основе индекса
 * Каждая карточка получает свой уникальный градиент из UNIQUE_GRADIENTS
 * Если индекс превышает количество градиентов - используем fallback на основе sentiment
 */
function getGradientByIndex(index: number, sentiment: string = 'positive'): string {
	// Используем уникальные градиенты для первых 8 карточек
	if (index < UNIQUE_GRADIENTS.length) {
		return UNIQUE_GRADIENTS[index];
	}

	// Fallback: используем градиенты на основе sentiment
	const gradientList = GRADIENTS_BY_SENTIMENT[sentiment] || GRADIENTS_BY_SENTIMENT.positive;
	return gradientList[index % gradientList.length];
}

function getDefaultMotivations(language: string): any[] {
	const defaults: Record<string, any[]> = {
		ru: [
			{
				id: 'default-1',
				date: new Date().toLocaleDateString('ru-RU'),
				title: 'Запиши момент благодарности',
				description:
					'Почувствуй лёгкость, когда замечаешь хорошее в своей жизни. Это путь к счастью.',
				gradient: UNIQUE_GRADIENTS[0], // Sunset
				isMarked: false,
				isDefault: true,
				sentiment: 'grateful',
			},
			{
				id: 'default-2',
				date: new Date().toLocaleDateString('ru-RU'),
				title: 'Даже одна мысль делает день осмысленным',
				description:
					'Не обязательно писать много — одна фраза может изменить твой взгляд на прожитый день.',
				gradient: UNIQUE_GRADIENTS[1], // Oceanic
				isMarked: false,
				isDefault: true,
				sentiment: 'calm',
			},
			{
				id: 'default-3',
				date: new Date().toLocaleDateString('ru-RU'),
				title: 'Сегодня отличное время',
				description: 'Запиши маленькую победу — это первый шаг к осознанию своих достижений.',
				gradient: UNIQUE_GRADIENTS[2], // Cotton Candy
				isMarked: false,
				isDefault: true,
				sentiment: 'excited',
			},
		],
		en: [
			{
				id: 'default-1',
				date: new Date().toLocaleDateString('en-US'),
				title: 'Write a moment of gratitude',
				description:
					'Feel the lightness when you notice the good in your life. This is the path to happiness.',
				gradient: UNIQUE_GRADIENTS[0], // Sunset
				isMarked: false,
				isDefault: true,
				sentiment: 'grateful',
			},
			{
				id: 'default-2',
				date: new Date().toLocaleDateString('en-US'),
				title: 'Even one thought makes the day meaningful',
				description: "You don't have to write a lot — one phrase can change your view of the day.",
				gradient: UNIQUE_GRADIENTS[1], // Oceanic
				isMarked: false,
				isDefault: true,
				sentiment: 'calm',
			},
			{
				id: 'default-3',
				date: new Date().toLocaleDateString('en-US'),
				title: 'Today is a great time',
				description:
					"Write down a small victory — it's the first step to realizing your achievements.",
				gradient: UNIQUE_GRADIENTS[2], // Cotton Candy
				isMarked: false,
				isDefault: true,
				sentiment: 'excited',
			},
		],
	};

	return defaults[language] || defaults.en;
}

// ======================
// CORS HELPER
// ======================

function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	};
}

// ======================
// MAIN REQUEST HANDLER
// ======================

async function handleRequest(req: Request): Promise<Response> {
	const url = new URL(req.url);
	const method = req.method;

	console.log(`[MOTIVATIONS v11] ${method} ${url.pathname}`);

	// Handle CORS preflight
	if (method === 'OPTIONS') {
		console.log('[MOTIVATIONS v11] ✅ OPTIONS handled');
		return new Response(null, {
			status: 204,
			headers: corsHeaders(),
		});
	}

	try {
		// Route: GET /motivations/health
		if (method === 'GET' && url.pathname === '/motivations/health') {
			console.log('[MOTIVATIONS v11] ✅ Health check called');
			return new Response(
				JSON.stringify({
					success: true,
					version: 'v11-ai-powered',
					message: 'Motivations microservice is running (AI-powered cards)',
					timestamp: new Date().toISOString(),
				}),
				{
					status: 200,
					headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
				}
			);
		}

		// Route: GET /motivations/cards/:userId
		if (method === 'GET' && url.pathname.startsWith('/motivations/cards/')) {
			const userId = url.pathname.split('/').pop();

			if (!userId) {
				return new Response(JSON.stringify({ success: false, error: 'Missing userId' }), {
					status: 400,
					headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
				});
			}

			console.log(`[MOTIVATIONS v11] Fetching cards for user: ${userId}`);

			const { supabaseUrl, supabaseServiceKey } = getEnvVars();

			// Step 1: Fetch user profile via REST API
			const profileResponse = await fetch(
				`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=language`,
				{
					headers: {
						apikey: supabaseServiceKey,
						Authorization: `Bearer ${supabaseServiceKey}`,
						'Content-Type': 'application/json',
					},
				}
			);

			if (!profileResponse.ok) {
				throw new Error(`Failed to fetch profile: ${profileResponse.status}`);
			}

			const profiles = await profileResponse.json();
			const userLanguage = profiles[0]?.language || 'ru';
			console.log(`[MOTIVATIONS v11] User language: ${userLanguage}`);

			// Step 2: Fetch recent entries (last 24 hours)
			const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
			const entriesResponse = await fetch(
				`${supabaseUrl}/rest/v1/entries?user_id=eq.${userId}&created_at=gte.${yesterday.toISOString()}&order=created_at.desc&limit=10`,
				{
					headers: {
						apikey: supabaseServiceKey,
						Authorization: `Bearer ${supabaseServiceKey}`,
						'Content-Type': 'application/json',
					},
				}
			);

			if (!entriesResponse.ok) {
				throw new Error(`Failed to fetch entries: ${entriesResponse.status}`);
			}

			const recentEntries = await entriesResponse.json();
			console.log(`[MOTIVATIONS v11] Found ${recentEntries.length} recent entries`);

			// Step 3: Fetch viewed cards
			const viewedResponse = await fetch(
				`${supabaseUrl}/rest/v1/motivation_cards?user_id=eq.${userId}&is_read=eq.true&created_at=gte.${yesterday.toISOString()}&select=entry_id`,
				{
					headers: {
						apikey: supabaseServiceKey,
						Authorization: `Bearer ${supabaseServiceKey}`,
						'Content-Type': 'application/json',
					},
				}
			);

			if (!viewedResponse.ok) {
				throw new Error(`Failed to fetch viewed cards: ${viewedResponse.status}`);
			}

			const viewedCards = await viewedResponse.json();
			const viewedIds = viewedCards.map((card: any) => card.entry_id);
			console.log(`[MOTIVATIONS v11] Viewed card IDs: ${viewedIds.length}`);

			// Step 4: Filter unviewed entries
			const unviewedEntries = recentEntries.filter((entry: any) => !viewedIds.includes(entry.id));
			console.log(`[MOTIVATIONS v11] Unviewed entries: ${unviewedEntries.length}`);

			// Step 5: Create cards from entries using AI (БЕЗ градиентов)
			const cards = [];
			for (const entry of unviewedEntries.slice(0, 3)) {
				// Try to generate card with AI
				const aiCard = await generateCardWithAI(
					entry,
					userLanguage,
					supabaseUrl,
					supabaseServiceKey
				);

				let title = '';
				let description = '';

				if (aiCard) {
					// ✅ AI-generated card
					title = aiCard.title;
					description = aiCard.body;
					console.log(`[MOTIVATIONS v11] ✅ AI card: ${title.substring(0, 30)}...`);
				} else {
					// ❌ Fallback to manual extraction
					console.log(`[MOTIVATIONS v11] ⚠️ Using fallback for entry ${entry.id}`);

					if (entry.ai_summary && entry.ai_summary.trim()) {
						const words = entry.ai_summary.trim().split(' ');
						title = words.slice(0, 8).join(' ') + (words.length > 8 ? '...' : '');
					} else if (entry.text && entry.text.trim()) {
						const words = entry.text.trim().split(' ');
						title = words.slice(0, 8).join(' ') + (words.length > 8 ? '...' : '');
					} else {
						title = userLanguage === 'ru' ? 'Запись от ' : 'Entry from ';
						title += new Date(entry.created_at).toLocaleDateString(
							userLanguage === 'ru' ? 'ru-RU' : 'en-US'
						);
					}

					if (entry.ai_insight && entry.ai_insight.trim()) {
						description = entry.ai_insight.trim();
					} else if (entry.ai_summary && entry.ai_summary.trim()) {
						description = entry.ai_summary.trim();
					} else if (entry.text && entry.text.trim()) {
						description = entry.text.trim();
					} else {
						description =
							userLanguage === 'ru'
								? 'Запись без текста. Нажмите чтобы просмотреть детали.'
								: 'Entry without text. Tap to view details.';
					}
				}

				cards.push({
					id: entry.id,
					entryId: entry.id,
					date: new Date(entry.created_at).toLocaleDateString(
						userLanguage === 'ru' ? 'ru-RU' : 'en-US'
					),
					title,
					description,
					gradient: '', // Будет назначен позже
					isMarked: false,
					isDefault: false,
					sentiment: entry.sentiment || 'positive',
					mood: entry.mood || 'хорошее',
				});
			}

			// Step 6: Add default cards if needed (БЕЗ градиентов)
			if (cards.length < 3) {
				const defaultCards = getDefaultMotivations(userLanguage);
				const needed = 3 - cards.length;
				// Добавляем default карточки БЕЗ градиентов (будут назначены позже)
				const defaultsToAdd = defaultCards.slice(0, needed).map((card) => ({
					...card,
					gradient: '', // Будет назначен позже
				}));
				cards.push(...defaultsToAdd);
				console.log(`[MOTIVATIONS v11] Added ${needed} default cards`);
			}

			// Step 7: Назначаем уникальные градиенты на основе индекса в финальном массиве
			cards.forEach((card, index) => {
				card.gradient = getGradientByIndex(index, card.sentiment || 'positive');
			});
			console.log(
				`[MOTIVATIONS v11] 🎨 Assigned gradients: ${cards.map((c, i) => `[${i}] ${c.gradient.split(' ').slice(0, 3).join(' ')}`).join(', ')}`
			);

			console.log(`[MOTIVATIONS v11] ✅ Returning ${cards.length} cards`);

			return new Response(JSON.stringify({ success: true, cards }), {
				status: 200,
				headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
			});
		}

		// Route: POST /motivations/mark-read
		if (method === 'POST' && url.pathname === '/motivations/mark-read') {
			const body = await req.json();
			const { userId, cardId } = body;

			if (!(userId && cardId)) {
				return new Response(
					JSON.stringify({
						success: false,
						error: 'userId and cardId are required',
					}),
					{
						status: 400,
						headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
					}
				);
			}

			console.log(`[MOTIVATIONS v10] Marking card ${cardId} as read for user ${userId}`);

			const { supabaseUrl, supabaseServiceKey } = getEnvVars();

			// Insert into motivation_cards via REST API
			const response = await fetch(`${supabaseUrl}/rest/v1/motivation_cards`, {
				method: 'POST',
				headers: {
					apikey: supabaseServiceKey,
					Authorization: `Bearer ${supabaseServiceKey}`,
					'Content-Type': 'application/json',
					Prefer: 'return=minimal',
				},
				body: JSON.stringify({
					user_id: userId,
					entry_id: cardId,
					is_read: true,
					created_at: new Date().toISOString(),
				}),
			});

			if (!response.ok) {
				throw new Error(`Failed to mark card as read: ${response.status}`);
			}

			console.log('[MOTIVATIONS v11] ✅ Card marked as read');

			return new Response(JSON.stringify({ success: true }), {
				status: 200,
				headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
			});
		}

		// Route: POST /motivations/progress-card
		if (method === 'POST' && url.pathname === '/motivations/progress-card') {
			const body = await req.json();
			const { userId, userLanguage } = body;

			if (!userId) {
				return new Response(JSON.stringify({ success: false, error: 'userId is required' }), {
					status: 400,
					headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
				});
			}

			console.log(`[MOTIVATIONS v11] Generating progress card for user: ${userId}`);

			const { supabaseUrl, supabaseServiceKey } = getEnvVars();

			// Generate progress card with AI
			const progressCard = await generateProgressCard(
				userId,
				userLanguage || 'ru',
				supabaseUrl,
				supabaseServiceKey
			);

			if (!progressCard) {
				return new Response(
					JSON.stringify({ success: false, error: 'Failed to generate progress card' }),
					{
						status: 500,
						headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
					}
				);
			}

			console.log('[MOTIVATIONS v11] ✅ Progress card generated');

			return new Response(
				JSON.stringify({
					success: true,
					card: {
						id: `progress-${Date.now()}`,
						type: 'progress',
						title: progressCard.title,
						description: progressCard.body,
						optionalStep: progressCard.optional_step,
						gradient: 'from-green-300 via-blue-500 to-purple-600', // Oceanic gradient
						isMarked: false,
						isDefault: false,
						sentiment: 'positive',
					},
				}),
				{
					status: 200,
					headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
				}
			);
		}

		// 404 Not Found
		return new Response(JSON.stringify({ success: false, error: 'Not Found' }), {
			status: 404,
			headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
		});
	} catch (error: any) {
		console.error('[MOTIVATIONS v11] ❌ Error:', error.message);
		return new Response(JSON.stringify({ success: false, error: error.message }), {
			status: 500,
			headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
		});
	}
}

// ======================
// START SERVER
// ======================

console.log('[MOTIVATIONS v10] ✅ Microservice configured (Pure Deno)');
console.log('[MOTIVATIONS v10] ✅ Starting Deno server...');

Deno.serve(handleRequest);

console.log('[MOTIVATIONS v10] ✅ Server started successfully!');
