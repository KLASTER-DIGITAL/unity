# Push Notifications System - UNITY-v2

**Версия**: 1.0  
**Дата**: 2025-11-15  
**Статус**: ⚠️ Частично работает (есть критические проблемы)

---

## 📋 Содержание

1. [Архитектура системы](#архитектура-системы)
2. [Сценарии работы push-уведомлений](#сценарии-работы-push-уведомлений)
3. [Push-уведомления и карточки](#push-уведомления-и-карточки)
4. [Критические проблемы](#критические-проблемы)
5. [Почему пользователи НЕ получают push](#почему-пользователи-не-получают-push)
6. [Решения и рекомендации](#решения-и-рекомендации)

---

## 🏗️ Архитектура системы

### Компоненты

```
┌─────────────────────────────────────────────────────────────────┐
│                         PUSH SYSTEM                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   Frontend   │      │ Edge         │      │  Database    │  │
│  │   (PWA)      │◄────►│ Functions    │◄────►│  (Supabase)  │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│         │                      │                      │          │
│         │                      │                      │          │
│    Service Worker         Unified Sender         Webhooks       │
│    Push Manager           Push Sender            Cron Jobs      │
│    VAPID Keys             Realtime Trigger       Subscriptions  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1. Frontend (PWA)

**Файлы**:
- `src/shared/lib/notifications/pushAdapter.ts` - главный адаптер
- `src/shared/lib/platform/push/push.web.ts` - Web Push API
- `src/shared/lib/notifications/platformDetection.ts` - определение платформы
- `src/shared/components/pwa/PushSubscriptionManager.tsx` - UI компонент
- `public/service-worker.js` - Service Worker с push event handler

**Функции**:
1. **Подписка на push** (`subscribeToPush(userId)`):
   - Проверка поддержки платформы
   - Запрос разрешения (Notification.permission)
   - Регистрация Service Worker
   - Загрузка VAPID public key
   - Создание push subscription
   - Сохранение в БД (push_subscriptions)

2. **Обработка push событий** (Service Worker):
   - `push` event - получение уведомления
   - `notificationclick` - клик на уведомление
   - `notificationclose` - закрытие уведомления

3. **Определение платформы**:
   - iOS (требует PWA mode, iOS 16.4+)
   - Android (Chrome, Firefox, Edge)
   - Desktop (Chrome, Firefox, Edge, Safari)
   - Telegram (использует Telegram Bot)

### 2. Edge Functions

**push-realtime-trigger** (`supabase/functions/push-realtime-trigger/index.ts`):
- **Назначение**: Обработка realtime событий из Database Webhooks
- **Триггеры**:
  - `entries INSERT` - новая запись создана
  - `entry_summaries INSERT` - AI-анализ готов
- **Логика**:
  1. Получает событие из webhook
  2. Проверяет есть ли активные push subscriptions
  3. Вызывает `unified-notification-sender`

**push-scheduled** (`supabase/functions/push-scheduled/index.ts`):
- **Назначение**: Отправка запланированных уведомлений
- **Типы**:
  - `daily_reminder` - ежедневное напоминание (09:00 UTC)
  - `weekly_motivation` - еженедельная мотивация (понедельник 10:00)
  - `goal_reminder` - напоминание о целях (пятница 18:00)
- **Логика**:
  1. Получает тип из query параметра
  2. Генерирует AI-персонализированное сообщение
  3. Вызывает `unified-notification-sender`

**unified-notification-sender** (`supabase/functions/unified-notification-sender/index.ts`):
- **Назначение**: Централизованный сервис отправки уведомлений
- **Каналы**:
  - Web Push (основной)
  - Telegram (fallback)
  - Email (fallback)
- **Логика**:
  1. Определяет доступные каналы для пользователя
  2. Пытается отправить через Web Push
  3. Если не удалось → fallback на Telegram/Email
  4. Вызывает `push-sender` для Web Push

**push-sender** (`supabase/functions/push-sender/index.ts`):
- **Назначение**: Низкоуровневая отправка Web Push
- **Логика**:
  1. Загружает VAPID keys из admin_settings
  2. Получает активные push subscriptions
  3. Генерирует VAPID headers
  4. Шифрует payload (AES128GCM)
  5. Отправляет POST запрос на push endpoint
  6. Обрабатывает ошибки (401, 403, 404, 410)
  7. Сохраняет в push_notifications_history

### 3. Database (Supabase)

**Таблицы**:

**push_subscriptions**:
```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  browser_info JSONB,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**admin_settings** (VAPID keys):
```sql
-- vapid_public_key: BN... (Base64)
-- vapid_private_key: ... (Base64)
```

**Database Webhooks**:
1. `push_on_entry_insert`:
   - Таблица: entries
   - События: INSERT
   - URL: `/functions/v1/push-realtime-trigger`

2. `push_on_summary_insert`:
   - Таблица: entry_summaries
   - События: INSERT
   - URL: `/functions/v1/push-realtime-trigger`

**Cron Jobs**:
1. `daily_push_reminder`:
   - Расписание: `0 18 * * *` (21:00 UTC+3)
   - URL: `/functions/v1/push-scheduled?type=daily_reminder`

2. `weekly_push_motivation`:
   - Расписание: `0 7 * * 1` (10:00 UTC+3, понедельник)
   - URL: `/functions/v1/push-scheduled?type=weekly_motivation`

3. `goal_push_reminder`:
   - Расписание: `0 15 * * 5` (18:00 UTC+3, пятница)
   - URL: `/functions/v1/push-scheduled?type=goal_reminder`

---

## 📖 Сценарии работы push-уведомлений

### Сценарий 1: Новый пользователь подписывается на push

**Шаг 1**: Пользователь открывает Settings → Notifications

**Шаг 2**: Нажимает "Включить уведомления"
- Frontend вызывает `subscribeToPush(userId)`
- Проверяется платформа через `getPushPlatformInfo()`

**Шаг 3**: Определение платформы

**Вариант A: Desktop (Chrome/Firefox/Edge)**
```
✅ Service Worker: Поддерживается
✅ PushManager: Поддерживается
✅ Результат: Платформа поддерживается
```

**Вариант B: Android (Chrome)**
```
✅ Service Worker: Поддерживается
✅ PushManager: Поддерживается
✅ Результат: Платформа поддерживается
```

**Вариант C: iOS Safari (НЕ PWA)**
```
❌ PWA Mode: false
❌ Результат: ios_requires_pwa
📝 Инструкция: "Установите приложение на Home Screen"
```

**Вариант D: iOS Safari (PWA, iOS 16.4+)**
```
✅ PWA Mode: true
✅ iOS Version: 16.4+
✅ Результат: Платформа поддерживается
```

**Шаг 4**: Запрос разрешения
```javascript
const permission = await Notification.requestPermission();
// Возможные значения: 'granted', 'denied', 'default'
```

**Результат A: granted**
- Продолжаем подписку

**Результат B: denied**
- Показываем ошибку: "Вы запретили уведомления"
- Инструкция: "Разрешите в настройках браузера"
- Подписка прерывается

**Шаг 5**: Загрузка VAPID public key
```javascript
const { data } = await supabase
  .from('admin_settings')
  .select('value')
  .eq('key', 'vapid_public_key')
  .single();
```

**Проблема**: Если VAPID key НЕ настроен → ошибка "VAPID ключ не настроен"

**Шаг 6**: Создание push subscription
```javascript
const registration = await navigator.serviceWorker.ready;
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
});
```

**Шаг 7**: Сохранение в БД
```javascript
await supabase.from('push_subscriptions').upsert({
  user_id: userId,
  endpoint: subscription.endpoint,
  p256dh: subscription.keys.p256dh,
  auth: subscription.keys.auth,
  is_active: true
});
```

**Результат**: ✅ Пользователь подписан на push

---

### Сценарий 2: Пользователь создает запись → получает push

**Шаг 1**: Пользователь создает запись
```javascript
await supabase.from('entries').insert({
  user_id: userId,
  content: "Сегодня отличный день!",
  mood: "happy"
});
```

**Шаг 2**: Database Webhook срабатывает
```
Webhook: push_on_entry_insert
Таблица: entries
Событие: INSERT
URL: /functions/v1/push-realtime-trigger
```

**Шаг 3**: push-realtime-trigger обрабатывает событие
```typescript
// 1. Получает user_id из record
const userId = record.user_id;

// 2. Проверяет активные subscriptions
const subscriptions = await getUserPushSubscriptions(userId);
if (subscriptions.length === 0) {
  console.log('No active subscriptions');
  return; // ❌ ПРОБЛЕМА: Пользователь НЕ получит push!
}

// 3. Вызывает unified-notification-sender
await sendPushNotification(
  userId,
  '✅ Запись сохранена!',
  'Ваша запись успешно добавлена в дневник'
);
```

**Шаг 4**: unified-notification-sender выбирает канал
```typescript
// 1. Получает доступные каналы
const channels = await getUserChannels(userId);
// Возможные: ['web_push', 'telegram', 'email']

// 2. Пытается отправить через Web Push
const result = await sendViaWebPush([userId], title, body);

// 3. Если не удалось → fallback на Telegram/Email
if (!result.success && fallback) {
  await sendViaTelegram([userId], title, body);
}
```

**Шаг 5**: push-sender отправляет Web Push
```typescript
// 1. Загружает VAPID keys
const vapidKeys = await loadVapidKeys();

// 2. Получает активные subscriptions
const { data: subscriptions } = await supabase
  .from('push_subscriptions')
  .select('*')
  .eq('user_id', userId)
  .eq('is_active', true);

// 3. Для каждой subscription:
for (const sub of subscriptions) {
  // 3.1. Генерирует VAPID headers
  const vapidHeaders = await generateVapidHeaders(sub.endpoint, vapidKeys);

  // 3.2. Шифрует payload
  const encryptedPayload = await encryptPayload({
    title: '✅ Запись сохранена!',
    body: 'Ваша запись успешно добавлена в дневник',
    icon: '/icon-192.png',
    data: { type: 'entry_created', entry_id: record.id }
  });

  // 3.3. Отправляет POST на push endpoint
  const response = await fetch(sub.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      TTL: '86400',
      ...vapidHeaders
    },
    body: encryptedPayload
  });

  // 3.4. Обрабатывает ответ
  if (!response.ok) {
    console.error('Push failed:', response.status);
    // Возможные ошибки:
    // 401 - Invalid VAPID keys
    // 403 - Forbidden
    // 404 - Subscription not found
    // 410 - Subscription expired
  }
}
```

**Шаг 6**: Service Worker получает push
```javascript
self.addEventListener('push', (event) => {
  const payload = event.data.json();

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: '/badge-72.png',
      data: payload.data
    })
  );
});
```

**Результат**: ✅ Пользователь видит уведомление "✅ Запись сохранена!"

---

### Сценарий 3: Ежедневное напоминание (Cron Job)

**Шаг 1**: Cron Job срабатывает в 21:00 (UTC+3)
```sql
SELECT cron.schedule(
  'daily_push_reminder',
  '0 18 * * *',  -- 18:00 UTC = 21:00 UTC+3
  $$ ... $$
);
```

**Шаг 2**: push-scheduled генерирует сообщение
```typescript
// 1. Получает всех пользователей с активными subscriptions
const { data: users } = await supabase
  .from('profiles')
  .select('id, full_name, language')
  .eq('notification_settings->dailyReminder', true);

// 2. Для каждого пользователя генерирует персонализированное сообщение
for (const user of users) {
  const message = await generateAIMessage(user);
  // Пример: "Привет, Рустам! Как прошел твой день? Запиши свои мысли 📝"

  await sendPushNotification(
    [user.id],
    '📝 Время записать день!',
    message
  );
}
```

**Результат**: ✅ Все пользователи получают персонализированное напоминание

---

## 🔗 Push-уведомления и карточки

### Связь между push и карточками

**ВАЖНО**: Карточки **НЕ отправляют** push-уведомления напрямую!

```
┌─────────────────────────────────────────────────────────────┐
│                    PUSH → CARDS FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Пользователь создает запись                             │
│     ↓                                                        │
│  2. Database Webhook → push-realtime-trigger                 │
│     ↓                                                        │
│  3. Push-уведомление "✅ Запись сохранена!"                  │
│     ↓                                                        │
│  4. Пользователь открывает приложение                        │
│     ↓                                                        │
│  5. home-screen-data → motivations Edge Function             │
│     ↓                                                        │
│  6. Запись становится карточкой с AI инсайтом               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Типы push-уведомлений

**1. При создании записи** (Realtime):
```
Триггер: entries INSERT
Уведомление: "✅ Запись сохранена!"
Связь с карточками: Запись появится как карточка при следующем открытии главного экрана
```

**2. При готовности AI-анализа** (Realtime):
```
Триггер: entry_summaries INSERT
Уведомление: "🤖 AI-анализ готов!"
Связь с карточками: AI инсайт будет показан в карточке
```

**3. Ежедневное напоминание** (Scheduled, 21:00):
```
Триггер: Cron Job
Уведомление: "📝 Время записать день!"
Связь с карточками: НЕТ прямой связи, но мотивирует создать запись → запись станет карточкой
```

**4. Еженедельная мотивация** (Scheduled, понедельник 10:00):
```
Триггер: Cron Job
Уведомление: "💪 Начни неделю с достижения!"
Связь с карточками: НЕТ прямой связи
```

**5. Напоминание о целях** (Scheduled, пятница 18:00):
```
Триггер: Cron Job
Уведомление: "🎯 Проверь свои цели!"
Связь с карточками: НЕТ прямой связи
```

### Отсутствующие push-уведомления

**Что НЕ отправляет push (но ДОЛЖНО)**:

❌ **Новые карточки появились**
- Когда: Пользователь создал запись → появилась новая карточка
- Текущее состояние: Уведомление НЕ отправляется
- Проблема: Пользователь не знает что есть новые AI инсайты
- Решение: Добавить push "У вас новые AI инсайты!" после создания entry_summary

❌ **Все карточки просмотрены**
- Когда: Пользователь просмотрел все карточки
- Текущее состояние: Уведомление НЕ отправляется
- Проблема: Пользователь не мотивирован создать новую запись
- Решение: Добавить push "Создайте новую запись для новых инсайтов!"

❌ **Streak Milestones**
- Когда: Пользователь достиг 3, 7, 14, 30 дней подряд
- Текущее состояние: Логика есть в push-realtime-trigger, но НЕ работает
- Проблема: Нет таблицы achievements, streak хранится в profiles
- Решение: Переделать логику для работы с profiles.streak

---

## ⚠️ Критические проблемы

### Проблема 1: VAPID keys не настроены (КРИТИЧНО)

**Описание**: VAPID keys отсутствуют в admin_settings

**Симптомы**:
- Ошибка при подписке: "VAPID ключ не настроен"
- Push-уведомления НЕ отправляются
- В консоли: "Failed to load VAPID public key"

**Проверка**:
```sql
SELECT key, value FROM admin_settings
WHERE key IN ('vapid_public_key', 'vapid_private_key');
```

**Ожидаемый результат**:
```
vapid_public_key  | BN...
vapid_private_key | ...
```

**Если пусто** → VAPID keys НЕ настроены!

**Решение**:
1. Сгенерировать VAPID keys в админ-панели
2. Или вручную через SQL:
```sql
INSERT INTO admin_settings (key, value, category)
VALUES
  ('vapid_public_key', 'BN...', 'push_notifications'),
  ('vapid_private_key', '...', 'push_notifications');
```

**Статус**: ❌ НЕ ИСПРАВЛЕНО (требует проверки в production)

---

### Проблема 2: Service Worker не регистрируется (КРИТИЧНО)

**Описание**: Service Worker не активен → push НЕ работает

**Симптомы**:
- Ошибка при подписке: "Service Worker not registered"
- В DevTools → Application → Service Workers: пусто
- Push-уведомления НЕ приходят

**Проверка** (в консоли браузера):
```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW registered:', !!reg);
  console.log('SW active:', !!reg?.active);
});
```

**Ожидаемый результат**:
```
SW registered: true
SW active: true
```

**Если false** → Service Worker НЕ зарегистрирован!

**Причины**:
1. **HTTPS не используется** (кроме localhost)
2. **Service Worker файл не найден** (404 для /service-worker.js)
3. **Ошибка в service-worker.js** (синтаксическая ошибка)
4. **Кеш браузера** (старая версия SW)

**Решение**:
1. Проверить что приложение открыто через HTTPS или localhost
2. Проверить что `/service-worker.js` доступен (200 OK)
3. Проверить консоль на ошибки в SW
4. Очистить кеш и перезагрузить (Ctrl+Shift+R)

**Статус**: ⚠️ Частично решено (работает в production, но не у всех пользователей)

---

### Проблема 3: Разрешение отклонено пользователем

**Описание**: Пользователь нажал "Блокировать" при запросе разрешения

**Симптомы**:
- Ошибка: "Вы запретили уведомления"
- `Notification.permission === 'denied'`
- Push-уведомления НЕ приходят

**Проверка**:
```javascript
console.log('Permission:', Notification.permission);
// Возможные значения: 'granted', 'denied', 'default'
```

**Решение для пользователя**:
1. **Chrome Desktop**:
   - Адресная строка → иконка замка → Настройки сайта
   - Уведомления → Разрешить

2. **Chrome Android**:
   - Меню → Настройки → Настройки сайта → Уведомления
   - Найти сайт → Разрешить

3. **Safari iOS (PWA)**:
   - Настройки → Safari → Уведомления
   - Найти сайт → Разрешить

**Решение для разработчика**:
- Показывать инструкцию как разрешить уведомления
- Добавить кнопку "Как разрешить уведомления?"
- Не спамить запросами разрешения

**Статус**: ✅ Решено (показываем инструкцию)

---

### Проблема 4: iOS Safari НЕ поддерживает Web Push (КРИТИЧНО для iOS)

**Описание**: iOS Safari (браузер) НЕ поддерживает Web Push API

**Симптомы**:
- Ошибка: "ios_requires_pwa"
- Инструкция: "Установите приложение на Home Screen"
- Push НЕ работает в Safari браузере

**Платформы**:
- ❌ iOS Safari (браузер) - НЕ поддерживается
- ✅ iOS Safari (PWA mode) - поддерживается с iOS 16.4+
- ✅ Android Chrome - поддерживается
- ✅ Desktop Chrome/Firefox/Edge - поддерживается

**Проверка**:
```javascript
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isPWA = window.matchMedia('(display-mode: standalone)').matches;
const iosVersion = parseFloat(navigator.userAgent.match(/OS (\d+)_/)?.[1] || '0');

console.log('iOS:', isIOS);
console.log('PWA mode:', isPWA);
console.log('iOS version:', iosVersion);

if (isIOS && !isPWA) {
  console.log('❌ iOS Safari (browser) - Web Push NOT supported');
} else if (isIOS && isPWA && iosVersion >= 16.4) {
  console.log('✅ iOS PWA - Web Push supported');
}
```

**Решение**:
1. Показывать инструкцию "Установите приложение на Home Screen"
2. Добавить кнопку "Как установить PWA?"
3. После установки → запросить разрешение на уведомления

**Статус**: ✅ Решено (показываем инструкцию для iOS)

---

### Проблема 5: Database Webhooks не настроены

**Описание**: Webhooks отсутствуют в Supabase → push НЕ отправляются

**Симптомы**:
- Пользователь создает запись → push НЕ приходит
- AI-анализ готов → push НЕ приходит
- В логах Edge Functions: нет вызовов push-realtime-trigger

**Проверка** (Supabase Dashboard):
```
Database → Webhooks → должно быть 2 webhook:
1. push_on_entry_insert (entries INSERT)
2. push_on_summary_insert (entry_summaries INSERT)
```

**Если пусто** → Webhooks НЕ настроены!

**Решение**:
```sql
-- Создать webhooks через миграцию
-- См. supabase/migrations/20251028_setup_push_notifications_automation.sql
```

**Статус**: ⚠️ Требует проверки в production

---

### Проблема 6: Cron Jobs не запущены

**Описание**: Scheduled push НЕ отправляются

**Симптомы**:
- Ежедневное напоминание (21:00) НЕ приходит
- Еженедельная мотивация НЕ приходит
- Напоминание о целях НЕ приходит

**Проверка** (Supabase Dashboard):
```
Database → Cron Jobs → должно быть 3 jobs:
1. daily_push_reminder (0 18 * * *)
2. weekly_push_motivation (0 7 * * 1)
3. goal_push_reminder (0 15 * * 5)
```

**Если пусто** → Cron Jobs НЕ настроены!

**Решение**:
```sql
-- Создать cron jobs через миграцию
-- См. supabase/migrations/20251028_setup_push_notifications_automation.sql
```

**Статус**: ⚠️ Требует проверки в production

---

### Проблема 7: Push subscription expired (410 Gone)

**Описание**: Browser push endpoint вернул 410 Gone

**Симптомы**:
- Push НЕ приходит
- В логах push-sender: "HTTP 410 Gone"
- Subscription устарела

**Причины**:
- Пользователь очистил данные браузера
- Пользователь переустановил браузер
- Subscription истекла (обычно через 90 дней)

**Решение**:
1. Автоматически удалять expired subscriptions:
```typescript
if (response.status === 410) {
  // Удаляем subscription из БД
  await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', subscription.endpoint);
}
```

2. Показывать пользователю: "Подписка истекла, подпишитесь снова"

**Статус**: ✅ Частично решено (удаляем expired, но не показываем UI)

---

### Проблема 8: Invalid VAPID keys (401 Unauthorized)

**Описание**: VAPID keys неправильные или не совпадают

**Симптомы**:
- Push НЕ приходит
- В логах push-sender: "HTTP 401 Unauthorized"
- Browser push service отклоняет запрос

**Причины**:
- VAPID public key в subscription НЕ совпадает с private key
- VAPID keys сгенерированы неправильно
- VAPID keys изменились после подписки

**Решение**:
1. Проверить что VAPID keys правильные:
```javascript
// Public key должен начинаться с "BN"
// Private key должен быть Base64 строкой
```

2. Пересоздать все subscriptions с новыми VAPID keys:
```sql
DELETE FROM push_subscriptions; -- Удалить все старые
-- Пользователи должны подписаться заново
```

**Статус**: ⚠️ Требует проверки VAPID keys в production

---

## 🔍 Почему пользователи НЕ получают push

### Чеклист диагностики

**Шаг 1: Проверить VAPID keys**
```sql
SELECT key, value FROM admin_settings
WHERE key IN ('vapid_public_key', 'vapid_private_key');
```
- ❌ Если пусто → **VAPID keys не настроены** (Проблема 1)
- ✅ Если есть → переходим к шагу 2

**Шаг 2: Проверить Service Worker**
```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW:', !!reg?.active);
});
```
- ❌ Если false → **Service Worker не зарегистрирован** (Проблема 2)
- ✅ Если true → переходим к шагу 3

**Шаг 3: Проверить разрешение**
```javascript
console.log('Permission:', Notification.permission);
```
- ❌ Если 'denied' → **Разрешение отклонено** (Проблема 3)
- ❌ Если 'default' → **Разрешение не запрошено**
- ✅ Если 'granted' → переходим к шагу 4

**Шаг 4: Проверить платформу**
```javascript
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isPWA = window.matchMedia('(display-mode: standalone)').matches;

if (isIOS && !isPWA) {
  console.log('❌ iOS Safari - Web Push NOT supported');
}
```
- ❌ Если iOS Safari (браузер) → **Платформа не поддерживается** (Проблема 4)
- ✅ Если iOS PWA или Android/Desktop → переходим к шагу 5

**Шаг 5: Проверить активную подписку**
```sql
SELECT * FROM push_subscriptions
WHERE user_id = 'USER_ID' AND is_active = true;
```
- ❌ Если пусто → **Нет активной подписки**
- ✅ Если есть → переходим к шагу 6

**Шаг 6: Проверить Database Webhooks**
```
Supabase Dashboard → Database → Webhooks
```
- ❌ Если пусто → **Webhooks не настроены** (Проблема 5)
- ✅ Если есть → переходим к шагу 7

**Шаг 7: Проверить Cron Jobs**
```
Supabase Dashboard → Database → Cron Jobs
```
- ❌ Если пусто → **Cron Jobs не настроены** (Проблема 6)
- ✅ Если есть → переходим к шагу 8

**Шаг 8: Проверить логи Edge Functions**
```
Supabase Dashboard → Edge Functions → Logs
Фильтр: push-sender, unified-notification-sender, push-realtime-trigger
```
- ❌ Если ошибки 410 → **Subscription expired** (Проблема 7)
- ❌ Если ошибки 401 → **Invalid VAPID keys** (Проблема 8)
- ❌ Если нет вызовов → **Webhooks не срабатывают**
- ✅ Если успешные вызовы → push должен работать

---

## 💡 Решения и рекомендации

### Краткосрочные решения (1-2 дня)

**1. Настроить VAPID keys** (КРИТИЧНО)
```sql
-- Проверить наличие
SELECT * FROM admin_settings WHERE key LIKE 'vapid%';

-- Если нет → сгенерировать в админ-панели
-- Или вручную через SQL
```

**2. Проверить Database Webhooks**
```
Supabase Dashboard → Database → Webhooks
Должно быть 2 webhook:
- push_on_entry_insert
- push_on_summary_insert
```

**3. Проверить Cron Jobs**
```
Supabase Dashboard → Database → Cron Jobs
Должно быть 3 jobs:
- daily_push_reminder
- weekly_push_motivation
- goal_push_reminder
```

**4. Добавить логирование в Edge Functions**
```typescript
console.log('[PUSH] Sending to user:', userId);
console.log('[PUSH] Subscriptions found:', subscriptions.length);
console.log('[PUSH] Response status:', response.status);
```

**5. Тестировать на разных платформах**
- ✅ Desktop Chrome (должно работать)
- ✅ Android Chrome (должно работать)
- ✅ iOS PWA (должно работать с iOS 16.4+)
- ❌ iOS Safari браузер (НЕ поддерживается)

---

### Среднесрочные решения (1 неделя)

**1. Добавить push для новых карточек**
```typescript
// В push-realtime-trigger после создания entry_summary
await sendPushNotification(
  userId,
  '🎯 У вас новые AI инсайты!',
  'Откройте приложение чтобы увидеть анализ'
);
```

**2. Улучшить UI для подписки**
- Показывать статус подписки (активна/неактивна)
- Показывать инструкции для каждой платформы
- Добавить кнопку "Проверить подписку"

**3. Автоматическое удаление expired subscriptions**
```typescript
// В push-sender при 410 Gone
if (response.status === 410) {
  await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', subscription.endpoint);
}
```

**4. Добавить мониторинг**
```sql
-- Таблица для отслеживания ошибок
CREATE TABLE push_errors (
  id UUID PRIMARY KEY,
  user_id UUID,
  error_code INT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Долгосрочные решения (1 месяц)

**1. React Native Push Notifications**
- Использовать Expo Notifications для native push
- Platform Adapter для Web Push vs Expo Notifications
- Единый API для обеих платформ

**2. Rich Notifications**
- Добавить изображения в уведомления
- Добавить action buttons ("Открыть", "Отложить")
- Добавить inline reply

**3. Персонализация**
- AI-генерация текста уведомлений
- Адаптация времени отправки под пользователя
- A/B тестирование текстов

**4. Analytics**
- Отслеживание delivery rate
- Отслеживание click rate
- Отслеживание conversion rate

---

## 📊 Статистика и метрики

### Текущее состояние (требует проверки)

**Подписки**:
```sql
SELECT
  COUNT(*) as total_subscriptions,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) FILTER (WHERE is_active = true) as active_subscriptions
FROM push_subscriptions;
```

**Отправленные уведомления**:
```sql
SELECT
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE status = 'success') as successful,
  COUNT(*) FILTER (WHERE status = 'failed') as failed
FROM push_notifications_history
WHERE created_at > NOW() - INTERVAL '7 days';
```

**Delivery Rate**:
```sql
SELECT
  ROUND(
    COUNT(*) FILTER (WHERE status = 'success')::NUMERIC /
    COUNT(*)::NUMERIC * 100,
    2
  ) as delivery_rate_percent
FROM push_notifications_history
WHERE created_at > NOW() - INTERVAL '7 days';
```

---

## 🎯 Выводы

### Что работает ✅

1. **Архитектура** - правильная, масштабируемая
2. **Edge Functions** - написаны корректно
3. **Service Worker** - обрабатывает push события
4. **Platform Detection** - определяет поддержку платформы
5. **Fallback каналы** - Telegram, Email

### Что НЕ работает ❌

1. **VAPID keys** - возможно не настроены
2. **Database Webhooks** - возможно не созданы
3. **Cron Jobs** - возможно не запущены
4. **iOS Safari** - не поддерживается (только PWA)
5. **Push для карточек** - не реализовано

### Приоритеты исправления

**P0 (КРИТИЧНО - исправить НЕМЕДЛЕННО)**:
1. Проверить и настроить VAPID keys
2. Проверить Database Webhooks
3. Проверить Cron Jobs

**P1 (ВАЖНО - исправить на этой неделе)**:
4. Добавить push для новых карточек
5. Улучшить UI для подписки
6. Добавить логирование

**P2 (МОЖНО ОТЛОЖИТЬ)**:
7. React Native push
8. Rich notifications
9. Analytics

---

**Документ создан**: 2025-11-15
**Автор**: AI Assistant (Augment Agent)
**Версия**: 1.0


