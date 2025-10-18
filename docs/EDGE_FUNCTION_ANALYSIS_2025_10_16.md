# 🔍 EDGE FUNCTION ANALYSIS - 2025-10-16

## ⚠️ КРИТИЧЕСКАЯ ПРОБЛЕМА

Я допустил серьезную ошибку! Я пытался развернуть монолитную Edge Function (68KB, 2245 строк), хотя в проекте уже есть микросервисная архитектура!

## ✅ ТЕКУЩЕЕ СОСТОЯНИЕ

### Развернутые Edge Functions (Supabase MCP):

1. **make-server-9729c493** (v37) - УСТАРЕВШАЯ МОНОЛИТНАЯ ФУНКЦИЯ
   - Статус: ACTIVE
   - Содержит: ТОЛЬКО i18n endpoints
   - Проблема: Отсутствуют `/profiles/create`, `/entries`, `/motivations/cards/:userId`

2. **translations-api** (v6) - ✅ МИКРОСЕРВИС
   - Статус: ACTIVE
   - Назначение: Управление переводами

3. **admin-api** (v3) - ✅ МИКРОСЕРВИС
   - Статус: ACTIVE
   - Назначение: Админ панель

4. **telegram-auth** (v22) - ✅ МИКРОСЕРВИС
   - Статус: ACTIVE
   - Назначение: Telegram авторизация

5. **stats** (v1) - ✅ МИКРОСЕРВИС
   - Статус: ACTIVE
   - Назначение: Статистика пользователей

## 📋 ПЛАН МИГРАЦИИ (из docs/MIGRATION_PLAN_STEP_BY_STEP.md)

Проект уже имеет план разделения монолитной функции на микросервисы:

### Необходимые микросервисы:
- ✅ `stats` - статистика (УЖЕ СОЗДАН)
- ❌ `profiles` - управление профилями (НУЖНО СОЗДАТЬ)
- ❌ `entries` - управление записями (НУЖНО СОЗДАТЬ)
- ❌ `motivations` - мотивационные карточки (НУЖНО СОЗДАТЬ)
- ❌ `books` - архив книг (НУЖНО СОЗДАТЬ)
- ✅ `admin` - админ панель (УЖЕ СОЗДАН как admin-api)
- ✅ `i18n` - интернационализация (УЖЕ СОЗДАН как translations-api)

## 🎯 ПРАВИЛЬНОЕ РЕШЕНИЕ

### Шаг 1: Создать микросервис `profiles`
Файл: `supabase/functions/profiles/index.ts`

Endpoints:
- `POST /profiles/create` - создание профиля
- `GET /profiles/:userId` - получение профиля
- `PUT /profiles/:userId` - обновление профиля

### Шаг 2: Создать микросервис `entries`
Файл: `supabase/functions/entries/index.ts`

Endpoints:
- `POST /entries` - создание записи
- `GET /entries/:userId` - получение записей пользователя
- `PUT /entries/:entryId` - обновление записи
- `DELETE /entries/:entryId` - удаление записи

### Шаг 3: Создать микросервис `motivations`
Файл: `supabase/functions/motivations/index.ts`

Endpoints:
- `GET /motivations/cards/:userId` - получение мотивационных карточек

### Шаг 4: Обновить API клиенты
Обновить `src/shared/lib/api/api.ts` для использования новых микросервисов

## 🚫 ЧТО НЕ НУЖНО ДЕЛАТЬ

- ❌ НЕ развертывать монолитную функцию (68KB, 2245 строк)
- ❌ НЕ использовать Docker
- ❌ НЕ использовать Supabase CLI
- ❌ НЕ объединять все endpoints в один файл

## ✅ ЧТО НУЖНО ДЕЛАТЬ

- ✅ Использовать ТОЛЬКО Supabase MCP (`deploy_edge_function_supabase`)
- ✅ Создавать микросервисы (каждый < 500 строк)
- ✅ Разделять ответственность (profiles, entries, motivations)
- ✅ Использовать общие утилиты (`supabase/functions/_shared/`)

## 📊 ТЕКУЩАЯ БЛОКИРОВКА

**Проблема**: Пользователь не может зарегистрироваться, потому что endpoint `/profiles/create` возвращает 404.

**Причина**: Endpoint отсутствует в развернутой версии v37 функции `make-server-9729c493`.

**Решение**: Создать микросервис `profiles` и развернуть его через Supabase MCP.

## 🎯 СЛЕДУЮЩИЕ ШАГИ

1. Создать `supabase/functions/profiles/index.ts`
2. Реализовать endpoint `POST /profiles/create`
3. Развернуть через `deploy_edge_function_supabase`
4. Обновить `src/shared/lib/api/api.ts`
5. Протестировать регистрацию через Chrome MCP

---

**Дата**: 2025-10-16  
**Статус**: 🔴 КРИТИЧЕСКАЯ БЛОКИРОВКА  
**Приоритет**: P0 - НЕМЕДЛЕННО

