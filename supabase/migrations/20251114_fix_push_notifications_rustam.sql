-- Fix Push Notifications for rustam@leadshunter.biz
-- Date: 2025-11-14
-- Description: Исправление проблем с push уведомлениями для тестового пользователя
-- ВАЖНО: НЕ хардкодим timezone - система автоматически определяет через Platform Adapter

-- ============================================================================
-- PART 1: Обновить notification_settings для rustam@leadshunter.biz
-- ============================================================================

-- ✅ ПРАВИЛЬНО: Обновляем ТОЛЬКО notification_settings
-- ❌ НЕ обновляем timezone - он автоматически определяется через Platform Adapter
-- Rustam в Батуми (Georgia) → timezone будет 'Asia/Tbilisi' (UTC+4) при следующем входе
UPDATE profiles
SET
  notification_settings = jsonb_build_object(
    'dailyReminder', true,
    'weeklyReport', true,
    'achievements', true,
    'motivational', true,
    'morningTime', '08:00',
    'eveningTime', '21:00',
    'selectedTime', 'evening'  -- Вечернее напоминание в 21:00 по локальному времени
  ),
  updated_at = NOW()
WHERE email = 'rustam@leadshunter.biz';

-- Проверяем что обновление прошло успешно
DO $$
DECLARE
  v_profile RECORD;
BEGIN
  SELECT timezone, notification_settings INTO v_profile
  FROM profiles
  WHERE email = 'rustam@leadshunter.biz';

  RAISE NOTICE '✅ Current timezone: % (автоопределяется через Platform Adapter)', v_profile.timezone;

  IF v_profile.notification_settings->>'dailyReminder' = 'true' THEN
    RAISE NOTICE '✅ dailyReminder enabled';
  ELSE
    RAISE WARNING '❌ dailyReminder NOT enabled';
  END IF;

  IF v_profile.notification_settings->>'selectedTime' = 'evening' THEN
    RAISE NOTICE '✅ selectedTime set to evening';
  ELSE
    RAISE WARNING '❌ selectedTime NOT set to evening: %', v_profile.notification_settings->>'selectedTime';
  END IF;
END $$;

-- ============================================================================
-- PART 2: Проверить активные push subscriptions
-- ============================================================================

-- Проверяем есть ли активная подписка для rustam@leadshunter.biz
DO $$
DECLARE
  v_user_id UUID;
  v_subscription_count INTEGER;
BEGIN
  -- Получаем user_id
  SELECT id INTO v_user_id
  FROM profiles
  WHERE email = 'rustam@leadshunter.biz';
  
  -- Проверяем количество активных подписок
  SELECT COUNT(*) INTO v_subscription_count
  FROM push_subscriptions
  WHERE user_id = v_user_id AND is_active = true;
  
  IF v_subscription_count > 0 THEN
    RAISE NOTICE '✅ Found % active push subscription(s) for rustam@leadshunter.biz', v_subscription_count;
  ELSE
    RAISE WARNING '❌ NO active push subscriptions found for rustam@leadshunter.biz';
    RAISE NOTICE 'ℹ️  User needs to enable push notifications in Settings';
  END IF;
END $$;

-- ============================================================================
-- PART 3: Обновить Cron Jobs (исправить параметр action → type)
-- ============================================================================

-- ❌ ПРОБЛЕМА: Старые Cron Jobs используют параметр ?action=daily_reminder
-- ✅ РЕШЕНИЕ: Edge Function ожидает параметр ?type=daily_reminder

-- Удаляем старые Cron Jobs с неправильным параметром
SELECT cron.unschedule('push-daily-reminder-hourly') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'push-daily-reminder-hourly'
);
SELECT cron.unschedule('push-weekly-motivation-hourly') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'push-weekly-motivation-hourly'
);
SELECT cron.unschedule('push-goal-reminder-hourly') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'push-goal-reminder-hourly'
);

-- Создаем новые Cron Jobs с правильным параметром type
SELECT cron.schedule(
  'push-daily-reminder-hourly',
  '0 * * * *',  -- Каждый час
  $$
  SELECT
    net.http_post(
      url:='https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?type=daily_reminder',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

SELECT cron.schedule(
  'push-weekly-motivation-hourly',
  '0 * * * 1',  -- Каждый час в понедельник
  $$
  SELECT
    net.http_post(
      url:='https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?type=weekly_motivation',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

SELECT cron.schedule(
  'push-goal-reminder-hourly',
  '0 * * * 0',  -- Каждый час в воскресенье
  $$
  SELECT
    net.http_post(
      url:='https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?type=goal_reminder',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- ============================================================================
-- PART 4: Verification Queries
-- ============================================================================

-- Проверяем настройки rustam@leadshunter.biz
SELECT 
  email,
  timezone,
  notification_settings->>'dailyReminder' as daily_reminder,
  notification_settings->>'selectedTime' as selected_time,
  notification_settings->>'eveningTime' as evening_time
FROM profiles
WHERE email = 'rustam@leadshunter.biz';

-- Проверяем активные Cron Jobs
SELECT jobname, schedule, active
FROM cron.job
WHERE jobname LIKE 'push-%'
ORDER BY jobname;

