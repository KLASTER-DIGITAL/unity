# 🚀 Быстрая настройка Vercel для генерации PDF

## ⚡ Что нужно сделать (5 минут)

### 1️⃣ Откройте Vercel Dashboard
👉 https://vercel.com/dashboard → выберите проект `unity-v2`

### 2️⃣ Добавьте переменные окружения
1. **Settings** → **Environment Variables**
2. Нажмите **Add New**
3. Добавьте две переменные:

**Переменная 1:**
- **Key**: `SUPABASE_URL`
- **Value**: `https://ecuwuzqlwdkkdncampnc.supabase.co`
- **Environment**: Production, Preview, Development (все три)

**Переменная 2:**
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: (скопируйте из Supabase Dashboard, см. ниже)
- **Environment**: Production, Preview, Development (все три)

### 3️⃣ Получите Service Role Key из Supabase
1. Откройте https://supabase.com/dashboard
2. Выберите проект `ecuwuzqlwdkkdncampnc`
3. **Settings** → **API**
4. Найдите секцию **Project API keys**
5. Скопируйте **`service_role`** key (⚠️ НЕ `anon` key!)
6. Вставьте в Vercel как значение `SUPABASE_SERVICE_ROLE_KEY`

### 4️⃣ Перезапустите деплой
1. В Vercel Dashboard → **Deployments**
2. Найдите последний деплой
3. Нажмите **⋯** (три точки) → **Redeploy**
4. Дождитесь завершения деплоя

### 5️⃣ Проверьте работу
1. Откройте приложение
2. Создайте или отредактируйте книгу
3. Нажмите **"Создать PDF"**
4. PDF должен сгенерироваться с правильной кодировкой! ✅

## ❌ Если не работает

### Проверьте логи Vercel:
1. **Deployments** → выберите деплой → **Functions** → `/api/books/render-pdf`
2. Ищите ошибки с префиксом `[VERCEL-PDF]`

### Частые проблемы:

**Ошибка: "Supabase configuration missing"**
→ Проверьте, что `SUPABASE_SERVICE_ROLE_KEY` добавлен в Vercel

**Ошибка: "Invalid access token"**
→ Проверьте, что используется правильный `service_role` key (не `anon`)

**Ошибка: "Function timeout"**
→ Vercel Hobby plan имеет timeout 10 секунд. Для больших книг может потребоваться Pro plan (60 секунд)

## 📞 Нужна помощь?

Смотрите полную документацию: `docs/BOOK/PDF_GENERATION_VERCEL_SETUP.md`

