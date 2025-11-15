/**
 * AI Operation Config Helper
 * Получение конфигурации AI операций из БД с fallback на дефолтные значения
 */

import type { SupabaseClient } from '@supabase/supabase-js';

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

/**
 * Получить конфигурацию AI операции из БД
 * @param supabase - Supabase client
 * @param operationId - ID операции (entry_analysis, card_from_entry, etc.)
 * @returns Конфигурация операции или null если не найдена/отключена
 */
export async function getAiOperationConfig(
	supabase: SupabaseClient,
	operationId: string
): Promise<AIOperationConfig | null> {
	try {
		const { data, error } = await supabase
			.from('ai_operations')
			.select('*')
			.eq('id', operationId)
			.single();

		if (error) {
			console.error(`[getAiOperationConfig] Error fetching ${operationId}:`, error.message);
			return null;
		}

		if (!data) {
			console.warn(`[getAiOperationConfig] Operation ${operationId} not found`);
			return null;
		}

		if (!data.is_enabled) {
			console.warn(`[getAiOperationConfig] Operation ${operationId} is disabled`);
			return null;
		}

		return data as AIOperationConfig;
	} catch (err) {
		console.error(`[getAiOperationConfig] Unexpected error for ${operationId}:`, err);
		return null;
	}
}

/**
 * Получить конфигурацию AI операции с fallback на дефолтные значения
 * @param supabase - Supabase client
 * @param operationId - ID операции
 * @returns Конфигурация операции (из БД или дефолтная)
 */
export async function getAiOperationConfigWithFallback(
	supabase: SupabaseClient,
	operationId: string
): Promise<AIOperationConfig> {
	const config = await getAiOperationConfig(supabase, operationId);

	if (config) {
		return config;
	}

	// Fallback на дефолтные значения
	console.warn(`[getAiOperationConfig] Using fallback config for ${operationId}`);
	return getDefaultConfig(operationId);
}

/**
 * Дефолтные конфигурации для AI операций
 * Используются как fallback если операция не найдена в БД
 */
function getDefaultConfig(operationId: string): AIOperationConfig {
	const defaults: Record<string, AIOperationConfig> = {
		entry_analysis: {
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
			extra_config: {
				response_format: { type: 'json_object' },
			},
		},
		// Добавить другие дефолтные конфигурации по мере необходимости
	};

	const config = defaults[operationId];

	if (!config) {
		throw new Error(`No default config found for operation: ${operationId}`);
	}

	return config;
}

/**
 * Заменить плейсхолдеры в промпте
 * @param template - Шаблон промпта с плейсхолдерами {{variable}}
 * @param variables - Объект с переменными для замены
 * @returns Промпт с замененными плейсхолдерами
 */
export function replacePlaceholders(template: string, variables: Record<string, string>): string {
	let result = template;

	Object.keys(variables).forEach((key) => {
		const placeholder = `{{${key}}}`;
		const value = variables[key];

		// Если значение - объект или массив, конвертируем в JSON
		const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

		result = result.replace(new RegExp(placeholder, 'g'), stringValue);
	});

	return result;
}
