-- Migration: Remove unused subscriptions indexes
-- Date: 2025-11-08
-- Purpose: Remove unused indexes on subscriptions.created_by and subscriptions.updated_by
--
-- Analysis:
-- 1. idx_subscriptions_created_by - ❌ DELETE
--    - Used ONLY in INSERT (admin-subscriptions-api line 227)
--    - NOT used in WHERE, JOIN, ORDER BY clauses
--    - Indexes are NOT needed for INSERT operations
--    - DECISION: DELETE (unused for queries)
--
-- 2. idx_subscriptions_updated_by - ❌ DELETE
--    - Used ONLY in UPDATE (admin-subscriptions-api line 256)
--    - NOT used in WHERE, JOIN, ORDER BY clauses
--    - Indexes are NOT needed for UPDATE operations
--    - DECISION: DELETE (unused for queries)
--
-- Verification:
-- - Checked admin-subscriptions-api Edge Function
-- - Checked all SQL queries via codebase-retrieval
-- - Confirmed NO queries filter by created_by or updated_by
-- - These columns are audit fields (who created/updated), not query fields
--
-- Impact:
-- - Faster INSERT/UPDATE operations (no index maintenance)
-- - Reduced storage usage (~50KB per index)
-- - NO impact on query performance (indexes not used)
--
-- Rollback plan:
-- If needed, indexes can be recreated with:
-- CREATE INDEX idx_subscriptions_created_by ON subscriptions(created_by);
-- CREATE INDEX idx_subscriptions_updated_by ON subscriptions(updated_by);
-- ============================================================================

-- Drop unused index on subscriptions.created_by
-- Reason: Only used in INSERT, not in queries
DROP INDEX IF EXISTS public.idx_subscriptions_created_by;

-- Drop unused index on subscriptions.updated_by
-- Reason: Only used in UPDATE, not in queries
DROP INDEX IF EXISTS public.idx_subscriptions_updated_by;

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
--   AND tablename = 'subscriptions'
-- ORDER BY indexname;
--
-- Expected result:
-- - subscriptions_pkey (PRIMARY KEY) ✅
-- - idx_subscriptions_user_id ✅
-- - idx_subscriptions_status ✅
-- - idx_subscriptions_end_date ✅
-- - idx_subscriptions_created_at ✅
-- - idx_subscriptions_user_status ✅
-- - idx_subscriptions_created_by ❌ REMOVED
-- - idx_subscriptions_updated_by ❌ REMOVED
-- ============================================================================

-- Analyze table to update query planner statistics
ANALYZE public.subscriptions;

-- Add migration comment
COMMENT ON TABLE public.subscriptions IS 
'Subscriptions table. Optimized indexes: removed idx_subscriptions_created_by and idx_subscriptions_updated_by (audit fields, not used in queries). Migration: 20251108_remove_unused_subscriptions_indexes';

