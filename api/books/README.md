# Vercel API Route для генерации PDF

## Настройка переменных окружения

В Vercel Dashboard нужно добавить следующие переменные окружения:

1. `SUPABASE_URL` = `https://ecuwuzqlwdkkdncampnc.supabase.co`
2. `SUPABASE_SERVICE_ROLE_KEY` = (Service Role Key из Supabase Dashboard)

## Использование

API endpoint: `POST /api/books/render-pdf`

Request body:
```json
{
  "bookId": "string",
  "accessToken": "string"
}
```

Response:
```json
{
  "success": true,
  "pdfUrl": "https://..."
}
```

## Особенности

- ✅ Поддержка всех 9 языков (ru, en, es, de, fr, zh, ja, kk, ka)
- ✅ Правильные шрифты для каждого языка (Noto Sans family)
- ✅ Учет всех настроек wizard (layout, style, theme)
- ✅ Качественная генерация через Puppeteer
- ✅ Полная поддержка Unicode

