# 🚀 РУЧНОЙ ДЕПЛОЙ EDGE FUNCTION - 2025-10-16

## ⚠️ ПРОБЛЕМА

Edge Function не имеет эндпоинтов `/i18n/*`. Нужно задеплоить обновленную версию.

**Ошибка в браузере:**
```
Failed to load resource: the server responded with a status of 404 ()
https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/i18n/languages
```

## 🔧 РЕШЕНИЕ: Ручной деплой через Supabase Dashboard

### Шаг 1: Откройте Supabase Dashboard

1. Перейдите по ссылке: https://supabase.com/dashboard/project/ecuwuzqlwdkkdncampnc/functions
2. Найдите функцию `make-server-9729c493`
3. Нажмите на неё, чтобы открыть редактор

### Шаг 2: Замените код в файле `index.ts`

1. Откройте файл `supabase/functions/make-server-9729c493/index.ts` в вашем редакторе
2. Скопируйте **ВСЁ** содержимое (2246 строк)
3. В Supabase Dashboard:
   - Откройте файл `index.ts`
   - Выделите всё содержимое (Ctrl+A или Cmd+A)
   - Вставьте новый код (Ctrl+V или Cmd+V)

### Шаг 3: Проверьте файл `kv_store.tsx`

1. Откройте файл `supabase/functions/make-server-9729c493/kv_store.tsx` в вашем редакторе
2. Скопируйте содержимое
3. В Supabase Dashboard обновите файл `kv_store.tsx`

### Шаг 4: Задеплойте функцию

1. Нажмите кнопку **"Deploy"** в правом верхнем углу
2. Дождитесь завершения деплоя (обычно 1-2 минуты)
3. Проверьте, что версия функции увеличилась

### Шаг 5: Проверьте деплой

После успешного деплоя проверьте в браузере:

1. Откройте Chrome DevTools (F12)
2. Перейдите на вкладку Console
3. Обновите страницу (Cmd+R)
4. Проверьте, что нет ошибок 404

**Ожидаемый результат:**
```
✅ TranslationManager: Initialization complete
✅ Translations loaded for ru
✅ Translations loaded for en
```

## 📝 ВАЖНЫЕ ФАЙЛЫ

- `supabase/functions/make-server-9729c493/index.ts` - Основной файл (2246 строк)
- `supabase/functions/make-server-9729c493/kv_store.tsx` - KV Store (87 строк)

## 🎯 НОВЫЕ ЭНДПОИНТЫ

После деплоя будут доступны:

```
GET  /i18n/languages          - Получить все языки
GET  /i18n/translations/:lang - Получить переводы для языка
GET  /i18n/keys               - Получить все ключи
POST /i18n/missing            - Сообщить об отсутствующем переводе
GET  /i18n/health             - Проверка здоровья API
```

## ✅ СТАТУС

- [ ] Скопировать код в Supabase Dashboard
- [ ] Нажать Deploy
- [ ] Проверить в браузере
- [ ] Убедиться, что переводы загружаются

---

**Дата**: 2025-10-16  
**Версия**: 1.0

