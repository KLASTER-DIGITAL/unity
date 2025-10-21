-- Migration: Fix Remaining RLS Issues
-- Date: 2025-10-21
-- Description: Исправление оставшихся 12 RLS политик с auth.uid() и 9 дублирующихся политик
--
-- Проблемы:
-- 1. auth_rls_initplan - 12 политик (admin_settings, translations, languages, media_files, admin policies)
-- 2. multiple_permissive_policies - 9 политик (entries, profiles, openai_usage_stats)

-- ============================================================================
-- PART 1: Fix auth_rls_initplan - Admin Policies
-- ============================================================================

-- admin_settings
DROP POLICY IF EXISTS "admin_full_access_admin_settings" ON public.admin_settings;
CREATE POLICY "admin_full_access_admin_settings" ON public.admin_settings
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.role = 'super_admin'
  )
);

-- profiles - admin policy
DROP POLICY IF EXISTS "admin_full_access_profiles" ON public.profiles;
CREATE POLICY "admin_full_access_profiles" ON public.profiles
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.role = 'super_admin'
  )
);

-- entries - admin policy
DROP POLICY IF EXISTS "admin_full_access_entries" ON public.entries;
CREATE POLICY "admin_full_access_entries" ON public.entries
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.role = 'super_admin'
  )
);

-- ============================================================================
-- PART 2: Fix auth_rls_initplan - Translations Table
-- ============================================================================

DROP POLICY IF EXISTS "Only super_admin can insert translations" ON public.translations;
CREATE POLICY "Only super_admin can insert translations" ON public.translations
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.role = 'super_admin'
  )
);

DROP POLICY IF EXISTS "Only super_admin can update translations" ON public.translations;
CREATE POLICY "Only super_admin can update translations" ON public.translations
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.role = 'super_admin'
  )
);

DROP POLICY IF EXISTS "Only super_admin can delete translations" ON public.translations;
CREATE POLICY "Only super_admin can delete translations" ON public.translations
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.role = 'super_admin'
  )
);

-- ============================================================================
-- PART 3: Fix auth_rls_initplan - Languages Table
-- ============================================================================

DROP POLICY IF EXISTS "Only super_admin can insert languages" ON public.languages;
CREATE POLICY "Only super_admin can insert languages" ON public.languages
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.role = 'super_admin'
  )
);

DROP POLICY IF EXISTS "Only super_admin can update languages" ON public.languages;
CREATE POLICY "Only super_admin can update languages" ON public.languages
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.role = 'super_admin'
  )
);

DROP POLICY IF EXISTS "Only super_admin can delete languages" ON public.languages;
CREATE POLICY "Only super_admin can delete languages" ON public.languages
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.role = 'super_admin'
  )
);

-- ============================================================================
-- PART 4: Fix auth_rls_initplan - Media Files Table
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own media files" ON public.media_files;
CREATE POLICY "Users can view their own media files" ON public.media_files
FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own media files" ON public.media_files;
CREATE POLICY "Users can insert their own media files" ON public.media_files
FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own media files" ON public.media_files;
CREATE POLICY "Users can update their own media files" ON public.media_files
FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- PART 5: Consolidate Multiple Permissive Policies
-- ============================================================================

-- PROFILES - Consolidate 3 policies for authenticated role
-- Keep admin_full_access_profiles and profiles_user_access as they serve different purposes
-- But consolidate "Users can read own profile" and "Users can update own profile" into profiles_user_access

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- profiles_user_access already handles user access, no need for separate policies

-- ENTRIES - Keep both policies as they serve different purposes (user + admin)
-- admin_full_access_entries - for super_admin
-- entries_user_access - for regular users

-- OPENAI_USAGE_STATS - Consolidate "System can manage stats" with openai_usage_stats_select_policy
DROP POLICY IF EXISTS "System can manage stats" ON public.openai_usage_stats;

-- Recreate with combined logic
CREATE POLICY "openai_usage_stats_all_policy" ON public.openai_usage_stats
FOR ALL TO authenticated
USING (
  (SELECT auth.uid()) = user_id OR
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = (SELECT auth.uid()) 
      AND users.email IN ('diary@leadshunter.biz', 'admin@unity.com')
  )
)
WITH CHECK (
  (SELECT auth.uid()) = user_id OR
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = (SELECT auth.uid()) 
      AND users.email IN ('diary@leadshunter.biz', 'admin@unity.com')
  )
);

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- После применения миграции выполните этот запрос для проверки:
--
-- SELECT COUNT(*) as remaining_issues
-- FROM (
--   SELECT 'auth_rls_initplan' as issue_type, COUNT(*) as count
--   FROM pg_policies 
--   WHERE schemaname = 'public'
--     AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
--     AND (qual NOT LIKE '%(SELECT auth.uid())%' AND with_check NOT LIKE '%(SELECT auth.uid())%')
--   UNION ALL
--   SELECT 'multiple_permissive_policies', COUNT(*)
--   FROM (
--     SELECT tablename, cmd
--     FROM pg_policies 
--     WHERE schemaname = 'public' AND permissive = 'PERMISSIVE'
--     GROUP BY tablename, cmd
--     HAVING COUNT(*) > 1
--   ) sub
-- ) issues;
--
-- Ожидаемый результат: минимальное количество проблем

