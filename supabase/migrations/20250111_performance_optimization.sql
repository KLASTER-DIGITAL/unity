-- =====================================================
-- Performance Optimization Migration
-- Date: 2025-01-11
-- Description: Fix RLS policies, add missing indexes, remove unused indexes
-- =====================================================

-- =====================================================
-- PART 1: RLS POLICIES OPTIMIZATION
-- Replace auth.uid() with (select auth.uid()) for better performance
-- =====================================================

-- push_notification_analytics table
DROP POLICY IF EXISTS "Super admins can view all analytics" ON public.push_notification_analytics;
CREATE POLICY "Super admins can view all analytics" ON public.push_notification_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Users can view their own analytics" ON public.push_notification_analytics;
CREATE POLICY "Users can view their own analytics" ON public.push_notification_analytics
  FOR SELECT
  USING (user_id = (select auth.uid()));

-- push_campaigns table
DROP POLICY IF EXISTS "Super admins can view all campaigns" ON public.push_campaigns;
CREATE POLICY "Super admins can view all campaigns" ON public.push_campaigns
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Super admins can create campaigns" ON public.push_campaigns;
CREATE POLICY "Super admins can create campaigns" ON public.push_campaigns
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Super admins can update campaigns" ON public.push_campaigns;
CREATE POLICY "Super admins can update campaigns" ON public.push_campaigns
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Super admins can delete campaigns" ON public.push_campaigns;
CREATE POLICY "Super admins can delete campaigns" ON public.push_campaigns
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

-- push_campaign_segments table
DROP POLICY IF EXISTS "Super admins can view all segments" ON public.push_campaign_segments;
CREATE POLICY "Super admins can view all segments" ON public.push_campaign_segments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Super admins can create segments" ON public.push_campaign_segments;
CREATE POLICY "Super admins can create segments" ON public.push_campaign_segments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Super admins can update segments" ON public.push_campaign_segments;
CREATE POLICY "Super admins can update segments" ON public.push_campaign_segments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Super admins can delete segments" ON public.push_campaign_segments;
CREATE POLICY "Super admins can delete segments" ON public.push_campaign_segments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

-- admin_audit_log table
DROP POLICY IF EXISTS "Super admin can read audit logs" ON public.admin_audit_log;
CREATE POLICY "Super admin can read audit logs" ON public.admin_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Super admin can insert audit logs" ON public.admin_audit_log;
CREATE POLICY "Super admin can insert audit logs" ON public.admin_audit_log
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

-- =====================================================
-- PART 2: ADD MISSING INDEXES FOR FOREIGN KEYS
-- =====================================================

-- Index for push_campaigns.custom_segment_id foreign key
CREATE INDEX IF NOT EXISTS idx_push_campaigns_custom_segment_id
  ON public.push_campaigns(custom_segment_id);

-- Index for subscriptions.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_by
  ON public.subscriptions(created_by);

-- Index for subscriptions.updated_by foreign key
CREATE INDEX IF NOT EXISTS idx_subscriptions_updated_by
  ON public.subscriptions(updated_by);

-- =====================================================
-- PART 3: REMOVE UNUSED INDEXES
-- =====================================================

-- profiles table
DROP INDEX IF EXISTS public.idx_profiles_has_completed_onboarding;

-- push_campaigns table
DROP INDEX IF EXISTS public.idx_push_campaigns_status;
DROP INDEX IF EXISTS public.idx_push_campaigns_created_by;
DROP INDEX IF EXISTS public.idx_push_campaigns_scheduled_at;

-- push_campaign_segments table
DROP INDEX IF EXISTS public.idx_push_campaign_segments_created_by;
DROP INDEX IF EXISTS public.idx_push_campaign_segments_created_at;

-- push_notification_analytics table
DROP INDEX IF EXISTS public.idx_push_notification_analytics_campaign_id;
DROP INDEX IF EXISTS public.idx_push_notification_analytics_user_id;
DROP INDEX IF EXISTS public.idx_push_notification_analytics_status;
DROP INDEX IF EXISTS public.idx_push_notification_analytics_sent_at;
DROP INDEX IF EXISTS public.idx_push_notification_analytics_campaign_status;
DROP INDEX IF EXISTS public.idx_push_notification_analytics_user_campaign;

-- media_files table
DROP INDEX IF EXISTS public.idx_media_files_entry_id;
DROP INDEX IF EXISTS public.idx_media_files_user_id;

-- push_notifications_history table
DROP INDEX IF EXISTS public.idx_push_notifications_history_sent_by;

-- admin_audit_log table
DROP INDEX IF EXISTS public.idx_admin_audit_log_user_id;
DROP INDEX IF EXISTS public.idx_admin_audit_log_action;
DROP INDEX IF EXISTS public.idx_admin_audit_log_category;
DROP INDEX IF EXISTS public.idx_admin_audit_log_created_at;
DROP INDEX IF EXISTS public.idx_admin_audit_log_user_date;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify RLS policies are optimized
SELECT
  schemaname,
  tablename,
  policyname,
  CASE
    WHEN definition LIKE '%auth.uid()%' AND definition NOT LIKE '%(select auth.uid())%' THEN 'NEEDS OPTIMIZATION'
    ELSE 'OPTIMIZED'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'push_notification_analytics',
    'push_campaigns',
    'push_campaign_segments',
    'admin_audit_log'
  )
ORDER BY tablename, policyname;

