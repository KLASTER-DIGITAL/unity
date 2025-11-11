# Unified Notification Sender - Руководство

**Версия**: 1.0  
**Дата**: 2025-11-11  
**Edge Function**: `unified-notification-sender`

---

## 🎯 Назначение

Централизованный сервис для отправки уведомлений через разные каналы доставки:
- **Web Push** (основной канал)
- **Telegram** (подготовка для будущего)
- **Email** (подготовка для будущего)

### Преимущества

1. **Единая точка входа** - все уведомления через один API
2. **Автоматический выбор канала** - на основе user preferences и availability
3. **Fallback механизм** - автоматическое переключение на другой канал если основной недоступен
4. **Уменьшение дублирования кода** - все Edge Functions используют unified sender

---

## 📡 API

### Endpoint

```
POST /functions/v1/unified-notification-sender
```

### Request Body

```typescript
{
  user_ids: string[] | 'all',           // User IDs или 'all' для всех пользователей
  title: string,                        // Заголовок уведомления
  body: string,                         // Текст уведомления
  icon?: string,                        // URL иконки (default: '/icon-192.png')
  badge?: string,                       // URL badge (default: '/badge-72.png')
  data?: Record<string, any>,           // Дополнительные данные
  channels?: ('web_push' | 'email' | 'telegram')[],  // Принудительный выбор каналов
  fallback?: boolean                    // Включить fallback (default: true)
}
```

### Response

```typescript
{
  success: boolean,                     // Успешность отправки
  total_users: number,                  // Количество пользователей
  total_sent: number,                   // Успешно отправлено
  total_failed: number,                 // Не удалось отправить
  channels_tried: string[],             // Попытки отправки через каналы
  results: ChannelResult[]              // Детальные результаты по каналам
}
```

---

## 🔧 Примеры использования

### 1. Простая отправка (автоматический выбор канала)

```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/unified-notification-sender`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${supabaseServiceKey}`,
  },
  body: JSON.stringify({
    user_ids: ['user-id-1', 'user-id-2'],
    title: '🎉 Новое достижение!',
    body: 'Вы достигли 7 дней подряд!',
    fallback: true,  // Автоматический fallback
  }),
});

const result = await response.json();
console.log('Sent:', result.total_sent, 'Failed:', result.total_failed);
```

### 2. Принудительный выбор канала

```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/unified-notification-sender`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${supabaseServiceKey}`,
  },
  body: JSON.stringify({
    user_ids: ['user-id-1'],
    title: '📧 Важное уведомление',
    body: 'Проверьте вашу почту',
    channels: ['telegram', 'email'],  // Попробовать Telegram, потом Email
    fallback: true,
  }),
});
```

### 3. Отправка всем пользователям

```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/unified-notification-sender`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${supabaseServiceKey}`,
  },
  body: JSON.stringify({
    user_ids: 'all',
    title: '🚀 Новая функция!',
    body: 'Попробуйте новую функцию в приложении',
    fallback: true,
  }),
});
```

### 4. Без fallback (только один канал)

```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/unified-notification-sender`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${supabaseServiceKey}`,
  },
  body: JSON.stringify({
    user_ids: ['user-id-1'],
    title: '⚡ Срочное уведомление',
    body: 'Только через Web Push',
    channels: ['web_push'],
    fallback: false,  // НЕ пытаться другие каналы
  }),
});
```

---

## 🔄 Fallback Механизм

### Как работает

1. **Автоматический выбор канала**:
   - Для batch sending (>1 user) → Web Push
   - Для single user → проверка preferred channels

2. **Приоритет каналов** (по умолчанию):
   - Web Push (самый быстрый)
   - Telegram (если Web Push недоступен)
   - Email (если Telegram недоступен)

3. **Fallback логика**:
   - Попытка отправки через первый канал
   - Если неудача → попытка через следующий канал
   - Если успех → остановка (не пытаться остальные)

### Пример fallback

```
User: user-id-1
Channels: ['web_push', 'telegram', 'email']

1. Попытка Web Push → FAILED (нет subscription)
2. Попытка Telegram → SUCCESS ✅
3. Email → НЕ пытаемся (уже успешно отправлено)

Result: {
  success: true,
  total_sent: 1,
  channels_tried: ['web_push', 'telegram'],
  results: [
    { channel: 'web_push', success: false, sent: 0, failed: 1 },
    { channel: 'telegram', success: true, sent: 1, failed: 0 }
  ]
}
```

---

## 📊 Интеграция с существующими Edge Functions

Все существующие Edge Functions обновлены для использования unified sender:

### push-scheduled
```typescript
// Было: fetch('/functions/v1/push-sender')
// Стало: fetch('/functions/v1/unified-notification-sender')
```

### push-realtime-trigger
```typescript
// Было: fetch('/functions/v1/push-sender')
// Стало: fetch('/functions/v1/unified-notification-sender')
```

### push-ai-personalize
```typescript
// Было: fetch('/functions/v1/push-sender')
// Стало: fetch('/functions/v1/unified-notification-sender')
```

---

## 🚀 Будущие улучшения

### Telegram Integration (Вариант 2)
- Реализация `sendViaTelegram()` функции
- Интеграция с Telegram Bot API
- Добавление `telegram_chat_id` в profiles

### Email Integration
- Реализация `sendViaEmail()` функции
- Интеграция с email service (SendGrid, Resend)
- HTML email templates

### User Preferences
- Настройка приоритета каналов через UI
- Персональные предпочтения для каждого типа уведомлений
- Quiet hours (не беспокоить в определенное время)

---

**Статус**: ✅ Реализовано и задеплоено  
**Версия**: 2 (с channel selection логикой)

