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

В новом интерфейсе Supabase структура изменилась. Вот как найти `service_role` key:

**Вариант 1: Legacy API Keys (старый интерфейс)**
1. Откройте https://supabase.com/dashboard
2. Выберите проект `ecuwuzqlwdkkdncampnc`
3. Перейдите в **Settings** → **API Keys**
4. Переключитесь на вкладку **"Legacy API Keys"** (вверху страницы)
5. Найдите секцию **"Project API keys"**
6. Скопируйте **`service_role`** key (нажмите "Reveal" чтобы показать)
   - ⚠️ **ВАЖНО**: Это НЕ `anon` key, а именно `service_role` key!
   - Он обычно начинается с `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Вариант 2: Если Legacy API Keys нет**
1. В разделе **Settings** → **API Keys**
2. В секции **"Secret keys"** нажмите **"+ New secret key"**
3. Создайте новый ключ с правами **service_role**
4. Скопируйте созданный ключ

**Вариант 3: Через старый URL**
Попробуйте прямой URL: `https://supabase.com/dashboard/project/ecuwuzqlwdkkdncampnc/settings/api`

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

