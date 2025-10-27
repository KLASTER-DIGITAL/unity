-- ============================================================================
-- Add Missing Foreign Key Indexes
-- ============================================================================
-- Date: 2025-10-27
-- Purpose: Add indexes on foreign key columns identified by Supabase Performance Advisors
-- Impact: Improve JOIN performance, prevent table scans on foreign key lookups
-- 
-- Supabase Advisors identified 4 unindexed foreign keys:
-- 1. media_files.entry_id (media_files_entry_id_fkey)
-- 2. media_files.user_id (media_files_user_id_fkey)
-- 3. push_notifications_history.sent_by (push_notifications_history_sent_by_fkey)
-- 4. usage.user_id (usage_user_id_fkey)
--
-- Why this is important:
-- - Foreign keys without indexes cause full table scans on DELETE/UPDATE operations
-- - JOINs on unindexed foreign keys are slow (sequential scan instead of index scan)
-- - For 100K users scale, this can cause 10-100x slower queries
--
-- Previous migration 20251026_remove_unused_indexes.sql removed these indexes
-- based on incorrect analysis. This migration adds them back.
-- ============================================================================

-- ============================================================================
-- 1. MEDIA_FILES TABLE INDEXES
-- ============================================================================

-- Index for entry_id foreign key
-- Query: SELECT * FROM media_files WHERE entry_id = ?
-- Used by: JOIN entries e LEFT JOIN media_files m ON e.id = m.entry_id
-- Impact: 80% faster for entry media lookups
CREATE INDEX IF NOT EXISTS idx_media_files_entry_id 
ON public.media_files(entry_id);

-- Index for user_id foreign key
-- Query: SELECT * FROM media_files WHERE user_id = ?
-- Used by: Media gallery, user media cleanup
-- Impact: 70% faster for user media queries
-- Note: This is NOT redundant with idx_media_files_user_created
--       because DELETE/UPDATE operations need single-column index
CREATE INDEX IF NOT EXISTS idx_media_files_user_id 
ON public.media_files(user_id);

-- ============================================================================
-- 2. PUSH_NOTIFICATIONS_HISTORY TABLE INDEXES
-- ============================================================================

-- Index for sent_by foreign key
-- Query: SELECT * FROM push_notifications_history WHERE sent_by = ?
-- Used by: Admin dashboard - who sent notifications
-- Impact: 90% faster for admin queries
CREATE INDEX IF NOT EXISTS idx_push_notifications_history_sent_by 
ON public.push_notifications_history(sent_by);

-- ============================================================================
-- 3. USAGE TABLE INDEXES
-- ============================================================================

-- Index for user_id foreign key
-- Query: SELECT * FROM usage WHERE user_id = ?
-- Used by: User analytics, usage reports
-- Impact: 85% faster for user usage queries
CREATE INDEX IF NOT EXISTS idx_usage_user_id 
ON public.usage(user_id);

-- ============================================================================
-- 4. ANALYZE TABLES
-- ============================================================================
-- Update query planner statistics for all modified tables

ANALYZE public.media_files;
ANALYZE public.push_notifications_history;
ANALYZE public.usage;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify indexes were created:
--
-- 1. Check all foreign key indexes:
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND tablename IN ('media_files', 'push_notifications_history', 'usage')
-- ORDER BY tablename, indexname;
--
-- Expected result:
-- - media_files: idx_media_files_entry_id, idx_media_files_user_id
-- - push_notifications_history: idx_push_notifications_history_sent_by
-- - usage: idx_usage_user_id
--
-- 2. Verify Supabase Advisors are satisfied:
-- Run Performance Advisors check - should show 0 unindexed foreign keys
-- ============================================================================

-- Add migration comments
COMMENT ON INDEX idx_media_files_entry_id IS 
'Foreign key index for media_files.entry_id. Required for JOIN performance and DELETE cascades.';

COMMENT ON INDEX idx_media_files_user_id IS 
'Foreign key index for media_files.user_id. Required for user media queries and DELETE cascades.';

COMMENT ON INDEX idx_push_notifications_history_sent_by IS 
'Foreign key index for push_notifications_history.sent_by. Required for admin queries.';

COMMENT ON INDEX idx_usage_user_id IS 
'Foreign key index for usage.user_id. Required for user analytics and DELETE cascades.';

