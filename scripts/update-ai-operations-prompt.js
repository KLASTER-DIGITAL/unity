#!/usr/bin/env node

/**
 * Update AI Operations Prompt - Add 'reply' field
 * Fixes missing ai_reply in entries by updating entry_analysis prompt
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ecuwuzqlwdkkdncampnc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA1ODY5NCwiZXhwIjoyMDc1NjM0Njk0fQ.Tzl9W5L7GrqZPxV2Hg7CKUvWSS7jPk4EeQGlapYOCDY';

async function main() {
	console.log('🔧 Updating AI Operations prompt to include reply field...\n');

	const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

	// New user_prompt_template with 'reply' field
	const newUserPromptTemplate = `Проанализируй запись пользователя {{user_name}} на языке {{user_language}}.

Текст записи:
{{entry_text}}

Верни JSON:

{
  "reply": "короткий мотивационный ответ (1-2 предложения, без клише, на языке пользователя)",
  "summary": "краткое резюме записи (до 200 символов, без клише)",
  "insight": "не банальный, осмысленный инсайт, 1–2 предложения. Покажи новый взгляд или важный акцент. Без общих фраз.",
  "sentiment": "positive | neutral | negative",
  "mood": "короткое описание настроения (например: спокойный, вдохновлённый, усталый, раздражённый)",
  "category": "одна основная категория: например, 'семья', 'здоровье', 'работа', 'деньги', 'духовность', 'отношения', 'личное развитие'",
  "tags": ["2–5 ключевых тега по смыслу записи"],
  "is_achievement": true или false (является ли это запись про достижение/успех/маленькую победу)
}`;

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
	console.log('\n📊 Updated operation:');
	console.log('  ID:', data[0].id);
	console.log('  Display Name:', data[0].display_name);
	console.log('  Model:', data[0].model);
	console.log('  Updated At:', data[0].updated_at);

	console.log('\n🎉 Done! AI will now return reply field.');
	console.log('\n📝 Next steps:');
	console.log('1. Create a new entry in the app');
	console.log('2. Check that ai_reply is populated in the database');
	console.log('3. Verify AI analysis appears in the feed');
}

main().catch(console.error);
