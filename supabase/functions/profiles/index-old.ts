import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// ======================
// PROFILE ENDPOINTS
// ======================

// Health check (MUST be before dynamic routes)
app.get('/health', (c) => {
  return c.json({
    success: true,
    status: 'ok',
    service: 'profiles',
    timestamp: new Date().toISOString()
  });
});

// Create user profile
app.post('/create', async (c) => {
  try {
    const profileData = await c.req.json();

    console.log('[PROFILES] Creating profile:', profileData);

    if (!profileData.id || !profileData.email) {
      return c.json({ success: false, error: 'id and email are required' }, 400);
    }

    // Save to Supabase database
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
      console.error('[PROFILES] Error creating profile in Supabase:', error);
      return c.json({ success: false, error: error.message }, 500);
    }

    // Convert to camelCase for frontend
    const profile = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role, // 🔒 SECURITY: Add role for access control
      language: data.language,
      diaryName: data.diary_name,
      diaryEmoji: data.diary_emoji,
      notificationSettings: data.notification_settings,
      onboardingCompleted: data.onboarding_completed,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    console.log('[PROFILES] Profile created successfully:', profile);

    return c.json({ success: true, profile });

  } catch (error) {
    console.error('[PROFILES] Error creating profile:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get user profile by ID
app.get('/:id', async (c) => {
  try {
    const userId = c.req.param('id');

    console.log(`[PROFILES] Fetching profile for user: ${userId}`);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[PROFILES] Error fetching profile:', error);
      return c.json({ success: false, error: error.message }, 500);
    }

    if (!data) {
      return c.json({ success: false, error: 'Profile not found' }, 404);
    }

    // Convert to camelCase for frontend
    const profile = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role, // 🔒 SECURITY: Add role for access control
      avatar: data.avatar, // Profile photo URL
      language: data.language,
      diaryName: data.diary_name,
      diaryEmoji: data.diary_emoji,
      notificationSettings: data.notification_settings,
      onboardingCompleted: data.onboarding_completed,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      // New fields from migration 20251018
      theme: data.theme,
      isPremium: data.is_premium,
      biometricEnabled: data.biometric_enabled,
      backupEnabled: data.backup_enabled,
      firstDayOfWeek: data.first_day_of_week,
      privacySettings: data.privacy_settings
    };

    return c.json({ success: true, profile });

  } catch (error) {
    console.error('[PROFILES] Error fetching profile:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update user profile
app.put('/:id', async (c) => {
  try {
    const userId = c.req.param('id');
    const updates = await c.req.json();

    console.log(`[PROFILES] Updating profile for user: ${userId}`, updates);

    // Convert camelCase to snake_case for database
    const dbUpdates: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar; // Profile photo URL
    if (updates.language !== undefined) dbUpdates.language = updates.language;
    if (updates.diaryName !== undefined) dbUpdates.diary_name = updates.diaryName;
    if (updates.diaryEmoji !== undefined) dbUpdates.diary_emoji = updates.diaryEmoji;
    if (updates.notificationSettings !== undefined) dbUpdates.notification_settings = updates.notificationSettings;
    if (updates.onboardingCompleted !== undefined) dbUpdates.onboarding_completed = updates.onboardingCompleted;
    // New fields from migration 20251018
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
      return c.json({ success: false, error: error.message }, 500);
    }

    // Convert to camelCase for frontend
    const profile = {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar, // Profile photo URL
      language: data.language,
      diaryName: data.diary_name,
      diaryEmoji: data.diary_emoji,
      notificationSettings: data.notification_settings,
      onboardingCompleted: data.onboarding_completed,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      // New fields from migration 20251018
      theme: data.theme,
      isPremium: data.is_premium,
      biometricEnabled: data.biometric_enabled,
      backupEnabled: data.backup_enabled,
      firstDayOfWeek: data.first_day_of_week,
      privacySettings: data.privacy_settings
    };

    console.log('[PROFILES] Profile updated successfully:', profile);

    return c.json({ success: true, profile });

  } catch (error) {
    console.error('[PROFILES] Error updating profile:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Запуск сервера
Deno.serve((req) => app.fetch(req));

