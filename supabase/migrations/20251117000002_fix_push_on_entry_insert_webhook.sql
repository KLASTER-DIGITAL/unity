-- Migration: Fix push_on_entry_insert webhook to send correct payload
-- Date: 2025-11-17
-- Purpose: Fix webhook payload format to match Edge Function expectations

-- Drop existing webhook trigger
DROP TRIGGER IF EXISTS push_on_entry_insert ON entries;

-- Create function to call Edge Function with correct payload
CREATE OR REPLACE FUNCTION notify_entry_created()
RETURNS TRIGGER AS $$
DECLARE
  service_role_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA1ODY5NCwiZXhwIjoyMDc1NjM0Njk0fQ.Tzl9W5L7GrqZPxV2Hg7CKUvWSS7jPk4EeQGlapYOCDY';
  request_id INT;
BEGIN
  -- Call push-realtime-trigger Edge Function with correct payload format
  SELECT net.http_post(
    url := 'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-realtime-trigger',
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'entries',
      'record', row_to_json(NEW)
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    )
  ) INTO request_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on entries INSERT
CREATE TRIGGER push_on_entry_insert
  AFTER INSERT ON entries
  FOR EACH ROW
  EXECUTE FUNCTION notify_entry_created();

-- Grant permissions
GRANT EXECUTE ON FUNCTION notify_entry_created() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_entry_created() TO service_role;

-- Comment
COMMENT ON FUNCTION notify_entry_created() IS 'Webhook function to trigger push notification when entry is created';
COMMENT ON TRIGGER push_on_entry_insert ON entries IS 'Trigger push notification when entry is created';

