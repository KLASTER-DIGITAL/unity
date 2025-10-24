import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    console.log(`[PROFILES] ${method} ${path}`);

    // Health check
    if (path.endsWith('/health')) {
      return new Response(
        JSON.stringify({
          success: true,
          status: 'ok',
          service: 'profiles',
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user profile
    if (path.endsWith('/create') && method === 'POST') {
      const profileData = await req.json();
      console.log('[PROFILES] Creating profile:', profileData);

      if (!profileData.id || !profileData.email) {
        return new Response(
          JSON.stringify({ success: false, error: 'id and email are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: profileData.id,
          name: profileData.name || 'Пользователь',
          email: profileData.email,
          language: profileData.language || 'ru',
          diary_name: profileData.diaryName || 'Мой дневник',
          diary_emoji: profileData.diaryEmoji || '📝',
          notification_settings: profileData.notificationSettings || {
            selectedTime: 'none',
            morningTime: '08:00',
            eveningTime: '21:00',
            permissionGranted: false
          },
          onboarding_completed: profileData.onboardingCompleted || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('[PROFILES] Error creating profile:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const profile = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        language: data.language,
        diaryName: data.diary_name,
        diaryEmoji: data.diary_emoji,
        notificationSettings: data.notification_settings,
        onboardingCompleted: data.onboarding_completed,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      console.log('[PROFILES] Profile created successfully:', profile);
      return new Response(
        JSON.stringify({ success: true, profile }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile by ID
    if (method === 'GET' && !path.endsWith('/health') && !path.endsWith('/create')) {
      const userId = path.split('/').pop();
      console.log(`[PROFILES] Fetching profile for user: ${userId}`);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[PROFILES] Error fetching profile:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!data) {
        return new Response(
          JSON.stringify({ success: false, error: 'Profile not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const profile = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
        language: data.language,
        diaryName: data.diary_name,
        diaryEmoji: data.diary_emoji,
        notificationSettings: data.notification_settings,
        onboardingCompleted: data.onboarding_completed,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        theme: data.theme,
        isPremium: data.is_premium,
        biometricEnabled: data.biometric_enabled,
        backupEnabled: data.backup_enabled,
        firstDayOfWeek: data.first_day_of_week,
        privacySettings: data.privacy_settings
      };

      return new Response(
        JSON.stringify({ success: true, profile }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update user profile
    if (method === 'PUT') {
      const userId = path.split('/').pop();
      const updates = await req.json();
      console.log(`[PROFILES] Updating profile for user: ${userId}`, updates);

      const dbUpdates: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
      if (updates.language !== undefined) dbUpdates.language = updates.language;
      if (updates.diaryName !== undefined) dbUpdates.diary_name = updates.diaryName;
      if (updates.diaryEmoji !== undefined) dbUpdates.diary_emoji = updates.diaryEmoji;
      if (updates.notificationSettings !== undefined) dbUpdates.notification_settings = updates.notificationSettings;
      if (updates.onboardingCompleted !== undefined) dbUpdates.onboarding_completed = updates.onboardingCompleted;
      if (updates.theme !== undefined) dbUpdates.theme = updates.theme;
      if (updates.isPremium !== undefined) dbUpdates.is_premium = updates.isPremium;
      if (updates.biometricEnabled !== undefined) dbUpdates.biometric_enabled = updates.biometricEnabled;
      if (updates.backupEnabled !== undefined) dbUpdates.backup_enabled = updates.backupEnabled;
      if (updates.firstDayOfWeek !== undefined) dbUpdates.first_day_of_week = updates.firstDayOfWeek;
      if (updates.privacySettings !== undefined) dbUpdates.privacy_settings = updates.privacySettings;

      const { data, error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('[PROFILES] Error updating profile:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const profile = {
        id: data.id,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        language: data.language,
        diaryName: data.diary_name,
        diaryEmoji: data.diary_emoji,
        notificationSettings: data.notification_settings,
        onboardingCompleted: data.onboarding_completed,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        theme: data.theme,
        isPremium: data.is_premium,
        biometricEnabled: data.biometric_enabled,
        backupEnabled: data.backup_enabled,
        firstDayOfWeek: data.first_day_of_week,
        privacySettings: data.privacy_settings
      };

      console.log('[PROFILES] Profile updated successfully:', profile);
      return new Response(
        JSON.stringify({ success: true, profile }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Not found
    return new Response(
      JSON.stringify({ success: false, error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[PROFILES] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

