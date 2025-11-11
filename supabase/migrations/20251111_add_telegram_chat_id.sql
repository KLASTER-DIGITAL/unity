-- Migration: Add telegram_chat_id to profiles table
-- Date: 2025-11-11
-- Description: Add telegram_chat_id field for sending Telegram notifications via Bot API

-- Add telegram_chat_id column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

-- Create index on telegram_chat_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_chat_id ON profiles(telegram_chat_id);

-- Add comment for documentation
COMMENT ON COLUMN profiles.telegram_chat_id IS 'Telegram chat ID for sending notifications via Bot API (obtained from /start command)';

