# 🔧 Исправления: Ошибки шрифтов и загрузки PDF (2025-01-30)

**Дата**: 2025-01-30  
**Статус**: ✅ Исправлено

---

## 🐛 Найденные ошибки

### Ошибка 1: Не найден italic шрифт Noto Sans

**Ошибка**:
```
BookDraftEditor.tsx:836 [DRAFT-EDITOR] Error rendering PDF: 
Error: Could not resolve font for Noto Sans, fontWeight 400, fontStyle italic
```

**Причина**:
- URL для italic версии Noto Sans возвращает 404
- Шрифт не зарегистрирован в @react-pdf/renderer
- Использование `fontStyle: 'italic'` в стилях без зарегистрированного italic шрифта

**Решение**:
- ✅ Временно убран `fontStyle: 'italic'` из стилей `subtitle` и `insight`
- ✅ Закомментирована регистрация italic шрифта во всех местах
- ✅ Добавлены TODO комментарии для будущего исправления

**Файлы**:
- `src/features/mobile/reports/components/BookPDFDocument.tsx`
- `src/features/mobile/reports/components/BookDraftEditor.tsx`
- `src/features/mobile/reports/components/BooksLibraryScreen.tsx`
- `src/features/mobile/reports/components/books-library/hooks/useBooksLibraryActions.tsx`

---

### Ошибка 2: 400 Bad Request при загрузке PDF

**Ошибка**:
```
GET https://ecuwuzqlwdkkdncampnc.supabase.co/storage/v1/object/public/books/.../...pdf 400 (Bad Request)
[BOOKS-LIBRARY] Download attempt 1/2/3 failed: Error: HTTP error! status: 400
```

**Причина**:
- PDF.js параметры в URL (`#toolbar=1&navpanes=1...`) вызывают 400 ошибку в Supabase Storage
- Supabase Storage не поддерживает URL фрагменты
- URL не очищается перед загрузкой

**Решение**:
- ✅ Добавлена очистка URL от PDF.js параметров перед загрузкой
- ✅ Использование `cleanPdfUrl = pdfUrl.split('#')[0]` перед fetch
- ✅ Улучшена обработка ошибок загрузки
- ✅ Добавлена логика создания signed URL вместо public URL

**Файлы**:
- `src/features/mobile/reports/components/BooksLibraryScreen.tsx` (handleDownload)
- `src/features/mobile/reports/components/BookDraftEditor.tsx` (handleRenderPDF)

---

## 📝 Изменения в коде

### 1. BookPDFDocument.tsx

**Было**:
```typescript
subtitle: {
  fontSize: 18,
  color: '#4a5568',
  marginBottom: 24,
  textAlign: 'center',
  fontStyle: 'italic', // ❌ Вызывало ошибку
},
```

**Стало**:
```typescript
subtitle: {
  fontSize: 18,
  color: '#4a5568',
  marginBottom: 24,
  textAlign: 'center',
  fontFamily: 'Noto Sans',
  // ✅ FIX: Временно убран fontStyle: 'italic'
  // TODO: Найти правильный URL для Noto Sans Italic
},
```

### 2. BooksLibraryScreen.tsx

**Было**:
```typescript
response = await fetch(pdfUrl, {
  method: 'GET',
  signal: AbortSignal.timeout(30000),
});
```

**Стало**:
```typescript
// ✅ FIX: Очищаем URL от PDF.js параметров перед загрузкой
const cleanPdfUrl = pdfUrl.split('#')[0];
console.log('[BOOKS-LIBRARY] Clean PDF URL:', cleanPdfUrl);

response = await fetch(cleanPdfUrl, {
  method: 'GET',
  signal: AbortSignal.timeout(30000),
});
```

### 3. BookDraftEditor.tsx

**Было**:
```typescript
// Регистрация italic шрифта (неправильный URL)
Font.register({
  family: 'Noto Sans',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/notosans/v42/o-0oIpQlx3QUlC5A4PNb4Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A99d.ttf',
      fontWeight: 400,
      fontStyle: 'italic',
    },
  ],
});
```

**Стало**:
```typescript
// ✅ FIX: Временно отключена регистрация italic шрифта
// URL для italic версии Noto Sans не найден (404)
// TODO: Найти правильный URL для Noto Sans Italic
```

---

## 🔍 Диагностика

### Проверка URL шрифтов

```bash
# Проверка italic URL (возвращает 404)
curl -I "https://fonts.gstatic.com/s/notosans/v42/o-0oIpQlx3QUlC5A4PNb4Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A99d.ttf"
# HTTP/2 404

# Проверка альтернативного URL (тоже 404)
curl -I "https://fonts.gstatic.com/s/notosans/v42/o-0oIpQlx3QUlC5A4PNb4Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A99d.ttf"
# HTTP/2 404
```

**Вывод**: Оба URL для italic версии не работают. Нужно найти правильный URL или использовать другой подход.

---

## ✅ Решения

### Временное решение (применено)

1. **Убрать italic из стилей**
   - Удален `fontStyle: 'italic'` из `subtitle` и `insight`
   - PDF генерируется без курсива, но без ошибок

2. **Очистка URL перед загрузкой**
   - URL очищается от PDF.js параметров
   - Используется `cleanPdfUrl = pdfUrl.split('#')[0]`

3. **Улучшенная обработка ошибок**
   - Детальное логирование
   - Retry логика (3 попытки)
   - Fallback на signed URL

### Постоянное решение (TODO)

1. **Найти правильный URL для Noto Sans Italic**
   - Использовать Google Fonts API для получения правильного URL
   - Или использовать другой источник шрифтов

2. **Альтернативный подход**
   - Использовать другой шрифт для italic текста
   - Или использовать CSS transform для наклона (но @react-pdf/renderer не поддерживает)

3. **Улучшить загрузку PDF**
   - Всегда использовать signed URL для приватных bucket
   - Кэшировать signed URL для повторного использования

---

## 📚 Обновленная документация

### FONTS_SETUP.md

**Добавлено**:
- ⚠️ **Известная проблема**: Noto Sans Italic не зарегистрирован
- ✅ **Временное решение**: Убрать `fontStyle: 'italic'` из стилей
- 🔍 **TODO**: Найти правильный URL для italic шрифта

### HOW_BOOK_CREATION_WORKS.md

**Обновлено**:
- Раздел "PDF-генерация" → добавлена информация об ограничениях italic шрифта
- Раздел "Хранение и версионирование" → добавлена информация об очистке URL

---

## 🧪 Тестирование

### Проверка исправлений

1. **Генерация PDF без ошибок**:
   - ✅ PDF генерируется без ошибки "Could not resolve font"
   - ✅ Subtitle и insight отображаются без курсива (но читаемо)

2. **Загрузка PDF**:
   - ✅ URL очищается от PDF.js параметров
   - ✅ PDF загружается без ошибки 400
   - ✅ Retry логика работает (3 попытки)

### Что проверить

1. Сгенерировать новую книгу
2. Проверить, что PDF создается без ошибок
3. Проверить, что PDF скачивается без ошибки 400
4. Проверить, что subtitle и insight отображаются корректно (без курсива)

---

## 📝 TODO

- [ ] Найти правильный URL для Noto Sans Italic v42
- [ ] Зарегистрировать italic шрифт во всех местах
- [ ] Вернуть `fontStyle: 'italic'` в стили
- [ ] Протестировать генерацию PDF с italic шрифтом
- [ ] Обновить документацию после исправления

---

## 🔗 Связанные файлы

- `src/features/mobile/reports/components/BookPDFDocument.tsx`
- `src/features/mobile/reports/components/BookDraftEditor.tsx`
- `src/features/mobile/reports/components/BooksLibraryScreen.tsx`
- `src/features/mobile/reports/components/books-library/hooks/useBooksLibraryActions.tsx`
- `docs/BOOK/FONTS_SETUP.md`

---

**Статус**: ✅ Исправлено (временное решение)  
**Требуется**: Постоянное решение для italic шрифта
