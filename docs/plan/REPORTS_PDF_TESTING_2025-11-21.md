# 🧪 Тестирование генерации PDF через UI

**Дата**: 2025-11-21  
**Статус**: ⚠️ ОБНАРУЖЕНА ПРОБЛЕМА - требует деплоя Edge Function

---

## 📊 Результаты тестирования

### Тест 1: Генерация PDF через UI

**Шаги**:
1. ✅ Запущен локальный dev server на порту 3000
2. ✅ Выполнен вход в систему (rustam@leadshunter.biz / demo123)
3. ✅ Переход на экран отчетов
4. ✅ Нажатие кнопки "Экспорт PDF"

**Результат**: ❌ Ошибка 404

**Ошибка в консоли**:
```
[ERROR] Failed to load resource: the server responded with a status of 404 () 
@ https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/reports/export-pdf:0
[ERROR] [REPORTS] Error exporting PDF: Error: Unknown endpoint
```

**Причина**: Edge Function `reports` не задеплоена с последними изменениями (endpoint `export-pdf`)

---

## 🔍 Анализ проблемы

### Парсинг пути в Edge Function

Edge Function `reports/index.ts` парсит путь следующим образом:
```typescript
const url = new URL(req.url);
const pathParts = url.pathname.split('/').filter(Boolean);
const relevantParts = pathParts.filter((p) => !['functions', 'v1', 'reports'].includes(p));
const endpoint = relevantParts.join('/');
```

**Пример**:
- URL: `https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/reports/export-pdf`
- pathname: `/functions/v1/reports/export-pdf`
- pathParts: `['functions', 'v1', 'reports', 'export-pdf']`
- relevantParts: `['export-pdf']` (после фильтрации)
- endpoint: `'export-pdf'`

**Вывод**: Парсинг пути работает правильно, но endpoint не обрабатывается, потому что Edge Function не задеплоена.

---

## ✅ Решение

### Необходимые действия:

1. **Задеплоить Edge Function `reports`**:
   ```bash
   # Использовать Supabase MCP для деплоя
   deploy_edge_function_supabase({
     name: "reports",
     files: [...]
   })
   ```

2. **Проверить что endpoint `export-pdf` обрабатывается**:
   - Код уже содержит обработку `export-pdf` (строка 453)
   - Нужно убедиться что функция задеплоена

3. **Повторное тестирование**:
   - После деплоя повторить тест генерации PDF
   - Проверить что данные загружаются из `user_reports`
   - Проверить что PDF генерируется через `BlobProvider`

---

## 📝 Добавлено логирование

Для отладки добавлено логирование в Edge Function:
```typescript
console.log('[REPORTS] Request URL:', req.url);
console.log('[REPORTS] Path parts:', pathParts);
console.log('[REPORTS] Relevant parts:', relevantParts);
console.log('[REPORTS] Endpoint:', endpoint);
console.log('[REPORTS] Method:', req.method);
```

Это поможет понять, как парсится путь и какой endpoint обрабатывается.

---

## ⏭️ Следующие шаги

1. ⏭️ Задеплоить Edge Function `reports` с последними изменениями
2. ⏭️ Повторить тест генерации PDF через UI
3. ⏭️ Проверить что PDF генерируется и отображается в предпросмотре
4. ⏭️ Проверить что PDF сохраняется в Storage через `save-pdf` endpoint

---

## 📝 Файлы изменены

1. `supabase/functions/reports/index.ts` - добавлено логирование для отладки


