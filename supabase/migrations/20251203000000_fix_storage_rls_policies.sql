-- Fix Storage RLS policies for books bucket
-- Purpose: Allow authenticated users to access their PDF files
-- Fixes: HTTP 400 errors when viewing/downloading books

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can read own books PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own books PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own books PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own books PDFs" ON storage.objects;

-- Policy: Users can read their own PDF files in books bucket
CREATE POLICY "Users can read own books PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'books' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can upload PDF files to their folder in books bucket
CREATE POLICY "Users can upload own books PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'books' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own PDF files in books bucket
CREATE POLICY "Users can update own books PDFs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'books' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own PDF files in books bucket
CREATE POLICY "Users can delete own books PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'books' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Verify bucket exists and is configured correctly
DO $$
BEGIN
  -- Check if books bucket exists
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'books'
  ) THEN
    -- Create books bucket if it doesn't exist
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('books', 'books', true);
    
    RAISE NOTICE 'Created books bucket';
  ELSE
    -- Update bucket to be public (for public URLs to work)
    UPDATE storage.buckets
    SET public = true
    WHERE id = 'books';
    
    RAISE NOTICE 'Books bucket already exists, ensured it is public';
  END IF;
END $$;
