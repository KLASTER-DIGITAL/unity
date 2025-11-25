-- Migration: Add is_marked column to motivation_cards
-- Description: Adds a boolean column to track if a motivation card has been marked/read by the user
-- Date: 2025-01-24

-- Add is_marked column with default value false
ALTER TABLE motivation_cards 
ADD COLUMN IF NOT EXISTS is_marked BOOLEAN DEFAULT false;

-- Create index for faster queries on is_marked status
CREATE INDEX IF NOT EXISTS idx_motivation_cards_user_marked 
ON motivation_cards(user_id, is_marked);

-- Comment the column
COMMENT ON COLUMN motivation_cards.is_marked IS 'Indicates whether the user has marked this motivation card as read';
