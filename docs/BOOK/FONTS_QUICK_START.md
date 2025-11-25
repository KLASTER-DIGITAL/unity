<!-- Quick‑start guide for adding local fonts -->
# Быстрая установка локальных шрифтов

## ✅ Что уже сделано

1. ✅ Edge Function `books-render-puppeteer` обновлена для использования локальных шрифтов
2. ✅ Создан скрипт `scripts/upload-fonts-to-storage.ts` для автоматической загрузки
3. ✅ UI обновлен для использования серверного рендера

## 🚀 Что нужно сделать

### Шаг 1: Загрузить шрифты в Storage

**Получить Service Role Key**:
1. Откройте https://supabase.com/dashboard/project/ecuwuzqlwdkkdncampnc/settings/api
2. Перейдите на вкладку **"Legacy API Keys"**
3. Скопируйте `service_role` key

**Запустить скрипт**:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here deno run --allow-net --allow-write --allow-env scripts/upload-fonts-to-storage.ts
```

Или с Node.js:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here npx tsx scripts/upload-fonts-to-storage.ts
```

Скрипт автоматически:
- Создаст bucket `assets` (если не существует)
- Скачает все шрифты Noto из Google Fonts CDN
- Загрузит их в Supabase Storage

### Шаг 2: Задеплоить обновленную Edge Function

```bash
npx supabase functions deploy books-render-puppeteer --project-ref ecuwuzqlwdkkdncampnc
```

### Шаг 3: Проверить

1. Создайте тестовую книгу
2. Нажмите "Просмотр" или "Скачать"
3. Проверьте что текст отображается корректно для всех языков

## 📁 Структура шрифтов в Storage

После загрузки в Storage будет структура:
```
assets/fonts/
├── noto-sans/          (ru, en, es, de, fr, kk, ka)
│   ├── NotoSans-Regular.woff2
│   ├── NotoSans-Medium.woff2
│   ├── NotoSans-SemiBold.woff2
│   └── NotoSans-Bold.woff2
├── noto-serif/
│   ├── NotoSerif-Regular.woff2
│   └── NotoSerif-SemiBold.woff2
├── noto-sans-sc/       (zh-CN)
│   ├── NotoSansSC-Regular.woff2
│   ├── NotoSansSC-Medium.woff2
│   ├── NotoSansSC-SemiBold.woff2
│   └── NotoSansSC-Bold.woff2
├── noto-serif-sc/
│   ├── NotoSerifSC-Regular.woff2
│   └── NotoSerifSC-SemiBold.woff2
├── noto-sans-jp/       (ja)
│   ├── NotoSansJP-Regular.woff2
│   ├── NotoSansJP-Medium.woff2
│   ├── NotoSansJP-SemiBold.woff2
│   └── NotoSansJP-Bold.woff2
└── noto-serif-jp/
    ├── NotoSerifJP-Regular.woff2
    └── NotoSerifJP-SemiBold.woff2
```

## ⚠️ Troubleshooting

**Ошибка "Bucket not found"**:
- Скрипт автоматически создаст bucket, но убедитесь что у Service Role Key есть права

**Ошибка "Permission denied"**:
- Проверьте что Service Role Key правильный
- Убедитесь что bucket `assets` публичный (для чтения шрифтов)

**Шрифты не загружаются в PDF**:
- Проверьте логи Edge Function в Supabase Dashboard
- Убедитесь что bucket `assets` существует и публичный
- Проверьте что файлы загружены в правильную структуру папок

## 📚 Подробная документация

См. `docs/BOOK/FONTS_SETUP.md` для детальной информации.

