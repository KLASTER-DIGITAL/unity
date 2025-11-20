#!/usr/bin/env node

/**
 * Fix AI Tags Language - Update entry_analysis prompt
 * Ensures AI generates tags in user's language
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ecuwuzqlwdkkdncampnc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA1ODY5NCwiZXhwIjoyMDc1NjM0Njk0fQ.Tzl9W5L7GrqZPxV2Hg7CKUvWSS7jPk4EeQGlapYOCDY';

const newUserPromptTemplate = `Язык пользователя: {{user_language}}

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
  "category": "одна основная категория НА ЯЗЫКЕ ПОЛЬЗОВАТЕЛЯ {{user_language}}: например для русского - 'семья', 'здоровье', 'работа', 'деньги', 'духовность', 'отношения', 'личное развитие'; для казахского - 'отбасы', 'денсаулық', 'жұмыс', 'қаржы', 'рухани', 'қарым-қатынас', 'жеке өсу'",
  "tags": ["2–5 ключевых тега по смыслу записи СТРОГО НА ЯЗЫКЕ ПОЛЬЗОВАТЕЛЯ {{user_language}}. Например для русского: 'новый язык', 'обучение', 'достижения'; для казахского: 'жаңа тіл', 'оқу', 'жетістіктер'"],
  "is_achievement": true или false (является ли это запись про достижение/успех/маленькую победу)
}`;

async function main() {
	console.log('🚀 Fixing AI tags language...\n');

	const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

	try {
		// Update entry_analysis operation
		const { data, error } = await supabase
			.from('ai_operations')
			.update({
				user_prompt_template: newUserPromptTemplate,
				updated_at: new Date().toISOString(),
			})
			.eq('id', 'entry_analysis')
			.select();

		if (error) {
			console.error('❌ Error updating ai_operations:', error.message);
			process.exit(1);
		}

		console.log('✅ Successfully updated entry_analysis prompt!');
		console.log('\n📋 Updated operation:');
		console.log(JSON.stringify(data, null, 2));

		console.log("\n✨ AI will now generate tags in user's language!");
		console.log('🧪 Test by creating a new entry under Ahmedjan account (kk language)');
	} catch (err) {
		console.error('❌ Unexpected error:', err);
		process.exit(1);
	}
}

main();
