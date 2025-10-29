# 🔧 Edge Functions Refactoring Plan

**Дата**: 2025-10-20  
**Версия**: 1.0  
**Статус**: 🚧 В разработке  
**Автор**: Backend Architecture Team

---

## 📋 Executive Summary

### Проблема
Монолитный Edge Function `make-server-9729c493/index.ts` (2312 строк) нарушает микросервисную архитектуру:
- ❌ **Не деплоится через Supabase MCP** - файл слишком большой (>2000 строк)
- ❌ **Не AI-friendly** - сложно анализировать и поддерживать
- ❌ **Дублирование кода** - многие endpoints уже реализованы в микросервисах
- ❌ **Смешанная ответственность** - admin, user, i18n, media endpoints в одном файле

### Решение
Разбить монолит на микросервисы по зонам ответственности:
1. **admin-api** - все admin endpoints (stats, users, settings, languages)
2. **i18n-api** - публичные i18n endpoints (уже частично в translations-api)
3. **transcription-api** - Whisper API для голосовых заметок
4. **_shared/** - общие утилиты (auth, validation, error handling, OpenAI logging)

### Критерии успеха
- ✅ Нет файлов Edge Functions >500 строк
- ✅ Каждый микросервис имеет одну зону ответственности
- ✅ Все микросервисы деплоятся через Supabase MCP без ошибок
- ✅ Frontend использует только новые микросервисы
- ✅ Нет ошибок 404/500 в Edge Function логах

---

## 📊 Анализ текущего состояния

### Существующие микросервисы (8 шт.)

| Микросервис | Строк | Статус | Endpoints | Зона ответственности |
|-------------|-------|--------|-----------|---------------------|
| **ai-analysis** | 342 | ✅ Production | POST /analyze | AI анализ записей |
| **entries** | 233 | ✅ Production | POST /, GET /:userId, PUT /:id, DELETE /:id | CRUD записей |
| **profiles** | 225 | ✅ Production | POST /profiles/create, GET /profiles/:userId, PUT /profiles/:userId | Профили пользователей |
| **stats** | 252 | ✅ Production | GET /stats/user/:userId | Статистика пользователя |
| **motivations** | 372 | ✅ Production | GET /cards/:userId, POST /mark-read | Мотивационные карточки |
| **media** | 427 | ✅ Production | POST /upload, POST /signed-url, DELETE /:path | Медиафайлы |
| **telegram-auth** | 347 | ✅ Production | POST / | Telegram OAuth |
| **translations-api** | 224 | ✅ Production | GET /languages, GET /:lang, GET /stats, GET /export | Переводы (публичные) |

**Итого**: 8 микросервисов, 2422 строк кода (средний размер: 303 строки)

### Монолитный make-server-9729c493 (2312 строк)

#### Endpoints в монолите (31 шт.)

**1. Voice Transcription (1 endpoint)**
- `POST /transcribe` - Whisper API для голосовых заметок

**2. Media (3 endpoints)** - ⚠️ ДУБЛИРУЮТСЯ с media микросервисом
- `POST /media/upload` - загрузка медиа
- `POST /media/signed-url` - получение signed URL
- `DELETE /media/:path` - удаление медиа

**3. AI Analysis (1 endpoint)** - ⚠️ ДУБЛИРУЕТСЯ с ai-analysis микросервисом
- `POST /analyze` - AI анализ текста

**4. Profiles (4 endpoints)** - ⚠️ ДУБЛИРУЮТСЯ с profiles микросервисом
- `POST /profiles/create` - создание профиля
- `GET /profiles/:userId` - получение профиля (новый)
- `GET /profile/:userId` - получение профиля (старый, для совместимости)
- `PUT /profile/:userId` - обновление профиля

**5. Entries (4 endpoints)** - ⚠️ ДУБЛИРУЮТСЯ с entries микросервисом
- `POST /entries` - создание записи (новый)
- `POST /entries/create` - создание записи (старый, для совместимости)
- `GET /entries/:userId` - получение записей (новый)
- `GET /entries/list` - получение записей (старый, для совместимости)

**6. Stats (1 endpoint)** - ⚠️ ДУБЛИРУЕТСЯ с stats микросервисом
- `GET /stats/:userId` - статистика пользователя

**7. Motivations (2 endpoints)** - ⚠️ ДУБЛИРУЮТСЯ с motivations микросервисом
- `GET /motivations/cards/:userId` - получение карточек
- `POST /motivations/mark-read` - отметить как прочитанное

**8. Admin Endpoints (8 endpoints)** - 🆕 НУЖЕН НОВЫЙ МИКРОСЕРВИС admin-api
- `GET /admin/stats` - статистика админ-панели
- `GET /admin/users` - список пользователей
- `GET /admin/settings/:key` - получение настройки
- `POST /admin/settings` - сохранение настройки
- `GET /admin/languages` - список языков
- `POST /admin/languages` - добавление языка
- `PUT /admin/languages/:code` - обновление языка
- `GET /admin/translations` - все переводы
- `POST /admin/translations` - сохранение перевода

**9. i18n Public Endpoints (4 endpoints)** - ⚠️ ЧАСТИЧНО ДУБЛИРУЮТСЯ с translations-api
- `GET /i18n/languages` - список языков (публичный)
- `GET /i18n/translations/:lang` - переводы для языка (публичный)
- `GET /i18n/keys` - список ключей переводов
- `POST /i18n/missing` - сообщение об отсутствующем переводе
- `GET /i18n/health` - проверка здоровья API

**10. i18n Admin Endpoints (3 endpoints)** - 🆕 НУЖЕН НОВЫЙ МИКРОСЕРВИС admin-api
- `POST /i18n/admin/translate` - автоперевод через OpenAI
- `PUT /i18n/admin/translations` - обновление переводов
- `GET /i18n/admin/stats` - статистика переводов

---

## 🎯 План рефакторинга

### Фаза 1: Создание общих утилит (_shared/)

**Цель**: Вынести общий код для переиспользования во всех микросервисах

**Создать файлы:**
1. `supabase/functions/_shared/auth.ts` - проверка авторизации (super_admin, user)
2. `supabase/functions/_shared/openai-logger.ts` - логирование использования OpenAI API
3. `supabase/functions/_shared/cors.ts` - CORS headers и middleware
4. `supabase/functions/_shared/errors.ts` - обработка ошибок
5. `supabase/functions/_shared/validation.ts` - валидация данных

**Код для переноса:**
- `logOpenAIUsage()` функция (строки 30-73 из make-server-9729c493)
- CORS headers и middleware
- Проверка super_admin авторизации (повторяется в каждом admin endpoint)

**Критерии успеха:**
- ✅ Каждый файл <200 строк
- ✅ Все функции экспортируются
- ✅ Есть JSDoc комментарии

---

### Фаза 2: Создание admin-api микросервиса

**Цель**: Вынести все admin endpoints в отдельный микросервис

**Endpoints для переноса (11 шт.):**
1. `GET /admin/stats` - статистика админ-панели
2. `GET /admin/users` - список пользователей
3. `GET /admin/settings/:key` - получение настройки
4. `POST /admin/settings` - сохранение настройки
5. `GET /admin/languages` - список языков
6. `POST /admin/languages` - добавление языка
7. `PUT /admin/languages/:code` - обновление языка
8. `GET /admin/translations` - все переводы
9. `POST /admin/translations` - сохранение перевода
10. `POST /admin/translate` - автоперевод через OpenAI
11. `PUT /admin/translations` - обновление переводов
12. `GET /admin/translation-stats` - статистика переводов

**Структура файла:**
```typescript
// supabase/functions/admin-api/index.ts
import { Hono } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsMiddleware } from '../_shared/cors.ts';
import { checkSuperAdmin } from '../_shared/auth.ts';
import { logOpenAIUsage } from '../_shared/openai-logger.ts';

const app = new Hono();
app.use('*', corsMiddleware);

// Admin Stats
app.get('/admin/stats', checkSuperAdmin, async (c) => { ... });

// Admin Users
app.get('/admin/users', checkSuperAdmin, async (c) => { ... });

// Admin Settings
app.get('/admin/settings/:key', checkSuperAdmin, async (c) => { ... });
app.post('/admin/settings', checkSuperAdmin, async (c) => { ... });

// Admin Languages
app.get('/admin/languages', checkSuperAdmin, async (c) => { ... });
app.post('/admin/languages', checkSuperAdmin, async (c) => { ... });
app.put('/admin/languages/:code', checkSuperAdmin, async (c) => { ... });

// Admin Translations
app.get('/admin/translations', checkSuperAdmin, async (c) => { ... });
app.post('/admin/translations', checkSuperAdmin, async (c) => { ... });
app.put('/admin/translations', checkSuperAdmin, async (c) => { ... });

// Admin Auto-translate
app.post('/admin/translate', checkSuperAdmin, async (c) => { ... });

// Admin Translation Stats
app.get('/admin/translation-stats', checkSuperAdmin, async (c) => { ... });

Deno.serve(app.fetch);
```

**Критерии успеха:**
- ✅ Файл <500 строк
- ✅ Все admin endpoints работают
- ✅ Проверка super_admin авторизации на каждом endpoint
- ✅ Деплоится через Supabase MCP

---

### Фаза 3: Создание transcription-api микросервиса

**Цель**: Вынести Whisper API в отдельный микросервис

**Endpoints для переноса (1 шт.):**
1. `POST /transcribe` - транскрипция голосовых заметок через Whisper API

**Структура файла:**
```typescript
// supabase/functions/transcription-api/index.ts
import { Hono } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsMiddleware } from '../_shared/cors.ts';
import { logOpenAIUsage } from '../_shared/openai-logger.ts';
import { Buffer } from 'node:buffer';

const app = new Hono();
app.use('*', corsMiddleware);

app.post('/transcribe', async (c) => {
  // Whisper API logic
});

Deno.serve(app.fetch);
```

**Критерии успеха:**
- ✅ Файл <300 строк
- ✅ Whisper API работает
- ✅ Логирование использования OpenAI
- ✅ Деплоится через Supabase MCP

---

### Фаза 4: Расширение translations-api

**Цель**: Добавить недостающие публичные i18n endpoints

**Endpoints для добавления:**
1. `GET /keys` - список ключей переводов
2. `POST /missing` - сообщение об отсутствующем переводе
3. `GET /health` - проверка здоровья API

**Критерии успеха:**
- ✅ Файл <300 строк
- ✅ Все публичные i18n endpoints работают
- ✅ Деплоится через Supabase MCP

---

### Фаза 5: Обновление frontend API клиентов

**Цель**: Заменить все вызовы к make-server-9729c493 на новые микросервисы

**Файлы для обновления:**
1. `src/utils/api.ts` - удалить API_BASE_URL к make-server
2. `src/shared/lib/api/api.ts` - удалить LEGACY_API_URL
3. `src/shared/lib/i18n/api.ts` - заменить на translations-api
4. `src/features/admin/auth/components/AdminLoginScreen.tsx` - заменить на profiles
5. `src/features/admin/dashboard/components/UsersManagementTab.tsx` - заменить на admin-api
6. `src/features/admin/dashboard/components/AdminDashboard.tsx` - заменить на admin-api
7. `src/features/mobile/auth/components/WelcomeScreen.tsx` - заменить на translations-api
8. `src/components/screens/admin/settings/*.tsx` - заменить на admin-api

**Критерии успеха:**
- ✅ Нет вызовов к make-server-9729c493
- ✅ Все функции работают
- ✅ Нет ошибок в консоли браузера

---

### Фаза 6: Деплой и тестирование

**Цель**: Задеплоить все микросервисы и протестировать

**Шаги:**
1. Деплой _shared утилит (не требует деплоя, используются локально)
2. Деплой admin-api через Supabase MCP
3. Деплой transcription-api через Supabase MCP
4. Обновление translations-api через Supabase MCP
5. Тестирование локально (npm run preview)
6. Тестирование на production (Netlify)
7. Проверка логов Edge Functions

**Критерии успеха:**
- ✅ Все микросервисы задеплоены
- ✅ Нет ошибок 404/500 в логах
- ✅ Frontend работает без ошибок
- ✅ Все функции работают корректно

---

### Фаза 7: Удаление монолита

**Цель**: Удалить make-server-9729c493 после успешного тестирования

**Шаги:**
1. Финальная проверка всех функций
2. Удаление папки `supabase/functions/make-server-9729c493/`
3. Удаление файла `src/supabase/functions/server/index.tsx` (дубликат)
4. Коммит изменений

**Критерии успеха:**
- ✅ make-server-9729c493 удален
- ✅ Frontend работает без ошибок
- ✅ Все тесты проходят

---

## 📈 Метрики успеха

### До рефакторинга
- **Количество Edge Functions**: 9 (8 микросервисов + 1 монолит)
- **Средний размер файла**: 303 строки (микросервисы) + 2312 строк (монолит)
- **Дублирование кода**: 20+ endpoints дублируются
- **Деплой через MCP**: ❌ Монолит не деплоится

### После рефакторинга
- **Количество Edge Functions**: 11 (10 микросервисов + 1 _shared)
- **Средний размер файла**: <350 строк
- **Дублирование кода**: 0 endpoints дублируются
- **Деплой через MCP**: ✅ Все микросервисы деплоятся

---

## 🚀 Следующие шаги

1. ✅ Анализ текущего состояния - COMPLETE
2. 🚧 Создание детального плана рефакторинга - IN PROGRESS
3. ⏳ Создание _shared утилит
4. ⏳ Создание admin-api микросервиса
5. ⏳ Создание transcription-api микросервиса
6. ⏳ Расширение translations-api
7. ⏳ Обновление frontend API клиентов
8. ⏳ Деплой и тестирование
9. ⏳ Удаление монолита
10. ⏳ Обновление документации

