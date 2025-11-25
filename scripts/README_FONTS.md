<!-- Fonts handling scripts -->
# Загрузка шрифтов в Supabase Storage

## Быстрый старт

1. **Получить Service Role Key**:
   - Откройте https://supabase.com/dashboard/project/ecuwuzqlwdkkdncampnc/settings/api
   - Перейдите на вкладку **"Legacy API Keys"**
   - Скопируйте `service_role` key

2. **Запустить скрипт**:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here deno run --allow-net --allow-write --allow-env scripts/upload-fonts-to-storage.ts
   ```

   Или с Node.js:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here npx tsx scripts/upload-fonts-to-storage.ts
   ```

3. **Скрипт автоматически**:
   - Создаст bucket `assets` (если не существует)
   - Скачает все необходимые шрифты Noto из Google Fonts CDN
   - Загрузит их в Supabase Storage в структуру:
     ```
     assets/fonts/
     ├── noto-sans/
     ├── noto-serif/
     ├── noto-sans-sc/
     ├── noto-serif-sc/
     ├── noto-sans-jp/
     └── noto-serif-jp/
     ```

4. **После загрузки**:
   - Edge Function `books-render-puppeteer` уже обновлена для использования локальных шрифтов
   - Задеплойте обновленную функцию:
     ```bash
     npx supabase functions deploy books-render-puppeteer --project-ref ecuwuzqlwdkkdncampnc
     ```

## Что делает скрипт

1. **Извлекает URL шрифтов** из Google Fonts CSS API
2. **Скачивает WOFF2 файлы** напрямую из Google Fonts CDN
3. **Загружает в Supabase Storage** bucket `assets` с правильной структурой папок
4. **Поддерживает все 9 языков**:
   - ru, en, es, de, fr, kk, ka → Noto Sans/Serif
   - zh-CN → Noto Sans SC/Serif SC
   - ja → Noto Sans JP/Serif JP

## Проверка

После загрузки проверьте в Supabase Dashboard:
- **Storage** → **Buckets** → `assets` → `fonts/`
- Должно быть 6 папок с шрифтами

## Troubleshooting

**Ошибка "Bucket not found"**:
- Скрипт автоматически создаст bucket, но убедитесь что у Service Role Key есть права на создание buckets

**Ошибка "Permission denied"**:
- Проверьте что Service Role Key правильный
- Убедитесь что bucket `assets` публичный (для чтения шрифтов)

**Ошибка "Failed to download"**:
- Проверьте интернет-соединение
- Google Fonts CDN может быть временно недоступен, попробуйте позже

