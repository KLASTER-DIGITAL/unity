import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const app = new Hono();

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
app.use('*', logger(console.log));

// Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ======================
// PROFILE ENDPOINTS
// ======================

// Create user profile
app.post('/profiles/create', async (c) => {
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

// Get user profile
app.get('/profiles/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

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
      language: data.language,
      diaryName: data.diary_name,
      diaryEmoji: data.diary_emoji,
      notificationSettings: data.notification_settings,
      onboardingCompleted: data.onboarding_completed,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    return c.json({ success: true, profile });

  } catch (error) {
    console.error('[PROFILES] Error fetching profile:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update user profile
app.put('/profiles/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const updates = await c.req.json();

    console.log(`[PROFILES] Updating profile for user: ${userId}`, updates);

    // Convert camelCase to snake_case for database
    const dbUpdates: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.language !== undefined) dbUpdates.language = updates.language;
    if (updates.diaryName !== undefined) dbUpdates.diary_name = updates.diaryName;
    if (updates.diaryEmoji !== undefined) dbUpdates.diary_emoji = updates.diaryEmoji;
    if (updates.notificationSettings !== undefined) dbUpdates.notification_settings = updates.notificationSettings;
    if (updates.onboardingCompleted !== undefined) dbUpdates.onboarding_completed = updates.onboardingCompleted;

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
      language: data.language,
      diaryName: data.diary_name,
      diaryEmoji: data.diary_emoji,
      notificationSettings: data.notification_settings,
      onboardingCompleted: data.onboarding_completed,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    console.log('[PROFILES] Profile updated successfully:', profile);

    return c.json({ success: true, profile });

  } catch (error) {
    console.error('[PROFILES] Error updating profile:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Health check
app.get('/profiles/health', async (c) => {
  return c.json({
    success: true,
    status: 'ok',
    service: 'profiles',
    timestamp: new Date().toISOString()
  });
});

// Запуск сервера
Deno.serve(app.fetch);

