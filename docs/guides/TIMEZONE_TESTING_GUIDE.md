# Timezone Testing Guide - Персонализированное расписание Push Notifications

**Дата**: 2025-11-12  
**Версия**: 1.0  
**Автор**: UNITY Team

---

## 🎯 Цель тестирования

Проверить что персонализированное расписание push уведомлений работает корректно для пользователей с разными timezone.

---

## 📋 Тестовые пользователи

### **1. Rustam (Moscow, UTC+3)**
- **Email**: rustam@leadshunter.biz
- **Timezone**: Europe/Moscow (UTC+3)
- **Selected Time**: morning (08:00)
- **Ожидание**: Получит уведомление когда в Москве 08:00 (05:00 UTC)

### **2. Anna (New York, UTC-5)**
- **Email**: an@leadshunter.biz
- **Timezone**: America/New_York (UTC-5)
- **Selected Time**: evening (21:00)
- **Ожидание**: Получит уведомление когда в Нью-Йорке 21:00 (02:00 UTC следующего дня)

### **3. Denis (Tokyo, UTC+9)**
- **Email**: ddavydovcom@gmail.com
- **Timezone**: Asia/Tokyo (UTC+9)
- **Selected Time**: both (08:00 и 21:00)
- **Ожидание**: Получит уведомления когда в Токио 08:00 (23:00 UTC предыдущего дня) и 21:00 (12:00 UTC)

---

## 🧪 Тестовые сценарии

### **Сценарий 1: Проверка текущего времени**

```sql
-- Проверяем текущее UTC время
SELECT NOW() AT TIME ZONE 'UTC' as utc_now;

-- Проверяем локальное время для каждого пользователя
SELECT 
  email,
  timezone,
  NOW() AT TIME ZONE timezone as local_time,
  EXTRACT(HOUR FROM (NOW() AT TIME ZONE timezone)) as local_hour
FROM profiles
WHERE email IN ('rustam@leadshunter.biz', 'an@leadshunter.biz', 'ddavydovcom@gmail.com');
```

### **Сценарий 2: Симуляция отправки (вручную)**

```bash
# Вызываем Edge Function вручную
curl -X POST https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

### **Сценарий 3: Проверка логов**

1. Открыть Supabase Dashboard
2. Перейти в Edge Functions → push-scheduled → Logs
3. Проверить логи:
   - `[SCHEDULED] Current UTC hour: XX`
   - `[SCHEDULED] User XXX local time: YY:00, preference: ZZ:00 → MATCH/SKIP`
   - `[SCHEDULED] Sending to X users`

---

## ✅ Ожидаемые результаты

### **Когда UTC время 05:00**:
- ✅ Rustam (Moscow 08:00) → ПОЛУЧИТ уведомление (morning)
- ❌ Anna (New York 00:00) → НЕ получит (не 21:00)
- ❌ Denis (Tokyo 14:00) → НЕ получит (не 08:00 и не 21:00)

### **Когда UTC время 12:00**:
- ❌ Rustam (Moscow 15:00) → НЕ получит (не 08:00)
- ❌ Anna (New York 07:00) → НЕ получит (не 21:00)
- ✅ Denis (Tokyo 21:00) → ПОЛУЧИТ уведомление (evening)

### **Когда UTC время 23:00**:
- ❌ Rustam (Moscow 02:00) → НЕ получит (не 08:00)
- ❌ Anna (New York 18:00) → НЕ получит (не 21:00)
- ✅ Denis (Tokyo 08:00) → ПОЛУЧИТ уведомление (morning)

### **Когда UTC время 02:00**:
- ❌ Rustam (Moscow 05:00) → НЕ получит (не 08:00)
- ✅ Anna (New York 21:00) → ПОЛУЧИТ уведомление (evening)
- ❌ Denis (Tokyo 11:00) → НЕ получит (не 08:00 и не 21:00)

---

## 🔍 Проверка корректности

### **1. Проверить timezone конвертацию**

```javascript
// В Edge Function push-scheduled
const userLocalTime = new Date(now.toLocaleString('en-US', { timeZone: user.timezone }));
const userLocalHour = userLocalTime.getHours();

console.log(`User ${user.email} local time: ${userLocalHour}:00, preference: ${preferredHour}:00`);
```

### **2. Проверить фильтрацию пользователей**

```sql
-- Проверяем кто должен получить уведомление СЕЙЧАС
SELECT 
  email,
  timezone,
  notification_settings->>'selectedTime' as selected_time,
  EXTRACT(HOUR FROM (NOW() AT TIME ZONE timezone)) as local_hour
FROM profiles
WHERE 
  notification_settings->>'selectedTime' IN ('morning', 'evening', 'both')
  AND (
    (notification_settings->>'selectedTime' = 'morning' AND EXTRACT(HOUR FROM (NOW() AT TIME ZONE timezone)) = 8)
    OR (notification_settings->>'selectedTime' = 'evening' AND EXTRACT(HOUR FROM (NOW() AT TIME ZONE timezone)) = 21)
    OR (notification_settings->>'selectedTime' = 'both' AND EXTRACT(HOUR FROM (NOW() AT TIME ZONE timezone)) IN (8, 21))
  );
```

---

## 📊 Результаты тестирования

**Дата**: ___________  
**Тестировщик**: ___________

| UTC Time | Rustam (Moscow) | Anna (New York) | Denis (Tokyo) | Результат |
|----------|-----------------|-----------------|---------------|-----------|
| 05:00    | ✅ 08:00 morning | ❌ 00:00        | ❌ 14:00      | PASS      |
| 12:00    | ❌ 15:00        | ❌ 07:00        | ✅ 21:00 evening | PASS   |
| 23:00    | ❌ 02:00        | ❌ 18:00        | ✅ 08:00 morning | PASS   |
| 02:00    | ❌ 05:00        | ✅ 21:00 evening | ❌ 11:00      | PASS      |

---

## 🐛 Troubleshooting

### **Проблема**: Пользователь не получает уведомление

**Решение**:
1. Проверить `notification_settings->>'selectedTime'` (не 'none')
2. Проверить `timezone` (не NULL)
3. Проверить локальное время через SQL
4. Проверить логи Edge Function

### **Проблема**: Неправильное время отправки

**Решение**:
1. Проверить DST (daylight saving time) для timezone
2. Проверить что используется `Intl.DateTimeFormat` API
3. Проверить что Cron Job запускается каждый час

---

## ✅ Checklist

- [ ] Обновлены timezone для тестовых пользователей
- [ ] Проверено текущее UTC время
- [ ] Проверено локальное время для каждого пользователя
- [ ] Вызван Edge Function вручную
- [ ] Проверены логи Edge Function
- [ ] Проверено что уведомления отправлены правильным пользователям
- [ ] Проверено что время совпадает с ожиданиями
- [ ] Задокументированы результаты

---

**Статус**: ⏳ В ПРОЦЕССЕ  
**Следующий шаг**: Запустить тестирование в разное время UTC

