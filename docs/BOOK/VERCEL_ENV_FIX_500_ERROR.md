# 🔧 Исправление ошибки 500 в Vercel API - 30 января 2025

## Проблема

При генерации PDF через Vercel API возникает ошибка 500:
```
HTTP error! status: 500
Supabase configuration missing
```

## Причина

В Vercel Dashboard отсутствует или неправильно настроена переменная окружения `SUPABASE_SERVICE_ROLE_KEY`.

## Решение

### Шаг 1: Проверьте переменные окружения в Vercel

1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите проект `unity-v2` (или ваш проект)
3. Перейдите в **Settings** → **Environment Variables**
4. Проверьте наличие следующих переменных:

**Обязательные переменные:**
- ✅ `VITE_SUPABASE_URL` = `https://ecuwuzqlwdkkdncampnc.supabase.co` (уже должно быть)
- ❌ `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (НУЖНО ДОБАВИТЬ!)

### Шаг 2: Добавьте `SUPABASE_SERVICE_ROLE_KEY`

1. Скопируйте `service_role` ключ из Supabase:
   - Откройте [Supabase Dashboard](https://supabase.com/dashboard)
   - Выберите проект `ecuwuzqlwdkkdncampnc`
   - Перейдите в **Settings** → **API**
   - Найдите секцию **Project API keys**
   - Скопируйте `service_role` key (НЕ `anon` key!)

2. Добавьте в Vercel:
   - В Vercel Dashboard → Settings → Environment Variables
   - Нажмите **Add New**
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: вставьте скопированный `service_role` key
   - **Environment**: выберите **Production**, **Preview**, и **Development** (или только Production)
   - Нажмите **Save**

### Шаг 3: Перезапустите деплой

После добавления переменной окружения:
1. В Vercel Dashboard перейдите в **Deployments**
2. Найдите последний деплой
3. Нажмите **Redeploy** (или сделайте новый push в `main`)

### Шаг 4: Проверьте работу

1. Откройте приложение
2. Откройте редактор книги
3. Нажмите "Сохранить"
4. PDF должен автоматически сгенерироваться
5. Проверьте просмотр и скачивание PDF

## Важно!

⚠️ **НЕ используйте `pdfgen`** - это неправильное имя переменной!

✅ **Используйте `SUPABASE_SERVICE_ROLE_KEY`** - именно это имя ожидает код!

## Проверка переменных

После добавления переменных, проверьте что они доступны:

1. В Vercel Dashboard → Settings → Environment Variables
2. Убедитесь что `SUPABASE_SERVICE_ROLE_KEY` присутствует
3. Убедитесь что она доступна для нужных окружений (Production, Preview, Development)

## Если ошибка 500 все еще возникает

1. Проверьте логи Vercel:
   - Vercel Dashboard → Deployments → выберите деплой → **Functions** → `/api/books/render-pdf` → **Logs**
   - Ищите сообщения `[VERCEL-PDF] Supabase service key missing`

2. Убедитесь что:
   - Переменная называется именно `SUPABASE_SERVICE_ROLE_KEY` (не `pdfgen`, не `SUPABASE_SERVICE_KEY`)
   - Значение скопировано полностью (весь JWT токен)
   - Переменная доступна для нужного окружения (Production)

3. Перезапустите деплой после изменений

