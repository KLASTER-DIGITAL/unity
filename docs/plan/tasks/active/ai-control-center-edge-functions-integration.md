# AI Control Center - Edge Functions Integration

**Дата создания**: 2025-11-15  
**Статус**: 🟡 Planned  
**Приоритет**: P0 (Critical)  
**Оценка времени**: ~2.5 часа  
**Зависимости**: AI Control Center UI (✅ DONE)

---

## 🎯 Цель

Интегрировать AI Control Center с Edge Functions чтобы они использовали промпты и модели из БД вместо хардкода.

---

## 📋 Задачи

### 1. Обновить `ai-analysis` Edge Function (30 минут)

**Файл**: `supabase/functions/ai-analysis/index.ts`

**Изменения**:
```typescript
import { getAiOperationConfig } from '../_shared/ai/getAiOperationConfig.ts';

// Load configuration from database
const config = await getAiOperationConfig(supabaseClient, 'entry_analysis');

if (!config || !config.is_enabled) {
  return new Response(
    JSON.stringify({ error: 'AI operation disabled or not found' }),
    { status: 503 }
  );
}

// Replace placeholders
const userPrompt = config.user_prompt_template
  .replace('{{user_language}}', user_language)
  .replace('{{entry_text}}', entry_text);

// Use config from database
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

**Тестирование**:
- [ ] Создать тестовую запись через PWA
- [ ] Проверить что AI анализ работает
- [ ] Проверить что используется промпт из БД
- [ ] Изменить промпт в админ-панели
- [ ] Проверить что новый промпт применился

---

### 2. Обновить `motivations` Edge Function (45 минут)

**Файл**: `supabase/functions/motivations/index.ts`

**Изменения**:
```typescript
import { getAiOperationConfig } from '../_shared/ai/getAiOperationConfig.ts';

// Load configurations for all card types
const cardFromEntryConfig = await getAiOperationConfig(supabaseClient, 'card_from_entry');
const progressCardConfig = await getAiOperationConfig(supabaseClient, 'progress_card');

// Check if operations are enabled
if (!cardFromEntryConfig?.is_enabled || !progressCardConfig?.is_enabled) {
  return new Response(
    JSON.stringify({ error: 'AI operations disabled' }),
    { status: 503 }
  );
}

// Use appropriate config based on card type
const config = cardType === 'progress' ? progressCardConfig : cardFromEntryConfig;

// Replace placeholders
const userPrompt = config.user_prompt_template
  .replace('{{user_language}}', user_language)
  .replace('{{entry_text}}', entry_text)
  .replace('{{card_type}}', cardType);

// Use config from database
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

**Тестирование**:
- [ ] Создать тестовую запись через PWA
- [ ] Проверить что карточки генерируются
- [ ] Проверить что используется промпт из БД
- [ ] Изменить промпт в админ-панели
- [ ] Проверить что новый промпт применился
- [ ] Проверить оба типа карточек (card_from_entry, progress_card)

---

### 3. Создать `_shared/ai/getAiOperationConfig.ts` для Edge Functions (15 минут)

**Файл**: `supabase/functions/_shared/ai/getAiOperationConfig.ts`

**Содержимое**:
```typescript
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface AIOperationConfig {
  id: string;
  group_name: string;
  display_name: string;
  description: string;
  model: string;
  max_tokens: number;
  temperature: number;
  system_prompt: string;
  user_prompt_template: string;
  is_enabled: boolean;
  extra_config: Record<string, unknown>;
}

export async function getAiOperationConfig(
  supabase: SupabaseClient,
  operationId: string
): Promise<AIOperationConfig | null> {
  const { data, error } = await supabase
    .from('ai_operations')
    .select('*')
    .eq('id', operationId)
    .single();

  if (error || !data) {
    console.error(`Failed to load AI operation config: ${operationId}`, error);
    return null;
  }

  return data as AIOperationConfig;
}
```

---

### 4. Деплой Edge Functions (15 минут)

**Команды**:
```bash
# Deploy ai-analysis
supabase functions deploy ai-analysis

# Deploy motivations
supabase functions deploy motivations
```

**Проверка**:
- [ ] Edge Functions задеплоены успешно
- [ ] Нет ошибок в логах
- [ ] Функции доступны через API

---

### 5. Интеграционное тестирование (1 час)

**Сценарий 1: Entry Analysis**
1. Войти как user (rustam@leadshunter.biz)
2. Создать новую запись
3. Проверить что AI анализ работает
4. Войти как super_admin
5. Изменить промпт для entry_analysis
6. Создать новую запись как user
7. Проверить что новый промпт применился

**Сценарий 2: Motivation Cards**
1. Войти как user
2. Создать запись с достижением
3. Проверить что карточка сгенерировалась
4. Войти как super_admin
5. Изменить промпт для card_from_entry
6. Создать новую запись как user
7. Проверить что новый промпт применился

**Сценарий 3: Disable Operation**
1. Войти как super_admin
2. Выключить entry_analysis (is_enabled = false)
3. Войти как user
4. Создать новую запись
5. Проверить что AI анализ НЕ работает (503 error)
6. Войти как super_admin
7. Включить entry_analysis обратно
8. Проверить что AI анализ работает

---

## ✅ Критерии завершения

- [ ] `ai-analysis` Edge Function использует `getAiOperationConfig()`
- [ ] `motivations` Edge Function использует `getAiOperationConfig()`
- [ ] `_shared/ai/getAiOperationConfig.ts` создан для Edge Functions
- [ ] Edge Functions задеплоены на production
- [ ] Все 3 сценария тестирования пройдены успешно
- [ ] Нет ошибок в Supabase Edge Function logs
- [ ] Нет ошибок в консоли браузера
- [ ] Документация обновлена

---

## 📚 Документация

После завершения обновить:
- [ ] `docs/new/ai-control-center-integration-plan.md` - отметить как DONE
- [ ] `CHANGELOG.md` - добавить секцию об интеграции
- [ ] `docs/FIX.md` - добавить технические изменения
- [ ] `docs/architecture/AI_OPERATIONS_SYSTEM.md` - создать новый документ

---

## 🎯 Следующие шаги после завершения

1. **Функционал тестирования AI операций** (~3 часа)
   - Modal для тестирования
   - Поля для ввода тестовых данных
   - Вызов Edge Function
   - Показ JSON ответа и token usage

2. **Cleanup legacy кода** (~1 час)
   - Удалить Model Assignment Card
   - Удалить `modelConfigs` state
   - Удалить `OPERATION_TYPES` константу

3. **Добавить операции для других групп** (~2 часа)
   - push_text - текст push-уведомления
   - weekly_report - недельный отчет
   - monthly_report - месячный отчет
   - ai_coach - AI коуч (будущее)

