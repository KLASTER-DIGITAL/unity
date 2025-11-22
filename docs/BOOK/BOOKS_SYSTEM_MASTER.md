# 📚 Система книг UNITY — Master документ

**Версия**: 1.0  
**Дата создания**: 2025-11-22  
**Статус**: ✅ ЕДИНЫЙ ИСТОЧНИК ИСТИНЫ  
**Назначение**: Полное описание системы книг UNITY

---

## 📋 Содержание

### ЧАСТЬ 1: ПРОДУКТОВЫЕ ТРЕБОВАНИЯ (PRD)
1. [Обзор системы](#часть-1-продуктовые-требования-prd)
2. [Философия и ценности](#философия-и-ценности)
3. [Тарифы: FREE и PREMIUM](#тарифы-free-и-premium)
4. [Типы книг](#типы-книг)
5. [Мультиязычность](#мультиязычность)
6. [Персоны пользователей](#персоны-пользователей)

### ЧАСТЬ 2: АРХИТЕКТУРА
7. [Архитектура компонентов](#часть-2-архитектура)
8. [Потоки данных](#потоки-данных)
9. [База данных](#база-данных)
10. [API Endpoints](#api-endpoints)
11. [AI-пайплайны](#ai-пайплайны)
12. [PDF рендеринг](#pdf-рендеринг)

### ЧАСТЬ 3: СЦЕНАРИИ ИСПОЛЬЗОВАНИЯ
13. [Сценарии пользователей](#часть-3-сценарии-использования)
14. [Flow создания книги](#flow-создания-книги)
15. [Версионирование](#версионирование)
16. [Автоматическая генерация](#автоматическая-генерация)

### ЧАСТЬ 4: ТЕКУЩЕЕ СОСТОЯНИЕ И ПРОБЛЕМЫ
17. [Что реализовано](#часть-4-текущее-состояние-и-проблемы)
18. [Критические проблемы](#критические-проблемы)
19. [План устранения проблем](#план-устранения-проблем)

### ЧАСТЬ 5: ПЛАН РАЗВИТИЯ
20. [Roadmap](#часть-5-план-развития)
21. [Приоритеты](#приоритеты)
22. [Метрики успеха](#метрики-успеха)

---

# ЧАСТЬ 1: ПРОДУКТОВЫЕ ТРЕБОВАНИЯ (PRD)

## Обзор системы

Система книг UNITY — это **эмоциональное ядро** приложения, позволяющее пользователям превращать свои записи дневника в персонализированные PDF-книги с фотографиями, достижениями и красивым дизайном.

### Что такое Книга в UNITY

Книга — это **эмоциональная история периода жизни** пользователя (месяц / квартал / год / персональная / семейная), оформленная в виде PDF, которую можно:

- просматривать внутри приложения
- скачивать
- делиться
- хранить как семейный артефакт

Книга включает:

- важные записи
- фото
- эмоции и их динамику
- достижения
- инсайты, выводы и благодарность
- иногда намерения на следующий период

### Отличие от отчётов

- **Отчёты** = функциональная аналитика (сколько, когда, где)
- **Книги** = человеческая история (что было важно, как я рос, чем могу гордиться, что понял)

Книга — это **зеркало роста**, а не просто "сводка за месяц".

---

## Философия и ценности

### AI Style Guide

AI не пишет "сухой отчёт". Тон:

- **тёплый, поддерживающий**
- **без осуждения**
- **фокус на ресурсных моментах, благодарности**
- **принятие сложности и трудных эмоций**
- **акцент на росте**, а не на "правильности"

### Примеры стиля

❌ **Плохо**: "Вы мало делали..."  
✅ **Хорошо**: "Этот месяц был более спокойным, с меньшим количеством записей — возможно, тебе было важно проживать события в тишине, а не фиксировать их."

❌ **Плохо**: "Вы не достигли целей"  
✅ **Хорошо**: "Некоторые цели остались в процессе — это не отменяет того, что ты сделал(а) важные шаги, особенно в…"

---

## Тарифы: FREE и PREMIUM

### FREE — базовые книги без AI

**Назначение**: Дать каждому пользователю ощущение прогресса и "осязаемого результата" без затрат AI-токенов.

**Особенности**:

- ✅ НЕ используется AI для текста
- ✅ Нет глав, инсайтов, эмоционального анализа
- ✅ Книга строится из списка записей
- ✅ Базовая статистика
- ✅ Простой фото-коллаж
- ✅ Шаблонный текст
- ✅ PDF генерируется быстро (< 5 сек)

**Ограничения FREE**:

- ❌ Нельзя редактировать AI-текст (его нет)
- ❌ Нет персональных/семейных глав
- ❌ Нет AI-комментариев, выводов
- ❌ Нет автогенерации "Книги месяца" по расписанию

**FREE — это "lite-подписка на память": простой дневник в PDF-формате.**

---

### PREMIUM — полная AI-книга UNITY

**Назначение**: Создать глубокую, эмоциональную, персонализированную историю жизни, семьи и роста.

**Включает**:

- ✅ AI-анализ записей и их summary
- ✅ AI-структура книги:
  - вступление
  - главы по людям/сферам
  - блок достижений
  - эмоциональный обзор периода
  - выводы и уроки
  - намерения на будущее
- ✅ AI-цитаты (выбор фраз из записей)
- ✅ Фото-главы (фото со смыслом, а не просто коллаж)
- ✅ Индивидуальные главы: "Карина", "Арина", "Семья", "Работа/Проекты", "Внутренний мир", "Духовность"
- ✅ Редактор книги:
  - изменение текста
  - изменение структуры
  - добавление/удаление фото
  - пересоздание PDF
- ✅ Версионирование (v1 / v2 / v3, все версии хранятся отдельно)
- ✅ Автогенерация книги каждый месяц
- ✅ Приоритетная обработка

**PREMIUM книги = ключевой эмоциональный продукт UNITY.**

---

## Типы книг

### По периоду

1. **Книга месяца**
   - Период: календарный месяц или произвольные даты
   - Основной формат для регулярного использования
   - Автогенерация для Premium

2. **Книга квартала**
   - 3 месяца
   - Глубже, больше AI-аналитики, тренды

3. **Книга года**
   - 12 месяцев
   - Итоговая "Книга года" (особый формат, больше глав, больше выводов)

### По контексту

4. **Семейная книга**
   - Главы по каждому члену семьи + общая глава "Семья"

5. **Персональная книга по человеку**
   - Фильтр по записям, где фигурирует конкретный человек (например "Карина")

6. **Книга по сфере**
   - Работа, здоровье, духовность, родительство
   - В v3 можно добавить как экспериментальную опцию

---

## Мультиязычность

### Главный принцип

**Язык книги = язык профиля пользователя на момент генерации.**

- Если профиль `language = ru` → все AI-тексты и UI-элементы книги на русском
- Если профиль `language = en` → на английском
- Если `language = ka` → грузинский интерфейс книги

### Что локализуется

- Заголовки разделов: "Глава", "Chapter", "თავი"
- Статические подписи: "Достижения", "Achievements"
- Датовые форматы: "1–31 октября 2025" vs "Oct 1–31, 2025"

### Что не переводится

- Сами записи пользователя (entries)
- Summary/insights — остаются на языке, на котором человек писал
- Книга может содержать смешанные языки внутри цитат

---

## Персоны пользователей

### Persona A: «Личный дневник»
- Пользователь пишет для себя
- 10–20 записей в месяц
- Важны поддержка, осознанность, духовность
- Начинает с FREE, затем хочет глубокую историю

### Persona B: «Семейный пользователь»
- Пишет о детях, жене/муже, путешествиях
- Для него важны книги для детей и семьи
- PREMIUM обязателен для семейных глав

### Persona C: «Профессиональный пользователь»
- Записывает цели, работу, проекты
- Интересуют выводы, прогресс, рост

### Persona D: «Минималист»
- Пишет мало
- Хочет простые книги

---

# ЧАСТЬ 2: АРХИТЕКТУРА

## Архитектура компонентов

### Frontend компоненты

```
src/features/mobile/reports/components/
├── BookCreationWizard.tsx              # Главный визард создания книги (4 шага)
│   └── book-creation-wizard/
│       ├── Step1Period.tsx            # Шаг 1: Выбор периода
│       ├── Step2Contexts.tsx          # Шаг 2: Выбор категорий
│       ├── Step3Style.tsx             # Шаг 3: Выбор стиля (с превью)
│       ├── Step4Layout.tsx            # Шаг 4: Выбор макета (с превью)
│       ├── WizardNavigation.tsx       # Навигация между шагами
│       ├── utils.ts                   # Утилиты (валидация, API вызовы)
│       ├── constants.ts               # Константы
│       └── types.ts                   # TypeScript типы
│
├── BookDraftEditor.tsx                # Редактор черновика книги
│   ├── Редактирование текста (title, prologue, chapters, epilogue)
│   ├── Загрузка фото к главам
│   ├── Предпросмотр PDF (вкладка "Предпросмотр")
│   └── Создание финального PDF
│
├── BooksLibraryScreen.tsx            # Полка книг (сетка обложек)
│   ├── Фильтры (Все / Черновики / Готовые)
│   ├── Действия: Просмотр, Скачать, Редактировать, Удалить
│   └── Создание новой версии
│
├── BookCreationSuccessModal.tsx      # Модалка успеха после генерации
├── BookGenerationProgress.tsx        # Прогресс генерации (анимация)
└── BookDeleteConfirmModal.tsx        # Подтверждение удаления
```

### Backend компоненты

```
supabase/functions/
├── books-generate-draft/              # Генерация черновика книги (PREMIUM)
│   └── index.ts
│       ├── Проверка кэша черновиков
│       ├── Загрузка записей за период
│       ├── Сбор фото из записей
│       ├── Сбор достижений
│       ├── Вызов OpenAI GPT-4o-mini
│       ├── Сохранение черновика в БД
│       └── Автоматическая привязка фото к главам
│
├── books-generate-free/               # Генерация FREE книги (БЕЗ AI)
│   └── index.ts
│       ├── Сбор записей за период
│       ├── Формирование простой структуры
│       ├── Сохранение в БД
│       └── Возврат черновика
│
├── books-render-pdf/                  # Рендер и загрузка PDF
│   └── index.ts
│       ├── Прием base64 PDF от клиента
│       ├── Конвертация base64 → Uint8Array
│       ├── Загрузка в Supabase Storage
│       └── Обновление статуса книги (is_final, is_draft)
│
├── books-generate-monthly-auto/       # Автоматическая генерация (Cron)
│   └── index.ts
│       ├── Определение периода (прошлый месяц)
│       ├── Поиск Premium пользователей
│       ├── Проверка наличия книги за период
│       ├── Проверка минимума записей (5)
│       └── Вызов books-generate-draft для каждого пользователя
│
└── snapshots-generate-monthly/        # Генерация snapshots (Cron)
    └── index.ts
        ├── Агрегация данных за период
        ├── Подсчет статистики
        ├── AI-summary significant events
        └── Сохранение в monthly_snapshots
```

---

## Потоки данных

### Поток 1: Создание FREE книги

```
Пользователь → BooksLibraryScreen → BookCreationWizard
  → Выбор FREE режима
  → Edge Function: books-generate-free
    → Сбор entries (без AI)
    → Формирование простой структуры
    → Сохранение в books_archive (plan_type='free')
  → BookDraftEditor (упрощенный)
  → Создание PDF (клиент)
  → Загрузка PDF (Edge Function: books-render-pdf)
  → Книга готова
```

### Поток 2: Создание PREMIUM книги

```
Пользователь → BooksLibraryScreen → BookCreationWizard
  → 4 шага визарда (период, категории, стиль, макет)
  → Edge Function: books-generate-draft
    → Проверка кэша
    → Загрузка entry_summaries (не raw entries!)
    → Загрузка snapshot
    → Вызов AI (OpenAI GPT-4o-mini)
    → Сохранение в books_archive (plan_type='premium')
    → Автоматическая привязка фото
  → BookCreationSuccessModal
  → BookDraftEditor (полный)
    → Редактирование текста
    → Загрузка дополнительных фото
    → Предпросмотр PDF
  → Создание финального PDF
  → Загрузка PDF (Edge Function: books-render-pdf)
  → Книга готова
```

### Поток 3: Автоматическая генерация (Premium)

```
Cron (1-е число месяца, 9:00)
  → Edge Function: books-generate-monthly-auto
    → Поиск Premium пользователей
    → Для каждого:
      → Проверка наличия книги за прошлый месяц
      → Проверка минимума записей (5+)
      → Вызов books-generate-draft
        → Генерация черновика
        → Автоматическая привязка фото
      → Push-уведомление (TODO)
```

---

## База данных

### 4-уровневая архитектура данных

#### Уровень 1: RAW Entries

Таблица `entries`:

```sql
CREATE TABLE entries (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ,
  text TEXT,
  media JSONB,
  mood TEXT,
  tags TEXT[],
  person_tags TEXT[],           -- ✅ Новое: для Context Engine
  category TEXT,
  is_achievement BOOLEAN
);
```

**Использование**: Сырые данные для отображения в дневнике.

---

#### Уровень 2: AI Summary

Таблица `entry_summaries`:

```sql
CREATE TABLE entry_summaries (
  id UUID PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  short_summary TEXT,           -- 200-300 символов
  insight TEXT,                 -- Ключевой смысл
  mood TEXT,                    -- AI-определенное настроение
  topics TEXT[],                -- Массив тем
  persons TEXT[],               -- Массив людей (Карина, Арина, семья)
  has_achievement BOOLEAN,
  excerpt TEXT,                 -- Цитата из текста
  
  tokens_used INTEGER,          -- Для мониторинга затрат
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entry_id)
);

-- Индексы
CREATE INDEX idx_entry_summaries_entry_id ON entry_summaries(entry_id);
CREATE INDEX idx_entry_summaries_user_id ON entry_summaries(user_id);
```

**Особенность**: Summary создаются при создании записи → экономия AI токенов при генерации книг (90%+ экономия).

---

#### Уровень 3: Snapshots

Таблица `monthly_snapshots`:

```sql
CREATE TABLE monthly_snapshots (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Агрегаты
  total_entries INTEGER DEFAULT 0,
  active_days INTEGER DEFAULT 0,
  emotions_distribution JSONB,  -- {"joy": 15, "calm": 10, ...}
  streaks JSONB,                 -- {"current": 5, "longest": 12}
  top_topics TEXT[],             -- ["семья", "работа", "духовность"]
  top_persons TEXT[],            -- ["Карина", "Арина", "семья"]
  achievements_count INTEGER,
  
  -- AI summary
  significant_events JSONB,      -- AI-описание ключевых событий месяца
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, period_start, period_end)
);

-- Индексы
CREATE INDEX idx_snapshots_user_period ON monthly_snapshots(user_id, period_start, period_end);
```

**Назначение**: Агрегированное представление периода. AI-книга сначала "смотрит" на snapshot, а затем подмешивает нужные записи.

---

#### Уровень 4: Книги

Таблица `books_archive`:

```sql
CREATE TABLE books_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Версионирование
  parent_book_id UUID REFERENCES books_archive(id) ON DELETE SET NULL,
  version INTEGER DEFAULT 1,
  
  -- Период и фильтры
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  contexts TEXT[],                   -- Категории для фильтрации
  
  -- Тип книги
  type TEXT NOT NULL DEFAULT 'month' CHECK (type IN ('month', 'quarter', 'year', 'family', 'custom')),
  plan_type TEXT NOT NULL DEFAULT 'premium' CHECK (plan_type IN ('free', 'premium')),
  language TEXT NOT NULL DEFAULT 'ru' CHECK (language IN ('ru', 'en', 'es', 'de', 'fr', 'zh', 'ja', 'ka')),
  
  -- Настройки книги
  style TEXT NOT NULL CHECK (style IN ('warm_family', 'biographical', 'motivational')),
  layout TEXT NOT NULL CHECK (layout IN ('photo_text', 'text_only', 'minimal')),
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  
  -- Контент
  story_json JSONB NOT NULL,         -- AI-сгенерированная структура книги
  metadata JSONB,                    -- Статистика, достижения, метаданные
  
  -- PDF
  pdf_url TEXT,                      -- URL финального PDF в Storage
  
  -- Статусы
  is_draft BOOLEAN DEFAULT true,
  is_final BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_books_archive_user_id ON books_archive(user_id);
CREATE INDEX idx_books_archive_period ON books_archive(period_start, period_end);
CREATE INDEX idx_books_archive_parent ON books_archive(parent_book_id);
CREATE INDEX idx_books_archive_draft ON books_archive(user_id, is_draft);
CREATE INDEX idx_books_archive_final ON books_archive(user_id, is_final);
CREATE INDEX idx_books_archive_plan_type ON books_archive(user_id, plan_type);
CREATE INDEX idx_books_archive_user_period ON books_archive(user_id, period_start, period_end);
```

---

### Структура `story_json`

```typescript
type StoryJson = {
  title: string;                    // Название книги
  subtitle: string;                 // Подзаголовок (период)
  prologue: string;                 // Вступление (2-3 абзаца)
  chapters: Array<{
    title: string;                  // Название главы
    content: string;                // Текст главы (3-5 абзацев)
    highlights: string[];           // Ключевые моменты
    source_entry_ids: string[];     // ✅ ID записей для привязки фото
  }>;
  epilogue: string;                 // Заключение (2-3 абзаца)
  dedication?: string;              // Посвящение (опционально)
  quotes?: Array<{                  // ✅ Цитаты из записей
    text: string;
    source_entry_id: string;
  }>;
  achievements_summary?: string;     // ✅ AI-текст о достижениях
};
```

### Структура `metadata`

```typescript
type BookMetadata = {
  entriesCount: number;              // Количество записей
  achievementsCount: number;         // Количество достижений
  achievements: Array<{              // ✅ Массив достижений для главы
    id: string;
    date: string;
    category: string;
    summary: string;
  }>;
  tokensUsed?: number;               // Использовано токенов OpenAI
  estimatedCost?: number;            // Примерная стоимость
  diaryName: string;                 // Название дневника
  diaryEmoji: string;                // Emoji дневника
  pages?: number;                    // Количество страниц PDF
  wordCount?: number;                // Количество слов
  contentHash?: string;              // ✅ Хэш содержимого для кэширования
};
```

### Таблица `book_photos`

```sql
CREATE TABLE book_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books_archive(id) ON DELETE CASCADE,
  chapter_index INTEGER NOT NULL,     -- Индекс главы (0-based)
  photo_url TEXT NOT NULL,            -- URL фото в Storage
  caption TEXT,                       -- Подпись к фото
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_book_photos_book_id ON book_photos(book_id);
CREATE INDEX idx_book_photos_chapter ON book_photos(book_id, chapter_index);
```

---

## API Endpoints

### 1. POST `/books-generate-free`

**Назначение**: Генерация FREE книги без AI

**Request**:
```typescript
{
  userId: string;
  periodStart: string;              // ISO date: "2025-10-01"
  periodEnd: string;                // ISO date: "2025-10-31"
  contexts: string[];               // Категории или []
  diaryName?: string;
  diaryEmoji?: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  draftId?: string;
  storyJson?: StoryJson;
  estimatedPages?: number;
  error?: string;
}
```

**Логика**:
1. Загрузка entries (без AI)
2. Формирование простой структуры (список записей)
3. Сбор фото
4. Сохранение в books_archive (plan_type='free')

---

### 2. POST `/books-generate-draft`

**Назначение**: Генерация PREMIUM черновика книги с AI

**Request**:
```typescript
{
  userId: string;
  periodStart: string;
  periodEnd: string;
  contexts: string[];
  style: 'warm_family' | 'biographical' | 'motivational';
  layout: 'photo_text' | 'text_only' | 'minimal';
  theme: 'light' | 'dark';
  diaryName?: string;
  diaryEmoji?: string;
  regenerate?: boolean;            // Принудительная регенерация (игнорировать кэш)
}
```

**Response**:
```typescript
{
  success: boolean;
  draftId?: string;
  storyJson?: StoryJson;            // Только если cached=true
  cached?: boolean;                 // Флаг кэшированного черновика
  estimatedPages?: number;
  error?: string;
}
```

**Логика работы**:

1. **Проверка авторизации**: Верификация JWT токена
2. **Проверка кэша** (если `regenerate=false`):
   - Поиск существующего черновика с теми же параметрами + content hash
   - Если найден → возврат `{ success: true, draftId, storyJson, cached: true }`
3. **Загрузка entry_summaries** (НЕ raw entries!):
   ```sql
   SELECT short_summary, insight, mood, topics, persons, excerpt
   FROM entry_summaries
   WHERE user_id = userId
     AND created_at >= periodStart
     AND created_at <= periodEnd
   ORDER BY created_at ASC
   ```
4. **Загрузка snapshot**:
   ```sql
   SELECT * FROM monthly_snapshots
   WHERE user_id = userId
     AND period_start = periodStart
     AND period_end = periodEnd
   ```
5. **Сбор фото** из entries.media
6. **Сбор достижений**
7. **Вызов OpenAI** с динамическим выбором AI-операции:
   ```typescript
   const aiOperationId = `book_generation_${style}`;  // book_generation_warm_family
   const aiOperation = await supabase
     .from('ai_operations')
     .select('*')
     .eq('id', aiOperationId)
     .single();
   ```
8. **Сохранение черновика**:
   ```sql
   INSERT INTO books_archive (
     user_id, period_start, period_end, contexts,
     style, layout, theme, story_json, metadata,
     plan_type, is_draft, is_final
   ) VALUES (
     ..., 'premium', true, false
   )
   ```
9. **Автоматическая привязка фото** к главам через book_photos

---

### 3. PUT `/books-render-pdf/:draftId/upload`

**Назначение**: Рендер финального PDF и загрузка в Storage

**Request**:
```typescript
{
  pdfBlob: string;                  // base64 строка: "data:application/pdf;base64,..."
  pages: number;
  wordCount: number;
}
```

**Response**:
```typescript
{
  success: boolean;
  pdfUrl?: string;                 // Public URL PDF
  error?: string;
}
```

**Логика**: Конвертация base64 → Uint8Array → загрузка в Storage → обновление books_archive

---

### 4. POST `/books-generate-monthly-auto`

**Назначение**: Автоматическая генерация книг для Premium (Cron)

**Вызов**: Через pg_cron (расписание `0 9 1 * *`)

**Логика**:
1. Определение периода (прошлый месяц)
2. Поиск Premium пользователей (is_premium=true)
3. Для каждого пользователя:
   - Проверка наличия книги за период
   - Проверка минимума записей (5+)
   - Вызов books-generate-draft
   - (TODO) Отправка Push-уведомления

---

## AI-пайплайны

### AI-операции в таблице `ai_operations`

#### 1. `book_generation_warm_family`

```json
{
  "id": "book_generation_warm_family",
  "name": "Теплый семейный стиль",
  "description": "AI генерация книги в теплом семейном стиле",
  "system_prompt": "Ты создаёшь персонализированную книгу для пользователя в тёплом семейном стиле. Тон: тёплый, поддерживающий, без осуждения, фокус на ресурсных моментах и благодарности. Создай главы: Семья, Дети, Внутренний мир, Достижения.",
  "user_prompt": "На основе записей за период {{PERIOD_START}} - {{PERIOD_END}} создай книгу в формате JSON...",
  "model": "gpt-4o-mini"
}
```

#### 2. `book_generation_biographical`

```json
{
  "id": "book_generation_biographical",
  "name": "Биографический стиль",
  "description": "AI генерация книги в биографическом стиле",
  "system_prompt": "Ты создаёшь биографическую книгу. Стиль: хронологический, фактический, с акцентом на события и их последовательность.",
  "model": "gpt-4o-mini"
}
```

#### 3. `book_generation_motivational`

```json
{
  "id": "book_generation_motivational",
  "name": "Мотивационный стиль",
  "description": "AI генерация книги в мотивационном стиле",
  "system_prompt": "Ты создаёшь мотивационную книгу. Стиль: энергичный, вдохновляющий, акцент на достижениях, росте и следующих шагах.",
  "model": "gpt-4o-mini"
}
```

### Context Engine (персональные главы)

**Логика**:

1. AI получает `entry_summaries` с полем `persons: TEXT[]`
2. Анализирует, какие люди фигурируют в записях
3. Создаёт отдельную главу для каждого человека:
   - "Карина" (все записи где persons содержит "Карина")
   - "Арина" (все записи где persons содержит "Арина")
   - "Семья" (все записи где persons содержит "семья")
4. Общая глава "Внутренний мир" (записи без person_tags)

---

## PDF рендеринг

### Текущая реализация: @react-pdf/renderer

**Проблемы**:
- Клиентский рендеринг (нагрузка на браузер)
- Проблемы с Unicode (русский, грузинский)
- Нестабильность при длинных книгах

### Планируемый переход: Puppeteer

**Преимущества**:
- Серверный рендеринг (Edge Function)
- Полная поддержка Unicode
- Встроенные шрифты (Noto Sans)
- Стабильность

**Архитектура**:

```
Клиент → HTML книга → Edge Function (books-render-puppeteer)
  → Puppeteer → PDF
  → Storage
  → Обновление books_archive.pdf_url
```

**Edge Function**: `books-render-puppeteer`

```typescript
import puppeteer from 'puppeteer';

Deno.serve(async (req) => {
  const { bookId, html } = await req.json();
  
  // Запуск Puppeteer
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Загрузка HTML
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  // Генерация PDF
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true
  });
  
  await browser.close();
  
  // Загрузка в Storage
  const { data } = await supabase.storage
    .from('books')
    .upload(`${userId}/${bookId}.pdf`, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true
    });
  
  return new Response(JSON.stringify({ 
    success: true, 
    pdfUrl: data.publicUrl 
  }));
});
```

---

# ЧАСТЬ 3: СЦЕНАРИИ ИСПОЛЬЗОВАНИЯ

## Сценарий 1: Создание FREE книги

**Пользователь**: Обычный пользователь (Free tier)

**Шаги**:

1. ReportsScreen → "Открыть полку книг"
2. BooksLibraryScreen → "Создать книгу"
3. **Шаг 0: Выбор тарифа**:
   - "Создать простую книгу (FREE)"
   - "Создать AI-книгу (Premium)" → Paywall
4. Если FREE → упрощенный визард:
   - Шаг 1: Период
   - Шаг 2: Категории (опционально)
   - Готово!
5. Edge Function `books-generate-free` (без AI, < 5 сек)
6. BookDraftEditor (упрощенный):
   - Только название, фото-коллаж
   - Нет редактирования текста
7. Создание PDF
8. Книга готова

**Результат**: Простая книга-дневник в PDF без AI

---

## Сценарий 2: Создание PREMIUM книги

**Пользователь**: Premium пользователь

**Шаги**:

1. ReportsScreen → "Открыть полку книг"
2. BooksLibraryScreen → "Создать AI-книгу"
3. **Визард (4 шага)**:
   - Шаг 1: Период (с валидацией минимума записей)
   - Шаг 2: Категории (можно выбрать несколько или все)
   - Шаг 3: Стиль (с визуальным превью):
     - 🏡 Теплый семейный
     - 📖 Биографический
     - 🚀 Мотивационный
   - Шаг 4: Макет (с схематическим превью):
     - 📸 Фото + текст
     - 📝 Только текст
     - ✨ Минималистичный
4. "Создать книгу" → BookGenerationProgress (анимация)
5. Edge Function `books-generate-draft`:
   - Проверка кэша
   - Загрузка entry_summaries + snapshot
   - Вызов AI (OpenAI)
   - Автоматическая привязка фото
6. BookCreationSuccessModal (конфетти 🎉)
7. BookDraftEditor (полный):
   - Редактирование всех текстов
   - Загрузка дополнительных фото
   - Предпросмотр PDF (вкладка)
8. "Создать финальную версию" → рендер PDF
9. Edge Function `books-render-pdf` → загрузка в Storage
10. Книга готова (статус "Готово")

**Результат**: AI-книга с глубоким анализом, главами, фото

---

## Сценарий 3: Версионирование книги

**Пользователь**: Любой пользователь

**Шаги**:

1. BooksLibraryScreen → готовая книга
2. "Создать новую версию" → подтверждение
3. Система создаёт копию книги:
   ```sql
   INSERT INTO books_archive (
     ..., parent_book_id = original_id, version = 2,
     is_draft = true, is_final = false, pdf_url = null
   )
   ```
4. BookDraftEditor открывается с v2
5. Редактирование → создание нового PDF
6. На полке две книги:
   - v1 (оригинал)
   - v2 (новая версия)

**Результат**: Оригинал сохранён, новая версия создана

---

## Сценарий 4: Автоматическая генерация (Premium)

**Триггер**: Cron задача (1-е число месяца, 9:00)

**Шаги**:

1. Edge Function `books-generate-monthly-auto` запускается
2. Определяет период (прошлый месяц)
3. Находит всех Premium пользователей
4. Для каждого:
   - Проверяет наличие книги за период → пропускает если есть
   - Проверяет минимум 5 записей → пропускает если меньше
   - Вызывает `books-generate-draft` с параметрами по умолчанию:
     - contexts: [] (все категории)
     - style: 'warm_family'
     - layout: 'photo_text'
     - regenerate: true
5. Черновик создаётся автоматически
6. **(TODO)** Push-уведомление: "Твоя книга за месяц готова! 📖"
7. Пользователь открывает приложение → видит новую книгу на полке

**Результат**: Книга создана автоматически без действий пользователя

---

## Flow создания книги

### Визуальный flow

```
┌──────────────────────┐
│   ReportsScreen      │
│   "Открыть полку"    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ BooksLibraryScreen   │
│  "Создать книгу"     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Шаг 0: Выбор тарифа  │
│  ○ FREE              │
│  ○ PREMIUM           │
└──────┬───────┬───────┘
       │       │
  FREE │       │ PREMIUM
       │       │
       ▼       ▼
   ┌───────────────────────┐
   │ BookCreationWizard    │
   │  FREE: 2 шага         │
   │  PREMIUM: 4 шага      │
   └──────────┬────────────┘
              │
              ▼
   ┌───────────────────────┐
   │ Edge Function         │
   │ FREE: books-generate-  │
   │       free             │
   │ PREMIUM: books-        │
   │          generate-draft│
   └──────────┬────────────┘
              │
              ▼
   ┌───────────────────────┐
   │ BookCreationSuccess   │
   │ Modal (конфетти)      │
   └──────────┬────────────┘
              │
              ▼
   ┌───────────────────────┐
   │ BookDraftEditor       │
   │ FREE: упрощенный      │
   │ PREMIUM: полный       │
   └──────────┬────────────┘
              │
              ▼
   ┌───────────────────────┐
   │ PDF Render            │
   │ Клиент → Edge Function│
   └──────────┬────────────┘
              │
              ▼
   ┌───────────────────────┐
   │ Книга готова!         │
   │ BooksLibraryScreen    │
   └───────────────────────┘
```

---

## Версионирование

### Логика

- **parent_book_id**: UUID оригинальной книги (NULL для первой версии)
- **version**: Номер версии (1, 2, 3...)

### Структура версий

```
Book v1 (оригинал)
├── parent_book_id: NULL
├── version: 1
└── pdf_url: "https://..."

Book v2 (новая версия)
├── parent_book_id: "uuid-v1"
├── version: 2
└── pdf_url: "https://..." (новый PDF)

Book v3 (еще одна версия)
├── parent_book_id: "uuid-v1"  // Всегда ссылается на оригинал
├── version: 3
└── pdf_url: "https://..."
```

### Особенности

- ✅ Оригинальный PDF остается неизменным
- ✅ Каждая версия имеет свой PDF
- ✅ Все версии видны на полке
- ✅ Версия отображается на обложке (v2, v3...)

---

## Автоматическая генерация

### Cron расписание

```sql
SELECT cron.schedule(
  'generate-monthly-books',
  '0 9 1 * *',  -- 9:00 утра, 1-е число каждого месяца
  $$
  SELECT net.http_post(
    url := 'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/books-generate-monthly-auto',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  );
  $$
);
```

### Условия для генерации

1. ✅ Пользователь Premium (`is_premium = true`)
2. ✅ Нет книги за прошлый месяц
3. ✅ Минимум 5 записей за прошлый месяц

### Параметры по умолчанию

- `contexts: []` (все категории)
- `style: 'warm_family'` (теплый семейный)
- `layout: 'photo_text'` (фото + текст)
- `theme: 'light'` (светлая тема)
- `regenerate: true` (принудительная генерация)

---

# ЧАСТЬ 4: ТЕКУЩЕЕ СОСТОЯНИЕ И ПРОБЛЕМЫ

## Что реализовано ✅

### Компоненты (Frontend)

- ✅ **BookCreationWizard** - визард создания книги (4 шага)
- ✅ **BooksLibraryScreen** - полка книг с фильтрами и действиями
- ✅ **BookDraftEditor** - редактор черновиков с предпросмотром PDF
- ✅ **BookCreationSuccessModal** - модалка успеха с конфетти
- ✅ **Интеграция с ReportsScreen** - открытие полки из отчетов

### Edge Functions (Backend)

- ✅ **books-generate-draft** - генерация PREMIUM книг с AI
- ✅ **books-render-pdf** - загрузка PDF в Storage
- ✅ **books-generate-monthly-auto** - автоматическая генерация (Cron)

### База данных

- ✅ **books_archive** - хранение книг
- ✅ **book_photos** - привязка фото к главам
- ✅ **RLS политики** - безопасность доступа

### Функциональность

- ✅ **Кэширование черновиков** - экономия токенов
- ✅ **Автоматическая привязка фото** - из entries.media
- ✅ **Версионирование** - v1, v2, v3...
- ✅ **3 стиля** - warm_family, biographical, motivational
- ✅ **3 макета** - photo_text, text_only, minimal

---

## Критические проблемы ❌

### 1. ❌ НЕТ разделения FREE vs PREMIUM

**Проблема**:
- Все книги создаются через AI (дорого)
- Нет FREE-версии без AI
- Низкая конверсия в Premium

**Требуется**:
- Edge Function `books-generate-free`
- Поле `plan_type` в `books_archive`
- Шаг 0 в визарде: выбор тарифа
- Premium Upsell модалка

**Приоритет**: P0 - КРИТИЧНО

---

### 2. ❌ PDF рендерится через @react-pdf/renderer

**Проблема**:
- Клиентский рендеринг (нагрузка на браузер)
- Проблемы с Unicode (русский, грузинский)
- Нестабильность при длинных книгах
- Разный рендер на разных устройствах

**Требуется**:
- Edge Function `books-render-puppeteer`
- HTML-шаблоны для разных стилей
- Встроенные шрифты (Noto Sans)

**Приоритет**: P0 - КРИТИЧНО

---

### 3. ❌ AI использует сырые записи (raw entries)

**Проблема**:
- Увеличивает стоимость токенов ×10
- Снижает скорость генерации
- Риск ошибок при длинных записях

**Требуется**:
- Таблица `entry_summaries`
- Обновить `books-generate-draft` для использования summaries
- Экономия токенов: ~90%

**Приоритет**: P0 - КРИТИЧНО

---

### 4. ❌ Нет Snapshot Layer

**Проблема**:
- AI перегружается данными
- Нет эмоциональных графиков
- Нет динамики периода
- Нет агрегатов (active days, top topics)

**Требуется**:
- Таблица `monthly_snapshots`
- Edge Function `snapshots-generate-monthly`
- Cron задача для генерации
- Интеграция с `books-generate-draft`

**Приоритет**: P0 - КРИТИЧНО

---

### 5. ❌ Нет Context Engine (person_tags)

**Проблема**:
- AI не может создать главы по людям
- Нет персональных книг ("Книга о Карине")
- Нет семейных глав с разделением по членам семьи

**Требуется**:
- Поле `person_tags` в `entries`
- Поле `persons` в `entry_summaries`
- Обновить AI промпты для Context Engine
- Главы: "Карина", "Арина", "Семья", "Работа", "Внутренний мир"

**Приоритет**: P1 - ВАЖНО

---

### 6. ❌ Нет AI Style Guide

**Проблема**:
- AI пишет "сухо"
- Нет эмоциональности
- Нет теплоты
- Не соответствует философии UNITY

**Требуется**:
- Документ `AI_STYLE_GUIDE.md`
- Интеграция в AI промпты
- Примеры хорошего и плохого текста

**Приоритет**: P1 - ВАЖНО

---

### 7. ❌ Нет Offline Mode

**Проблема**:
- PDF нельзя открыть без сети
- Черновики могут пропасть
- Пользователь теряет прогресс

**Требуется**:
- Кэширование PDF (IndexedDB для PWA, AsyncStorage для RN)
- Offline доступ к черновикам
- Sync при восстановлении сети

**Приоритет**: P2 - ЖЕЛАТЕЛЬНО

---

### 8. ❌ Дубликаты компонентов

**Проблема**:
- `BookCreationWizard.tsx` дублирован (корень + подпапка)
- `BooksLibraryScreen.tsx` и `.native.tsx` дублируют логику
- Нет общего хука `useBooksList`

**Требуется**:
- Удалить старый `BookCreationWizard.tsx`
- Создать хук `useBooksList` для общей логики
- Рефакторинг компонентов

**Приоритет**: P1 - ВАЖНО

---

### 9. ❌ Нет AI-операций для разных стилей

**Проблема**:
- Все книги используют один промпт `monthly_report`
- Нет разделения по стилям (warm_family, biographical, motivational)
- Невозможно настроить тон AI

**Требуется**:
- AI-операции: `book_generation_warm_family`, `book_generation_biographical`, `book_generation_motivational`
- Динамический выбор операции в Edge Function
- Разные системные промпты для каждого стиля

**Приоритет**: P1 - ВАЖНО

---

## План устранения проблем

### Фаза 1: Критичные исправления (P0)

**Сроки**: 2-3 дня

**Задачи**:

1. **FREE vs PREMIUM разделение**:
   - [ ] Добавить поле `plan_type` в `books_archive`
   - [ ] Создать Edge Function `books-generate-free`
   - [ ] Добавить Шаг 0 в визард: выбор тарифа
   - [ ] Premium Upsell модалка

2. **Snapshot Layer**:
   - [ ] Создать таблицу `monthly_snapshots`
   - [ ] Создать Edge Function `snapshots-generate-monthly`
   - [ ] Настроить Cron задачу
   - [ ] Интегрировать с `books-generate-draft`

3. **entry_summaries**:
   - [ ] Создать таблицу `entry_summaries`
   - [ ] Обновить `books-generate-draft` для использования summaries
   - [ ] Миграция существующих записей (опционально)

4. **Удаление дублей**:
   - [ ] Удалить старый `BookCreationWizard.tsx`
   - [ ] Создать хук `useBooksList`
   - [ ] Рефакторинг `BooksLibraryScreen`

---

### Фаза 2: Важные улучшения (P1)

**Сроки**: 1-2 дня

**Задачи**:

5. **Context Engine**:
   - [ ] Добавить поле `person_tags` в `entries`
   - [ ] Обновить AI промпты
   - [ ] Создать главы по персонам

6. **AI Style Guide**:
   - [ ] Создать документ `AI_STYLE_GUIDE.md`
   - [ ] Интегрировать в AI промпты
   - [ ] Тестирование на разных стилях

7. **AI-операции для стилей**:
   - [ ] Создать `book_generation_warm_family`
   - [ ] Создать `book_generation_biographical`
   - [ ] Создать `book_generation_motivational`
   - [ ] Обновить Edge Function для динамического выбора

8. **Puppeteer PDF**:
   - [ ] Создать Edge Function `books-render-puppeteer`
   - [ ] HTML-шаблоны для разных стилей
   - [ ] Встроенные шрифты (Noto Sans)
   - [ ] Тестирование на разных языках

---

### Фаза 3: Желательные улучшения (P2)

**Сроки**: 1-2 дня (можно отложить)

**Задачи**:

9. **Offline Mode**:
   - [ ] Кэширование PDF (IndexedDB / AsyncStorage)
   - [ ] Offline доступ к черновикам
   - [ ] Sync при восстановлении сети

10. **Батчинг AI запросов**:
    - [ ] Один AI вызов вместо нескольких
    - [ ] Оптимизация промптов

11. **Агрессивное кэширование**:
    - [ ] Хэширование содержимого записей
    - [ ] Кэш с учетом content hash

12. **Параллельная генерация**:
    - [ ] Promise.all для AI + Photos + Achievements

---

# ЧАСТЬ 5: ПЛАН РАЗВИТИЯ

## Roadmap

### Q1 2025 (Январь - Март)

**Цель**: Запуск базовой системы книг с FREE/PREMIUM

- ✅ Фаза 1: Критичные исправления (P0)
- ✅ Фаза 2: Важные улучшения (P1)
- ⏳ Первые тесты с пользователями
- ⏳ Сбор обратной связи

### Q2 2025 (Апрель - Июнь)

**Цель**: Оптимизация и новые типы книг

- ⏳ Puppeteer PDF (серверный рендеринг)
- ⏳ Книги квартала
- ⏳ Семейные книги
- ⏳ Offline Mode

### Q3 2025 (Июль - Сентябрь)

**Цель**: Монетизация и рост

- ⏳ Premium Upsell оптимизация
- ⏳ A/B тесты стилей книг
- ⏳ Sharing книг (публичные ссылки)
- ⏳ Книги года (годовой отчет)

### Q4 2025 (Октябрь - Декабрь)

**Цель**: Расширение функциональности

- ⏳ Книги по сферам (работа, здоровье, духовность)
- ⏳ Персональные книги по человеку
- ⏳ Кастомные стили (пользовательские шаблоны)
- ⏳ Печать книг (интеграция с печатью)

---

## Приоритеты

### P0 - КРИТИЧНО (СДЕЛАТЬ СЕЙЧАС)

1. FREE vs PREMIUM разделение
2. Snapshot Layer
3. entry_summaries
4. Удаление дублей кода

**Обоснование**: Без этого система дорогая, медленная, нестабильная.

---

### P1 - ВАЖНО (СДЕЛАТЬ НА ЭТОЙ НЕДЕЛЕ)

5. Context Engine (person_tags)
6. AI Style Guide
7. AI-операции для стилей
8. Puppeteer PDF

**Обоснование**: Улучшает качество книг, UX, монетизацию.

---

### P2 - ЖЕЛАТЕЛЬНО (СДЕЛАТЬ В ТЕЧЕНИЕ МЕСЯЦА)

9. Offline Mode
10. Батчинг AI
11. Агрессивное кэширование
12. Параллельная генерация

**Обоснование**: Оптимизация производительности, можно отложить.

---

## Метрики успеха

### Документация

- [x] Дублирование сокращено с 17 файлов до 3
- [x] Единый источник истины (BOOKS_SYSTEM_MASTER.md)
- [ ] Все проблемы из AUDIT имеют статус

### Код

- [ ] Удалены дубли компонентов
- [ ] Создан общий хук useBooksList
- [ ] Все Edge Functions соответствуют PRD

### Функциональность

- [ ] FREE vs PREMIUM разделены
- [ ] Snapshot Layer внедрен
- [ ] entry_summaries используются
- [ ] Context Engine работает
- [ ] Puppeteer PDF рендеринг
- [ ] Offline Mode для PWA

### Производительность

- [ ] Экономия токенов: 90%+ (через summaries)
- [ ] Время генерации FREE книги: < 5 сек
- [ ] Время генерации PREMIUM книги: < 20 сек
- [ ] Кэш-хит rate: > 50%

### Бизнес-метрики

- [ ] Конверсия FREE → PREMIUM: > 10%
- [ ] Удержание Premium пользователей: > 80%
- [ ] NPS книг: > 8.5
- [ ] Доля пользователей создающих книги: > 40%

---

## Временные рамки

### Общий план

| Фаза | Задачи | Сроки | Приоритет |
|------|--------|-------|-----------|
| Фаза 1 | FREE/PREMIUM, Snapshots, entry_summaries, дубли | 2-3 дня | P0 |
| Фаза 2 | Context Engine, AI Style Guide, стили, Puppeteer | 1-2 дня | P1 |
| Фаза 3 | Offline Mode, батчинг, кэширование, параллелизация | 1-2 дня | P2 |

**Итого**: 4-7 дней для полной реализации

---

## 📝 История изменений

### 2025-11-22

- ✅ Создан Master документ
- ✅ Консолидация PRD-v3 + Architecture + User Scenarios + Audit
- ✅ Анализ проблем и создание плана улучшений
- ✅ Определены приоритеты (P0, P1, P2)

---

## 🔗 Связанные документы

- [Детальный анализ и план улучшений](./COMPLETE_BOOKS_SYSTEM_ANALYSIS_AND_IMPROVEMENTS.md)
- [История реализации](./IMPLEMENTATION_LOG.md)
- [Backlog задач](./BACKLOG.md)
- [Архив старых версий](./archive/)

---

**Дата последнего обновления**: 2025-11-22  
**Версия**: 1.0  
**Статус**: ✅ ЕДИНЫЙ ИСТОЧНИК ИСТИНЫ  
**Автор**: UNITY Team

