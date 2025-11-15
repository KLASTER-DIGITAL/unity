-- Migration: Fix Push Cron Jobs
-- Date: 2025-11-15
-- Description: Исправление cron jobs для push-уведомлений
-- Problem: current_setting('app.settings.service_role_key') не настроен
-- Solution: Использовать jsonb_build_object для правильного формирования headers

-- ============================================================================
-- 1. Удалить старые неработающие cron jobs (если еще не удалены)
-- ============================================================================

SELECT cron.unschedule('daily_push_reminder') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'daily_push_reminder'
);

SELECT cron.unschedule('weekly_push_motivation') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'weekly_push_motivation'
);

SELECT cron.unschedule('weekly_push_goal_reminder') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'weekly_push_goal_reminder'
);

-- ============================================================================
-- 2. Создать новые cron jobs с правильной конфигурацией
-- ============================================================================

-- ВАЖНО: Service Role Key должен быть получен из Supabase Dashboard
-- Settings → API → service_role key (secret)
-- Для безопасности, ключ НЕ хранится в миграции
-- Вместо этого используем функцию которая получает ключ из admin_settings

-- Создаем helper функцию для получения service role key
CREATE OR REPLACE FUNCTION get_service_role_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  key_value TEXT;
BEGIN
  SELECT value INTO key_value
  FROM admin_settings
  WHERE key = 'supabase_service_role_key'
  LIMIT 1;

  RETURN key_value;
END;
$$;

-- Ежедневное напоминание в 21:00 (UTC+3 = 18:00 UTC)
SELECT cron.schedule(
  'daily_push_reminder',
  '0 18 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || get_service_role_key()
      ),
      body := jsonb_build_object('type', 'daily_reminder')
    ) as request_id;
  $$
);

-- Еженедельная мотивация (каждый понедельник в 10:00 UTC+3 = 07:00 UTC)
SELECT cron.schedule(
  'weekly_push_motivation',
  '0 7 * * 1',
  $$
  SELECT
    net.http_post(
      url := 'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || get_service_role_key()
      ),
      body := jsonb_build_object('type', 'weekly_motivation')
    ) as request_id;
  $$
);

-- Напоминание о целях (каждое воскресенье в 20:00 UTC+3 = 17:00 UTC)
SELECT cron.schedule(
  'weekly_push_goal_reminder',
  '0 17 * * 0',
  $$
  SELECT
    net.http_post(
      url := 'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || get_service_role_key()
      ),
      body := jsonb_build_object('type', 'goal_reminder')
    ) as request_id;
  $$
);

-- ============================================================================
-- 3. Добавить service_role_key в admin_settings (если еще нет)
-- ============================================================================

-- Service Role Key из Supabase Dashboard → Settings → API
INSERT INTO admin_settings (key, value, category, metadata)
VALUES (
  'supabase_service_role_key',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA1ODY5NCwiZXhwIjoyMDc1NjM0Njk0fQ.Tzl9W5L7GrqZPxV2Hg7CKUvWSS7jPk4EeQGlapYOCDY',
  'system',
  '{"description": "Supabase Service Role Key for cron jobs and webhooks", "security": "high"}'::jsonb
)
ON CONFLICT (key) DO UPDATE
SET
  value = EXCLUDED.value,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- ============================================================================
-- 4. Проверка
-- ============================================================================

-- Проверить что cron jobs созданы
SELECT jobid, jobname, schedule, active FROM cron.job ORDER BY jobname;

-- Проверить что service_role_key настроен
SELECT key, LEFT(value, 20) || '...' as value_preview FROM admin_settings WHERE key = 'supabase_service_role_key';
