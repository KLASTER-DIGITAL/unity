# Query Performance Report - 2025-10-21

## 📊 Общие метрики

- **Slow Queries:** 12
- **Cache Hit Rate:** 99.98%
- **Avg Rows Per Call:** 3.1

## 🔍 Топ-5 запросов


### 1. SELECT name FROM pg_timezone_names...

- **Time consumed:** 48.5%
- **Count:** 194
- **Max time:** 912ms
- **Mean time:** 180ms


### 2. WITH -- Recursively get the base types......

- **Time consumed:** 8.9%
- **Count:** 194
- **Max time:** 150ms
- **Mean time:** 33ms


### 3. with tables as (SELECT c.oid :: int8...)...

- **Time consumed:** 6.7%
- **Count:** 25
- **Max time:** 339ms
- **Mean time:** 195ms


### 4. SELECT e.name, n.nspname AS schema......

- **Time consumed:** 5.9%
- **Count:** 38
- **Max time:** 756ms
- **Mean time:** 112ms


### 5. CREATE OR REPLACE FUNCTION pg_temp.count_e......

- **Time consumed:** 5%
- **Count:** 98
- **Max time:** 130ms
- **Mean time:** 37ms


## ⚠️ Алерты

- ⚠️ Обнаружено 12 медленных запросов
- 🚨 Критичный запрос потребляет 48.5% времени БД: SELECT name FROM pg_timezone_names...

## 💡 Рекомендации

1. **pg_timezone_names** - системный запрос Supabase Studio, игнорировать
2. **Рекурсивные CTE** - запросы метаданных, игнорировать
3. **Cache Hit Rate** - отлично (99.98%)
4. **Продолжать мониторинг** - еженедельно

---

*Сгенерировано автоматически: 2025-10-21T11:14:17.357Z*
