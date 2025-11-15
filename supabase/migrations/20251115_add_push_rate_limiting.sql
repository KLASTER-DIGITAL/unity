-- Add push rate limiting tables
-- Migration: 20251115_add_push_rate_limiting
-- Purpose: Track push notification sends per user for rate limiting

-- Create push_rate_limit table
CREATE TABLE IF NOT EXISTS push_rate_limit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notification_type TEXT NOT NULL, -- 'campaign', 'realtime', 'scheduled', 'ai_personalized'
  campaign_id UUID REFERENCES push_campaigns(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
-- Index for hourly rate limit check (last 1 hour)
CREATE INDEX IF NOT EXISTS idx_push_rate_limit_user_hour 
ON push_rate_limit(user_id, sent_at DESC)
WHERE sent_at > NOW() - INTERVAL '1 hour';

-- Index for daily rate limit check (last 24 hours)
CREATE INDEX IF NOT EXISTS idx_push_rate_limit_user_day 
ON push_rate_limit(user_id, sent_at DESC)
WHERE sent_at > NOW() - INTERVAL '24 hours';

-- Index for cleanup (delete old records)
CREATE INDEX IF NOT EXISTS idx_push_rate_limit_sent_at 
ON push_rate_limit(sent_at DESC);

-- RLS policies for push_rate_limit
ALTER TABLE push_rate_limit ENABLE ROW LEVEL SECURITY;

-- Users can read their own rate limit data
CREATE POLICY "Users can read own rate limit data"
ON push_rate_limit FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Super admins can read all rate limit data
CREATE POLICY "Super admins can read all rate limit data"
ON push_rate_limit FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- Service role can insert rate limit records
CREATE POLICY "Service role can insert rate limit records"
ON push_rate_limit FOR INSERT
TO service_role
WITH CHECK (true);

-- Add rate limit settings to admin_settings
INSERT INTO admin_settings (key, value, category, metadata)
VALUES 
  ('push_rate_limit_per_hour', '100', 'push', '{"description": "Maximum push notifications per user per hour", "type": "number"}'),
  ('push_rate_limit_per_day', '500', 'push', '{"description": "Maximum push notifications per user per day", "type": "number"}'),
  ('push_rate_limit_enabled', 'true', 'push', '{"description": "Enable rate limiting for push notifications", "type": "boolean"}')
ON CONFLICT (key) DO NOTHING;

-- Add comment
COMMENT ON TABLE push_rate_limit IS 'Tracks push notification sends per user for rate limiting';

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_push_rate_limit(
  p_user_id UUID,
  p_max_per_hour INTEGER DEFAULT 100,
  p_max_per_day INTEGER DEFAULT 500
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count_hour INTEGER;
  v_count_day INTEGER;
  v_result JSONB;
BEGIN
  -- Count pushes in last hour
  SELECT COUNT(*) INTO v_count_hour
  FROM push_rate_limit
  WHERE user_id = p_user_id
  AND sent_at > NOW() - INTERVAL '1 hour';

  -- Count pushes in last day
  SELECT COUNT(*) INTO v_count_day
  FROM push_rate_limit
  WHERE user_id = p_user_id
  AND sent_at > NOW() - INTERVAL '24 hours';

  -- Build result
  v_result := jsonb_build_object(
    'allowed', v_count_hour < p_max_per_hour AND v_count_day < p_max_per_day,
    'count_hour', v_count_hour,
    'count_day', v_count_day,
    'limit_hour', p_max_per_hour,
    'limit_day', p_max_per_day,
    'remaining_hour', GREATEST(0, p_max_per_hour - v_count_hour),
    'remaining_day', GREATEST(0, p_max_per_day - v_count_day)
  );

  RETURN v_result;
END;
$$;

-- Function to record push send
CREATE OR REPLACE FUNCTION record_push_send(
  p_user_id UUID,
  p_notification_type TEXT,
  p_campaign_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO push_rate_limit (user_id, notification_type, campaign_id)
  VALUES (p_user_id, p_notification_type, p_campaign_id)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Cleanup function (delete records older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_push_rate_limit()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM push_rate_limit
  WHERE sent_at < NOW() - INTERVAL '7 days';

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- Add comment to functions
COMMENT ON FUNCTION check_push_rate_limit IS 'Checks if user has exceeded push notification rate limits';
COMMENT ON FUNCTION record_push_send IS 'Records a push notification send for rate limiting';
COMMENT ON FUNCTION cleanup_push_rate_limit IS 'Deletes push rate limit records older than 7 days';

