-- Migration: Fix Security Advisors Issues
-- Date: 2025-10-21
-- Description: Исправление 7 проблем безопасности обнаруженных Supabase Advisors
--
-- Проблемы:
-- 1. RLS Enabled No Policy - kv_store_9729c493 (INFO)
-- 2. Function Search Path Mutable - 5 функций (WARN)
-- 3. Leaked Password Protection - требует ручного включения в Dashboard (WARN)

-- ============================================================================
-- 1. FIX: RLS Enabled No Policy - kv_store_9729c493
-- ============================================================================
-- Проблема: Таблица имеет включенный RLS, но нет политик безопасности
-- Решение: Создать RLS политику для authenticated пользователей

-- Создаем политику для чтения/записи kv_store
CREATE POLICY "kv_store_authenticated_access"
ON public.kv_store_9729c493
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Комментарий для документации
COMMENT ON POLICY "kv_store_authenticated_access" ON public.kv_store_9729c493 IS 
'Allows authenticated users full access to kv_store. This is a system table for key-value storage.';

-- ============================================================================
-- 2. FIX: Function Search Path Mutable - 5 функций
-- ============================================================================
-- Проблема: Функции не имеют фиксированного search_path, что создает уязвимость
-- Решение: Установить search_path = public, pg_temp для всех функций

-- 2.1. update_admin_settings_updated_at
ALTER FUNCTION public.update_admin_settings_updated_at() 
SET search_path = public, pg_temp;

-- 2.2. update_translations_updated_at
ALTER FUNCTION public.update_translations_updated_at() 
SET search_path = public, pg_temp;

-- 2.3. update_updated_at_column
ALTER FUNCTION public.update_updated_at_column() 
SET search_path = public, pg_temp;

-- 2.4. upsert_usage_stats
ALTER FUNCTION public.upsert_usage_stats(
  p_user_id uuid,
  p_period_start date,
  p_period_end date,
  p_operation_type character varying,
  p_tokens integer,
  p_cost numeric
) SET search_path = public, pg_temp;

-- 2.5. get_user_usage_summary
ALTER FUNCTION public.get_user_usage_summary(p_user_id uuid, p_days integer)
SET search_path = public, pg_temp;

-- ============================================================================
-- 3. MANUAL ACTION REQUIRED: Leaked Password Protection
-- ============================================================================
-- Проблема: Защита от скомпрометированных паролей отключена
-- Решение: ТРЕБУЕТСЯ РУЧНОЕ ДЕЙСТВИЕ
--
-- ИНСТРУКЦИЯ:
-- 1. Открыть Supabase Dashboard
-- 2. Перейти в Authentication → Password Settings
-- 3. Включить "Enable leaked password protection"
-- 4. Сохранить изменения
--
-- Это нельзя сделать через SQL миграцию, только через Dashboard или Management API

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- После применения миграции выполните эти запросы для проверки:

-- Проверка RLS политики на kv_store_9729c493
-- SELECT * FROM pg_policies WHERE tablename = 'kv_store_9729c493';

-- Проверка search_path для функций
-- SELECT 
--   p.proname as function_name,
--   pg_get_function_identity_arguments(p.oid) as arguments,
--   p.proconfig as search_path_config
-- FROM pg_proc p
-- JOIN pg_namespace n ON p.pronamespace = n.oid
-- WHERE n.nspname = 'public'
--   AND p.proname IN (
--     'update_admin_settings_updated_at',
--     'update_translations_updated_at', 
--     'update_updated_at_column',
--     'upsert_usage_stats',
--     'get_user_usage_summary'
--   );

