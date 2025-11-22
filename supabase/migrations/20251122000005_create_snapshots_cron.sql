-- Migration: Create Cron job for monthly snapshots generation
-- Created: 2025-11-22
-- Purpose: Automatically generate snapshots on 1st day of each month

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Unschedule existing job if it exists
SELECT cron.unschedule('generate-monthly-snapshots') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'generate-monthly-snapshots'
);

-- Create Cron job for monthly snapshots (1st day of month at 00:00 UTC)
SELECT cron.schedule(
  'generate-monthly-snapshots',
  '0 0 1 * *',  -- At 00:00 on the 1st day of every month
  $$
  SELECT net.http_post(
    url := 'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/snapshots-generate-monthly',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  );
  $$
);

