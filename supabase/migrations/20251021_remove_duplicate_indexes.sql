-- Migration: Remove Duplicate Indexes from kv_store_9729c493
-- Date: 2025-10-21
-- Description: Удаление 9 из 10 идентичных индексов на kv_store_9729c493
--
-- Проблема: Таблица kv_store_9729c493 имеет 10 ИДЕНТИЧНЫХ индексов
-- Влияние: Замедление INSERT/UPDATE в 10 раз, лишние 10MB на диске
-- Решение: Удалить 9 дублирующихся индексов, оставить только один
--
-- Performance Impact:
-- - До: 10 индексов обновляются при каждом INSERT/UPDATE
-- - После: 1 индекс обновляется при каждом INSERT/UPDATE
-- - Ожидаемое ускорение: 10x для INSERT/UPDATE операций
-- - Освобождение места: ~9-10 MB на диске

-- ============================================================================
-- DROP DUPLICATE INDEXES
-- ============================================================================
-- Удаляем 9 дублирующихся индексов, оставляем только kv_store_9729c493_key_idx

DROP INDEX IF EXISTS public.kv_store_9729c493_key_idx1;
DROP INDEX IF EXISTS public.kv_store_9729c493_key_idx2;
DROP INDEX IF EXISTS public.kv_store_9729c493_key_idx3;
DROP INDEX IF EXISTS public.kv_store_9729c493_key_idx4;
DROP INDEX IF EXISTS public.kv_store_9729c493_key_idx5;
DROP INDEX IF EXISTS public.kv_store_9729c493_key_idx6;
DROP INDEX IF EXISTS public.kv_store_9729c493_key_idx7;
DROP INDEX IF EXISTS public.kv_store_9729c493_key_idx8;
DROP INDEX IF EXISTS public.kv_store_9729c493_key_idx9;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- После применения миграции выполните этот запрос для проверки:
--
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE tablename = 'kv_store_9729c493'
-- ORDER BY indexname;
--
-- Ожидаемый результат: только 1 индекс kv_store_9729c493_key_idx

