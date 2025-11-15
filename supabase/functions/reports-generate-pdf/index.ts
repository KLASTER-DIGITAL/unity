/**
 * Reports Generate PDF API v2 - AI-POWERED
 *
 * Generates PDF reports from user's diary entries.
 * FREE users: Statistics + list of entries (NO AI)
 * PREMIUM users: Statistics + list of entries + AI weekly summary
 *
 * Endpoint:
 * - POST /reports-generate-pdf - Generate PDF report
 *
 * Request body:
 * {
 *   userId: string,
 *   periodStart: string (ISO date),
 *   periodEnd: string (ISO date),
 *   categories?: string[] (optional filter)
 * }
 *
 * @author UNITY Team
 * @date 2025-11-15
 * @version 2.0 - AI Control Center integration
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

// ======================
// AI OPERATIONS HELPERS
// ======================

interface AIOperationConfig {
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
 * Load AI operation config from database
 */
async function getAiOperationConfig(
	supabaseUrl: string,
	supabaseServiceKey: string,
	operationId: string
): Promise<AIOperationConfig | null> {
	try {
		const response = await fetch(
			`${supabaseUrl}/rest/v1/ai_operations?id=eq.${operationId}&select=*`,
			{
				headers: {
					apikey: supabaseServiceKey,
					Authorization: `Bearer ${supabaseServiceKey}`,
					'Content-Type': 'application/json',
				},
			}
		);

		if (!response.ok) {
			console.error(`[AI-CONFIG] Failed to fetch config for ${operationId}:`, response.status);
			return null;
		}

		const data = await response.json();
		if (!data || data.length === 0) {
			console.error(`[AI-CONFIG] No config found for ${operationId}`);
			return null;
		}

		return data[0];
	} catch (error) {
		console.error(`[AI-CONFIG] Error fetching config for ${operationId}:`, error);
		return null;
	}
}

/**
 * Replace placeholders in prompt template
 */
function replacePlaceholders(template: string, variables: Record<string, string>): string {
	let result = template;
	for (const [key, value] of Object.entries(variables)) {
		const placeholder = `{{${key}}}`;
		result = result.replaceAll(placeholder, value);
	}
	return result;
}

/**
 * Check if AI operation is available
 */
function isOperationAvailable(config: AIOperationConfig | null): boolean {
	return config !== null && config.is_enabled === true;
}

/**
 * Get OpenAI API key from admin_settings or env
 */
async function getOpenAIKey(
	supabaseUrl: string,
	supabaseServiceKey: string
): Promise<string | null> {
	try {
		const response = await fetch(
			`${supabaseUrl}/rest/v1/admin_settings?key=eq.openai_api_key&select=value`,
			{
				headers: {
					apikey: supabaseServiceKey,
					Authorization: `Bearer ${supabaseServiceKey}`,
					'Content-Type': 'application/json',
				},
			}
		);

		if (response.ok) {
			const data = await response.json();
			if (data && data.length > 0 && data[0].value) {
				console.log('[REPORTS-PDF] ✅ Using OpenAI key from admin_settings');
				return data[0].value;
			}
		}
	} catch (error) {
		console.error('[REPORTS-PDF] Error fetching OpenAI key from DB:', error);
	}

	// Fallback to env variable
	const envKey = Deno.env.get('OPENAI_API_KEY');
	if (envKey) {
		console.log('[REPORTS-PDF] ⚠️ Using OpenAI key from env variable (fallback)');
		return envKey;
	}

	console.error('[REPORTS-PDF] ❌ No OpenAI API key found');
	return null;
}

/**
 * Generate weekly summary using AI operation weekly_report
 */
async function generateWeeklySummary(
	entries: any[],
	stats: any,
	userLanguage: string,
	supabaseUrl: string,
	supabaseServiceKey: string
): Promise<string | null> {
	try {
		// Load AI operation config
		const config = await getAiOperationConfig(supabaseUrl, supabaseServiceKey, 'weekly_report');

		if (!isOperationAvailable(config) || !config) {
			console.log('[REPORTS-PDF] ⚠️ weekly_report operation disabled');
			return null;
		}

		// Get OpenAI API key
		const openaiApiKey = await getOpenAIKey(supabaseUrl, supabaseServiceKey);
		if (!openaiApiKey) {
			console.error('[REPORTS-PDF] ❌ No OpenAI API key');
			return null;
		}

		// Prepare entries summary
		const entriesSummary = entries
			.map((e) => {
				const date = new Date(e.created_at).toLocaleDateString(
					userLanguage === 'ru' ? 'ru-RU' : 'en-US'
				);
				return `[${date}] ${e.ai_summary || e.text?.substring(0, 100) || 'No text'}`;
			})
			.join('\n');

		// Replace placeholders in prompts (config is guaranteed non-null here)
		const systemPrompt = replacePlaceholders(config.system_prompt, {
			user_language: userLanguage,
		});

		const userPrompt = replacePlaceholders(config.user_prompt_template, {
			user_language: userLanguage,
			total_entries: String(stats.totalEntries),
			positive_count: String(stats.positiveEntries),
			neutral_count: String(stats.neutralEntries),
			negative_count: String(stats.negativeEntries),
			achievements_count: String(stats.achievements),
			top_category: stats.topCategory || 'none',
			top_mood: stats.topMood || 'none',
			entries_summary: entriesSummary,
		});

		console.log('[REPORTS-PDF] 🤖 Calling OpenAI for weekly summary...');

		// Call OpenAI API
		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${openaiApiKey}`,
			},
			body: JSON.stringify({
				model: config.model,
				temperature: config.temperature,
				max_tokens: config.max_tokens,
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt },
				],
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('[REPORTS-PDF] ❌ OpenAI API error:', response.status, errorText);
			return null;
		}

		const result = await response.json();
		const summary = result.choices[0]?.message?.content;

		if (!summary) {
			console.error('[REPORTS-PDF] ❌ No content in OpenAI response');
			return null;
		}

		console.log('[REPORTS-PDF] ✅ Weekly summary generated');
		return summary;
	} catch (error) {
		console.error('[REPORTS-PDF] ❌ Error generating weekly summary:', error);
		return null;
	}
}

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
	// Handle CORS preflight
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
		const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
		const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

		// Verify authentication
		const authHeader = req.headers.get('Authorization');
		if (!authHeader) {
			return new Response(
				JSON.stringify({ success: false, error: 'Missing authorization header' }),
				{ status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		const token = authHeader.replace('Bearer ', '');
		const {
			data: { user },
			error: authError,
		} = await supabaseAdmin.auth.getUser(token);

		if (authError || !user) {
			return new Response(JSON.stringify({ success: false, error: 'Invalid access token' }), {
				status: 401,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Parse request body
		const body = await req.json();
		const { userId, periodStart, periodEnd, categories } = body;

		console.log('[REPORTS-PDF] Generating report for user:', userId);
		console.log('[REPORTS-PDF] Period:', periodStart, '-', periodEnd);

		// Validate user owns this request
		if (user.id !== userId) {
			return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
				status: 403,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Check if user is Premium
		const { data: profile } = await supabaseAdmin
			.from('profiles')
			.select('is_premium, language, name')
			.eq('id', userId)
			.single();

		const isPremium = profile?.is_premium || false;
		const userLanguage = profile?.language || 'ru';
		const userName = profile?.name || 'Пользователь';

		console.log('[REPORTS-PDF] User Premium status:', isPremium);

		// Fetch entries for the period
		const query = supabaseAdmin
			.from('entries')
			.select(
				'id, text, sentiment, category, tags, mood, ai_summary, ai_insight, is_achievement, created_at'
			)
			.eq('user_id', userId)
			.gte('created_at', periodStart)
			.lte('created_at', periodEnd)
			.order('created_at', { ascending: true });

		// Filter by categories if specified
		if (categories && categories.length > 0) {
			query.in('category', categories);
		}

		const { data: entries, error: entriesError } = await query;

		if (entriesError) {
			console.error('[REPORTS-PDF] Error fetching entries:', entriesError);
			return new Response(JSON.stringify({ success: false, error: 'Failed to fetch entries' }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		if (!entries || entries.length === 0) {
			return new Response(
				JSON.stringify({ success: false, error: 'No entries found for this period' }),
				{ status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		console.log('[REPORTS-PDF] Found', entries.length, 'entries');

		// Calculate statistics
		const stats = {
			totalEntries: entries.length,
			achievements: entries.filter((e) => e.is_achievement).length,
			positiveEntries: entries.filter((e) => e.sentiment === 'positive').length,
			neutralEntries: entries.filter((e) => e.sentiment === 'neutral').length,
			negativeEntries: entries.filter((e) => e.sentiment === 'negative').length,
			categories: [...new Set(entries.map((e) => e.category))],
			topCategory: getTopCategory(entries),
			topMood: getTopMood(entries),
		};

		// ✅ Generate AI weekly summary for Premium users
		let aiWeeklySummary: string | null = null;
		if (isPremium) {
			console.log('[REPORTS-PDF] 🤖 Generating AI weekly summary for Premium user...');
			aiWeeklySummary = await generateWeeklySummary(
				entries,
				stats,
				userLanguage,
				supabaseUrl,
				supabaseServiceKey
			);

			if (aiWeeklySummary) {
				console.log('[REPORTS-PDF] ✅ AI weekly summary generated successfully');
			} else {
				console.log('[REPORTS-PDF] ⚠️ AI weekly summary generation failed, continuing without it');
			}
		}

		// Prepare report data
		const reportData = {
			userName,
			userLanguage,
			isPremium,
			periodStart,
			periodEnd,
			stats,
			// ✅ AI weekly summary ONLY for Premium users
			aiWeeklySummary: isPremium ? aiWeeklySummary : null,
			entries: entries.map((entry) => ({
				id: entry.id,
				date: entry.created_at,
				text: entry.text,
				category: entry.category,
				sentiment: entry.sentiment,
				mood: entry.mood,
				isAchievement: entry.is_achievement,
				// ✅ AI data ONLY for Premium users
				aiSummary: isPremium ? entry.ai_summary : null,
				aiInsight: isPremium ? entry.ai_insight : null,
			})),
		};

		console.log('[REPORTS-PDF] Report data prepared successfully');

		return new Response(
			JSON.stringify({
				success: true,
				reportData,
				message: isPremium
					? aiWeeklySummary
						? 'PDF отчет с AI анализом и недельным summary готов'
						: 'PDF отчет с AI анализом готов (без weekly summary)'
					: 'PDF отчет готов (без AI анализа)',
			}),
			{ status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		);
	} catch (error) {
		console.error('[REPORTS-PDF] Error:', error);
		return new Response(
			JSON.stringify({
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			}),
			{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		);
	}
});

/**
 * Get top category from entries
 */
function getTopCategory(entries: any[]): string {
	const categoryCounts: Record<string, number> = {};
	entries.forEach((entry) => {
		const category = entry.category || 'другое';
		categoryCounts[category] = (categoryCounts[category] || 0) + 1;
	});

	let topCategory = 'другое';
	let maxCount = 0;
	Object.entries(categoryCounts).forEach(([category, count]) => {
		if (count > maxCount) {
			maxCount = count;
			topCategory = category;
		}
	});

	return topCategory;
}

/**
 * Get top mood from entries
 */
function getTopMood(entries: any[]): string {
	const moodCounts: Record<string, number> = {};
	entries.forEach((entry) => {
		const mood = entry.mood || 'neutral';
		moodCounts[mood] = (moodCounts[mood] || 0) + 1;
	});

	let topMood = 'neutral';
	let maxCount = 0;
	Object.entries(moodCounts).forEach(([mood, count]) => {
		if (count > maxCount) {
			maxCount = count;
			topMood = mood;
		}
	});

	return topMood;
}
