-- Migration: Create A/B Testing Tables for Push Notifications
-- Date: 2025-11-10
-- Description: Tables for A/B testing push notification variants

-- ============================================================================
-- 1. PUSH AB TESTS TABLE
-- ============================================================================
-- Stores A/B test configuration and results
CREATE TABLE IF NOT EXISTS push_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Test configuration
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed', 'cancelled')),
  
  -- Variants (A and B)
  variant_a_title TEXT NOT NULL,
  variant_a_body TEXT NOT NULL,
  variant_a_icon TEXT,
  variant_b_title TEXT NOT NULL,
  variant_b_body TEXT NOT NULL,
  variant_b_icon TEXT,
  
  -- Traffic split (percentage for variant A, rest goes to B)
  traffic_split INTEGER DEFAULT 50 CHECK (traffic_split >= 0 AND traffic_split <= 100),
  
  -- Targeting
  target_segment TEXT NOT NULL DEFAULT 'all' CHECK (target_segment IN ('all', 'premium', 'active', 'inactive', 'custom')),
  custom_segment_id UUID REFERENCES push_campaign_segments(id) ON DELETE SET NULL,
  
  -- Test duration
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  
  -- Results (variant A)
  variant_a_sent INTEGER DEFAULT 0,
  variant_a_delivered INTEGER DEFAULT 0,
  variant_a_opened INTEGER DEFAULT 0,
  variant_a_clicked INTEGER DEFAULT 0,
  
  -- Results (variant B)
  variant_b_sent INTEGER DEFAULT 0,
  variant_b_delivered INTEGER DEFAULT 0,
  variant_b_opened INTEGER DEFAULT 0,
  variant_b_clicked INTEGER DEFAULT 0,
  
  -- Winner (determined after test completion)
  winner TEXT CHECK (winner IN ('variant_a', 'variant_b', 'no_difference')),
  confidence_level DECIMAL(5, 2), -- e.g., 95.00 for 95% confidence
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. PUSH AB TEST ASSIGNMENTS TABLE
-- ============================================================================
-- Tracks which variant each user received
CREATE TABLE IF NOT EXISTS push_ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ab_test_id UUID REFERENCES push_ab_tests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Assigned variant
  variant TEXT NOT NULL CHECK (variant IN ('variant_a', 'variant_b')),
  
  -- Delivery status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'opened', 'clicked')),
  
  -- Timestamps
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  
  -- Error tracking
  error_message TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one assignment per user per test
  UNIQUE(ab_test_id, user_id)
);

-- ============================================================================
-- 3. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON push_ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_ab_tests_created_by ON push_ab_tests(created_by);
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_ab_test_id ON push_ab_test_assignments(ab_test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_user_id ON push_ab_test_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_variant ON push_ab_test_assignments(variant);
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_status ON push_ab_test_assignments(status);

-- ============================================================================
-- 4. RLS POLICIES
-- ============================================================================
-- Enable RLS
ALTER TABLE push_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_ab_test_assignments ENABLE ROW LEVEL SECURITY;

-- Super admins can do everything
CREATE POLICY "Super admins can view all AB tests"
  ON push_ab_tests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can create AB tests"
  ON push_ab_tests FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update AB tests"
  ON push_ab_tests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can delete AB tests"
  ON push_ab_tests FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- AB Test Assignments policies
CREATE POLICY "Super admins can view all AB test assignments"
  ON push_ab_test_assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can create AB test assignments"
  ON push_ab_test_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update AB test assignments"
  ON push_ab_test_assignments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- ============================================================================
-- 5. COMMENTS
-- ============================================================================
COMMENT ON TABLE push_ab_tests IS 'A/B tests for push notification variants';
COMMENT ON TABLE push_ab_test_assignments IS 'Tracks which variant each user received in A/B tests';

COMMENT ON COLUMN push_ab_tests.traffic_split IS 'Percentage of users who receive variant A (0-100)';
COMMENT ON COLUMN push_ab_tests.winner IS 'Winning variant determined after test completion';
COMMENT ON COLUMN push_ab_tests.confidence_level IS 'Statistical confidence level (e.g., 95.00 for 95%)';
COMMENT ON COLUMN push_ab_test_assignments.variant IS 'Which variant the user received (variant_a or variant_b)';
COMMENT ON COLUMN push_ab_test_assignments.status IS 'Delivery status: pending, sent, delivered, failed, opened, clicked';

