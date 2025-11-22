-- Add sharing support for books
-- Allows public access to books via share_token

ALTER TABLE books_archive
ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS shared_at TIMESTAMPTZ;

-- Index for share_token lookups
CREATE INDEX IF NOT EXISTS idx_books_archive_share_token 
ON books_archive(share_token) 
WHERE share_token IS NOT NULL;

-- RLS Policy: Public access via share_token
CREATE POLICY IF NOT EXISTS "Public can view shared books"
ON books_archive FOR SELECT
USING (
  is_public = true 
  AND share_token IS NOT NULL
  AND share_token = current_setting('app.share_token', true)
);

-- Function to generate share token
CREATE OR REPLACE FUNCTION generate_book_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql;

