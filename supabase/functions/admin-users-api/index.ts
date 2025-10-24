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

  console.log('[AUTH] User verified:', user.id, user.email);

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

  console.log('[AUTH] Profile role:', profile.role);

  if (profile.role !== 'super_admin') {
    console.log('[AUTH] Access denied - user is not super admin');
    return {
      error: new Response(
        JSON.stringify({ success: false, error: 'Forbidden: Super admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    };
  }

  console.log('[AUTH] ✅ Super admin verified:', user.email);

  return { supabaseAdmin, user };
}

// ============================================
// MAIN HANDLER: Admin Users API
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

    console.log('[ADMIN-USERS-API] Fetching users list...');

    // ✅ FIX N+1: Используем один запрос с подсчетом через SQL
    // Вместо 1 + N запросов (где N = количество пользователей)
    // делаем 1 запрос с LEFT JOIN и COUNT + streak calculation
    const { data: usersRaw, error } = await supabaseAdmin
      .rpc('get_users_with_stats');

    if (error) {
      // Fallback на старый метод если RPC функция не существует
      console.warn('⚠️ RPC function get_users_with_stats not found, using fallback');

      const { data: users, error: usersError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Получаем все подсчеты одним запросом
      const { data: entriesCounts, error: countsError } = await supabaseAdmin
        .from('entries')
        .select('user_id')
        .order('user_id');

      if (countsError) throw countsError;

      // Группируем подсчеты по user_id
      const countsMap = (entriesCounts || []).reduce((acc: Record<string, number>, entry: any) => {
        acc[entry.user_id] = (acc[entry.user_id] || 0) + 1;
        return acc;
      }, {});

      // Добавляем подсчеты к пользователям
      const usersWithStats = (users || []).map(user => ({
        ...user,
        entriesCount: countsMap[user.id] || 0
      }));

      return new Response(
        JSON.stringify({ success: true, users: usersWithStats }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ FIX: Map snake_case to camelCase for frontend
    const usersFormatted = (usersRaw || []).map((user: any) => ({
      ...user,
      entriesCount: user.entries_count || 0,
      currentStreak: user.current_streak || 0, // ✅ NEW: Add streak
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      isPremium: user.is_premium,
      diaryName: user.diary_name,
      diaryEmoji: user.diary_emoji,
      notificationSettings: user.notification_settings,
      onboardingCompleted: user.onboarding_completed,
      telegramId: user.telegram_id,
      telegramUsername: user.telegram_username,
      telegramAvatar: user.telegram_avatar,
      biometricEnabled: user.biometric_enabled,
      backupEnabled: user.backup_enabled,
      firstDayOfWeek: user.first_day_of_week,
      privacySettings: user.privacy_settings
    }));

    console.log('[ADMIN-USERS-API] ✅ Users fetched:', usersFormatted.length);

    return new Response(
      JSON.stringify({ success: true, users: usersFormatted, total: usersFormatted.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[ADMIN-USERS-API] ❌ Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

