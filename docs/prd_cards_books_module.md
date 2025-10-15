image.png# PRD: Cards Module и Books Module

**Версия:** 2.0  
**Дата:** Октябрь 2025  
**Статус:** В разработке  
**Аудитория:** Frontend/Backend разработчики, ML-инженер

---

## 📋 Содержание

1. Резюме
2. Архитектура системы
3. Cards Module (Мотивационные карточки)
4. Books Module (PDF Книга)
5. Token Optimization Strategy
6. API Documentation
7. Acceptance Criteria
8. Metrics

---

## 1. Резюме

Два основных модуля приложения "Дневник Достижений":

**Cards Module** - генерирует мотивационные карточки для ежедневного взаимодействия  
**Books Module** - компилирует PDF-книги с историями за период

Ключевое внимание - оптимизация токенов OpenAI на 80-95% через кэширование summary.

---

## 2. Архитектура системы

```
USER INTERACTION FLOW

[Entry Creation]
    ↓ (text input)
[ChatInputSection]
    ↓ (POST /api/chat/analyze)
[OpenAI Analysis] (120 tokens)
    ↓ (JSON: summary, insight, mood)
[DiaryEntry + EntrySummaries]
    ↓ (saved to DB)
    
    ↙ (daily)              ↘ (monthly)
    
[Cards Module]         [Books Module]
- Show 3 cards         - Compile snapshots
- KV cache (24h)       - AI generates story
- Gesture handling     - User edits draft
- Default motivations  - PDF rendering
```

### Data Models

```typescript
// DiaryEntry
{
  id: UUID,
  userId: UUID,
  text: string,
  createdAt: timestamp,
  sentiment: 'positive' | 'neutral' | 'negative',
  category: string,
  tags: string[],
  aiSummary: string (200 chars max),
  aiInsight: string (200 chars max),
  aiReply: string,
  mood: string,
  isAchievement: boolean
}

// EntrySummaries (оптимизация токенов)
{
  id: UUID,
  entryId: UUID,
  userId: UUID,
  summaryJson: {
    text: string,
    insight: string,
    mood: string,
    sentiment: string,
    contexts: string[],
    tags: string[],
    achievements: object[],
    keywords: string[],
    excerpt: string,
    confidence: number
  },
  tokensUsed: integer,
  createdAt: timestamp
}

// BooksArchive
{
  id: UUID,
  userId: UUID,
  periodStart: date,
  periodEnd: date,
  contexts: string[],
  style: string,
  layout: string,
  theme: string,
  pdfUrl: string,
  storyJson: object,
  metadata: {
    pages: number,
    images_count: number,
    wordCount: number
  },
  createdAt: timestamp
}

// StorySnapshots (для кварталов/лет)
{
  id: UUID,
  userId: UUID,
  period: string ('2025-Q3' or '2025'),
  aggregatedJson: object,
  tokensUsed: integer,
  createdAt: timestamp
}
```

---

## 3. Cards Module: Мотивационные карточки

### 3.1 User Journey

#### Onboarding Flow

```
[WELCOME SCREEN]
- Выбор языка (ru/en/es/de/fr/zh/ja)
- Сохраняется в состояние: selectedLanguage

[ONBOARDING STEP 1]
- Информация о приложении

[ONBOARDING STEP 2]
- Название дневника: "Мой дневник"
- Эмодзи: 🏆
- Сохраняется в состояние: diaryData

[ONBOARDING STEP 3]
- Настройки напоминаний (время, дни)
- Первая запись текст
- Сохраняется в состояние: notificationSettings, firstEntry

[AUTH SCREEN]
- Email, Password
- Нажимает "Зарегистрироваться"

[BACKEND: signUpWithEmail]
- Создает профиль с языком, diaryName, diaryEmoji
- Возвращает userData

[BACKEND: handleAuthComplete]
- Получает firstEntry
- POST /api/chat/analyze (firstEntry, userName, userId)
- AI возвращает: reply, summary, insight, mood, sentiment
- Сохраняет DiaryEntry + EntrySummaries
- Переход на HOME SCREEN

[HOME SCREEN: Первая загрузка]
- getMotivationCards(userId)
- Показывает 1 реальную карточку + 2 дефолтные
```

#### Regular Daily Flow

```
[HOME SCREEN OPEN]
- getMotivationCards(userId) called

[BACKEND: getMotivationCards]
1. SELECT entry_summaries WHERE:
   - userId = ?
   - createdAt >= yesterday_midnight
   - createdAt <= today_midnight + 24h

2. GET card_views:{userId} from KV (TTL 24h)
   - viewedIds = []

3. Filter: exclude viewed entries

4. Map to MotivationCard:
   - id: entryId
   - date: formatDate(createdAt)
   - title: summary.text (first 3 words)
   - description: summary.insight (full)
   - gradient: getGradient(sentiment)
   - isMarked: false

5. If available < 3:
   - ADD: getDefaultMotivations(userLanguage)
   
6. Return: first 3 cards

[FRONTEND: Display Cards]
Card Component:
┌─────────────────────────┐
│ [Gradient Background]   │
│                         │
│ [Date]: "Сегодня 14:22"│
│ [Title]: "Новый проект" │
│                         │
│ [Description]:          │
│ "Новые вызовы помогают │
│  расти профессионально"│
│                         │
│ ← свайп вправо/влево → │
└─────────────────────────┘

Gesture Handling:
- Свайп ВПРАВО (> 50px): markCardAsRead()
- Свайп ВЛЕВО (> 50px): navigate('/chat')
- Нажатие: navigate('/card-detail', cardId)

Progress dots show: • ◦ ◦ (3 cards)
```

### 3.2 UI Components

#### AchievementHomeScreen

```typescript
interface MotivationCard {
  id: string;
  entryId?: string;
  date: string;
  title: string;
  description: string;
  gradient: string;
  isMarked: boolean;
  isDefault?: boolean;
  sentiment?: string;
  mood?: string;
}

const GRADIENT_MAP = {
  positive: "from-[#FE7669] to-[#ff8969]",   // orange
  neutral: "from-[#ff6b9d] to-[#c471ed]",    // pink
  negative: "from-[#c471ed] to-[#8B78FF]"    // purple
};
```

**Layout:**
- Mobile (320px): full width, card height 280px, padding 16px
- Tablet (768px): card height 350px, max-width 600px
- Desktop (1024px): card width 500px, centered

**Components:**
```
AchievementHomeScreen
├─ Header: "🏆 Мой дневник"
├─ SwipeableCard
│  ├─ Gradient background
│  ├─ Content (date, title, description)
│  └─ Gesture handlers (touch events)
├─ ProgressDots (animated)
├─ StatisticsBar (total entries, this week)
└─ ActionButtons
   ├─ "Новая запись"
   └─ "Мои книги"
```

#### Default Motivations (мультиязычные)

```typescript
const DEFAULT_MOTIVATIONS = {
  ru: [
    {
      id: "default_1",
      date: "Начни сегодня",
      title: "Сегодня отличное время",
      description: "Запиши маленькую победу — это первый шаг к осознанию своих достижений.",
      gradient: "from-[#FE7669] to-[#ff8969]",
      isDefault: true
    },
    {
      id: "default_2",
      date: "Совет дня",
      title: "Даже одна мысль делает день осмысленным",
      description: "Не обязательно писать много — одна фраза может изменить твой взгляд на день.",
      gradient: "from-[#ff6b9d] to-[#c471ed]",
      isDefault: true
    },
    {
      id: "default_3",
      date: "Мотивация",
      title: "Запиши момент благодарности",
      description: "Почувствуй лёгкость, когда замечаешь хорошее в своей жизни. Это путь к счастью.",
      gradient: "from-[#c471ed] to-[#8B78FF]",
      isDefault: true
    }
  ],
  en: [
    {
      id: "default_1",
      date: "Start today",
      title: "Today is a great time",
      description: "Write down a small victory — it's the first step to recognizing your achievements.",
      gradient: "from-[#FE7669] to-[#ff8969]",
      isDefault: true
    },
    // ... 2 more
  ],
  // ... es, de, fr, zh, ja
};
```

### 3.3 Backend Implementation

```typescript
// GET /api/motivations/cards/{userId}
async function getMotivationCards(userId: string): Promise<MotivationCard[]> {
  try {
    // 1. Get recent entries (last 48 hours)
    const yesterday = new Date(Date.now() - 48 * 60 * 60 * 1000);
    
    const recent = await db
      .from('entry_summaries')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', yesterday)
      .order('created_at', { ascending: false })
      .limit(10);

    if (recent.error) throw recent.error;

    // 2. Get viewed cards from KV (TTL 24h)
    const viewedKey = `card_views:${userId}`;
    const viewedData = await kv.get(viewedKey);
    const viewedIds = viewedData ? JSON.parse(viewedData) : [];

    // 3. Filter and map
    const available = recent.data
      .filter(entry => !viewedIds.includes(entry.entry_id))
      .map(entry => ({
        id: entry.entry_id,
        date: formatDate(entry.created_at),
        title: entry.summary_json.text
          .split(' ')
          .slice(0, 3)
          .join(' '),
        description: entry.summary_json.insight,
        gradient: getGradient(entry.summary_json.sentiment),
        sentiment: entry.summary_json.sentiment,
        mood: entry.summary_json.mood,
        isMarked: false
      }));

    // 4. Add defaults if needed
    const userProfile = await db
      .from('profiles')
      .select('language')
      .eq('id', userId)
      .single();

    const language = userProfile.data?.language || 'ru';
    const defaults = getDefaultMotivations(language);

    if (available.length < 3) {
      return [
        ...available,
        ...defaults.slice(0, 3 - available.length)
      ];
    }

    return available.slice(0, 3);
  } catch (error) {
    console.error('Error in getMotivationCards:', error);
    throw error;
  }
}

// POST /api/motivations/mark-read
async function markCardAsRead(userId: string, cardId: string): Promise<void> {
  try {
    const viewedKey = `card_views:${userId}`;
    const viewedData = await kv.get(viewedKey);
    const viewedIds = viewedData ? JSON.parse(viewedData) : [];

    if (!viewedIds.includes(cardId)) {
      viewedIds.push(cardId);
    }

    // Save with 24-hour TTL
    await kv.setex(
      viewedKey,
      86400, // 24 hours in seconds
      JSON.stringify(viewedIds)
    );
  } catch (error) {
    console.error('Error in markCardAsRead:', error);
    throw error;
  }
}

// POST /api/chat/analyze
async function analyzeTextWithAI(
  text: string,
  userName: string,
  userId: string
): Promise<AIAnalysisResult> {
  try {
    // 1. Get user language
    const userProfile = await db
      .from('profiles')
      .select('language')
      .eq('id', userId)
      .single();

    const language = userProfile.data?.language || 'ru';

    // 2. Build localized prompt
    const systemPrompt = `Ты - мотивирующий AI-помощник в приложении "Дневник достижений".
ВАЖНО: Отвечай на языке пользователя (${language}).

Твоя задача:
1. Дать короткий воодушевляющий ответ (1-2 предложения, эмоджи приветствуются)
2. Создать краткое резюме (summary, до 200 символов)
3. Сформировать позитивный вывод/инсайт (insight, до 200 символов)
4. Определить sentiment, category, tags, confidence, mood

Отвечай ТОЛЬКО в формате JSON:
{
  "reply": "Воодушевляющий ответ",
  "summary": "Краткое резюме",
  "insight": "Позитивный вывод",
  "sentiment": "positive|neutral|negative",
  "category": "категория",
  "tags": ["теги"],
  "confidence": 0.95,
  "isAchievement": true,
  "mood": "эмоция"
}`;

    // 3. Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    // 4. Parse and return
    const analysis = JSON.parse(response.choices[0].message.content);

    return {
      reply: analysis.reply,
      summary: analysis.summary,
      insight: analysis.insight,
      sentiment: analysis.sentiment,
      category: analysis.category,
      tags: analysis.tags,
      confidence: analysis.confidence,
      isAchievement: analysis.isAchievement,
      mood: analysis.mood
    };
  } catch (error) {
    console.error('Error in analyzeTextWithAI:', error);
    throw error;
  }
}
```

### 3.4 KV Store Schema

```
Key: card_views:{userId}
Type: JSON array
Value: [entry_id_1, entry_id_2, entry_id_3, ...]
TTL: 86400 seconds (24 hours)

Lifecycle:
- Created: on first right swipe of the day
- Updated: each right swipe appends entry_id
- Deleted: automatically after 24 hours
- Purpose: prevent showing same card twice per day
```

---

## 4. Books Module: PDF Книга достижений

### 4.1 User Journey

#### Step-by-step Wizard

```
[BOOKS LIBRARY SCREEN]
├─ List of archived books
├─ Card: "Сентябрь - Ноябрь 2025, 24 стр"
└─ Button: "+ Создать новую книгу"

[STEP 1: SELECT PERIOD]
┌─────────────────────┐
│ Выберите период     │
├─────────────────────┤
│ Presets:            │
│ [Месяц]             │
│ [Квартал]           │
│ [Год]               │
│ [Произвольный]      │
│                     │
│ Custom dates:       │
│ From: [1 окт]       │
│ To: [31 окт]        │
│                     │
│ [Далее]             │
└─────────────────────┘

[STEP 2: SELECT CONTEXTS]
┌─────────────────────┐
│ Кто это о?          │
├─────────────────────┤
│ ☑ Я сам            │
│ ☑ Карина           │
│ ☐ Арина            │
│ ☑ Анна             │
│ ☑ Семья            │
│                     │
│ Темы:               │
│ [спорт] [работа]  │
│                     │
│ [Далее]             │
└─────────────────────┘

[STEP 3: CHOOSE STYLE]
┌─────────────────────┐
│ Стиль рассказа      │
├─────────────────────┤
│ ◉ Теплый семейный  │
│ ○ Биографический   │
│ ○ Мотивационный    │
│                     │
│ Макет:              │
│ ◉ Фото + текст      │
│ ○ Только текст      │
│ ○ Минимальный      │
│                     │
│ Тема:               │
│ ◉ Светлая           │
│ ○ Темная           │
│                     │
│ [Генерировать PDF] │
└─────────────────────┘

[LOADING]
├─ 30% - Сбор данных...
├─ 60% - AI генерирует текст...
└─ 100% - Готово!

[DRAFT EDITOR]
```

#### Draft Editor Screen

```
┌─────────────────────────────────┐
│ 📕 "Мой квартал побед"         │
│ Сентябрь – Ноябрь 2025        │
├─────────────────────────────────┤
│                                 │
│ [Edit Cover] [Edit Title]       │
│                                 │
│ ▼ PROLOGUE                      │
│   "Три месяца, наполненные..."│
│   [Edit] [Delete]               │
│                                 │
│ ▼ CHAPTER: КАРИНА              │
│   Text content...              │
│   [Add Photo] [Edit] [Delete]  │
│                                 │
│ ▼ CHAPTER: АРИНА               │
│ ▼ CHAPTER: НАША СЕМЬЯ          │
│                                 │
│ ▼ STATISTICS                    │
│   📊 Mood chart                │
│   📈 Activity graph            │
│   📸 Photo collage             │
│                                 │
│ ▼ EPILOGUE                      │
│   "Спасибо за этот месяц..."  │
│                                 │
│ [Save Draft] [← Back] [PDF →]  │
└─────────────────────────────────┘

Features:
- Inline text editing (double-click)
- Drag-to-reorder chapters
- Add/remove photos
- Color theme picker
- Auto-save to localStorage
```

### 4.2 Backend: compile_snapshot Process

```
PIPELINE:

1. EXTRACTION
   SELECT entry_summaries WHERE
   - userId = ?
   - created_at BETWEEN period_start AND period_end
   - contexts[] && selected_contexts
   Result: array of 50-500 summaries

2. DEDUPLICATION & RANKING
   - Remove semantic duplicates
   - Rank by sentiment (positive first)
   - Rank by confidence
   Result: deduplicated array

3. AGGREGATION (if > 500 items)
   - Split by contexts (chapters)
   - Per chapter: max 500 items
   Result: aggregated JSON

4. AI COMPILATION
   Input: {
     entries: [
       { summary: "...", mood: "...", tags: [...] },
       ...
     ]
   }
   
   Prompt: "Составь связный рассказ из этих summary"
   
   Output: {
     title: "Название книги",
     prologue: "2-3 абзаца",
     chapters: [
       {
         name: "Карина",
         text: "Рассказ",
         achievements: ["Победа в теннисе"],
         quotes: ["Цитата"]
       }
     ],
     statistics: {
       total_entries: 120,
       positive_percent: 85,
       achievements_count: 25
     },
     epilogue: "Заключение"
   }

5. SAVE DRAFT
   - Insert into books_archive (draft=true)
   - Return storyJson for editing

6. RENDER PDF
   - HTML generation (template + data)
   - CSS application (selected theme)
   - Image embedding
   - PDF rendering (Puppeteer)

7. SAVE & DELIVER
   - Save PDF to S3
   - Update books_archive (pdf_url, final=true)
   - Send notifications (Email, Telegram)
```

### 4.3 API Endpoints

```
POST /api/books/generate-draft
├─ Body: { period, contexts, style, layout, theme }
├─ Process: compile_snapshot + AI generation
├─ Response: { draftId, storyJson, estimatedPages }
├─ Time: 30-45 seconds
└─ Tokens: 5,000-10,000

GET /api/books/{draftId}
├─ Get draft for editing
├─ Response: complete storyJson
└─ Time: < 500ms

POST /api/books/{draftId}/save
├─ Save edits
├─ Body: { storyJson }
└─ Time: < 100ms

POST /api/books/{draftId}/render-pdf
├─ Generate final PDF
├─ Response: { pdfUrl, pages, wordCount }
├─ Time: 20-30 seconds
└─ Process: HTML → CSS → PDF

GET /api/books/archive
├─ Get list of saved books
├─ Response: array of book metadata
└─ Time: < 500ms
```

---

## 5. Token Optimization Strategy

### 5.1 Comparison: Bad vs Good

```
SCENARIO 1: Monthly book (500 entries)

❌ WRONG WAY (EXPENSIVE):
├─ Send all 500 full texts to OpenAI
├─ Each text: ~200 tokens
├─ Total: 500 × 200 = 100,000 tokens 💸💸
└─ Cost: ~$3.00 USD

✅ RIGHT WAY (OPTIMIZED):
├─ Each entry analyzed ONCE at creation
│  └─ 500 × 150 tokens = 75,000 tokens
├─ Store summary JSON in entry_summaries
├─ For monthly book: send ONLY summaries
│  └─ 500 × 20 tokens = 10,000 tokens ✓
├─ TOTAL: 85,000 tokens
└─ Savings: 15% less than wrong way

SCENARIO 2: Quarterly book (1,500 entries)

❌ WRONG:
└─ 1,500 × 200 = 300,000 tokens 💸💸💸

✅ RIGHT:
├─ Use 3 monthly story_snapshots
├─ 3 × 5,000 tokens = 15,000 tokens ✓
└─ SAVINGS: 95% less tokens!

SCENARIO 3: Yearly book (6,000 entries)

❌ WRONG:
└─ 6,000 × 200 = 1,200,000 tokens 💸💸💸💸

✅ RIGHT:
├─ Use 4 quarterly story_snapshots
├─ 4 × 8,000 tokens = 32,000 tokens ✓
└─ SAVINGS: 97% less tokens!
```

### 5.2 Key Optimization Techniques

```
1. SINGLE PASS AI ANALYSIS
   - Each entry analyzed ONE time (at creation)
   - Result: cached in entry_summaries table
   - Reuse: for cards, books, reports

2. SUMMARY REUSE
   - summary JSON (500 chars): 20 tokens
   - vs full text (5000 chars): 200 tokens
   - 10× token reduction per entry

3. HIERARCHICAL COMPILATION
   Monthly snapshots (30 entries grouped)
        ↓
   Quarterly snapshots (3 monthlies grouped)
        ↓
   Yearly snapshots (4 quarterlies grouped)
   
   Each level: aggregated JSON (not raw text)

4. CACHING STRATEGY
   - Cache: monthly story_snapshots
   - TTL: 30 days (or until entries edited)
   - Benefits: avoid recompilation for same period

5. BATCH PROCESSING
   - Process entries in batches of 50
   - Rate limit: 3,500 RPM (OpenAI limit)
   - Backoff: exponential if rate limited
```

### 5.3 Cost Estimation

```
Model: GPT-4-turbo ($0.03 per 1K input tokens)

MONTHLY COST (1,000 users, 100 entries each):

❌ Without optimization:
├─ Cards: 0 tokens (no caching)
├─ Monthly books: 100,000 tokens/user × 1,000 = 100M tokens
└─ Monthly cost: 100M × $0.00003 = $3,000 💸

✅ With optimization:
├─ Cards: 0 tokens (cached in summary)
├─ Monthly books: 10,000 tokens/user × 1,000 = 10M tokens
└─ Monthly cost: 10M × $0.00003 = $300 ✓

SAVINGS: 90% reduction in costs!
```

---

## 6. Acceptance Criteria

### Cards Module

```
SCENARIO 1: First Launch
GIVEN: New user registers
WHEN: Opens app after onboarding
THEN:
  ✓ 3 motivation cards displayed
  ✓ 1 real card (from firstEntry) OR all 3 default
  ✓ Cards on user's language
  ✓ Load time < 2 seconds
  ✓ No errors, proper UI layout

SCENARIO 2: Right Swipe
GIVEN: Card on screen
WHEN: User swipes right > 50px
THEN:
  ✓ Card animated out to right
  ✓ Entry marked as viewed (KV)
  ✓ Next card animated in from left
  ✓ Progress dots updated
  ✓ marked entry not shown again today

SCENARIO 3: Left Swipe
GIVEN: Card on screen
WHEN: User swipes left > 50px
THEN:
  ✓ Navigate to ChatInputSection
  ✓ Ready for new entry
  ✓ After save: cards refreshed
  ✓ New entry shown as first card

SCENARIO 4: Card Detail
GIVEN: Card on screen
WHEN: User taps card
THEN:
  ✓ Navigate to CardDetailScreen
  ✓ Full entry text visible
  ✓ AI reply visible
  ✓ Tags and category visible
  ✓ Edit button functional
```

### Books Module

```
SCENARIO 1: Generate Draft
GIVEN: User selects period and contexts
WHEN: Clicks "Generate PDF"
THEN:
  ✓ Summary JSON sent to AI (not full texts)
  ✓ Compilation time < 45 seconds
  ✓ Tokens used < 10,000 for 500 entries
  ✓ Draft editor opens with content
  ✓ All chapters properly formatted

SCENARIO 2: Edit Draft
GIVEN: Draft editor open
WHEN: User edits chapter text
THEN:
  ✓ Inline editing works
  ✓ Changes saved (auto or manual)
  ✓ UI responsive (< 200ms)
  ✓ Can add/remove photos
  ✓ Can reorder chapters (drag-drop)

SCENARIO 3: Render PDF
GIVEN: Draft finalized
WHEN: User clicks "Generate PDF"
THEN:
  ✓ PDF generated < 30 seconds
  ✓ All text rendered correctly
  ✓ Photos embedded properly
  ✓ Chosen theme applied
  ✓ PDF saved to S3

SCENARIO 4: Archive Management
GIVEN: PDF generated
WHEN: User opens Books Library
THEN:
  ✓ New book in list
  ✓ Metadata displayed (dates, pages)
  ✓ Download button works
  ✓ Can share link
  ✓ Can re-edit if needed
```

---

## 7. Metrics

### Performance Targets

| Metric | Target | Critical |
|--------|--------|----------|
| Card Load | < 2 sec | 5 sec |
| Draft Generation | < 45 sec | 120 sec |
| PDF Rendering | < 30 sec | 60 sec |
| API Response | < 500ms | 2 sec |
| Home Screen Load | < 1 sec | 3 sec |

### Quality Metrics

| Metric | Target |
|--------|--------|
| AI Summary Quality | >= 4.0/5.0 (user rating) |
| PDF Visual Quality | >= 4.5/5.0 (user rating) |
| System Uptime | >= 99.5% |
| Error Rate | < 0.5% |
| Token Budget Adherence | +/- 10% of budget |