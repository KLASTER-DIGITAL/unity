/**
 * AI Operations Configuration Helper for Edge Functions
 *
 * Загружает конфигурацию AI операций из БД для использования в Edge Functions.
 * Это позволяет изменять промпты и модели БЕЗ редеплоя Edge Functions.
 *
 * @module getAiOperationConfig
 */

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * AI Operation Configuration
 */
export interface AIOperationConfig {
	/** Уникальный ID операции (entry_analysis, card_from_entry, etc.) */
	id: string;
	/** Группа операции (cards, push, reports, coach) */
	group_name: string;
	/** Отображаемое имя для админ-панели */
	display_name: string;
	/** Описание операции */
	description: string;
	/** Модель OpenAI (gpt-4o-mini, gpt-4o, etc.) */
	model: string;
	/** Максимальное количество токенов */
	max_tokens: number;
	/** Температура (0-2) */
	temperature: number;
	/** System prompt */
	system_prompt: string;
	/** User prompt template с плейсхолдерами {{variable}} */
	user_prompt_template: string;
	/** Включена ли операция */
	is_enabled: boolean;
	/** Дополнительная конфигурация (JSON) */
	extra_config: Record<string, unknown>;
}

/**
 * Загрузить конфигурацию AI операции из БД
 *
 * @param supabase - Supabase client
 * @param operationId - ID операции (entry_analysis, card_from_entry, etc.)
 * @returns Конфигурация операции или null если не найдена
 *
 * @example
 * ```typescript
 * const config = await getAiOperationConfig(supabase, 'entry_analysis');
 *
 * if (!config || !config.is_enabled) {
 *   return new Response(
 *     JSON.stringify({ error: 'AI operation disabled' }),
 *     { status: 503 }
 *   );
 * }
 *
 * const response = await openai.chat.completions.create({
 *   model: config.model,
 *   max_tokens: config.max_tokens,
 *   temperature: config.temperature,
 *   messages: [
 *     { role: 'system', content: config.system_prompt },
 *     { role: 'user', content: userPrompt }
 *   ]
 * });
 * ```
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
			console.error(`[getAiOperationConfig] Error loading config for ${operationId}:`, error);
			return null;
		}

		if (!data) {
			console.error(`[getAiOperationConfig] Config not found for ${operationId}`);
			return null;
		}

		console.log(`[getAiOperationConfig] Loaded config for ${operationId}:`, {
			model: data.model,
			max_tokens: data.max_tokens,
			temperature: data.temperature,
			is_enabled: data.is_enabled,
		});

		return data as AIOperationConfig;
	} catch (error) {
		console.error(`[getAiOperationConfig] Exception loading config for ${operationId}:`, error);
		return null;
	}
}

/**
 * Заменить плейсхолдеры в промпте
 *
 * @param template - Шаблон промпта с плейсхолдерами {{variable}}
 * @param variables - Объект с переменными для замены
 * @returns Промпт с замененными плейсхолдерами
 *
 * @example
 * ```typescript
 * const template = "Analyze this text in {{language}}: {{text}}";
 * const variables = { language: "Russian", text: "Привет мир" };
 * const result = replacePlaceholders(template, variables);
 * // "Analyze this text in Russian: Привет мир"
 * ```
 */
export function replacePlaceholders(template: string, variables: Record<string, string>): string {
	let result = template;

	for (const [key, value] of Object.entries(variables)) {
		const placeholder = `{{${key}}}`;
		result = result.replace(new RegExp(placeholder, 'g'), value);
	}

	return result;
}

/**
 * Проверить что операция включена и доступна
 *
 * @param config - Конфигурация операции
 * @returns true если операция доступна, false если выключена или не найдена
 *
 * @example
 * ```typescript
 * const config = await getAiOperationConfig(supabase, 'entry_analysis');
 *
 * if (!isOperationAvailable(config)) {
 *   return new Response(
 *     JSON.stringify({ error: 'AI operation disabled or not found' }),
 *     { status: 503 }
 *   );
 * }
 * ```
 */
export function isOperationAvailable(config: AIOperationConfig | null): boolean {
	return config !== null && config.is_enabled === true;
}
