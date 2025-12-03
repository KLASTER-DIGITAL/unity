# 📝 Исправление переводов для системы книг

**Дата**: 2025-11-21  
**Статус**: ⏳ В ПРОЦЕССЕ  
**Приоритет**: P1 - ВАЖНО

---

## 📋 Список недостающих переводов

### Ключи из BookDraftEditor.tsx:
- `books.editor.title` - "Основная информация"
- `books.editor.book_title` - "Название книги"
- `books.editor.subtitle` - "Подзаголовок"
- `books.editor.error` - "Произошла ошибка"
- `books.editor.save_error` - "Не удалось сохранить изменения"
- `books.editor.save_success` - "Изменения сохранены"
- `books.editor.auth_required` - "Необходима авторизация"
- `books.editor.pdf_created` - "PDF книга создана!"
- `books.editor.pdf_error` - "Произошла ошибка при создании PDF"
- `books.pdf.prologue` - "Вступление"
- `books.pdf.chapter` - "Глава"
- `books.pdf.epilogue` - "Заключение"

### Ключи из BooksLibraryScreen.tsx:
- `books.load_error` - "Не удалось загрузить книги"
- `books.style.warm_family` - "Семейная история"
- `books.style.biographical` - "Биография"
- `books.style.motivational` - "Мотивация"
- `books.pdf_not_ready` - "PDF еще не сгенерирован"
- `books.draft_not_completed` - "Черновик еще не завершен"
- `books.edit_in_development` - "Функция редактирования в разработке"
- `books.delete_error` - "Не удалось удалить книгу"
- `books.delete_success` - "Книга удалена"
- `books.library_title` - "Библиотека книг"
- `books.library_subtitle` - "Твои персональные истории"
- `books.filter.all` - "Все"
- `books.filter.drafts` - "Черновики"
- `books.filter.final` - "Готовые"
- `books.empty.title` - "Пока нет книг"
- `books.empty.description` - "Создай свою первую книгу достижений"
- `books.create` - "Создать книгу"
- `books.untitled` - "Без названия"
- `books.status.ready` - "Готово"
- `books.status.draft` - "Черновик"
- `books.entries_count` - "записей"
- `books.pages_count` - "страниц"
- `books.view` - "Просмотр"
- `books.download` - "Скачать"
- `books.edit_draft` - "Редактировать черновик"
- `books.deleting` - "Удаление..."
- `books.delete` - "Удалить книгу"
- `books.delete_confirm_title` - "Удалить книгу?"
- `books.delete_confirm_draft` - "Черновик"
- `books.cancel` - "Отмена"
- `books.delete_action` - "Удалить"

### Ключи из ReportsScreen.tsx (если используются):
- `reports.pdf.download` - "Скачать PDF"

---

## ✅ План действий

1. Проверить существующие переводы в БД
2. Добавить все недостающие переводы через SQL
3. Протестировать что warnings исчезли
4. Проверить что все тексты отображаются корректно

---

## 📝 SQL для добавления переводов

```sql
-- Добавить все переводы для книг (ru)
INSERT INTO translations (lang_code, translation_key, translation_value, is_ai_translated, needs_review)
VALUES
  ('ru', 'books.editor.title', 'Основная информация', false, false),
  ('ru', 'books.editor.book_title', 'Название книги', false, false),
  ('ru', 'books.editor.subtitle', 'Подзаголовок', false, false),
  ('ru', 'books.editor.error', 'Произошла ошибка', false, false),
  ('ru', 'books.editor.save_error', 'Не удалось сохранить изменения', false, false),
  ('ru', 'books.editor.save_success', 'Изменения сохранены', false, false),
  ('ru', 'books.editor.auth_required', 'Необходима авторизация', false, false),
  ('ru', 'books.editor.pdf_created', 'PDF книга создана!', false, false),
  ('ru', 'books.editor.pdf_error', 'Произошла ошибка при создании PDF', false, false),
  ('ru', 'books.pdf.prologue', 'Вступление', false, false),
  ('ru', 'books.pdf.chapter', 'Глава', false, false),
  ('ru', 'books.pdf.epilogue', 'Заключение', false, false),
  ('ru', 'books.load_error', 'Не удалось загрузить книги', false, false),
  ('ru', 'books.style.warm_family', 'Семейная история', false, false),
  ('ru', 'books.style.biographical', 'Биография', false, false),
  ('ru', 'books.style.motivational', 'Мотивация', false, false),
  ('ru', 'books.pdf_not_ready', 'PDF еще не сгенерирован', false, false),
  ('ru', 'books.draft_not_completed', 'Черновик еще не завершен', false, false),
  ('ru', 'books.edit_in_development', 'Функция редактирования в разработке', false, false),
  ('ru', 'books.delete_error', 'Не удалось удалить книгу', false, false),
  ('ru', 'books.delete_success', 'Книга удалена', false, false),
  ('ru', 'books.library_title', 'Библиотека книг', false, false),
  ('ru', 'books.library_subtitle', 'Твои персональные истории', false, false),
  ('ru', 'books.filter.all', 'Все', false, false),
  ('ru', 'books.filter.drafts', 'Черновики', false, false),
  ('ru', 'books.filter.final', 'Готовые', false, false),
  ('ru', 'books.empty.title', 'Пока нет книг', false, false),
  ('ru', 'books.empty.description', 'Создай свою первую книгу достижений', false, false),
  ('ru', 'books.create', 'Создать книгу', false, false),
  ('ru', 'books.untitled', 'Без названия', false, false),
  ('ru', 'books.status.ready', 'Готово', false, false),
  ('ru', 'books.status.draft', 'Черновик', false, false),
  ('ru', 'books.entries_count', 'записей', false, false),
  ('ru', 'books.pages_count', 'страниц', false, false),
  ('ru', 'books.view', 'Просмотр', false, false),
  ('ru', 'books.download', 'Скачать', false, false),
  ('ru', 'books.edit_draft', 'Редактировать черновик', false, false),
  ('ru', 'books.deleting', 'Удаление...', false, false),
  ('ru', 'books.delete', 'Удалить книгу', false, false),
  ('ru', 'books.delete_confirm_title', 'Удалить книгу?', false, false),
  ('ru', 'books.delete_confirm_draft', 'Черновик', false, false),
  ('ru', 'books.cancel', 'Отмена', false, false),
  ('ru', 'books.delete_action', 'Удалить', false, false),
  ('ru', 'reports.pdf.download', 'Скачать PDF', false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE
SET translation_value = EXCLUDED.translation_value,
    updated_at = NOW();
```

---

## ✅ Результат

После добавления переводов:
- ✅ Все warnings о missing translations должны исчезнуть
- ✅ Все тексты будут отображаться корректно
- ✅ UX улучшится (нет fallback значений)






