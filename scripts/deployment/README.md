# Deployment Scripts

Скрипты для деплоя Edge Functions в Supabase (БЕЗ Docker).

## 🚀 deploy-edge-function.sh

Деплой Edge Function через Supabase CLI (соответствует правилам UNITY-v2).

### Использование

```bash
./scripts/deployment/deploy-edge-function.sh <function-name>
```

### Примеры

```bash
# Deploy admin-api
./scripts/deployment/deploy-edge-function.sh admin-api

# Deploy motivations
./scripts/deployment/deploy-edge-function.sh motivations

# Deploy translations-api
./scripts/deployment/deploy-edge-function.sh translations-api
```

### Что делает скрипт

1. ✅ Проверяет наличие Supabase CLI
2. ✅ Проверяет авторизацию
3. ✅ Проверяет синтаксис TypeScript (если Deno установлен)
4. ✅ Деплоит функцию через Supabase CLI (БЕЗ Docker)
5. ✅ Проверяет статус деплоя
6. ✅ Тестирует endpoint функции

### Требования

- Supabase CLI: `brew install supabase/tap/supabase`
- Авторизация: `supabase login`
- Deno (опционально): `brew install deno`

### Правила UNITY-v2

- ❌ **НИКОГДА** не использовать Docker для Edge Functions
- ✅ **ВСЕГДА** использовать Supabase CLI напрямую
- ✅ **ВСЕГДА** проверять размер функции (<300 строк)
- ✅ **ВСЕГДА** использовать standalone pattern

### Альтернатива: Supabase MCP

Для деплоя через Augment Agent используй Supabase MCP команду:

```typescript
deploy_edge_function_supabase({
  project_id: "ecuwuzqlwdkkdncampnc",
  name: "admin-api",
  files: [...]
})
```

## 📝 Логи

Просмотр логов функции:

```bash
supabase functions logs <function-name> --project-ref ecuwuzqlwdkkdncampnc
```

## 🔍 Troubleshooting

### Ошибка: "Supabase CLI not found"

```bash
brew install supabase/tap/supabase
```

### Ошибка: "Not logged in"

```bash
supabase login
```

### Ошибка: "Syntax check failed"

```bash
deno check supabase/functions/<function-name>/index.ts
```

### Ошибка: "Function too large"

Разбей функцию на модули (standalone pattern, max 300 строк).

