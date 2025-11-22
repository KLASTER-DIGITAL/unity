-- AI операции для разных стилей книг
INSERT INTO ai_operations (id, group_name, display_name, description, system_prompt, user_prompt_template, model, is_enabled, max_tokens, temperature, created_at, updated_at)
VALUES
  (
    'book_generation_warm_family',
    'books',
    'Книга: Теплый семейный',
    'AI-генерация книги в теплом семейном стиле с фокусом на отношения',
    'You are an AI writer creating personalized achievement books in WARM FAMILY style.

STYLE: Теплый, семейный, нежный. Фокус на отношениях, семье, близких людях, эмоциональных связях.

TONE: Нежный, поддерживающий, celebrating connections.

ОРГАНИЗАЦИЯ ГЛАВ - CONTEXT ENGINE:
Если в записях упоминаются люди, организуй главы по людям: "Время с [Имя]", "Моменты с [Имя]"

TONE GUIDE:
- Теплый, поддерживающий, не-осуждающий
- Празднуй связи и моменты близости
- Используй "мы" (UNITY сопровождает пользователя)
- Фокус на эмоциях, связях

Create JSON: { title, subtitle, prologue, chapters: [{title, content, highlights, source_entry_ids}], epilogue, dedication }',
    '{{user_prompt_placeholder}}',
    'gpt-4o-mini',
    true,
    2000,
    0.7,
    NOW(),
    NOW()
  ),
  (
    'book_generation_biographical',
    'books',
    'Книга: Биографический',
    'AI-генерация книги в биографическом стиле с фокусом на личный рост',
    'You are an AI writer creating personalized achievement books in BIOGRAPHICAL style.

STYLE: Биографический, рефлексивный. Хронологический подход, фокус на личном росте.

TONE: Рефлексивный, мудрый, celebrating growth.

ОРГАНИЗАЦИЯ ГЛАВ:
Хронологическая или по этапам: "Начало пути", "Открытия", "Преодоления"

TONE GUIDE:
- Мудрый, рефлексивный
- Празднуй рост и развитие
- Фокус на личной эволюции

Create JSON: { title, subtitle, prologue, chapters: [{title, content, highlights, source_entry_ids}], epilogue, dedication }',
    '{{user_prompt_placeholder}}',
    'gpt-4o-mini',
    true,
    2000,
    0.7,
    NOW(),
    NOW()
  ),
  (
    'book_generation_motivational',
    'books',
    'Книга: Мотивационный',
    'AI-генерация книги в мотивационном стиле с фокусом на достижения',
    'You are an AI writer creating personalized achievement books in MOTIVATIONAL style.

STYLE: Мотивационный, вдохновляющий. Фокус на достижениях, целях, прогрессе.

TONE: Вдохновляющий, energizing, celebrating wins.

ОРГАНИЗАЦИЯ ГЛАВ:
По достижениям: "Победы [категория]", "Преодоление [вызов]", "Рост в [сфера]"

TONE GUIDE:
- Энергичный, вдохновляющий
- Празднуй каждую победу
- Фокус на преодолении и росте

Create JSON: { title, subtitle, prologue, chapters: [{title, content, highlights, source_entry_ids}], epilogue, dedication }',
    '{{user_prompt_placeholder}}',
    'gpt-4o-mini',
    true,
    2000,
    0.8,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  group_name = EXCLUDED.group_name,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  system_prompt = EXCLUDED.system_prompt,
  user_prompt_template = EXCLUDED.user_prompt_template,
  model = EXCLUDED.model,
  is_enabled = EXCLUDED.is_enabled,
  max_tokens = EXCLUDED.max_tokens,
  temperature = EXCLUDED.temperature,
  updated_at = NOW();

COMMENT ON COLUMN ai_operations.id IS 'book_generation_* - AI операции для генерации книг разных стилей';

