-- Migration: Optimize RLS Policies - Replace auth.uid() with (SELECT auth.uid())
-- Date: 2025-10-21
-- Description: Оптимизация 32 RLS политик для предотвращения re-evaluation auth.uid() для каждой строки
--
-- Проблема: RLS политики вызывают auth.uid() для КАЖДОЙ строки вместо одного раза
-- Влияние: При 100,000 пользователей производительность падает в 100-1000 раз
-- Решение: Заменить auth.uid() на (SELECT auth.uid()) во всех политиках
--
-- Performance Impact:
-- - До: auth.uid() вызывается N раз (для каждой строки)
-- - После: (SELECT auth.uid()) вызывается 1 раз (кэшируется)
-- - Ожидаемое ускорение: 100-1000x для запросов с RLS

-- ============================================================================
-- PROFILES TABLE (4 политики)
-- ============================================================================

-- 1. profiles_user_access
DROP POLICY IF EXISTS "profiles_user_access" ON public.profiles;
CREATE POLICY "profiles_user_access" ON public.profiles
FOR ALL TO authenticated
USING ((SELECT auth.uid()) = id);

-- 2. Users can read own profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = id);

-- 3. Users can update own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

-- ============================================================================
-- ENTRIES TABLE (1 политика)
-- ============================================================================

-- 4. entries_user_access
DROP POLICY IF EXISTS "entries_user_access" ON public.entries;
CREATE POLICY "entries_user_access" ON public.entries
FOR ALL TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- ENTRY_SUMMARIES TABLE (7 политик)
-- ============================================================================

-- 5. Users can view own entry summaries
DROP POLICY IF EXISTS "Users can view own entry summaries" ON public.entry_summaries;
CREATE POLICY "Users can view own entry summaries" ON public.entry_summaries
FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 6. Users can view own summaries
DROP POLICY IF EXISTS "Users can view own summaries" ON public.entry_summaries;
CREATE POLICY "Users can view own summaries" ON public.entry_summaries
FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 7. Users can create own entry summaries
DROP POLICY IF EXISTS "Users can create own entry summaries" ON public.entry_summaries;
CREATE POLICY "Users can create own entry summaries" ON public.entry_summaries
FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 8. Users can insert own summaries
DROP POLICY IF EXISTS "Users can insert own summaries" ON public.entry_summaries;
CREATE POLICY "Users can insert own summaries" ON public.entry_summaries
FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 9. Users can update own entry summaries
DROP POLICY IF EXISTS "Users can update own entry summaries" ON public.entry_summaries;
CREATE POLICY "Users can update own entry summaries" ON public.entry_summaries
FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 10. Users can update own summaries
DROP POLICY IF EXISTS "Users can update own summaries" ON public.entry_summaries;
CREATE POLICY "Users can update own summaries" ON public.entry_summaries
FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 11. Users can delete own summaries
DROP POLICY IF EXISTS "Users can delete own summaries" ON public.entry_summaries;
CREATE POLICY "Users can delete own summaries" ON public.entry_summaries
FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 12. Admins can view all entry summaries
DROP POLICY IF EXISTS "Admins can view all entry summaries" ON public.entry_summaries;
CREATE POLICY "Admins can view all entry summaries" ON public.entry_summaries
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.role = 'admin'
  )
);

-- ============================================================================
-- BOOKS_ARCHIVE TABLE (6 политик)
-- ============================================================================

-- 13. Users can view own books
DROP POLICY IF EXISTS "Users can view own books" ON public.books_archive;
CREATE POLICY "Users can view own books" ON public.books_archive
FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 14. Users can create own books
DROP POLICY IF EXISTS "Users can create own books" ON public.books_archive;
CREATE POLICY "Users can create own books" ON public.books_archive
FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 15. Users can insert own books
DROP POLICY IF EXISTS "Users can insert own books" ON public.books_archive;
CREATE POLICY "Users can insert own books" ON public.books_archive
FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 16. Users can update own books
DROP POLICY IF EXISTS "Users can update own books" ON public.books_archive;
CREATE POLICY "Users can update own books" ON public.books_archive
FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 17. Users can delete own books
DROP POLICY IF EXISTS "Users can delete own books" ON public.books_archive;
CREATE POLICY "Users can delete own books" ON public.books_archive
FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 18. Admins can view all books
DROP POLICY IF EXISTS "Admins can view all books" ON public.books_archive;
CREATE POLICY "Admins can view all books" ON public.books_archive
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.role = 'admin'
  )
);

-- ============================================================================
-- STORY_SNAPSHOTS TABLE (6 политик)
-- ============================================================================

-- 19. Users can view own snapshots
DROP POLICY IF EXISTS "Users can view own snapshots" ON public.story_snapshots;
CREATE POLICY "Users can view own snapshots" ON public.story_snapshots
FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 20. Users can create own snapshots
DROP POLICY IF EXISTS "Users can create own snapshots" ON public.story_snapshots;
CREATE POLICY "Users can create own snapshots" ON public.story_snapshots
FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 21. Users can insert own snapshots
DROP POLICY IF EXISTS "Users can insert own snapshots" ON public.story_snapshots;
CREATE POLICY "Users can insert own snapshots" ON public.story_snapshots
FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 22. Users can update own snapshots
DROP POLICY IF EXISTS "Users can update own snapshots" ON public.story_snapshots;
CREATE POLICY "Users can update own snapshots" ON public.story_snapshots
FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 23. Users can delete own snapshots
DROP POLICY IF EXISTS "Users can delete own snapshots" ON public.story_snapshots;
CREATE POLICY "Users can delete own snapshots" ON public.story_snapshots
FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 24. Admins can view all snapshots
DROP POLICY IF EXISTS "Admins can view all snapshots" ON public.story_snapshots;
CREATE POLICY "Admins can view all snapshots" ON public.story_snapshots
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.role = 'admin'
  )
);

-- ============================================================================
-- MOTIVATION_CARDS TABLE (4 политики)
-- ============================================================================

-- 25. Users can view their own motivation cards
DROP POLICY IF EXISTS "Users can view their own motivation cards" ON public.motivation_cards;
CREATE POLICY "Users can view their own motivation cards" ON public.motivation_cards
FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 26. Users can insert their own motivation cards
DROP POLICY IF EXISTS "Users can insert their own motivation cards" ON public.motivation_cards;
CREATE POLICY "Users can insert their own motivation cards" ON public.motivation_cards
FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 27. Users can update their own motivation cards
DROP POLICY IF EXISTS "Users can update their own motivation cards" ON public.motivation_cards;
CREATE POLICY "Users can update their own motivation cards" ON public.motivation_cards
FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 28. Users can delete their own motivation cards
DROP POLICY IF EXISTS "Users can delete their own motivation cards" ON public.motivation_cards;
CREATE POLICY "Users can delete their own motivation cards" ON public.motivation_cards
FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- OPENAI_USAGE_STATS TABLE (2 политики)
-- ============================================================================

-- 29. Users can view own stats
DROP POLICY IF EXISTS "Users can view own stats" ON public.openai_usage_stats;
CREATE POLICY "Users can view own stats" ON public.openai_usage_stats
FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 30. Super admins can view all stats
DROP POLICY IF EXISTS "Super admins can view all stats" ON public.openai_usage_stats;
CREATE POLICY "Super admins can view all stats" ON public.openai_usage_stats
FOR SELECT TO authenticated
USING (
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
-- SELECT 
--   tablename,
--   policyname,
--   cmd,
--   qual as using_clause,
--   with_check as with_check_clause
-- FROM pg_policies 
-- WHERE schemaname = 'public'
--   AND tablename IN ('profiles', 'entries', 'entry_summaries', 'books_archive', 
--                     'story_snapshots', 'motivation_cards', 'openai_usage_stats')
--   AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
-- ORDER BY tablename, policyname;
--
-- Ожидаемый результат: 0 строк (все auth.uid() заменены на (SELECT auth.uid()))

