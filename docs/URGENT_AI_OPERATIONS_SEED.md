# 🚨 URGENT: AI Operations Seed Data

**Дата**: 2025-11-15  
**Статус**: ❌ КРИТИЧНО - AI Control Center НЕ работает!  
**Проблема**: Таблица `ai_operations` пустая в production БД

---

## ❌ Проблема

1. Таблица `ai_operations` создана, но **ПУСТАЯ**
2. AI Control Center UI показывает пустые данные
3. Edge Functions `ai-analysis` и `push-ai-personalize` **НЕ работают** (503 error)
4. Пользователи **НЕ могут** использовать AI анализ записей

---

## ✅ Решение: Применить seed данные через Supabase SQL Editor

### Шаг 1: Открыть SQL Editor

1. Открыть Supabase Dashboard: https://supabase.com/dashboard/project/ecuwuzqlwdkkdncampnc
2. Перейти в **SQL Editor**
3. Создать новый query

### Шаг 2: Выполнить SQL

Скопировать и выполнить содержимое файла:
```
supabase/migrations/20251115000003_seed_ai_operations.sql
```

**Или** выполнить этот SQL напрямую:

```sql
-- 1. entry_analysis
INSERT INTO ai_operations (
  id, group_name, display_name, description,
  model, max_tokens, temperature,
  system_prompt, user_prompt_template,
  is_enabled, extra_config
) VALUES (
  'entry_analysis',
  'cards',
  'Анализ записи',
  'Анализ записи пользователя: краткое резюме, инсайт, sentiment, mood, category, tags, is_achievement',
  'gpt-4o-mini',
  1000,
  0.7,
  'Ты — внимательный наставник и аналитик дневника UNITY.

Твоя задача — проанализировать личную запись пользователя и вернуть краткое резюме, инсайт и технические метаданные.

Требования:
- Пиши на языке {{user_language}}.
- Говори уважительно, без сюсюканья и инфобизнес-штампов.
- Никакой банальной мотивации вроде "ты молодец, у тебя всё получится".
- Опирайся только на текст записи, не выдумывай факты.

Формат ответа — строго JSON.',
  'Язык пользователя: {{user_language}}

Текст записи (entry_text):

"""
{{entry_text}}
"""

Проанализируй запись и верни JSON следующей структуры:

{
  "summary": "краткое резюме записи (до 200 символов, без клише)",
  "insight": "не банальный, осмысленный инсайт, 1–2 предложения. Покажи новый взгляд или важный акцент. Без общих фраз.",
  "sentiment": "positive | neutral | negative",
  "mood": "короткое описание настроения (например: спокойный, вдохновлённый, усталый, раздражённый)",
  "category": "одна основная категория: например, ''семья'', ''здоровье'', ''работа'', ''деньги'', ''духовность'', ''отношения'', ''личное развитие''",
  "tags": ["2–5 ключевых тега по смыслу записи"],
  "is_achievement": true или false (является ли это запись про достижение/успех/маленькую победу)
}',
  TRUE,
  '{"response_format": {"type": "json_object"}}'::jsonb
);

-- 2. push_text
INSERT INTO ai_operations (
  id, group_name, display_name, description,
  model, max_tokens, temperature,
  system_prompt, user_prompt_template,
  is_enabled, extra_config
) VALUES (
  'push_text',
  'push',
  'Текст push-уведомления',
  'Генерация персонализированных push-уведомлений',
  'gpt-4o-mini',
  200,
  0.7,
  'Ты — текстовый движок push-уведомлений для приложения UNITY.

Требования:
- Пиши на языке {{user_language}}.
- Максимальная длина текста push — 80 символов.
- Стиль — спокойный, уважительный, без манипуляций и клише.
- Push должен быть понятен сам по себе, без объяснений.

Формат ответа — строго JSON.',
  'Язык пользователя: {{user_language}}
Тип уведомления (push_type): {{push_type}}

Верни JSON:
{
  "text": "сам текст push-уведомления (≤ 80 символов)"
}',
  TRUE,
  '{"response_format": {"type": "json_object"}}'::jsonb
);
```

### Шаг 3: Проверить результат

Выполнить:
```sql
SELECT id, group_name, display_name, is_enabled 
FROM ai_operations 
ORDER BY group_name, id;
```

Должно вернуть минимум 2 записи:
- `entry_analysis` (cards) - ✅ ENABLED
- `push_text` (push) - ✅ ENABLED

---

## 🔧 После применения seed данных

1. ✅ AI Control Center UI покажет операции
2. ✅ Edge Functions `ai-analysis` и `push-ai-personalize` заработают
3. ✅ Пользователи смогут использовать AI анализ записей
4. ✅ Push notifications заработают

---

## 📝 Полный seed (опционально)

Если нужны ВСЕ 6 операций (включая card_from_entry, progress_card, weekly_report, monthly_report):

Выполнить полный файл:
```
supabase/migrations/20251115000003_seed_ai_operations.sql
```

---

## ⚠️ ВАЖНО

После применения seed данных:
1. Проверить AI Control Center: https://unity-wine.vercel.app/?view=admin → Settings → AI
2. Создать тестовую запись как user (rustam@leadshunter.biz)
3. Проверить что AI анализ работает
4. Проверить логи Edge Functions: https://supabase.com/dashboard/project/ecuwuzqlwdkkdncampnc/functions

---

**ПРИМЕНИТЬ НЕМЕДЛЕННО!** 🚨

