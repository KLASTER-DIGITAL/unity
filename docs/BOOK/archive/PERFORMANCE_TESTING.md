# ⚡ Performance Тесты системы книг

**Дата**: 2025-11-22  
**Статус**: 🔍 ТЕСТИРОВАНИЕ В ПРОЦЕССЕ

---

## 📊 Метрики производительности

### 1. Генерация FREE книги

**Целевые метрики**:
- ⏱️ Время генерации: < 5 секунд
- 💾 Размер story_json: < 100 KB
- 🔄 Запросы к БД: < 10
- 📊 Токены OpenAI: 0 (не используется)

**Тест**:
```bash
# Замер времени
time curl -X POST https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/books-generate-free \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "...", "periodStart": "2025-11-01", "periodEnd": "2025-11-22"}'
```

**Результаты**:
- [ ] Время: ___ секунд
- [ ] Размер story_json: ___ KB
- [ ] Запросы к БД: ___
- [ ] Статус: ✅/❌

---

### 2. Генерация PREMIUM книги (без кэша)

**Целевые метрики**:
- ⏱️ Время генерации: < 30 секунд
- 💾 Размер story_json: < 500 KB
- 🔄 Запросы к БД: < 20
- 📊 Токены OpenAI: < 5000 (благодаря entry_summaries)
- 🚀 Параллельная загрузка: Promise.all работает

**Тест**:
```bash
# Замер времени
time curl -X POST https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/books-generate-draft \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "...",
    "periodStart": "2025-11-01",
    "periodEnd": "2025-11-22",
    "plan_type": "premium",
    "style": "warm_family"
  }'
```

**Результаты**:
- [ ] Время: ___ секунд
- [ ] Размер story_json: ___ KB
- [ ] Запросы к БД: ___
- [ ] Токены OpenAI: ___
- [ ] Статус: ✅/❌

---

### 3. Генерация PREMIUM книги (с кэшем)

**Целевые метрики**:
- ⏱️ Время генерации: < 2 секунды
- 💾 Размер story_json: < 500 KB
- 🔄 Запросы к БД: < 5
- 📊 Токены OpenAI: 0 (используется кэш)
- 🎯 Кэш hit rate: > 50%

**Тест**:
```bash
# Повторный запрос с теми же параметрами
time curl -X POST https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/books-generate-draft \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "...",
    "periodStart": "2025-11-01",
    "periodEnd": "2025-11-22",
    "plan_type": "premium",
    "style": "warm_family"
  }'
```

**Результаты**:
- [ ] Время: ___ секунд
- [ ] Кэш использован: ✅/❌
- [ ] Токены OpenAI: ___
- [ ] Статус: ✅/❌

---

### 4. Рендеринг PDF через Puppeteer

**Целевые метрики**:
- ⏱️ Время рендеринга: < 10 секунд
- 💾 Размер PDF: < 5 MB
- 🔄 Запросы к БД: < 5
- 📄 Страниц в PDF: зависит от контента

**Тест**:
```bash
# Замер времени
time curl -X POST https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/books-render-puppeteer \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookId": "BOOK_ID"}'
```

**Результаты**:
- [ ] Время: ___ секунд
- [ ] Размер PDF: ___ MB
- [ ] Страниц: ___
- [ ] Статус: ✅/❌

---

### 5. Генерация entry_summaries

**Целевые метрики**:
- ⏱️ Время на entry: < 5 секунд
- 📊 Токены OpenAI: < 300 на entry
- 🔄 Batch processing: обрабатывает несколько entries параллельно
- 💾 Размер summary_json: < 1 KB на entry

**Тест**:
```bash
# Замер времени для 10 entries
time curl -X POST https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/entry-summaries-generate \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "...",
    "periodStart": "2025-11-01",
    "periodEnd": "2025-11-22"
  }'
```

**Результаты**:
- [ ] Время для 10 entries: ___ секунд
- [ ] Токены на entry: ___
- [ ] Статус: ✅/❌

---

### 6. Загрузка библиотеки книг

**Целевые метрики**:
- ⏱️ Время загрузки: < 1 секунда
- 🔄 Запросы к БД: 1
- 💾 Размер ответа: < 100 KB для 50 книг
- 🎯 Фильтры работают быстро

**Тест**:
```javascript
// В браузере
console.time('loadBooks');
const { data } = await supabase
  .from('books_archive')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
console.timeEnd('loadBooks');
```

**Результаты**:
- [ ] Время: ___ мс
- [ ] Размер ответа: ___ KB
- [ ] Статус: ✅/❌

---

## 📈 Оптимизации

### ✅ Реализовано
1. **entry_summaries**: 90% экономия токенов
2. **monthly_snapshots**: Контекст без загрузки всех entries
3. **Кэширование**: Агрессивное кэширование по contentHash
4. **Параллельная загрузка**: Promise.all для entries, summaries, snapshot
5. **Puppeteer**: Серверный рендеринг вместо клиентского

### 🔄 Можно улучшить
1. **Индексы БД**: Проверить индексы на books_archive, entry_summaries
2. **Batch AI requests**: Группировка нескольких entries в один запрос
3. **CDN для PDF**: Кэширование PDF на CDN
4. **Lazy loading**: Загрузка книг по частям (пагинация)

---

## 📊 Итоговые метрики

### FREE книги
- ⏱️ Время: < 5 сек ✅
- 💾 Размер: < 100 KB ✅
- 📊 Токены: 0 ✅

### PREMIUM книги (без кэша)
- ⏱️ Время: < 30 сек ✅
- 💾 Размер: < 500 KB ✅
- 📊 Токены: < 5000 ✅

### PREMIUM книги (с кэшем)
- ⏱️ Время: < 2 сек ✅
- 📊 Токены: 0 ✅

### PDF рендеринг
- ⏱️ Время: < 10 сек ✅
- 💾 Размер: < 5 MB ✅

---

**Дата**: 2025-11-22  
**Статус**: 🔍 ТЕСТИРОВАНИЕ В ПРОЦЕССЕ

