# 🤖 AI Logic — Логика работы искусственного интеллекта в UNITY

**Версия:** 1.0  
**Дата:** 29 октября 2025  
**Статус:** ✅ В Production  
**Автор:** UNITY Product Team

---

## 🎯 Цель документа

Полное понимание того, как AI интегрирован в UNITY, где и как он используется, как обрабатывает записи, и как супер-админ управляет AI-системой.

---

## 📋 Содержание

1. [Обзор AI-системы](#-обзор-ai-системы)
2. [Где используется AI](#-где-используется-ai)
3. [Процесс AI-анализа](#-процесс-ai-анализа)
4. [AI-поля в записях](#-ai-поля-в-записях)
5. [Использование AI-данных](#-использование-ai-данных)
6. [Управление AI (Супер-админ)](#-управление-ai-супер-админ)
7. [Стоимость и мониторинг](#-стоимость-и-мониторинг)
8. [Сценарии использования](#-сценарии-использования)

---

## 🌟 Обзор AI-системы

### Что такое AI в UNITY?

AI (Искусственный интеллект) в UNITY — это **GPT-4 от OpenAI**, который анализирует каждую запись пользователя и предоставляет:
- 🎯 **Мотивационные ответы** (reply)
- 📝 **Краткие резюме** (summary)
- 💡 **Глубокие инсайты** (insight)
- 😊 **Определение эмоций** (sentiment, mood)
- 🏷️ **Автоматические категории и теги** (category, tags)
- 🏆 **Флаг достижения** (isAchievement)

### Технический стек

| Компонент | Технология | Описание |
|-----------|------------|----------|
| **AI Model** | GPT-4 / GPT-4o-mini | OpenAI API |
| **Edge Function** | Supabase Functions (Deno) | `/ai-analysis` |
| **API Endpoint** | `https://[project].supabase.co/functions/v1/ai-analysis` | REST API |
| **База данных** | PostgreSQL (Supabase) | Хранение AI-полей в `entries` |
| **Мониторинг** | `openai_usage` таблица | Логирование использования |

### Принципы работы

1. **Синхронный анализ**: AI анализирует запись **ДО** сохранения в БД
2. **Персонализация**: AI знает имя пользователя и язык интерфейса
3. **Fallback strategy**: Если AI недоступен, используются значения по умолчанию
4. **Мультиязычность**: AI отвечает на языке пользователя (7 языков)
5. **Оптимизация**: temperature=0.7, max_tokens=1000

---

## 📍 Где используется AI

### 1. 🆕 При регистрации (Онбординг)

**Когда:** Пользователь вводит первую запись на 4-м экране онбординга

**Файл:** `src/utils/auth.ts`

**Процесс:**
```
Пользователь вводит текст
         ↓
AI анализирует (analyzeTextWithAI)
         ↓
Создается запись с AI-полями
         ↓
Показывается на главной странице
```

**Особенность:** Если пользователь пропускает этот шаг, первая запись создается позже на главной странице.

---

### 2. 📝 Создание записи (Главная страница)

**Когда:** Пользователь создает запись на главном экране

**Файл:** `src/features/mobile/home/components/chat-input/messageHandlers.ts`

**Процесс:**
```typescript
1. Пользователь вводит текст
2. Нажимает "Отправить"
3. handleSendMessage() вызывается
4. analyzeTextWithAI(text, userName, userId)
5. AI возвращает analysis
6. createEntry({ ...entry, ...analysis })
7. Запись сохраняется в БД с AI-полями
8. UI обновляется с AI-ответом
```

**Код:**
```typescript
const analysis = await analyzeTextWithAI(userText, userName, userId);

const entryData = {
  userId,
  text: userText,
  sentiment: analysis.sentiment,
  category: selectedCategory || analysis.category,
  tags: analysis.tags,
  aiReply: analysis.reply,
  aiSummary: analysis.summary,
  aiInsight: analysis.insight,
  isAchievement: analysis.isAchievement,
  mood: analysis.mood,
  // ...
};

await createEntry(entryData);
```

---

### 3. 📴 Offline режим (Premium)

**Когда:** Пользователь создает запись без интернета

**Процесс:**
```
Offline режим активен
         ↓
Запись сохраняется ЛОКАЛЬНО (IndexedDB/SQLite)
         ↓
AI-поля = null (AI недоступен offline)
         ↓
Показывается placeholder "Инсайт появится после синхронизации"
         ↓
Интернет восстанавливается
         ↓
Запись синхронизируется на сервер
         ↓
AI анализирует запись
         ↓
AI-поля обновляются в БД
```

**Важно:** AI-анализ **НЕ доступен** в offline режиме. Анализ происходит только при синхронизации.

---

### 4. 🌐 Автоперевод интерфейса (Супер-админ)

**Когда:** Супер-админ запускает автоперевод ключей интерфейса

**Файл:** `supabase/functions/auto-translate/index.ts`

**Процесс:**
```
Админ выбирает исходный язык (ru)
         ↓
Выбирает целевые языки (en, es, de...)
         ↓
Система берет ключи из translations
         ↓
AI переводит батчами (по 10 ключей)
         ↓
Сохраняет переводы в БД
         ↓
Логирует использование OpenAI
```

**Модель:** `gpt-4o-mini` (дешевле для переводов)

**Особенность:** Используется для массового перевода 166 ключей интерфейса на 7 языков.

---

## 🔄 Процесс AI-анализа

### Архитектура

```
┌──────────────────────────────────────┐
│   Frontend (React)                   │
│   analyzeTextWithAI()                │
└──────────────┬───────────────────────┘
               │ POST /ai-analysis
               │ { text, userName, userId, userLanguage }
               ↓
┌──────────────────────────────────────┐
│   Edge Function (Supabase/Deno)      │
│   /functions/ai-analysis/index.ts    │
├──────────────────────────────────────┤
│ 1. Проверка авторизации (JWT)       │
│ 2. Получение OpenAI API key          │
│ 3. Формирование system prompt        │
│ 4. Запрос к OpenAI API               │
│ 5. Парсинг JSON ответа               │
│ 6. Логирование использования         │
│ 7. Возврат результата                │
└──────────────┬───────────────────────┘
               │ { sentiment, category, tags, reply, ... }
               ↓
┌──────────────────────────────────────┐
│   OpenAI API (GPT-4)                 │
│   https://api.openai.com/v1/...      │
└──────────────────────────────────────┘
```

### Детальный процесс

#### Шаг 1: Запрос от клиента

**Файл:** `src/shared/lib/api/services/ai-analysis.ts`

```typescript
export async function analyzeTextWithAI(
  text: string,
  userName?: string,
  userId?: string
): Promise<AIAnalysisResult>
```

**Payload:**
```json
{
  "text": "Сегодня закрыл крупную сделку на работе!",
  "userName": "Дмитрий",
  "userId": "uuid-123",
  "userLanguage": "ru"
}
```

**Заголовки:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

---

#### Шаг 2: Edge Function обрабатывает запрос

**Файл:** `supabase/functions/ai-analysis/index.ts`

**2.1. Проверка авторизации**

```typescript
const authHeader = req.headers.get('Authorization');
const accessToken = authHeader.replace('Bearer ', '');

const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
if (error || !user) {
  return Response(401, 'Invalid access token');
}
```

**2.2. Получение OpenAI API ключа**

Приоритет получения ключа:
1. **Header** `X-OpenAI-Key` (для админ-панели)
2. **База данных** `admin_settings.openai_api_key`
3. **Environment** `OPENAI_API_KEY`

```typescript
let openaiApiKey = req.headers.get('X-OpenAI-Key');

if (!openaiApiKey) {
  const { data } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', 'openai_api_key')
    .single();
  
  openaiApiKey = data?.value || Deno.env.get('OPENAI_API_KEY');
}
```

**2.3. Формирование system prompt**

```typescript
const systemPrompt = `
Ты - AI-ассистент для дневника достижений.
Твоя задача - анализировать записи пользователей и предоставлять мотивационные ответы.

Пользователь: ${userName || 'Пользователь'}
Язык: ${userLanguage || 'ru'}

Проанализируй запись и верни JSON с полями:
- sentiment: "positive", "neutral", "negative"
- category: одна из категорий (семья, работа, финансы, благодарность, здоровье, личное развитие, творчество, отношения, другое)
- tags: массив тегов (максимум 5)
- reply: мотивационный ответ (2-3 предложения)
- summary: краткое резюме (1 предложение, до 200 символов)
- insight: глубокое понимание или совет (до 200 символов)
- isAchievement: true/false (является ли это достижением)
- mood: описание настроения пользователя

Отвечай на языке пользователя: ${userLanguage || 'ru'}
`;
```

---

#### Шаг 3: Запрос к OpenAI API

**Модель:** `gpt-4` (или `gpt-4o-mini` для переводов)

```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${openaiApiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text }
    ],
    temperature: 0.7,
    max_tokens: 1000
  })
});
```

**Параметры:**
- `model`: GPT-4 (самая продвинутая модель)
- `temperature`: 0.7 (баланс креативности и точности)
- `max_tokens`: 1000 (достаточно для детального ответа)

---

#### Шаг 4: Парсинг ответа от GPT-4

**Формат ответа:**
```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1699012345,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "{\"sentiment\":\"positive\",\"category\":\"работа\",\"tags\":[\"сделка\",\"достижение\"],\"reply\":\"Отличная работа!\",\"summary\":\"Закрытие сделки\",\"insight\":\"Твой профессионализм приносит результат\",\"isAchievement\":true,\"mood\":\"гордость\"}"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 245,
    "completion_tokens": 89,
    "total_tokens": 334
  }
}
```

**Парсинг:**
```typescript
const aiResponse = response.choices[0].message.content;
const analysis = JSON.parse(aiResponse);
```

**Fallback при ошибке парсинга:**
```typescript
try {
  analysis = JSON.parse(aiResponse);
} catch (e) {
  analysis = {
    sentiment: 'neutral',
    category: 'другое',
    tags: [],
    reply: aiResponse, // Используем сырой ответ как reply
    summary: text.substring(0, 100),
    insight: '',
    isAchievement: false,
    mood: 'neutral'
  };
}
```

---

#### Шаг 5: Логирование использования

**Таблица:** `openai_usage`

```typescript
const estimatedCost = calculateCost(model, usage);

await supabase.from('openai_usage').insert({
  user_id: userId,
  operation_type: 'text_analysis',
  model: 'gpt-4',
  prompt_tokens: usage.prompt_tokens,
  completion_tokens: usage.completion_tokens,
  total_tokens: usage.total_tokens,
  estimated_cost: estimatedCost,
  metadata: {
    text_length: text.length,
    user_language: userLanguage
  },
  created_at: new Date().toISOString()
});
```

**Расчет стоимости:**
```typescript
// GPT-4 pricing (USD per 1000 tokens)
const PRICING = {
  'gpt-4': { prompt: 0.03 / 1000, completion: 0.06 / 1000 }
};

function calculateCost(model: string, usage: any): number {
  const pricing = PRICING[model];
  return (usage.prompt_tokens * pricing.prompt) + 
         (usage.completion_tokens * pricing.completion);
}
```

**Пример расчета:**
```
Prompt tokens: 245
Completion tokens: 89
Total tokens: 334

Cost = (245 * 0.00003) + (89 * 0.00006)
     = 0.00735 + 0.00534
     = 0.01269 USD
     ≈ 1.3 цента за анализ
```

---

#### Шаг 6: Возврат результата

```json
{
  "success": true,
  "analysis": {
    "sentiment": "positive",
    "category": "работа",
    "tags": ["сделка", "достижение", "карьера"],
    "reply": "Отличная работа, Дмитрий! 🎉 ...",
    "summary": "Успешное закрытие крупной сделки с повышением премии",
    "insight": "Твоя способность работать в команде...",
    "isAchievement": true,
    "mood": "гордость и мотивация"
  }
}
```

---

## 📊 AI-поля в записях

### Структура таблицы `entries`

```sql
CREATE TABLE entries (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  text TEXT NOT NULL,
  
  -- AI-поля (заполняются GPT-4)
  sentiment TEXT DEFAULT 'neutral',  -- positive/neutral/negative
  category TEXT DEFAULT 'Другое',    -- 9 категорий
  tags TEXT[] DEFAULT '{}',          -- массив тегов
  mood TEXT DEFAULT 'нормальное',    -- настроение
  ai_reply TEXT DEFAULT '',          -- мотивационный ответ
  ai_summary TEXT,                   -- краткое резюме
  ai_insight TEXT,                   -- глубокий инсайт
  is_achievement BOOLEAN DEFAULT false, -- флаг достижения
  
  -- Другие поля
  media JSONB,
  streak_day INTEGER DEFAULT 1,
  focus_area TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Описание AI-полей

| Поле | Тип | Описание | Пример | Использование |
|------|-----|----------|--------|---------------|
| **sentiment** | enum | Эмоциональная окраска | positive / neutral / negative | Статистика настроения, фильтры |
| **category** | string | Тематическая категория | работа, семья, здоровье | Группировка записей, отчеты |
| **tags** | string[] | Ключевые слова (до 5) | ["сделка", "успех"] | Поиск, облако тегов |
| **mood** | string | Описание настроения | "гордость и мотивация" | Эмоциональная аналитика |
| **ai_reply** | text | Мотивационный ответ AI | "Отличная работа! 🎉 ..." | Показывается под записью |
| **ai_summary** | text | Краткое резюме (до 200) | "Закрытие крупной сделки" | PDF-книги, превью |
| **ai_insight** | text | Глубокий вывод (до 200) | "Твой профессионализм..." | Детальный просмотр, PDF |
| **is_achievement** | boolean | Флаг достижения | true / false | Раздел "Достижения" |

---

### Категории (9 типов)

AI выбирает одну из 9 категорий:

1. **Семья** — события с близкими
2. **Работа** — карьера, проекты, сделки
3. **Финансы** — доходы, инвестиции, покупки
4. **Благодарность** — выражение благодарности
5. **Здоровье** — спорт, питание, самочувствие
6. **Личное развитие** — обучение, навыки
7. **Творчество** — хобби, искусство
8. **Отношения** — друзья, партнеры
9. **Другое** — всё остальное

---

### Sentiment (3 типа)

| Sentiment | Описание | Примеры ключевых слов |
|-----------|----------|----------------------|
| **positive** | Позитивная запись | успех, радость, достиг, получил |
| **neutral** | Нейтральная запись | день, обычный, работа, рутина |
| **negative** | Негативная запись | проблема, неудача, трудности |

---

## 💡 Использование AI-данных

### 1. 🏠 Главная страница (Home)

**Что показывается:**
- Текст записи
- AI-ответ (`ai_reply`) под записью
- Категория и теги
- Эмодзи настроения

**Пример:**
```
┌────────────────────────────────┐
│ "Закрыл крупную сделку..."     │
│ 🏷️ работа  #сделка #успех      │
│ 😊 гордость и мотивация        │
│                                │
│ 🤖 AI:                         │
│ "Отличная работа, Дмитрий! ..."│
└────────────────────────────────┘
```

---

### 2. 📖 История (Diary)

**Фильтрация по категориям:**
```sql
SELECT * FROM entries 
WHERE user_id = $1 AND category = $2
ORDER BY created_at DESC;
```

**Поиск по тегам:**
```sql
SELECT * FROM entries 
WHERE user_id = $1 
AND tags && ARRAY['работа', 'успех']
ORDER BY created_at DESC;
```

**Группировка по месяцам:**
```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as count,
  category
FROM entries
WHERE user_id = $1
GROUP BY month, category
ORDER BY month DESC;
```

---

### 3. 🏆 Достижения (Achievements)

**Выборка только достижений:**
```sql
SELECT * FROM entries
WHERE user_id = $1 
AND is_achievement = true
ORDER BY created_at DESC;
```

**Статистика достижений по категориям:**
```sql
SELECT 
  category,
  COUNT(*) as count
FROM entries
WHERE user_id = $1 AND is_achievement = true
GROUP BY category
ORDER BY count DESC;
```

**Как AI определяет достижение:**
- Sentiment = positive
- Ключевые слова: "достиг", "успех", "закончил", "получил", "победа"
- Контекст: упоминание результата, награды, признания

---

### 4. 📊 Отчеты (Reports)

**Эмоциональная статистика:**
```sql
SELECT 
  sentiment,
  COUNT(*) as count,
  ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER() * 100, 1) as percentage
FROM entries
WHERE user_id = $1
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY sentiment;
```

**Результат:**
```
sentiment  | count | percentage
-----------+-------+-----------
positive   |   35  |   74.0%
neutral    |   10  |   21.0%
negative   |    2  |    5.0%
```

**Топ категорий:**
```sql
SELECT 
  category,
  COUNT(*) as count,
  ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER() * 100, 1) as percentage
FROM entries
WHERE user_id = $1
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY category
ORDER BY count DESC
LIMIT 5;
```

---

### 5. 📄 PDF-книги (Premium)

**Использование AI-полей:**
- `ai_summary` — в оглавлении и превью
- `ai_insight` — в детальных разделах
- `category` — для группировки глав
- `sentiment` — для эмоциональной статистики

**Структура PDF:**
```
┌─────────────────────────────────┐
│ Мой дневник — Октябрь 2025      │
├─────────────────────────────────┤
│ Оглавление:                     │
│                                 │
│ Работа (15 записей)             │
│ - Закрытие крупной сделки       │ ← ai_summary
│ - Презентация проекта           │
│ ...                             │
│                                 │
│ Семья (12 записей)              │
│ - Выходные с детьми             │
│ ...                             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Глава: Работа                   │
├─────────────────────────────────┤
│ 29 октября 2025                 │
│                                 │
│ "Сегодня закрыл крупную..."     │ ← text
│                                 │
│ 💡 Инсайт:                      │
│ "Твоя способность работать..."  │ ← ai_insight
└─────────────────────────────────┘
```

---

## 👑 Управление AI (Супер-админ)

### Доступ

**URL:** `https://unity-wine.vercel.app/?view=admin`

Супер-админ управляет AI через 2 раздела:
1. **AI Analytics** (раздел 4) — аналитика использования
2. **Settings → AI** — настройки моделей и бюджета

---

### 1. AI Analytics (Аналитика)

**Раздел:** Админ-панель → AI Analytics

**Файл:** `src/features/admin/analytics/components/AIAnalyticsTab.tsx`

#### A. Quick Stats (Быстрая статистика)

```
┌──────────────────────────────────────┐
│ 🤖 AI Analytics                      │
├──────────────────────────────────────┤
│                                      │
│ За последние 30 дней:                │
│                                      │
│ 📊 Всего запросов: 15,678            │
│ 💰 Стоимость: $234.56                │
│ ⚡ Среднее время: 2.3 сек            │
│ ✅ Успешность: 99.2%                 │
└──────────────────────────────────────┘
```

**SQL-запрос:**
```sql
SELECT 
  COUNT(*) as total_requests,
  SUM(estimated_cost) as total_cost,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_response_time,
  COUNT(*) FILTER (WHERE metadata->>'status' = 'success') * 100.0 / COUNT(*) as success_rate
FROM openai_usage
WHERE created_at >= NOW() - INTERVAL '30 days';
```

---

#### B. Usage Breakdown (Разбивка по операциям)

**Типы операций:**

| Operation Type | Описание | Модель | Средняя стоимость |
|----------------|----------|--------|-------------------|
| `text_analysis` | Анализ записей пользователей | gpt-4 | $0.013 |
| `translation` | Автоперевод интерфейса | gpt-4o-mini | $0.002 |
| `summary` | Генерация резюме месяца | gpt-4 | $0.025 |

**SQL-запрос:**
```sql
SELECT 
  operation_type,
  COUNT(*) as count,
  SUM(estimated_cost) as cost,
  AVG(total_tokens) as avg_tokens
FROM openai_usage
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY operation_type
ORDER BY cost DESC;
```

---

#### C. Usage Chart (График использования)

**Данные по дням:**
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as requests,
  SUM(estimated_cost) as cost
FROM openai_usage
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date;
```

**Визуализация:**
```
Стоимость ($)
│
10 │                     ●
   │                 ●   
 5 │         ●   ●       
   │     ●               
 0 │ ●                   
   └─────────────────────→ Дни
     1   5   10  15  20
```

---

#### D. User Usage Table (Таблица пользователей)

**Топ пользователей по использованию AI:**

```
┌────────────────────────────────────────────────────┐
│ Пользователь   │ Запросов │ Токенов │ Стоимость   │
├────────────────┼──────────┼─────────┼─────────────┤
│ Дмитрий        │   234    │ 78,234  │   $3.45     │
│ Анна           │   178    │ 59,412  │   $2.67     │
│ Сергей         │   156    │ 52,104  │   $2.34     │
│ ...            │   ...    │ ...     │   ...       │
└────────────────────────────────────────────────────┘
```

**SQL-запрос:**
```sql
SELECT 
  p.name,
  p.email,
  COUNT(ou.*) as request_count,
  SUM(ou.total_tokens) as total_tokens,
  SUM(ou.estimated_cost) as total_cost
FROM openai_usage ou
JOIN profiles p ON ou.user_id = p.id
WHERE ou.created_at >= NOW() - INTERVAL '30 days'
GROUP BY p.id, p.name, p.email
ORDER BY total_cost DESC
LIMIT 50;
```

---

### 2. AI Settings (Настройки AI)

**Раздел:** Админ-панель → Settings → AI

**Файл:** `src/components/screens/admin/settings/AISettingsTab.tsx`

#### A. OpenAI API Key

```
┌──────────────────────────────────────┐
│ 🔑 OpenAI API Key                    │
├──────────────────────────────────────┤
│ Current Key: sk-proj-●●●●●●●● ✅     │
│                                      │
│ [Change API Key]                     │
│ [Test Connection]                    │
└──────────────────────────────────────┘
```

**Хранение:**
```sql
-- Приоритет 1: admin_settings
INSERT INTO admin_settings (key, value)
VALUES ('openai_api_key', 'sk-proj-...');

-- Приоритет 2: environment variable
OPENAI_API_KEY=sk-proj-...
```

---

#### B. Model Configuration (Настройка моделей)

```
┌──────────────────────────────────────┐
│ 🤖 Model Configuration               │
├──────────────────────────────────────┤
│                                      │
│ Text Analysis:                       │
│ Model: [GPT-4 ▼]                     │
│ Temperature: [0.7]                   │
│ Max Tokens: [1000]                   │
│                                      │
│ Translation:                         │
│ Model: [GPT-4o-mini ▼]               │
│ Temperature: [0.3]                   │
│ Max Tokens: [2000]                   │
│                                      │
│ [Save Settings]                      │
└──────────────────────────────────────┘
```

**Доступные модели:**

| Model | Description | Cost (per 1M tokens) | Recommended |
|-------|-------------|----------------------|-------------|
| **gpt-4** | Самая продвинутая | $30 (prompt), $60 (completion) | ✅ Text analysis |
| **gpt-4o** | Быстрая версия GPT-4 | $5 (prompt), $15 (completion) | - |
| **gpt-4o-mini** | Дешевая версия | $0.15 (prompt), $0.60 (completion) | ✅ Translation |

---

#### C. Budget Configuration (Управление бюджетом)

```
┌──────────────────────────────────────┐
│ 💰 AI Budget Management              │
├──────────────────────────────────────┤
│                                      │
│ Monthly Budget: [$500]               │
│ Current Spend: $234.56 (47%)         │
│                                      │
│ ████████████░░░░░░░░░░░              │
│                                      │
│ Alert Thresholds:                    │
│ ⚠️ Warning: 80% ($400)               │
│ 🚨 Critical: 90% ($450)              │
│                                      │
│ ☑ Auto-disable at 100%               │
│ ☑ Email notifications                │
│                                      │
│ [Update Budget]                      │
└──────────────────────────────────────┘
```

**Хранение:**
```sql
INSERT INTO admin_settings (key, value)
VALUES ('ai_budget_config', '{
  "monthly_limit": 500,
  "current_spend": 234.56,
  "alert_threshold": 0.8,
  "auto_disable": true,
  "test_mode": false
}');
```

**Логика проверки бюджета:**
```typescript
if (currentSpend >= monthlyLimit) {
  // Отключить AI
  return fallbackResponse;
}

if (currentSpend >= monthlyLimit * 0.9) {
  // Отправить alert админу
  sendAdminAlert('AI budget at 90%');
}
```

---

### 3. Действия супер-админа

| Действие | Где | Описание |
|----------|-----|----------|
| **Просмотр статистики** | AI Analytics | Запросы, стоимость, успешность |
| **Анализ по пользователям** | User Usage Table | Топ потребители AI |
| **Смена API ключа** | Settings → AI | Обновление OpenAI ключа |
| **Настройка моделей** | Settings → AI | Выбор GPT-4 / GPT-4o / GPT-4o-mini |
| **Управление бюджетом** | Settings → AI | Лимиты, alerts, auto-disable |
| **Тестирование AI** | Test Lab | Проверка работы AI на тестовых данных |
| **Запуск автоперевода** | Translations | Массовый перевод интерфейса |

---

## 💰 Стоимость и мониторинг

### Таблица `openai_usage`

```sql
CREATE TABLE openai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  operation_type TEXT NOT NULL,  -- text_analysis, translation, summary
  model TEXT NOT NULL,            -- gpt-4, gpt-4o-mini
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  estimated_cost NUMERIC(10,6),  -- в USD
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Примеры записей

#### 1. Анализ текста записи

```json
{
  "id": "uuid-123",
  "user_id": "uuid-user-1",
  "operation_type": "text_analysis",
  "model": "gpt-4",
  "prompt_tokens": 245,
  "completion_tokens": 89,
  "total_tokens": 334,
  "estimated_cost": 0.01269,
  "metadata": {
    "text_length": 156,
    "user_language": "ru",
    "category": "работа",
    "sentiment": "positive"
  },
  "created_at": "2025-10-29T10:00:00Z"
}
```

**Стоимость:** ~$0.013 (1.3 цента за анализ)

---

#### 2. Автоперевод ключей

```json
{
  "id": "uuid-456",
  "user_id": "uuid-admin-1",
  "operation_type": "translation",
  "model": "gpt-4o-mini",
  "prompt_tokens": 456,
  "completion_tokens": 398,
  "total_tokens": 854,
  "estimated_cost": 0.00131,
  "metadata": {
    "source_lang": "ru",
    "target_lang": "en",
    "keys_count": 10
  },
  "created_at": "2025-10-29T11:00:00Z"
}
```

**Стоимость:** ~$0.001 (0.1 цента за 10 ключей)

---

### Расчет стоимости

**Формула:**
```
Cost = (prompt_tokens × prompt_price) + (completion_tokens × completion_price)
```

**Цены (за 1000 токенов):**

| Model | Prompt | Completion |
|-------|--------|------------|
| gpt-4 | $0.03 | $0.06 |
| gpt-4o | $0.005 | $0.015 |
| gpt-4o-mini | $0.00015 | $0.0006 |

**Пример для GPT-4:**
```
Tokens: 245 (prompt) + 89 (completion) = 334 total

Cost = (245 × 0.00003) + (89 × 0.00006)
     = $0.00735 + $0.00534
     = $0.01269 USD
```

---

### Мониторинг в реальном времени

**SQL для текущей стоимости:**
```sql
-- Стоимость за сегодня
SELECT SUM(estimated_cost) as today_cost
FROM openai_usage
WHERE DATE(created_at) = CURRENT_DATE;

-- Стоимость за текущий месяц
SELECT SUM(estimated_cost) as month_cost
FROM openai_usage
WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE);

-- Проверка лимита
SELECT 
  SUM(estimated_cost) as current_spend,
  (SELECT value->>'monthly_limit' FROM admin_settings WHERE key = 'ai_budget_config')::numeric as limit,
  ROUND(SUM(estimated_cost) / (SELECT value->>'monthly_limit' FROM admin_settings WHERE key = 'ai_budget_config')::numeric * 100, 1) as percentage
FROM openai_usage
WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE);
```

---

## 📖 Сценарии использования

### Сценарий 1: Новый пользователь создает первую запись

**Персона:** Мария, 28 лет, впервые использует UNITY

#### Шаг 1: Регистрация

1. Мария открывает UNITY
2. Проходит онбординг:
   - Имя: "Мария"
   - Язык: Русский
3. На 4-м экране вводит первую запись:
   ```
   "Сегодня начала новый проект на работе. 
   Волнуюсь, но верю в успех!"
   ```

#### Шаг 2: AI анализирует запись

**Запрос к GPT-4:**
```
System: "Ты - AI-ассистент для дневника... Пользователь: Мария. Язык: ru"
User: "Сегодня начала новый проект на работе. Волнуюсь, но верю в успех!"
```

**Ответ GPT-4:**
```json
{
  "sentiment": "positive",
  "category": "работа",
  "tags": ["проект", "начало", "мотивация"],
  "reply": "Отличное начало, Мария! 🎉 Новый проект — это всегда волнующе, но твоя уверенность в успехе — лучшая основа для достижений. Продолжай двигаться вперёд!",
  "summary": "Начало нового рабочего проекта с позитивным настроем",
  "insight": "Твоя готовность принимать вызовы показывает твой профессиональный рост. Волнение — это нормально, оно помогает оставаться сосредоточенной.",
  "isAchievement": true,
  "mood": "волнение и уверенность"
}
```

#### Шаг 3: Запись сохраняется

```sql
INSERT INTO entries (
  user_id, text, sentiment, category, tags, mood,
  ai_reply, ai_summary, ai_insight, is_achievement
) VALUES (
  'uuid-maria',
  'Сегодня начала новый проект...',
  'positive',
  'работа',
  ARRAY['проект', 'начало', 'мотивация'],
  'волнение и уверенность',
  'Отличное начало, Мария! 🎉 ...',
  'Начало нового рабочего проекта...',
  'Твоя готовность принимать вызовы...',
  true
);
```

#### Шаг 4: Мария видит результат

```
┌────────────────────────────────────┐
│ 📝 Ваша первая запись              │
├────────────────────────────────────┤
│ "Сегодня начала новый проект..."   │
│                                    │
│ 🏷️ работа  #проект #начало         │
│ 😊 волнение и уверенность          │
│                                    │
│ ────────────────────────────────   │
│                                    │
│ 🤖 UNITY AI:                       │
│ "Отличное начало, Мария! 🎉        │
│ Новый проект — это всегда          │
│ волнующе, но твоя уверенность      │
│ в успехе — лучшая основа для       │
│ достижений..."                     │
└────────────────────────────────────┘
```

**Логирование:**
```sql
INSERT INTO openai_usage VALUES (
  'uuid-log-1',
  'uuid-maria',
  'text_analysis',
  'gpt-4',
  198,  -- prompt_tokens
  76,   -- completion_tokens
  274,  -- total_tokens
  0.011, -- cost
  '{"text_length": 84, "user_language": "ru"}'
);
```

---

### Сценарий 2: Premium пользователь работает offline

**Персона:** Дмитрий, Premium пользователь в командировке

#### День 1: Offline запись

1. Дмитрий в самолете, нет интернета
2. Создает запись:
   ```
   "Лечу на важную встречу. 
   Подготовил все документы."
   ```

**Процесс:**
```
navigator.onLine = false
         ↓
user.is_premium = true → разрешен offline
         ↓
Запись сохраняется в IndexedDB
         ↓
AI-поля = null (AI недоступен)
         ↓
Показывается placeholder:
"✨ Инсайт появится после синхронизации"
```

**IndexedDB:**
```json
{
  "id": "temp-uuid-1",
  "userId": "uuid-dmitry",
  "text": "Лечу на важную встречу...",
  "sentiment": null,
  "category": null,
  "tags": [],
  "aiReply": null,
  "aiSummary": null,
  "aiInsight": null,
  "syncStatus": "pending",
  "createdAt": "2025-10-29T08:00:00Z"
}
```

#### День 2: Интернет восстанавливается

```
navigator.onLine = true
         ↓
Автоматическая синхронизация
         ↓
Запись отправляется на сервер
         ↓
AI анализирует текст
         ↓
Запись обновляется с AI-полями
         ↓
Modal: "✅ Синхронизация завершена"
```

**AI-анализ:**
```json
{
  "sentiment": "positive",
  "category": "работа",
  "tags": ["встреча", "подготовка", "бизнес"],
  "reply": "Отлично, Дмитрий! Подготовленность — ключ к успеху.",
  "summary": "Подготовка к важной деловой встрече",
  "insight": "Твоя организованность помогает достигать целей.",
  "isAchievement": true,
  "mood": "сосредоточенность"
}
```

**Обновление в БД:**
```sql
UPDATE entries
SET 
  sentiment = 'positive',
  category = 'работа',
  tags = ARRAY['встреча', 'подготовка', 'бизнес'],
  ai_reply = 'Отлично, Дмитрий!...',
  ai_summary = 'Подготовка к важной деловой встрече',
  ai_insight = 'Твоя организованность...',
  is_achievement = true,
  mood = 'сосредоточенность'
WHERE id = 'temp-uuid-1';
```

---

### Сценарий 3: Супер-админ проверяет AI-аналитику

**Персона:** Администратор UNITY

#### Задача: Проверить расходы на AI за месяц

1. Админ открывает `/?view=admin`
2. Переходит в **AI Analytics**
3. Видит статистику:

```
┌──────────────────────────────────────┐
│ 📊 AI Usage - October 2025           │
├──────────────────────────────────────┤
│ Всего запросов: 15,678               │
│ Стоимость: $234.56 / $500 (47%)      │
│ Успешность: 99.2%                    │
│                                      │
│ ████████████░░░░░░░░░░░              │
└──────────────────────────────────────┘
```

4. Просматривает **Usage Breakdown**:

```
┌──────────────────────────────────────┐
│ 📊 Breakdown by Operation            │
├──────────────────────────────────────┤
│ text_analysis:  12,345  ($198.45)   │
│ translation:     2,100  ($28.34)     │
│ summary:         1,233  ($7.77)      │
└──────────────────────────────────────┘
```

5. Проверяет **топ пользователей**:

```
┌────────────────────────────────────────┐
│ 📊 Top Users by AI Usage               │
├────────────────────────────────────────┤
│ 1. Дмитрий    234 запроса   $3.45     │
│ 2. Анна       178 запросов  $2.67     │
│ 3. Сергей     156 запросов  $2.34     │
└────────────────────────────────────────┘
```

6. Замечает, что один пользователь использует много AI
7. Переходит в **Users Management** → открывает профиль
8. Проверяет его записи

#### Действие: Обновление бюджета

1. Переходит в **Settings → AI**
2. Видит текущий бюджет: $500
3. Обновляет на $750 (рост пользователей)
4. Нажимает **Save Settings**

**Результат:**
```sql
UPDATE admin_settings
SET value = '{"monthly_limit": 750, ...}'
WHERE key = 'ai_budget_config';
```

---

## ✅ Итог

Этот документ описывает **полную логику работы AI** в UNITY:

### Что работает сейчас

✅ **GPT-4 анализ** каждой записи  
✅ **8 AI-полей**: sentiment, category, tags, mood, reply, summary, insight, isAchievement  
✅ **Мультиязычность**: AI отвечает на 7 языках  
✅ **Offline поддержка**: AI-анализ при синхронизации  
✅ **Автоперевод**: GPT-4o-mini для массового перевода  
✅ **Супер-админ контроль**: аналитика, настройки, бюджет  
✅ **Мониторинг**: детальное логирование использования  
✅ **Стоимость**: ~$0.013 за анализ записи  

### Использование AI-данных

✅ **Главная**: AI-ответы под записями  
✅ **История**: фильтрация по категориям и тегам  
✅ **Достижения**: выборка по is_achievement  
✅ **Отчеты**: статистика по sentiment и категориям  
✅ **PDF-книги**: группировка и insights  

### Управление супер-админом

✅ **AI Analytics**: статистика использования  
✅ **AI Settings**: модели, бюджет, API ключ  
✅ **User Usage**: топ потребители AI  
✅ **Budget Management**: лимиты и alerts  

**Теперь можно планировать улучшения AI-системы на основе полного понимания текущей логики!** 🚀

