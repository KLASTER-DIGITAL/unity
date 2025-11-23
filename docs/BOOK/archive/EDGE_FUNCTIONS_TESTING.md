# 🧪 Edge Functions Unit Тесты

**Дата**: 2025-11-22  
**Статус**: 🔍 ТЕСТИРОВАНИЕ В ПРОЦЕССЕ

---

## 📋 Тестируемые Edge Functions

### 1. books-generate-free
**Endpoint**: `/functions/v1/books-generate-free`  
**Метод**: POST

**Тест кейсы**:
- [ ] ✅ Успешная генерация FREE книги
- [ ] ✅ Валидация входных данных (userId, periodStart, periodEnd)
- [ ] ✅ Проверка лимита FREE tier (3 книги за 30 дней)
- [ ] ✅ Создание story_json без AI
- [ ] ✅ Сохранение в books_archive с plan_type='free'
- [ ] ❌ Ошибка при отсутствии userId
- [ ] ❌ Ошибка при отсутствии периода
- [ ] ❌ Ошибка при превышении лимита

**Ожидаемое время**: < 5 секунд

---

### 2. books-generate-draft (PREMIUM)
**Endpoint**: `/functions/v1/books-generate-draft`  
**Метод**: POST

**Тест кейсы**:
- [ ] ✅ Успешная генерация PREMIUM книги
- [ ] ✅ Использование entry_summaries (оптимизация токенов)
- [ ] ✅ Использование monthly_snapshots (контекст)
- [ ] ✅ Кэширование на основе contentHash
- [ ] ✅ Возврат cached draft если существует
- [ ] ✅ Параллельная загрузка данных (Promise.all)
- [ ] ✅ Динамический выбор AI операций по стилю
- [ ] ✅ Сохранение в books_archive с plan_type='premium'
- [ ] ❌ Ошибка при отсутствии Premium подписки
- [ ] ❌ Ошибка при отсутствии OpenAI ключа

**Ожидаемое время**: < 30 секунд (без кэша), < 2 секунды (с кэшем)

---

### 3. books-generate-quarter
**Endpoint**: `/functions/v1/books-generate-quarter`  
**Метод**: POST

**Тест кейсы**:
- [ ] ✅ Успешная генерация квартальной книги
- [ ] ✅ Вызов books-generate-draft с type='quarter'
- [ ] ✅ Автоматический расчет периода (3 месяца)
- [ ] ✅ Проверка Premium подписки
- [ ] ❌ Ошибка при отсутствии Premium подписки

**Ожидаемое время**: < 30 секунд

---

### 4. books-render-puppeteer
**Endpoint**: `/functions/v1/books-render-puppeteer`  
**Метод**: POST

**Тест кейсы**:
- [ ] ✅ Успешный рендеринг PDF
- [ ] ✅ Генерация HTML из story_json
- [ ] ✅ Применение стиля (warm_family/biographical/motivational)
- [ ] ✅ Применение темы (light/dark)
- [ ] ✅ Загрузка PDF в Supabase Storage
- [ ] ✅ Обновление books_archive с pdf_url
- [ ] ❌ Ошибка при отсутствии bookId
- [ ] ❌ Ошибка при отсутствии книги в БД

**Ожидаемое время**: < 10 секунд

---

### 5. entry-summaries-generate
**Endpoint**: `/functions/v1/entry-summaries-generate`  
**Метод**: POST

**Тест кейсы**:
- [ ] ✅ Генерация summary для одного entry
- [ ] ✅ Генерация summary для нескольких entries
- [ ] ✅ Генерация summary для периода
- [ ] ✅ Сохранение в entry_summaries
- [ ] ✅ Структура summary_json (short_summary, insight, mood, topics, persons)
- [ ] ✅ Пропуск entries с уже существующими summaries
- [ ] ❌ Ошибка при отсутствии OpenAI ключа

**Ожидаемое время**: < 5 секунд на entry

---

### 6. snapshots-generate-monthly
**Endpoint**: `/functions/v1/snapshots-generate-monthly`  
**Метод**: POST (или cron)

**Тест кейсы**:
- [ ] ✅ Генерация snapshot для месяца
- [ ] ✅ Агрегация данных (emotions, top_topics, active_days)
- [ ] ✅ Сохранение в monthly_snapshots
- [ ] ✅ Пропуск месяцев с уже существующими snapshots
- [ ] ✅ Cron job выполняется автоматически

**Ожидаемое время**: < 5 секунд

---

## 🧪 Команды для тестирования

### Тест books-generate-free
```bash
curl -X POST https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/books-generate-free \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "726a9369-8c28-4134-b03f-3c29ad1235f4",
    "periodStart": "2025-11-01",
    "periodEnd": "2025-11-22",
    "contexts": []
  }'
```

### Тест books-generate-draft
```bash
curl -X POST https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/books-generate-draft \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "726a9369-8c28-4134-b03f-3c29ad1235f4",
    "periodStart": "2025-11-01",
    "periodEnd": "2025-11-22",
    "plan_type": "premium",
    "type": "month",
    "style": "warm_family",
    "layout": "photo_text",
    "theme": "light"
  }'
```

### Тест books-render-puppeteer
```bash
curl -X POST https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/books-render-puppeteer \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "BOOK_ID_HERE"
  }'
```

---

## 📊 Метрики успешности

- **Успешность**: > 95%
- **Время ответа**: < 30 секунд (для генерации)
- **Кэш hit rate**: > 50% (для повторных запросов)
- **Ошибки**: < 5%

---

**Дата**: 2025-11-22  
**Статус**: 🔍 ТЕСТИРОВАНИЕ В ПРОЦЕССЕ

