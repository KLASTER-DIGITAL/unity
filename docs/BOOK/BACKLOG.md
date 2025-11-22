# 📋 Backlog системы книг UNITY

**Дата создания**: 2025-11-22  
**Статус**: 📋 АКТИВНЫЙ BACKLOG  
**Ссылка на Master документ**: [BOOKS_SYSTEM_MASTER.md](./BOOKS_SYSTEM_MASTER.md)

---

## 🎯 Приоритеты

### P0 - КРИТИЧНО (СДЕЛАТЬ СЕЙЧАС)

#### 1. FREE vs PREMIUM разделение

**Статус**: ⏳ TODO  
**Оценка**: 1 день  
**Зависимости**: Нет

**Задачи**:

- [ ] **Миграция БД**: Добавить поля `plan_type`, `type`, `language` в `books_archive`
  ```sql
  ALTER TABLE books_archive
  ADD COLUMN plan_type TEXT NOT NULL DEFAULT 'premium'
    CHECK (plan_type IN ('free', 'premium')),
  ADD COLUMN type TEXT NOT NULL DEFAULT 'month'
    CHECK (type IN ('month', 'quarter', 'year', 'family', 'custom')),
  ADD COLUMN language TEXT NOT NULL DEFAULT 'ru'
    CHECK (language IN ('ru', 'en', 'es', 'de', 'fr', 'zh', 'ja', 'ka'));
  
  CREATE INDEX idx_books_archive_plan_type ON books_archive(user_id, plan_type);
  CREATE INDEX idx_books_archive_user_period ON books_archive(user_id, period_start, period_end);
  ```

- [ ] **Edge Function**: Создать `books-generate-free`
  - Без AI
  - Простая структура (список записей)
  - Время генерации < 5 сек

- [ ] **Frontend**: Добавить Шаг 0 в визард
  - Выбор FREE / PREMIUM
  - Разные потоки визарда

- [ ] **Frontend**: Premium Upsell модалка
  - Кнопка "Создать AI-книгу (Premium)"
  - Список преимуществ Premium
  - Переход на paywall

**Критерии приемки**:
- ✅ FREE книга создается без AI
- ✅ Время генерации FREE < 5 сек
- ✅ PREMIUM книга работает как раньше
- ✅ Видна разница FREE vs PREMIUM в UI

---

#### 2. Snapshot Layer

**Статус**: ⏳ TODO  
**Оценка**: 1 день  
**Зависимости**: Нет

**Задачи**:

- [ ] **Миграция БД**: Создать таблицу `monthly_snapshots`
  ```sql
  CREATE TABLE monthly_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    total_entries INTEGER DEFAULT 0,
    active_days INTEGER DEFAULT 0,
    emotions_distribution JSONB,
    streaks JSONB,
    top_topics TEXT[],
    top_persons TEXT[],
    achievements_count INTEGER DEFAULT 0,
    significant_events JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, period_start, period_end)
  );
  ```

- [ ] **Edge Function**: Создать `snapshots-generate-monthly`
  - Агрегация данных за период
  - Подсчет статистики
  - AI-summary significant events
  - Сохранение в БД

- [ ] **Cron**: Настроить автоматическую генерацию
  ```sql
  SELECT cron.schedule(
    'generate-monthly-snapshots',
    '0 0 1 * *',
    $$
    SELECT net.http_post(
      url := 'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/snapshots-generate-monthly'
    );
    $$
  );
  ```

- [ ] **Интеграция**: Обновить `books-generate-draft`
  - Загружать snapshot для периода
  - Использовать в AI промпте

**Критерии приемки**:
- ✅ Snapshots генерируются автоматически 1-го числа
- ✅ AI использует snapshot вместо всех записей
- ✅ Скорость генерации увеличилась
- ✅ Качество книг улучшилось (AI видит общую картину)

---

#### 3. entry_summaries

**Статус**: ⏳ TODO  
**Оценка**: 1 день  
**Зависимости**: Нет

**Задачи**:

- [ ] **Миграция БД**: Создать таблицу `entry_summaries`
  ```sql
  CREATE TABLE entry_summaries (
    id UUID PRIMARY KEY,
    entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    
    short_summary TEXT,
    insight TEXT,
    mood TEXT,
    topics TEXT[],
    persons TEXT[],
    has_achievement BOOLEAN,
    excerpt TEXT,
    
    tokens_used INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(entry_id)
  );
  ```

- [ ] **Edge Function**: Обновить `books-generate-draft`
  - Использовать `entry_summaries` вместо `entries`
  - Экономия токенов ~90%

- [ ] **Backend**: Генерация summaries при создании entries
  - Интеграция с существующим AI pipeline
  - Автоматическое создание summary

**Критерии приемки**:
- ✅ AI использует summaries вместо raw text
- ✅ Экономия токенов ≥ 90%
- ✅ Скорость генерации увеличилась
- ✅ Качество книг не ухудшилось

---

#### 4. Удаление дублей кода

**Статус**: ⏳ TODO  
**Оценка**: 0.5 дня  
**Зависимости**: Нет

**Задачи**:

- [ ] **Удалить**: `src/features/mobile/reports/components/BookCreationWizard.tsx` (старый)
  - Оставить только `book-creation-wizard/BookCreationWizard.tsx`

- [ ] **Создать хук**: `useBooksList`
  ```typescript
  // src/features/mobile/reports/hooks/useBooksList.ts
  export function useBooksList(userId: string) {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    
    const fetchBooks = async () => { ... };
    const deleteBook = async (bookId: string) => { ... };
    
    return { books, loading, fetchBooks, deleteBook };
  }
  ```

- [ ] **Рефакторинг**: `BooksLibraryScreen.tsx` и `.native.tsx`
  - Использовать общий хук
  - Удалить дублированную логику

**Критерии приемки**:
- ✅ Старый BookCreationWizard удален
- ✅ Логика BooksLibraryScreen вынесена в хук
- ✅ Код чистый, нет дублей
- ✅ Все компоненты работают

---

### P1 - ВАЖНО (СДЕЛАТЬ НА ЭТОЙ НЕДЕЛЕ)

#### 5. Context Engine (person_tags)

**Статус**: ⏳ TODO  
**Оценка**: 0.5 дня  
**Зависимости**: #3 (entry_summaries)

**Задачи**:

- [ ] **Миграция БД**: Добавить `person_tags` в `entries`
  ```sql
  ALTER TABLE entries
  ADD COLUMN person_tags TEXT[];
  
  CREATE INDEX idx_entries_person_tags ON entries USING GIN (person_tags);
  ```

- [ ] **AI промпт**: Обновить для Context Engine
  - Анализ `persons` из `entry_summaries`
  - Создание глав по персонам: "Карина", "Арина", "Семья"

- [ ] **Frontend**: UI для person_tags
  - При создании записи: выбор людей
  - Автозаполнение из истории

**Критерии приемки**:
- ✅ AI создает главы по персонам
- ✅ Семейные книги работают корректно
- ✅ Персональные книги ("Книга о Карине") работают

---

#### 6. AI Style Guide

**Статус**: ⏳ TODO  
**Оценка**: 0.5 дня  
**Зависимости**: Нет

**Задачи**:

- [ ] **Документация**: Создать `AI_STYLE_GUIDE.md`
  - Философия текста
  - Примеры хорошего и плохого стиля
  - Рекомендации для каждого стиля

- [ ] **AI промпт**: Интегрировать Style Guide
  - Добавить в system_prompt
  - Примеры в промпт

**Критерии приемки**:
- ✅ AI пишет тёплым, поддерживающим тоном
- ✅ Нет сухих отчетов
- ✅ Тексты соответствуют философии UNITY

---

#### 7. AI-операции для стилей

**Статус**: ⏳ TODO  
**Оценка**: 0.5 дня  
**Зависимости**: #6 (AI Style Guide)

**Задачи**:

- [ ] **Миграция БД**: Создать AI-операции
  ```sql
  INSERT INTO ai_operations (id, name, description, system_prompt, user_prompt, model)
  VALUES
    ('book_generation_warm_family', 'Теплый семейный', '...', '...', '...', 'gpt-4o-mini'),
    ('book_generation_biographical', 'Биографический', '...', '...', '...', 'gpt-4o-mini'),
    ('book_generation_motivational', 'Мотивационный', '...', '...', '...', 'gpt-4o-mini');
  ```

- [ ] **Edge Function**: Обновить `books-generate-draft`
  - Динамический выбор операции по `style`
  - `const aiOperationId = 'book_generation_' + style;`

**Критерии приемки**:
- ✅ Каждый стиль имеет свой промпт
- ✅ AI генерирует разные тексты для разных стилей
- ✅ Стили визуально отличаются

---

#### 8. Puppeteer PDF

**Статус**: ⏳ TODO  
**Оценка**: 1 день  
**Зависимости**: Нет

**Задачи**:

- [ ] **Edge Function**: Создать `books-render-puppeteer`
  - Puppeteer integration
  - HTML → PDF
  - Встроенные шрифты (Noto Sans)

- [ ] **HTML шаблоны**: Для каждого стиля
  - `templates/books/warm_family.html`
  - `templates/books/biographical.html`
  - `templates/books/motivational.html`

- [ ] **Frontend**: Интеграция
  - Отправка HTML на сервер
  - Получение PDF URL

**Критерии приемки**:
- ✅ PDF рендерится на сервере
- ✅ Unicode работает (русский, грузинский)
- ✅ Длинные книги стабильны
- ✅ Идентичный рендер на всех устройствах

---

### P2 - ЖЕЛАТЕЛЬНО (СДЕЛАТЬ В ТЕЧЕНИЕ МЕСЯЦА)

#### 9. Offline Mode

**Статус**: ⏳ TODO  
**Оценка**: 1 день  
**Зависимости**: Нет

**Задачи**:

- [ ] **Frontend (PWA)**: Кэширование PDF
  - IndexedDB для хранения
  - Offline доступ к просмотру

- [ ] **Frontend (React Native)**: Кэширование PDF
  - AsyncStorage для хранения
  - Offline доступ

- [ ] **Sync**: При восстановлении сети
  - Синхронизация черновиков
  - Загрузка новых книг

**Критерии приемки**:
- ✅ PDF доступен offline
- ✅ Черновики сохраняются локально
- ✅ Sync работает при восстановлении сети

---

#### 10. Батчинг AI запросов

**Статус**: ⏳ TODO  
**Оценка**: 0.5 дня  
**Зависимости**: Нет

**Задачи**:

- [ ] **AI промпт**: Один вызов вместо нескольких
  - Вся структура книги в одном ответе
  - Prologue + Chapters + Epilogue + Quotes

- [ ] **Edge Function**: Обновить `books-generate-draft`
  - Один AI call

**Критерии приемки**:
- ✅ Скорость генерации увеличилась
- ✅ Стоимость снизилась

---

#### 11. Агрессивное кэширование

**Статус**: ⏳ TODO  
**Оценка**: 0.5 дня  
**Зависимости**: #3 (entry_summaries)

**Задачи**:

- [ ] **Backend**: Хэширование содержимого
  ```typescript
  const contentHash = await hashEntries(summaries);
  ```

- [ ] **Кэш**: Проверка по content hash
  - Если хэш совпадает → возврат кэшированного черновика

**Критерии приемки**:
- ✅ Кэш-хит rate > 50%
- ✅ Экономия токенов увеличилась

---

#### 12. Параллельная генерация

**Статус**: ⏳ TODO  
**Оценка**: 0.5 дня  
**Зависимости**: Нет

**Задачи**:

- [ ] **Edge Function**: Параллелизация
  ```typescript
  const [aiResult, photosResult, achievementsResult] = await Promise.all([
    generateAIContent(summaries),
    fetchPhotos(entries),
    fetchAchievements(entries)
  ]);
  ```

**Критерии приемки**:
- ✅ Скорость генерации увеличилась
- ✅ Время генерации < 15 сек

---

## 📊 Метрики прогресса

### Документация

- [x] Консолидация документов (17 → 3 файла)
- [x] Создан Master документ
- [ ] Архивированы старые версии
- [ ] Backlog активен

### Код

- [ ] P0: 4 задачи (0% выполнено)
- [ ] P1: 4 задачи (0% выполнено)
- [ ] P2: 4 задачи (0% выполнено)

**Итого**: 0/12 задач (0%)

### Бизнес

- [ ] Конверсия FREE → PREMIUM: > 10%
- [ ] Удержание Premium: > 80%
- [ ] NPS книг: > 8.5

---

## 🗓️ Спринты

### Спринт 1 (2025-11-22 → 2025-11-25) - P0

**Цель**: Решить критичные проблемы

- [ ] #1: FREE vs PREMIUM
- [ ] #2: Snapshot Layer
- [ ] #3: entry_summaries
- [ ] #4: Удаление дублей

**Результат**: Система стабильна, экономична, быстра

---

### Спринт 2 (2025-11-26 → 2025-11-28) - P1

**Цель**: Улучшить качество книг

- [ ] #5: Context Engine
- [ ] #6: AI Style Guide
- [ ] #7: AI-операции для стилей
- [ ] #8: Puppeteer PDF

**Результат**: Книги высокого качества, разные стили работают

---

### Спринт 3 (2025-11-29 → 2025-12-05) - P2

**Цель**: Оптимизация

- [ ] #9: Offline Mode
- [ ] #10: Батчинг AI
- [ ] #11: Агрессивное кэширование
- [ ] #12: Параллельная генерация

**Результат**: Система быстрая, экономная, работает offline

---

## 📝 История обновлений

### 2025-11-22

- ✅ Создан Backlog
- ✅ Определены задачи P0, P1, P2
- ✅ Спланированы спринты

---

**Дата последнего обновления**: 2025-11-22  
**Версия**: 1.0  
**Статус**: 📋 АКТИВНЫЙ BACKLOG

