# 🚀 Инструкция по деплою Edge Function на Supabase

## Текущая ситуация

Приложение Unity Diary использует Supabase Edge Function для обработки AI-запросов и управления данными.

**Проект Supabase**: `ecuwuzqlwdkkdncampnc`  
**Edge Function**: `make-server-9729c493`  
**API URL**: `https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493`

## Проблема

Локальный файл `/src/supabase/functions/server/index.tsx` был обновлен с улучшенным AI-промптом, который генерирует дополнительные поля:
- `summary` - краткое резюме достижения (заголовок карточки)
- `insight` - позитивный вывод/инсайт (описание карточки)
- `mood` - настроение одним словом
- `isAchievement` - boolean флаг достижения

**НО** эти изменения НЕ применены на продакшн Supabase Edge Function, поэтому API продолжает возвращать только старые поля (reply, sentiment, category, tags, confidence).

## Решение

Необходимо задеплоить обновленную версию Edge Function на Supabase.

### Шаг 1: Установка Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Или через npm
npm install -g supabase
```

### Шаг 2: Логин в Supabase

```bash
supabase login
```

Введите свой Access Token из https://app.supabase.com/account/tokens

### Шаг 3: Подготовка проекта

Убедитесь, что в корне проекта есть папка `supabase/functions/make-server-9729c493/`:

```bash
mkdir -p supabase/functions/make-server-9729c493
cp src/supabase/functions/server/index.tsx supabase/functions/make-server-9729c493/index.ts
```

**ВАЖНО**: Переименуйте файл в `.ts` (без x) для Edge Functions.

### Шаг 4: Создание deno.json

Создайте файл `supabase/functions/make-server-9729c493/deno.json`:

```json
{
  "imports": {
    "hono": "https://deno.land/x/hono@v3.11.7/mod.ts"
  }
}
```

### Шаг 5: Линкуем проект

```bash
supabase link --project-ref ecuwuzqlwdkkdncampnc
```

### Шаг 6: Деплой функции

```bash
supabase functions deploy make-server-9729c493
```

### Шаг 7: Установка секретов

Функция требует OpenAI API ключ:

```bash
supabase secrets set OPENAI_API_KEY="ваш-openai-api-key"
```

## Проверка

После деплоя проверьте, что новые поля возвращаются:

```bash
curl -X POST https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/chat/analyze \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "Сегодня я написал отличный код!", "userName": "Test", "userId": "test-id"}'
```

Ответ должен содержать:
- `reply`
- `summary` ← НОВОЕ
- `insight` ← НОВОЕ
- `mood` ← НОВОЕ
- `isAchievement` ← НОВОЕ
- `sentiment`
- `category`
- `tags`
- `confidence`

## Изменения в AI-промпте

Основные улучшения:
1. Добавлен `response_format: { type: "json_object" }` - гарантирует валидный JSON
2. Промпт ОБЯЗАТЕЛЬНО требует все 9 полей
3. Увеличен `max_tokens` с 400 до 500
4. Улучшено форматирование инструкций для AI
5. Добавлена поддержка мультиязычности (`userLanguage`)

## Rollback

Если что-то пошло не так:

```bash
# Список версий
supabase functions list

# Откат к предыдущей версии
supabase functions restore make-server-9729c493 --version <version-id>
```

## Мониторинг

Проверить логи функции:

```bash
supabase functions logs make-server-9729c493
```

Или в Dashboard: https://app.supabase.com/project/ecuwuzqlwdkkdncampnc/functions/make-server-9729c493/logs

---

**Автор**: AI Assistant  
**Дата**: 2025-10-12  
**Статус**: Ожидает деплоя

