-- Migration: Add Index on entries.user_id
-- Date: 2025-10-21
-- Description: Создание индекса для foreign key entries_user_id_fkey
--
-- Проблема: Foreign key entries_user_id_fkey БЕЗ покрывающего индекса
-- Влияние: При 100,000 пользователей запросы будут занимать 10-30 секунд вместо миллисекунд
-- Решение: Создать индекс на entries.user_id
--
-- Performance Impact:
-- - До: Full table scan для JOIN по user_id (O(n))
-- - После: Index scan (O(log n))
-- - Ожидаемое ускорение: 100-1000x для запросов с фильтрацией по user_id

-- ============================================================================
-- CREATE INDEX ON entries.user_id
-- ============================================================================
-- Создаем индекс на user_id для ускорения JOIN и фильтрации по пользователю
-- Примечание: CONCURRENTLY нельзя использовать в транзакции миграции

CREATE INDEX IF NOT EXISTS idx_entries_user_id
ON public.entries(user_id);

-- Анализ таблицы для обновления статистики планировщика запросов
ANALYZE public.entries;

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
-- WHERE tablename = 'entries' 
--   AND indexname = 'idx_entries_user_id';
--
-- Ожидаемый результат:
-- schemaname | tablename | indexname            | indexdef
-- -----------+-----------+----------------------+------------------------------------------
-- public     | entries   | idx_entries_user_id  | CREATE INDEX idx_entries_user_id ON ...

-- ============================================================================
-- PERFORMANCE TEST QUERY
-- ============================================================================
-- Проверка производительности запроса с использованием индекса:
--
-- EXPLAIN ANALYZE
-- SELECT * FROM entries 
-- WHERE user_id = 'some-user-uuid'
-- ORDER BY created_at DESC
-- LIMIT 10;
--
-- Ожидаемый план выполнения должен содержать:
-- "Index Scan using idx_entries_user_id on entries"
-- вместо "Seq Scan on entries"

