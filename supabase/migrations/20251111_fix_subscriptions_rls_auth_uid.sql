-- Migration: Fix subscriptions RLS policies - auth.uid() → (SELECT auth.uid())
-- Created: 2025-11-11
-- Purpose: Fix 403 error when querying subscriptions table
-- Issue: RLS policies use auth.uid() directly instead of (SELECT auth.uid())

-- Drop existing RLS policies
DROP POLICY IF EXISTS "subscriptions_select_policy" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_policy" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_policy" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_delete_policy" ON subscriptions;

-- Create fixed RLS policies with (SELECT auth.uid())

-- SELECT policy (users can view own, admins can view all)
CREATE POLICY "subscriptions_select_policy"
    ON subscriptions
    FOR SELECT
    TO authenticated
    USING (
        (SELECT auth.uid()) = user_id OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (SELECT auth.uid()) 
            AND profiles.role = 'super_admin'
        )
    );

-- INSERT policy (only admins)
CREATE POLICY "subscriptions_insert_policy"
    ON subscriptions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (SELECT auth.uid()) 
            AND profiles.role = 'super_admin'
        )
    );

-- UPDATE policy (only admins)
CREATE POLICY "subscriptions_update_policy"
    ON subscriptions
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (SELECT auth.uid()) 
            AND profiles.role = 'super_admin'
        )
    );

-- DELETE policy (only admins)
CREATE POLICY "subscriptions_delete_policy"
    ON subscriptions
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (SELECT auth.uid()) 
            AND profiles.role = 'super_admin'
        )
    );

-- Add comment
COMMENT ON POLICY "subscriptions_select_policy" ON subscriptions IS 'Users can view own subscriptions, super_admins can view all';
COMMENT ON POLICY "subscriptions_insert_policy" ON subscriptions IS 'Only super_admins can create subscriptions';
COMMENT ON POLICY "subscriptions_update_policy" ON subscriptions IS 'Only super_admins can update subscriptions';
COMMENT ON POLICY "subscriptions_delete_policy" ON subscriptions IS 'Only super_admins can delete subscriptions';

