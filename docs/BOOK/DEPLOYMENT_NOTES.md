<!-- Added deployment notes for local fonts -->
# Заметки о деплое - Локальные шрифты

## Дата: 2025-01-30

## Выполненные изменения

### 1. Edge Functions
- ✅ `books-generate-draft` - задеплоена с сохранением языка
- ✅ `books-render-puppeteer` - задеплоена с локальными шрифтами

### 2. Supabase Storage
- ✅ Bucket `assets` создан и настроен как публичный
- ✅ Загружены 18 шрифтов Noto в `assets/fonts/`:
  - `noto-sans/` - 4 файла (Regular, Medium, SemiBold, Bold)
  - `noto-serif/` - 2 файла (Regular, SemiBold)
  - `noto-sans-sc/` - 4 файла (для китайского)
  - `noto-serif-sc/` - 2 файла (для китайского)
  - `noto-sans-jp/` - 4 файла (для японского)
  - `noto-serif-jp/` - 2 файла (для японского)

### 3. UI Обновления
- ✅ `BookDraftEditor.tsx` - использует `BOOKS_RENDER_PUPPETEER`
- ✅ `BooksLibraryScreen.tsx` - использует серверный рендер

### 4. Git
- ✅ Коммит: `1624f10` - "feat(books): Локальные шрифты и улучшенная поддержка языков"
- ✅ Push в `main` выполнен

## Очистка кеша Vercel

Для принудительного обновления у пользователей:

1. **Через Vercel Dashboard**:
   - Откройте https://vercel.com/dashboard
   - Выберите проект `unity-wine`
   - Перейдите в **Deployments**
   - Найдите последний deployment
   - Нажмите **"Redeploy"** → **"Use existing Build Cache"** = OFF

2. **Через Vercel CLI**:
   ```bash
   vercel --prod --force
   ```

3. **Очистка кеша браузера**:
   - Пользователям может потребоваться hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
   - Или очистить кеш браузера

## Проверка после деплоя

1. ✅ Проверить что Edge Functions работают
2. ✅ Проверить что шрифты загружаются из Storage
3. ✅ Протестировать рендер книги на разных языках
4. ✅ Проверить что PDF генерируется корректно

## Следующие шаги

- Мониторинг логов Edge Functions
- Проверка производительности загрузки шрифтов
- Оптимизация размера шрифтов при необходимости

