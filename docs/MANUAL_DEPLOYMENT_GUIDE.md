# 🚀 РУКОВОДСТВО ПО РУЧНОМУ ДЕПЛОЮ EDGE FUNCTION

## Проблема
Docker Desktop не установлен, поэтому мы не можем использовать Supabase CLI для автоматического деплоя.

## Решение: Ручной деплой через Supabase Dashboard

### Шаг 1: Откройте Supabase Dashboard

1. Перейдите по ссылке: https://supabase.com/dashboard/project/ecuwuzqlwdkkdncampnc/functions
2. Войдите в свой аккаунт Supabase

### Шаг 2: Найдите функцию `make-server-9729c493`

1. В списке Edge Functions найдите `make-server-9729c493`
2. Нажмите на неё, чтобы открыть редактор

### Шаг 3: Замените код

Вам нужно заменить содержимое **трёх файлов**:

#### Файл 1: `index.ts`

1. Откройте файл `supabase/functions/make-server-9729c493/index.ts` в вашем редакторе
2. Скопируйте **ВСЁ** содержимое (1941 строка)
3. В Supabase Dashboard вставьте этот код в файл `index.ts`

**Важно:** Убедитесь, что скопировали весь файл от начала до конца!

#### Файл 2: `kv_store.tsx`

1. Откройте файл `supabase/functions/make-server-9729c493/kv_store.tsx`
2. Скопируйте всё содержимое (87 строк)
3. В Supabase Dashboard создайте или обновите файл `kv_store.tsx`

#### Файл 3: Удалите `index_simple.ts` (если есть)

Этот файл больше не нужен, так как мы используем полную версию `index.ts`.

### Шаг 4: Задеплойте функцию

1. Нажмите кнопку **"Deploy"** в правом верхнем углу
2. Дождитесь завершения деплоя (обычно 1-2 минуты)
3. Проверьте, что версия функции увеличилась (должна быть v30 или выше)

### Шаг 5: Проверьте деплой

После успешного деплоя проверьте, что функция работает:

```bash
# Проверка эндпоинта профиля
curl -X GET \
  "https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/profiles/726a9369-8c28-4134-b03f-3c29ad1235f4" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Должен вернуться статус 200 и данные профиля.

---

## Альтернатива: Установить Docker и использовать CLI

Если вы хотите использовать автоматический деплой в будущем:

```bash
# 1. Установить Docker Desktop
brew install --cask docker

# 2. Запустить Docker Desktop
open -a Docker

# 3. Дождаться запуска Docker (проверить в меню бар)

# 4. Задеплоить функцию
cd "/Users/rustamkarimov/DEV/UNITY — v 2"
supabase functions deploy make-server-9729c493 --project-ref ecuwuzqlwdkkdncampnc
```

---

## Что дальше?

После успешного деплоя:

1. ✅ Обновите страницу приложения: http://localhost:3000/
2. ✅ Проверьте, что профиль загружается
3. ✅ Проверьте, что onboarding пропускается
4. ✅ Начните тестирование всех разделов меню

---

## Помощь

Если возникли проблемы:

1. Проверьте логи функции в Dashboard: https://supabase.com/dashboard/project/ecuwuzqlwdkkdncampnc/functions/make-server-9729c493/logs
2. Проверьте, что все 3 файла скопированы полностью
3. Убедитесь, что нет синтаксических ошибок в коде

