-- Migration: Setup Push Notifications Automation
-- Date: 2025-10-28
-- Description: Настройка Database Webhooks и Cron Jobs для автоматических push уведомлений

-- ============================================================================
-- 1. Database Webhooks для Realtime Push
-- ============================================================================

-- Webhook для новых записей (entries INSERT)
-- Вызывает push-realtime-trigger Edge Function
-- Примечание: Webhooks создаются через Supabase Dashboard → Database → Webhooks
-- Этот SQL файл документирует конфигурацию для ручного создания

-- Webhook Configuration:
-- Name: push_on_entry_insert
-- Table: entries
-- Events: INSERT
-- Type: HTTP Request
-- Method: POST
-- URL: https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-realtime-trigger
-- Headers:
--   Content-Type: application/json
--   Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>

-- ПРИМЕЧАНИЕ: Таблица 'achievements' НЕ существует!
-- Достижения хранятся в таблице 'entries' с флагом is_achievement = true
-- Edge Function push-realtime-trigger автоматически проверяет этот флаг
-- и отправляет соответствующее уведомление (обычная запись или достижение)

-- Webhook для AI-анализа (entry_summaries INSERT)
-- Name: push_on_summary_insert
-- Table: entry_summaries
-- Events: INSERT
-- Type: HTTP Request
-- Method: POST
-- URL: https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-realtime-trigger
-- Headers:
--   Content-Type: application/json
--   Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>

-- ============================================================================
-- 2. Cron Jobs для Scheduled Push
-- ============================================================================

-- Примечание: Cron Jobs создаются через Supabase Dashboard → Database → Cron Jobs
-- Или через pg_cron extension

-- Включаем pg_cron extension (если еще не включен)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Ежедневное напоминание в 21:00 (UTC+3 = 18:00 UTC)
-- Cron: 0 18 * * *
SELECT cron.schedule(
  'daily_push_reminder',
  '0 18 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?type=daily_reminder',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- Еженедельная мотивация (каждый понедельник в 10:00 UTC+3 = 07:00 UTC)
-- Cron: 0 7 * * 1
SELECT cron.schedule(
  'weekly_push_motivation',
  '0 7 * * 1',
  $$
  SELECT
    net.http_post(
      url := 'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?type=weekly_motivation',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- Напоминание о целях (каждое воскресенье в 20:00 UTC+3 = 17:00 UTC)
-- Cron: 0 17 * * 0
SELECT cron.schedule(
  'weekly_push_goal_reminder',
  '0 17 * * 0',
  $$
  SELECT
    net.http_post(
      url := 'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?type=goal_reminder',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- ============================================================================
-- 3. Admin Settings для Push Scheduling
-- ============================================================================

-- Добавляем настройки для управления scheduled push через админ-панель
INSERT INTO admin_settings (key, value, category, metadata)
VALUES 
  (
    'push_daily_reminder_enabled',
    'true',
    'push_scheduling',
    '{"description": "Enable daily push reminders at 21:00", "time": "21:00", "timezone": "UTC+3"}'::jsonb
  ),
  (
    'push_daily_reminder_time',
    '21:00',
    'push_scheduling',
    '{"description": "Time for daily push reminders (HH:MM)", "timezone": "UTC+3"}'::jsonb
  ),
  (
    'push_weekly_motivation_enabled',
    'true',
    'push_scheduling',
    '{"description": "Enable weekly motivation push (Monday 10:00)", "day": "Monday", "time": "10:00", "timezone": "UTC+3"}'::jsonb
  ),
  (
    'push_goal_reminder_enabled',
    'true',
    'push_scheduling',
    '{"description": "Enable weekly goal reminder push (Sunday 20:00)", "day": "Sunday", "time": "20:00", "timezone": "UTC+3"}'::jsonb
  ),
  (
    'push_realtime_entries_enabled',
    'true',
    'push_realtime',
    '{"description": "Send push when new entry is created"}'::jsonb
  ),
  (
    'push_realtime_achievements_enabled',
    'true',
    'push_realtime',
    '{"description": "Send push when new achievement is unlocked"}'::jsonb
  ),
  (
    'push_realtime_ai_analysis_enabled',
    'true',
    'push_realtime',
    '{"description": "Send push when AI analysis is ready"}'::jsonb
  )
ON CONFLICT (key) DO UPDATE
SET
  value = EXCLUDED.value,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- ============================================================================
-- 4. Комментарии и документация
-- ============================================================================

COMMENT ON EXTENSION pg_cron IS 'Cron-based job scheduler for PostgreSQL';

-- Просмотр всех cron jobs:
-- SELECT * FROM cron.job;

-- Просмотр истории выполнения cron jobs:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- Удаление cron job (если нужно):
-- SELECT cron.unschedule('daily_push_reminder');
-- SELECT cron.unschedule('weekly_push_motivation');
-- SELECT cron.unschedule('weekly_push_goal_reminder');

-- ============================================================================
-- 5. Rollback Plan
-- ============================================================================

-- Если нужно откатить изменения:
-- 1. Удалить cron jobs:
--    SELECT cron.unschedule('daily_push_reminder');
--    SELECT cron.unschedule('weekly_push_motivation');
--    SELECT cron.unschedule('weekly_push_goal_reminder');
--
-- 2. Удалить webhooks через Supabase Dashboard
--
-- 3. Удалить admin_settings:
--    DELETE FROM admin_settings WHERE category IN ('push_scheduling', 'push_realtime');

