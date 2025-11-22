# 📚 Система книг UNITY — Полная архитектура и логика

**Дата создания**: 2025-11-21  
**Версия**: 2.0  
**Статус**: ✅ Production Ready

---

## 📋 Содержание

1. [Обзор системы](#обзор-системы)
2. [Архитектура компонентов](#архитектура-компонентов)
3. [Потоки данных](#потоки-данных)
4. [База данных](#база-данных)
5. [API Endpoints](#api-endpoints)
6. [Сценарии использования](#сценарии-использования)
7. [Версионирование](#версионирование)
8. [Автоматическая генерация](#автоматическая-генерация)
9. [Фото-книги](#фото-книги)
10. [PDF Рендеринг](#pdf-рендеринг)

---

## 🎯 Обзор системы

Система книг UNITY — это **эмоциональное ядро** приложения, позволяющее пользователям превращать свои записи дневника в персонализированные PDF-книги с фотографиями, достижениями и красивым дизайном.

### Ключевые возможности

- ✅ **AI-генерация** книг из записей дневника
- ✅ **3 стиля**: Теплый семейный, Биографический, Мотивационный
- ✅ **3 макета**: Фото + текст, Только текст, Минималистичный
- ✅ **Автоматическая привязка фото** из записей
- ✅ **Глава достижений** с автоматическим сбором
- ✅ **Версионирование** книг (v1, v2, v3...)
- ✅ **Автоматическая генерация** для Premium пользователей
- ✅ **Кэширование черновиков** для экономии токенов
- ✅ **Многоязычность** (7 языков)

---

## 🏗️ Архитектура компонентов

### Frontend компоненты

```
src/features/mobile/reports/components/
├── BookCreationWizard.tsx              # Главный визард создания книги (4 шага)
│   └── book-creation-wizard/
│       ├── Step1Period.tsx            # Шаг 1: Выбор периода
│       ├── Step2Contexts.tsx           # Шаг 2: Выбор категорий
│       ├── Step3Style.tsx              # Шаг 3: Выбор стиля (с превью)
│       ├── Step4Layout.tsx             # Шаг 4: Выбор макета (с превью)
│       ├── WizardNavigation.tsx        # Навигация между шагами
│       ├── utils.ts                    # Утилиты (валидация, API вызовы)
│       ├── constants.ts                # Константы
│       └── types.ts                    # TypeScript типы
│
├── BookDraftEditor.tsx                # Редактор черновика книги
│   ├── Редактирование текста (title, prologue, chapters, epilogue)
│   ├── Загрузка фото к главам
│   ├── Предпросмотр PDF (вкладка "Предпросмотр")
│   └── Создание финального PDF
│
├── BooksLibraryScreen.tsx             # Полка книг (сетка обложек)
│   ├── Фильтры (Все / Черновики / Готовые)
│   ├── Действия: Просмотр, Скачать, Редактировать, Удалить
│   └── Создание новой версии
│
├── BookCreationSuccessModal.tsx       # Модалка успеха после генерации
├── BookGenerationProgress.tsx         # Прогресс генерации (анимация)
└── BookDeleteConfirmModal.tsx         # Подтверждение удаления
```

### Backend компоненты

```
supabase/functions/
├── books-generate-draft/               # Генерация черновика книги
│   └── index.ts
│       ├── Проверка кэша черновиков
│       ├── Загрузка записей за период
│       ├── Сбор фото из записей
│       ├── Сбор достижений
│       ├── Вызов OpenAI GPT-4o-mini
│       ├── Сохранение черновика в БД
│       └── Автоматическая привязка фото к главам
│
├── books-render-pdf/                  # Рендер и загрузка PDF
│   └── index.ts
│       ├── Прием base64 PDF от клиента
│       ├── Конвертация base64 → Uint8Array
│       ├── Загрузка в Supabase Storage
│       └── Обновление статуса книги (is_final, is_draft)
│
└── books-generate-monthly-auto/       # Автоматическая генерация (Cron)
    └── index.ts
        ├── Определение периода (прошлый месяц)
        ├── Поиск Premium пользователей
        ├── Проверка наличия книги за период
        ├── Проверка минимума записей (5)
        └── Вызов books-generate-draft для каждого пользователя
```

### Интеграция в ReportsScreen

```typescript
// src/features/mobile/reports/components/ReportsScreen.tsx

// Состояния
const [showBooksLibrary, setShowBooksLibrary] = useState(false);
const [showBookWizard, setShowBookWizard] = useState(false);
const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
const [booksLibraryRefreshKey, setBooksLibraryRefreshKey] = useState(0);

// Flow:
// 1. ReportsScreen → "Открыть полку книг" → BooksLibraryScreen
// 2. BooksLibraryScreen → "Создать книгу" → BookCreationWizard
// 3. BookCreationWizard → onComplete(draftId) → BookDraftEditor
// 4. BookDraftEditor → onComplete() → BooksLibraryScreen (обновление списка)
```

---

## 🔄 Потоки данных

### Поток 1: Создание книги (ручное)

```
┌─────────────────┐
│  ReportsScreen  │
│  "Открыть полку"│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│BooksLibraryScreen│
│  "Создать книгу" │
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│BookCreationWizard│
│  4 шага визарда │
└────────┬────────┘
         │
         │ Шаг 1: Период (periodStart, periodEnd)
         │ Шаг 2: Категории (contexts[])
         │ Шаг 3: Стиль (style: warm_family | biographical | motivational)
         │ Шаг 4: Макет (layout: photo_text | text_only | minimal)
         │
         │ Нажатие "Создать книгу"
         │
         ▼
┌─────────────────┐
│  API Call:       │
│  POST /books-    │
│  generate-draft  │
└────────┬────────┘
         │
         │ Request Body:
         │ {
         │   userId, periodStart, periodEnd,
         │   contexts, style, layout, theme,
         │   diaryName, diaryEmoji
         │ }
         │
         ▼
┌─────────────────┐
│books-generate-  │
│draft Edge Func  │
└────────┬────────┘
         │
         │ 1. Проверка кэша (если regenerate=false)
         │ 2. Загрузка записей из entries
         │ 3. Сбор фото из entries.media
         │ 4. Сбор достижений (is_achievement=true)
         │ 5. Вызов OpenAI GPT-4o-mini
         │ 6. Сохранение в books_archive
         │ 7. Автоматическая привязка фото в book_photos
         │
         ▼
┌─────────────────┐
│  Response:       │
│  { success: true,│
│    draftId: uuid }│
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│BookCreation     │
│SuccessModal     │
│(с конфетти)     │
└────────┬─────────┘
         │
         │ "Перейти к редактору"
         │
         ▼
┌─────────────────┐
│BookDraftEditor  │
│  Редактирование │
└────────┬────────┘
         │
         │ Редактирование текста
         │ Загрузка дополнительных фото
         │ Предпросмотр PDF
         │
         │ "Создать финальную версию"
         │
         ▼
┌─────────────────┐
│  PDF Render:     │
│  @react-pdf/     │
│  renderer        │
└────────┬─────────┘
         │
         │ Blob → base64
         │
         ▼
┌─────────────────┐
│  API Call:       │
│  PUT /books-     │
│  render-pdf/:id/ │
│  upload          │
└────────┬─────────┘
         │
         │ Request Body:
         │ { pdfBlob: base64, pages, wordCount }
         │
         ▼
┌─────────────────┐
│books-render-pdf │
│Edge Function    │
└────────┬────────┘
         │
         │ 1. Конвертация base64 → Uint8Array
         │ 2. Загрузка в Storage bucket "books"
         │ 3. Обновление books_archive:
         │    - pdf_url = publicUrl
         │    - is_final = true
         │    - is_draft = false
         │    - metadata.pages, metadata.wordCount
         │
         ▼
┌─────────────────┐
│  Response:       │
│  { success: true,│
│    pdfUrl: url } │
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│BooksLibraryScreen│
│  Книга "Готово"  │
│  Просмотр/Скачать│
└──────────────────┘
```

### Поток 2: Версионирование книги

```
┌─────────────────┐
│BooksLibraryScreen│
│  Готовая книга  │
│  "Новая версия" │
└────────┬─────────┘
         │
         │ Подтверждение
         │
         ▼
┌─────────────────┐
│  Supabase Insert:│
│  books_archive   │
└────────┬─────────┘
         │
         │ Новый черновик:
         │ - parent_book_id = id оригинала
         │ - version = version + 1
         │ - story_json = копия оригинала
         │ - is_draft = true
         │ - is_final = false
         │ - pdf_url = null
         │
         ▼
┌─────────────────┐
│BookDraftEditor  │
│  Редактирование │
│  v2             │
└────────┬─────────┘
         │
         │ Изменения текста/фото
         │
         ▼
┌─────────────────┐
│  Создание PDF v2│
│  (тот же поток)  │
└─────────────────┘
```

### Поток 3: Автоматическая генерация (Premium)

```
┌─────────────────┐
│  Cron Job:       │
│  0 9 1 * *      │
│  (1-е число, 9:00)│
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│books-generate-   │
│monthly-auto      │
└────────┬─────────┘
         │
         │ 1. Определение периода (прошлый месяц)
         │ 2. Поиск Premium пользователей
         │ 3. Для каждого пользователя:
         │    - Проверка наличия книги за период
         │    - Проверка минимума записей (5)
         │    - Вызов books-generate-draft
         │
         ▼
┌─────────────────┐
│  HTTP Call:       │
│  POST /books-    │
│  generate-draft  │
│  (для каждого)   │
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│  Книга создана   │
│  (черновик)      │
│  Push уведомление│
└──────────────────┘
```

---

## 🗄️ База данных

### Таблица `books_archive`

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
  contexts TEXT[], -- Категории для фильтрации
  
  -- Настройки книги
  style TEXT NOT NULL CHECK (style IN ('warm_family', 'biographical', 'motivational')),
  layout TEXT NOT NULL CHECK (layout IN ('photo_text', 'text_only', 'minimal')),
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  
  -- Контент
  story_json JSONB NOT NULL, -- AI-сгенерированная структура книги
  metadata JSONB, -- Статистика, достижения, метаданные
  
  -- PDF
  pdf_url TEXT, -- URL финального PDF в Storage
  
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
```

### Структура `story_json`

```typescript
type StoryJson = {
  title: string;                    // Название книги
  subtitle: string;                  // Подзаголовок (период)
  prologue: string;                  // Вступление (2-3 абзаца)
  chapters: Array<{
    title: string;                   // Название главы
    content: string;                 // Текст главы (3-5 абзацев)
    highlights: string[];            // Ключевые моменты
    source_entry_ids: string[];     // ✅ ID записей для привязки фото
  }>;
  epilogue: string;                 // Заключение (2-3 абзаца)
  dedication?: string;               // Посвящение (опционально)
};
```

### Структура `metadata`

```typescript
type BookMetadata = {
  entriesCount: number;              // Количество записей
  achievementsCount: number;         // Количество достижений
  achievements: Array<{               // ✅ Массив достижений для главы
    id: string;
    date: string;
    category: string;
    summary: string;
  }>;
  tokensUsed?: number;                // Использовано токенов OpenAI
  estimatedCost?: number;             // Примерная стоимость
  diaryName: string;                 // Название дневника
  diaryEmoji: string;                // Emoji дневника
  pages?: number;                     // Количество страниц PDF
  wordCount?: number;                 // Количество слов
};
```

### Таблица `book_photos`

```sql
CREATE TABLE book_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books_archive(id) ON DELETE CASCADE,
  chapter_index INTEGER NOT NULL,     -- Индекс главы (0-based)
  photo_url TEXT NOT NULL,            -- URL фото в Storage
  caption TEXT,                        -- Подпись к фото
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_book_photos_book_id ON book_photos(book_id);
CREATE INDEX idx_book_photos_chapter ON book_photos(book_id, chapter_index);
```

### Storage Buckets

```
supabase/storage/
├── books/                           # PDF файлы книг
│   └── {userId}/{bookId}.pdf
│
└── book-photos/                     # Фото для книг
    └── {userId}/{bookId}/{photoId}.{ext}
```

---

## 🔌 API Endpoints

### 1. POST `/books-generate-draft`

**Назначение**: Генерация черновика книги с AI

**Request**:
```typescript
{
  userId: string;
  periodStart: string;              // ISO date: "2025-10-01"
  periodEnd: string;                // ISO date: "2025-10-31"
  contexts: string[];               // Категории: ["работа", "семья"] или []
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
   - Поиск существующего черновика с теми же параметрами
   - Если найден → возврат `{ success: true, draftId, storyJson, cached: true }`
3. **Загрузка записей**:
   ```sql
   SELECT id, text, sentiment, category, tags, mood, 
          ai_summary, ai_insight, is_achievement, 
          created_at, media
   FROM entries
   WHERE user_id = userId
     AND created_at >= periodStart
     AND created_at <= periodEnd
   ORDER BY created_at ASC
   ```
4. **Фильтрация по категориям** (если `contexts.length > 0`)
5. **Сбор фото**:
   ```typescript
   const photosFromEntries = entries.flatMap(entry => 
     entry.media
       ?.filter(m => m.type === 'image' && m.url)
       .map(m => ({
         entryId: entry.id,
         url: m.url,
         createdAt: entry.created_at
       }))
   );
   ```
6. **Сбор достижений**:
   ```typescript
   const achievements = entries
     .filter(e => e.is_achievement)
     .map(e => ({
       id: e.id,
       date: e.created_at,
       category: e.category,
       summary: e.ai_summary || e.text.substring(0, 200)
     }));
   ```
7. **Вызов OpenAI**:
   - Загрузка конфигурации из `ai_operations` (id: `monthly_report`)
   - Замена плейсхолдеров в промптах
   - Вызов GPT-4o-mini с системным и пользовательским промптом
   - Парсинг JSON ответа
8. **Сохранение черновика**:
   ```sql
   INSERT INTO books_archive (
     user_id, period_start, period_end, contexts,
     style, layout, theme, story_json, metadata,
     is_draft, is_final
   ) VALUES (...)
   ```
9. **Автоматическая привязка фото**:
   ```typescript
   // Для каждой главы с source_entry_ids:
   for (const chapter of storyJson.chapters) {
     const chapterPhotos = photosFromEntries.filter(
       p => chapter.source_entry_ids.includes(p.entryId)
     );
     
     for (const photo of chapterPhotos) {
       await supabase.from('book_photos').insert({
         book_id: draftId,
         chapter_index: chapterIndex,
         photo_url: photo.url,
         caption: photo.createdAt // Дата записи по умолчанию
       });
     }
   }
   ```

### 2. PUT `/books-render-pdf/:draftId/upload`

**Назначение**: Рендер финального PDF и загрузка в Storage

**Request**:
```typescript
{
  pdfBlob: string;                  // base64 строка: "data:application/pdf;base64,..."
  pages: number;                    // Количество страниц
  wordCount: number;               // Количество слов
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

**Логика работы**:

1. **Проверка авторизации**: Верификация JWT токена
2. **Проверка черновика**:
   ```sql
   SELECT * FROM books_archive
   WHERE id = draftId AND user_id = userId
   ```
3. **Конвертация base64 → Uint8Array**:
   ```typescript
   const base64Data = pdfBlob.replace(/^data:application\/pdf;base64,/, '');
   const binaryString = atob(base64Data);
   const bytes = new Uint8Array(binaryString.length);
   for (let i = 0; i < binaryString.length; i++) {
     bytes[i] = binaryString.charCodeAt(i);
   }
   ```
4. **Загрузка в Storage**:
   ```typescript
   const fileName = `${userId}/${draftId}.pdf`;
   await supabase.storage
     .from('books')
     .upload(fileName, bytes, {
       contentType: 'application/pdf',
       upsert: true
     });
   ```
5. **Получение public URL**:
   ```typescript
   const { data } = supabase.storage
     .from('books')
     .getPublicUrl(fileName);
   const pdfUrl = data.publicUrl;
   ```
6. **Обновление статуса**:
   ```sql
   UPDATE books_archive
   SET pdf_url = pdfUrl,
       is_final = true,
       is_draft = false,
       metadata = jsonb_set(
         jsonb_set(metadata, '{pages}', pages::text::jsonb),
         '{wordCount}', wordCount::text::jsonb
       ),
       updated_at = NOW()
   WHERE id = draftId
   ```

### 3. POST `/books-generate-monthly-auto`

**Назначение**: Автоматическая генерация книг для Premium (Cron)

**Вызов**: Через pg_cron (расписание `0 9 1 * *`)

**Request**: Нет (вызывается автоматически)

**Response**:
```typescript
{
  success: boolean;
  results: {
    total: number;                 // Всего Premium пользователей
    generated: number;              // Создано книг
    skipped: number;                // Пропущено (уже есть книга / мало записей)
    errors: number;                 // Ошибки
  };
}
```

**Логика работы**:

1. **Определение периода**:
   ```typescript
   const now = new Date();
   const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
   const startStr = lastMonth.toISOString().split('T')[0];
   const endStr = new Date(now.getFullYear(), now.getMonth(), 0)
     .toISOString().split('T')[0];
   ```
2. **Поиск Premium пользователей**:
   ```sql
   SELECT id, diary_name, diary_emoji
   FROM profiles
   WHERE is_premium = true
   ```
3. **Для каждого пользователя**:
   - Проверка наличия книги:
     ```sql
     SELECT COUNT(*) FROM books_archive
     WHERE user_id = userId
       AND period_start >= startStr
       AND period_end <= endStr
     ```
   - Проверка минимума записей:
     ```sql
     SELECT COUNT(*) FROM entries
     WHERE user_id = userId
       AND created_at >= startStr
       AND created_at <= endStr
     ```
   - Если все проверки пройдены → вызов `books-generate-draft`:
     ```typescript
     await fetch(`${supabaseUrl}/functions/v1/books-generate-draft`, {
       method: 'POST',
       headers: {
         Authorization: `Bearer ${supabaseServiceKey}`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         userId: user.id,
         periodStart: startStr,
         periodEnd: endStr,
         contexts: [],
         style: 'warm_family',
         layout: 'photo_text',
         theme: 'light',
         diaryName: user.diary_name,
         diaryEmoji: user.diary_emoji,
         regenerate: true
       })
     });
     ```
   - (TODO) Отправка Push-уведомления

---

## 📖 Сценарии использования

### Сценарий 1: Создание первой книги (ручное)

**Пользователь**: Обычный пользователь (Free tier)

**Шаги**:

1. **Открытие полки книг**:
   - ReportsScreen → "Открыть полку книг"
   - BooksLibraryScreen открывается (пустая полка)

2. **Запуск визарда**:
   - Нажатие "Создать книгу"
   - BookCreationWizard открывается

3. **Шаг 1: Выбор периода**:
   - Date picker для начала и конца периода
   - Валидация: минимум 5 записей
   - Подсказка: "Выберите период с достаточным количеством записей"

4. **Шаг 2: Выбор категорий**:
   - Автоматическая загрузка доступных категорий из записей
   - Можно выбрать несколько или оставить пусто (все записи)
   - Кнопки "Выбрать все" / "Очистить"

5. **Шаг 3: Выбор стиля**:
   - 3 стиля с визуальным превью:
     - 🏡 Теплый семейный
     - 📖 Биографический
     - 🚀 Мотивационный
   - Превью показывает пример страницы с цветами стиля

6. **Шаг 4: Выбор макета**:
   - 3 макета с схематическим превью:
     - 📸 Фото + текст
     - 📝 Только текст
     - ✨ Минималистичный
   - Подсказка: "Сейчас будет создан черновик. Далее можно отредактировать и сохранить PDF."

7. **Генерация**:
   - Нажатие "Создать книгу"
   - BookGenerationProgress показывается (анимация прогресса)
   - Edge Function `books-generate-draft` вызывается
   - AI генерирует книгу, фото автоматически привязываются

8. **Модалка успеха**:
   - BookCreationSuccessModal с конфетти
   - Два CTA:
     - **Primary**: "Перейти к редактору книги" → BookDraftEditor
     - **Secondary**: "Перейти на полку книг" → BooksLibraryScreen

9. **Редактор**:
   - Редактирование названия, подзаголовка, вступления
   - Редактирование глав (название + content)
   - Загрузка дополнительных фото (drag & drop или клик)
   - Предпросмотр PDF (вкладка "Предпросмотр")
   - Нажатие "Создать финальную версию"

10. **PDF создан**:
    - Edge Function `books-render-pdf` загружает PDF в Storage
    - Редактор закрывается, открывается полка
    - Книга со статусом "Готово (PDF доступен)"
    - Доступны кнопки "Просмотр" и "Скачать"

**Результат**: Книга создана, PDF доступен для просмотра и скачивания

---

### Сценарий 2: Редактирование готовой книги (версионирование)

**Пользователь**: Любой пользователь

**Шаги**:

1. **Открытие полки**:
   - BooksLibraryScreen → видна готовая книга

2. **Создание новой версии**:
   - Нажатие "Создать новую версию"
   - Подтверждение: "Мы создадим копию. Оригинал сохранится."

3. **Создание черновика v2**:
   ```sql
   INSERT INTO books_archive (
     user_id, parent_book_id, version,
     period_start, period_end, contexts,
     style, layout, theme, story_json, metadata,
     is_draft, is_final, pdf_url
   ) VALUES (
     userId, originalId, 2,  -- version = 2
     periodStart, periodEnd, contexts,
     style, layout, theme, storyJson, metadata,
     true, false, null      -- Новый черновик
   )
   ```

4. **Редактор v2**:
   - BookDraftEditor открывается с копией книги
   - Версия отображается как "v2"
   - Пользователь вносит изменения:
     - Изменение текста главы
     - Добавление новых фото
     - Удаление фото

5. **Создание PDF v2**:
   - Нажатие "Создать финальную версию"
   - PDF v2 загружается в Storage
   - Статус меняется на "Готово"

6. **Результат**:
   - На полке две книги:
     - Оригинал (v1) — PDF доступен
     - Новая версия (v2) — PDF доступен

**Результат**: Оригинальная книга сохранена, новая версия создана

---

### Сценарий 3: Автоматическая генерация (Premium)

**Пользователь**: Premium пользователь

**Шаги**:

1. **Cron запуск**:
   - 1-го числа месяца в 9:00 утра
   - pg_cron вызывает `books-generate-monthly-auto`

2. **Обработка пользователей**:
   - Edge Function находит всех Premium пользователей
   - Для каждого:
     - Определяет период (прошлый месяц)
     - Проверяет наличие книги за период → пропускает если есть
     - Проверяет минимум 5 записей → пропускает если меньше
     - Вызывает `books-generate-draft` с параметрами:
       - `contexts: []` (все категории)
       - `style: 'warm_family'` (по умолчанию)
       - `layout: 'photo_text'` (по умолчанию)
       - `regenerate: true` (принудительная генерация)

3. **Создание книги**:
   - Черновик создается автоматически
   - Фото автоматически привязываются
   - Достижения собираются

4. **Уведомление**:
   - (TODO) Push-уведомление: "Твоя книга за месяц готова! 📖"

5. **Пользователь открывает приложение**:
   - Видит новую книгу на полке (черновик)
   - Может сразу отредактировать или создать PDF

**Результат**: Книга создана автоматически без действий пользователя

---

### Сценарий 4: Просмотр и скачивание книги

**Пользователь**: Любой пользователь

**Шаги**:

1. **Открытие полки**:
   - BooksLibraryScreen → видна готовая книга

2. **Просмотр PDF**:
   - Нажатие "Просмотр"
   - PDF открывается в новой вкладке браузера
   - URL: `book.pdfUrl` (public URL из Storage)

3. **Скачивание PDF**:
   - Нажатие "Скачать"
   - PDF скачивается через `window.open(book.pdfUrl, '_blank')`

**Результат**: PDF просмотрен или скачан

---

### Сценарий 5: Удаление книги

**Пользователь**: Владелец книги

**Шаги**:

1. **Открытие полки**:
   - BooksLibraryScreen → видна книга

2. **Удаление**:
   - Нажатие "Удалить"
   - BookDeleteConfirmModal показывается
   - Подтверждение удаления

3. **Удаление из БД**:
   ```sql
   DELETE FROM books_archive WHERE id = bookId
   ```
   - CASCADE удаляет связанные записи из `book_photos`

4. **Удаление PDF из Storage** (если есть):
   ```typescript
   const fileName = book.pdfUrl.split('/').pop();
   await supabase.storage
     .from('books')
     .remove([`${userId}/${fileName}`]);
   ```

5. **Обновление списка**:
   - Книга удаляется из локального состояния
   - Toast: "Книга удалена"

**Результат**: Книга удалена из БД и Storage

---

## 🔄 Версионирование

### Логика версионирования

**Цель**: Позволить пользователям редактировать готовые книги без потери оригинала

**Механизм**:

1. **Поля в БД**:
   - `parent_book_id`: UUID оригинальной книги (NULL для первой версии)
   - `version`: Номер версии (1, 2, 3...)

2. **Создание новой версии**:
   ```typescript
   // В BooksLibraryScreen.handleCreateNewVersion()
   const { data } = await supabase
     .from('books_archive')
     .insert({
       user_id: book.userId,
       parent_book_id: book.parentBookId || book.id,  // Родитель = оригинал
       version: (book.version ?? 1) + 1,                // Версия +1
       period_start: book.periodStart,
       period_end: book.periodEnd,
       contexts: book.contexts,
       style: book.style,
       layout: book.layout,
       theme: book.theme,
       metadata: book.metadata,
       story_json: book.storyJson,                     // Копия story_json
       is_draft: true,                                 // Новый черновик
       is_final: false,
       pdf_url: null                                  // PDF еще нет
     });
   ```

3. **Отображение версии**:
   ```typescript
   // В BooksLibraryScreen (UI)
   {book.version && book.version > 1 && (
     <div className="version-badge">v{book.version}</div>
   )}
   ```

4. **Структура версий**:
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

**Особенности**:

- ✅ Оригинальный PDF остается неизменным
- ✅ Каждая версия имеет свой PDF
- ✅ Все версии видны на полке
- ✅ Версия отображается на обложке (v2, v3...)

---

## 🤖 Автоматическая генерация

### Cron расписание

```sql
-- Миграция: schedule_monthly_books_generation
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

### Логика автоматической генерации

**Условия для генерации**:

1. ✅ Пользователь Premium (`is_premium = true`)
2. ✅ Нет книги за прошлый месяц
3. ✅ Минимум 5 записей за прошлый месяц

**Параметры по умолчанию**:

- `contexts: []` (все категории)
- `style: 'warm_family'` (теплый семейный)
- `layout: 'photo_text'` (фото + текст)
- `theme: 'light'` (светлая тема)
- `regenerate: true` (принудительная генерация)

**Результат**:

- Черновик создается автоматически
- Пользователь получает Push-уведомление (TODO)
- Книга появляется на полке как черновик
- Пользователь может отредактировать или создать PDF

---

## 📸 Фото-книги

### Автоматическая привязка фото

**Источник фото**: Поле `media` в таблице `entries`

**Структура `media`**:
```typescript
type MediaItem = {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
};
```

**Процесс привязки**:

1. **Сбор фото из записей** (в `books-generate-draft`):
   ```typescript
   const photosFromEntries = entries.flatMap(entry => 
     entry.media
       ?.filter(m => m.type === 'image' && m.url)
       .map(m => ({
         entryId: entry.id,
         url: m.url,
         createdAt: entry.created_at
       }))
   );
   ```

2. **AI возвращает `source_entry_ids`** для каждой главы:
   ```typescript
   // В ответе OpenAI:
   {
     chapters: [
       {
         title: "Глава 1",
         content: "...",
         source_entry_ids: ["entry-id-1", "entry-id-2"]  // ✅ ID записей
       }
     ]
   }
   ```

3. **Автоматическая привязка** (после сохранения черновика):
   ```typescript
   for (let i = 0; i < storyJson.chapters.length; i++) {
     const chapter = storyJson.chapters[i];
     const chapterPhotos = photosFromEntries.filter(
       p => chapter.source_entry_ids?.includes(p.entryId)
     );
     
     for (const photo of chapterPhotos) {
       await supabase.from('book_photos').insert({
         book_id: draftId,
         chapter_index: i,
         photo_url: photo.url,
         caption: new Date(photo.createdAt).toLocaleDateString()
       });
     }
   }
   ```

### Ручная загрузка фото

**В редакторе** (`BookDraftEditor`):

1. **Загрузка фото**:
   ```typescript
   const handlePhotoUpload = async (chapterIndex: number, file: File) => {
     // 1. Загрузка в Storage
     const fileName = `${userId}/${draftId}/${uuidv4()}.${fileExt}`;
     await supabase.storage
       .from('book-photos')
       .upload(fileName, file);
     
     // 2. Получение public URL
     const { data } = supabase.storage
       .from('book-photos')
       .getPublicUrl(fileName);
     
     // 3. Сохранение в БД
     await supabase.from('book_photos').insert({
       book_id: draftId,
       chapter_index: chapterIndex,
       photo_url: data.publicUrl
     });
   };
   ```

2. **Удаление фото**:
   ```typescript
   const handleDeletePhoto = async (photoId: string) => {
     // 1. Удаление из БД
     await supabase.from('book_photos').delete().eq('id', photoId);
     
     // 2. (Опционально) Удаление из Storage
     // ...
   };
   ```

### Отображение фото в PDF

**В `BookPDF` компоненте** (`BookDraftEditor.tsx`):

```typescript
{photos
  .filter(p => p.chapterIndex === index)
  .map(photo => (
    <View key={photo.id}>
      <Image
        src={photo.photoUrl}
        style={{ width: '100%', height: 200 }}
      />
      {photo.caption && (
        <Text style={{ fontSize: 10, fontStyle: 'italic' }}>
          {photo.caption}
        </Text>
      )}
    </View>
  ))}
```

**Условия отображения**:

- ✅ Фото показываются только для `layout = 'photo_text'`
- ✅ Фото отображаются перед текстом главы
- ✅ Подпись (caption) показывается под фото

---

## 📄 PDF Рендеринг

### Библиотека

**@react-pdf/renderer**: Клиентский рендеринг PDF

### Структура PDF

```
1. Титульный лист
   - Emoji + Название книги
   - Подзаголовок (период)

2. Оглавление
   - Список всех глав с нумерацией
   - Глава достижений (если есть)

3. Вступление (Prologue)
   - Текст из story.prologue

4. Главы (Chapters)
   - Название главы
   - Фото (если есть, для layout photo_text)
   - Текст контента

5. Достижения за период (если есть)
   - Список достижений с bullet points

6. Заключение (Epilogue)
   - Текст из story.epilogue

7. Посвящение (Dedication) - опционально
   - Текст из story.dedication
```

### Процесс рендеринга

**В `BookDraftEditor`**:

1. **Создание PDF компонента**:
   ```typescript
   <BlobProvider document={<BookPDF {...props} />}>
     {({ blob, url, loading, error }) => {
       // blob готов для скачивания
       // url готов для предпросмотра
     }}
   </BlobProvider>
   ```

2. **Предпросмотр**:
   ```typescript
   // Вкладка "Предпросмотр"
   <iframe src={pdfUrl} style={{ width: '100%', height: '600px' }} />
   ```

3. **Создание финального PDF**:
   ```typescript
   const handleRenderPDF = async (blob: Blob) => {
     // 1. Конвертация Blob → base64
     const reader = new FileReader();
     reader.readAsDataURL(blob);
     const base64String = await new Promise(resolve => {
       reader.onloadend = () => resolve(reader.result);
     });
     
     // 2. Расчет страниц и слов
     const pages = Math.ceil(totalChars / 2000);
     const wordCount = totalWords;
     
     // 3. Отправка на сервер
     await fetch(`${API_URLS.BOOKS_RENDER_PDF}/${draftId}/upload`, {
       method: 'PUT',
       headers: {
         Authorization: `Bearer ${token}`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         pdfBlob: base64String,
         pages,
         wordCount
       })
     });
   };
   ```

4. **Загрузка в Storage** (Edge Function):
   ```typescript
   // Конвертация base64 → Uint8Array
   const base64Data = pdfBlob.replace(/^data:application\/pdf;base64,/, '');
   const bytes = new Uint8Array(
     atob(base64Data).split('').map(c => c.charCodeAt(0))
   );
   
   // Загрузка
   await supabase.storage
     .from('books')
     .upload(`${userId}/${draftId}.pdf`, bytes, {
       contentType: 'application/pdf',
       upsert: true
     });
   ```

### Стили PDF

**Дизайн зависит от `style`**:

- **warm_family**: Теплые цвета, семейные мотивы
- **biographical**: Классический биографический стиль
- **motivational**: Яркие цвета, мотивационные элементы

**Макет зависит от `layout`**:

- **photo_text**: Фото перед текстом главы
- **text_only**: Только текст, без фото
- **minimal**: Минималистичный дизайн

---

## 🔐 Безопасность

### RLS (Row Level Security)

**Таблица `books_archive`**:
```sql
-- Пользователь может видеть только свои книги
CREATE POLICY "Users can view own books"
ON books_archive FOR SELECT
USING (auth.uid() = user_id);

-- Пользователь может создавать только свои книги
CREATE POLICY "Users can insert own books"
ON books_archive FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Пользователь может обновлять только свои книги
CREATE POLICY "Users can update own books"
ON books_archive FOR UPDATE
USING (auth.uid() = user_id);

-- Пользователь может удалять только свои книги
CREATE POLICY "Users can delete own books"
ON books_archive FOR DELETE
USING (auth.uid() = user_id);
```

**Таблица `book_photos`**:
```sql
-- Пользователь может видеть фото только своих книг
CREATE POLICY "Users can view photos of own books"
ON book_photos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM books_archive
    WHERE books_archive.id = book_photos.book_id
      AND books_archive.user_id = auth.uid()
  )
);
```

**Storage Bucket `books`**:
```sql
-- Пользователь может загружать PDF только в свою папку
CREATE POLICY "Users can upload own PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'books'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 📊 Оптимизация

### Кэширование черновиков

**Цель**: Экономия токенов OpenAI при повторных генерациях

**Механизм**:

1. **Проверка кэша** (если `regenerate=false`):
   ```sql
   SELECT * FROM books_archive
   WHERE user_id = userId
     AND period_start = periodStart
     AND period_end = periodEnd
     AND style = style
     AND is_draft = true
   ORDER BY created_at DESC
   LIMIT 1
   ```

2. **Если найден**:
   - Возврат существующего `story_json`
   - Флаг `cached: true`
   - Экономия до 100% токенов

3. **Если не найден**:
   - Генерация нового черновика через OpenAI
   - Сохранение в БД для будущего использования

**Экономия**: До 100% при повторных генерациях с теми же параметрами

---

## 🎨 UI/UX

### Дизайн-токены

**Все компоненты используют iOS Design Tokens**:

```css
/* Вместо хардкода */
bg-white → bg-(--ios-bg-primary)
text-black → text-(--ios-text-primary)
border-gray-200 → border-border
```

### Визуальные превью

**В визарде**:

- **Step3Style**: Мини-карточка с примером страницы для каждого стиля
- **Step4Layout**: Схематическое отображение макета страницы

**На полке**:

- **Обложки книг**: Градиент фона по стилю, миниатюра с emoji и названием
- **Бейдж статуса**: "Черновик" / "Готово"
- **Версия**: Отображается на обложке (v2, v3...)

---

## 📝 Заключение

Система книг UNITY — это **полнофункциональная платформа** для создания персонализированных PDF-книг из записей дневника. Она включает:

- ✅ AI-генерацию с кэшированием
- ✅ Версионирование книг
- ✅ Автоматическую генерацию для Premium
- ✅ Фото-книги с автоматической привязкой
- ✅ Главу достижений
- ✅ Многоязычность
- ✅ Безопасность (RLS)
- ✅ Красивый UI/UX

**Готовность**: 100% для Production

---

**Дата обновления**: 2025-11-21  
**Автор**: UNITY Team

