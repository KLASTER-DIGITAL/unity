# Font Sync Script

Автоматическое скачивание и загрузка шрифтов в Supabase Storage.

## Использование

```bash
# Установить зависимости (если нужно)
npm install

# Запустить скрипт
SUPABASE_SERVICE_ROLE_KEY=your_key npm run sync-fonts
```

## Что делает скрипт

1. **Проверяет** существующие шрифты в Supabase Storage (`assets` bucket)
2. **Скачивает** недостающие шрифты с Google Fonts CDN
3. **Загружает** их в Supabase Storage в папку `fonts/`

## Требуемые шрифты

### Noto Sans
- Regular (400)
- **Italic (400)** ← Был недоступен
- Medium (500)
- SemiBold (600)
- **Bold (700)** ← Был недоступен

### Noto Serif
- Regular (400)
- **Italic (400)** ← Был недоступен
- SemiBold (600)
- **Bold (700)** ← Был недоступен

## Environment Variables

```bash
# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

⚠️ **ВАЖНО**: Используй Service Role Key, не anon key!

## Структура в Storage

```
assets/
  └── fonts/
      ├── noto-sans/
      │   ├── NotoSans-Regular.woff2
      │   ├── NotoSans-Italic.woff2
      │   ├── NotoSans-Medium.woff2
      │   ├── NotoSans-SemiBold.woff2
      │   └── NotoSans-Bold.woff2
      └── noto-serif/
          ├── NotoSerif-Regular.woff2
          ├── NotoSerif-Italic.woff2
          ├── NotoSerif-SemiBold.woff2
          └── NotoSerif-Bold.woff2
```

## После загрузки

Можно вернуть italic стили в `BookPDFDocument.tsx`:

```tsx
Font.register({
  family: 'Noto Sans',
  fonts: [
    { src: `${FONT_BASE_URL}/noto-sans/NotoSans-Regular.woff2`, fontWeight: 400 },
    { src: `${FONT_BASE_URL}/noto-sans/NotoSans-Italic.woff2`, fontWeight: 400, fontStyle: 'italic' },
    { src: `${FONT_BASE_URL}/noto-sans/NotoSans-Medium.woff2`, fontWeight: 500 },
    { src: `${FONT_BASE_URL}/noto-sans/NotoSans-SemiBold.woff2`, fontWeight: 600 },
    { src: `${FONT_BASE_URL}/noto-sans/NotoSans-Bold.woff2`, fontWeight: 700 },
  ],
});
```
