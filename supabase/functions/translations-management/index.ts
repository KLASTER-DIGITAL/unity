import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Translation {
  translation_key: string;
  lang_code: string;
  translation_value: string;
  category?: string;
}

interface Language {
  code: string;
  name: string;
  native_name: string;
  is_active: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // Get access token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // Create Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user with access token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) {
      console.error('[AUTH] User verification failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid access token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is super admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'super_admin') {
      console.error('[AUTH] User is not super admin:', profile?.role);
      return new Response(
        JSON.stringify({ error: 'Access denied. Super admin only.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[AUTH] ✅ Super admin verified:', user.id);

    const url = new URL(req.url);
    const path = url.pathname;

    // GET /translations-management - Get all translations
    if (req.method === 'GET' && path.endsWith('/translations-management')) {
      const { data: translations, error } = await supabaseAdmin
        .from('translations')
        .select('*')
        .order('translation_key', { ascending: true });

      if (error) throw error;

      return new Response(
        JSON.stringify({ translations }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /translations-management/languages - Get all languages with statistics
    if (req.method === 'GET' && path.endsWith('/languages')) {
      // Get all languages
      const { data: languages, error: langError } = await supabaseAdmin
        .from('languages')
        .select('*')
        .order('code', { ascending: true });

      if (langError) throw langError;

      // Get all unique translation keys from translations table
      const { data: allTranslations, error: transError } = await supabaseAdmin
        .from('translations')
        .select('translation_key, lang_code');

      if (transError) throw transError;

      // Get unique keys
      const uniqueKeys = [...new Set(allTranslations.map(t => t.translation_key))];
      const totalKeys = uniqueKeys.length;

      // Calculate statistics for each language
      const languagesWithStats = languages.map(lang => {
        const translationCount = allTranslations.filter(t => t.lang_code === lang.code).length;
        const progress = totalKeys > 0 ? Math.round((translationCount / totalKeys) * 100) : 0;

        return {
          ...lang,
          translation_count: translationCount,
          total_keys: totalKeys,
          progress
        };
      });

      return new Response(
        JSON.stringify({ languages: languagesWithStats }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /translations-management/missing - Get missing translation keys
    if (req.method === 'GET' && path.endsWith('/missing')) {
      // Get all active languages
      const { data: languages, error: langError } = await supabaseAdmin
        .from('languages')
        .select('code')
        .eq('is_active', true);

      if (langError) throw langError;

      // Get all unique translation keys
      const { data: allKeys, error: keysError } = await supabaseAdmin
        .from('translations')
        .select('translation_key')
        .order('translation_key', { ascending: true });

      if (keysError) throw keysError;

      const uniqueKeys = [...new Set(allKeys.map(k => k.translation_key))];

      // Get all existing translations
      const { data: translations, error: transError } = await supabaseAdmin
        .from('translations')
        .select('translation_key, lang_code');

      if (transError) throw transError;

      // Find missing translations
      const missing: { key: string; languages: string[] }[] = [];
      
      for (const key of uniqueKeys) {
        const existingLangs = translations
          .filter(t => t.translation_key === key)
          .map(t => t.lang_code);
        
        const missingLangs = languages
          .map(l => l.code)
          .filter(code => !existingLangs.includes(code));

        if (missingLangs.length > 0) {
          missing.push({ key, languages: missingLangs });
        }
      }

      return new Response(
        JSON.stringify({ missing, total: missing.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /translations-management - Update translation
    if (req.method === 'POST' && path.endsWith('/translations-management')) {
      const body = await req.json();
      const { translation_key, lang_code, translation_value, category } = body;

      if (!translation_key || !lang_code || !translation_value) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabaseAdmin
        .from('translations')
        .upsert({
          translation_key,
          lang_code,
          translation_value,
          category: category || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'translation_key,lang_code'
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, translation: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /translations-management/language - Add/update language
    if (req.method === 'POST' && path.endsWith('/language')) {
      const body = await req.json();
      const { code, name, native_name, is_active } = body;

      if (!code || !name || !native_name) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabaseAdmin
        .from('languages')
        .upsert({
          code,
          name,
          native_name,
          is_active: is_active ?? true
        }, {
          onConflict: 'code'
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, language: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /translations-management - Delete translation
    if (req.method === 'DELETE' && path.endsWith('/translations-management')) {
      const body = await req.json();
      const { translation_key, lang_code } = body;

      if (!translation_key || !lang_code) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabaseAdmin
        .from('translations')
        .delete()
        .eq('translation_key', translation_key)
        .eq('lang_code', lang_code);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

