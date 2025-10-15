-- Migration: Add Telegram authentication fields to profiles table
-- Created: 2025-01-14

-- Add telegram_id column
ALTER TABLE profiles
ADD COLUMN telegram_id TEXT;

-- Add telegram_username column
ALTER TABLE profiles
ADD COLUMN telegram_username TEXT;

-- Add telegram_avatar column
ALTER TABLE profiles
ADD COLUMN telegram_avatar TEXT;

-- Create index on telegram_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON profiles(telegram_id);

-- Add unique constraint to prevent duplicate telegram_id
-- (telegram_id can be null for non-Telegram users)
ALTER TABLE profiles
ADD CONSTRAINT unique_telegram_id
UNIQUE (telegram_id)
DEFERRABLE INITIALLY DEFERRED;

-- Add comments for documentation
COMMENT ON COLUMN profiles.telegram_id IS 'Unique Telegram user ID from Telegram API';
COMMENT ON COLUMN profiles.telegram_username IS 'Username in Telegram (optional)';
COMMENT ON COLUMN profiles.telegram_avatar IS 'Avatar URL from Telegram profile';
