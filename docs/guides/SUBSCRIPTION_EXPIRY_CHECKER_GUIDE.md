# 🔄 Subscription Expiry Checker - Руководство

**Дата**: 2025-11-11  
**Статус**: ✅ Реализовано

---

## 📊 ОБЗОР

Edge Function `subscription-expiry-checker` автоматически проверяет истекшие подписки и деактивирует Premium.

### Что делает:
1. ✅ Проверяет `subscriptions.end_date < NOW()` AND `status = 'active'`
2. ✅ Обновляет `profiles.is_premium = false` для истекших подписок
3. ✅ Обновляет `subscriptions.status = 'expired'`
4. ✅ Отправляет уведомление пользователю через `unified-notification-sender`

### Когда запускается:
- **Автоматически**: Через Supabase Cron (ежедневно в 00:00 UTC)
- **Вручную**: Через HTTP POST запрос (для тестирования)

---

## 🚀 НАСТРОЙКА SUPABASE CRON

### Шаг 1: Открыть Supabase Dashboard

1. Перейти на https://supabase.com/dashboard/project/ecuwuzqlwdkkdncampnc
2. Войти с учетными данными
3. Выбрать проект `UNITY-v2`

### Шаг 2: Настроить Cron Job

1. Перейти в раздел **Database** → **Cron Jobs**
2. Нажать **Create a new cron job**
3. Заполнить форму:

**Name**: `subscription-expiry-checker`

**Schedule**: `0 0 * * *` (ежедневно в 00:00 UTC)

**SQL Command**:
```sql
SELECT
  net.http_post(
    url := 'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/subscription-expiry-checker',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  ) as request_id;
```

**Timezone**: `UTC`

4. Нажать **Create cron job**

### Шаг 3: Проверить статус

1. Перейти в раздел **Database** → **Cron Jobs**
2. Найти `subscription-expiry-checker`
3. Проверить что статус **Enabled**
4. Проверить **Last run** и **Next run**

---

## 🧪 ТЕСТИРОВАНИЕ

### Вариант 1: Вручную через curl

```bash
curl -X POST \
  'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/subscription-expiry-checker' \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json"
```

**Ожидаемый ответ** (если нет истекших подписок):
```json
{
  "success": true,
  "message": "No expired subscriptions",
  "processed": 0
}
```

**Ожидаемый ответ** (если есть истекшие подписки):
```json
{
  "success": true,
  "message": "Processed 2 expired subscriptions",
  "processed": 2,
  "success_count": 2,
  "failed_count": 0,
  "results": [
    {
      "subscription_id": "...",
      "user_id": "...",
      "success": true,
      "is_trial": true
    }
  ]
}
```

### Вариант 2: Создать тестовую истекшую подписку

```sql
-- 1. Создать тестового пользователя (если нет)
INSERT INTO auth.users (id, email)
VALUES ('00000000-0000-0000-0000-000000000001', 'test-expiry@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO profiles (id, name, email, is_premium)
VALUES ('00000000-0000-0000-0000-000000000001', 'Test User', 'test-expiry@example.com', true)
ON CONFLICT DO NOTHING;

-- 2. Создать истекшую подписку
INSERT INTO subscriptions (
  user_id,
  plan_type,
  status,
  start_date,
  end_date,
  payment_method,
  metadata
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'monthly',
  'active',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '1 day',  -- Истекла вчера
  'promo',
  '{"is_trial": true, "trial_days": 14}'::jsonb
);

-- 3. Запустить Edge Function вручную (через curl)

-- 4. Проверить результат
SELECT 
  p.email,
  p.is_premium,
  s.status,
  s.end_date
FROM profiles p
LEFT JOIN subscriptions s ON s.user_id = p.id
WHERE p.email = 'test-expiry@example.com';

-- Ожидаемый результат:
-- is_premium = false
-- status = 'expired'
```

### Вариант 3: Проверить логи Edge Function

1. Перейти в **Edge Functions** → `subscription-expiry-checker`
2. Открыть вкладку **Logs**
3. Проверить последние запуски
4. Искать сообщения:
   - `[Expiry Checker] Starting...`
   - `[Expiry Checker] Found X expired subscriptions`
   - `[Expiry Checker] ✅ Processed subscription ...`
   - `[Expiry Checker] Completed: X success, Y failed`

---

## 📊 МОНИТОРИНГ

### Проверка работы Cron Job

```sql
-- Проверить последние запуски Cron Job
SELECT * FROM cron.job_run_details
WHERE jobname = 'subscription-expiry-checker'
ORDER BY start_time DESC
LIMIT 10;
```

### Проверка истекших подписок

```sql
-- Найти все истекшие подписки которые еще не обработаны
SELECT 
  s.id,
  s.user_id,
  p.email,
  s.plan_type,
  s.status,
  s.end_date,
  s.metadata,
  p.is_premium
FROM subscriptions s
JOIN profiles p ON p.id = s.user_id
WHERE s.status = 'active'
  AND s.end_date < NOW()
  AND s.end_date IS NOT NULL
ORDER BY s.end_date ASC;
```

### Статистика обработанных подписок

```sql
-- Статистика истекших подписок за последние 30 дней
SELECT 
  DATE(updated_at) as date,
  COUNT(*) as expired_count,
  COUNT(*) FILTER (WHERE metadata->>'is_trial' = 'true') as trial_count,
  COUNT(*) FILTER (WHERE metadata->>'is_trial' != 'true') as paid_count
FROM subscriptions
WHERE status = 'expired'
  AND updated_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(updated_at)
ORDER BY date DESC;
```

---

## 🐛 TROUBLESHOOTING

### Проблема: Cron Job не запускается

**Решение**:
1. Проверить что Cron Job **Enabled**
2. Проверить расписание (cron expression)
3. Проверить логи в `cron.job_run_details`

### Проблема: Edge Function возвращает 401 Unauthorized

**Решение**:
1. Проверить что используется `service_role_key` (не `anon` key)
2. Проверить что ключ правильный в Cron Job SQL

### Проблема: Подписки не деактивируются

**Решение**:
1. Проверить логи Edge Function
2. Проверить что `end_date` действительно в прошлом
3. Проверить что `status = 'active'`
4. Запустить Edge Function вручную для отладки

---

## 📝 ИТОГИ

**Статус**: ✅ Реализовано и готово к production

**Что работает**:
- ✅ Edge Function деплоена
- ✅ Логика проверки истекших подписок
- ✅ Деактивация Premium
- ✅ Отправка уведомлений

**Что нужно настроить**:
- ⚠️ Supabase Cron Job (вручную через Dashboard)

**Следующие шаги**:
- Настроить Supabase Cron Job
- Протестировать на тестовых данных
- Мониторить логи первые несколько дней

