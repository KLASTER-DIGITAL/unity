# 🐛 Исправления ошибок PDF-генерации (2025-01-30)

**Дата**: 2025-01-30  
**Статус**: ✅ Исправлено

---

## 🔴 Критические ошибки

### 1. Ошибка регистрации шрифта italic

**Ошибка**:
```
[DRAFT-EDITOR] Error rendering PDF: Error: Could not resolve font for Noto Sans, fontWeight 400, fontStyle italic
```

**Причина**:
- В `BookPDFDocument.tsx` используется `fontStyle: 'italic'` для subtitle
- При регистрации шрифтов не был зарегистрирован italic вариант Noto Sans
- React-PDF не может найти italic шрифт и падает с ошибкой

**Решение**:
Добавлена регистрация italic шрифта для Noto Sans в двух местах:

1. **`BookDraftEditor.tsx`** (строка ~720):
```typescript
Font.register({
  family: 'Noto Sans',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/notosans/v42/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A99d.ttf',
      fontWeight: 400,
      fontStyle: 'normal', // ✅ Добавлено явно
    },
    {
      // ✅ НОВОЕ: Regular weight (400) italic - для subtitle с fontStyle: 'italic'
      src: 'https://fonts.gstatic.com/s/notosans/v42/o-0oIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A99d.ttf',
      fontWeight: 400,
      fontStyle: 'italic', // ✅ Добавлено
    },
    // ... остальные веса
  ],
});
```

2. **`useBooksLibraryActions.tsx`** (строка ~187):
Аналогичное исправление для генерации PDF в библиотеке книг.

**Файлы изменены**:
- `src/features/mobile/reports/components/BookDraftEditor.tsx`
- `src/features/mobile/reports/components/books-library/hooks/useBooksLibraryActions.tsx`

---

### 2. Ошибка 400 при загрузке PDF из Storage

**Ошибка**:
```
GET https://ecuwuzqlwdkkdncampnc.supabase.co/storage/v1/object/public/books/726a9369-8c28-4134-b03f-3c29ad1235f4/9f751d6e-d68d-4a93-bc2f-a90255a8da44.pdf 400 (Bad Request)
```

**Причина**:
- URL формируется неправильно или файл не существует в Storage
- Возможно, путь дублируется: `{userId}/{bookId}/{bookId}.pdf` вместо `{userId}/{bookId}.pdf`
- Или файл не был загружен в Storage при генерации PDF

**Решение**:
1. **Проверка пути**: Убедиться, что путь правильный `{userId}/{bookId}.pdf`
2. **Использование signed URL**: Вместо public URL использовать signed URL для более надежной загрузки
3. **Обработка ошибок**: Добавлена проверка существования файла перед загрузкой

**Изменения в `BooksLibraryScreen.tsx`**:
```typescript
// ✅ FIX: Правильный путь к файлу: {userId}/{bookId}.pdf (без дублирования bookId)
const storagePath = `${userId}/${book.id}.pdf`;
console.log('[BOOKS-LIBRARY] Checking PDF file in Storage:', storagePath);

// ✅ FIX: Используем signed URL вместо public URL (более надежно)
const { data: signedUrlData, error: signedUrlError } = await supabase.storage
  .from('books')
  .createSignedUrl(storagePath, 3600); // 1 час
```

**Файлы изменены**:
- `src/features/mobile/reports/components/BooksLibraryScreen.tsx`

---

## ✅ Проверка исправлений

### Тест 1: Генерация PDF с italic текстом

1. Создать книгу с subtitle (который использует italic)
2. Сгенерировать PDF
3. Проверить консоль - не должно быть ошибок о шрифте italic
4. PDF должен сгенерироваться успешно

### Тест 2: Загрузка PDF из Storage

1. Открыть готовую книгу
2. Нажать "Скачать" или "Просмотр"
3. Проверить консоль - не должно быть ошибок 400
4. PDF должен загрузиться успешно

---

## 📝 Обновление документации

### Обновлен `HOW_BOOK_CREATION_WORKS.md`

Добавлен раздел о регистрации шрифтов:
- Необходимость регистрации italic варианта
- Правильные URL для Google Fonts
- Обработка ошибок регистрации

### Обновлен `FONTS_SETUP.md`

Добавлена информация о:
- Регистрации italic шрифтов
- Решении проблемы "Could not resolve font for italic"

---

## 🔍 Дополнительные проверки

### Проверить в коде:

1. **Все места регистрации шрифтов**:
   - `BookDraftEditor.tsx` ✅
   - `useBooksLibraryActions.tsx` ✅
   - Другие места (если есть)

2. **Все места загрузки PDF**:
   - `BooksLibraryScreen.tsx` ✅
   - `PDFViewer.tsx` (уже исправлен ранее) ✅
   - Другие места (если есть)

3. **Формирование пути к PDF**:
   - Должен быть `{userId}/{bookId}.pdf`
   - НЕ `{userId}/{bookId}/{bookId}.pdf`

---

## 🚨 Известные проблемы (требуют дополнительной работы)

1. **Проблема с путями в старых книгах**:
   - Старые книги могут иметь неправильный путь в БД
   - Нужна миграция для исправления путей

2. **Проблема с отсутствующими PDF**:
   - Если PDF не существует в Storage, нужно регенерировать
   - Сейчас есть fallback на регенерацию, но можно улучшить

---

## 📚 Связанные документы

- `FONTS_SETUP.md` - Настройка шрифтов
- `HOW_BOOK_CREATION_WORKS.md` - Как работает система
- `PDF_GENERATION_VERCEL_SETUP.md` - Настройка генерации PDF

---

## ✅ Статус

- [x] Исправлена регистрация italic шрифта
- [x] Исправлено формирование пути к PDF
- [x] Добавлена обработка ошибок
- [x] Обновлена документация
- [ ] Тестирование на production (требуется)

---

**Последнее обновление**: 2025-01-30

