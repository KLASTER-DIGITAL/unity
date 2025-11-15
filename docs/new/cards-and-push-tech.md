
# UNITY — Техническая реализация AI-карточек и Push-уведомлений

Версия: 3.0  
Дата: 2025-11-15  
Автор: AI Assistant (на основе текущей реализации UNITY-v2)

---

## 1. Цели системы

### 1.1. Общая цель UNITY

UNITY — это не просто приложение заметок, а личный инструмент развития:

- формирование **привычек** (ежедневная фиксация, рефлексия),
- достижение **целей** и отслеживание прогресса,
- выявление **новых зон роста и талантов**, о которых пользователь ещё не подозревает,
- всё это — **без перегруза информацией**, в формате лёгких, понятных подсказок (ленивый пользователь — основной сценарий).

AI-карточки и push-уведомления — ключевой слой, который:

- мягко возвращает пользователя в приложение,
- подсказывает, на чём сфокусироваться,
- показывает прогресс и поддерживает мотивацию.

---

## 2. Система AI-карточек (Motivation / Insights Cards)

### 2.1. Архитектура (high-level)

Компоненты:

- **Frontend (PWA / Web)**  
  - `MotivationCardsSection.tsx` — рендер карточек, свайпы, загрузка из API.  
- **Edge Functions (Supabase)**  
  - `home-screen-data` — общий источник данных главного экрана (статы, лента, карточки).  
  - `motivations` — генерация карточек (логика фильтрации, шаблоны, градиенты).
  - `motivations/mark-read` — логирование просмотренных карточек.
- **Database (Supabase)**  
  - `entries` — записи пользователя (основной источник данных для карточек).  
  - `entry_summaries` (или аналог) — результаты AI-анализа записей (summary, insight, sentiment).  
  - `motivation_cards` — **лог** просмотренных карточек (какая запись была показана, когда).

Принцип: **карточки не храним как сущность**, а вычисляем динамически из записей + шаблонов. `motivation_cards` — только лог просмотренных.

### 2.2. Данные и модели

#### 2.2.1. Таблица `entries`

Минимальный набор полей, важных для карточек:

- `id` (UUID)
- `user_id` (UUID)
- `created_at` (TIMESTAMPTZ)
- `text` (TEXT) — сырая запись
- `ai_summary` (TEXT, ≤ 200 символов)
- `ai_insight` (TEXT, ≤ 200 символов)
- `sentiment` (ENUM: `positive`, `neutral`, `negative`)
- `mood` (ENUM или TEXT)
- `category` (TEXT / ENUM)
- `tags` (TEXT[] / JSONB)
- `is_achievement` (BOOLEAN) — флаг достижения, ставится AI

> AI-анализ выполняется при создании записи, с использованием **дешёвой GPT-модели**:
> - Модель: `gpt-4.1-mini` / аналог
> - Задача: summary, insight, sentiment, category, tags, is_achievement.

#### 2.2.2. Таблица `motivation_cards`

Только лог просмотренных карточек.

```sql
CREATE TABLE motivation_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  entry_id UUID REFERENCES entries(id),
  is_read BOOLEAN DEFAULT true, -- ВСЕГДА true (просмотрено)
  swipe_direction TEXT,          -- 'left' | 'right' (для аналитики)
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

> Шаблонные карточки (без `entry_id`) **не логируем** или храним c `entry_id = NULL` (опционально).

---

### 2.3. Генерация карточек (Edge Function `motivations`)

#### 2.3.1. Входные данные

- `userId` — текущий пользователь (из JWT / auth).
- Необходимые параметры:
  - временное окно (по умолчанию 24 часа),
  - язык пользователя (из `profiles.language`),
  - лимит карточек (по умолчанию 3).

#### 2.3.2. Алгоритм (обновлённая версия)

1. **Получить язык пользователя**

```ts
const userLanguage = profile.language || 'ru';
```

2. **Получить записи за последние 24 часа**

```ts
const fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

const { data: entries } = await supabase
  .from('entries')
  .select('id, created_at, ai_summary, ai_insight, text, sentiment, category, tags, is_achievement')
  .eq('user_id', userId)
  .gte('created_at', fromDate)
  .order('created_at', { ascending: false })
  .limit(20);
```

3. **Получить лог просмотренных карточек**

```ts
const { data: viewed } = await supabase
  .from('motivation_cards')
  .select('entry_id')
  .eq('user_id', userId)
  .gte('created_at', fromDate);

const viewedIds = new Set(viewed.map(v => v.entry_id));
```

4. **Отфильтровать непросмотренные записи**

```ts
const unviewedEntries = entries.filter(e => !viewedIds.has(e.id));
```

5. **Определить тип карточки для каждой записи**

На этом шаге можно использовать дешёвую модель или простую логику:

- если `is_achievement = true` → тип `celebrate`,
- если `sentiment = negative` → тип `support` / `reflect`,
- если `category` = "goals" → тип `focus`,
- fallback → `generic`.

```ts
type CardType = 'celebrate' | 'reflect' | 'focus' | 'gratitude' | 'generic';

function detectCardType(entry): CardType {
  if (entry.is_achievement) return 'celebrate';
  if (entry.sentiment === 'negative') return 'reflect';
  if (entry.category === 'goals') return 'focus';
  return 'generic';
}
```

6. **Сформировать карточки из записей**

```ts
const cardsFromEntries = unviewedEntries.slice(0, 3).map((entry, index) => ({
  id: entry.id,
  source: 'entry',
  type: detectCardType(entry),
  title: buildCardTitle(entry),       // см. ниже
  description: buildCardDescription(entry),
  sentiment: entry.sentiment || 'positive',
  created_at: entry.created_at,
}));
```

`buildCardTitle` / `buildCardDescription` — простые функции, которые используют `ai_summary` / `ai_insight` / `text`, обрезая длину. При необходимости можно подключать модель `gpt-4.1-mini` для переформулировки под выбранный `type`, но это необязательно.

7. **Если карточек < 3 → добавить шаблонные**

```ts
const MAX_CARDS = 3;
let cards = [...cardsFromEntries];

if (cards.length < MAX_CARDS) {
  const templates = getDefaultMotivations(userLanguage, { excludeTypesUsed: cards.map(c => c.type) });
  const missing = MAX_CARDS - cards.length;
  const extra = shuffleArray(templates).slice(0, missing);
  cards = [...cards, ...extra];
}
```

8. **Назначить градиенты**

```ts
cards = cards.map((card, index) => ({
  ...card,
  gradient: getGradientByIndex(index, card.sentiment, card.type),
}));
```

9. **Вернуть результат**

```ts
return new Response(
  JSON.stringify({ cards }),
  { headers: { 'Content-Type': 'application/json' } }
);
```

---

### 2.4. Шаблонные карточки

#### 2.4.1. Структура

```ts
type TemplateCard = {
  id: string;           // 'default-ru-1'
  source: 'template';
  type: CardType;
  title: string;
  description: string;
  sentiment: 'positive' | 'neutral' | 'negative';
};
```

#### 2.4.2. Хранение

- В отдельном TS-файле `motivationsTemplates.ts` или в `admin_settings` / JSON-таблице.
- Языки: минимум `ru`, `en` + остальные, которые уже есть.

#### 2.4.3. Логика выдачи

- Не логируем шаблонные карточки в `motivation_cards`, чтобы не плодить шум.
- Рандомизируем порядок, чтобы каждый день выглядел по-разному.

---

### 2.5. Отметка карточки как просмотренной

#### 2.5.1. Frontend

```ts
const handleSwipe = async (cardId: string, source: 'entry' | 'template', direction: 'left' | 'right') => {
  setCards(prev => prev.filter(c => c.id !== cardId));

  if (source === 'entry') {
    await fetch('/functions/v1/motivations/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ entry_id: cardId, direction }),
    });
  }
};
```

#### 2.5.2. Backend

```ts
// POST /motivations/mark-read
async function markCardAsRead(userId: string, entryId: string, direction: string) {
  await supabase
    .from('motivation_cards')
    .insert({
      user_id: userId,
      entry_id: entryId,
      is_read: true,
      swipe_direction: direction,
    });

  return { success: true };
}
```

---

### 2.6. AI-модели и экономия токенов

#### 2.6.1. На уровне записи (entry)

- Триггер: пользователь создал запись.
- Модель: **дешёвая** (`gpt-4.1-mini` / аналог).
- Задачи:
  - `ai_summary` (≤ 200 символов),
  - `ai_insight` (≤ 200 символов),
  - `sentiment`, `mood`,
  - `category`, `tags`,
  - `is_achievement`.

> Это происходит один раз на запись → основное место, где важно экономить.

#### 2.6.2. На уровне карточек (motivations)

- По умолчанию **НЕ дергаем модель** — используем готовые `ai_summary` / `ai_insight`.
- Для v2 (тип карточки, небольшая переформулировка) можно:
  - либо использовать простые правила (как выше),
  - либо один общий батчевый вызов мини-модели для трёх карточек.

#### 2.6.3. На уровне глубокой аналитики (неделя/месяц, PDF-книги)

- Используем более мощную модель (`gpt-4.1` / `gpt-4.1-turbo`), но реже:
  - генерация структуры PDF-книги,
  - извлечение ключевых тем, сюжетов,
  - подготовка «мета-инсайтов», из которых можно будет делать особые премиум-карточки.

---

## 3. Push-уведомления

### 3.1. Цели Push-системы

- Мягко возвращать пользователя в UNITY в **ключевые моменты**:
  - когда он что-то сделал (создал запись, достиг streak),
  - когда система подготовила новые инсайты (AI-карточки),
  - когда есть риск «забывания» (нет записей несколько дней).
- Работать на:
  - **Desktop браузеры** (Chrome, Firefox, Edge, Safari),
  - **Android браузеры** + PWA,
  - **iOS PWA** (iOS 16.4+),
  - в будущем — **React Native** (native push через Expo/Firebase).

### 3.2. Архитектура

Компоненты (уже реализованы, подтверждаем и уточняем):

- **Frontend**  
  - `pushAdapter.ts` — унифицированный API подписки.  
  - `push.web.ts` — Web Push логика.  
  - `PushSubscriptionManager.tsx` — UI настройки уведомлений.  
  - `platformDetection.ts` — определение платформы.  
  - `public/service-worker.js` — обработка `push` и `notificationclick`.

- **Supabase Edge Functions**  
  - `push-realtime-trigger` — вызывается DB webhooks (entries, entry_summaries).  
  - `push-scheduled` — вызывается cron для daily/weekly/goal.  
  - `unified-notification-sender` — выбирает канал (web_push, telegram, email).  
  - `push-sender` — низкоуровневый web push (VAPID, шифрование, отправка).

- **Database**  
  - `push_subscriptions` — подписки пользователей.  
  - `admin_settings` — хранит VAPID keys.  
  - webhooks, cron jobs.

### 3.3. Ключевые технические моменты (Web Push)

1. **VAPID ключи**  
   - Обязательны для отправки web push.
   - Хранятся в `admin_settings`:
     - `vapid_public_key`
     - `vapid_private_key`.

2. **Подписка (`subscribeToPush`)**  
   - Проверяем поддержку платформы:  
     - `ServiceWorker` + `PushManager` должны быть доступны.  
     - Для iOS — только в PWA-режиме.
   - Запрашиваем `Notification.permission`.
   - Регистрируем/ждём `serviceWorker.ready`.
   - Делаем `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vapidPublicKey })`.
   - Сохраняем subscription в `push_subscriptions`.

3. **Service Worker**  
   - Слушает `push` и показывает `showNotification`.
   - Слушает `notificationclick` и открывает нужный URL.

4. **Edge Functions**  
   - Вход: событие (entry created, summary created, cron).  
   - Находит активные подписки.  
   - Передаёт payload в `push-sender`.  
   - Обрабатывает ответы (401, 403, 404, 410); при 410 удаляет subscription.

---

### 3.4. Проблемы и доработки (техуровень)

#### 3.4.1. VAPID keys

**Проблема:** если ключей нет или они неправильные — push не работает вообще.

**Решение:**

- Ввести при запуске системы обязательный чек:  
  - при старте `unified-notification-sender` проверять наличие ключей,  
  - логгировать понятную ошибку,  
  - на UI показывать статус в админке ("Push: VAPID keys not configured").

#### 3.4.2. Webhooks и Cron Jobs

**Риск:** если они не созданы / отключены — push не будет уходить.

**Решение:**

- Вынести настройки webhooks/cron в **миграции** и `supabase/seed`.
- Добавить health-check endpoint, который:
  - проверяет наличие webhooks,
  - проверяет не устарели ли cron jobs (последний run),
  - пишет статус в лог/админку.

#### 3.4.3. iOS ограничения

**Факт:**  
- iOS Safari (браузер) не поддерживает Web Push.  
- Работает только: iOS 16.4+ + добавленное PWA на главный экран.

**Решение:**

- В `platformDetection` явно возвращать статус `ios_requires_pwa`.
- В UI показывать инструкцию:
  - как добавить на домашний экран,
  - как включить уведомления в настройках.

#### 3.4.4. Не хватает триггера «новые AI-карточки»

Сейчас push уходит:
- при создании записи,
- при готовности summary,
- по расписанию (daily/weekly/goal).

**Нужно добавить:**

- В момент создания `entry_summaries` / окончания AI-анализа, если:
  - эта запись попадает в окно последних 24 часов,
  - и пользователь ещё не открывал главную за это время,  
  отправлять push:  
  > «🎯 У вас новые AI-инсайты на сегодня».

Технически:

- На уровне `push-realtime-trigger` при событии `entry_summaries INSERT`:
  - проверить `notification_settings` пользователя,
  - проверить, не было ли уже отправлено такое уведомление за N часов (можно через `push_notifications_history`),
  - вызвать `unified-notification-sender` с типом `new_insights`.

---

### 3.5. Будущий React Native (native push)

План:

- Ввести адаптер: `PushChannel = 'web_push' | 'native_push' | 'telegram' | 'email'`.
- На backend `unified-notification-sender`:
  - смотрит, какие каналы подключены пользователю,
  - если есть RN токен — отправляет через `native_push` (Expo/Firebase),
  - WebPush оставляем как сейчас.

---

## 4. Связь AI-карточек и Push-системы

Кратко:

1. **Запись создана → push "Запись сохранена"**  
2. **AI-анализ готов → push "AI-анализ готов"** (опционально)  
3. **Есть новые непросмотренные карточки за последние 24 часа → push "У вас новые AI-инсайты"**  
4. **Нет активности X дней → cron → push с мягким возвращением + шаблонная карточка при заходе.**

---

## 5. Приоритеты внедрения

**P0 (срочно):**

1. Проверка/настройка VAPID keys.  
2. Проверка/создание webhooks и cron jobs.  
3. Уменьшение окна карточек до 24 часов.  

**P1 (на ближайшую итерацию):**

4. Добавить типы карточек (celebrate/reflect/focus/gratitude).  
5. Добавить push "новые инсайты" при появлении новых AI-карточек.  
6. Расширить пул шаблонных карточек + рандомизацию.  

**P2 (чуть позже):**

7. Специальные сценарии для негативного настроения и возврата после паузы.  
8. Интеграция карточек с долгосрочной аналитикой и PDF-книгами.  
9. Поддержка native push для React Native.
