# Push Notifications Templates - Testing Guide

**Дата**: 2025-11-12  
**Версия**: 1.0  
**Статус**: ✅ Система готова к тестированию

---

## 📊 Обзор системы

### **Компоненты**:
1. **База данных**: `push_notification_templates` (8 шаблонов)
2. **Edge Functions**: 
   - `push-templates-api` - CRUD операции
   - `push-scheduled` - отправка уведомлений
   - `push-ai-personalize` - AI персонализация
3. **UI**: `TemplateManager` в админ-панели

### **Шаблоны**:

**FREE шаблоны** (5 шт):
- `daily_reminder` - 📝 Время записать достижения!
- `entry_created` - ✅ Запись сохранена!
- `goal_reminder` - 🎯 Проверьте свои цели
- `subscription_expired` - ❌ Premium подписка истекла
- `trial_expiry_reminder` - ⏰ Trial заканчивается через 3 дня

**PREMIUM шаблоны** (3 шт):
- `achievement_unlocked` - 🎉 Новое достижение! (AI ✅)
- `streak_milestone` - 🔥 Новый рекорд! (AI ✅)
- `weekly_motivation` - 🌟 Еженедельная мотивация (AI ✅)

---

## 🧪 Тестовые пользователи

### **FREE пользователь**:
- Email: `free-test@leadshunter.biz`
- Password: `test123`
- ID: `bcc9d1ad-f766-418a-b538-92331a15f6f2`
- Premium: ❌
- Ожидаемое поведение: получает только FREE шаблоны (статические)

### **PREMIUM пользователи**:
- Email: `rustam@leadshunter.biz` (Password: `demo123`)
- Email: `an@leadshunter.biz`
- Premium: ✅
- Ожидаемое поведение: получает FREE + PREMIUM шаблоны (с AI персонализацией)

---

## 🔬 Тестовые сценарии

### **Сценарий 1: FREE шаблон для FREE пользователя**

**Цель**: Проверить что FREE пользователь получает статический шаблон

**Шаги**:
1. Вызвать `push-scheduled` для `daily_reminder`
2. Проверить что уведомление отправлено FREE пользователю
3. Проверить что текст статический (без AI персонализации)

**Ожидаемый результат**:
```json
{
  "sent": 1,
  "total": 1,
  "ai_used": 0
}
```

**Логи**:
```
[PUSH-SCHEDULED] Sending daily reminder...
[PUSH-SCHEDULED] Template found: daily_reminder
[PUSH-SCHEDULED] No users with daily reminder enabled
```

---

### **Сценарий 2: PREMIUM шаблон для PREMIUM пользователя**

**Цель**: Проверить что PREMIUM пользователь получает AI-персонализированное уведомление

**Шаги**:
1. Вызвать `push-scheduled` для `weekly_motivation`
2. Проверить что уведомление отправлено PREMIUM пользователям
3. Проверить что текст персонализирован (имя, streak, настроение)

**Ожидаемый результат**:
```json
{
  "sent": 3,
  "total": 3,
  "ai_used": 3
}
```

**Логи**:
```
[PUSH-SCHEDULED] Sending weekly motivation...
[PUSH-SCHEDULED] AI personalization enabled for 3 users
[PUSH-SCHEDULED] Generating AI personalized notification for user XXX
[PUSH-SCHEDULED] AI personalized message generated for user XXX: "Рустам, вечер - время для записи! 🌙"
[PUSH-SCHEDULED] Sent 3/3 notifications (3 with AI)
```

---

### **Сценарий 3: Fallback на обычный шаблон**

**Цель**: Проверить что система использует обычный шаблон если AI не удалась

**Шаги**:
1. Временно отключить OpenAI API key (или сделать его невалидным)
2. Вызвать `push-scheduled` для `weekly_motivation`
3. Проверить что уведомление отправлено с обычным шаблоном

**Ожидаемый результат**:
```json
{
  "sent": 3,
  "total": 3,
  "ai_used": 0
}
```

**Логи**:
```
[PUSH-SCHEDULED] AI personalization failed for user XXX: 401
[PUSH-SCHEDULED] Using template fallback
[PUSH-SCHEDULED] Sent 3/3 notifications (0 with AI)
```

---

## 📝 Чеклист тестирования

### **Функциональность**:
- [ ] FREE пользователь получает только FREE шаблоны
- [ ] PREMIUM пользователь получает FREE + PREMIUM шаблоны
- [ ] AI персонализация работает для PREMIUM шаблонов
- [ ] Fallback на обычный шаблон работает
- [ ] i18n поддержка работает (7 языков)
- [ ] Переменные заменяются корректно

### **UI**:
- [ ] TemplateManager отображает все шаблоны
- [ ] Фильтры FREE/PREMIUM работают
- [ ] Badges (PREMIUM, AI, Неактивен) отображаются корректно
- [ ] Удаление шаблонов работает

### **Производительность**:
- [ ] Отправка 100+ уведомлений занимает < 30 секунд
- [ ] AI генерация для 1 пользователя занимает < 3 секунд
- [ ] Нет N+1 проблем в БД запросах

### **Безопасность**:
- [ ] RLS политики работают (только super_admin может редактировать)
- [ ] Нет SQL injection уязвимостей
- [ ] Нет XSS уязвимостей в шаблонах

---

## 🚀 Автоматизация тестирования

### **Через Supabase Cron Jobs**:

Создать Cron Job для ежедневного тестирования:

```sql
SELECT cron.schedule(
  'test-push-templates',
  '0 10 * * *', -- Каждый день в 10:00 UTC
  $$
  SELECT net.http_post(
    url := 'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?action=daily_reminder',
    headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>", "Content-Type": "application/json"}'::jsonb
  );
  $$
);
```

---

## 📊 Метрики успеха

### **Критерии приемки**:
- ✅ 100% FREE пользователей получают статические шаблоны
- ✅ 100% PREMIUM пользователей получают AI-персонализированные шаблоны
- ✅ Fallback работает в 100% случаев при ошибке AI
- ✅ Время отправки < 30 секунд для 100 пользователей
- ✅ 0 ошибок в production логах

---

## 🐛 Известные проблемы

### **Проблема 1**: Нет push subscriptions у тестовых пользователей
**Решение**: Добавить mock push subscriptions в БД для тестирования

### **Проблема 2**: OpenAI API rate limits
**Решение**: Использовать exponential backoff и retry логику

---

## 📚 Дополнительные ресурсы

- **Edge Functions**: `supabase/functions/push-scheduled/index.ts`
- **AI Персонализация**: `supabase/functions/push-ai-personalize/index.ts`
- **UI Компонент**: `src/features/admin/campaigns/components/TemplateManager.tsx`
- **Миграция БД**: `supabase/migrations/20251111_create_push_notification_templates.sql`

---

**Статус**: ✅ Готово к тестированию  
**Следующие шаги**: Запустить тестовые сценарии и проверить метрики

