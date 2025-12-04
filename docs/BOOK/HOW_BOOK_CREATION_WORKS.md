# 📚 Как работает система создания книги в UNITY

**Версия**: 2.0  
**Дата обновления**: 2025-01-30  
**Статус**: ✅ Актуально (соответствует текущей реализации)

---

## 📋 Содержание

1. [Обзор системы](#обзор-системы)
2. [Архитектура компонентов](#архитектура-компонентов)
3. [Полный flow создания книги](#полный-flow-создания-книги)
4. [FREE vs PREMIUM](#free-vs-premium)
5. [AI-генерация контента](#ai-генерация-контента)
6. [PDF-генерация](#pdf-генерация)
7. [Хранение и версионирование](#хранение-и-версионирование)
8. [Что не учтено / TODO](#что-не-учтено--todo)

---

## 🎯 Обзор системы

Система создания книг в UNITY позволяет пользователям превращать записи дневника в персонализированные PDF-книги с:

- ✅ **AI-анализом** записей (PREMIUM)
- ✅ **Автоматической структурой** (главы, вступление, заключение)
- ✅ **Фотографиями** из записей
- ✅ **Достижениями** и ключевыми моментами
- ✅ **Красивым дизайном** (3 стиля, 3 макета)
- ✅ **Мультиязычностью** (7 языков)

### Типы книг

1. **FREE книга** — простая книга без AI (список записей + фото)
2. **PREMIUM книга** — полная AI-книга с анализом и структурой
3. **Книга месяца** — за календарный месяц
4. **Книга квартала** — за 3 месяца (PREMIUM)
5. **Книга года** — за весь год (PREMIUM)

---

## 🏗️ Архитектура компонентов

### Frontend (React + TypeScript)

```
src/features/mobile/reports/
├── components/
│   ├── BookCreationWizard.tsx          # Главный визард (5 шагов)
│   │   └── book-creation-wizard/
│   │       ├── Step0PlanType.tsx      # Шаг 0: Выбор тарифа (FREE/PREMIUM)
│   │       ├── Step1Period.tsx        # Шаг 1: Выбор периода
│   │       ├── Step2Contexts.tsx      # Шаг 2: Выбор категорий
│   │       ├── Step3Style.tsx         # Шаг 3: Выбор стиля
│   │       ├── Step4Layout.tsx        # Шаг 4: Выбор макета
│   │       ├── WizardNavigation.tsx   # Навигация
│   │       ├── utils.ts               # API вызовы, валидация
│   │       ├── constants.ts           # Константы
│   │       └── types.ts                # TypeScript типы
│   │
│   ├── BookDraftEditor.tsx            # Редактор черновика
│   ├── BookPDFDocument.tsx            # React-PDF компонент
│   ├── BooksLibraryScreen.tsx         # Полка книг
│   ├── BookCreationSuccessModal.tsx   # Модалка успеха
│   └── BookGenerationProgress.tsx     # Прогресс генерации
│
└── hooks/
    └── useBookCreation.ts              # Логика визарда
```

### Backend (Supabase Edge Functions)

```
supabase/functions/
├── books-generate-free/                # FREE книга (без AI)
├── books-generate-draft/               # PREMIUM черновик (с AI)
├── books-generate-quarter/             # Книга квартала
├── books-generate-annual/              # Книга года
├── books-render-pdf/                   # Загрузка PDF в Storage
└── books-generate-monthly-auto/        # Автогенерация (Cron)
```

### База данных (Supabase)

```
books_archive
├── id (UUID)
├── user_id (UUID)
├── period_start (DATE)
├── period_end (DATE)
├── contexts (TEXT[])
├── style (TEXT)                        # warm_family | biographical | motivational
├── layout (TEXT)                       # photo_text | text_only | minimal
├── theme (TEXT)                        # light | dark
├── plan_type (TEXT)                    # free | premium
├── type (TEXT)                         # month | quarter | year | custom
├── story_json (JSONB)                  # Структура книги
├── metadata (JSONB)                    # Метаданные (period, insight, etc.)
├── pdf_url (TEXT)                      # URL PDF в Storage
├── is_draft (BOOLEAN)
├── is_final (BOOLEAN)
├── version (INTEGER)                   # Версия книги
└── created_at (TIMESTAMP)

book_photos
├── id (UUID)
├── book_id (UUID)                      # FK → books_archive
├── chapter_index (INTEGER)
├── photo_url (TEXT)
└── caption (TEXT)
```

---

## 🔄 Полный flow создания книги

### Шаг 1: Пользователь инициирует создание

```
ReportsScreen
  → "Открыть полку книг"
    → BooksLibraryScreen
      → "Создать книгу"
        → BookCreationWizard
```

### Шаг 2: Визард (5 шагов)

#### Шаг 0: Выбор тарифа (только для FREE пользователей)

- **FREE пользователи**: Выбирают "FREE" или "PREMIUM" (→ Paywall)
- **PREMIUM пользователи**: Пропускают этот шаг, автоматически `planType = 'premium'`

**Компонент**: `Step0PlanType.tsx`  
**Логика**: `useBookCreation.ts` → `setConfig({ planType: 'free' | 'premium' })`

#### Шаг 1: Выбор периода

- Пользователь выбирает `periodStart` и `periodEnd`
- Валидация: `periodEnd > periodStart`
- Проверка минимума записей: минимум 5 записей в периоде

**Компонент**: `Step1Period.tsx` (использует Shadcn Calendar)  
**Валидация**: `utils.ts` → `validateMinimumEntries()`

#### Шаг 2: Выбор категорий (опционально)

- Пользователь может выбрать категории для фильтрации записей
- Если ничего не выбрано → используются все записи
- Категории загружаются из `entries.category`

**Компонент**: `Step2Contexts.tsx`  
**Загрузка**: `utils.ts` → `fetchAvailableCategories()`

#### Шаг 3: Выбор стиля (только PREMIUM)

- **warm_family** — Теплый семейный (доступен FREE)
- **biographical** — Биографический (PREMIUM)
- **motivational** — Мотивационный (PREMIUM)

**Компонент**: `Step3Style.tsx`  
**Логика**: FREE пользователи видят заблокированные опции с кнопкой "Upgrade"

#### Шаг 4: Выбор макета (только PREMIUM)

- **photo_text** — Фото + текст (доступен FREE)
- **text_only** — Только текст (PREMIUM)
- **minimal** — Минималистичный (PREMIUM)

**Компонент**: `Step4Layout.tsx`

### Шаг 3: Генерация черновика

#### 3.1. Валидация и проверки

```typescript
// useBookCreation.ts → handleGenerate()

1. Проверка авторизации (userId)
2. Валидация минимума записей (минимум 5)
3. Проверка лимита FREE (1 книга в месяц для FREE)
4. Выбор endpoint:
   - FREE → books-generate-free
   - PREMIUM → books-generate-draft
   - QUARTER → books-generate-quarter
   - YEAR → books-generate-annual
```

#### 3.2. API вызов (Edge Function)

**FREE книга** (`books-generate-free`):

```typescript
1. Загрузка entries за период
2. Формирование простой структуры:
   {
     title: "Мой дневник за [период]",
     subtitle: "Простые записи",
     chapters: [
       {
         title: "Записи",
         content: "Список записей...",
         source_entry_ids: [...]
       }
     ]
   }
3. Сбор фото (максимум 9 для FREE)
4. Сохранение в books_archive (plan_type='free')
5. Возврат draftId
```

**PREMIUM книга** (`books-generate-draft`):

```typescript
1. Проверка кэша (content hash)
   - Если найден → возврат cached draftId
   
2. Загрузка entry_summaries (НЕ raw entries!)
   - short_summary, insight, mood, topics, persons
   
3. Загрузка snapshot (monthly_snapshots)
   - Статистика периода
   - Эмоции, топ темы, топ люди
   
4. Сбор фото из entries.media
   
5. Сбор достижений (entries.is_achievement = true)
   
6. Вызов OpenAI GPT-4o-mini:
   - Системный промпт (из ai_operations)
   - Пользовательский промпт (записи + контекст)
   - Генерация story_json:
     {
       title: "...",
       subtitle: "...",
       prologue: "...",
       chapters: [
         {
           title: "...",
           content: "...",
           highlights: [...],
           source_entry_ids: [...]
         }
       ],
       epilogue: "...",
       insight: "..." // ✅ НОВОЕ: Инсайт для обложки
     }
   
7. Генерация оглавления (tableOfContents):
   - Автоматический подсчет страниц
   - Список глав с номерами страниц
   
8. Генерация итогов месяца (monthSummary) для PREMIUM:
   - Топ-5 побед из highlights
   - Фокус на следующий месяц
   
9. Добавление хроники (Chronicle):
   - Хронологический список всех записей
   
10. Сохранение в books_archive:
    - story_json
    - metadata: { period, insight, ... }
    - plan_type='premium'
    
11. Автоматическая привязка фото к главам (book_photos)
    
12. Возврат draftId
```

### Шаг 4: Отображение прогресса

**Компонент**: `BookGenerationProgress.tsx`

- Анимация прогресса
- Обработка ошибок
- Кнопка "Повторить" при ошибке
- `onComplete()` → показ модалки успеха

### Шаг 5: Модалка успеха

**Компонент**: `BookCreationSuccessModal.tsx`

- Конфетти анимация 🎉
- Кнопки:
  - "Перейти к редактору" → `BookDraftEditor`
  - "На полку книг" → `BooksLibraryScreen`

### Шаг 6: Редактор черновика (опционально)

**Компонент**: `BookDraftEditor.tsx`

- Редактирование текста (title, prologue, chapters, epilogue)
- Загрузка дополнительных фото
- Предпросмотр PDF (вкладка)
- Создание финального PDF

### Шаг 7: Генерация PDF

**Компонент**: `BookPDFDocument.tsx` (React-PDF)

```typescript
1. Регистрация шрифтов (Noto Sans, Noto Serif)
2. Рендеринг PDF:
   - Обложка (с периодом и инсайтом)
   - Оглавление (если есть)
   - Вступление
   - Главы (с разделителями)
   - Хроника
   - Заключение
   - Итоги месяца (PREMIUM)
3. Генерация Blob
4. Загрузка в Supabase Storage (books-render-pdf)
5. Обновление books_archive.pdf_url
6. Обновление статуса: is_final = true, is_draft = false
```

---

## 🆓 FREE vs PREMIUM

### FREE книга

**Особенности**:
- ✅ Без AI-генерации
- ✅ Простая структура (список записей)
- ✅ Максимум 9 фото (коллаж)
- ✅ Только стиль `warm_family`
- ✅ Только макет `photo_text`
- ✅ Лимит: 1 книга в месяц

**Структура**:
```json
{
  "title": "Мой дневник за [период]",
  "subtitle": "Простые записи",
  "chapters": [
    {
      "title": "Записи",
      "content": "Список записей...",
      "source_entry_ids": [...]
    }
  ]
}
```

### PREMIUM книга

**Особенности**:
- ✅ AI-генерация контента
- ✅ Полная структура (главы, вступление, заключение)
- ✅ Неограниченное количество фото
- ✅ 3 стиля (warm_family, biographical, motivational)
- ✅ 3 макета (photo_text, text_only, minimal)
- ✅ Оглавление
- ✅ Итоги месяца (топ-5 побед)
- ✅ Инсайт на обложке
- ✅ Без лимитов

**Структура**:
```json
{
  "title": "...",
  "subtitle": "...",
  "prologue": "...",
  "chapters": [
    {
      "title": "...",
      "content": "...",
      "highlights": [...],
      "source_entry_ids": [...]
    }
  ],
  "epilogue": "...",
  "insight": "...",
  "tableOfContents": {
    "title": "Оглавление",
    "items": [
      { "title": "Вступление", "page": 3 },
      { "title": "Глава 1: ...", "page": 4 }
    ]
  },
  "monthSummary": {
    "title": "Итоги месяца",
    "topWins": [...],
    "focusNextMonth": "..."
  }
}
```

---

## 🤖 AI-генерация контента

### Промпты

**Системный промпт** (из `ai_operations`):

```
Ты создаёшь персонализированную книгу для пользователя.
Стиль: [warm_family | biographical | motivational]

ТРЕБОВАНИЯ:
- Тёплый, поддерживающий тон
- Без осуждения
- Фокус на росте и ресурсных моментах
- Использовать форму "ты" (не "вы")
- Избегать шаблонных фраз

СТРУКТУРА АБЗАЦЕВ:
- Параграф 1: Событие (что произошло)
- Параграф 2: Внутреннее состояние (эмоции, мысли)
- Параграф 3: Вывод (рост, инсайт)

ЗАПРЕЩЕНО:
- "Это стало важным моментом..."
- "Это решение стало знаком..."
- Любые шаблонные фразы
```

**Пользовательский промпт**:

```
Период: [periodStart] - [periodEnd]
Дневник: [diaryName] [diaryEmoji]
Язык: [userLanguage]

Контекст периода (из snapshot):
- Всего записей: X
- Активных дней: Y
- Эмоции: {...}
- Топ темы: [...]
- Топ люди: [...]

Записи:
[entry_summaries с short_summary, insight, mood, topics, persons]

Создай JSON структуру книги:
{
  "title": "...",
  "subtitle": "...",
  "prologue": "...",
  "chapters": [
    {
      "title": "...",
      "content": "...",
      "highlights": [...],
      "source_entry_ids": [...]
    }
  ],
  "epilogue": "...",
  "insight": "..." // 1-2 предложения для обложки
}
```

### Кэширование

**Content Hash**:
- Генерируется из: `entriesSummary + stats + style + layout`
- Используется для поиска существующих черновиков
- Экономит токены OpenAI

**Логика**:
```typescript
1. Генерация content hash
2. Поиск черновика с тем же hash
3. Если найден → возврат cached draftId
4. Если не найден → генерация нового
```

---

## 📄 PDF-генерация

### Текущая реализация: @react-pdf/renderer (Client-side)

**Статус**: ✅ Работает

**Процесс**:
1. Пользователь нажимает "Создать PDF" в редакторе
2. Браузер генерирует PDF Blob используя `@react-pdf/renderer`
3. Blob загружается в Supabase Storage через `books-render-pdf`
4. Ссылка сохраняется в `books_archive.pdf_url`

**Шрифты**:
- Noto Sans (основной текст)
- Noto Serif (заголовки)
- Загружаются из Google Fonts CDN (.ttf формат)

**Стили** (актуальные после улучшений 2025-01-30):

```typescript
page: {
  fontSize: 12,        // ✅ Увеличено с 11
  lineHeight: 1.4,     // ✅ Улучшено с 1.6
}

title: {
  fontSize: 32,         // ✅ Увеличено с 28
  fontWeight: 700,      // ✅ Увеличено с 600
}

subtitle: {
  fontSize: 18,         // ✅ Увеличено с 14
  fontStyle: 'italic',  // ✅ Добавлен курсив
}

chapterTitle: {
  fontSize: 20,         // ✅ Увеличено с 16
  fontWeight: 700,      // ✅ Увеличено с 600
  marginTop: 24,        // ✅ Добавлен отступ
  borderBottom: '1px solid #e2e8f0', // ✅ Разделитель
}

paragraph: {
  fontSize: 12,         // ✅ Явно указан
  lineHeight: 1.4,      // ✅ Явно указан
  marginBottom: 12,      // ✅ Увеличено с 10
}
```

**Структура PDF**:
1. Обложка (с периодом и инсайтом)
2. Оглавление (если есть)
3. Вступление
4. Главы (с визуальными разделителями)
5. Хроника
6. Заключение
7. Итоги месяца (PREMIUM)

---

## 💾 Хранение и версионирование

### База данных

**Таблица `books_archive`**:
- Хранит все книги (FREE и PREMIUM)
- `is_draft = true` → черновик
- `is_final = true` → готовая книга с PDF
- `version` → номер версии (1, 2, 3...)

**Таблица `book_photos`**:
- Связь многие-к-одному с `books_archive`
- `chapter_index` → к какой главе относится фото

### Supabase Storage

**Bucket `books`**:
- Структура: `{userId}/{bookId}/{filename}.pdf`
- Приватный доступ (только для владельца)
- RLS политики проверяют `user_id`

### Версионирование

**Логика**:
1. Пользователь редактирует книгу
2. Создается новая версия (`version + 1`)
3. Старая версия остается в БД
4. PDF загружается с новым именем файла

**TODO**: История версий в UI (пока не реализовано)

---

## ⚠️ Что не учтено / TODO

### Критические пробелы

1. **❌ Нет серверного PDF-рендеринга**
   - Сейчас: Client-side через @react-pdf/renderer
   - Проблемы: нагрузка на устройство, проблемы с шрифтами
   - TODO: Переход на Puppeteer/Playwright (Edge Function)

2. **❌ Нет полноценного редактора**
   - Сейчас: Базовое редактирование текста
   - TODO: Визуальный редактор, drag-and-drop фото, изменение структуры

3. **❌ Нет истории версий в UI**
   - Сейчас: Версии хранятся в БД, но не отображаются
   - TODO: UI для просмотра и переключения версий

4. **❌ Нет автоматической генерации**
   - Сейчас: Edge Function `books-generate-monthly-auto` существует, но не настроен Cron
   - TODO: Настроить Cron для автогенерации книг месяца для PREMIUM

5. **❌ Нет Snapshot Layer**
   - Сейчас: Edge Function `snapshots-generate-monthly` существует, но не используется
   - TODO: Интегрировать snapshots в генерацию книг

6. **❌ Нет Context Engine**
   - Сейчас: Контексты = просто теги (categories)
   - TODO: Персоны (persons), темы (topics), группировка глав по контекстам

### Средние пробелы

7. **❌ Нет Offline Mode для PDF**
   - Сейчас: PDF хранится только в Storage
   - TODO: Кэширование PDF в IndexedDB для offline доступа

8. **❌ Нет экспорта в другие форматы**
   - Сейчас: Только PDF
   - TODO: EPUB, DOCX, HTML

9. **❌ Нет шаринга через социальные сети**
   - Сейчас: Только скачивание
   - TODO: Поделиться в Telegram, WhatsApp, etc.

10. **❌ Нет аналитики использования**
    - Сейчас: Нет метрик
    - TODO: Сколько книг создано, какие стили популярны, конверсия FREE → PREMIUM

### Мелкие пробелы

11. **❌ Нет предпросмотра перед генерацией**
    - Сейчас: Генерация → просмотр
    - TODO: Предпросмотр структуры перед генерацией

12. **❌ Нет шаблонов книг**
    - Сейчас: Только AI-генерация
    - TODO: Готовые шаблоны для быстрого создания

13. **❌ Нет массового экспорта**
    - Сейчас: По одной книге
    - TODO: Экспорт всех книг за период

---

## 📝 Примечания

- Документ актуализирован: 2025-01-30
- Соответствует текущей реализации в коде
- Все улучшения PDF (читабельность, обложка, оглавление) учтены
- TODO список требует приоритизации

---

## 🔗 Связанные документы

- `BOOKS_SYSTEM_MASTER.md` — Полный PRD (устарел, требует обновления)
- `books-pdf-rules.md` — Правила улучшения PDF (актуально)
- `WIZARD_LOGIC.md` — Логика визарда (актуально)
- `FONTS_SETUP.md` — Настройка шрифтов (актуально)

