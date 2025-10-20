import { createClient } from 'jsr:@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-openai-key',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = authHeader.replace('Bearer ', '');
    
    // Create Supabase client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify user with JWT token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.error('[AI-ANALYSIS] Auth error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid access token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[AI-ANALYSIS] Authenticated user:', user.id);

    // Get OpenAI API key from admin_settings or header
    const headerKey = req.headers.get('X-OpenAI-Key');
    let openaiApiKey = headerKey;

    if (!openaiApiKey) {
      const { data: setting } = await supabaseAdmin
        .from('admin_settings')
        .select('value')
        .eq('key', 'openai_api_key')
        .single();

      if (setting?.value) {
        openaiApiKey = setting.value;
        console.log('[AI-ANALYSIS] Using OpenAI key from admin_settings');
      } else {
        openaiApiKey = Deno.env.get('OPENAI_API_KEY');
        if (openaiApiKey) {
          console.log('[AI-ANALYSIS] Using OpenAI key from env variable (fallback)');
        }
      }
    } else {
      console.log('[AI-ANALYSIS] Using OpenAI key from header');
    }

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(p => p);
    const relevantParts = pathParts.filter(p => !['functions', 'v1', 'ai-analysis'].includes(p));
    const endpoint = relevantParts.join('/') || 'analyze';

    console.log('[AI-ANALYSIS] Endpoint:', endpoint, 'Method:', req.method);

    // Route: POST /analyze - AI text analysis
    if (endpoint === 'analyze' && req.method === 'POST') {
      const body = await req.json();
      const { text, userId, userName, userLanguage } = body;

      if (!text) {
        return new Response(
          JSON.stringify({ success: false, error: 'Text is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[AI-ANALYSIS] Analyzing text for user:', userId || user.id);

      // Get user profile for context
      const finalUserId = userId || user.id;
      let finalUserName = userName || 'Пользователь';
      let finalUserLanguage = userLanguage || 'ru';

      if (!userName) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('name, language')
          .eq('id', finalUserId)
          .single();

        if (profile) {
          finalUserName = profile.name || finalUserName;
          finalUserLanguage = profile.language || finalUserLanguage;
        }
      }

      // System prompt for AI analysis
      const systemPrompt = `Ты - AI-ассистент для дневника достижений. Твоя задача - анализировать записи пользователей и предоставлять мотивационные ответы.

Пользователь: ${finalUserName}
Язык: ${finalUserLanguage}

Проанализируй запись и верни JSON с полями:
- sentiment: "positive", "neutral", "negative"
- category: одна из категорий (семья, работа, финансы, благодарность, здоровье, личное развитие, творчество, отношения, другое)
- tags: массив тегов (максимум 5)
- reply: мотивационный ответ (2-3 предложения)
- summary: краткое резюме (1 предложение)
- insight: глубокое понимание или совет
- isAchievement: true/false (является ли это достижением)
- mood: описание настроения

Отвечай на языке пользователя: ${finalUserLanguage}`;

      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[AI-ANALYSIS] OpenAI API error:', error);
        return new Response(
          JSON.stringify({ success: false, error: `OpenAI API failed: ${response.status}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = await response.json();
      const aiResponse = result.choices[0]?.message?.content;

      if (!aiResponse) {
        return new Response(
          JSON.stringify({ success: false, error: 'No response from AI' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Log OpenAI usage
      const usage = result.usage;
      if (usage) {
        const pricing: Record<string, { prompt: number; completion: number }> = {
          'gpt-4': { prompt: 0.03 / 1000, completion: 0.06 / 1000 },
          'gpt-4-turbo-preview': { prompt: 0.01 / 1000, completion: 0.03 / 1000 },
          'gpt-3.5-turbo': { prompt: 0.0005 / 1000, completion: 0.0015 / 1000 },
        };

        const modelPricing = pricing['gpt-4'] || pricing['gpt-3.5-turbo'];
        const promptTokens = usage.prompt_tokens || 0;
        const completionTokens = usage.completion_tokens || 0;
        const totalTokens = usage.total_tokens || (promptTokens + completionTokens);
        
        const estimatedCost = 
          (promptTokens * modelPricing.prompt) + 
          (completionTokens * modelPricing.completion);

        await supabaseAdmin.from('openai_usage').insert({
          user_id: finalUserId,
          operation_type: 'ai_card',
          model: 'gpt-4',
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: totalTokens,
          estimated_cost: estimatedCost
        });

        console.log(`[AI-ANALYSIS] Logged usage: ${totalTokens} tokens, $${estimatedCost.toFixed(6)}`);
      }

      // Parse AI response
      let analysis;
      try {
        analysis = JSON.parse(aiResponse);
      } catch (e) {
        console.error('[AI-ANALYSIS] Failed to parse AI response:', e);
        analysis = {
          sentiment: 'neutral',
          category: 'другое',
          tags: [],
          reply: aiResponse,
          summary: text.substring(0, 100),
          insight: '',
          isAchievement: false,
          mood: 'neutral'
        };
      }

      return new Response(
        JSON.stringify({ success: true, analysis }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: GET /health - Health check
    if (endpoint === 'health' && req.method === 'GET') {
      return new Response(
        JSON.stringify({ success: true, status: 'healthy', service: 'ai-analysis' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Unknown endpoint
    return new Response(
      JSON.stringify({ success: false, error: 'Unknown endpoint' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[AI-ANALYSIS] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

