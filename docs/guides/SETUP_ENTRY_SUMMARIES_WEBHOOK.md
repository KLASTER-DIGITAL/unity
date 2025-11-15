# Setup Entry Summaries Webhook Guide

**Дата**: 2025-11-15  
**Версия**: 1.0  
**Цель**: Настроить webhook для отправки push-уведомлений когда AI-анализ готов

---

## 🎯 Зачем нужен этот webhook?

Когда AI-анализ записи завершается, создается запись в таблице `entry_summaries`. 
Webhook автоматически вызывает Edge Function `push-realtime-trigger`, которая отправляет push-уведомление пользователю:

**"✨ AI-анализ готов! Посмотрите инсайты о вашей записи"**

---

## 📋 Требования

- ✅ Доступ к Supabase Dashboard (super_admin)
- ✅ Проект: ecuwuzqlwdkkdncampnc
- ✅ Edge Function `push-realtime-trigger` задеплоена
- ✅ Service Role Key настроен в `admin_settings`

---

## 🔧 Пошаговая инструкция

### **Шаг 1: Открыть Supabase Dashboard**

1. Перейти на https://supabase.com/dashboard
2. Выбрать проект **ecuwuzqlwdkkdncampnc**
3. Перейти в **Database** → **Webhooks** (в левом меню)

---

### **Шаг 2: Создать новый webhook**

1. Нажать **"Create a new hook"** или **"Enable Webhooks"**
2. Заполнить форму:

```
Name: push_on_summary_insert
Table: entry_summaries
Events: INSERT
Type: HTTP Request
Method: POST
URL: https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-realtime-trigger
```

3. Добавить Headers:

```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA1ODY5NCwiZXhwIjoyMDc1NjM0Njk0fQ.Tzl9W5L7GrqZPxV2Hg7CKUvWSS7jPk4EeQGlapYOCDY
```

4. Нажать **"Create webhook"** или **"Confirm"**

---

### **Шаг 3: Проверка**

#### **SQL запрос для проверки**:

```sql
-- Проверить что webhook создан
SELECT h.id, h.hook_name, h.created_at, t.table_name 
FROM supabase_functions.hooks h
LEFT JOIN pg_class c ON h.hook_table_id = c.oid
LEFT JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN information_schema.tables t ON c.relname = t.table_name AND n.nspname = t.table_schema
WHERE h.hook_name = 'push_on_summary_insert'
ORDER BY h.created_at DESC
LIMIT 1;
```

**Ожидаемый результат**: 1 строка с `hook_name = 'push_on_summary_insert'`

---

### **Шаг 4: Тестирование**

#### **Создать тестовую запись с AI-анализом**:

1. Войти в приложение как Premium пользователь (rustam@leadshunter.biz / demo123)
2. Создать новую запись: "Сегодня был отличный день!"
3. Подождать 2-3 секунды (AI-анализ происходит асинхронно)
4. Проверить что пришло push-уведомление: "✨ AI-анализ готов!"

#### **Проверить логи Edge Function**:

1. Перейти в **Edge Functions** → **push-realtime-trigger** → **Logs**
2. Найти запись с типом `ai_analysis_ready`
3. Проверить что статус `200 OK`

---

## 📊 Мониторинг

### **Проверка webhook через SQL**:

```sql
-- Проверить последние вызовы webhook
SELECT * FROM supabase_functions.hooks 
WHERE hook_name = 'push_on_summary_insert'
ORDER BY created_at DESC
LIMIT 10;
```

### **Проверка через health-check**:

```bash
curl https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-health-check
```

**Ожидаемый результат**: `"status": "healthy"`

---

## 🚨 Troubleshooting

### **Проблема: Webhook не срабатывает**

**Решение**:
1. Проверить что webhook создан (SQL запрос выше)
2. Проверить что Edge Function задеплоена
3. Проверить логи Edge Function на ошибки
4. Проверить что Service Role Key правильный

### **Проблема: Push не приходит**

**Решение**:
1. Проверить что пользователь подписан на push (таблица `push_subscriptions`)
2. Проверить что VAPID keys настроены
3. Проверить логи Edge Function `push-sender`
4. Проверить консоль браузера на ошибки

---

## 📝 Примечания

- **Webhook срабатывает**: при каждом INSERT в `entry_summaries`
- **Edge Function**: `push-realtime-trigger` обрабатывает событие
- **Push отправляется**: только если пользователь подписан на push
- **Логи**: хранятся 7 дней в Edge Functions Logs

---

## 🔗 Ссылки

- [Supabase Webhooks Documentation](https://supabase.com/docs/guides/database/webhooks)
- [Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Push System Architecture](../architecture/PUSH_SYSTEM.md)

