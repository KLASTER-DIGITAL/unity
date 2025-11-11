-- ============================================================================
-- SETUP SUPABASE CRON JOBS
-- ============================================================================
-- Автоматическая настройка Cron Jobs для Edge Functions
-- Дата: 2025-11-11

-- ============================================================================
-- 1. ENABLE PG_CRON EXTENSION
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================================
-- 2. GRANT PERMISSIONS
-- ============================================================================
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- ============================================================================
-- 3. CREATE CRON JOB #1: subscription-expiry-checker
-- ============================================================================
-- Назначение: Проверяет истекшие подписки каждый день в 00:00 UTC
-- Расписание: 0 0 * * * (daily at 00:00 UTC = 03:00 MSK)

SELECT cron.schedule(
  'subscription-expiry-checker',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url := 'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/subscription-expiry-checker',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- ============================================================================
-- 4. CREATE CRON JOB #2: trial-expiry-reminder
-- ============================================================================
-- Назначение: Отправляет уведомления за 3 дня до окончания trial
-- Расписание: 0 9 * * * (daily at 09:00 UTC = 12:00 MSK)

SELECT cron.schedule(
  'trial-expiry-reminder',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/trial-expiry-reminder',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- ============================================================================
-- 5. VERIFICATION
-- ============================================================================

-- Проверить созданные Cron Jobs
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  database
FROM cron.job
ORDER BY jobname;

-- Проверить историю выполнения (последние 10)
SELECT 
  job_id,
  job_name,
  status,
  start_time,
  end_time,
  return_message
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;

-- ============================================================================
-- 6. MANUAL TESTING (опционально)
-- ============================================================================

-- Запустить subscription-expiry-checker вручную
-- SELECT cron.unschedule('subscription-expiry-checker');
-- SELECT cron.schedule('subscription-expiry-checker-test', '* * * * *', $$ ... $$);

-- Запустить trial-expiry-reminder вручную
-- SELECT cron.unschedule('trial-expiry-reminder');
-- SELECT cron.schedule('trial-expiry-reminder-test', '* * * * *', $$ ... $$);

-- ============================================================================
-- 7. CLEANUP (если нужно удалить)
-- ============================================================================

-- Удалить Cron Jobs
-- SELECT cron.unschedule('subscription-expiry-checker');
-- SELECT cron.unschedule('trial-expiry-reminder');

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. Все расписания в UTC timezone
-- 2. Service Role Key должен быть настроен в app.settings.service_role_key
-- 3. Edge Functions должны быть задеплоены перед настройкой Cron Jobs
-- 4. Логи Cron Jobs хранятся в cron.job_run_details (7 дней)
-- 5. При ошибке Cron Job НЕ повторяется автоматически

