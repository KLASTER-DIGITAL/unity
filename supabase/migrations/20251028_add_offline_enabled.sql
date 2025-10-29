-- Migration: Add offline_enabled field to profiles table
-- Date: 2025-10-28
-- Description: Add offline_enabled boolean field for Premium Offline Mode feature

-- Add offline_enabled column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS offline_enabled BOOLEAN DEFAULT false;

-- Add comment to column
COMMENT ON COLUMN profiles.offline_enabled IS 'Premium feature: Enables offline mode for user (requires is_premium = true)';

-- Create index for faster queries filtering by offline_enabled
CREATE INDEX IF NOT EXISTS idx_profiles_offline_enabled ON profiles(offline_enabled) WHERE offline_enabled = true;

-- Update RLS policies (if needed)
-- Note: Existing RLS policies should already cover this column
-- Users can only update their own offline_enabled field

-- Migration complete

