# 🕐 Push Notifications - Персонализированное расписание

**Версия**: 1.0  
**Дата**: 2025-11-12  
**Статус**: В разработке

---

## 🎯 Как работает автоматическая отправка

### **Проблема фиксированного времени**

❌ **Старый подход** (до 2025-11-12):
```typescript
// Отправка в фиксированное время для ВСЕХ пользователей
// Cron: 0 21 * * * (21:00 UTC)
sendDailyReminder() // Все получают в 21:00 UTC
```

**Проблемы**:
- Пользователь в Москве (UTC+3) получает в 00:00 (ночь) ❌
- Пользователь в Нью-Йорке (UTC-5) получает в 16:00 (день) ❌
- Нет учета предпочтений пользователя (кто-то хочет в 20:00, кто-то в 22:00) ❌

---

### **Решение: Персонализированное расписание**

✅ **Новый подход** (с 2025-11-12):
```typescript
// Cron запускается КАЖДЫЙ ЧАС: 0 * * * *
// Проверяет: какие пользователи должны получить уведомление СЕЙЧАС

// Пример: Сейчас 18:00 UTC
// Пользователь 1: timezone="Europe/Moscow" (UTC+3), eveningTime="21:00"
//   → Локальное время: 21:00 → ОТПРАВИТЬ ✅
// Пользователь 2: timezone="America/New_York" (UTC-5), eveningTime="21:00"
//   → Локальное время: 13:00 → НЕ ОТПРАВЛЯТЬ ❌
// Пользователь 3: timezone="Asia/Tokyo" (UTC+9), eveningTime="20:00"
//   → Локальное время: 03:00 → НЕ ОТПРАВЛЯТЬ ❌
```

---

## 🗄️ Структура данных

### **Таблица profiles**:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  timezone TEXT DEFAULT 'UTC',  -- NEW: Часовой пояс пользователя
  notification_settings JSONB DEFAULT '{
    "dailyReminder": true,      -- Включено ли ежедневное напоминание
    "weeklyReport": false,       -- Включен ли еженедельный отчет
    "achievements": true,        -- Включены ли уведомления о достижениях
    "motivational": true,        -- Включены ли мотивационные сообщения
    "morningTime": "08:00",      -- Время утреннего напоминания (HH:MM)
    "eveningTime": "21:00",      -- Время вечернего напоминания (HH:MM)
    "selectedTime": "evening"    -- Выбранное время: "morning" | "evening" | "both" | "none"
  }'
);
```

### **Примеры настроек пользователей**:

**Пользователь 1** (Москва, вечернее напоминание):
```json
{
  "timezone": "Europe/Moscow",
  "notification_settings": {
    "dailyReminder": true,
    "eveningTime": "21:00",
    "selectedTime": "evening"
  }
}
```

**Пользователь 2** (Нью-Йорк, утреннее и вечернее):
```json
{
  "timezone": "America/New_York",
  "notification_settings": {
    "dailyReminder": true,
    "morningTime": "08:00",
    "eveningTime": "20:00",
    "selectedTime": "both"
  }
}
```

**Пользователь 3** (Токио, отключено):
```json
{
  "timezone": "Asia/Tokyo",
  "notification_settings": {
    "dailyReminder": false,
    "selectedTime": "none"
  }
}
```

---

## ⚙️ Логика отправки

### **Алгоритм**:

```typescript
// 1. Cron запускается каждый час: 0 * * * *
// 2. Получаем текущее время UTC
const nowUTC = new Date();
const currentHour = nowUTC.getUTCHours(); // Например: 18

// 3. Для каждого пользователя:
for (const user of users) {
  // 3.1. Конвертируем UTC время в локальное время пользователя
  const userLocalTime = convertToTimezone(nowUTC, user.timezone);
  const userLocalHour = userLocalTime.getHours(); // Например: 21 (для Moscow)
  
  // 3.2. Проверяем настройки пользователя
  const settings = user.notification_settings;
  
  // 3.3. Проверяем: нужно ли отправить уведомление СЕЙЧАС?
  if (settings.dailyReminder && settings.selectedTime === 'evening') {
    const eveningHour = parseInt(settings.eveningTime.split(':')[0]); // 21
    
    if (userLocalHour === eveningHour) {
      // ✅ ОТПРАВИТЬ уведомление
      await sendNotification(user.id, 'daily_reminder');
    }
  }
}
```

---

## 📅 Supabase Cron Jobs

### **Настройка Cron Jobs**:

```sql
-- 1. Daily Reminder (каждый час)
SELECT cron.schedule(
  'push-daily-reminder-hourly',
  '0 * * * *',  -- Каждый час в 00 минут
  $$
  SELECT
    net.http_post(
      url:='https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?action=daily_reminder',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    ) as request_id;
  $$
);

-- 2. Weekly Motivation (каждый час в воскресенье)
SELECT cron.schedule(
  'push-weekly-motivation-hourly',
  '0 * * * 0',  -- Каждый час в воскресенье
  $$
  SELECT
    net.http_post(
      url:='https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?action=weekly_motivation',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    ) as request_id;
  $$
);
```

---

## 🔧 Обновление push-scheduled Edge Function

### **Новая функция: getUsersForScheduledTime()**

```typescript
/**
 * Получает пользователей которые должны получить уведомление СЕЙЧАС
 * @param type - Тип уведомления (daily_reminder, weekly_motivation, etc.)
 * @param targetTime - Целевое время в формате "HH:MM" (например, "21:00")
 * @returns Массив user_id пользователей
 */
async function getUsersForScheduledTime(
  type: string,
  targetTime: string
): Promise<string[]> {
  const nowUTC = new Date();
  const currentHour = nowUTC.getUTCHours();
  
  // Получаем всех пользователей с включенным уведомлением
  const { data: users, error } = await supabaseAdmin
    .from('profiles')
    .select('id, timezone, notification_settings')
    .eq(`notification_settings->dailyReminder`, true)
    .eq(`notification_settings->selectedTime`, 'evening');
  
  if (error || !users) {
    console.error('[PUSH-SCHEDULED] Failed to get users:', error);
    return [];
  }
  
  // Фильтруем пользователей по локальному времени
  const userIds = users
    .filter(user => {
      // Конвертируем UTC в локальное время пользователя
      const userLocalTime = convertToTimezone(nowUTC, user.timezone);
      const userLocalHour = userLocalTime.getHours();
      
      // Проверяем: совпадает ли локальный час с целевым временем?
      const targetHour = parseInt(targetTime.split(':')[0]);
      return userLocalHour === targetHour;
    })
    .map(user => user.id);
  
  return userIds;
}
```

---

## 📊 Примеры работы

### **Сценарий 1: Daily Reminder в 21:00**

**Время**: 18:00 UTC  
**Cron**: Запускается каждый час

| Пользователь | Timezone | eveningTime | Локальное время | Отправить? |
|--------------|----------|-------------|-----------------|------------|
| Rustam | Europe/Moscow (UTC+3) | 21:00 | 21:00 | ✅ ДА |
| Anna | America/New_York (UTC-5) | 21:00 | 13:00 | ❌ НЕТ |
| John | Asia/Tokyo (UTC+9) | 20:00 | 03:00 | ❌ НЕТ |

**Результат**: Только Rustam получит уведомление

---

## 🎯 Преимущества

✅ **Персонализация**: Каждый пользователь получает уведомление в СВОЕ время  
✅ **Часовые пояса**: Автоматический учет timezone  
✅ **Гибкость**: Пользователь может выбрать утро/вечер/оба/никогда  
✅ **Масштабируемость**: Работает для 100K+ пользователей  
✅ **Простота**: Один Cron Job для всех пользователей

---

## 📝 TODO

- [ ] Обновить push-scheduled Edge Function с новой логикой
- [ ] Добавить UI для выбора timezone в настройках
- [ ] Настроить Supabase Cron Jobs (hourly)
- [ ] Тестирование с разными timezone
- [ ] Документация для пользователей

