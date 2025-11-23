# ⚠️ Исправление: правильные переменные для PDF API

## ❌ Что вы добавили:
- `pdfgen` - **эта переменная НЕ используется в коде**

## ✅ Что нужно добавить:

### 1. `SUPABASE_SERVICE_ROLE_KEY` (ОБЯЗАТЕЛЬНО!)

Это **единственная** переменная, которая нужна для работы PDF API.

**Как добавить:**
1. В Vercel Dashboard → **Settings** → **Environment Variables**
2. Нажмите **Add New**
3. Заполните:
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY` (именно так, с подчеркиваниями!)
   - **Value**: (service_role key из Supabase - см. инструкцию ниже)
   - **Environment**: выберите все три (Production, Preview, Development)
4. Нажмите **Save**

### 2. `SUPABASE_URL` (опционально)

Не обязательно, т.к. код автоматически использует `VITE_SUPABASE_URL`, который у вас уже есть.

Но для ясности можно добавить:
- **Key**: `SUPABASE_URL`
- **Value**: `https://ecuwuzqlwdkkdncampnc.supabase.co`
- **Environment**: все три

## 🔑 Как получить Service Role Key:

1. Откройте https://supabase.com/dashboard
2. Выберите проект `ecuwuzqlwdkkdncampnc`
3. **Settings** → **API Keys**
4. Переключитесь на вкладку **"Legacy API Keys"** (вверху страницы)
5. Найдите секцию **"Project API keys"**
6. Найдите **`service_role`** key (НЕ `anon`!)
7. Нажмите **"Reveal"** чтобы показать
8. Скопируйте ключ

## 📋 Итоговый список переменных:

После настройки у вас должно быть:

**Для клиентской части (уже есть):**
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- ✅ `VITE_APP_VERSION`
- ✅ `VITE_SENTRY_DSN`
- ✅ `SENTRY_AUTH_TOKEN`

**Для PDF API (нужно добавить):**
- ❌ `SUPABASE_SERVICE_ROLE_KEY` ← **ДОБАВЬТЕ ЭТУ!**

**Опционально:**
- ❌ `SUPABASE_URL` (можно не добавлять, т.к. используется `VITE_SUPABASE_URL`)

## 🔄 После добавления:

1. **Deployments** → последний деплой
2. Нажмите **⋯** → **Redeploy**
3. Дождитесь завершения
4. Протестируйте генерацию PDF!

