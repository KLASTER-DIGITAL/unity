// 🚀 MOTIVATIONS MICROSERVICE v10 - PURE DENO (NO HONO)
// Purpose: Generate motivation cards from AI-analyzed entries
// Architecture: Pure Deno.serve() with REST API
// Status: PRODUCTION - Fixed timeout issue

console.log('[MOTIVATIONS v10] 🚀 Starting microservice (Pure Deno)...');

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

console.log('[MOTIVATIONS v10] ✅ Environment ready');

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

	console.log(`[MOTIVATIONS v10] ${method} ${url.pathname}`);

	// Handle CORS preflight
	if (method === 'OPTIONS') {
		console.log('[MOTIVATIONS v10] ✅ OPTIONS handled');
		return new Response(null, {
			status: 204,
			headers: corsHeaders(),
		});
	}

	try {
		// Route: GET /motivations/health
		if (method === 'GET' && url.pathname === '/motivations/health') {
			console.log('[MOTIVATIONS v10] ✅ Health check called');
			return new Response(
				JSON.stringify({
					success: true,
					version: 'v10-pure-deno',
					message: 'Motivations microservice is running (Pure Deno, no Hono)',
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

			console.log(`[MOTIVATIONS v10] Fetching cards for user: ${userId}`);

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
			console.log(`[MOTIVATIONS v10] User language: ${userLanguage}`);

			// Step 2: Fetch recent entries (last 48 hours)
			const yesterday = new Date(Date.now() - 48 * 60 * 60 * 1000);
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
			console.log(`[MOTIVATIONS v10] Found ${recentEntries.length} recent entries`);

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
			console.log(`[MOTIVATIONS v10] Viewed card IDs: ${viewedIds.length}`);

			// Step 4: Filter unviewed entries
			const unviewedEntries = recentEntries.filter((entry: any) => !viewedIds.includes(entry.id));
			console.log(`[MOTIVATIONS v10] Unviewed entries: ${unviewedEntries.length}`);

			// Step 5: Create cards from entries (БЕЗ градиентов)
			const cards = unviewedEntries.slice(0, 3).map((entry: any) => {
				// ✅ FIX: Fallback для title если все поля пустые
				let title = '';
				if (entry.ai_summary && entry.ai_summary.trim()) {
					const words = entry.ai_summary.trim().split(' ');
					title = words.slice(0, 8).join(' ') + (words.length > 8 ? '...' : '');
				} else if (entry.text && entry.text.trim()) {
					const words = entry.text.trim().split(' ');
					title = words.slice(0, 8).join(' ') + (words.length > 8 ? '...' : '');
				} else {
					// Fallback: используем дату
					title = userLanguage === 'ru' ? 'Запись от ' : 'Entry from ';
					title += new Date(entry.created_at).toLocaleDateString(
						userLanguage === 'ru' ? 'ru-RU' : 'en-US'
					);
				}

				// ✅ FIX: Fallback для description если все поля пустые
				let description = '';
				if (entry.ai_insight && entry.ai_insight.trim()) {
					description = entry.ai_insight.trim();
				} else if (entry.ai_summary && entry.ai_summary.trim()) {
					description = entry.ai_summary.trim();
				} else if (entry.text && entry.text.trim()) {
					description = entry.text.trim();
				} else {
					// Fallback: используем placeholder
					description =
						userLanguage === 'ru'
							? 'Запись без текста. Нажмите чтобы просмотреть детали.'
							: 'Entry without text. Tap to view details.';
				}

				return {
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
				};
			});

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
				console.log(`[MOTIVATIONS v10] Added ${needed} default cards`);
			}

			// Step 7: Назначаем уникальные градиенты на основе индекса в финальном массиве
			cards.forEach((card, index) => {
				card.gradient = getGradientByIndex(index, card.sentiment || 'positive');
			});
			console.log(
				`[MOTIVATIONS v10] 🎨 Assigned gradients: ${cards.map((c, i) => `[${i}] ${c.gradient.split(' ').slice(0, 3).join(' ')}`).join(', ')}`
			);

			console.log(`[MOTIVATIONS v10] ✅ Returning ${cards.length} cards`);

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

			console.log('[MOTIVATIONS v10] ✅ Card marked as read');

			return new Response(JSON.stringify({ success: true }), {
				status: 200,
				headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
			});
		}

		// 404 Not Found
		return new Response(JSON.stringify({ success: false, error: 'Not Found' }), {
			status: 404,
			headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
		});
	} catch (error: any) {
		console.error('[MOTIVATIONS v10] ❌ Error:', error.message);
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
