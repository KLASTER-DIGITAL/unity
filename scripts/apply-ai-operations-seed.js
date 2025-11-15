#!/usr/bin/env node

/**
 * Apply AI Operations Seed Data
 * Применяет seed данные для ai_operations таблицы напрямую через Supabase API
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecuwuzqlwdkkdncampnc.supabase.co';
const supabaseAnonKey =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTg2OTQsImV4cCI6MjA3NTYzNDY5NH0.OnBM1BIQMVgJur2nM4gZGDW-PWWwSR92DpJHhPpqB88';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Seed data from migration file
const seedData = [
	{
		id: 'entry_analysis',
		group_name: 'cards',
		display_name: 'Анализ записи',
		description:
			'Анализ записи пользователя: краткое резюме, инсайт, sentiment, mood, category, tags, is_achievement',
		model: 'gpt-4o-mini',
		max_tokens: 1000,
		temperature: 0.7,
		system_prompt: `Ты — внимательный наставник и аналитик дневника UNITY.

Твоя задача — проанализировать личную запись пользователя и вернуть краткое резюме, инсайт и технические метаданные.

Требования:
- Пиши на языке {{user_language}}.
- Говори уважительно, без сюсюканья и инфобизнес-штампов.
- Никакой банальной мотивации вроде "ты молодец, у тебя всё получится".
- Опирайся только на текст записи, не выдумывай факты.

Формат ответа — строго JSON.`,
		user_prompt_template: `Язык пользователя: {{user_language}}

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
  "category": "одна основная категория: например, 'семья', 'здоровье', 'работа', 'деньги', 'духовность', 'отношения', 'личное развитие'",
  "tags": ["2–5 ключевых тега по смыслу записи"],
  "is_achievement": true или false (является ли это запись про достижение/успех/маленькую победу)
}`,
		is_enabled: true,
		extra_config: { response_format: { type: 'json_object' } },
	},
	{
		id: 'push_text',
		group_name: 'push',
		display_name: 'Текст push-уведомления',
		description:
			'Генерация персонализированных push-уведомлений (morning_reminder, evening_reflection, new_insights, progress_milestone, come_back_gentle, support_during_hard_times)',
		model: 'gpt-4o-mini',
		max_tokens: 200,
		temperature: 0.7,
		system_prompt: `Ты — текстовый движок push-уведомлений для приложения UNITY.

Требования:
- Пиши на языке {{user_language}}.
- Максимальная длина текста push — 80 символов.
- Стиль — спокойный, уважительный, без манипуляций и клише.
- Push должен быть понятен сам по себе, без объяснений.

Формат ответа — строго JSON.`,
		user_prompt_template: `Язык пользователя: {{user_language}}
Тип уведомления (push_type): {{push_type}}

Возможные значения:
- "morning_reminder" - мягкое приглашение уделить себе 1–2 минуты утром
- "evening_reflection" - приглашение подвести итог дня
- "new_insights" - сообщение что появились новые инсайты/карточки
- "progress_milestone" - короткое отражение прогресса (без "streak", только "Прогресс")
- "come_back_gentle" - мягкое возвращение после паузы, без стыда и давления
- "support_during_hard_times" - деликатная поддержка, приглашение выговориться

Дополнительные данные (если есть):
- progress_days: {{progress_days}}
- last_entry_days_ago: {{last_entry_days_ago}}
- has_new_insights: {{has_new_insights}}

Верни JSON:
{
  "text": "сам текст push-уведомления (≤ 80 символов)"
}`,
		is_enabled: true,
		extra_config: { response_format: { type: 'json_object' } },
	},
];

async function applySeedData() {
	console.log('🌱 Applying AI Operations seed data...\n');

	try {
		// Check if data already exists
		const { data: existing, error: checkError } = await supabase
			.from('ai_operations')
			.select('id')
			.in(
				'id',
				seedData.map((op) => op.id)
			);

		if (checkError) {
			console.error('❌ Error checking existing data:', checkError.message);
			process.exit(1);
		}

		if (existing && existing.length > 0) {
			console.log(`⚠️  Found ${existing.length} existing operations. Updating...`);

			// Update existing operations
			for (const op of seedData) {
				const { error: updateError } = await supabase
					.from('ai_operations')
					.update(op)
					.eq('id', op.id);

				if (updateError) {
					console.error(`❌ Error updating ${op.id}:`, updateError.message);
				} else {
					console.log(`✅ Updated ${op.id}`);
				}
			}
		} else {
			console.log('📝 Inserting new operations...');

			// Insert new operations
			const { error: insertError } = await supabase.from('ai_operations').insert(seedData);

			if (insertError) {
				console.error('❌ Error inserting data:', insertError.message);
				process.exit(1);
			}

			console.log(`✅ Inserted ${seedData.length} operations`);
		}

		console.log('\n✅ Seed data applied successfully!');
		process.exit(0);
	} catch (err) {
		console.error('❌ Unexpected error:', err);
		process.exit(1);
	}
}

applySeedData();
