# Supabase Cron Jobs Setup Guide

**Дата**: 2025-11-11  
**Версия**: 1.0  
**Автор**: AI Assistant

---

## 🎯 Цель

Настроить автоматический запуск Edge Functions для:
1. **Деактивации истекших подписок** (subscription-expiry-checker)
2. **Напоминаний о trial** (trial-expiry-reminder)

---

## 📋 Требования

- ✅ Edge Functions задеплоены в Supabase
- ✅ Доступ к Supabase Dashboard (super_admin)
- ✅ Проект: ecuwuzqlwdkkdncampnc

---

## 🔧 Настройка Cron Jobs

### **Шаг 1: Открыть Supabase Dashboard**

1. Перейти на https://supabase.com/dashboard
2. Выбрать проект **ecuwuzqlwdkkdncampnc**
3. Перейти в **Database** → **Cron Jobs** (в левом меню)

---

### **Шаг 2: Создать Cron Job #1 - subscription-expiry-checker**

**Назначение**: Проверяет истекшие подписки каждый день в 00:00 UTC и деактивирует их

1. Нажать **"Create a new cron job"**
2. Заполнить форму:

```
Name: subscription-expiry-checker
Schedule: 0 0 * * *
Command: SELECT net.http_post(
  url := 'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/subscription-expiry-checker',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
  body := '{}'::jsonb
);
```

3. Нажать **"Create cron job"**

**Расписание**:
- `0 0 * * *` = каждый день в 00:00 UTC (03:00 MSK)

---

### **Шаг 3: Создать Cron Job #2 - trial-expiry-reminder**

**Назначение**: Отправляет уведомления за 3 дня до окончания trial каждый день в 09:00 UTC

1. Нажать **"Create a new cron job"**
2. Заполнить форму:

```
Name: trial-expiry-reminder
Schedule: 0 9 * * *
Command: SELECT net.http_post(
  url := 'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/trial-expiry-reminder',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
  body := '{}'::jsonb
);
```

3. Нажать **"Create cron job"**

**Расписание**:
- `0 9 * * *` = каждый день в 09:00 UTC (12:00 MSK)

---

## ✅ Проверка

### **Тестирование вручную**

1. Перейти в **Database** → **Cron Jobs**
2. Найти созданный job
3. Нажать **"Run now"** для тестирования
4. Проверить логи в **Edge Functions** → **Logs**

### **SQL запрос для проверки**

```sql
-- Проверить что Cron Jobs созданы
SELECT * FROM cron.job;

-- Проверить историю выполнения
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

---

## 📊 Мониторинг

### **Проверка логов Edge Functions**

1. Перейти в **Edge Functions** → **subscription-expiry-checker** → **Logs**
2. Проверить что функция выполняется без ошибок
3. Проверить что подписки деактивируются корректно

### **Проверка уведомлений**

```sql
-- Проверить отправленные уведомления
SELECT * FROM usage
WHERE operation_type = 'push_delivered'
  AND metadata->>'notification_type' IN ('trial_expiry_reminder', 'subscription_expired')
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🚨 Troubleshooting

### **Проблема: Cron Job не выполняется**

**Решение**:
1. Проверить что расписание корректное (cron syntax)
2. Проверить что Edge Function задеплоена
3. Проверить логи в **Database** → **Cron Jobs** → **History**

### **Проблема: Edge Function возвращает ошибку**

**Решение**:
1. Проверить логи Edge Function
2. Проверить что service_role_key настроен
3. Проверить что БД таблицы существуют

---

## 📝 Примечания

- **Timezone**: Все расписания в UTC
- **Service Role Key**: Используется для авторизации Cron Jobs
- **Логи**: Хранятся 7 дней в Edge Functions Logs
- **Retry**: Cron Jobs НЕ повторяются при ошибке (нужно настроить вручную)

---

## 🔗 Ссылки

- [Supabase Cron Jobs Documentation](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Cron Syntax Guide](https://crontab.guru/)

