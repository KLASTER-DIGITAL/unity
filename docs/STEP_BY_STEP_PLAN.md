# 🎯 UNITY-v2 - Пошаговый план реализации

**Дата**: 2025-11-15  
**Версия**: 1.0  
**Цель**: Пошаговая реализация с тестированием и деплоем после каждого шага

---

## 📋 Принципы работы

### 1. Маленькие шаги
- Каждый шаг = 1-2 часа работы
- После каждого шага: тестирование + коммит + деплой
- Пользователь может тестировать на production

### 2. Обязательные проверки после каждого шага
```bash
# 1. Консоль браузера (Chrome MCP)
# - 0 errors, 0 warnings

# 2. Supabase Advisors
get_advisors_supabase(project_id, type='security')
get_advisors_supabase(project_id, type='performance')

# 3. Build
npm run build

# 4. Lint
npm run lint:fix

# 5. Type check
npm run type-check
```

### 3. Документация изменений
- Обновлять `CHANGELOG.md` (пользовательские изменения)
- Обновлять `FIX.md` (технические изменения)
- Обновлять `implementation-status.md` (статус реализации)

---

## 🚀 Неделя 1: P0 - Фундамент (3 дня)

### День 1: AI Control Center - База данных (4 часа)

#### Шаг 1.1: Создать миграцию `ai_operations` (1 час)
**Файл**: `supabase/migrations/YYYYMMDD_create_ai_operations.sql`

**Действия**:
1. Создать таблицу `ai_operations`:
```sql
CREATE TABLE ai_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name TEXT NOT NULL, -- 'cards', 'push', 'reports', 'coach'
  display_name TEXT NOT NULL,
  description TEXT,
  model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  max_tokens INTEGER DEFAULT 500,
  temperature NUMERIC(3,2) DEFAULT 0.7,
  system_prompt TEXT NOT NULL,
  user_prompt_template TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  extra_config JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id),
  UNIQUE(group_name, display_name)
);
```

2. Создать таблицу `ai_operations_history` для версионирования:
```sql
CREATE TABLE ai_operations_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id UUID REFERENCES ai_operations(id),
  changed_fields JSONB NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

3. Создать seed данные (6 операций):
   - `entry_analysis` - анализ записи
   - `card_from_entry` - карточка из записи
   - `progress_card` - карточка прогресса
   - `push_text` - текст push-уведомления
   - `weekly_report` - недельный отчет
   - `monthly_report` - месячный отчет

**Промпты взять из**: `docs/new/ai-prompts-cards.md`

**Тестирование**:
```bash
# 1. Применить миграцию
supabase db push

# 2. Проверить таблицы
supabase db diff

# 3. Проверить seed данные
SELECT * FROM ai_operations;

# 4. Supabase Advisors
get_advisors_supabase(project_id, type='security')
get_advisors_supabase(project_id, type='performance')
```

**Коммит**: `feat(db): add ai_operations table for centralized AI management`

---

#### Шаг 1.2: Создать API для `ai_operations` (1 час)
**Файл**: `supabase/functions/ai-operations-api/index.ts`

**Endpoints**:
- `GET /ai-operations-api` - получить все операции
- `GET /ai-operations-api/:id` - получить одну операцию
- `PUT /ai-operations-api/:id` - обновить операцию
- `POST /ai-operations-api/:id/test` - тестировать промпт

**Действия**:
1. Создать Edge Function
2. Добавить RLS policies для `ai_operations` (только super_admin)
3. Добавить логирование в `ai_operations_history`

**Тестирование**:
```bash
# 1. Деплой Edge Function
deploy_edge_function_supabase(function_name='ai-operations-api')

# 2. Тест через curl
curl https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/ai-operations-api

# 3. Проверить консоль браузера (Chrome MCP)
# - 0 errors
```

**Коммит**: `feat(api): add ai-operations-api Edge Function`

---

#### Шаг 1.3: Обновить UI админ-панели (2 часа)
**Файл**: `src/components/screens/admin/settings/AIOperationsTab.tsx`

**Действия**:
1. Создать новый компонент `AIOperationsTab.tsx`
2. Секции:
   - Карточки и дневник (entry_analysis, card_from_entry, progress_card)
   - Push-уведомления (push_text)
   - Отчёты и книги (weekly_report, monthly_report)
3. Функции:
   - Редактирование промптов (textarea с syntax highlighting)
   - Настройка моделей (select: gpt-4o-mini, gpt-4o)
   - Тестирование (кнопка "Тест" → вызов `/ai-operations-api/:id/test`)
   - История изменений (таблица из `ai_operations_history`)

**Тестирование**:
```bash
# 1. Build
npm run build

# 2. Dev server
npm run dev

# 3. Открыть админ-панель
# https://unity-wine.vercel.app/?view=admin

# 4. Проверить консоль браузера (Chrome MCP)
# - 0 errors
# - 0 warnings

# 5. Проверить функционал:
# - Редактирование промпта
# - Сохранение
# - Тестирование
# - История изменений
```

**Коммит**: `feat(admin): add AI Operations management UI`

---

### День 2: Push Infrastructure (3 часа)

#### Шаг 2.1: Health-check endpoint (1 час)
**Файл**: `supabase/functions/push-health-check/index.ts`

**Действия**:
1. Создать Edge Function
2. Проверки:
   - VAPID ключи существуют в `admin_settings`
   - Webhooks настроены (entries INSERT, entry_summaries INSERT)
   - Cron jobs настроены (daily_reminder, weekly_motivation)
   - Service Worker зарегистрирован
3. Возврат JSON с статусом каждой проверки

**Тестирование**:
```bash
# 1. Деплой
deploy_edge_function_supabase(function_name='push-health-check')

# 2. Тест
curl https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-health-check

# 3. Проверить ответ:
# {
#   "vapid_keys": "ok",
#   "webhooks": "ok",
#   "cron_jobs": "ok",
#   "service_worker": "ok"
# }
```

**Коммит**: `feat(push): add health-check endpoint`

---

#### Шаг 2.2: Настроить webhooks (1 час)
**Действия**:
1. Создать webhook `push_on_entry_insert`:
   - Таблица: `entries`
   - Событие: INSERT
   - URL: `https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-realtime-trigger`
2. Создать webhook `push_on_summary_insert`:
   - Таблица: `entry_summaries`
   - Событие: INSERT
   - URL: `https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-realtime-trigger`

**Тестирование**:
```bash
# 1. Создать тестовую запись
INSERT INTO entries (user_id, text) VALUES ('...', 'Test entry');

# 2. Проверить что push отправлен
# - Проверить консоль браузера (Chrome MCP)
# - Проверить уведомление на телефоне

# 3. Проверить логи Edge Function
# - Supabase Dashboard → Edge Functions → push-realtime-trigger → Logs
```

**Коммит**: `feat(push): configure webhooks for entries and summaries`

---

#### Шаг 2.3: Настроить cron jobs (1 час)
**Действия**:
1. Создать cron job `daily_reminder`:
   - Расписание: `0 * * * *` (каждый час)
   - URL: `https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?type=daily_reminder`
2. Создать cron job `weekly_motivation`:
   - Расписание: `0 9 * * 1` (понедельник 9:00 UTC)
   - URL: `https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?type=weekly_motivation`

**Тестирование**:
```bash
# 1. Ручной вызов
curl -X POST https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-scheduled?type=daily_reminder

# 2. Проверить логи
# - Supabase Dashboard → Edge Functions → push-scheduled → Logs

# 3. Проверить что push отправлен
# - Проверить уведомление на телефоне
```

**Коммит**: `feat(push): configure cron jobs for scheduled notifications`

---

### День 3: Карточки - Окно 24 часа (2 часа)

#### Шаг 3.1: Обновить Edge Function `motivations` (1 час)
**Файл**: `supabase/functions/motivations/index.ts`

**Действия**:
1. Изменить окно с 48h на 24h (строка 249):
```typescript
// ❌ БЫЛО:
const yesterday = new Date(Date.now() - 48 * 60 * 60 * 1000);

// ✅ СТАЛО:
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
```

2. Обновить комментарии в коде
3. Обновить версию Edge Function (v11)

**Тестирование**:
```bash
# 1. Деплой
deploy_edge_function_supabase(function_name='motivations')

# 2. Тест через API
curl https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/motivations/cards/{userId}

# 3. Проверить что возвращаются только записи за 24h
# - Создать запись 25 часов назад
# - Проверить что она НЕ появляется в карточках

# 4. Проверить консоль браузера (Chrome MCP)
# - 0 errors
```

**Коммит**: `fix(cards): change time window from 48h to 24h`

---

#### Шаг 3.2: Обновить документацию (30 минут)
**Файлы**:
- `docs/new/cards-and-push-tech.md`
- `docs/architecture/MOTIVATION_CARDS_SYSTEM.md`
- `docs/implementation-status.md`

**Действия**:
1. Обновить строку 95 в `cards-and-push-tech.md`:
```markdown
- временное окно (по умолчанию 24 часа) ✅ РЕАЛИЗОВАНО
```

2. Обновить `implementation-status.md`:
```markdown
#### 1. Окно 24 часа вместо 48
**Статус**: ✅ ИСПРАВЛЕНО (2025-11-15)
```

**Коммит**: `docs: update cards documentation (24h window implemented)`

---

#### Шаг 3.3: Тестирование на production (30 минут)
**Действия**:
1. Деплой на Vercel (автоматически через git push)
2. Открыть https://unity-wine.vercel.app
3. Проверить консоль браузера (Chrome MCP)
4. Создать запись
5. Проверить что карточка появилась
6. Подождать 25 часов
7. Проверить что карточка исчезла

**Результат**: Пользователь может тестировать новую логику

---

## 📊 Отчет после каждого дня

### Шаблон отчета
```markdown
# Отчет за День X

## Выполнено
- [ ] Шаг X.1: Название
- [ ] Шаг X.2: Название
- [ ] Шаг X.3: Название

## Тестирование
- [ ] Консоль браузера: 0 errors
- [ ] Supabase Advisors: 0 issues
- [ ] Build: успешен
- [ ] Production: работает

## Проблемы
- Нет проблем / Описание проблемы

## Следующие шаги
- Шаг Y.1: Название
- Шаг Y.2: Название
```

---

**Статус**: 🟢 Ready to Execute  
**Последнее обновление**: 2025-11-15  
**Владелец**: AI Agent + Основатель проекта

