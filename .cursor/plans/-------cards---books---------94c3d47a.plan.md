<!-- 94c3d47a-db83-4b11-b243-8d6ed609015d 285b10a5-f912-4c5e-bc21-ca396a3dacae -->
# Анализ реализации Cards Module и Books Module

## 📊 ТЕКУЩЕЕ СОСТОЯНИЕ

### ✅ ЧТО УЖЕ РЕАЛИЗОВАНО

#### 1. Cards Module (частично реализовано ~60%)

**Реализованные компоненты:**

- ✅ **AchievementHomeScreen** с SwipeCard компонентом
  - Свайп-карточки с анимацией (right/left swipe)
  - Стековая визуализация (до 3 карточек)
  - Градиенты по sentiment (positive/neutral/negative)
  - Мультиязычные дефолтные мотивации (ru/en/es/de/fr/zh/ja)

- ✅ **AI анализ записей** 
  - POST `/chat/analyze` - анализирует текст с OpenAI
  - Возвращает: reply, summary, insight, sentiment, category, tags, mood
  - Сохраняет в DiaryEntry с полями aiSummary, aiInsight

- ✅ **Хранилище данных**
  - KV Store (`kv_store_9729c493`) для записей
  - Структура: `entry:{entryId}` и `user_entries:{userId}`

**Проблемы текущей реализации:**

❌ **Нет таблицы entry_summaries**

  - По PRD требуется отдельная таблица для оптимизации токенов
  - Сейчас summary хранится в DiaryEntry, но не кэшируется отдельно

❌ **Нет API endpoint `getMotivationCards`**

  - Отсутствует GET `/api/motivations/cards/{userId}`
  - Карточки генерируются из всех записей, а не из последних 48 часов

❌ **Нет системы KV кэширования просмотренных карточек**

  - Отсутствует `card_views:{userId}` с TTL 24h
  - Нет API `markCardAsRead`

❌ **Не реализована фильтрация по времени**

  - Карточки показываются из всех записей, а не за последние 48 часов

#### 2. Books Module (НЕ РЕАЛИЗОВАНО 0%)

**Полностью отсутствует:**

❌ **Таблицы в БД:**

  - `books_archive` - хранилище PDF книг
  - `story_snapshots` - агрегированные данные по периодам

❌ **UI компоненты:**

  - Мастер создания книги (Step 1-3)
  - Draft Editor экран
  - Books Library экран

❌ **Backend функции:**

  - `compile_snapshot` - агрегация данных
  - `generate_draft` - AI генерация текста книги
  - `render_pdf` - рендеринг PDF

❌ **API endpoints:**

  - POST `/api/books/generate-draft`
  - GET `/api/books/{draftId}`
  - POST `/api/books/{draftId}/save`
  - POST `/api/books/{draftId}/render-pdf`
  - GET `/api/books/archive`

## 🔧 ЧТО НУЖНО ДОРАБОТАТЬ

### Приоритет 1: Завершить Cards Module

1. **Создать таблицу entry_summaries**
```sql
CREATE TABLE entry_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES entries(id),
  user_id UUID REFERENCES profiles(id),
  summary_json JSONB NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

2. **Реализовать API getMotivationCards**

  - Фильтр по последним 48 часам
  - Исключение просмотренных карточек из KV
  - Добавление дефолтных карточек при нехватке

3. **Добавить KV кэширование просмотров**

  - `card_views:{userId}` с TTL 86400 сек
  - API endpoint `markCardAsRead`

4. **Модифицировать AI анализ**

  - После анализа сохранять summary в entry_summaries
  - Записывать tokens_used для метрик

### Приоритет 2: Реализовать Books Module

1. **Создать миграции БД**

  - Таблица books_archive
  - Таблица story_snapshots

2. **Разработать UI Wizard**

  - SelectPeriodStep
  - SelectContextsStep  
  - ChooseStyleStep

3. **Реализовать backend**

  - Функция compile_snapshot
  - AI генерация истории
  - PDF рендеринг (Puppeteer)

4. **API endpoints**

  - Полный CRUD для книг
  - Supabase Storage интеграция для PDF (вместо S3)

### Приоритет 3: Token Optimization

1. **Иерархическое кэширование**

  - Monthly snapshots → Quarterly → Yearly
  - Избегать повторного анализа

2. **Метрики использования**

  - Таблица openai_usage уже есть
  - Интегрировать подсчёт токенов во все AI вызовы

## 💡 РЕКОМЕНДАЦИИ

### Архитектурные решения:

1. **Мигрировать с KV Store на Supabase Tables**

  - Сейчас записи в `kv_store_9729c493`, но есть таблица `entries`
  - Использовать реляционную БД для лучшей структуры

2. **Разделить Edge Functions**

  - `cards-api.ts` - для карточек
  - `books-api.ts` - для книг
  - `ai-analysis.ts` - для OpenAI

3. **Добавить RLS политики**

  - Таблица entries включена RLS, но без политик
  - Защитить entry_summaries, books_archive

### Технические улучшения:

1. **TypeScript типизация**

  - Создать shared types для Cards/Books
  - Избежать дублирования интерфейсов

2. **Error Handling**

  - Централизованная обработка ошибок OpenAI
  - Retry логика для AI запросов

3. **Caching Strategy**

  - React Query для клиентского кэша
  - Invalidation при новых записях

### Метрики и мониторинг:

1. **Dashboard для токенов**

  - Визуализация использования openai_usage
  - Алерты при превышении бюджета

2. **Performance tracking**

  - Время генерации карточек < 2 сек
  - Время генерации книги < 45 сек

## 📈 ОЦЕНКА ТРУДОЗАТРАТ

- **Cards Module доработка:** 3-4 дня
  - DB миграции: 4 часа
  - API endpoints: 8 часов
  - KV интеграция: 4 часа
  - Тестирование: 8 часов

- **Books Module с нуля:** 10-12 дней
  - DB схема: 1 день
  - UI Wizard: 3 дня
  - Backend logic: 4 дня
  - PDF rendering: 2 дня
  - Тестирование: 2 дня

- **Token Optimization:** 2-3 дня
  - Snapshot агрегация: 1 день
  - Метрики: 1 день
  - Оптимизация: 1 день

**Итого:** ~15-19 дней на полную реализацию