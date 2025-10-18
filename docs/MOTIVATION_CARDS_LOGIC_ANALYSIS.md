# 🎯 АНАЛИЗ ЛОГИКИ МОТИВАЦИОННЫХ КАРТОЧЕК - UNITY-v2

## 📊 Общая архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                    MOTIVATION CARDS FLOW                     │
└─────────────────────────────────────────────────────────────┘

[User creates entry]
        ↓
[ChatInputSection]
        ↓
[OpenAI Analysis] (AI улучшает запись)
        ↓
[DiaryEntry saved to DB]
        ↓
[Entry converted to Card]
        ↓
[Card displayed in MotivationCards]
        ↓
[Default cards added if needed]
```

---

## 🔄 Детальный процесс

### 1️⃣ **Создание записи (ChatInputSection)**

```typescript
// Пользователь вводит текст
"Начинаю свой путь к большим достижениям! Это будет мой первый шаг."

// Отправляется на AI анализ
POST /api/chat/analyze
{
  text: "Начинаю свой путь...",
  userName: "Максим",
  userId: "uuid"
}
```

### 2️⃣ **AI Анализ (OpenAI)**

```typescript
// OpenAI возвращает:
{
  reply: "Отлично! 🚀 Это отличное начало...",
  summary: "Пользователь начинает новый проект",
  insight: "Первый шаг — это всегда самый важный",
  sentiment: "positive",
  category: "Другое",
  mood: "хорошее",
  tags: ["новое", "начало", "проект"]
}
```

### 3️⃣ **Сохранение в БД (entries table)**

```typescript
// Сохраняется в таблицу entries
{
  id: "uuid",
  user_id: "uuid",
  text: "Начинаю свой путь...",
  ai_summary: "Пользователь начинает новый проект",
  ai_insight: "Первый шаг — это всегда самый важный",
  ai_reply: "Отлично! 🚀 Это отличное начало...",
  sentiment: "positive",
  category: "Другое",
  mood: "хорошее",
  created_at: "2025-10-16T..."
}
```

### 4️⃣ **Загрузка карточек (getMotivationCards)**

```typescript
// Backend: GET /motivations/cards/:userId

// 1. Получить записи за последние 48 часов
SELECT * FROM entries 
WHERE user_id = ? 
AND created_at >= yesterday
ORDER BY created_at DESC
LIMIT 10

// 2. Конвертировать в карточки
entries.map(entry => ({
  id: entry.id,
  date: "16 октября",
  title: entry.ai_summary,        // ← AI улучшенный текст
  description: entry.ai_insight,  // ← AI инсайт
  gradient: "from-[#FE7669] to-[#ff8969]",
  sentiment: entry.sentiment
}))

// 3. Если карточек < 3, добавить дефолтные
if (cards.length < 3) {
  cards.push(...DEFAULT_CARDS.slice(0, 3 - cards.length))
}

// 4. Вернуть максимум 3 карточки
return cards.slice(0, 3)
```

### 5️⃣ **Отображение в UI (AchievementHomeScreen)**

```typescript
// Frontend: loadEntriesAndStats()

const motivationCards = await getMotivationCards(userId)
// Результат: [
//   {
//     id: "entry-uuid",
//     date: "16 октября",
//     title: "Пользователь начинает новый проект",
//     description: "Первый шаг — это всегда самый важный",
//     gradient: "from-[#FE7669] to-[#ff8969]",
//     sentiment: "positive"
//   },
//   {
//     id: "default_1",
//     date: "Начни сегодня",
//     title: "Сегодня отличное время",
//     description: "Запиши маленькую победу...",
//     gradient: "from-[#FE7669] to-[#ff8969]",
//     isDefault: true
//   },
//   {
//     id: "default_2",
//     date: "Совет дня",
//     title: "Даже одна мысль делает день осмысленным",
//     description: "Не обязательно писать много...",
//     gradient: "from-[#ff6b9d] to-[#c471ed]",
//     isDefault: true
//   }
// ]
```

---

## 🎨 Типы карточек

### Тип 1: Карточка из записи пользователя (AI-улучшенная)

```typescript
{
  id: "entry-uuid",
  entryId: "entry-uuid",
  date: "16 октября",
  title: entry.ai_summary,        // ← AI улучшенный текст
  description: entry.ai_insight,  // ← AI инсайт
  gradient: GRADIENTS[sentiment][index],
  isMarked: false,
  isDefault: false,               // ← Это реальная запись
  sentiment: "positive",
  mood: "хорошее"
}
```

**Особенности**:
- ✅ Генерируется из реальной записи пользователя
- ✅ AI улучшает текст (summary + insight)
- ✅ Использует токены OpenAI (120 токенов на запись)
- ✅ Отображается первой в списке
- ✅ Может быть отмечена как прочитанная

### Тип 2: Дефолтная универсальная карточка

```typescript
{
  id: "default_1",
  date: "Начни сегодня",
  title: "Сегодня отличное время",
  description: "Запиши маленькую победу — это первый шаг...",
  gradient: "from-[#FE7669] to-[#ff8969]",
  isMarked: false,
  isDefault: true,                // ← Это дефолтная карточка
  sentiment: undefined
}
```

**Особенности**:
- ✅ Универсальные мотивационные карточки
- ✅ Не требуют токенов OpenAI
- ✅ Поддерживают 7 языков (ru, en, es, de, fr, zh, ja)
- ✅ Используются как fallback
- ✅ Всегда доступны

---

## 📋 Логика отображения

### Сценарий 1: Первая запись пользователя

```
Карточки: [
  ✅ Карточка 1: Первая запись (AI-улучшенная)
  ✅ Карточка 2: Дефолтная карточка #1
  ✅ Карточка 3: Дефолтная карточка #2
]
```

### Сценарий 2: 2 записи пользователя

```
Карточки: [
  ✅ Карточка 1: Запись #2 (новая)
  ✅ Карточка 2: Запись #1 (старая)
  ✅ Карточка 3: Дефолтная карточка #1
]
```

### Сценарий 3: 3+ записи пользователя

```
Карточки: [
  ✅ Карточка 1: Запись #3 (новая)
  ✅ Карточка 2: Запись #2
  ✅ Карточка 3: Запись #1 (старая)
]
```

---

## 🔑 Ключевые функции

### `entryToCard()` - Конвертация записи в карточку

```typescript
function entryToCard(entry: DiaryEntry, index: number, userLanguage: Language): AchievementCard {
  // 1. Выбрать градиент по sentiment
  const gradientList = GRADIENTS[entry.sentiment] || GRADIENTS.positive
  const gradient = gradientList[index % gradientList.length]
  
  // 2. Форматировать дату
  const dateFormatter = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' })
  
  // 3. Использовать AI улучшенный текст
  const title = entry.aiSummary || getCategoryTranslation(entry.category)
  const description = entry.aiInsight || entry.text
  
  // 4. Вернуть карточку
  return {
    id: entry.id,
    date: dateFormatter.format(entryDate),
    title,
    description,
    gradient,
    isMarked: false,
    sentiment: entry.sentiment,
    mood: entry.mood
  }
}
```

### `getMotivationCards()` - Получить карточки

```typescript
async function getMotivationCards(userId: string): Promise<MotivationCard[]> {
  // 1. Получить записи за 48 часов
  const entries = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', yesterday)
    .order('created_at', { ascending: false })
    .limit(10)
  
  // 2. Конвертировать в карточки
  const cards = entries.map((entry, index) => entryToCard(entry, index))
  
  // 3. Добавить дефолтные если нужно
  if (cards.length < 3) {
    const defaults = getDefaultMotivations(userLanguage)
    cards.push(...defaults.slice(0, 3 - cards.length))
  }
  
  // 4. Вернуть максимум 3
  return cards.slice(0, 3)
}
```

---

## 💡 Оптимизация

### Экономия токенов
- ✅ AI анализ только при создании записи (120 токенов)
- ✅ Дефолтные карточки не требуют токенов
- ✅ Кэширование результатов в KV store (24 часа)

### Производительность
- ✅ Максимум 3 карточки (не более)
- ✅ Параллельная загрузка (Promise.all)
- ✅ Lazy loading компонентов

---

## 📝 Итоговая логика

**Мотивационные карточки** - это комбинация:

1. **Реальные записи пользователя** (AI-улучшенные)
   - Первая запись → AI анализ → Карточка с summary + insight
   - Экономит время пользователя (не нужно писать много)
   - Использует токены OpenAI (120 на запись)

2. **Дефолтные универсальные карточки**
   - Мотивационные советы
   - Не требуют токенов
   - Всегда доступны как fallback

**Результат**: Пользователь видит 3 карточки:
- 1-3 реальные записи (если есть)
- Остальное - дефолтные карточки

---

**Дата создания**: 2025-10-16
**Версия**: 1.0

