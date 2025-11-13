-- Fix Supabase Advisors Issues
-- Date: 2025-11-13
-- Description: Исправление проблем безопасности и производительности

-- ============================================================================
-- PART 1: Security Issues
-- ============================================================================

-- 1. Удалить функцию increment_ab_test_metric (A/B Testing удален)
DROP FUNCTION IF EXISTS public.increment_ab_test_metric(UUID, TEXT, INTEGER);

-- ============================================================================
-- PART 2: Performance - Add Missing Indexes for Foreign Keys
-- ============================================================================

-- 2. admin_audit_log.user_id
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_user_id 
  ON public.admin_audit_log(user_id);

-- 3. media_files.entry_id
CREATE INDEX IF NOT EXISTS idx_media_files_entry_id 
  ON public.media_files(entry_id);

-- 4. media_files.user_id
CREATE INDEX IF NOT EXISTS idx_media_files_user_id 
  ON public.media_files(user_id);

-- 5. push_campaign_segments.created_by
CREATE INDEX IF NOT EXISTS idx_push_campaign_segments_created_by 
  ON public.push_campaign_segments(created_by);

-- 6. push_campaigns.created_by
CREATE INDEX IF NOT EXISTS idx_push_campaigns_created_by 
  ON public.push_campaigns(created_by);

-- 7. push_notification_analytics.campaign_id
CREATE INDEX IF NOT EXISTS idx_push_notification_analytics_campaign_id 
  ON public.push_notification_analytics(campaign_id);

-- 8. push_notification_analytics.user_id
CREATE INDEX IF NOT EXISTS idx_push_notification_analytics_user_id 
  ON public.push_notification_analytics(user_id);

-- 9. push_notification_templates.created_by
CREATE INDEX IF NOT EXISTS idx_push_notification_templates_created_by 
  ON public.push_notification_templates(created_by);

-- 10. push_notifications_history.sent_by
CREATE INDEX IF NOT EXISTS idx_push_notifications_history_sent_by 
  ON public.push_notifications_history(sent_by);

-- ============================================================================
-- PART 3: Performance - Remove Unused Indexes
-- ============================================================================

-- 11. Удалить неиспользуемые индексы
DROP INDEX IF EXISTS public.idx_profiles_telegram_chat_id;
DROP INDEX IF EXISTS public.idx_templates_is_premium;
DROP INDEX IF EXISTS public.idx_templates_is_active;
DROP INDEX IF EXISTS public.idx_push_campaigns_custom_segment_id;
DROP INDEX IF EXISTS public.idx_subscriptions_created_by;
DROP INDEX IF EXISTS public.idx_subscriptions_updated_by;

-- ============================================================================
-- PART 4: Performance - Optimize RLS Policies
-- ============================================================================

-- 12. Объединить multiple permissive policies в одну для push_notification_analytics
-- Удалить старые политики
DROP POLICY IF EXISTS "Super admins can view all analytics" ON public.push_notification_analytics;
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.push_notification_analytics;

-- Создать одну оптимизированную политику
CREATE POLICY "View analytics policy" 
  ON public.push_notification_analytics
  FOR SELECT
  USING (
    -- Super admin может видеть все
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
    OR
    -- Пользователь может видеть только свои
    user_id = auth.uid()
  );

-- ============================================================================
-- PART 5: Comments
-- ============================================================================

COMMENT ON INDEX idx_admin_audit_log_user_id IS 'Index for foreign key admin_audit_log.user_id';
COMMENT ON INDEX idx_media_files_entry_id IS 'Index for foreign key media_files.entry_id';
COMMENT ON INDEX idx_media_files_user_id IS 'Index for foreign key media_files.user_id';
COMMENT ON INDEX idx_push_campaign_segments_created_by IS 'Index for foreign key push_campaign_segments.created_by';
COMMENT ON INDEX idx_push_campaigns_created_by IS 'Index for foreign key push_campaigns.created_by';
COMMENT ON INDEX idx_push_notification_analytics_campaign_id IS 'Index for foreign key push_notification_analytics.campaign_id';
COMMENT ON INDEX idx_push_notification_analytics_user_id IS 'Index for foreign key push_notification_analytics.user_id';
COMMENT ON INDEX idx_push_notification_templates_created_by IS 'Index for foreign key push_notification_templates.created_by';
COMMENT ON INDEX idx_push_notifications_history_sent_by IS 'Index for foreign key push_notifications_history.sent_by';

