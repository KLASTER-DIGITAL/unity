
# UNITY — AI-настройки в кабинете Супер-админа

Файл: `ai-superadmin-settings.md`  
Версия: 1.0  
Дата: 2025-11-15  

Этот документ описывает, **как должна работать настройка AI в кабинете супер-админа UNITY**, чтобы:

- в одном месте управлять моделями, лимитами и бюджетом AI;
- централизованно хранить **промпты и сценарии** для AI-карточек, push-уведомлений, отчётов и AI-коуча;
- чтобы все функции на стороне пользователя (карточки, пуши, отчёты) читали настройки **из админки**, а не из кода.

Документ дополняет файлы:

- `cards-and-push-tech.md` — техническая реализация карточек и push;
- `cards-and-push-scenarios.md` — сценарная логика для пользователя;
- `ai-prompts-cards.md` — библиотека промптов для карточек и push.

---

## 1. Цель раздела AI в супер-админе

### 1.1. Главная идея

Создать в кабинете супер-админа **AI Control Center**, где в одном месте настраивается:

1. Бюджет и лимиты AI.  
2. Назначение моделей по операциям.  
3. Промпты и шаблоны для всех основных AI-сценариев.  
4. Базовые флаги (включено/выключено, тестовый режим, sandbox).

После этого:

- **Пользовательский интерфейс** (карточки, push, отчёты, AI Coach) всегда использует актуальные настройки из БД.  
- Любое изменение промпта/модели можно сделать **без redeploy проекта**, через админку.  
- Есть единая точка контроля качества и стоимости AI.

---

## 2. Структура вкладки «AI» в супер-админке

Предлагаемая структура вкладки **AI**:

1. **AI Settings / Бюджет и лимиты**  
   (уже реализовано: бюджет, usage, тестовый режим).

2. **Модели по операциям**  
   (уже реализовано: таблица с типами операций и моделями).

3. **AI-операции и промпты**  ✅ *новый блок*  
   Управление system/user-промптами и включением сценариев.

4. **Мониторинг качества** (позднее)  
   Статистика по вызовам, средняя стоимость, ошибки.

---

## 3. Модель данных для AI-операций

### 3.1. Таблица `ai_operations`

В Supabase создаём таблицу:

```sql
CREATE TABLE ai_operations (
  id TEXT PRIMARY KEY,              -- 'entry_analysis', 'card_from_entry', ...
  group_name TEXT NOT NULL,         -- 'cards', 'push', 'reports', 'coach'
  display_name TEXT NOT NULL,       -- человекочитаемое имя для UI
  description TEXT NOT NULL,        -- описание операции для супер-админа

  model TEXT NOT NULL,              -- 'gpt-4o-mini', 'gpt-4o', ...
  max_tokens INT NOT NULL,
  temperature REAL NOT NULL,

  system_prompt TEXT NOT NULL,
  user_prompt_template TEXT NOT NULL,

  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  extra_config JSONB DEFAULT '{}'::jsonb,  -- дополнительные настройки

  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID NULL
);
```

### 3.2. Первоначальный список операций

Минимальный набор (синхронизирован с другими файлами):

#### Группа `cards` (карточки)

- `entry_analysis` — анализ записи (summary + insight + sentiment + tags).  
- `card_from_entry` — генерация текста карточки по записи.  
- `progress_card` — карточка прогресса по статистике за период.

#### Группа `push` (уведомления)

- `push_text` — генерация текста push-уведомления по типу (`morning_reminder`, `new_insights`, и т.д.).

#### Группа `reports` (достижения и отчёты, позже)

- `weekly_report` — текстовая основа недельного отчёта/главы PDF.  
- `monthly_report` — текстовая основа месячной книги достижений.

#### Группа `coach`

- `ai_coach_dialog` — базовый system-prompt диалогового ассистента UNITY (AI Coach).

Все дефолтные `system_prompt` и `user_prompt_template` берём из файла `ai-prompts-cards.md` и будущих документов по отчётам/коучу.

---

## 4. Связь `ai_operations` с текущей таблицей «Назначение моделей»

Сейчас в UI уже есть таблица:

- Тип операции  
- Модель  
- Max токенов  
- Temperature  
- Стоимость (подсказка)

Рекомендуется:

1. Использовать `ai_operations` как **единственный источник правды** по моделям.
2. Таблицу в UI строить напрямую из `ai_operations`, группируя по `group_name`.
3. При изменении модели/лимитов в UI:
   - обновлять поля `model`, `max_tokens`, `temperature` в `ai_operations`.

Тогда:

- таблица «Назначение моделей» и блок «Промпты» работают с одной и той же сущностью;
- edge-функции получают все параметры операции (модель, лимиты, промпты) из одного места.

---

## 5. UI: блок «AI-операции и промпты»

### 5.1. Общий подход

Внизу вкладки **AI** (после таблицы моделей) добавить блок:

> **AI-операции и промпты**  
> Управление текстами и параметрами AI для ключевых сценариев UNITY.

Внутри — аккордеоны/табы по группам:

- «Карточки и дневник»
- «Push-уведомления»
- «Отчёты и книги»
- «AI Coach»

### 5.2. Секция «Карточки и дневник»

Секция состоит из трёх подпунктов (каждый = одна запись в `ai_operations`):

#### 5.2.1. Анализ записи (`entry_analysis`)

Поля:

- Модель (select).  
- Max tokens / Temperature.  
- `System prompt` — textarea.  
- `User prompt template` — textarea с плейсхолдерами (`{{user_language}}`, `{{entry_text}}`).  
- Чекбокс `Включено` (`is_enabled`).

Дополнительно:

- «Сбросить на дефолт» — подставляет дефолтный текст;
- «Тестировать»:
  - поле для текста записи;
  - select `Язык`;
  - показ JSON-ответа.

#### 5.2.2. Карточка из записи (`card_from_entry`)

Похожие поля, плюс:

- в тесте select типа карточки: `celebrate / reflect / focus / gratitude / progress / generic`;
- тестовые поля: `summary`, `insight`, `sentiment`, `mood`, `category`, `tags`.

Результат — превью карточки (title + body + optional_step).

#### 5.2.3. Карточка прогресса (`progress_card`)

Тестовый блок:

- `total_active_days`, `current_progress_streak_days`, `recent_categories`, `notable_shifts`;
- кнопка «Протестировать» — пример карточки прогресса.

---

### 5.3. Секция «Push-уведомления»

Внутри:

- один общий `System prompt` (из `ai-prompts-cards.md` для push);
- таблица типов push:

| Тип | ID | Описание | Активен |
|-----|----|----------|---------|
| Утреннее напоминание | `morning_reminder` | Мягкий старт дня | [✓] |
| Вечерняя рефлексия | `evening_reflection` | Подвести итог | [✓] |
| Новые инсайты | `new_insights` | Новые AI-карточки | [✓] |
| Возвращение после паузы | `come_back_gentle` | Мягкий возврат | [✓] |
| Поддержка в сложный период | `support_during_hard_times` | Деликатная поддержка | [✓] |

При клике по строке:

- сайдбар с описанием сценария;
- список параметров (progress_days, last_entry_days_ago и т.п.);
- кнопка «Тестировать» (пример текста push).

Типы push можно хранить в `extra_config` операции `push_text` или в отдельной таблице `ai_push_types`.

---

## 6. Как backend использует настройки супер-админа

### 6.1. Общий helper

```ts
async function getAiOperationConfig(operationId: string) {
  const { data, error } = await supabase
    .from('ai_operations')
    .select('*')
    .eq('id', operationId)
    .single();

  if (error || !data || !data.is_enabled) {
    return getDefaultConfig(operationId); // fallback
  }

  return data;
}
```

Edge-функции:

- берут `config = getAiOperationConfig('entry_analysis' | 'card_from_entry' | 'progress_card' | 'push_text')`;
- используют:
  - `config.model`,
  - `config.max_tokens`,
  - `config.temperature`,
  - `config.system_prompt`,
  - `config.user_prompt_template` с подстановкой плейсхолдеров.

### 6.2. Примеры

- Создание записи → `entry_analysis`.  
- Генерация карточек → `card_from_entry`.  
- Карточки прогресса → `progress_card`.  
- Push-уведомления → `push_text` + `push_type`.

---

## 7. Версионирование и откат

### 7.1. Таблица истории

```sql
CREATE TABLE ai_operations_history (
  id BIGSERIAL PRIMARY KEY,
  operation_id TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NULL
);
```

При сохранении настроек:

- писать старую версию операции в `ai_operations_history`.

### 7.2. Откат в UI

- Кнопка «История изменений» рядом с каждой операцией.  
- Список версий (дата, кто изменил).  
- Кнопка «Откатиться к этой версии» — копирует snapshot обратно в `ai_operations`.

---

## 8. Роли и доступы

- Разделом **AI** управляют роли `super_admin` / `owner`.  
- Логировать:
  - кто менял модели,
  - кто редактировал промпты,
  - когда.

---

## 9. Дальнейшие шаги

После внедрения этого слоя:

1. Описать и реализовать **раздел «Достижения и отчёты»**:
   - недельные / месячные отчёты;
   - структура PDF-книг;
   - привязка к операциям `weekly_report` и `monthly_report`.

2. Добавить в AI Control Center:
   - промпты для отчётов;
   - system-профиль для AI Coach.

