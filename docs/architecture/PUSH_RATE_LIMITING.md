# Push Notifications Rate Limiting

**Дата**: 2025-11-15  
**Версия**: 1.0  
**Статус**: ✅ Реализовано

---

## 🎯 Цель

Предотвращение спама и перегрузки системы при масштабировании до 100,000 пользователей.

---

## 📊 Лимиты

### По умолчанию

- **100 push/час** на пользователя
- **500 push/день** на пользователя

### Настройка

Лимиты настраиваются через `admin_settings`:

```sql
-- Изменить лимиты
UPDATE admin_settings 
SET value = '200' 
WHERE key = 'push_rate_limit_per_hour';

UPDATE admin_settings 
SET value = '1000' 
WHERE key = 'push_rate_limit_per_day';

-- Отключить rate limiting
UPDATE admin_settings 
SET value = 'false' 
WHERE key = 'push_rate_limit_enabled';
```

---

## 🏗️ Архитектура

### 1. База данных

**Таблица `push_rate_limit`**:
```sql
CREATE TABLE push_rate_limit (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL,
  notification_type TEXT NOT NULL,
  campaign_id UUID,
  created_at TIMESTAMPTZ
);
```

**Индексы**:
- `idx_push_rate_limit_user_hour` - для проверки лимита за час
- `idx_push_rate_limit_user_day` - для проверки лимита за день
- `idx_push_rate_limit_sent_at` - для cleanup

### 2. Функции БД

**`check_push_rate_limit(user_id, max_per_hour, max_per_day)`**:
- Проверяет количество отправленных push за последний час и день
- Возвращает `allowed: boolean` + статистику

**`record_push_send(user_id, notification_type, campaign_id)`**:
- Записывает факт отправки push уведомления
- Вызывается после успешной отправки

**`cleanup_push_rate_limit()`**:
- Удаляет записи старше 7 дней
- Вызывается через Cron Job (ежедневно)

### 3. Edge Function Integration

**`unified-notification-sender`** (центральная точка):

1. **Проверка лимитов** (перед отправкой):
```typescript
const rateLimitResults = await Promise.all(
  userIds.map(async (userId) => ({
    userId,
    rateLimit: await checkRateLimit(userId),
  }))
);

const allowedUsers = rateLimitResults
  .filter((r) => r.rateLimit.allowed)
  .map((r) => r.userId);
```

2. **Запись отправки** (после успешной отправки):
```typescript
await Promise.all(
  userIds.map((userId) =>
    recordPushSend(userId, notificationType, campaignId)
  )
);
```

---

## 🔄 Workflow

```
User Request
    ↓
unified-notification-sender
    ↓
checkRateLimit(userId) ← БД функция
    ↓
allowed? → YES → Send Push → recordPushSend(userId)
         → NO  → Block (return error)
```

---

## 📈 Мониторинг

### Проверка статистики пользователя

```sql
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE sent_at > NOW() - INTERVAL '1 hour') as count_hour,
  COUNT(*) FILTER (WHERE sent_at > NOW() - INTERVAL '24 hours') as count_day
FROM push_rate_limit
WHERE user_id = 'USER_ID'
GROUP BY user_id;
```

### Топ пользователей по количеству push

```sql
SELECT 
  p.email,
  COUNT(*) as total_pushes,
  COUNT(*) FILTER (WHERE prl.sent_at > NOW() - INTERVAL '24 hours') as pushes_today
FROM push_rate_limit prl
JOIN profiles p ON p.id = prl.user_id
WHERE prl.sent_at > NOW() - INTERVAL '7 days'
GROUP BY p.email
ORDER BY total_pushes DESC
LIMIT 20;
```

### Заблокированные пользователи

Логируются в консоли Edge Function:
```
[RATE-LIMIT] Blocked 5 users due to rate limits: [...]
```

---

## ⚙️ Настройка

### Изменение лимитов

**Через SQL**:
```sql
UPDATE admin_settings SET value = '200' WHERE key = 'push_rate_limit_per_hour';
UPDATE admin_settings SET value = '1000' WHERE key = 'push_rate_limit_per_day';
```

**Через админ-панель** (будущее):
- Settings → Push Notifications → Rate Limiting
- Slider для настройки лимитов

### Отключение rate limiting

```sql
UPDATE admin_settings SET value = 'false' WHERE key = 'push_rate_limit_enabled';
```

---

## 🧪 Тестирование

### Тест 1: Проверка лимита

```typescript
// Отправить 101 push за час
for (let i = 0; i < 101; i++) {
  await sendPush(userId, 'Test', 'Test');
}

// 101-й push должен быть заблокирован
```

### Тест 2: Проверка cleanup

```sql
-- Создать старые записи
INSERT INTO push_rate_limit (user_id, sent_at, notification_type)
VALUES ('USER_ID', NOW() - INTERVAL '8 days', 'test');

-- Запустить cleanup
SELECT cleanup_push_rate_limit();

-- Проверить что старые записи удалены
SELECT COUNT(*) FROM push_rate_limit WHERE sent_at < NOW() - INTERVAL '7 days';
-- Должно быть 0
```

---

## 📝 Changelog

### 2025-11-15 - v1.0 (Initial Release)
- ✅ Создана таблица `push_rate_limit`
- ✅ Добавлены функции БД (check, record, cleanup)
- ✅ Интегрировано в `unified-notification-sender`
- ✅ Настройки в `admin_settings`
- ✅ Документация

