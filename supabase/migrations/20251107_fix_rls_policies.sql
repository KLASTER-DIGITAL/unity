-- Fix RLS Policies for subscriptions and books_archive
-- Date: 2025-11-07
-- Purpose: Replace hardcoded emails with role-based checks

-- ==========================================
-- 1. FIX SUBSCRIPTIONS RLS POLICIES
-- ==========================================

-- Drop old policies with hardcoded emails
DROP POLICY IF EXISTS "subscriptions_insert_policy" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_policy" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_delete_policy" ON subscriptions;

-- Create new policies with role-based checks
CREATE POLICY "subscriptions_insert_policy" ON subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "subscriptions_update_policy" ON subscriptions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "subscriptions_delete_policy" ON subscriptions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
  )
);

-- ==========================================
-- 2. FIX BOOKS_ARCHIVE RLS POLICY
-- ==========================================

-- Drop old policy with 'admin' role
DROP POLICY IF EXISTS "books_archive_select_policy" ON books_archive;

-- Create new policy with 'super_admin' role
CREATE POLICY "books_archive_select_policy" ON books_archive
FOR SELECT
TO authenticated
USING (
  (auth.uid() = user_id)
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
  )
);

-- ==========================================
-- 3. ADD MISSING END_DATE FOR MONTHLY SUBSCRIPTION
-- ==========================================

-- Update rustam@leadshunter.biz subscription with end_date
UPDATE subscriptions
SET end_date = start_date + INTERVAL '30 days'
WHERE plan_type = 'monthly'
  AND end_date IS NULL
  AND user_id = (SELECT id FROM profiles WHERE email = 'rustam@leadshunter.biz');

-- ==========================================
-- 4. VERIFICATION QUERIES
-- ==========================================

-- Verify subscriptions policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'subscriptions'
ORDER BY policyname;

-- Verify books_archive policy
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'books_archive'
  AND policyname = 'books_archive_select_policy';

-- Verify subscription end_date
SELECT 
  p.email,
  s.plan_type,
  s.status,
  s.start_date,
  s.end_date,
  s.end_date - s.start_date AS duration_days
FROM subscriptions s
JOIN profiles p ON p.id = s.user_id
WHERE s.plan_type = 'monthly';

