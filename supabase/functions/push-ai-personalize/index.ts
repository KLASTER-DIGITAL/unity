/**
 * Push AI Personalize Edge Function
 *
 * Генерирует персонализированные push уведомления для Premium пользователей через GPT-4o-mini
 *
 * Endpoints:
 * - POST /push-ai-personalize?type=daily_reminder - Персонализированное ежедневное напоминание
 * - POST /push-ai-personalize?type=weekly_motivation - Персонализированная еженедельная мотивация
 * - POST /push-ai-personalize?user_id=xxx - Персонализированное уведомление для конкретного пользователя
 *
 * Body (optional):
 * {
 *   "user_id": "uuid",
 *   "type": "daily_reminder" | "weekly_motivation" | "achievement_celebration"
 * }
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import {
	getAiOperationConfig,
	isOperationAvailable,
	replacePlaceholders,
} from '../_shared/ai/getAiOperationConfig.ts';

// CORS headers
const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase Admin Client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Анализирует поведение пользователя для персонализации
 */
async function analyzeUserBehavior(userId: string) {
	// Получаем все записи за последние 30 дней
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const { data: entries } = await supabaseAdmin
		.from('entries')
		.select('created_at, mood')
		.eq('user_id', userId)
		.gte('created_at', thirtyDaysAgo.toISOString())
		.order('created_at', { ascending: false });

	if (!entries || entries.length === 0) {
		return {
			mostActiveHour: 21, // Default: 21:00
			mostActiveDay: 'monday',
			averageMood: 'neutral',
			activityPattern: 'evening',
		};
	}

	// Анализ активности по часам
	const hourCounts: Record<number, number> = {};
	const dayCounts: Record<string, number> = {};
	const moods: string[] = [];

	for (const entry of entries) {
		const date = new Date(entry.created_at);
		const hour = date.getHours();
		const day = date.toLocaleDateString('en-US', { weekday: 'lowercase' });

		hourCounts[hour] = (hourCounts[hour] || 0) + 1;
		dayCounts[day] = (dayCounts[day] || 0) + 1;

		if (entry.mood) {
			moods.push(entry.mood);
		}
	}

	// Находим самый активный час
	const mostActiveHour = Object.entries(hourCounts).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

	// Находим самый активный день
	const mostActiveDay = Object.entries(dayCounts).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

	// Определяем паттерн активности
	const hour = Number.parseInt(mostActiveHour, 10);
	const activityPattern =
		hour >= 6 && hour < 12
			? 'morning'
			: hour >= 12 && hour < 18
				? 'afternoon'
				: hour >= 18 && hour < 22
					? 'evening'
					: 'night';

	// Анализ настроения
	const moodCounts: Record<string, number> = {};
	for (const mood of moods) {
		moodCounts[mood] = (moodCounts[mood] || 0) + 1;
	}
	const averageMood =
		Object.keys(moodCounts).length > 0
			? Object.entries(moodCounts).reduce((a, b) => (b[1] > a[1] ? b : a))[0]
			: 'neutral';

	return {
		mostActiveHour: Number.parseInt(mostActiveHour, 10),
		mostActiveDay,
		averageMood,
		activityPattern,
	};
}

/**
 * Получает данные пользователя для персонализации
 */
async function getUserContext(userId: string) {
	// Получаем профиль пользователя
	const { data: profile } = await supabaseAdmin
		.from('profiles')
		.select('full_name, language, is_premium, created_at')
		.eq('id', userId)
		.single();

	if (!profile || !profile.is_premium) {
		return null; // Только для Premium пользователей
	}

	// Получаем последние 5 записей
	const { data: entries } = await supabaseAdmin
		.from('entries')
		.select('text, mood, created_at')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
		.limit(5);

	// Получаем текущий streak
	const { data: streakData } = await supabaseAdmin.rpc('calculate_streak', {
		p_user_id: userId,
	});

	// Получаем достижения
	const { data: achievements } = await supabaseAdmin
		.from('entries')
		.select('id')
		.eq('user_id', userId)
		.eq('is_achievement', true)
		.order('created_at', { ascending: false })
		.limit(3);

	// Анализируем поведение пользователя
	const behavior = await analyzeUserBehavior(userId);

	return {
		name: profile.full_name || 'Пользователь',
		language: profile.language || 'ru',
		isPremium: profile.is_premium,
		memberSince: profile.created_at,
		recentEntries: entries || [],
		currentStreak: streakData || 0,
		recentAchievements: achievements || [],
		behavior, // NEW: добавлен анализ поведения
	};
}

/**
 * Генерирует персонализированное сообщение через AI (config from DB)
 */
async function generatePersonalizedMessage(
	userContext: any,
	messageType: string
): Promise<{ title: string; body: string }> {
	// ✅ LOAD AI OPERATION CONFIG FROM DATABASE
	console.log('[PUSH-AI-PERSONALIZE] 📋 Loading AI operation config from database...');
	const config = await getAiOperationConfig(supabaseAdmin, 'push_text');

	if (!isOperationAvailable(config)) {
		console.error('[PUSH-AI-PERSONALIZE] ❌ AI operation disabled or not found');
		throw new Error('AI operation disabled or not found');
	}

	console.log('[PUSH-AI-PERSONALIZE] ✅ AI operation config loaded:', {
		model: config.model,
		max_tokens: config.max_tokens,
		temperature: config.temperature,
	});

	// Replace placeholders in prompts
	const systemPrompt = replacePlaceholders(config.system_prompt, {
		user_name: userContext.name,
		user_language: userContext.language,
		current_streak: String(userContext.currentStreak),
		recent_entries_count: String(userContext.recentEntries.length),
		recent_achievements_count: String(userContext.recentAchievements.length),
		most_active_hour: String(userContext.behavior.mostActiveHour),
		most_active_day: userContext.behavior.mostActiveDay,
		activity_pattern: userContext.behavior.activityPattern,
		average_mood: userContext.behavior.averageMood,
		message_type: messageType,
	});

	const userPrompt = replacePlaceholders(config.user_prompt_template, {
		message_type: messageType,
	});

	console.log('[PUSH-AI-PERSONALIZE] 🚀 Calling OpenAI API...');
	console.log('[PUSH-AI-PERSONALIZE] 📝 Model:', config.model);
	console.log('[PUSH-AI-PERSONALIZE] 📝 Max tokens:', config.max_tokens);
	console.log('[PUSH-AI-PERSONALIZE] 📝 Temperature:', config.temperature);

	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${openaiApiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			model: config.model,
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userPrompt },
			],
			temperature: config.temperature,
			max_tokens: config.max_tokens,
			response_format: { type: 'json_object' },
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		console.error('[PUSH-AI-PERSONALIZE] ❌ OpenAI API error:', error);
		throw new Error(`OpenAI API failed: ${response.status}`);
	}

	console.log('[PUSH-AI-PERSONALIZE] ✅ OpenAI API call successful!');

	const result = await response.json();
	const aiResponse = result.choices[0]?.message?.content;

	if (!aiResponse) {
		throw new Error('No response from AI');
	}

	return JSON.parse(aiResponse);
}

/**
 * Отправляет персонализированное уведомление через unified sender
 * (с автоматическим fallback на другие каналы если Web Push недоступен)
 */
async function sendPersonalizedNotification(
	userId: string,
	title: string,
	body: string,
	type: string
) {
	const response = await fetch(`${supabaseUrl}/functions/v1/unified-notification-sender`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${supabaseServiceKey}`,
		},
		body: JSON.stringify({
			user_ids: [userId],
			title,
			body,
			icon: '/icon-192.png',
			data: {
				type: `ai_personalized_${type}`,
				url: '/?view=home',
			},
			fallback: true, // Enable fallback to other channels
		}),
	});

	return await response.json();
}

/**
 * Получает Premium пользователей с включенными уведомлениями
 */
async function getPremiumUsersWithPushEnabled(notificationType?: string) {
	let query = supabaseAdmin.from('profiles').select('id').eq('is_premium', true);

	if (notificationType) {
		query = query.eq(`notification_settings->${notificationType}`, true);
	}

	const { data } = await query;
	return data?.map((u) => u.id) || [];
}

// Main handler
Deno.serve(async (req) => {
	// Handle CORS preflight
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		const url = new URL(req.url);
		const type = url.searchParams.get('type') || 'daily_reminder';
		const userId = url.searchParams.get('user_id');
		const action = url.searchParams.get('action'); // NEW: action parameter

		console.log('[PUSH-AI-PERSONALIZE] Type:', type);
		console.log('[PUSH-AI-PERSONALIZE] User ID:', userId);
		console.log('[PUSH-AI-PERSONALIZE] Action:', action);

		// NEW: Endpoint для получения оптимального времени отправки
		if (action === 'get_best_time' && userId) {
			const userContext = await getUserContext(userId);

			if (!userContext) {
				return new Response(JSON.stringify({ error: 'User not found or not Premium' }), {
					status: 404,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			return new Response(
				JSON.stringify({
					success: true,
					user_id: userId,
					best_time: {
						hour: userContext.behavior.mostActiveHour,
						day: userContext.behavior.mostActiveDay,
						pattern: userContext.behavior.activityPattern,
					},
					behavior: userContext.behavior,
				}),
				{
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			);
		}

		// NEW: Endpoint для генерации сообщения БЕЗ отправки
		if (action === 'generate_only' && userId) {
			const userContext = await getUserContext(userId);

			if (!userContext) {
				return new Response(JSON.stringify({ error: 'User not found or not Premium' }), {
					status: 404,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			const message = await generatePersonalizedMessage(userContext, type);

			return new Response(
				JSON.stringify({
					success: true,
					user_id: userId,
					message: {
						title: message.title,
						body: message.body,
					},
				}),
				{
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			);
		}

		// Если указан конкретный пользователь
		if (userId) {
			const userContext = await getUserContext(userId);

			if (!userContext) {
				return new Response(JSON.stringify({ error: 'User not found or not Premium' }), {
					status: 404,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			const message = await generatePersonalizedMessage(userContext, type);
			const result = await sendPersonalizedNotification(userId, message.title, message.body, type);

			return new Response(JSON.stringify({ success: true, result }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Массовая рассылка для Premium пользователей
		const userIds = await getPremiumUsersWithPushEnabled(
			type === 'daily_reminder' ? 'dailyReminder' : undefined
		);

		if (userIds.length === 0) {
			return new Response(
				JSON.stringify({ success: true, sent: 0, message: 'No Premium users found' }),
				{
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			);
		}

		console.log(`[PUSH-AI-PERSONALIZE] Sending to ${userIds.length} Premium users`);

		const results = await Promise.all(
			userIds.map(async (uid) => {
				try {
					const userContext = await getUserContext(uid);
					if (!userContext) return { success: false, userId: uid };

					const message = await generatePersonalizedMessage(userContext, type);
					await sendPersonalizedNotification(uid, message.title, message.body, type);

					return { success: true, userId: uid };
				} catch (error) {
					console.error(`[PUSH-AI-PERSONALIZE] Error for user ${uid}:`, error);
					return { success: false, userId: uid, error: error.message };
				}
			})
		);

		const sent = results.filter((r) => r.success).length;
		const failed = results.filter((r) => !r.success).length;

		return new Response(
			JSON.stringify({
				success: true,
				sent,
				failed,
				total: userIds.length,
			}),
			{
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		);
	} catch (error) {
		console.error('[PUSH-AI-PERSONALIZE] Error:', error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});
