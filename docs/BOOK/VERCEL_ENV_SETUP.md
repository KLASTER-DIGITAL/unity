# ✅ Настройка переменных окружения в Vercel для PDF API

## 📋 Текущее состояние

У вас уже настроены:
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- ✅ `VITE_APP_VERSION`
- ✅ `VITE_SENTRY_DSN`
- ✅ `SENTRY_AUTH_TOKEN`

## ⚠️ Что нужно добавить

### Критически важно: `SUPABASE_SERVICE_ROLE_KEY`

Это единственная переменная, которая нужна для работы PDF API.

## 🔧 Как добавить

### Шаг 1: Получите Service Role Key из Supabase

1. Откройте https://supabase.com/dashboard
2. Выберите проект `ecuwuzqlwdkkdncampnc`
3. Перейдите в **Settings** → **API**
4. Найдите секцию **Project API keys**
5. Скопируйте **`service_role`** key
   - ⚠️ **ВАЖНО**: Это НЕ `anon` key, а именно `service_role` key!
   - Он обычно начинается с `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Шаг 2: Добавьте в Vercel

1. В Vercel Dashboard → **Settings** → **Environment Variables**
2. Нажмите **Add New**
3. Заполните:
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: (вставьте скопированный `service_role` key)
   - **Environment**: выберите все три (Production, Preview, Development)
4. Нажмите **Save**

### Шаг 3 (опционально): Добавьте `SUPABASE_URL`

Хотя код может использовать `VITE_SUPABASE_URL`, для ясности лучше добавить:

- **Key**: `SUPABASE_URL`
- **Value**: `https://ecuwuzqlwdkkdncampnc.supabase.co`
- **Environment**: все три

## 🔄 Перезапустите деплой

После добавления переменных:

1. **Deployments** → последний деплой
2. Нажмите **⋯** (три точки) → **Redeploy**
3. Дождитесь завершения

## ✅ Проверка

После перезапуска:

1. Откройте приложение
2. Создайте или отредактируйте книгу
3. Нажмите **"Создать PDF"**
4. PDF должен сгенерироваться! ✅

## 🔍 Если не работает

Проверьте логи Vercel:
- **Deployments** → выберите деплой → **Functions** → `/api/books/render-pdf`
- Ищите ошибки с префиксом `[VERCEL-PDF]`

Если видите "Supabase configuration missing" → проверьте, что `SUPABASE_SERVICE_ROLE_KEY` добавлен правильно.

