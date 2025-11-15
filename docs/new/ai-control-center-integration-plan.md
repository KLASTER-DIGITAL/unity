# AI Control Center - Integration Plan

**Дата**: 2025-11-15  
**Статус**: 📋 ПЛАНИРОВАНИЕ  
**Приоритет**: P1 (High)

---

## 🎯 Цель

Интегрировать AI Control Center с существующими Edge Functions, чтобы они использовали промпты и конфигурацию из БД вместо хардкода.

---

## 📋 Edge Functions для обновления

### 1. `ai-analysis` Edge Function

**Файл**: `supabase/functions/ai-analysis/index.ts`

**Текущая реализация**:
```typescript
// Хардкод промптов
const systemPrompt = "Ты — AI-коуч в приложении UNITY...";
const userPrompt = `Язык пользователя: ${user_language}...`;
```

**Новая реализация**:
```typescript
import { getAiOperationConfig } from '../_shared/ai/getAiOperationConfig.ts';

// Загрузка конфигурации из БД
const config = await getAiOperationConfig(supabaseClient, 'entry_analysis');

if (!config || !config.is_enabled) {
  return new Response(
    JSON.stringify({ error: 'AI operation disabled or not found' }),
    { status: 503 }
  );
}

// Замена плейсхолдеров
const userPrompt = config.user_prompt_template
  .replace('{{user_language}}', user_language)
  .replace('{{entry_text}}', entry_text);

// Вызов OpenAI с конфигурацией из БД
const response = await openai.chat.completions.create({
  model: config.model,
  max_tokens: config.max_tokens,
  temperature: config.temperature,
  messages: [
    { role: 'system', content: config.system_prompt },
    { role: 'user', content: userPrompt }
  ]
});
```

**Изменения**:
- ✅ Импорт `getAiOperationConfig`
- ✅ Загрузка конфигурации из БД
- ✅ Проверка `is_enabled`
- ✅ Замена плейсхолдеров
- ✅ Использование `config.model`, `config.max_tokens`, `config.temperature`

---

### 2. `motivations` Edge Function

**Файл**: `supabase/functions/motivations/index.ts`

**Операции**:
- `card_from_entry` - генерация карточки из записи
- `progress_card` - карточка прогресса

**Текущая реализация**:
```typescript
// Хардкод промптов для разных типов карточек
const systemPrompt = card_type === 'progress' 
  ? "Ты — AI-коуч для карточки прогресса..."
  : "Ты — AI-коуч для мотивационной карточки...";
```

**Новая реализация**:
```typescript
import { getAiOperationConfig } from '../_shared/ai/getAiOperationConfig.ts';

// Определение operation_id по card_type
const operationId = card_type === 'progress' 
  ? 'progress_card' 
  : 'card_from_entry';

// Загрузка конфигурации из БД
const config = await getAiOperationConfig(supabaseClient, operationId);

if (!config || !config.is_enabled) {
  return new Response(
    JSON.stringify({ error: 'AI operation disabled or not found' }),
    { status: 503 }
  );
}

// Замена плейсхолдеров
const userPrompt = config.user_prompt_template
  .replace('{{user_language}}', user_language)
  .replace('{{entry_text}}', entry_text)
  .replace('{{card_type}}', card_type);
```

**Изменения**:
- ✅ Импорт `getAiOperationConfig`
- ✅ Маппинг `card_type` → `operation_id`
- ✅ Загрузка конфигурации из БД
- ✅ Проверка `is_enabled`
- ✅ Замена плейсхолдеров

---

### 3. `push-notifications` Edge Function (будущее)

**Файл**: `supabase/functions/push-notifications/index.ts`

**Операция**: `push_text` - генерация текста push-уведомления

**Новая реализация**:
```typescript
import { getAiOperationConfig } from '../_shared/ai/getAiOperationConfig.ts';

const config = await getAiOperationConfig(supabaseClient, 'push_text');

if (!config || !config.is_enabled) {
  // Fallback на дефолтный текст
  return { title: 'UNITY', body: 'У вас новая карточка!' };
}

const userPrompt = config.user_prompt_template
  .replace('{{user_language}}', user_language)
  .replace('{{card_title}}', card_title)
  .replace('{{card_text}}', card_text);
```

---

### 4. `weekly-report` Edge Function (будущее)

**Файл**: `supabase/functions/weekly-report/index.ts`

**Операция**: `weekly_report` - генерация недельного отчета

**Новая реализация**:
```typescript
import { getAiOperationConfig } from '../_shared/ai/getAiOperationConfig.ts';

const config = await getAiOperationConfig(supabaseClient, 'weekly_report');

if (!config || !config.is_enabled) {
  return new Response(
    JSON.stringify({ error: 'Weekly report disabled' }),
    { status: 503 }
  );
}

const userPrompt = config.user_prompt_template
  .replace('{{user_language}}', user_language)
  .replace('{{entries_summary}}', entries_summary)
  .replace('{{week_number}}', week_number);
```

---

## 🔧 Shared Helper Function

**Файл**: `supabase/functions/_shared/ai/getAiOperationConfig.ts`

**Уже существует**: ✅ Да

**Функции**:
```typescript
export async function getAiOperationConfig(
  supabase: SupabaseClient,
  operationId: string
): Promise<AIOperationConfig | null>

export async function replacePlaceholders(
  template: string,
  variables: Record<string, string>
): Promise<string>
```

**Использование**:
```typescript
// 1. Загрузка конфигурации
const config = await getAiOperationConfig(supabaseClient, 'entry_analysis');

// 2. Замена плейсхолдеров
const userPrompt = await replacePlaceholders(
  config.user_prompt_template,
  {
    user_language: 'ru',
    entry_text: 'Сегодня был хороший день...',
  }
);
```

---

## 📝 Чеклист интеграции

### Для каждого Edge Function:

1. **Импорт helper функции**
   ```typescript
   import { getAiOperationConfig } from '../_shared/ai/getAiOperationConfig.ts';
   ```

2. **Загрузка конфигурации**
   ```typescript
   const config = await getAiOperationConfig(supabaseClient, 'operation_id');
   ```

3. **Проверка is_enabled**
   ```typescript
   if (!config || !config.is_enabled) {
     return new Response(JSON.stringify({ error: 'Operation disabled' }), { status: 503 });
   }
   ```

4. **Замена плейсхолдеров**
   ```typescript
   const userPrompt = config.user_prompt_template
     .replace('{{variable}}', value);
   ```

5. **Использование конфигурации**
   ```typescript
   const response = await openai.chat.completions.create({
     model: config.model,
     max_tokens: config.max_tokens,
     temperature: config.temperature,
     messages: [
       { role: 'system', content: config.system_prompt },
       { role: 'user', content: userPrompt }
     ]
   });
   ```

6. **Тестирование**
   - Изменить промпт в админ-панели
   - Вызвать Edge Function
   - Проверить что новый промпт используется

---

## 🧪 Тестирование

### 1. Unit тесты (будущее)
- Тест загрузки конфигурации
- Тест замены плейсхолдеров
- Тест fallback при disabled операции

### 2. Integration тесты
- Изменить промпт в админ-панели
- Вызвать Edge Function через API
- Проверить что ответ соответствует новому промпту

### 3. E2E тесты
- Создать запись в PWA
- Проверить что AI анализ использует промпт из БД
- Изменить промпт в админ-панели
- Создать новую запись
- Проверить что AI анализ использует НОВЫЙ промпт

---

## ⏱️ Оценка времени

- `ai-analysis` Edge Function: 30 минут
- `motivations` Edge Function: 45 минут (2 операции)
- Тестирование: 1 час
- **Итого**: ~2.5 часа

---

## 🚀 Следующие шаги

1. ✅ Завершить тестирование UI (пользователь делает сам)
2. ⏳ Обновить `ai-analysis` Edge Function
3. ⏳ Обновить `motivations` Edge Function
4. ⏳ Тестировать интеграцию
5. ⏳ Деплой на production
6. ⏳ Мониторинг и отладка

