# 🎯 UNITY-v2 - Roadmap Tasks (AI Planner Guide)

**Дата**: 2025-11-15  
**Версия**: 1.0  
**Статус**: Активный план работ  
**Основа**: unity-ai-planner-guide.md

---

## 📊 Executive Summary

**Всего задач**: 24  
**Приоритеты**:
- **P0 (Критический)**: 3 задачи - AI Control Center, Push Infrastructure
- **P1 (Высокий)**: 11 задач - Карточки, Achievements, Push интеграция
- **P2 (Средний)**: 5 задач - Reports, PDF книги
- **Testing & Deploy**: 5 задач - Тестирование, деплой, документация

**Общее время**: ~40-50 часов (5-7 рабочих дней)

---

## 🔴 P0 - Надёжность и единый центр управления AI (КРИТИЧНО)

### P0-1: [DB] Таблица ai_operations
**UUID**: 33cTXcFFDjqDWocTst2my4
**Время**: 2 часа
**Зависимости**: Нет
**Статус**: NOT_STARTED

**Описание**: Создать таблицу `ai_operations` в Supabase для централизованного управления AI-операциями.

**Детали**:
1. Создать миграцию `supabase/migrations/YYYYMMDD_create_ai_operations.sql`
2. Создать таблицу `ai_operations`:
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

3. Создать таблицу `ai_operations_history` для версионирования:
```sql
CREATE TABLE ai_operations_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id UUID REFERENCES ai_operations(id),
  changed_fields JSONB NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

4. Seed данные для 6 операций (промпты из `docs/new/ai-prompts-cards.md`):
   - `entry_analysis` - анализ записи (строки 47-86 в ai-prompts-cards.md)
   - `card_from_entry` - карточка из записи (строки 89-175)
   - `progress_card` - карточка прогресса (строки 178-231)
   - `push_text` - текст push-уведомления (строки 234-295)
   - `weekly_report` - недельный отчет (TODO: добавить промпт)
   - `monthly_report` - месячный отчет (TODO: добавить промпт)

**Пример seed данных**:
```sql
INSERT INTO ai_operations (group_name, display_name, description, model, max_tokens, temperature, system_prompt, user_prompt_template) VALUES
('cards', 'entry_analysis', 'Анализ записи: summary + insight + метаданные', 'gpt-4o-mini', 500, 0.7,
  'Ты — внимательный наставник и аналитик дневника UNITY. Твоя задача — проанализировать личную запись пользователя и вернуть краткое резюме, инсайт и технические метаданные. Требования: Пиши на языке {{user_language}}. Говори уважительно, без сюсюканья и инфобизнес-штампов. Никакой банальной мотивации вроде "ты молодец, у тебя всё получится". Опирайся только на текст записи, не выдумывай факты. Формат ответа — строго JSON.',
  'Язык пользователя: {{user_language}}\n\nТекст записи (entry_text):\n\n"""\n{{entry_text}}\n"""\n\nПроанализируй запись и верни JSON следующей структуры:\n\n{\n  "summary": "краткое резюме записи (до 200 символов, без клише)",\n  "insight": "не банальный, осмысленный инсайт, 1–2 предложения. Покажи новый взгляд или важный акцент. Без общих фраз.",\n  "sentiment": "positive | neutral | negative",\n  "mood": "короткое описание настроения (например: спокойный, вдохновлённый, усталый, раздражённый)",\n  "category": "одна основная категория: например, ''семья'', ''здоровье'', ''работа'', ''деньги'', ''духовность'', ''отношения'', ''личное развитие''",\n  "tags": ["2–5 ключевых тега по смыслу записи"],\n  "is_achievement": true или false (является ли это запись про достижение/успех/маленькую победу)\n}'
);
```

**Документы**:
- `docs/new/ai-superadmin-settings.md` (схема таблицы)
- `docs/new/ai-prompts-cards.md` (промпты для seed данных)

---

### P0-2: [FE] AI Control Center - UI в админ-панели
**UUID**: cyypzaEoF214PFB3NjLjvm  
**Время**: 4 часа  
**Зависимости**: P0-1  
**Статус**: NOT_STARTED

**Описание**: Создать UI в админ-панели для управления AI-операциями.

**Детали**:
- Компонент `src/components/screens/admin/settings/AIOperationsTab.tsx`
- Секции: Карточки и дневник, Push-уведомления, Отчёты и книги, AI Coach
- Функции: редактирование промптов, настройка моделей, тестирование, версионирование
- Интеграция с таблицей `ai_operations`
- Таблица истории изменений `ai_operations_history`

**Документы**: `docs/new/ai-superadmin-settings.md`

---

### P0-3: [BE] Push Infrastructure - VAPID и Webhooks
**UUID**: foQFERQzMsyTzhPddCsHEC  
**Время**: 3 часа  
**Зависимости**: Нет  
**Статус**: NOT_STARTED

**Описание**: Проверить и настроить VAPID ключи, webhooks, cron jobs для push-системы.

**Детали**:
- Проверить VAPID ключи в `admin_settings` (vapid_public_key, vapid_private_key)
- Создать webhooks: `push_on_entry_insert`, `push_on_summary_insert`
- Настроить cron jobs: daily_reminder (21:00), weekly_motivation, goal_reminder
- Создать health-check endpoint `/functions/v1/push-health-check`
- Мониторинг статуса в админ-панели

**Документы**: `docs/new/cards-and-push-tech.md`, `docs/architecture/PUSH_SYSTEM.md`

---

## 🟡 P1 - Повседневная ценность для пользователя

### P1-1: [BE] Карточки - Окно 24 часа и лимит 1-3
**UUID**: aULXUrKTdT2rLktnyPnyNW
**Время**: 1 час
**Зависимости**: Нет
**Статус**: NOT_STARTED

**Описание**: Обновить Edge Function `motivations` для работы с окном 24 часа (вместо 48), лимит 1-3 карточки.

**Текущая реализация** (supabase/functions/motivations/index.ts, строка 249):
```typescript
// ❌ СЕЙЧАС: 48 часов
const yesterday = new Date(Date.now() - 48 * 60 * 60 * 1000);
```

**Целевая реализация** (согласно docs/new/cards-and-push-tech.md, строка 95):
```typescript
// ✅ ДОЛЖНО БЫТЬ: 24 часа
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
```

**Детали**:
1. Изменить строку 249 в `supabase/functions/motivations/index.ts`:
```typescript
// Step 2: Fetch recent entries (last 24 hours) ← обновить комментарий
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000); // ← изменить 48 на 24
```

2. Обновить версию Edge Function (v10 → v11):
```typescript
console.log('[MOTIVATIONS v11] Generating cards for user:', userId); // строка 235
```

3. Проверить лимит карточек (уже реализовано):
```typescript
const cards = unviewedEntries.slice(0, 3).map(entry => ({ // строка 283
  // max 3 карточки
}));
```

4. Обновить документацию:
   - `docs/new/cards-and-push-tech.md` строка 95: добавить ✅ РЕАЛИЗОВАНО
   - `docs/implementation-status.md`: обновить статус "Окно 24 часа" → ✅ ИСПРАВЛЕНО

**Тестирование**:
```bash
# 1. Деплой Edge Function
deploy_edge_function_supabase(function_name='motivations')

# 2. Создать запись 25 часов назад
INSERT INTO entries (user_id, text, created_at) VALUES
  ('...', 'Test entry', NOW() - INTERVAL '25 hours');

# 3. Вызвать API
curl https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/motivations/cards/{userId}

# 4. Проверить что запись НЕ появилась в карточках
# (должны быть только записи за последние 24 часа)

# 5. Проверить консоль браузера (Chrome MCP)
# - 0 errors, 0 warnings
```

**Документы**:
- `docs/new/cards-and-push-tech.md` (спецификация окна 24 часа)
- `supabase/functions/motivations/index.ts` (текущая реализация)

---

### P1-2: [BE] Карточки - Типы карточек
**UUID**: oTbAxUvDnKAgVrxttzJvxx  
**Время**: 3 часа  
**Зависимости**: P1-1  
**Статус**: NOT_STARTED

**Описание**: Реализовать типы карточек: celebrate, reflect, focus, gratitude, progress.

**Детали**:
- Обновить `detectCardType()` в `motivations/index.ts`
- Логика: is_achievement → celebrate, sentiment=negative → reflect, category=goals → focus
- Обновить `buildCardTitle()` и `buildCardDescription()`
- Добавить градиенты по типам карточек

**Документы**: `docs/new/cards-and-push-tech.md`, `docs/new/cards-and-push-scenarios.md`

---

### P1-3: [BE] Карточки - AI промпты из ai_operations
**UUID**: wyxQM4F5cqrHvMoujxUsKe  
**Время**: 3 часа  
**Зависимости**: P0-1, P1-2  
**Статус**: NOT_STARTED

**Описание**: Переключить генерацию карточек на использование промптов из `ai_operations`.

**Детали**:
- Создать helper `getAiOperationConfig(operationId)` в `motivations/index.ts`
- Использовать промпты из `ai_operations` для `card_from_entry`, `progress_card`
- Убрать хардкод промптов из кода
- Интеграция с AI Control Center

**Документы**: `docs/new/ai-superadmin-settings.md`, `docs/new/ai-prompts-cards.md`

---

### P1-4: [DB] Achievements - Таблицы achievements_catalog и user_achievements
**UUID**: nSpV2G6d27UHV8CnYt67xk  
**Время**: 2 часа  
**Зависимости**: Нет  
**Статус**: NOT_STARTED

**Описание**: Создать таблицы `achievements_catalog` и `user_achievements` в Supabase.

**Детали**:
- Миграция `supabase/migrations/YYYYMMDD_create_achievements_tables.sql`
- Таблица `achievements_catalog`: id, name, description, icon, rarity, condition (JSONB), is_enabled
- Таблица `user_achievements`: id, user_id, achievement_id, earned_at, progress
- Seed данные: базовый каталог достижений (10 записей, 50 записей, 7 дней подряд, etc.)

**Документы**: `docs/new/achievements-review-and-plan.md`

---

### P1-5: [BE] Achievements - Персистентность и прогресс
**UUID**: cQb4BR3oBJBuNnEso7vs5T
**Время**: 4 часа
**Зависимости**: P1-4
**Статус**: NOT_STARTED

**Описание**: Обновить `calculateAchievements()` для работы с БД.

**Детали**:
- Обновить `src/shared/lib/statsCalculator.ts`
- Создание/обновление записей в `user_achievements` при выполнении условий
- Отслеживание прогресса (progress field)
- Timestamps `earned_at` для истории
- Возврат UI-модели с полями `earned`, `progress`, `earnedDate` из БД

**Документы**: `docs/new/achievements-review-and-plan.md`

---

### P1-6: [BE] Achievements - Интеграция с is_achievement
**UUID**: 6fhZZrcJzi2GCy9awV9CCk
**Время**: 2 часа
**Зависимости**: P1-5
**Статус**: NOT_STARTED

**Описание**: Связать флаг `is_achievement` из `entries` с начислением достижений.

**Детали**:
- AI-анализ записи (`entry_analysis`) выставляет `is_achievement = true`
- Добавить достижения на основе `sentiment`, `category`, `tags`
- Примеры: "Честно написал про сложный день" (sentiment=negative), "10 записей о семье" (category=Семья)
- Обновить каталог достижений в seed данных

**Документы**: `docs/new/achievements-review-and-plan.md`

---

### P1-7: [FE] Achievements - UI обновление
**UUID**: ssXJyms1emUM4kuttvqEu2
**Время**: 4 часа
**Зависимости**: P1-6
**Статус**: NOT_STARTED

**Описание**: Обновить `AchievementsScreen` согласно `achievements-review-and-plan.md`.

**Детали**:
- Лента достижений (новые достижения за период)
- Прогресс/серия (UI термин "Прогресс" вместо "Streak")
- Базовый дашборд (уровень, XP, прогресс к следующему уровню)
- Интеграция с `user_achievements` из БД
- PWA и React Native версии

**Документы**: `docs/new/achievements-review-and-plan.md`

---

### P1-8: [BE] Push - Новый тип 'new_insights'
**UUID**: erAYwPSRe6SqFYuzk47wta
**Время**: 2 часа
**Зависимости**: P0-3, P1-3
**Статус**: NOT_STARTED

**Описание**: Добавить push-уведомление 'new_insights' при появлении новых AI-карточек.

**Детали**:
- Триггер на `entry_summaries INSERT` в `push-realtime-trigger/index.ts`
- Проверка окна 24 часа
- Проверка `notification_settings` пользователя
- Проверка дубликатов (не отправлять если уже отправлено за N часов)
- Текст: "🎯 У вас новые AI-инсайты на сегодня"

**Документы**: `docs/new/cards-and-push-tech.md`

---

### P1-9: [BE] Push - Интеграция с Achievements
**UUID**: 5K9V6YYrjbrt898ZWx6oTz
**Время**: 2 часа
**Зависимости**: P1-6, P1-8
**Статус**: NOT_STARTED

**Описание**: Добавить push-типы для достижений.

**Детали**:
- `achievement_unlocked`: триггер на `user_achievements INSERT`
- `achievement_near`: триггер при прогрессе 70-90%
- Обновить `push-realtime-trigger/index.ts`
- Тексты генерируются через `push_text` из `ai_operations`

**Документы**: `docs/new/achievements-review-and-plan.md`

---

### P1-10: [FE] Карточки - Шаблонные карточки
**UUID**: NEW
**Время**: 2 часа
**Зависимости**: P1-2
**Статус**: NOT_STARTED

**Описание**: Расширить пул шаблонных карточек и добавить рандомизацию.

**Детали**:
- Обновить `motivationsTemplates.ts` с 20+ шаблонами на каждый язык
- Типы: celebrate, reflect, focus, gratitude, generic
- Рандомизация порядка (shuffleArray)
- Не логировать шаблонные карточки в `motivation_cards`

**Документы**: `docs/new/cards-and-push-tech.md`

---

### P1-11: [FE] Карточки - iOS ограничения и инструкции
**UUID**: NEW
**Время**: 1 час
**Зависимости**: P0-3
**Статус**: NOT_STARTED

**Описание**: Добавить UI инструкции для iOS PWA push.

**Детали**:
- Обновить `platformDetection.ts` для статуса `ios_requires_pwa`
- UI инструкция: как добавить на домашний экран, как включить уведомления
- Показывать только для iOS Safari (не PWA режим)

**Документы**: `docs/new/cards-and-push-tech.md`

---

## 🟢 P2 - Макро-аналитика и отчёты

### P2-1: [DB] Reports - Таблицы user_stats_daily и user_stats_monthly
**UUID**: nH5B7BMT5rF6dVBbRcnf8p
**Время**: 3 часа
**Зависимости**: Нет
**Статус**: NOT_STARTED

**Описание**: Создать таблицы для server-side статистики.

**Детали**:
- Миграция `supabase/migrations/YYYYMMDD_create_user_stats_tables.sql`
- Таблица `user_stats_daily`: user_id, date, entries_count, achievements_count, positive_count, neutral_count, negative_count, top_category
- Таблица `user_stats_monthly`: user_id, year, month, entries_count, achievements_count, avg_mood, top_categories (JSONB)
- Cron job или Edge Function для расчета (ежедневно/ежемесячно)

**Документы**: `docs/new/reports-review-and-plan.md`

---

### P2-2: [DB] Reports - Таблица user_reports
**UUID**: 88aeLjqFXxW2ij7rhAt9uD
**Время**: 2 часа
**Зависимости**: P2-1
**Статус**: NOT_STARTED

**Описание**: Создать таблицу для кэширования AI-отчетов.

**Детали**:
- Миграция `supabase/migrations/YYYYMMDD_create_user_reports.sql`
- Таблица `user_reports`: id, user_id, period_type (weekly/monthly), period_key, language, is_premium, stats (JSONB), ai_summary, ai_insights (JSONB), pdf_url, created_at, updated_at
- UNIQUE constraint на (user_id, period_type, period_key)

**Документы**: `docs/new/reports-review-and-plan.md`

---

### P2-3: [BE] Reports - AI операции weekly_report и monthly_report
**UUID**: 9qNRBYdTzEQrwGEMQWGSta
**Время**: 4 часа
**Зависимости**: P0-1, P2-2
**Статус**: NOT_STARTED

**Описание**: Настроить AI-операции для генерации отчетов.

**Детали**:
- Добавить операции `weekly_report` и `monthly_report` в seed данных `ai_operations`
- Создать Edge Function `supabase/functions/reports-generator/index.ts`
- Endpoints: `GET /reports?period=week|month`, `POST /reports/generate`
- Интеграция с `user_stats_daily`, `user_stats_monthly`, `user_achievements`
- Сохранение в `user_reports`

**Документы**: `docs/new/reports-review-and-plan.md`

---

### P2-4: [FE] Reports - UI обновление
**UUID**: iHMJECySZS6dahvfyWkWyF
**Время**: 5 часов
**Зависимости**: P2-3, P1-7
**Статус**: NOT_STARTED

**Описание**: Обновить `ReportsScreen` согласно `reports-review-and-plan.md`.

**Детали**:
- Вкладки: Overview, Insights (Premium), Books (Premium)
- Недельные/месячные отчеты
- Интеграция с достижениями (новые достижения за период)
- AI-инсайты для Premium
- Horizontal date picker (как в референсах)
- Кнопки: Сгенерировать отчет, Скачать PDF

**Документы**: `docs/new/reports-review-and-plan.md`

---

### P2-5: [BE] Reports - PDF и книги
**UUID**: casBoAvhkbc5AVYo5muZ6d
**Время**: 6 часов
**Зависимости**: P2-4
**Статус**: NOT_STARTED

**Описание**: Объединить PDFReportData и структуры из `ai-pdf-books.md`.

**Детали**:
- Обновить `books_archive` таблицу для совместимости с отчетами
- Реализовать экспорт месячного отчета в PDF
- Сборка годовой книги из 12 MonthlyReport + Achievements
- Edge Function `pdf-generator/index.ts`
- Интеграция с существующим PDF пайплайном

**Документы**: `docs/new/ai-pdf-books.md`, `docs/new/reports-review-and-plan.md`

---

## 🧪 Testing & Quality Assurance

### TEST-1: [QA] Консоль браузера
**UUID**: nxEsBQLrzootaUc2wDgFD4
**Время**: 1 час (после каждого изменения)
**Зависимости**: Все задачи
**Статус**: NOT_STARTED

**Описание**: Проверить консоль браузера на наличие ошибок.

**Детали**:
- Использовать Chrome MCP для проверки
- 0 errors, 0 warnings - обязательное условие
- Проверять после каждого изменения кода
- Документировать найденные ошибки

**Документы**: `.augment/rules/CONSOLE_CHECK_RULE.md`

---

### TEST-2: [QA] Supabase Advisors
**UUID**: ehCEVF7himBk4Hyv8D4XY5
**Время**: 30 минут (перед каждым коммитом)
**Зависимости**: Все DB задачи
**Статус**: NOT_STARTED

**Описание**: Запустить Supabase Advisors (security + performance).

**Детали**:
- Использовать Supabase MCP: `get_advisors_supabase(project_id, type='security')`
- Использовать Supabase MCP: `get_advisors_supabase(project_id, type='performance')`
- Исправить все найденные проблемы НЕМЕДЛЕННО
- НИКОГДА не продолжать при ошибках Advisors

**Документы**: `.augment/rules/unity.md`

---

### TEST-3: [QA] E2E тесты
**UUID**: 2KP1XzgEU5dTCQzD5dj4XR
**Время**: 2 часа
**Зависимости**: Все FE задачи
**Статус**: NOT_STARTED

**Описание**: Запустить E2E тесты для критических флоу.

**Детали**:
- Создание записи
- Просмотр карточек (свайп, отметка как прочитанное)
- Достижения (просмотр, прогресс)
- Отчеты (генерация, просмотр)
- Все тесты должны пройти (100% success rate)

**Документы**: `docs/testing/E2E_TESTING_PLAN.md`

---

## 📝 Documentation & Deployment

### DOC-1: [DOC] Инвентаризация документации
**UUID**: kLa4jc1uyiZp7P7S1sSBak
**Время**: 3 часа
**Зависимости**: Нет
**Статус**: NOT_STARTED

**Описание**: Провести полный анализ документации и кодовой базы.

**Детали**:
- Создать `docs/docs-index.md` (таблица всех документов)
- Создать `docs/implementation-status.md` (статус реализации по модулям)
- Группировка по модулям: cards, push, achievements, reports, ai-admin, pdf-books, offline, widgets
- Типы: concept, tech, review-and-plan, prd, old-spec
- Статус: active, archive

**Документы**: `docs/new/unity-ai-planner-guide.md`

---

### DOC-2: [DOC] Архивация устаревшей документации
**UUID**: 7Emxd4qNDmR9Ffrrckzzwh
**Время**: 2 часа
**Зависимости**: DOC-1
**Статус**: NOT_STARTED

**Описание**: Переместить устаревшие документы в `docs/archive`.

**Детали**:
- Критерии устаревания: есть более новый документ, противоречит `*-review-and-plan.md`, не отражен в коде
- Добавить пометки `⚠️ ARCHIVED: документ устарел, см. актуальную версию в <имя нового файла>`
- Обновить `docs-index.md` (status = archive)
- Оставить только актуальные документы (1-2 на модуль)

**Документы**: `docs/new/unity-ai-planner-guide.md`

---

### DEPLOY-1: [DEPLOY] Деплой и проверка production
**UUID**: cWxtZ7fHqE7tv12Boj8RYk
**Время**: 1 час
**Зависимости**: Все задачи, TEST-1, TEST-2, TEST-3
**Статус**: NOT_STARTED

**Описание**: Задеплоить изменения на Vercel и проверить production.

**Детали**:
- `git push origin main` (автоматический деплой на Vercel)
- Проверить https://unity-wine.vercel.app
- Проверить консоль браузера (0 errors)
- Проверить Sentry на ошибки
- Проверить работу всех новых функций
- Smoke testing: создание записи, карточки, достижения, отчеты

**Документы**: `docs/guides/DEPLOYMENT.md`

---

## 📊 Зависимости и порядок выполнения

### Критический путь (P0 → P1 → P2):

```
P0-1 (ai_operations) → P0-2 (AI Control Center UI)
                     ↓
P0-3 (Push Infrastructure)
                     ↓
P1-1 (Карточки 24h) → P1-2 (Типы карточек) → P1-3 (AI промпты)
                                             ↓
P1-4 (Achievements DB) → P1-5 (Персистентность) → P1-6 (is_achievement) → P1-7 (UI)
                                                                          ↓
P1-8 (Push new_insights) → P1-9 (Push Achievements)
                          ↓
P2-1 (Stats DB) → P2-2 (Reports DB) → P2-3 (AI Reports) → P2-4 (Reports UI) → P2-5 (PDF)
```

### Параллельные треки:

**Track 1 (AI & Cards)**: P0-1 → P0-2 → P1-1 → P1-2 → P1-3
**Track 2 (Push)**: P0-3 → P1-8 → P1-9
**Track 3 (Achievements)**: P1-4 → P1-5 → P1-6 → P1-7
**Track 4 (Reports)**: P2-1 → P2-2 → P2-3 → P2-4 → P2-5
**Track 5 (Testing)**: TEST-1, TEST-2, TEST-3 (после каждого трека)
**Track 6 (Docs)**: DOC-1 → DOC-2 (параллельно с Track 1-4)

---

## 🎯 Рекомендуемый порядок выполнения

### Неделя 1 (P0 + P1 Cards):
1. DOC-1: Инвентаризация (3h)
2. P0-1: ai_operations таблица (2h)
3. P0-2: AI Control Center UI (4h)
4. P0-3: Push Infrastructure (3h)
5. P1-1: Карточки 24h (2h)
6. P1-2: Типы карточек (3h)
7. P1-3: AI промпты (3h)
8. TEST-1, TEST-2 (1.5h)

**Итого**: ~21.5 часов (3 дня)

### Неделя 2 (P1 Achievements + Push):
1. P1-4: Achievements DB (2h)
2. P1-5: Персистентность (4h)
3. P1-6: is_achievement (2h)
4. P1-7: Achievements UI (4h)
5. P1-8: Push new_insights (2h)
6. P1-9: Push Achievements (2h)
7. P1-10: Шаблонные карточки (2h)
8. P1-11: iOS инструкции (1h)
9. TEST-1, TEST-2, TEST-3 (3.5h)

**Итого**: ~22.5 часов (3 дня)

### Неделя 3 (P2 Reports + Deploy):
1. P2-1: Stats DB (3h)
2. P2-2: Reports DB (2h)
3. P2-3: AI Reports (4h)
4. P2-4: Reports UI (5h)
5. P2-5: PDF и книги (6h)
6. DOC-2: Архивация (2h)
7. TEST-1, TEST-2, TEST-3 (3.5h)
8. DEPLOY-1: Production (1h)

**Итого**: ~26.5 часов (3.5 дня)

---

## 📚 Связанные документы

### Основные гайды:
- `docs/new/unity-ai-planner-guide.md` - главный гайд для AI-агента
- `docs/new/cards-and-push-tech.md` - техническая реализация карточек и push
- `docs/new/achievements-review-and-plan.md` - план развития достижений
- `docs/new/reports-review-and-plan.md` - план развития отчетов
- `docs/new/ai-superadmin-settings.md` - AI Control Center

### Дополнительные:
- `docs/new/cards-and-push-scenarios.md` - сценарии карточек и push
- `docs/new/ai-prompts-cards.md` - библиотека промптов
- `docs/new/achievements-and-reports.md` - общая концепция
- `docs/new/ai-pdf-books.md` - PDF книги достижений

### Архитектура:
- `docs/architecture/PUSH_SYSTEM.md` - архитектура push-системы
- `docs/architecture/MOTIVATION_CARDS_SYSTEM.md` - архитектура карточек
- `.augment/rules/unity.md` - правила разработки UNITY-v2

---

**🎯 Результат**: Полностью реализованная система AI-карточек, достижений и отчетов с централизованным управлением через AI Control Center, готовая к масштабированию на 100K пользователей.

**Статус**: 🟢 Ready to Execute
**Последнее обновление**: 2025-11-15
**Владелец**: AI Agent + Основатель проекта

