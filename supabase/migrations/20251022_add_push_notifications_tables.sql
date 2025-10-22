-- Add push notifications tables
-- Migration: 20251022_add_push_notifications_tables

-- Create push_notifications_history table
CREATE TABLE IF NOT EXISTS push_notifications_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT,
  badge TEXT,
  sent_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_push_history_sent_at 
ON push_notifications_history(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_push_history_sent_by 
ON push_notifications_history(sent_by);

-- RLS policies for push_notifications_history
ALTER TABLE push_notifications_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can read push history"
ON push_notifications_history FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can insert push history"
ON push_notifications_history FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'super_admin'
  )
);

-- Add push notification settings to admin_settings
INSERT INTO admin_settings (key, value, category, metadata)
VALUES 
  ('push_enabled', 'true', 'push', '{"description": "Enable push notifications"}'),
  ('push_scheduled_enabled', 'false', 'push', '{"description": "Enable scheduled push notifications"}'),
  ('push_segmentation_enabled', 'true', 'push', '{"description": "Enable user segmentation for push"}')
ON CONFLICT (key) DO NOTHING;

-- Add comment
COMMENT ON TABLE push_notifications_history IS 'History of all sent push notifications';

