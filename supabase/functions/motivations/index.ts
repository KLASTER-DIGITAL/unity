// 🚀 MOTIVATIONS MICROSERVICE v9 - PURE DENO (NO HONO)
// Purpose: Generate motivation cards from AI-analyzed entries
// Architecture: Pure Deno.serve() with REST API
// Status: PRODUCTION - Fixing CORS issue by removing Hono framework

console.log('[MOTIVATIONS v9] 🚀 Starting microservice (Pure Deno)...');

// ======================
// ENVIRONMENT VARIABLES
// ======================

function getEnvVars() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return { supabaseUrl, supabaseServiceKey };
}

console.log('[MOTIVATIONS v9] ✅ Environment ready');

// ======================
// HELPER FUNCTIONS
// ======================

function getGradientBySentiment(sentiment: string): string {
  const gradients: Record<string, string[]> = {
    'positive': [
      'from-[#FE7669] to-[#ff8969]',
      'from-[#ff7769] to-[#ff6b9d]',
      'from-[#ff6b9d] to-[#c471ed]',
      'from-[#c471ed] to-[#8B78FF]'
    ],
    'neutral': [
      'from-[#4facfe] to-[#00f2fe]',
      'from-[#43e97b] to-[#38f9d7]'
    ],
    'negative': [
      'from-[#f093fb] to-[#f5576c]',
      'from-[#fa709a] to-[#fee140]'
    ]
  };

  const gradientList = gradients[sentiment] || gradients['positive'];
  return gradientList[Math.floor(Math.random() * gradientList.length)];
}

function getDefaultMotivations(language: string): any[] {
  const defaults: Record<string, any[]> = {
    'ru': [
      {
        id: 'default-1',
        date: new Date().toLocaleDateString('ru-RU'),
        title: 'Запиши момент благодарности',
        description: 'Почувствуй лёгкость, когда замечаешь хорошее в своей жизни. Это путь к счастью.',
        gradient: 'from-[#c471ed] to-[#8B78FF]',
        isMarked: false,
        isDefault: true,
        sentiment: 'grateful'
      },
      {
        id: 'default-2',
        date: new Date().toLocaleDateString('ru-RU'),
        title: 'Даже одна мысль делает день осмысленным',
        description: 'Не обязательно писать много — одна фраза может изменить твой взгляд на прожитый день.',
        gradient: 'from-[#ff6b9d] to-[#c471ed]',
        isMarked: false,
        isDefault: true,
        sentiment: 'calm'
      },
      {
        id: 'default-3',
        date: new Date().toLocaleDateString('ru-RU'),
        title: 'Сегодня отличное время',
        description: 'Запиши маленькую победу — это первый шаг к осознанию своих достижений.',
        gradient: 'from-[#43e97b] to-[#38f9d7]',
        isMarked: false,
        isDefault: true,
        sentiment: 'excited'
      }
    ],
    'en': [
      {
        id: 'default-1',
        date: new Date().toLocaleDateString('en-US'),
        title: 'Write a moment of gratitude',
        description: 'Feel the lightness when you notice the good in your life. This is the path to happiness.',
        gradient: 'from-[#c471ed] to-[#8B78FF]',
        isMarked: false,
        isDefault: true,
        sentiment: 'grateful'
      },
      {
        id: 'default-2',
        date: new Date().toLocaleDateString('en-US'),
        title: 'Even one thought makes the day meaningful',
        description: 'You don\'t have to write a lot — one phrase can change your view of the day.',
        gradient: 'from-[#ff6b9d] to-[#c471ed]',
        isMarked: false,
        isDefault: true,
        sentiment: 'calm'
      },
      {
        id: 'default-3',
        date: new Date().toLocaleDateString('en-US'),
        title: 'Today is a great time',
        description: 'Write down a small victory — it\'s the first step to realizing your achievements.',
        gradient: 'from-[#43e97b] to-[#38f9d7]',
        isMarked: false,
        isDefault: true,
        sentiment: 'excited'
      }
    ]
  };

  return defaults[language] || defaults['en'];
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

  console.log(`[MOTIVATIONS v9] ${method} ${url.pathname}`);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    console.log('[MOTIVATIONS v9] ✅ OPTIONS handled');
    return new Response(null, {
      status: 204,
      headers: corsHeaders()
    });
  }

  try {
    // Route: GET /motivations/health
    if (method === 'GET' && url.pathname === '/motivations/health') {
      console.log('[MOTIVATIONS v9] ✅ Health check called');
      return new Response(
        JSON.stringify({
          success: true,
          version: 'v9-pure-deno',
          message: 'Motivations microservice is running (Pure Deno, no Hono)',
          timestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
        }
      );
    }

    // Route: GET /motivations/cards/:userId
    if (method === 'GET' && url.pathname.startsWith('/motivations/cards/')) {
      const userId = url.pathname.split('/').pop();

      if (!userId) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing userId' }),
          {
            status: 400,
            headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
          }
        );
      }

      console.log(`[MOTIVATIONS v9] Fetching cards for user: ${userId}`);

      const { supabaseUrl, supabaseServiceKey } = getEnvVars();

      // Step 1: Fetch user profile via REST API
      const profileResponse = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=language`,
        {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!profileResponse.ok) {
        throw new Error(`Failed to fetch profile: ${profileResponse.status}`);
      }

      const profiles = await profileResponse.json();
      const userLanguage = profiles[0]?.language || 'ru';
      console.log(`[MOTIVATIONS v9] User language: ${userLanguage}`);

      // Step 2: Fetch recent entries (last 48 hours)
      const yesterday = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const entriesResponse = await fetch(
        `${supabaseUrl}/rest/v1/entries?user_id=eq.${userId}&created_at=gte.${yesterday.toISOString()}&order=created_at.desc&limit=10`,
        {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!entriesResponse.ok) {
        throw new Error(`Failed to fetch entries: ${entriesResponse.status}`);
      }

      const recentEntries = await entriesResponse.json();
      console.log(`[MOTIVATIONS v9] Found ${recentEntries.length} recent entries`);

      // Step 3: Fetch viewed cards
      const viewedResponse = await fetch(
        `${supabaseUrl}/rest/v1/motivation_cards?user_id=eq.${userId}&is_read=eq.true&created_at=gte.${yesterday.toISOString()}&select=entry_id`,
        {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!viewedResponse.ok) {
        throw new Error(`Failed to fetch viewed cards: ${viewedResponse.status}`);
      }

      const viewedCards = await viewedResponse.json();
      const viewedIds = viewedCards.map((card: any) => card.entry_id);
      console.log(`[MOTIVATIONS v9] Viewed card IDs: ${viewedIds.length}`);

      // Step 4: Filter unviewed entries
      const unviewedEntries = recentEntries.filter((entry: any) => !viewedIds.includes(entry.id));
      console.log(`[MOTIVATIONS v9] Unviewed entries: ${unviewedEntries.length}`);

      // Step 5: Create cards from entries
      const cards = unviewedEntries.slice(0, 3).map((entry: any) => ({
        id: entry.id,
        entryId: entry.id,
        date: new Date(entry.created_at).toLocaleDateString(userLanguage === 'ru' ? 'ru-RU' : 'en-US'),
        title: entry.ai_summary
          ? entry.ai_summary.split(' ').slice(0, 8).join(' ') + (entry.ai_summary.split(' ').length > 8 ? '...' : '')
          : entry.text.split(' ').slice(0, 8).join(' ') + (entry.text.split(' ').length > 8 ? '...' : ''),
        description: entry.ai_insight || entry.ai_summary || entry.text,
        gradient: getGradientBySentiment(entry.sentiment || 'positive'),
        isMarked: false,
        isDefault: false,
        sentiment: entry.sentiment || 'positive',
        mood: entry.mood || 'хорошее'
      }));

      // Step 6: Add default cards if needed
      if (cards.length < 3) {
        const defaultCards = getDefaultMotivations(userLanguage);
        const needed = 3 - cards.length;
        cards.push(...defaultCards.slice(0, needed));
        console.log(`[MOTIVATIONS v9] Added ${needed} default cards`);
      }

      console.log(`[MOTIVATIONS v9] ✅ Returning ${cards.length} cards`);

      return new Response(
        JSON.stringify({ success: true, cards }),
        {
          status: 200,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
        }
      );
    }

    // Route: POST /motivations/mark-read
    if (method === 'POST' && url.pathname === '/motivations/mark-read') {
      const body = await req.json();
      const { userId, cardId } = body;

      if (!userId || !cardId) {
        return new Response(
          JSON.stringify({ success: false, error: 'userId and cardId are required' }),
          {
            status: 400,
            headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
          }
        );
      }

      console.log(`[MOTIVATIONS v9] Marking card ${cardId} as read for user ${userId}`);

      const { supabaseUrl, supabaseServiceKey } = getEnvVars();

      // Insert into motivation_cards via REST API
      const response = await fetch(
        `${supabaseUrl}/rest/v1/motivation_cards`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            user_id: userId,
            entry_id: cardId,
            is_read: true,
            created_at: new Date().toISOString()
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to mark card as read: ${response.status}`);
      }

      console.log(`[MOTIVATIONS v9] ✅ Card marked as read`);

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
        }
      );
    }

    // 404 Not Found
    return new Response(
      JSON.stringify({ success: false, error: 'Not Found' }),
      {
        status: 404,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('[MOTIVATIONS v9] ❌ Error:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      }
    );
  }
}

// ======================
// START SERVER
// ======================

console.log('[MOTIVATIONS v9] ✅ Microservice configured (Pure Deno)');
console.log('[MOTIVATIONS v9] ✅ Starting Deno server...');

Deno.serve(handleRequest);

console.log('[MOTIVATIONS v9] ✅ Server started successfully!');
