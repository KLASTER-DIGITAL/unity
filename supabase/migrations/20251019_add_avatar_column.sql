-- Migration: Add avatar column to profiles table
-- Date: 2025-10-19
-- Description: Add avatar field for profile photo URL

-- Add avatar column if it doesn't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Add comment to document the field
COMMENT ON COLUMN profiles.avatar IS 'Profile photo URL from Supabase Storage';

