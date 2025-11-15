# 🕐 Настройка Cron Jobs для персонализированных уведомлений

**Версия**: 1.0  
**Дата**: 2025-11-12  
**Статус**: Требуется ручная настройка

---

## ⚠️ ВАЖНО

Cron Jobs требуют **service_role_key** который НЕ должен храниться в миграциях (security risk).  
Поэтому настройка выполняется **ВРУЧНУЮ** через Supabase SQL Editor.

---

## 📋 Шаг 1: Получить service_role_key

1. Открыть Supabase Dashboard: https://supabase.com/dashboard/project/ecuwuzqlwdkkdncampnc
2. Перейти в **Settings** → **API**
3. Скопировать **service_role** key (secret)

**Формат**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 📋 Шаг 2: Открыть SQL Editor

1. Перейти в **SQL Editor** в Supabase Dashboard
2. Создать новый query

---

## 📋 Шаг 3: Выполнить SQL команды

### **3.1. Удалить старые Cron Jobs (если существуют)**

```sql
-- Удаляем старые jobs с фиксированным временем
SELECT cron.unschedule('push-daily-reminder');
SELECT cron.unschedule('push-weekly-motivation');
SELECT cron.unschedule('push-goal-reminder');
```

### **3.2. Создать новые Hourly Cron Jobs**

**ВАЖНО**: Замените `YOUR_SERVICE_ROLE_KEY` на реальный ключ из Шага 1!

```sql
-- ============================================================================
-- Daily Reminder: КАЖДЫЙ ЧАС
-- ============================================================================
SELECT cron.schedule(
  'push-daily-reminder-hourly',
  '0 * * * *',  -- Каждый час в 00 минут
  $$
  SELECT
    net.http_post(
      url:='https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?action=daily_reminder',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- ============================================================================
-- Weekly Motivation: КАЖДЫЙ ЧАС В ВОСКРЕСЕНЬЕ
-- ============================================================================
SELECT cron.schedule(
  'push-weekly-motivation-hourly',
  '0 * * * 0',  -- Каждый час в воскресенье
  $$
  SELECT
    net.http_post(
      url:='https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?action=weekly_motivation',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- ============================================================================
-- Goal Reminder: КАЖДЫЙ ЧАС В ВОСКРЕСЕНЬЕ
-- ============================================================================
SELECT cron.schedule(
  'push-goal-reminder-hourly',
  '0 * * * 0',  -- Каждый час в воскресенье
  $$
  SELECT
    net.http_post(
      url:='https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?action=goal_reminder',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
```

---

## 📋 Шаг 4: Проверить созданные Jobs

```sql
-- Выводим список всех активных Cron Jobs
SELECT 
  jobname,
  schedule,
  active,
  jobid
FROM cron.job
WHERE jobname LIKE 'push-%'
ORDER BY jobname;
```

**Ожидаемый результат**:
```
jobname                        | schedule    | active | jobid
-------------------------------|-------------|--------|------
push-daily-reminder-hourly     | 0 * * * *   | true   | 1
push-goal-reminder-hourly      | 0 * * * 0   | true   | 2
push-weekly-motivation-hourly  | 0 * * * 0   | true   | 3
```

---

## 📋 Шаг 5: Тестирование

### **Вручную вызвать Edge Function**:

```bash
curl -X POST "https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?action=daily_reminder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

### **Проверить логи**:

1. Перейти в **Edge Functions** → **push-scheduled** → **Logs**
2. Искать:
   - `[PUSH-SCHEDULED] Current UTC time: XX:XX`
   - `[PUSH-SCHEDULED] User XXX (Europe/Moscow): Local time XX:XX matches target XX:XX ✅`
   - `[PUSH-SCHEDULED] Found X users for daily_reminder at evening time`

---

## 🎯 Как это работает

### **Пример: Daily Reminder**

**Cron Job**: Запускается каждый час (00:00, 01:00, 02:00, ..., 23:00 UTC)

**Текущее время**: 18:00 UTC

**Пользователи**:
- **Rustam** (Moscow, UTC+3): eveningTime="21:00"
  - Локальное время: 21:00 (18:00 UTC + 3 часа)
  - **СОВПАДАЕТ** → ОТПРАВИТЬ ✅

- **Anna** (New York, UTC-5): eveningTime="21:00"
  - Локальное время: 13:00 (18:00 UTC - 5 часов)
  - НЕ СОВПАДАЕТ → НЕ ОТПРАВЛЯТЬ ❌

**Результат**: Только Rustam получит уведомление в 21:00 по СВОЕМУ времени

---

## 🔧 Управление Cron Jobs

### **Отключить Job**:
```sql
SELECT cron.unschedule('push-daily-reminder-hourly');
```

### **Включить Job снова**:
```sql
-- Выполнить команду из Шага 3.2 снова
```

### **Изменить расписание**:
```sql
-- 1. Удалить старый job
SELECT cron.unschedule('push-daily-reminder-hourly');

-- 2. Создать новый с другим расписанием
SELECT cron.schedule(
  'push-daily-reminder-hourly',
  '0 */2 * * *',  -- Каждые 2 часа (вместо каждого часа)
  $$ ... $$
);
```

---

## 📊 Мониторинг

### **Проверить последний запуск**:
```sql
SELECT 
  jobname,
  last_run,
  next_run,
  active
FROM cron.job
WHERE jobname LIKE 'push-%';
```

### **Проверить историю запусков**:
```sql
SELECT 
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid IN (
  SELECT jobid FROM cron.job WHERE jobname LIKE 'push-%'
)
ORDER BY start_time DESC
LIMIT 10;
```

---

## ✅ Checklist

- [ ] Получен service_role_key из Dashboard
- [ ] Удалены старые Cron Jobs
- [ ] Созданы новые Hourly Cron Jobs
- [ ] Проверено что Jobs активны (active=true)
- [ ] Протестирован вручную вызов Edge Function
- [ ] Проверены логи Edge Function
- [ ] Настроен мониторинг (опционально)

---

**Статус**: ✅ Готово к настройке  
**Время настройки**: 5-10 минут

