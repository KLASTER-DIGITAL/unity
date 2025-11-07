-- Remove Unused Indexes
-- Date: 2025-11-07
-- Purpose: Remove 9 unused indexes to improve INSERT/UPDATE performance

-- ==========================================
-- SUBSCRIPTIONS TABLE (5 indexes)
-- ==========================================

-- Drop unused indexes
DROP INDEX IF EXISTS idx_subscriptions_status;
DROP INDEX IF EXISTS idx_subscriptions_end_date;
DROP INDEX IF EXISTS idx_subscriptions_user_status;
DROP INDEX IF EXISTS idx_subscriptions_created_by;
DROP INDEX IF EXISTS idx_subscriptions_updated_by;

-- Keep only essential indexes:
-- - idx_subscriptions_user_id (for user lookups)
-- - Primary key index (automatic)

-- ==========================================
-- MEDIA_FILES TABLE (2 indexes)
-- ==========================================

-- Drop unused indexes (covered by composite index)
DROP INDEX IF EXISTS idx_media_files_entry_id_fk;
DROP INDEX IF EXISTS idx_media_files_user_id_fk;

-- Keep composite index:
-- - idx_media_files_user_created (user_id, created_at DESC)
-- PostgreSQL can use this for both user_id and entry_id queries

-- ==========================================
-- PUSH_NOTIFICATIONS_HISTORY TABLE (1 index)
-- ==========================================

-- Drop unused index
DROP INDEX IF EXISTS idx_push_notifications_history_sent_by_fk;

-- Keep only essential indexes:
-- - idx_push_notifications_history_user_id (for user lookups)

-- ==========================================
-- USAGE TABLE (1 index)
-- ==========================================

-- Drop unused index
DROP INDEX IF EXISTS idx_usage_user_id_fk;

-- Keep only essential indexes:
-- - Primary key index (automatic)

-- ==========================================
-- VERIFICATION
-- ==========================================

-- Check remaining indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('subscriptions', 'media_files', 'push_notifications_history', 'usage')
ORDER BY tablename, indexname;

-- Check index usage statistics
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN ('subscriptions', 'media_files', 'push_notifications_history', 'usage')
ORDER BY tablename, idx_scan DESC;

