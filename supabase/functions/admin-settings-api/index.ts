import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// EMBEDDED UTILITY: Super Admin Auth Middleware
// ============================================
async function verifySuperAdmin(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  
  // Get access token from Authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return {
      error: new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    };
  }

  const accessToken = authHeader.replace('Bearer ', '');

  // Create Supabase admin client (bypasses RLS)
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  // Verify user JWT token
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
  if (authError || !user) {
    console.error('[AUTH] User verification failed:', authError);
    return {
      error: new Response(
        JSON.stringify({ success: false, error: 'Invalid access token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    };
  }

  // Check if user is super admin using service role (bypasses RLS)
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('[AUTH] Error fetching profile:', profileError);
    return {
      error: new Response(
        JSON.stringify({ success: false, error: 'Failed to verify admin role' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    };
  }

  if (profile.role !== 'super_admin') {
    return {
      error: new Response(
        JSON.stringify({ success: false, error: 'Forbidden: Super admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    };
  }

  return { supabaseAdmin, user };
}

// ============================================
// MAIN HANDLER: Admin Settings API
// Endpoints: languages, translations, translation-stats, settings
// ============================================
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify super admin
    const authResult = await verifySuperAdmin(req);
    if (authResult.error) {
      return authResult.error;
    }

    const { supabaseAdmin } = authResult;

    // Parse URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(p => p);
    const relevantParts = pathParts.filter(p => !['functions', 'v1', 'admin-settings-api'].includes(p));
    const endpoint = relevantParts.join('/') || 'languages';

    console.log('[ADMIN-SETTINGS-API] Request:', req.method, endpoint);

    // Route: GET /languages - List languages
    if (endpoint === 'languages' && req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('languages')
        .select('*')
        .order('name');

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, languages: data || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: GET /translations - Get all translations
    if (endpoint === 'translations' && req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('translations')
        .select('*')
        .order('translation_key');

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, translations: data || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: GET /translation-stats - Translation progress per language
    if (endpoint === 'translation-stats' && req.method === 'GET') {
      // Get all languages
      const { data: languages, error: langError } = await supabaseAdmin
        .from('languages')
        .select('code, name')
        .eq('is_active', true);

      if (langError) throw langError;

      // Get total keys from base language (ru)
      const { data: baseKeys, error: baseError } = await supabaseAdmin
        .from('translations')
        .select('translation_key')
        .eq('lang_code', 'ru');

      if (baseError) throw baseError;

      const totalKeys = baseKeys?.length || 0;
      const stats: any = {
        totalKeys,
        translatedKeys: {},
        progress: {},
        lastUpdated: {}
      };

      // Get stats for each language
      for (const lang of languages || []) {
        const { data: translations, error } = await supabaseAdmin
          .from('translations')
          .select('translation_key, updated_at')
          .eq('lang_code', lang.code);

        if (error) throw error;

        const translatedCount = translations?.length || 0;
        stats.translatedKeys[lang.code] = translatedCount;
        stats.progress[lang.code] = totalKeys > 0 ? Math.round((translatedCount / totalKeys) * 100) : 0;

        // Get last updated timestamp
        if (translations && translations.length > 0) {
          const lastUpdated = translations.reduce((latest, t) => {
            return new Date(t.updated_at) > new Date(latest) ? t.updated_at : latest;
          }, translations[0].updated_at);
          stats.lastUpdated[lang.code] = lastUpdated;
        }
      }

      return new Response(
        JSON.stringify({ success: true, ...stats }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: GET /settings/:key - Get admin setting by key
    if (endpoint.startsWith('settings/') && req.method === 'GET') {
      const settingKey = endpoint.replace('settings/', '');
      console.log('[ADMIN-SETTINGS-API] Getting setting:', settingKey);

      const { data, error } = await supabaseAdmin
        .from('admin_settings')
        .select('*')
        .eq('key', settingKey)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true, setting: data || null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: POST /settings - Save admin setting
    if (endpoint === 'settings' && req.method === 'POST') {
      const body = await req.json();
      const { key, value } = body;

      if (!key) {
        return new Response(
          JSON.stringify({ success: false, error: 'Setting key is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[ADMIN-SETTINGS-API] Saving setting:', key);

      // Upsert setting
      const { data, error } = await supabaseAdmin
        .from('admin_settings')
        .upsert({
          key,
          value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        })
        .select()
        .single();

      if (error) {
        console.error('[ADMIN-SETTINGS-API] Error saving setting:', error);
        throw error;
      }

      console.log('[ADMIN-SETTINGS-API] Setting saved successfully:', key);

      return new Response(
        JSON.stringify({ success: true, setting: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Unknown endpoint
    return new Response(
      JSON.stringify({ success: false, error: `Unknown endpoint: ${endpoint}` }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[ADMIN-SETTINGS-API] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

