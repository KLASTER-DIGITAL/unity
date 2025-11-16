-- Migration: Create webhook for entry_summaries INSERT
-- Date: 2025-11-16
-- Purpose: Trigger push notification when AI analysis is ready

-- Enable http extension if not already enabled
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Create function to call Edge Function via http
CREATE OR REPLACE FUNCTION notify_ai_analysis_ready()
RETURNS TRIGGER AS $$
DECLARE
  service_role_key TEXT;
  request_id INT;
BEGIN
  -- Get service role key from admin_settings
  SELECT value INTO service_role_key
  FROM admin_settings
  WHERE key = 'supabase_service_role_key';

  -- Call push-realtime-trigger Edge Function using pg_net
  SELECT net.http_post(
    url := 'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-realtime-trigger',
    body := jsonb_build_object(
      'type', 'ai_analysis_ready',
      'user_id', NEW.user_id,
      'entry_id', NEW.entry_id,
      'summary_id', NEW.id
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    )
  ) INTO request_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on entry_summaries INSERT
DROP TRIGGER IF EXISTS trigger_notify_ai_analysis_ready ON entry_summaries;

CREATE TRIGGER trigger_notify_ai_analysis_ready
  AFTER INSERT ON entry_summaries
  FOR EACH ROW
  EXECUTE FUNCTION notify_ai_analysis_ready();

-- Grant permissions
GRANT EXECUTE ON FUNCTION notify_ai_analysis_ready() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_ai_analysis_ready() TO service_role;

-- Comment
COMMENT ON FUNCTION notify_ai_analysis_ready() IS 'Webhook function to trigger push notification when AI analysis is ready';
COMMENT ON TRIGGER trigger_notify_ai_analysis_ready ON entry_summaries IS 'Trigger push notification when AI analysis is ready';

