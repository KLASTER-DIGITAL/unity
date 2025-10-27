-- ============================================================================
-- Remove Unused Database Indexes
-- ============================================================================
-- Date: 2025-10-26
-- Purpose: Remove 4 unused indexes identified by Supabase Performance Advisors
-- Impact: Reduce database size, improve write performance
-- 
-- Analysis:
-- 1. idx_media_files_entry_id - NO queries use WHERE entry_id
-- 2. idx_push_notifications_history_sent_by - Created but never used in queries
-- 3. idx_usage_user_id - NO queries use WHERE user_id directly
-- 4. idx_media_files_user_id - REDUNDANT (covered by idx_media_files_user_created)
--
-- Verification:
-- - Checked all SQL queries in codebase
-- - Checked all Edge Functions
-- - Checked all migrations
-- - Confirmed composite index idx_media_files_user_created covers user_id queries
--
-- Rollback plan:
-- If needed, indexes can be recreated with:
-- CREATE INDEX idx_media_files_entry_id ON public.media_files(entry_id);
-- CREATE INDEX idx_push_notifications_history_sent_by ON public.push_notifications_history(sent_by);
-- CREATE INDEX idx_usage_user_id ON public.usage(user_id);
-- CREATE INDEX idx_media_files_user_id ON public.media_files(user_id);
-- ============================================================================

-- Drop unused index on media_files.entry_id
-- Reason: No queries filter by entry_id
DROP INDEX IF EXISTS public.idx_media_files_entry_id;

-- Drop unused index on push_notifications_history.sent_by
-- Reason: Created in migration but never used in actual queries
-- Note: If future admin features need this, it can be recreated
DROP INDEX IF EXISTS public.idx_push_notifications_history_sent_by;

-- Rename to match naming convention (was created with wrong name)
DROP INDEX IF EXISTS public.idx_push_history_sent_by;

-- Drop unused index on usage.user_id
-- Reason: No queries filter by user_id directly
-- Note: usage table is for analytics, queries use operation_type instead
DROP INDEX IF EXISTS public.idx_usage_user_id;

-- Drop redundant index on media_files.user_id
-- Reason: Composite index idx_media_files_user_created(user_id, created_at DESC)
--         already covers queries with WHERE user_id = ?
-- PostgreSQL can use composite index for prefix queries
DROP INDEX IF EXISTS public.idx_media_files_user_id;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After migration, verify indexes are removed:
--
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
-- - media_files: idx_media_files_user_created (kept)
-- - push_notifications_history: idx_push_history_sent_at (kept)
-- - usage: no indexes (as expected)
-- ============================================================================

-- Analyze tables to update query planner statistics
ANALYZE public.media_files;
ANALYZE public.push_notifications_history;
ANALYZE public.usage;

