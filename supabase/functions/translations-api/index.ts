import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-openai-key'
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ✅ FIX: Use Authorization header if present, otherwise use ANON_KEY for public endpoints
    const authHeader = req.headers.get('Authorization');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      authHeader ? {
        global: {
          headers: { Authorization: authHeader }
        }
      } : undefined
    );

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(p => p);
    const path = pathParts[pathParts.length - 1] || 'languages';

    console.log('Request path:', path);
    console.log('Request method:', req.method);
    console.log('Has Authorization:', !!authHeader);

    // ✅ NEW: Get translations by language code (e.g., /ru, /en)
    // Check if path is a 2-letter language code
    if (path.length === 2 && /^[a-z]{2}$/.test(path)) {
      if (req.method === 'GET') {
        const langCode = path;
        console.log('Fetching translations for language:', langCode);
        
        const { data: translations, error } = await supabaseClient
          .from('translations')
          .select('translation_key, translation_value')
          .eq('lang_code', langCode);

        if (error) {
          console.error('Error fetching translations:', error);
          throw error;
        }

        // Convert to key-value object
        const translationsObj = (translations || []).reduce((acc: any, t: any) => {
          acc[t.translation_key] = t.translation_value;
          return acc;
        }, {});

        console.log(`Translations found for ${langCode}:`, Object.keys(translationsObj).length);

        return new Response(JSON.stringify(translationsObj), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    switch (path) {
      case 'languages': {
        if (req.method === 'GET') {
          const { data: languages, error } = await supabaseClient
            .from('languages')
            .select('*')
            .eq('is_active', true)
            .order('name');

          if (error) {
            console.error('Error fetching languages:', error);
            throw error;
          }

          console.log('Languages found:', languages?.length || 0);

          return new Response(JSON.stringify(languages || []), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (req.method === 'POST') {
          const { code, name, native_name, flag, is_active = true } = await req.json();

          const { data: language, error } = await supabaseClient
            .from('languages')
            .insert({ code, name, native_name, flag, is_active })
            .select()
            .single();

          if (error) throw error;

          return new Response(JSON.stringify(language), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        break;
      }

      case 'translations': {
        if (req.method === 'GET') {
          const { data: translations, error } = await supabaseClient
            .from('translations')
            .select('*')
            .order('lang_code');

          if (error) throw error;

          return new Response(JSON.stringify(translations), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        break;
      }

      case 'stats': {
        if (req.method === 'GET') {
          const { data: languages } = await supabaseClient
            .from('languages')
            .select('code')
            .eq('is_active', true);

          const { data: translations } = await supabaseClient
            .from('translations')
            .select('lang_code, translation_key');

          const { data: baseTranslations } = await supabaseClient
            .from('translations')
            .select('translation_key')
            .eq('lang_code', 'ru');

          const totalKeys = baseTranslations?.length || 0;
          const translatedKeys: any = {};
          const missingTranslations: any = {};

          languages?.forEach((lang) => {
            const langTranslations = translations?.filter(t => t.lang_code === lang.code) || [];
            translatedKeys[lang.code] = langTranslations.length;

            const translatedKeysForLang = langTranslations.map(t => t.translation_key);
            const missingKeys = baseTranslations
              ?.filter(bt => !translatedKeysForLang.includes(bt.translation_key))
              .map(bt => bt.translation_key) || [];

            missingTranslations[lang.code] = missingKeys;
          });

          const stats = {
            totalLanguages: languages?.length || 0,
            totalKeys,
            translatedKeys,
            missingTranslations
          };

          return new Response(JSON.stringify(stats), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        break;
      }

      case 'export': {
        if (req.method === 'GET') {
          const { data: languages } = await supabaseClient
            .from('languages')
            .select('*')
            .eq('is_active', true);

          const { data: translations } = await supabaseClient
            .from('translations')
            .select('*');

          const exportData = {
            version: '1.0.0',
            languages: languages?.map(lang => ({
              code: lang.code,
              name: lang.name,
              nativeName: lang.native_name,
              flag: lang.flag
            })) || [],
            translations: translations?.reduce((acc: any, t: any) => {
              if (!acc[t.lang_code]) acc[t.lang_code] = {};
              acc[t.lang_code][t.translation_key] = t.translation_value;
              return acc;
            }, {}) || {},
            exportDate: new Date().toISOString()
          };

          return new Response(JSON.stringify(exportData, null, 2), {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Content-Disposition': `attachment; filename="translations-${new Date().toISOString().split('T')[0]}.json"`
            }
          });
        }
        break;
      }

      case 'keys': {
        if (req.method === 'GET') {
          // Get all unique translation keys (using Russian as base)
          const { data, error } = await supabaseClient
            .from('translations')
            .select('translation_key')
            .eq('lang_code', 'ru');

          if (error) throw error;

          const keys = data ? [...new Set(data.map(t => t.translation_key))] : [];

          console.log('Translation keys found:', keys.length);

          return new Response(JSON.stringify({ success: true, keys }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        break;
      }

      case 'missing': {
        if (req.method === 'POST') {
          const { key, language, context, userAgent, timestamp } = await req.json();

          if (!key || !language) {
            return new Response(
              JSON.stringify({ success: false, error: 'Key and language are required' }),
              {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          // Check if this report already exists
          const { data: existing } = await supabaseClient
            .from('missing_translations')
            .select('*')
            .eq('translation_key', key)
            .eq('lang_code', language)
            .eq('context', context || '')
            .single();

          if (existing) {
            // Update counter
            const { error: updateError } = await supabaseClient
              .from('missing_translations')
              .update({
                report_count: existing.report_count + 1,
                updated_at: new Date().toISOString()
              })
              .eq('id', existing.id);

            if (updateError) throw updateError;
          } else {
            // Create new report
            const { error: insertError } = await supabaseClient
              .from('missing_translations')
              .insert({
                translation_key: key,
                lang_code: language,
                context: context || null,
                user_agent: userAgent || null,
                report_count: 1,
                created_at: timestamp || new Date().toISOString()
              });

            if (insertError) throw insertError;
          }

          console.log('Missing translation reported:', key, language);

          return new Response(
            JSON.stringify({ success: true, message: 'Missing translation reported' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        break;
      }

      case 'health': {
        if (req.method === 'GET') {
          // Simple health check
          const { data, error } = await supabaseClient
            .from('languages')
            .select('count')
            .limit(1);

          if (error) throw error;

          return new Response(
            JSON.stringify({
              success: true,
              status: 'ok',
              service: 'translations-api',
              timestamp: new Date().toISOString()
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        break;
      }

      default:
        console.log('Unknown path:', path);
        return new Response(JSON.stringify({ error: `Not found: ${path}` }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Edge Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

