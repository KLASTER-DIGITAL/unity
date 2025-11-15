# 🔔 Unified Notification API - Руководство разработчика

**Версия**: 3.0  
**Дата**: 2025-11-11  
**Статус**: Production Ready

---

## 🎯 Что это?

**Unified Notification Sender** - это централизованный API для отправки уведомлений через несколько каналов:
- ✅ **Web Push** (реализовано)
- ✅ **Telegram** (реализовано)
- 🚧 **Email** (в разработке)

### Преимущества:
- ✅ **Единая точка входа** - один API для всех каналов
- ✅ **Автоматический выбор канала** - на основе user preferences
- ✅ **Fallback механизм** - автоматическое переключение если основной канал недоступен
- ✅ **Централизованная логика** - проще поддерживать и тестировать

---

## 🚀 Быстрый старт

### Базовый пример

```typescript
// Отправить уведомление одному пользователю
const response = await fetch(
  'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/unified-notification-sender',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      user_ids: ['user-uuid-123'],
      title: '🎉 Новое достижение!',
      body: 'Вы разблокировали достижение "Первая запись"',
      icon: '/icon-192x192.png',
      fallback: true, // Включить fallback на другие каналы
    }),
  }
);

const result = await response.json();
console.log(result);
// {
//   success: true,
//   results: [
//     { channel: 'web_push', success: true, sent: 1, failed: 0 }
//   ]
// }
```

---

## 📋 API Reference

### Endpoint
```
POST https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/unified-notification-sender
```

### Headers
```typescript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY'
}
```

### Request Body

```typescript
interface NotificationPayload {
  user_ids: string[];           // Массив user IDs (обязательно)
  title: string;                // Заголовок уведомления (обязательно)
  body: string;                 // Текст уведомления (обязательно)
  icon?: string;                // URL иконки (опционально)
  badge?: string;               // URL badge (опционально)
  data?: Record<string, any>;   // Дополнительные данные (опционально)
  channels?: NotificationChannel[]; // Принудительный выбор каналов (опционально)
  fallback?: boolean;           // Включить fallback (по умолчанию: true)
}

type NotificationChannel = 'web_push' | 'telegram' | 'email';
```

### Response

```typescript
interface NotificationResponse {
  success: boolean;             // Общий статус
  results: ChannelResult[];     // Результаты по каждому каналу
}

interface ChannelResult {
  channel: NotificationChannel; // Канал отправки
  success: boolean;             // Статус отправки
  sent: number;                 // Количество успешно отправленных
  failed: number;               // Количество неудачных
  error?: string;               // Ошибка (если есть)
}
```

---

## 💡 Примеры использования

### 1. Простая отправка (автоматический выбор канала)

```typescript
const response = await fetch(UNIFIED_SENDER_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  },
  body: JSON.stringify({
    user_ids: ['user-123'],
    title: '📝 Напоминание',
    body: 'Не забудьте написать запись сегодня!',
    fallback: true,
  }),
});
```

**Логика выбора канала**:
1. Проверяет Web Push subscription → если есть, отправляет
2. Если Web Push недоступен → проверяет Telegram chat_id → если есть, отправляет
3. Если Telegram недоступен → проверяет Email → если есть, отправляет
4. Если все каналы недоступны → возвращает ошибку

---

### 2. Принудительный выбор канала

```typescript
// Отправить ТОЛЬКО через Telegram
const response = await fetch(UNIFIED_SENDER_URL, {
  method: 'POST',
  headers: { /* ... */ },
  body: JSON.stringify({
    user_ids: ['user-123'],
    title: '🔔 Telegram уведомление',
    body: 'Это уведомление придет только в Telegram',
    channels: ['telegram'], // Принудительно только Telegram
    fallback: false,        // Отключить fallback
  }),
});
```

---

### 3. Массовая рассылка

```typescript
// Отправить уведомление 1000 пользователям
const userIds = await getUserIds(); // ['user-1', 'user-2', ..., 'user-1000']

const response = await fetch(UNIFIED_SENDER_URL, {
  method: 'POST',
  headers: { /* ... */ },
  body: JSON.stringify({
    user_ids: userIds,
    title: '🎉 Новая функция!',
    body: 'Мы добавили Telegram уведомления!',
    icon: '/icon-192x192.png',
    data: {
      url: '/settings/notifications',
      action: 'open_settings',
    },
    fallback: true,
  }),
});

const result = await response.json();
console.log(`Отправлено: ${result.results[0].sent}`);
console.log(`Не удалось: ${result.results[0].failed}`);
```

---

### 4. С дополнительными данными

```typescript
const response = await fetch(UNIFIED_SENDER_URL, {
  method: 'POST',
  headers: { /* ... */ },
  body: JSON.stringify({
    user_ids: ['user-123'],
    title: '🏆 Новое достижение!',
    body: 'Вы достигли 30 дней подряд!',
    icon: '/achievements/streak-30.png',
    data: {
      achievement_id: 'streak-30',
      url: '/achievements',
      action: 'view_achievement',
    },
    fallback: true,
  }),
});
```

**Использование data в Service Worker**:
```typescript
// public/service-worker.js
self.addEventListener('notificationclick', (event) => {
  const data = event.notification.data;
  
  if (data.action === 'view_achievement') {
    clients.openWindow(data.url);
  }
});
```

---

## 🔄 Fallback механизм

### Как работает?

1. **Попытка 1**: Отправка через основной канал (Web Push)
   - Если успешно → возвращает результат
   - Если неудачно → переходит к шагу 2

2. **Попытка 2**: Отправка через Telegram
   - Проверяет наличие `telegram_chat_id`
   - Если есть → отправляет через Telegram Bot API
   - Если нет → переходит к шагу 3

3. **Попытка 3**: Отправка через Email
   - Проверяет наличие `email`
   - Если есть → отправляет через Email (в разработке)
   - Если нет → возвращает ошибку

### Пример ответа с fallback

```json
{
  "success": true,
  "results": [
    {
      "channel": "web_push",
      "success": false,
      "sent": 0,
      "failed": 1,
      "error": "No push subscription found"
    },
    {
      "channel": "telegram",
      "success": true,
      "sent": 1,
      "failed": 0
    }
  ]
}
```

### Отключить fallback

```typescript
const response = await fetch(UNIFIED_SENDER_URL, {
  method: 'POST',
  headers: { /* ... */ },
  body: JSON.stringify({
    user_ids: ['user-123'],
    title: 'Test',
    body: 'Test notification',
    fallback: false, // Отключить fallback
  }),
});
```

---

## 🔧 Интеграция с существующими Edge Functions

Все существующие Edge Functions уже интегрированы с Unified Sender:

### 1. **push-scheduled** (запланированные уведомления)
```typescript
// supabase/functions/push-scheduled/index.ts
const response = await fetch(`${supabaseUrl}/functions/v1/unified-notification-sender`, {
  method: 'POST',
  headers: { /* ... */ },
  body: JSON.stringify({
    user_ids: userIds,
    title,
    body,
    icon,
    data,
    fallback: true,
  }),
});
```

### 2. **push-realtime-trigger** (realtime уведомления)
```typescript
// supabase/functions/push-realtime-trigger/index.ts
const response = await fetch(`${supabaseUrl}/functions/v1/unified-notification-sender`, {
  method: 'POST',
  headers: { /* ... */ },
  body: JSON.stringify({
    user_ids: [userId],
    title,
    body,
    icon,
    data,
    fallback: true,
  }),
});
```

### 3. **push-ai-personalize** (AI персонализированные)
```typescript
// supabase/functions/push-ai-personalize/index.ts
const response = await fetch(`${supabaseUrl}/functions/v1/unified-notification-sender`, {
  method: 'POST',
  headers: { /* ... */ },
  body: JSON.stringify({
    user_ids: [userId],
    title: aiGeneratedTitle,
    body: aiGeneratedBody,
    icon,
    data,
    fallback: true,
  }),
});
```

---

## 📊 Мониторинг и аналитика

### Логирование

Все отправки логируются в консоль Edge Function:

```
[UNIFIED-SENDER] Received request for 1 users
[UNIFIED-SENDER] Trying channel: web_push
[UNIFIED-SENDER] Web Push sent to user user-123
[UNIFIED-SENDER] Channel web_push: sent=1, failed=0
```

### Аналитика

Результаты отправки можно сохранять в таблицу `push_notification_analytics`:

```typescript
const { data, error } = await supabaseAdmin
  .from('push_notification_analytics')
  .insert({
    user_id: userId,
    channel: 'telegram',
    status: 'sent',
    title,
    body,
    sent_at: new Date().toISOString(),
  });
```

---

## 🚨 Обработка ошибок

### Типичные ошибки

**1. No channels available**
```json
{
  "success": false,
  "results": [
    {
      "channel": "web_push",
      "success": false,
      "sent": 0,
      "failed": 1,
      "error": "No push subscription found"
    },
    {
      "channel": "telegram",
      "success": false,
      "sent": 0,
      "failed": 1,
      "error": "No telegram_chat_id found"
    }
  ]
}
```

**Решение**: Пользователь должен настроить хотя бы один канал уведомлений.

---

**2. TELEGRAM_BOT_TOKEN not configured**
```json
{
  "success": false,
  "results": [
    {
      "channel": "telegram",
      "success": false,
      "sent": 0,
      "failed": 1,
      "error": "TELEGRAM_BOT_TOKEN not configured"
    }
  ]
}
```

**Решение**: Настроить `TELEGRAM_BOT_TOKEN` в Supabase Edge Function secrets.

---

## 🔐 Безопасность

### Authentication

Unified Sender требует Supabase authentication:

```typescript
headers: {
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}` // Для клиентских запросов
  // или
  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` // Для серверных запросов
}
```

### Rate Limiting

- **Клиентские запросы**: 10 запросов/минуту на пользователя
- **Серверные запросы**: 100 запросов/минуту

---

## 📚 Дополнительные ресурсы

- [Telegram Notifications Guide](./TELEGRAM_NOTIFICATIONS_GUIDE.md) - руководство для пользователей
- [Push Notifications Architecture](../architecture/PUSH_NOTIFICATIONS.md) - архитектура системы
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions) - документация Supabase

---

**Happy coding! 🚀**

