import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // Languages endpoints
    if (path === '/languages' && method === 'GET') {
      const { data, error } = await supabaseClient
        .from('languages')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path === '/languages' && method === 'POST') {
      const { code, name, native_name, flag } = await req.json();

      const { data, error } = await supabaseClient
        .from('languages')
        .insert({ code, name, native_name, flag })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Translations endpoints
    if (path === '/translations' && method === 'GET') {
      const { data, error } = await supabaseClient
        .from('translations')
        .select('*');

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path === '/translations' && method === 'POST') {
      const translations = await req.json();

      const { data, error } = await supabaseClient
        .from('translations')
        .upsert(translations, { onConflict: 'lang_code,translation_key' })
        .select();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Admin settings endpoints
    if (path.startsWith('/admin-settings/') && method === 'GET') {
      const settingKey = path.split('/').pop();
      
      const { data, error } = await supabaseClient
        .from('admin_settings')
        .select('*')
        .eq('setting_key', settingKey)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return new Response(JSON.stringify({ value: data?.setting_value || null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.startsWith('/admin-settings/') && method === 'POST') {
      const settingKey = path.split('/').pop();
      const { value } = await req.json();

      const { data, error } = await supabaseClient
        .from('admin_settings')
        .upsert({ setting_key: settingKey, setting_value: value }, { onConflict: 'setting_key' })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Auto-translate endpoint
    if (path === '/translate-language' && method === 'POST') {
      const { langCode, apiKey } = await req.json();

      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API key required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get Russian translations as base
      const { data: baseTranslations, error: baseError } = await supabaseClient
        .from('translations')
        .select('*')
        .eq('lang_code', 'ru');

      if (baseError) throw baseError;

      // Get existing translations for target language
      const { data: existingTranslations, error: existingError } = await supabaseClient
        .from('translations')
        .select('translation_key')
        .eq('lang_code', langCode);

      if (existingError) throw existingError;

      const existingKeys = new Set(existingTranslations.map(t => t.translation_key));
      const untranslatedKeys = baseTranslations.filter(t => !existingKeys.has(t.translation_key));

      if (untranslatedKeys.length === 0) {
        return new Response(JSON.stringify({ message: 'All translations already exist' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Translate using OpenAI
      const translatedEntries = [];
      
      for (const translation of untranslatedKeys) {
        try {
          const prompt = `You are a professional translator. Translate the following text from Russian to ${langCode}. 
          
          Context: This is for a diary/achievement tracking app. The text should be natural, encouraging, and appropriate for personal development.
          
          Text to translate: "${translation.translation_value}"
          
          Return only the translation, no explanations or additional text.`;

          const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4',
              messages: [{ role: 'user', content: prompt }],
              max_tokens: 200,
              temperature: 0.3,
            }),
          });

          if (!openaiResponse.ok) {
            console.error('OpenAI API error:', await openaiResponse.text());
            continue;
          }

          const openaiData = await openaiResponse.json();
          const translatedText = openaiData.choices[0]?.message?.content?.trim();

          if (translatedText) {
            translatedEntries.push({
              lang_code: langCode,
              translation_key: translation.translation_key,
              translation_value: translatedText,
            });
          }
        } catch (error) {
          console.error('Translation error for key:', translation.translation_key, error);
        }
      }

      // Save translations to database
      if (translatedEntries.length > 0) {
        const { error: saveError } = await supabaseClient
          .from('translations')
          .insert(translatedEntries);

        if (saveError) throw saveError;
      }

      return new Response(JSON.stringify({ 
        message: `Translated ${translatedEntries.length} entries`,
        translated: translatedEntries.length,
        total: untranslatedKeys.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
