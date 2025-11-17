-- Setup daily cron job for stats aggregation
-- Date: 2025-11-17
-- Purpose: Call stats-aggregator edge function once per day

-- Unschedule previous job if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'stats-daily-aggregation') THEN
    PERFORM cron.unschedule('stats-daily-aggregation');
  END IF;
END;
$$;

SELECT cron.schedule(
  'stats-daily-aggregation',
  '5 0 * * *', -- every day at 00:05 UTC
  $$
  SELECT
    net.http_post(
      url := 'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/stats-aggregator',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || get_service_role_key()
      ),
      body := '{"scope": "daily"}'::jsonb
    ) as request_id;
  $$
);

