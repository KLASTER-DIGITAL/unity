-- Fix RLS performance for api_services table
-- Migration: 20251022_fix_api_services_rls_performance
-- Issue: auth.uid() is re-evaluated for each row, causing performance issues

-- Drop existing policies
DROP POLICY IF EXISTS "Super admin can read api_services" ON api_services;
DROP POLICY IF EXISTS "Super admin can insert api_services" ON api_services;
DROP POLICY IF EXISTS "Super admin can update api_services" ON api_services;
DROP POLICY IF EXISTS "Super admin can delete api_services" ON api_services;

-- Recreate policies with optimized auth.uid() calls using (select auth.uid())
CREATE POLICY "Super admin can read api_services"
ON api_services FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Super admin can insert api_services"
ON api_services FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Super admin can update api_services"
ON api_services FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Super admin can delete api_services"
ON api_services FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'super_admin'
  )
);

