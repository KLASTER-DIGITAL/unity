-- URGENT: Fix AI tags to respect user language
-- Execute this in Supabase SQL Editor: https://supabase.com/dashboard/project/ecuwuzqlwdkkdncampnc/sql/new
-- Date: 2025-11-20

UPDATE ai_operations
SET user_prompt_template = 'Язык пользователя: {{user_language}}

Текст записи (entry_text):

"""
{{entry_text}}
"""

Проанализируй запись и верни JSON следующей структуры:

{
  "reply": "короткий мотивационный ответ (1-2 предложения, без клише, НА ЯЗЫКЕ ПОЛЬЗОВАТЕЛЯ {{user_language}})",
  "summary": "краткое резюме записи (до 200 символов, без клише, НА ЯЗЫКЕ ПОЛЬЗОВАТЕЛЯ {{user_language}})",
  "insight": "не банальный, осмысленный инсайт, 1–2 предложения. Покажи новый взгляд или важный акцент. Без общих фраз. НА ЯЗЫКЕ ПОЛЬЗОВАТЕЛЯ {{user_language}}.",
  "sentiment": "positive | neutral | negative",
  "mood": "короткое описание настроения НА ЯЗЫКЕ ПОЛЬЗОВАТЕЛЯ {{user_language}} (например для русского: спокойный, вдохновлённый, усталый, раздражённый; для казахского: тыныш, шабыттанған, шаршаған, ашулы)",
  "category": "одна основная категория НА ЯЗЫКЕ ПОЛЬЗОВАТЕЛЯ {{user_language}}: например для русского - ''семья'', ''здоровье'', ''работа'', ''деньги'', ''духовность'', ''отношения'', ''личное развитие''; для казахского - ''отбасы'', ''денсаулық'', ''жұмыс'', ''қаржы'', ''рухани'', ''қарым-қатынас'', ''жеке өсу''",
  "tags": ["2–5 ключевых тега по смыслу записи СТРОГО НА ЯЗЫКЕ ПОЛЬЗОВАТЕЛЯ {{user_language}}. Например для русского: ''новый язык'', ''обучение'', ''достижения''; для казахского: ''жаңа тіл'', ''оқу'', ''жетістіктер''"],
  "is_achievement": true или false (является ли это запись про достижение/успех/маленькую победу)
}'
WHERE id = 'entry_analysis';

-- Verify the update
SELECT id, display_name, LEFT(user_prompt_template, 200) as prompt_preview
FROM ai_operations
WHERE id = 'entry_analysis';

