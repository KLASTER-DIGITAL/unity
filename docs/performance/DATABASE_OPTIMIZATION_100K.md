# Database Optimization for 100,000 Users

**Дата:** 2025-10-24  
**Версия:** UNITY-v2  
**Цель:** Подготовка БД к масштабированию до 100,000 пользователей за 1 год

---

## 📊 Текущее состояние

### ✅ Уже оптимизировано

#### 1. Индексы (45 индексов)
**Критические индексы для производительности:**
- `idx_entries_user_id` - быстрый поиск записей пользователя
- `idx_media_files_user_id` + `idx_media_files_entry_id` - медиа файлы
- `idx_profiles_is_premium` - фильтрация премиум пользователей
- `idx_usage_user_date` - composite index для аналитики
- `idx_translations_lang_key` - composite index для i18n
- `idx_push_subscriptions_user_id` + `idx_push_subscriptions_is_active` - push уведомления

#### 2. N+1 Query Prevention
**admin-api Edge Function:**
```typescript
// ✅ Оптимизировано: используем RPC вместо N+1
const { data: usersRaw, error } = await supabaseAdmin
  .rpc('get_users_with_stats');
// Вместо: 1 запрос users + N запросов для каждого пользователя
```

**translations-management Edge Function:**
```typescript
// ✅ Оптимизировано: 2 запроса вместо N+1
// 1. Получить все ключи
// 2. Получить все переводы
// 3. Обработка в памяти
```

#### 3. RLS Policies
**Оптимизированы для производительности:**
- Используется `(select auth.uid())` вместо `auth.uid()` для кэширования
- 28 политик оптимизированы (0 performance warnings)

---

## 🎯 Рекомендации для масштабирования

### 1. Connection Pooling (P0 - Критично)

**Проблема:** При 100k пользователей может возникнуть нехватка соединений с БД

**Решение:**
```typescript
// Supabase автоматически использует PgBouncer
// Но нужно настроить правильные параметры

// В Edge Functions использовать:
const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: false, // Важно для Edge Functions
    },
  }
);
```

**Мониторинг:**
```sql
-- Проверить текущие соединения
SELECT count(*) FROM pg_stat_activity;

-- Проверить максимум соединений
SHOW max_connections;
```

### 2. Партиционирование таблиц (P1 - Важно)

**Таблицы для партиционирования при росте:**

#### entries (текущий размер: ~1000 записей → 10M+ при 100k пользователей)
```sql
-- Партиционирование по месяцам
CREATE TABLE entries_2025_01 PARTITION OF entries
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE entries_2025_02 PARTITION OF entries
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

#### openai_usage (быстрый рост при AI функциях)
```sql
-- Партиционирование по месяцам
CREATE TABLE openai_usage_2025_01 PARTITION OF openai_usage
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

**Когда применять:** При достижении 1M записей в таблице

### 3. Дополнительные индексы (P2 - Желательно)

**Для частых запросов:**

```sql
-- Composite index для фильтрации записей по категории и дате
CREATE INDEX idx_entries_user_category_date 
ON entries(user_id, category, created_at DESC);

-- Partial index для активных push подписок
CREATE INDEX idx_push_active_users 
ON push_subscriptions(user_id) 
WHERE is_active = true;

-- Index для поиска по тегам (GIN index)
CREATE INDEX idx_entries_tags 
ON entries USING GIN(tags);
```

### 4. Архивация старых данных (P1 - Важно)

**Стратегия:**
- Записи старше 2 лет → `entries_archive` таблица
- Media files старше 1 года (неактивные) → cold storage
- Push history старше 6 месяцев → удаление

```sql
-- Создать архивную таблицу
CREATE TABLE entries_archive (LIKE entries INCLUDING ALL);

-- Переместить старые записи (запускать раз в месяц)
INSERT INTO entries_archive 
SELECT * FROM entries 
WHERE created_at < NOW() - INTERVAL '2 years';

DELETE FROM entries 
WHERE created_at < NOW() - INTERVAL '2 years';
```

### 5. Vacuum и Analyze (P0 - Критично)

**Автоматическая оптимизация:**
```sql
-- Проверить настройки autovacuum
SELECT name, setting 
FROM pg_settings 
WHERE name LIKE 'autovacuum%';

-- Ручной VACUUM для больших таблиц (при необходимости)
VACUUM ANALYZE entries;
VACUUM ANALYZE profiles;
VACUUM ANALYZE translations;
```

### 6. Query Performance Monitoring

**Включить pg_stat_statements:**
```sql
-- Найти медленные запросы
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## 📈 Метрики для мониторинга

### Критические метрики:

1. **Database Size**
   - Текущий: ~50 MB
   - Целевой при 100k: ~5-10 GB
   - Алерт: >15 GB

2. **Active Connections**
   - Текущий: ~10
   - Целевой при 100k: ~50-100
   - Алерт: >150

3. **Query Performance**
   - Средний query time: <50ms
   - P95 query time: <200ms
   - Алерт: >500ms

4. **Index Hit Ratio**
   - Целевой: >99%
   - Алерт: <95%

```sql
-- Проверить index hit ratio
SELECT 
  sum(idx_blks_hit) / nullif(sum(idx_blks_hit + idx_blks_read), 0) * 100 AS index_hit_ratio
FROM pg_statio_user_indexes;
```

---

## 🚀 План внедрения

### Фаза 1: Немедленно (0-1000 пользователей)
- [x] Оптимизировать RLS policies
- [x] Добавить критические индексы
- [x] Исправить N+1 проблемы
- [ ] Настроить мониторинг метрик

### Фаза 2: При 10,000 пользователей
- [ ] Добавить composite индексы
- [ ] Настроить архивацию старых данных
- [ ] Оптимизировать autovacuum
- [ ] Добавить партиционирование для entries

### Фаза 3: При 50,000 пользователей
- [ ] Партиционирование всех больших таблиц
- [ ] Read replicas для аналитики
- [ ] Кэширование на уровне приложения (Redis)
- [ ] CDN для статических ресурсов

### Фаза 4: При 100,000 пользователей
- [ ] Horizontal sharding (если необходимо)
- [ ] Dedicated database instances
- [ ] Advanced caching strategies
- [ ] Load balancing

---

## ✅ Чеклист готовности

- [x] Все таблицы имеют primary keys
- [x] Foreign keys имеют индексы
- [x] RLS policies оптимизированы
- [x] N+1 проблемы исправлены
- [ ] Мониторинг настроен
- [ ] Алерты настроены
- [ ] Backup стратегия определена
- [ ] Disaster recovery план создан

---

## 📚 Дополнительные ресурсы

- [Supabase Performance Guide](https://supabase.com/docs/guides/platform/performance)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

