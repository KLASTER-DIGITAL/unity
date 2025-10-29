-- ============================================================================
-- Migration: Remove Unused Indexes
-- ============================================================================
-- Date: 2025-10-29
-- Purpose: Remove truly unused indexes identified by Supabase Performance Advisors
-- Impact: Reduce storage overhead, improve write performance
--
-- Analysis Summary:
-- 1. idx_profiles_offline_enabled - ❌ DELETE
--    - Created for offline mode feature (Premium)
--    - NO SQL queries filter by offline_enabled
--    - Offline checks happen on client side (React components)
--    - Feature not yet activated
--    - DECISION: DELETE (not used in SQL)
--
-- 2. idx_media_files_user_id - ❌ DELETE
--    - Created as covering index for foreign key
--    - ALREADY covered by composite index idx_media_files_user_created (user_id, created_at DESC)
--    - PostgreSQL can use composite index for WHERE user_id = ? queries
--    - DECISION: DELETE (redundant with composite index)
--
-- 3. idx_media_files_entry_id - ✅ KEEP
--    - Used in media-upload-api Edge Function
--    - Needed for JOIN operations (entries LEFT JOIN media_files)
--    - Needed for DELETE CASCADE
--    - DECISION: KEEP
--
-- 4. idx_push_notifications_history_sent_by - ✅ KEEP
--    - Used in push-sender Edge Function (INSERT with sent_by)
--    - Needed for future admin dashboard (filter by sender)
--    - DECISION: KEEP
--
-- 5. idx_usage_user_id - ✅ KEEP
--    - ACTIVELY used in PWA analytics (pwa-tracking.ts, push-analytics.ts)
--    - Query: SELECT * FROM usage WHERE user_id = ? AND operation_type IN (...)
--    - DECISION: KEEP (critical for analytics)
--
-- Verification:
-- - Analyzed all SQL queries via codebase-retrieval
-- - Checked Edge Functions usage
-- - Verified composite index coverage
-- - Confirmed client-side vs server-side checks
--
-- Rollback plan:
-- If needed, indexes can be recreated with:
-- CREATE INDEX idx_profiles_offline_enabled ON profiles(offline_enabled) WHERE offline_enabled = true;
-- CREATE INDEX idx_media_files_user_id ON media_files(user_id);
-- ============================================================================

-- ============================================================================
-- 1. DROP idx_profiles_offline_enabled
-- ============================================================================
-- Reason: No SQL queries filter by offline_enabled
-- Offline mode checks happen on client side (OfflineSection.tsx, OfflineSettingsModal.tsx)
-- Feature not yet activated (Premium feature)
DROP INDEX IF EXISTS public.idx_profiles_offline_enabled;

-- ============================================================================
-- 2. DROP idx_media_files_user_id
-- ============================================================================
-- Reason: Redundant with composite index idx_media_files_user_created (user_id, created_at DESC)
-- PostgreSQL can use composite index for WHERE user_id = ? queries
-- Composite index already exists and covers this use case
DROP INDEX IF EXISTS public.idx_media_files_user_id;

-- ============================================================================
-- 3. ANALYZE TABLES
-- ============================================================================
-- Update query planner statistics for modified tables
ANALYZE public.profiles;
ANALYZE public.media_files;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify indexes were dropped:
--
-- 1. Check remaining indexes on profiles:
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public' AND tablename = 'profiles'
-- ORDER BY indexname;
--
-- Expected: idx_profiles_offline_enabled should NOT be in the list
--
-- 2. Check remaining indexes on media_files:
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public' AND tablename = 'media_files'
-- ORDER BY indexname;
--
-- Expected: idx_media_files_user_id should NOT be in the list
-- Expected: idx_media_files_user_created should STILL exist
-- Expected: idx_media_files_entry_id should STILL exist
--
-- 3. Verify Supabase Performance Advisors:
-- Should show 3 INFO warnings reduced to 0 (or fewer)
-- ============================================================================

-- Add migration comments
COMMENT ON TABLE profiles IS 
'User profiles table. Removed idx_profiles_offline_enabled (2025-10-29) - offline checks happen on client side.';

COMMENT ON TABLE media_files IS 
'Media files metadata. Removed idx_media_files_user_id (2025-10-29) - covered by composite index idx_media_files_user_created.';

