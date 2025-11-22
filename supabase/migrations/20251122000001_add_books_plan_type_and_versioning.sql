-- Migration: Add plan_type, type, language, and versioning to books_archive
-- Created: 2025-11-22
-- Purpose: Support FREE/PREMIUM tiers, book types, multilingual, and versioning

-- Add new columns to books_archive
ALTER TABLE books_archive
ADD COLUMN IF NOT EXISTS plan_type VARCHAR(20) NOT NULL DEFAULT 'premium'
  CHECK (plan_type IN ('free', 'premium')),
ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT 'month'
  CHECK (type IN ('month', 'quarter', 'year', 'family', 'custom')),
ADD COLUMN IF NOT EXISTS language VARCHAR(5) NOT NULL DEFAULT 'ru'
  CHECK (language IN ('ru', 'en', 'es', 'de', 'fr', 'zh', 'ja', 'ka')),
ADD COLUMN IF NOT EXISTS parent_book_id UUID REFERENCES books_archive(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_books_archive_plan_type ON books_archive(user_id, plan_type);
CREATE INDEX IF NOT EXISTS idx_books_archive_type ON books_archive(type);
CREATE INDEX IF NOT EXISTS idx_books_archive_language ON books_archive(language);
CREATE INDEX IF NOT EXISTS idx_books_archive_parent_book_id ON books_archive(parent_book_id);
CREATE INDEX IF NOT EXISTS idx_books_archive_user_period ON books_archive(user_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_books_archive_version ON books_archive(parent_book_id, version);

-- Add comments for new columns
COMMENT ON COLUMN books_archive.plan_type IS 'User plan type: free (simple list) or premium (AI-generated)';
COMMENT ON COLUMN books_archive.type IS 'Book type: month, quarter, year, family, or custom';
COMMENT ON COLUMN books_archive.language IS 'Book language code (ISO 639-1): ru, en, es, de, fr, zh, ja, ka';
COMMENT ON COLUMN books_archive.parent_book_id IS 'Reference to the original book (for versioning). NULL for v1, points to v1 for v2/v3/etc.';
COMMENT ON COLUMN books_archive.version IS 'Version number: 1 for original, 2+ for edited versions';

-- Update existing books to have default values
-- All existing books are PREMIUM (AI-generated)
UPDATE books_archive 
SET plan_type = 'premium',
    type = 'month',
    language = 'ru',
    version = 1
WHERE plan_type IS NULL;

