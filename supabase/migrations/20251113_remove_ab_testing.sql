-- ============================================================================
-- Remove A/B Testing System
-- ============================================================================
-- Created: 2025-11-13
-- Description: Удаление всей системы A/B Testing для упрощения системы рассылок
-- Reason: Пользователь хочет простую систему рассылок без A/B Testing

-- ============================================================================
-- 1. DROP POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Super admins can view all AB tests" ON push_ab_tests;
DROP POLICY IF EXISTS "Super admins can create AB tests" ON push_ab_tests;
DROP POLICY IF EXISTS "Super admins can update AB tests" ON push_ab_tests;
DROP POLICY IF EXISTS "Super admins can delete AB tests" ON push_ab_tests;
DROP POLICY IF EXISTS "Super admins can view all AB test assignments" ON push_ab_test_assignments;
DROP POLICY IF EXISTS "Super admins can create AB test assignments" ON push_ab_test_assignments;
DROP POLICY IF EXISTS "Super admins can update AB test assignments" ON push_ab_test_assignments;

-- ============================================================================
-- 2. DROP INDEXES
-- ============================================================================
DROP INDEX IF EXISTS idx_ab_tests_status;
DROP INDEX IF EXISTS idx_ab_tests_created_by;
DROP INDEX IF EXISTS idx_ab_test_assignments_ab_test_id;
DROP INDEX IF EXISTS idx_ab_test_assignments_user_id;
DROP INDEX IF EXISTS idx_ab_test_assignments_variant;
DROP INDEX IF EXISTS idx_ab_test_assignments_status;

-- ============================================================================
-- 3. DROP TABLES
-- ============================================================================
DROP TABLE IF EXISTS push_ab_test_assignments CASCADE;
DROP TABLE IF EXISTS push_ab_tests CASCADE;

-- ============================================================================
-- 4. REMOVE AB_TEST_ID FROM PUSH_CAMPAIGNS
-- ============================================================================
-- Remove ab_test_id column from push_campaigns table
ALTER TABLE push_campaigns DROP COLUMN IF EXISTS ab_test_id;

COMMENT ON TABLE push_campaigns IS 'Push notification campaigns - simplified without A/B testing';

