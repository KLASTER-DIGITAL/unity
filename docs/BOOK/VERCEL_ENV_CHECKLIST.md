# ✅ Чеклист переменных окружения для PDF API

## 🔍 Что нужно проверить в Vercel

### ✅ Уже есть (из ваших скриншотов):
- ✅ `VITE_SUPABASE_URL` - используется автоматически
- ✅ `VITE_SUPABASE_ANON_KEY` - для клиентской части
- ✅ `VITE_APP_VERSION`
- ✅ `VITE_SENTRY_DSN`
- ✅ `SENTRY_AUTH_TOKEN`

### ❌ Что нужно добавить:

**КРИТИЧЕСКИ ВАЖНО:**
- ❌ `SUPABASE_SERVICE_ROLE_KEY` - **это единственная переменная, которая нужна!**

**Опционально (для ясности):**
- ❌ `SUPABASE_URL` = `https://ecuwuzqlwdkkdncampnc.supabase.co`
  - Не обязательно, т.к. код использует `VITE_SUPABASE_URL` автоматически

### ❌ Что НЕ нужно:
- ❌ `pdfgen` - эта переменная не используется в коде, можно удалить

## 📝 Что нужно сделать:

1. **Удалите** переменную `pdfgen` (если она не используется для других целей)

2. **Добавьте** переменную `SUPABASE_SERVICE_ROLE_KEY`:
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: (service_role key из Supabase)
   - **Environment**: все три (Production, Preview, Development)

3. **Перезапустите** деплой в Vercel

## 🔑 Как получить Service Role Key:

См. инструкцию: `docs/BOOK/FIND_SERVICE_ROLE_KEY.md`

Кратко:
1. Supabase Dashboard → Settings → API Keys
2. Переключитесь на вкладку **"Legacy API Keys"**
3. Найдите `service_role` key
4. Скопируйте его

