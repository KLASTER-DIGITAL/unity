import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    // Get access token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // Create Supabase client with service role key for auth verification
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) {
      console.error('[AUTH] User verification failed:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid access token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user JWT to respect RLS policies
    const supabaseUser = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // Check if user is super admin
    const { data: profile, error: profileError } = await supabaseUser
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('[AUTH] Error checking super admin:', profileError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to verify admin role' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (profile.role !== 'super_admin') {
      console.log('[AUTH] User is not super admin:', profile.role);
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden: Super admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[AUTH] ✅ Super admin verified:', user.id);

    // Parse URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(p => p);
    // Remove 'functions', 'v1', 'admin-api' from path
    const relevantParts = pathParts.filter(p => !['functions', 'v1', 'admin-api'].includes(p));
    // Remove 'admin' prefix if present (for /admin/stats -> /stats)
    const endpoint = relevantParts.filter(p => p !== 'admin').join('/') || 'stats';

    console.log('[ADMIN-API] Request:', req.method, endpoint, 'from path:', url.pathname);

    // Route: GET /stats - Dashboard statistics
    if (endpoint === 'stats' && req.method === 'GET') {
      console.log('[ADMIN-API] Fetching admin stats...');

      // Get all profiles
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, created_at, is_premium');

      if (profilesError) throw profilesError;

      const totalUsers = profiles?.length || 0;

      // Get all entries
      const { data: entries, error: entriesError } = await supabaseAdmin
        .from('entries')
        .select('id, user_id, created_at');

      if (entriesError) throw entriesError;

      const totalEntries = entries?.length || 0;

      // Calculate active users and new users today
      const activeUsersSet = new Set();
      let newUsersToday = 0;
      const activeTodaySet = new Set();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Count new users today
      for (const profile of profiles || []) {
        if (profile.created_at) {
          const createdDate = new Date(profile.created_at);
          createdDate.setHours(0, 0, 0, 0);
          if (createdDate.getTime() === today.getTime()) {
            newUsersToday++;
          }
        }
      }

      // Count active users
      for (const entry of entries || []) {
        activeUsersSet.add(entry.user_id);

        // Active today
        const entryDate = new Date(entry.created_at);
        entryDate.setHours(0, 0, 0, 0);
        if (entryDate.getTime() === today.getTime()) {
          activeTodaySet.add(entry.user_id);
        }
      }

      // Count premium users
      const premiumUsers = profiles?.filter(p => p.is_premium).length || 0;

      // Calculate revenue (estimate: 499 RUB/month per premium user)
      const totalRevenue = premiumUsers * 499;

      const stats = {
        totalUsers,
        totalEntries,
        activeUsers: activeUsersSet.size,
        newUsersToday,
        activeToday: activeTodaySet.size,
        premiumUsers,
        totalRevenue,
        pwaInstalls: 0
      };

      console.log('[ADMIN-API] ✅ Stats:', stats);
      
      return new Response(
        JSON.stringify({ success: true, ...stats }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: GET /users - List all users
    if (endpoint === 'users' && req.method === 'GET') {
      const { data: users, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get entries count for each user
      const usersWithStats = await Promise.all(
        (users || []).map(async (user) => {
          const { count } = await supabaseAdmin
            .from('entries')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          return {
            ...user,
            entriesCount: count || 0
          };
        })
      );

      return new Response(
        JSON.stringify({ success: true, users: usersWithStats }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
      console.log('[ADMIN-API] Getting setting:', settingKey);

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

      console.log('[ADMIN-API] Saving setting:', key);

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
        console.error('[ADMIN-API] Error saving setting:', error);
        throw error;
      }

      console.log('[ADMIN-API] Setting saved successfully:', key);

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
    console.error('[ADMIN-API] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

