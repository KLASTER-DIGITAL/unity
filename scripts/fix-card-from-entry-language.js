#!/usr/bin/env node

/**
 * Fix card_from_entry AI operation to generate cards in user's language
 *
 * Updates the user_prompt_template to explicitly instruct AI to generate
 * title, body, and optional_step in the user's language.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ecuwuzqlwdkkdncampnc.supabase.co';
const SUPABASE_SERVICE_KEY =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA1ODY5NCwiZXhwIjoyMDc1NjM0Njk0fQ.Tzl9W5L7GrqZPxV2Hg7CKUvWSS7jPk4EeQGlapYOCDY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const newUserPromptTemplate = `Язык пользователя: {{user_language}}

Тип карточки (card_type): {{card_type}}

Данные записи:
- summary: "{{ai_summary}}"
- insight: "{{ai_insight}}"
- sentiment: "{{sentiment}}"
- mood: "{{mood}}"
- category: "{{category}}"
- tags: {{tags_json}}

Сформируй карточку указанного типа СТРОГО НА ЯЗЫКЕ ПОЛЬЗОВАТЕЛЯ {{user_language}}.

ДЕТАЛЬНЫЕ ОРИЕНТИРЫ ПО ТИПАМ:

🎉 CELEBRATE (достижения, победы, вехи):
- Признай реальный шаг/достижение человека
- Покажи что это важно, но без фальшивой эйфории
- Помоги увидеть что было сделано конкретно
- optional_step: предложи зафиксировать момент (фото, заметка)

🤔 REFLECT (негативные эмоции, вызовы, уроки):
- Помоги взглянуть со стороны на сложную ситуацию
- Покажи что сложные эмоции нормальны и естественны
- Предложи один конкретный угол зрения
- optional_step: задай один простой вопрос для размышления

🎯 FOCUS (цели, планы, намерения):
- Выбери ОДНО направление для фокуса сегодня
- Помоги сузить внимание, а не расширить
- Покажи связь между целью и текущим моментом
- optional_step: один микро-шаг к цели (5-10 минут)

🙏 GRATITUDE (позитивные эмоции, благодарность):
- Мягко предложи заметить что-то хорошее
- Помоги увидеть детали, а не общие фразы
- Покажи связь между благодарностью и записью
- optional_step: назвать одну конкретную вещь за которую благодарен

📈 PROGRESS (прогресс, накопленный результат):
- Покажи накопленный прогресс через конкретные цифры
- НЕ используй слово "streak" (используй "серия", "последовательность")
- Помоги увидеть динамику, а не только текущее состояние
- optional_step: продолжить серию завтра

⚪ GENERIC (нейтральные записи):
- Нейтральная осмысленная подсказка
- Помоги увидеть что-то новое в обычном
- Один конкретный инсайт из записи
- optional_step: может быть пустым

ВАЖНО: Все поля (title, body, optional_step) должны быть СТРОГО НА ЯЗЫКЕ ПОЛЬЗОВАТЕЛЯ {{user_language}}.

Примеры для разных языков:
- Русский (ru): "Желание изучать новый язык", "Сегодня ты начал изучение нового языка..."
- Казахский (kk): "Жаңа тілді үйрену тілегі", "Бүгін сіз жаңа тілді үйренуді бастадыңыз..."
- Английский (en): "Desire to learn a new language", "Today you started learning a new language..."

Верни JSON:
{
  "title": "краткий заголовок карточки НА ЯЗЫКЕ ПОЛЬЗОВАТЕЛЯ {{user_language}} (1 строка, до 60 символов)",
  "body": "1–2 предложения НА ЯЗЫКЕ ПОЛЬЗОВАТЕЛЯ {{user_language}}, основанные на summary и insight. Максимум конкретики, минимум общих фраз.",
  "optional_step": "очень маленький шаг НА ЯЗЫКЕ ПОЛЬЗОВАТЕЛЯ {{user_language}}, который человек может сделать сегодня (до 1 предложения) или пустая строка"
}`;

async function main() {
	console.log('[FIX-CARD-FROM-ENTRY] Starting...');

	try {
		// Update card_from_entry operation
		const { data, error } = await supabase
			.from('ai_operations')
			.update({
				user_prompt_template: newUserPromptTemplate,
				updated_at: new Date().toISOString(),
			})
			.eq('id', 'card_from_entry')
			.select();

		if (error) {
			console.error('[FIX-CARD-FROM-ENTRY] ❌ Error:', error);
			process.exit(1);
		}

		console.log('[FIX-CARD-FROM-ENTRY] ✅ Updated card_from_entry operation');
		console.log('[FIX-CARD-FROM-ENTRY] Updated rows:', data.length);
		console.log('[FIX-CARD-FROM-ENTRY] ✅ Done!');
	} catch (error) {
		console.error('[FIX-CARD-FROM-ENTRY] ❌ Unexpected error:', error);
		process.exit(1);
	}
}

main();
