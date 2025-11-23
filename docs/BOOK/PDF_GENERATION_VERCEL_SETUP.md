# Настройка Vercel Serverless Function для генерации PDF

## ✅ Что реализовано

1. **Vercel API Route**: `/api/books/render-pdf`
   - Серверная генерация PDF через Puppeteer
   - Полная поддержка всех 9 языков
   - Правильные шрифты для каждого языка
   - Учет всех настроек wizard

2. **Поддержка языков**:
   - 🇷🇺 Русский (ru) - Noto Sans
   - 🇬🇧 Английский (en) - Noto Sans
   - 🇪🇸 Испанский (es) - Noto Sans
   - 🇩🇪 Немецкий (de) - Noto Sans
   - 🇫🇷 Французский (fr) - Noto Sans
   - 🇨🇳 Китайский (zh) - Noto Sans SC
   - 🇯🇵 Японский (ja) - Noto Sans JP
   - 🇰🇿 Казахский (kk) - Noto Sans (кириллица)
   - 🇬🇪 Грузинский (ka) - Noto Sans Georgian

3. **Настройки wizard**:
   - **Layout**: photo_text, text_only, minimal
   - **Style**: warm_family, biographical, motivational
   - **Theme**: light, dark

## 🔧 Настройка переменных окружения в Vercel

### Шаг 1: Откройте Vercel Dashboard
1. Перейдите на https://vercel.com/dashboard
2. Выберите проект `unity-v2`

### Шаг 2: Добавьте переменные окружения
1. Перейдите в **Settings** → **Environment Variables**
2. Добавьте следующие переменные:

```
SUPABASE_URL = https://ecuwuzqlwdkkdncampnc.supabase.co
SUPABASE_SERVICE_ROLE_KEY = (ваш Service Role Key из Supabase)
```

### Шаг 3: Получите Service Role Key
1. Откройте Supabase Dashboard: https://supabase.com/dashboard
2. Выберите проект `ecuwuzqlwdkkdncampnc`
3. Перейдите в **Settings** → **API**
4. Скопируйте **service_role** key (НЕ anon key!)
5. Вставьте в Vercel Environment Variables

### Шаг 4: Перезапустите деплой
После добавления переменных окружения:
1. Перейдите в **Deployments**
2. Нажмите на последний деплой
3. Нажмите **Redeploy**

## 🧪 Тестирование

После настройки переменных окружения:

1. Откройте приложение
2. Перейдите в раздел "Книги"
3. Создайте или отредактируйте книгу
4. Нажмите "Создать PDF"
5. Проверьте, что PDF генерируется с правильной кодировкой

## 📝 Примечания

- **Важно**: Service Role Key должен быть добавлен в Vercel Environment Variables
- **Безопасность**: Service Role Key имеет полный доступ к БД, храните его в секрете
- **Производительность**: Vercel Serverless Functions имеют timeout 10 секунд (Hobby) или 60 секунд (Pro)
- **Лимиты**: Vercel Hobby plan имеет лимит 100GB-hours в месяц

## 🔍 Отладка

Если PDF не генерируется:

1. Проверьте логи Vercel:
   - Vercel Dashboard → **Deployments** → выберите деплой → **Functions** → `/api/books/render-pdf`
2. Проверьте переменные окружения:
   - Убедитесь, что `SUPABASE_SERVICE_ROLE_KEY` установлен
3. Проверьте консоль браузера:
   - Откройте DevTools → Console
   - Ищите ошибки с префиксом `[DRAFT-EDITOR]` или `[VERCEL-PDF]`

## ✅ Преимущества нового решения

1. **Качественная генерация**: Puppeteer генерирует PDF с полной поддержкой Unicode
2. **Все языки**: Правильные шрифты для каждого из 9 языков
3. **Настройки wizard**: Все выбранные настройки учитываются
4. **Надежность**: Серверная генерация более стабильна, чем клиентская
5. **Производительность**: Не нагружает браузер пользователя

