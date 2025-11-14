-- Migration: Setup Hourly Cron Jobs for Personalized Push Notifications
-- Date: 2025-11-12
-- Description: Настройка Cron Jobs для персонализированной отправки уведомлений с учетом timezone

-- ============================================================================
-- 1. УДАЛЯЕМ СТАРЫЕ CRON JOBS (с фиксированным временем)
-- ============================================================================

-- Удаляем старые jobs если они существуют
SELECT cron.unschedule('push-daily-reminder') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'push-daily-reminder'
);

SELECT cron.unschedule('push-weekly-motivation') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'push-weekly-motivation'
);

SELECT cron.unschedule('push-goal-reminder') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'push-goal-reminder'
);

-- ============================================================================
-- 2. СОЗДАЕМ НОВЫЕ HOURLY CRON JOBS (с учетом timezone)
-- ============================================================================

-- ВАЖНО: Замените YOUR_SERVICE_ROLE_KEY на реальный service_role_key из Supabase Dashboard
-- Dashboard → Settings → API → service_role (secret)

-- Daily Reminder: запускается КАЖДЫЙ ЧАС
-- Проверяет какие пользователи должны получить уведомление в их локальное время
-- ✅ ИСПРАВЛЕНО: Используем параметр ?type= вместо ?action=
SELECT cron.schedule(
  'push-daily-reminder-hourly',
  '0 * * * *',  -- Каждый час в 00 минут
  $$
  SELECT
    net.http_post(
      url:='https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?type=daily_reminder',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Weekly Motivation: запускается КАЖДЫЙ ЧАС В ВОСКРЕСЕНЬЕ
-- Проверяет какие пользователи должны получить уведомление в их локальное время
-- ✅ ИСПРАВЛЕНО: Используем параметр ?type= вместо ?action=
SELECT cron.schedule(
  'push-weekly-motivation-hourly',
  '0 * * * 0',  -- Каждый час в воскресенье
  $$
  SELECT
    net.http_post(
      url:='https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?type=weekly_motivation',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Goal Reminder: запускается КАЖДЫЙ ЧАС В ВОСКРЕСЕНЬЕ
-- Проверяет какие пользователи должны получить уведомление в их локальное время
-- ✅ ИСПРАВЛЕНО: Используем параметр ?type= вместо ?action=
SELECT cron.schedule(
  'push-goal-reminder-hourly',
  '0 * * * 0',  -- Каждый час в воскресенье
  $$
  SELECT
    net.http_post(
      url:='https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?type=goal_reminder',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- ============================================================================
-- 3. ПРОВЕРКА СОЗДАННЫХ JOBS
-- ============================================================================

-- Выводим список всех активных Cron Jobs
SELECT 
  jobname,
  schedule,
  active,
  jobid
FROM cron.job
WHERE jobname LIKE 'push-%'
ORDER BY jobname;

-- ============================================================================
-- 4. КОММЕНТАРИИ
-- ============================================================================

COMMENT ON EXTENSION pg_cron IS 'Cron-based job scheduler for PostgreSQL - используется для автоматической отправки push уведомлений с учетом timezone пользователей';

