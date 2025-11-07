-- Migration: Fix subscriptions table issues from Supabase Advisors
-- Created: 2025-11-07
-- Purpose: Fix RLS policies, function search_path, and add missing indexes

-- 1. Fix function search_path_mutable
-- First drop the trigger
DROP TRIGGER IF EXISTS trigger_update_subscriptions_updated_at ON subscriptions;

-- Then drop the function
DROP FUNCTION IF EXISTS update_subscriptions_updated_at();

-- Recreate function with search_path set
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER trigger_update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscriptions_updated_at();

-- 2. Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Super admins can view all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Super admins can insert subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Super admins can update subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Super admins can delete subscriptions" ON subscriptions;

-- 3. Create consolidated RLS policies with (SELECT auth.uid())

-- Consolidated SELECT policy (users can view own, admins can view all)
CREATE POLICY "subscriptions_select_policy"
    ON subscriptions
    FOR SELECT
    TO authenticated
    USING (
        (SELECT auth.uid()) = user_id OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE users.id = (SELECT auth.uid()) 
            AND users.email IN ('diary@leadshunter.biz', 'admin@unity.com')
        )
    );

-- INSERT policy (only admins)
CREATE POLICY "subscriptions_insert_policy"
    ON subscriptions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE users.id = (SELECT auth.uid()) 
            AND users.email IN ('diary@leadshunter.biz', 'admin@unity.com')
        )
    );

-- UPDATE policy (only admins)
CREATE POLICY "subscriptions_update_policy"
    ON subscriptions
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE users.id = (SELECT auth.uid()) 
            AND users.email IN ('diary@leadshunter.biz', 'admin@unity.com')
        )
    );

-- DELETE policy (only admins)
CREATE POLICY "subscriptions_delete_policy"
    ON subscriptions
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE users.id = (SELECT auth.uid()) 
            AND users.email IN ('diary@leadshunter.biz', 'admin@unity.com')
        )
    );

-- 4. Add missing indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_by ON subscriptions(created_by);
CREATE INDEX IF NOT EXISTS idx_subscriptions_updated_by ON subscriptions(updated_by);

