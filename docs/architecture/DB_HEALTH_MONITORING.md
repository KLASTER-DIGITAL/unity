# Database Health Monitoring

**Дата**: 2025-11-15  
**Версия**: 1.0  
**Статус**: ✅ Реализовано

---

## 🎯 Цель

Раннее обнаружение проблем БД при масштабировании до 100,000 пользователей через автоматический мониторинг ключевых метрик.

---

## 📊 Метрики

### 1. Database Size

**Метрика**: `size_mb`  
**Единица**: MB  
**Цель**: Отслеживание роста БД

**Пороги**:
- ✅ Healthy: < 1000 MB (Free tier limit: 500 MB)
- ⚠️ Warning: 1000-2000 MB
- 🔴 Critical: > 2000 MB

### 2. Connections

**Метрики**:
- `active` - активные подключения
- `idle` - простаивающие подключения
- `max` - максимум подключений
- `usage_percent` - процент использования

**Пороги**:
- ✅ Healthy: < 60%
- ⚠️ Warning: 60-80%
- 🔴 Critical: > 80%

**Supabase Free tier**: max 60 connections

### 3. Cache Hit Ratio

**Метрика**: `cache.hit_ratio`  
**Единица**: %  
**Цель**: Процент запросов обслуженных из кэша

**Пороги**:
- ✅ Healthy: ≥ 99%
- ⚠️ Warning: 95-99%
- 🔴 Critical: < 95%

**Проблема**: Низкий cache hit ratio → медленные запросы, высокая нагрузка на диск

### 4. Index Hit Ratio

**Метрика**: `indexes.hit_ratio`  
**Единица**: %  
**Цель**: Процент запросов использующих индексы

**Пороги**:
- ✅ Healthy: ≥ 95%
- ⚠️ Warning: 90-95%
- 🔴 Critical: < 90%

**Проблема**: Низкий index hit ratio → медленные запросы, sequential scans

### 5. Table Bloat Ratio

**Метрика**: `bloat.ratio`  
**Единица**: %  
**Цель**: Процент "мертвого" пространства в таблицах

**Пороги**:
- ✅ Healthy: < 20%
- ⚠️ Warning: 20-40%
- 🔴 Critical: > 40%

**Проблема**: Высокий bloat → медленные запросы, большой размер БД

**Решение**: VACUUM FULL (требует downtime) или pg_repack

### 6. Performance

**Метрики**:
- `deadlocks` - количество deadlocks
- `slow_queries` - количество медленных запросов (> 1 сек)

**Пороги**:
- ✅ Healthy: 0 deadlocks, < 5 slow queries
- ⚠️ Warning: < 10 deadlocks, < 20 slow queries
- 🔴 Critical: ≥ 10 deadlocks, ≥ 20 slow queries

---

## 🏗️ Архитектура

### 1. SQL Function

**Файл**: `supabase/migrations/20251115_add_db_health_monitoring.sql`

**Функция**: `get_db_health_metrics()`

**Возвращает**: JSON с метриками

**Источники данных**:
- `pg_database_size()` - размер БД
- `pg_stat_activity` - подключения
- `pg_stat_database` - cache hit ratio, deadlocks
- `pg_statio_user_indexes` - index hit ratio
- `pg_tables` + `pg_total_relation_size()` - table bloat

### 2. Edge Function

**Файл**: `supabase/functions/db-health-monitor/index.ts`

**Функции**:
- `getDBHealthMetrics()` - вызов RPC функции
- `saveMetricsToHistory()` - сохранение в таблицу `db_health_history`
- `logMetrics()` - structured logging для Supabase Logs

**API**:
```bash
GET https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/db-health-monitor
```

### 3. History Table

**Таблица**: `db_health_history`

**Колонки**:
- `id` (UUID) - primary key
- `metrics` (JSONB) - метрики
- `created_at` (TIMESTAMPTZ) - timestamp

**Retention**: 30 дней (автоматический cleanup)

**Индекс**: `idx_db_health_history_created_at` для быстрого поиска

### 4. Cron Job

**Расписание**: Каждый час

**Команда**:
```sql
SELECT cron.schedule(
  'db-health-monitor-hourly',
  '0 * * * *',  -- Каждый час
  $$
  SELECT net.http_post(
    url := 'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/db-health-monitor',
    headers := '{"Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

---

## 📈 Мониторинг

### Проверка метрик вручную

```bash
# Через Edge Function
curl https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/db-health-monitor \
  -H "Authorization: Bearer SERVICE_ROLE_KEY"

# Через SQL
SELECT get_db_health_metrics();
```

### История метрик

```sql
-- Последние 24 часа
SELECT 
  created_at,
  metrics->>'size_mb' as size_mb,
  metrics->'connections'->>'usage_percent' as conn_usage,
  metrics->'cache'->>'hit_ratio' as cache_hit,
  metrics->'indexes'->>'hit_ratio' as index_hit
FROM db_health_history
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Тренд роста БД
SELECT 
  DATE_TRUNC('day', created_at) as day,
  AVG((metrics->>'size_mb')::NUMERIC) as avg_size_mb,
  MAX((metrics->>'size_mb')::NUMERIC) as max_size_mb
FROM db_health_history
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day DESC;
```

### Supabase Logs

**Фильтр**: `[DB-HEALTH-METRIC]`

**Формат**: JSON structured logging

**Примеры**:
```
[DB-HEALTH-METRIC] {"timestamp":"2025-11-15T12:00:00Z","size_mb":450,...}
[DB-HEALTH-WARNING] {"metric":"cache_hit_ratio","value":97.5,"status":"warning"}
[DB-HEALTH-CRITICAL] {"metric":"connection_usage","value":85,"active":51,"max":60}
```

---

## 🚨 Алерты

### Настройка в Supabase

1. **Supabase Dashboard** → **Database** → **Cron Jobs**
2. Создать Cron Job для проверки метрик
3. При критических значениях → отправка уведомления

### Примеры алертов

**Alert 1: High Connection Usage**
```sql
-- Если usage > 80% → отправить уведомление
SELECT 
  CASE 
    WHEN (metrics->'connections'->>'usage_percent')::NUMERIC > 80
    THEN net.http_post(
      url := 'WEBHOOK_URL',
      body := jsonb_build_object('alert', 'high_connection_usage', 'value', metrics->'connections'->>'usage_percent')
    )
  END
FROM db_health_history
WHERE created_at > NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC
LIMIT 1;
```

**Alert 2: Low Cache Hit Ratio**
```sql
-- Если cache hit < 95% → отправить уведомление
```

---

## 📝 Changelog

### 2025-11-15 - v1.0 (Initial Release)
- ✅ Создана SQL функция `get_db_health_metrics()`
- ✅ Создана таблица `db_health_history`
- ✅ Создан Edge Function `db-health-monitor`
- ✅ Structured logging для Supabase Logs
- ✅ Документация

