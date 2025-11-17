# 📱 Push Notifications - Правильная архитектура UNITY-v2

**Дата**: 2025-11-17
**Версия**: 2.0 (после исправлений)
**Статус**: ✅ Production Ready

---

## 🎯 Основные принципы

### Правило #1: Push ТОЛЬКО когда пользователь НЕ в приложении

**❌ НЕПРАВИЛЬНО**:
- Отправлять push когда пользователь САМ создал запись
- Отправлять push когда пользователь видит результат в UI
- Отправлять push для подтверждения действий

**✅ ПРАВИЛЬНО**:
- Отправлять push для НАПОМИНАНИЯ сделать запись
- Отправлять push для МОТИВАЦИИ продолжать
- Отправлять push для ИНФОРМИРОВАНИЯ о достижениях

### Правило #2: Всегда проверять настройки пользователя

**Каждый push ДОЛЖЕН**:
1. Проверить `notification_settings.{type}` перед отправкой
2. Уважать выбор пользователя (если выключено → НЕ отправлять)
3. Учитывать timezone пользователя
4. Учитывать предпочтения по времени (morning/evening)

### Правило #3: Персонализация и релевантность

**Каждый push ДОЛЖЕН**:
1. Содержать реальные данные пользователя (статистика, streak, категории)
2. Быть релевантным текущему состоянию (есть записи → отчет, нет записей → мотивация)
3. Иметь понятный call-to-action (url для перехода)

---

## 📊 Типы push уведомлений

### 1. Ежедневные напоминания (`daily_reminder`)

**Цель**: Напомнить пользователю сделать запись

**Когда отправляется**:
- Каждый день в выбранное время (08:00 или 21:00)
- Через Cron Job (каждый час проверяет timezone)

**Проверка настроек**:
```typescript
if (!profile.notification_settings.dailyReminder) {
  return; // НЕ отправлять
}
```

**Пример текста**:
- Заголовок: "📝 Время для записи!"
- Текст: "Поделитесь своими мыслями сегодня"
- URL: `/?action=new`

**Реализация**: ✅ `push-scheduled/index.ts` → `sendDailyReminder()`

---

### 2. Еженедельные отчеты (`weekly_report`)

**Цель**: Показать статистику за неделю

**Когда отправляется**:
- Каждое воскресенье в 20:00 (по timezone пользователя)
- Через Cron Job (каждый час проверяет timezone)

**Проверка настроек**:
```typescript
if (!profile.notification_settings.weeklyReport) {
  return; // НЕ отправлять
}
```

**Расчет статистики**:
```typescript
const stats = {
  entriesCount: 7,           // Записей за неделю
  currentStreak: 5,          // Дней подряд
  topCategory: 'Работа',     // Топ категория
  topCategoryCount: 3,       // Количество записей в топ категории
  sentimentCounts: {         // Распределение настроений
    positive: 4,
    neutral: 2,
    negative: 1
  }
};
```

**Пример текста**:
- Заголовок: "📊 Ваш недельный отчет готов!"
- Текст: "7 записей • 5 дней подряд • Топ категория: Работа"
- URL: `/?view=reports`

**Реализация**: ✅ `push-scheduled/index.ts` → `sendWeeklyReport()`

---

### 3. Уведомления о достижениях (`achievement_unlocked`)

**Цель**: Поздравить с достижением

**Когда отправляется**:
- При получении нового достижения (INSERT в таблицу `achievements`)
- Через Database Trigger → Edge Function

**Проверка настроек**:
```typescript
if (!profile.notification_settings.achievements) {
  return; // НЕ отправлять
}
```

**Пример текста**:
- Заголовок: "🎉 Новое достижение!"
- Текст: "Поздравляем! Вы достигли: 7 дней подряд"
- URL: `/?view=achievements&achievement={id}`

**Реализация**: ✅ `push-realtime-trigger/index.ts` → `handleAchievementInsert()`

---

### 4. Мотивационные сообщения (`motivational`)

**Цель**: Мотивировать пользователя продолжать

**Когда отправляется**:
- 2-3 раза в неделю (понедельник, среда, пятница в 10:00)
- Через Cron Job

**Проверка настроек**:
```typescript
if (!profile.notification_settings.motivational) {
  return; // НЕ отправлять
}
```

**Пример текста**:
- Заголовок: "💪 Вы на правильном пути!"
- Текст: "Продолжайте в том же духе. Каждая запись - это шаг к лучшей версии себя."
- URL: `/?view=motivation`

**Реализация**: ✅ `push-scheduled/index.ts` → `sendWeeklyMotivation()`


---

## 🏗️ Архитектура системы

### Компоненты

```
┌─────────────────────────────────────────────────────────────┐
│                     UNITY-v2 PWA                            │
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │ Service Worker   │◄────────┤ Push Adapter     │        │
│  │ (Web Push API)   │         │ (pushAdapter.ts) │        │
│  └──────────────────┘         └──────────────────┘        │
│           ▲                            │                    │
│           │                            │                    │
│           │ Push Event                 │ Subscribe          │
│           │                            ▼                    │
│  ┌────────┴────────────────────────────────────────┐       │
│  │         Supabase push_subscriptions             │       │
│  └─────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                          ▲
                          │
                          │ HTTP POST (Web Push Protocol)
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                  Supabase Edge Functions                    │
│                                                             │
│  ┌──────────────────────┐    ┌──────────────────────┐     │
│  │ push-scheduled       │    │ push-realtime-trigger│     │
│  │ (Cron Jobs)          │    │ (Database Triggers)  │     │
│  │                      │    │                      │     │
│  │ • daily_reminder     │    │ • achievement_unlock │     │
│  │ • weekly_report      │    │ • streak_milestone   │     │
│  │ • weekly_motivation  │    │                      │     │
│  │ • goal_reminder      │    │                      │     │
│  └──────────────────────┘    └──────────────────────┘     │
│           │                            ▲                    │
│           │                            │                    │
│           │                            │ Webhook            │
│           ▼                            │                    │
│  ┌────────────────────────────────────┴──────────────┐     │
│  │      unified-notification-sender                  │     │
│  │      (Centralized notification service)           │     │
│  └───────────────────────────────────────────────────┘     │
│           │                                                 │
│           ▼                                                 │
│  ┌───────────────────────────────────────────────────┐     │
│  │      push-sender (Web Push API)                   │     │
│  └───────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Workflow: Scheduled Push (Ежедневные напоминания)

```
1. Cron Job (каждый час)
   ↓
2. push-scheduled Edge Function
   ↓
3. Получить пользователей для текущего часа
   - Проверить timezone
   - Проверить notification_settings.dailyReminder
   - Проверить selectedTime (morning/evening)
   ↓
4. Для каждого пользователя:
   - Получить шаблон из БД
   - Заменить переменные
   - Отправить через unified-notification-sender
   ↓
5. unified-notification-sender
   ↓
6. push-sender (Web Push API)
   ↓
7. Service Worker получает push
   ↓
8. Показать уведомление пользователю
```

### Workflow: Event-Based Push (Достижения)

```
1. Пользователь получает достижение
   ↓
2. INSERT в таблицу achievements
   ↓
3. Database Trigger срабатывает
   ↓
4. Webhook → push-realtime-trigger Edge Function
   ↓
5. Проверить notification_settings.achievements
   ↓
6. Если включено:
   - Получить данные достижения
   - Сформировать текст
   - Отправить через unified-notification-sender
   ↓
7. unified-notification-sender
   ↓
8. push-sender (Web Push API)
   ↓
9. Service Worker получает push
   ↓
10. Показать уведомление пользователю
```

---

## 📝 Примеры кода

### Проверка настроек перед отправкой

```typescript
// ✅ ПРАВИЛЬНО: Проверяем настройки
async function handleAchievementInsert(record: any) {
  const userId = record.user_id;

  // Проверяем есть ли активные subscriptions
  const subscriptions = await getUserPushSubscriptions(userId);
  if (subscriptions.length === 0) {
    return;
  }

  // ✅ Проверяем настройки уведомлений
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('notification_settings')
    .eq('id', userId)
    .single();

  if (!profile?.notification_settings?.achievements) {
    console.log('[PUSH] Achievements notifications disabled for user:', userId);
    return;
  }

  // Отправляем уведомление
  await sendPushNotification(
    userId,
    '🎉 Новое достижение!',
    `Поздравляем! Вы достигли: ${record.title}`,
    '/icon-192.png',
    {
      type: 'achievement_unlocked',
      achievement_id: record.id,
      url: `/?view=achievements&achievement=${record.id}`,
    }
  );
}
```

### Расчет статистики для еженедельного отчета

```typescript
async function calculateWeeklyStats(userId: string) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Получаем записи за неделю
  const { data: entries } = await supabaseAdmin
    .from('entries')
    .select('id, created_at, category, mood, sentiment')
    .eq('user_id', userId)
    .gte('created_at', oneWeekAgo.toISOString())
    .order('created_at', { ascending: false });

  // Подсчет записей
  const entriesCount = entries?.length || 0;

  // Подсчет категорий
  const categoryCounts: Record<string, number> = {};
  entries?.forEach((entry) => {
    if (entry.category) {
      categoryCounts[entry.category] = (categoryCounts[entry.category] || 0) + 1;
    }
  });

  // Топ категория
  const topCategory = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])[0];

  // Расчет streak (все записи пользователя)
  const { data: allEntries } = await supabaseAdmin
    .from('entries')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  let currentStreak = 0;
  // ... логика расчета streak ...

  return {
    entriesCount,
    currentStreak,
    topCategory: topCategory ? topCategory[0] : null,
    topCategoryCount: topCategory ? topCategory[1] : 0,
  };
}
```

### Персонализированный текст отчета

```typescript
async function sendWeeklyReport() {
  const userIds = await getUsersForScheduledTime('weekly_report', 'evening', false);

  const results = await Promise.all(
    userIds.map(async (userId) => {
      // Рассчитываем статистику за неделю
      const stats = await calculateWeeklyStats(userId);

      // Формируем текст отчета
      let title = '📊 Ваш недельный отчет готов!';
      let body = '';

      if (stats.entriesCount === 0) {
        body = 'На этой неделе вы не делали записей. Начните новую неделю с записи!';
      } else {
        const parts = [];
        parts.push(`${stats.entriesCount} записей`);

        if (stats.currentStreak > 0) {
          parts.push(`${stats.currentStreak} дней подряд`);
        }

        if (stats.topCategory) {
          parts.push(`Топ категория: ${stats.topCategory}`);
        }

        body = parts.join(' • ');
      }

      // Отправляем уведомление
      await sendPushNotification([userId], title, body, '/icon-192.png', {
        type: 'weekly_report',
        url: '/?view=reports',
        stats,
      });

      return { success: true, userId };
    })
  );

  const sent = results.filter((r) => r.success).length;
  return { sent, total: userIds.length };
}
```

---

## 🧪 Тестирование

### Ручное тестирование

#### 1. Тест ежедневных напоминаний

```bash
# Вызвать Edge Function напрямую
curl -X POST \
  'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?type=daily_reminder' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY'
```

**Проверить**:
- ✅ Push пришел ТОЛЬКО пользователям с `dailyReminder: true`
- ✅ Push пришел в правильное время (morning/evening)
- ✅ Текст содержит правильный призыв к действию

#### 2. Тест еженедельных отчетов

```bash
# Вызвать Edge Function напрямую
curl -X POST \
  'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?type=weekly_report' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY'
```

**Проверить**:
- ✅ Push пришел ТОЛЬКО пользователям с `weeklyReport: true`
- ✅ Текст содержит реальную статистику (записи, streak, категории)
- ✅ Если нет записей → мотивационный текст

#### 3. Тест достижений

```sql
-- Создать тестовое достижение
INSERT INTO achievements (user_id, title, description, icon, rarity)
VALUES (
  'YOUR_USER_ID',
  '7 дней подряд',
  'Вы делали записи 7 дней подряд!',
  '🔥',
  'rare'
);
```

**Проверить**:
- ✅ Push пришел ТОЛЬКО если `achievements: true`
- ✅ Текст содержит название достижения
- ✅ URL ведет на страницу достижений



#### 4. Тест мотивационных сообщений

```bash
# Вызвать Edge Function напрямую
curl -X POST \
  'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?type=weekly_motivation' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY'
```

**Проверить**:
- ✅ Push пришел ТОЛЬКО пользователям с `motivational: true`
- ✅ Текст мотивирующий и позитивный
- ✅ URL ведет на главную страницу

---

## ✅ Чеклист правильной реализации

### Перед отправкой ЛЮБОГО push

- [ ] Проверить `notification_settings.{type}` для пользователя
- [ ] Проверить есть ли активные `push_subscriptions`
- [ ] Проверить timezone пользователя (для scheduled push)
- [ ] Проверить время отправки (morning/evening для scheduled push)
- [ ] Сформировать персонализированный текст с реальными данными
- [ ] Добавить правильный URL для перехода
- [ ] Логировать результат отправки

### После реализации нового типа push

- [ ] Добавить поле в `notification_settings` (если нужно)
- [ ] Обновить UI настроек в `NotificationsSection.tsx`
- [ ] Создать шаблон в таблице `push_notification_templates`
- [ ] Добавить обработчик в Edge Function
- [ ] Написать тесты
- [ ] Обновить документацию
- [ ] Протестировать на реальных пользователях

---

## 🚀 Deployment

### 1. Деплой Edge Functions

```bash
# Деплой push-realtime-trigger
npx supabase functions deploy push-realtime-trigger --project-ref ecuwuzqlwdkkdncampnc

# Деплой push-scheduled
npx supabase functions deploy push-scheduled --project-ref ecuwuzqlwdkkdncampnc
```

### 2. Настройка Cron Jobs

В Supabase Dashboard → Edge Functions → Cron Jobs:

```sql
-- Ежедневные напоминания (каждый час)
0 * * * * https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?type=daily_reminder

-- Еженедельные отчеты (каждый час в воскресенье)
0 * * * 0 https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?type=weekly_report

-- Мотивационные сообщения (понедельник, среда, пятница в 10:00 UTC)
0 10 * * 1,3,5 https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?type=weekly_motivation
```

### 3. Проверка Database Triggers

```sql
-- Проверить что trigger активен
SELECT * FROM pg_trigger WHERE tgname = 'push_on_achievement_insert';

-- Проверить что функция существует
SELECT * FROM pg_proc WHERE proname = 'notify_achievement_unlocked';
```

---

## 📊 Мониторинг

### Метрики для отслеживания

1. **Delivery Rate** (процент доставленных push)
   - Цель: > 95%
   - Источник: `push_notifications_history.total_sent` vs `total_delivered`

2. **Open Rate** (процент открытых push)
   - Цель: > 20%
   - Источник: `push_notifications_history.total_opened` / `total_delivered`

3. **Unsubscribe Rate** (процент отписок)
   - Цель: < 5%
   - Источник: `push_subscriptions.is_active = false` / total subscriptions

4. **Error Rate** (процент ошибок отправки)
   - Цель: < 1%
   - Источник: Edge Functions logs

### Алерты

Настроить алерты в Supabase Dashboard:

- ❌ Delivery Rate < 90% → критический алерт
- ⚠️ Open Rate < 10% → предупреждение (плохой текст)
- ⚠️ Unsubscribe Rate > 10% → предупреждение (слишком много push)
- ❌ Error Rate > 5% → критический алерт

---

## 🔧 Troubleshooting

### Проблема: Push не приходят

**Возможные причины**:

1. **Настройки выключены**
   ```sql
   -- Проверить настройки пользователя
   SELECT notification_settings FROM profiles WHERE id = 'USER_ID';
   ```

2. **Нет активных подписок**
   ```sql
   -- Проверить подписки пользователя
   SELECT * FROM push_subscriptions WHERE user_id = 'USER_ID' AND is_active = true;
   ```

3. **Неправильный timezone**
   ```sql
   -- Проверить timezone пользователя
   SELECT timezone FROM profiles WHERE id = 'USER_ID';
   ```

4. **Edge Function не работает**
   ```bash
   # Проверить логи Edge Function
   npx supabase functions logs push-scheduled --project-ref ecuwuzqlwdkkdncampnc
   ```

### Проблема: Push приходят слишком часто

**Возможные причины**:

1. **Дублирующиеся Cron Jobs**
   - Проверить в Supabase Dashboard → Edge Functions → Cron Jobs
   - Удалить дубликаты

2. **Неправильная логика фильтрации**
   - Проверить `getUsersForScheduledTime()` в `push-scheduled/index.ts`
   - Убедиться что timezone проверяется правильно

### Проблема: Текст push неправильный

**Возможные причины**:

1. **Шаблон не найден**
   ```sql
   -- Проверить шаблоны
   SELECT * FROM push_notification_templates WHERE type = 'daily_reminder';
   ```

2. **Переменные не заменяются**
   - Проверить функцию `replaceVariables()` в `push-scheduled/index.ts`
   - Убедиться что переменные передаются правильно

---

## 📚 Дополнительные ресурсы

### Документация

- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Cron Jobs](https://supabase.com/docs/guides/functions/schedule-functions)

### Best Practices

- [OneSignal Web Push Best Practices](https://onesignal.com/web-push)
- [Google Web Push Notifications](https://web.dev/push-notifications-overview/)
- [Apple Push Notification Service](https://developer.apple.com/documentation/usernotifications)

---

## 🎯 Итого

### ✅ Что исправлено

1. **Удалены неправильные push**:
   - ❌ `entry_created` - пользователь САМ создал запись
   - ❌ `ai_analysis_ready` - пользователь видит результат в UI
   - ❌ `new_insights` - пользователь видит AI-карточки в UI

2. **Добавлена проверка настроек**:
   - ✅ `achievements` - проверяется перед отправкой
   - ✅ `dailyReminder` - проверяется в scheduled push
   - ✅ `weeklyReport` - проверяется в scheduled push
   - ✅ `motivational` - проверяется в scheduled push

3. **Реализованы еженедельные отчеты**:
   - ✅ Расчет реальной статистики (записи, streak, категории)
   - ✅ Персонализированный текст для каждого пользователя
   - ✅ Мотивационный текст если нет записей

### 📊 Текущее состояние

| Тип уведомления | Статус | Проверка настроек | Персонализация |
|---|---|---|---|
| `daily_reminder` | ✅ Работает | ✅ Да | ⚠️ Шаблон |
| `weekly_report` | ✅ Работает | ✅ Да | ✅ Реальная статистика |
| `achievement_unlocked` | ✅ Работает | ✅ Да | ✅ Название достижения |
| `motivational` | ✅ Работает | ✅ Да | ⚠️ Шаблон |
| ~~`entry_created`~~ | ❌ Удалено | - | - |
| ~~`ai_analysis_ready`~~ | ❌ Удалено | - | - |
| ~~`new_insights`~~ | ❌ Удалено | - | - |

### 🚀 Следующие шаги

1. **P0 (Критично)**:
   - ✅ Протестировать все типы push на реальных пользователях
   - ✅ Проверить что настройки работают правильно
   - ✅ Убедиться что push НЕ приходят при создании записи

2. **P1 (Важно)**:
   - [ ] Добавить AI персонализацию для `daily_reminder`
   - [ ] Добавить настройку частоты для `motivational`
   - [ ] Создать health-check endpoint для мониторинга

3. **P2 (Можно отложить)**:
   - [ ] Добавить A/B тестирование текстов
   - [ ] Добавить rich notifications (images, actions)
   - [ ] Добавить аналитику эффективности (open rate, click rate)

---

**Дата последнего обновления**: 2025-11-17
**Версия**: 2.0
**Автор**: Augment AI Agent


---

## ❌ Удаленные типы push (неправильные)

### 1. ~~`entry_created`~~ - УДАЛЕНО ❌

**Почему удалено**:
- Пользователь САМ создал запись
- Пользователь УЖЕ в приложении
- UI показывает успех
- Push только раздражает

**Было**: Отправлялся при каждом создании записи
**Стало**: Удалено полностью

---

### 2. ~~`ai_analysis_ready`~~ - УДАЛЕНО ❌

**Почему удалено**:
- Пользователь УЖЕ в приложении (только что создал запись)
- UI показывает окно успеха с результатом
- AI-анализ происходит в фоне
- Результат виден в UI без push

**Было**: Отправлялся при готовности AI-анализа
**Стало**: Удалено полностью

---

### 3. ~~`new_insights`~~ - УДАЛЕНО ❌

**Почему удалено**:
- Аналогично `ai_analysis_ready`
- Пользователь видит AI-карточки в UI
- Push не нужен

**Было**: Отправлялся при появлении новых AI-карточек
**Стало**: Удалено полностью

**Альтернатива**: Показывать badge/notification dot в UI

---

## 🗄️ База данных

### Таблица `push_subscriptions`

```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  browser_info JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);
```

### Таблица `profiles.notification_settings`

```json
{
  "dailyReminder": boolean,      // Ежедневные напоминания
  "weeklyReport": boolean,        // Еженедельные отчеты
  "achievements": boolean,        // Уведомления о достижениях
  "motivational": boolean,        // Мотивационные сообщения
  "morningTime": "08:00",         // Время утреннего напоминания
  "eveningTime": "21:00",         // Время вечернего напоминания
  "selectedTime": "evening"       // Выбранное время: "morning" | "evening" | "both" | "none"
}
```


