-- Migration: Remove unused indexes
-- Date: 2025-10-28
-- Description: Remove old unused indexes identified by Supabase Performance Advisor

-- Drop unused index on media_files.entry_id
DROP INDEX IF EXISTS idx_media_files_entry_id;

-- Drop unused index on media_files.user_id
DROP INDEX IF EXISTS idx_media_files_user_id;

-- Drop unused index on push_notifications_history.sent_by
DROP INDEX IF EXISTS idx_push_notifications_history_sent_by;

-- Drop unused index on usage.user_id
DROP INDEX IF EXISTS idx_usage_user_id;

-- Note: idx_profiles_offline_enabled is kept - it's new and will be used when feature is activated

-- Migration complete

