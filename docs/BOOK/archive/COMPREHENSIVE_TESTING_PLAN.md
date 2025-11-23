# 🧪 Комплексный план тестирования системы книг

**Дата**: 2025-11-22  
**Статус**: 📋 ПЛАН ГОТОВ  
**Цель**: Полное тестирование системы книг (Unit + UI/UX + Консоль)

---

## 📊 Статус системы

### ✅ Реализовано
- **P0**: 4/4 задачи (100%) ✅
- **P1**: 4/4 задачи (100%) ✅
- **P2**: 3/4 задачи (75%) ✅

**ВЫВОД**: Система готова к тестированию!

---

## 🎯 Цели тестирования

1. **Unit тесты**: Проверить логику Edge Functions
2. **UI/UX тесты**: Проверить пользовательский опыт
3. **Консоль**: Проверить отсутствие ошибок
4. **Performance**: Проверить скорость генерации
5. **Security**: Проверить Supabase Advisors

---

## 🔧 Фаза 1: Unit тесты (Backend)

### 1.1. Edge Function: books-generate-free

**Endpoint**: `POST /books-generate-free`

**Test Cases**:

```typescript
// TC1: Успешная генерация FREE книги
✅ Проверить:
- periodStart, periodEnd валидны
- Возвращает draftId
- plan_type = 'free'
- Время генерации < 5 сек
- Нет вызовов AI (токены = 0)

// TC2: Недостаточно записей (< 1)
✅ Проверить:
- Возвращает ошибку
- Сообщение: "Недостаточно записей"

// TC3: FREE tier limit (max 3 книги)
✅ Проверить:
- У пользователя уже 3 FREE книги
- Возвращает ошибку
- Сообщение: "Лимит FREE книг исчерпан"

// TC4: Multilanguage
✅ Проверить:
- language = 'en'
- Переводы на английском
- Все UI элементы переведены
```

**Команда**:
```bash
curl -X POST https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/books-generate-free \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "TEST_USER_ID",
    "periodStart": "2025-10-01",
    "periodEnd": "2025-10-31",
    "language": "ru"
  }'
```

---

### 1.2. Edge Function: books-generate-draft (PREMIUM)

**Endpoint**: `POST /books-generate-draft`

**Test Cases**:

```typescript
// TC1: Успешная генерация PREMIUM книги
✅ Проверить:
- Использует entry_summaries
- Использует monthly_snapshots
- plan_type = 'premium'
- Время генерации < 30 сек
- AI токены < 50,000 (экономия 90%)
- Агрессивное кэширование работает (contentHash)

// TC2: Context Engine (person_tags)
✅ Проверить:
- AI анализирует persons из summaries
- Создает главы по персонам ("Карина", "Арина")
- Главы логически структурированы

// TC3: AI Style Guide
✅ Проверить:
- Тон: теплый, поддерживающий
- Нет сухих отчетов
- Нет осуждения

// TC4: Batching AI
✅ Проверить:
- Один вызов AI для всей структуры
- Возвращает: prologue, chapters[], epilogue

// TC5: Кэширование
✅ Проверить:
- Первый запрос: AI генерация (30 сек)
- Второй запрос: возврат кэша (< 5 сек)
- contentHash корректен
```

**Команда**:
```bash
curl -X POST https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/books-generate-draft \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "TEST_USER_ID",
    "periodStart": "2025-10-01",
    "periodEnd": "2025-10-31",
    "contexts": [],
    "style": "warm_family",
    "layout": "photo_text",
    "theme": "light",
    "regenerate": false
  }'
```

---

### 1.3. Edge Function: books-render-puppeteer

**Endpoint**: `POST /books-render-puppeteer`

**Test Cases**:

```typescript
// TC1: Успешный рендер PDF
✅ Проверить:
- Puppeteer генерирует PDF
- PDF загружен в Storage
- pdfUrl возвращен
- is_final = true

// TC2: Unicode support
✅ Проверить:
- Русский текст корректен (Привет, Карина)
- Грузинский текст корректен (გამარჯობა)
- Эмодзи корректны (📖, ❤️, 🎉)

// TC3: Styles
✅ Проверить:
- warm_family: фиолетовые цвета (#9333ea)
- biographical: синие цвета (#2563eb)
- motivational: зеленые цвета (#16a34a)

// TC4: Long books
✅ Проверить:
- 50+ страниц: стабильность
- 100+ страниц: нет падений
```

**Команда**:
```bash
curl -X POST https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/books-render-puppeteer \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "BOOK_ID"
  }'
```

---

### 1.4. Edge Function: snapshots-generate-monthly

**Endpoint**: `POST /snapshots-generate-monthly`

**Test Cases**:

```typescript
// TC1: Генерация snapshot
✅ Проверить:
- total_entries корректен
- active_days корректен
- emotions_distribution JSONB корректен
- top_topics корректен (TEXT[])
- top_persons корректен (TEXT[])
- significant_events JSONB корректен (AI резюме)

// TC2: Cron job
✅ Проверить:
- Cron запускается 1-го числа в 9:00
- Все пользователи обработаны
- Нет ошибок в логах
```

---

### 1.5. Edge Function: entry-summaries-generate

**Endpoint**: `POST /entry-summaries-generate`

**Test Cases**:

```typescript
// TC1: Генерация summaries
✅ Проверить:
- summary_json JSONB корректен:
  - short_summary (200-300 символов)
  - insight (ключевой инсайт)
  - mood (AI настроение)
  - topics (TEXT[])
  - persons (TEXT[])
  - has_achievement (boolean)
  - excerpt (цитата)

// TC2: Batch processing
✅ Проверить:
- Обрабатывает 10+ entries
- Параллельная обработка (Promise.all)
- Нет rate limiting
```

---

## 🎨 Фаза 2: UI/UX тесты (Frontend)

### 2.1. BookCreationWizard (FREE Flow)

**URL**: `https://unity-wine.vercel.app`

**Test Cases**:

```typescript
// TC1: FREE пользователь
✅ Шаги:
1. Открыть визард
2. Увидеть Step0: Выбор FREE/PREMIUM
3. Выбрать FREE
4. Шаг 1: Период (октябрь 2025)
5. Шаг 2: Категории (все)
6. Пропуск Шага 3 (стили) ✅
7. Пропуск Шага 4 (макеты) ✅
8. Генерация < 5 сек ✅
9. Успешная модалка с конфетти
10. Переход к редактору

✅ Проверить:
- Прогресс-бар: 3 шага (FREE)
- Нет шагов 3 и 4
- Время генерации < 5 сек
- Книга создана с plan_type='free'

// TC2: Premium пользователь
✅ Проверить:
- Step0 пропущен автоматически
- planType='premium' установлен автоматически
- Прогресс-бар: 4-5 шагов
```

---

### 2.2. BookCreationWizard (PREMIUM Flow)

**Test Cases**:

```typescript
// TC1: PREMIUM пользователь
✅ Шаги:
1. Открыть визард
2. Step0 пропущен (auto premium)
3. Шаг 1: Период
4. Шаг 2: Категории
5. Шаг 3: Стиль (warm_family)
6. Шаг 4: Макет (photo_text)
7. Генерация 15-30 сек
8. Успешная модалка
9. Переход к редактору

✅ Проверить:
- Прогресс-бар: 4-5 шагов (PREMIUM)
- Все шаги доступны
- AI генерация работает
- Кэширование работает (второй запрос быстрее)
```

---

### 2.3. BooksLibraryScreen

**Test Cases**:

```typescript
// TC1: Отображение книг
✅ Проверить:
- Книги отображаются в сетке
- planType badge видно (FREE / PREMIUM)
- version отображается (v1, v2, v3) ⚠️ TODO
- Фильтр по planType работает ⚠️ TODO
- Фильтр Все / Черновики / Готовые работает

// TC2: Действия с книгами
✅ Проверить:
- "Просмотр": PDF открывается
- "Скачать": PDF скачивается
- "Редактировать": редактор открывается
- "Удалить": книга удаляется (с подтверждением)
- "Создать версию": новая версия создается

// TC3: Версионирование
✅ Проверить:
- v1 (оригинал): parent_book_id=null, version=1
- v2 (новая): parent_book_id=v1_id, version=2
- Обе книги видны на полке
- Версия отображается на обложке
```

---

### 2.4. BookDraftEditor

**Test Cases**:

```typescript
// TC1: PREMIUM книга
✅ Проверить:
- Редактирование title
- Редактирование prologue
- Редактирование chapters
- Редактирование epilogue
- Загрузка фото к главам
- Предпросмотр PDF
- Создание финального PDF (Puppeteer)

// TC2: FREE книга
✅ Проверить:
- Notice: "FREE книга — упрощенный редактор"
- Редактирование title только
- Prologue/Chapters скрыты
- Загрузка фото работает
- Создание PDF работает (через Puppeteer)

// TC3: Puppeteer PDF
✅ Проверить:
- "Создать финальную версию"
- PDF генерируется на сервере
- Unicode корректен (русский, грузинский)
- Стили применяются (warm_family, biographical, motivational)
- PDF загружен в Storage
- pdfUrl обновлен в БД
```

---

### 2.5. PremiumUpsellModal

**Test Cases**:

```typescript
// TC1: FREE пользователь
✅ Проверить:
- Модалка показывается при попытке создать AI-книгу
- Список преимуществ Premium
- Кнопка "Перейти на Premium"
- Переход на paywall
```

---

## 🖥️ Фаза 3: Консоль (Browser Console)

### 3.1. Проверка ошибок

**URL**: `https://unity-wine.vercel.app`

**Действия**:
1. Открыть DevTools (F12)
2. Перейти на вкладку Console
3. Пройти весь flow создания книги
4. Проверить консоль

**Критерии**:
- ✅ 0 errors
- ✅ 0 warnings (кроме известных)
- ✅ Все API вызовы успешны (200/201)
- ✅ Нет CORS ошибок
- ✅ Нет 404 ошибок

**Известные warnings (можно игнорировать)**:
- Biome linter warnings (не критично)
- React DevTools warnings (не критично)

---

### 3.2. Network Tab

**Проверить**:
```typescript
// API вызовы
✅ POST /books-generate-free: 200, < 5 сек
✅ POST /books-generate-draft: 200, < 30 сек
✅ POST /books-render-puppeteer: 200, < 10 сек
✅ GET /books_archive: 200, < 1 сек

// Нет лишних запросов
✅ Нет дублирующихся вызовов
✅ Нет failed requests
✅ Кэширование работает (304 Not Modified)
```

---

## ⚡ Фаза 4: Performance тесты

### 4.1. Скорость генерации

**Test Cases**:

```typescript
// FREE книга
✅ Время генерации: < 5 сек
✅ Нет AI вызовов
✅ Только БД запросы

// PREMIUM книга (первый раз)
✅ Время генерации: < 30 сек
✅ AI вызов: 1 (batch)
✅ Токены: < 50,000 (экономия 90%)

// PREMIUM книга (кэш)
✅ Время генерации: < 5 сек
✅ AI вызов: 0 (кэш)
✅ Токены: 0

// Puppeteer PDF
✅ Время рендера: < 10 сек
✅ PDF size: 1-5 MB
✅ Стабильность: 100 страниц OK
```

---

### 4.2. Supabase Advisors

**Команды**:

```bash
# Security Advisors
get_advisors_supabase({
  project_id: "ecuwuzqlwdkkdncampnc",
  type: "security"
})

# Performance Advisors
get_advisors_supabase({
  project_id: "ecuwuzqlwdkkdncampnc",
  type: "performance"
})
```

**Критерии**:
- ✅ 0 security issues
- ✅ 0 performance issues
- ✅ RLS policies корректны
- ✅ Индексы оптимальны

---

## 📋 Фаза 5: Чеклист тестирования

### Backend (Edge Functions)
- [ ] books-generate-free: Unit тесты пройдены
- [ ] books-generate-draft: Unit тесты пройдены
- [ ] books-render-puppeteer: Unit тесты пройдены
- [ ] snapshots-generate-monthly: Unit тесты пройдены
- [ ] entry-summaries-generate: Unit тесты пройдены

### Frontend (UI/UX)
- [ ] BookCreationWizard: FREE flow
- [ ] BookCreationWizard: PREMIUM flow
- [ ] BooksLibraryScreen: отображение книг
- [ ] BooksLibraryScreen: действия с книгами
- [ ] BooksLibraryScreen: версионирование
- [ ] BookDraftEditor: PREMIUM редактирование
- [ ] BookDraftEditor: FREE редактирование
- [ ] BookDraftEditor: Puppeteer PDF
- [ ] PremiumUpsellModal: upsell flow

### Консоль
- [ ] Консоль браузера: 0 errors
- [ ] Network tab: все API успешны
- [ ] Performance: скорость OK
- [ ] Supabase Advisors: 0 issues

### Security & Performance
- [ ] RLS policies проверены
- [ ] Индексы оптимальны
- [ ] Кэширование работает
- [ ] Unicode поддержка (русский, грузинский)

---

## 🎯 Критерии приемки

### Must Have (обязательно)
- ✅ Все Unit тесты пройдены
- ✅ Все UI/UX тесты пройдены
- ✅ Консоль: 0 errors
- ✅ Supabase Advisors: 0 issues
- ✅ Performance: генерация < 30 сек

### Nice to Have (желательно)
- ✅ Кэширование работает
- ✅ Unicode поддержка
- ✅ Версионирование работает
- ✅ Puppeteer стабилен

---

## 📊 Отчет о тестировании

**После тестирования создать**:
- `TESTING_REPORT.md` с результатами
- Список найденных багов
- Приоритизация исправлений

---

**Дата**: 2025-11-22  
**Автор**: AI Agent  
**Статус**: 📋 ПЛАН ГОТОВ К ВЫПОЛНЕНИЮ

