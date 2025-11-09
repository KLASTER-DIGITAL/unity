-- Migration: Create Push Campaigns Tables
-- Date: 2025-11-09
-- Description: Tables for admin push notification campaigns, segments, and analytics

-- ============================================================================
-- 1. PUSH CAMPAIGN SEGMENTS TABLE (created first for FK reference)
-- ============================================================================
-- Stores custom user segments for targeted campaigns
CREATE TABLE IF NOT EXISTS push_campaign_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,

  -- Segment criteria (JSONB for flexibility)
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example: {
  --   "is_premium": true,
  --   "last_active_days": 7,
  --   "has_entries_count": {"min": 10},
  --   "languages": ["ru", "en"]
  -- }

  -- Cached user count (updated periodically)
  user_count INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMPTZ,

  -- Metadata
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. PUSH CAMPAIGNS TABLE
-- ============================================================================
-- Stores campaign metadata and configuration
CREATE TABLE IF NOT EXISTS push_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT,
  badge TEXT,
  image TEXT,

  -- Campaign metadata
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled', 'failed')),

  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,

  -- Targeting
  target_segment TEXT NOT NULL DEFAULT 'all' CHECK (target_segment IN ('all', 'premium', 'active', 'inactive', 'custom')),
  custom_segment_id UUID REFERENCES push_campaign_segments(id) ON DELETE SET NULL,

  -- i18n support (7 languages)
  translations JSONB DEFAULT '{}'::jsonb,
  -- Example: {"ru": {"title": "...", "body": "..."}, "en": {...}, ...}

  -- Analytics
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,

  -- Additional data
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. PUSH NOTIFICATION ANALYTICS TABLE
-- ============================================================================
-- Tracks individual notification delivery and engagement
CREATE TABLE IF NOT EXISTS push_notification_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES push_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Delivery status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'opened')),
  
  -- Timestamps
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  
  -- Error tracking
  error_message TEXT,
  error_code TEXT,
  
  -- Device info
  device_type TEXT,
  browser TEXT,
  os TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. INDEXES
-- ============================================================================

-- Push campaigns indexes
CREATE INDEX IF NOT EXISTS idx_push_campaigns_status ON push_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_push_campaigns_created_by ON push_campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_push_campaigns_scheduled_at ON push_campaigns(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_push_campaigns_created_at ON push_campaigns(created_at DESC);

-- Push campaign segments indexes
CREATE INDEX IF NOT EXISTS idx_push_campaign_segments_created_by ON push_campaign_segments(created_by);
CREATE INDEX IF NOT EXISTS idx_push_campaign_segments_created_at ON push_campaign_segments(created_at DESC);

-- Push notification analytics indexes
CREATE INDEX IF NOT EXISTS idx_push_notification_analytics_campaign_id ON push_notification_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_push_notification_analytics_user_id ON push_notification_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_push_notification_analytics_status ON push_notification_analytics(status);
CREATE INDEX IF NOT EXISTS idx_push_notification_analytics_sent_at ON push_notification_analytics(sent_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_push_notification_analytics_campaign_status
ON push_notification_analytics(campaign_id, status);

CREATE INDEX IF NOT EXISTS idx_push_notification_analytics_user_campaign
ON push_notification_analytics(user_id, campaign_id);

-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE push_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_campaign_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notification_analytics ENABLE ROW LEVEL SECURITY;

-- Push campaigns policies (super_admin only)
CREATE POLICY "Super admins can view all campaigns"
ON push_campaigns FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can create campaigns"
ON push_campaigns FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can update campaigns"
ON push_campaigns FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can delete campaigns"
ON push_campaigns FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- Push campaign segments policies (super_admin only)
CREATE POLICY "Super admins can view all segments"
ON push_campaign_segments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can create segments"
ON push_campaign_segments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can update segments"
ON push_campaign_segments FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Super admins can delete segments"
ON push_campaign_segments FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- Push notification analytics policies
CREATE POLICY "Super admins can view all analytics"
ON push_notification_analytics FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Users can view their own analytics"
ON push_notification_analytics FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Service role can insert/update analytics (for Edge Functions)
CREATE POLICY "Service role can manage analytics"
ON push_notification_analytics FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 6. COMMENTS
-- ============================================================================

COMMENT ON TABLE push_campaigns IS 'Admin push notification campaigns with i18n support';
COMMENT ON TABLE push_campaign_segments IS 'Custom user segments for targeted campaigns';
COMMENT ON TABLE push_notification_analytics IS 'Individual notification delivery and engagement tracking';

COMMENT ON COLUMN push_campaigns.translations IS 'i18n translations: {"ru": {"title": "...", "body": "..."}, "en": {...}}';
COMMENT ON COLUMN push_campaigns.target_segment IS 'Predefined segments: all, premium, active, inactive, custom';
COMMENT ON COLUMN push_campaign_segments.criteria IS 'Segment criteria: {"is_premium": true, "last_active_days": 7, ...}';
COMMENT ON COLUMN push_notification_analytics.status IS 'Delivery status: pending, sent, delivered, failed, opened';

