import { createClient } from 'jsr:@supabase/supabase-js@2';
import {
	getAiOperationConfig,
	isOperationAvailable,
	replacePlaceholders,
} from '../_shared/ai/getAiOperationConfig.ts';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers':
		'authorization, x-client-info, apikey, content-type, x-openai-key',
};

type PeriodType = 'weekly' | 'monthly';

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { ...corsHeaders, 'Content-Type': 'application/json' },
	});
}

function getIsoDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}

function getIsoWeekNumber(date: Date): number {
	const tmp = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
	let day = tmp.getUTCDay();
	if (day === 0) day = 7;
	tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
	const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
	return Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getPeriodRange(
	period: PeriodType,
	periodKey?: string
): {
	periodKey: string;
	startDate: string;
	endDate: string;
	year?: number;
	month?: number;
} {
	const now = new Date();

	if (period === 'monthly') {
		let year: number;
		let month: number;

		if (periodKey && /^\d{4}-\d{2}$/.test(periodKey)) {
			const [y, m] = periodKey.split('-');
			year = Number(y);
			month = Number(m);
		} else {
			year = now.getUTCFullYear();
			month = now.getUTCMonth() + 1;
		}

		const start = new Date(Date.UTC(year, month - 1, 1));
		const end = new Date(Date.UTC(year, month, 0));
		const key = `${year}-${String(month).padStart(2, '0')}`;
		return { periodKey: key, startDate: getIsoDate(start), endDate: getIsoDate(end), year, month };
	}

	const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
	const start = new Date(end);
	start.setUTCDate(end.getUTCDate() - 6);
	const weekNo = getIsoWeekNumber(end);
	const key = `${end.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
	return { periodKey: key, startDate: getIsoDate(start), endDate: getIsoDate(end) };
}

async function resolveOpenAiKey(req: Request, supabaseAdmin: any): Promise<string | null> {
	const headerKey = req.headers.get('X-OPENAI-KEY') ?? req.headers.get('x-openai-key');
	if (headerKey) return headerKey;

	const { data: setting } = await supabaseAdmin
		.from('admin_settings')
		.select('value')
		.eq('key', 'openai_api_key')
		.single();

	if (setting?.value) return setting.value as string;

	const envKey = Deno.env.get('OPENAI_API_KEY');
	return envKey || null;
}

Deno.serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
		const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

		const authHeader = req.headers.get('Authorization');
		if (!authHeader) {
			return jsonResponse({ success: false, error: 'Missing authorization header' }, 401);
		}

		const accessToken = authHeader.replace('Bearer ', '');
		const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

		const {
			data: { user },
			error: authError,
		} = await supabaseAdmin.auth.getUser(accessToken);

		if (authError || !user) {
			return jsonResponse({ success: false, error: 'Invalid access token' }, 401);
		}

		const { data: profile, error: profileError } = await supabaseAdmin
			.from('profiles')
			.select('is_premium, language')
			.eq('id', user.id)
			.single();

		if (profileError) {
			return jsonResponse({ success: false, error: 'Failed to fetch user profile' }, 500);
		}

		if (!profile?.is_premium) {
			return jsonResponse(
				{
					error: 'Premium subscription required',
					message: 'AI отчеты доступны только для Premium подписки',
					upgrade_url: '/?view=settings#premium',
				},
				403
			);
		}

		const userLanguage: string = profile.language || 'ru';

		const url = new URL(req.url);
		const pathParts = url.pathname.split('/').filter(Boolean);
		const relevantParts = pathParts.filter((p) => !['functions', 'v1', 'reports'].includes(p));
		const endpoint = relevantParts.join('/');

		if (endpoint === 'health' && req.method === 'GET') {
			return jsonResponse({ success: true, status: 'healthy', service: 'reports' });
		}

		if (endpoint === 'generate' && req.method === 'POST') {
			const body = await req.json();
			const period: PeriodType = body.period === 'weekly' ? 'weekly' : 'monthly';
			const periodKeyInput: string | undefined = body.periodKey ?? undefined;
			const { periodKey, startDate, endDate, year, month } = getPeriodRange(period, periodKeyInput);

			const operationId = period === 'weekly' ? 'weekly_report' : 'monthly_report';
			const config = await getAiOperationConfig(supabaseAdmin as any, operationId);

			if (!isOperationAvailable(config)) {
				return jsonResponse(
					{
						success: false,
						error: 'AI operation disabled or not found',
						message: 'AI отчеты временно недоступны',
					},
					503
				);
			}

			const { data: dailyStats, error: dailyError } = await supabaseAdmin
				.from('user_stats_daily')
				.select('*')
				.eq('user_id', user.id)
				.gte('date', startDate)
				.lte('date', endDate)
				.order('date', { ascending: true });

			if (dailyError) {
				return jsonResponse({ success: false, error: 'Failed to load daily stats' }, 500);
			}

			let monthlyStat: any = null;
			if (period === 'monthly' && year && month) {
				const { data: m, error: mError } = await supabaseAdmin
					.from('user_stats_monthly')
					.select('*')
					.eq('user_id', user.id)
					.eq('year', year)
					.eq('month', month)
					.maybeSingle();
				if (mError) {
					return jsonResponse({ success: false, error: 'Failed to load monthly stats' }, 500);
				}
				monthlyStat = m;
			}

			const { data: achievementsData, error: achievementsError } = await supabaseAdmin
				.from('user_achievements')
				.select('achievement_id, earned_at, achievements_catalog(name, description, icon, rarity)')
				.eq('user_id', user.id)
				.gte('earned_at', `${startDate}T00:00:00Z`)
				.lte('earned_at', `${endDate}T23:59:59Z`);

			if (achievementsError) {
				return jsonResponse({ success: false, error: 'Failed to load achievements' }, 500);
			}

			const achievements = (achievementsData || []).map((a: any) => ({
				id: a.achievement_id,
				name: a.achievements_catalog?.name,
				description: a.achievements_catalog?.description,
				icon: a.achievements_catalog?.icon,
				rarity: a.achievements_catalog?.rarity,
				earned_at: a.earned_at,
			}));

			const entriesSummary = (dailyStats || []).map((d: any) => ({
				date: d.date,
				entries_count: d.entries_count,
				achievements_count: d.achievements_count,
				top_category: d.top_category,
			}));

			const categoriesCount: Record<string, number> = {};
			for (const d of dailyStats || []) {
				if (d.top_category) {
					categoriesCount[d.top_category] = (categoriesCount[d.top_category] || 0) + 1;
				}
			}

			const categories = Object.entries(categoriesCount).map(([name, count]) => ({ name, count }));

			const moodTrends = (dailyStats || []).map((d: any) => {
				const positive = d.positive_count ?? 0;
				const neutral = d.neutral_count ?? 0;
				const negative = d.negative_count ?? 0;
				const total = positive + neutral + negative || 1;
				const moodScore = (positive - negative) / total;
				return { date: d.date, positive, neutral, negative, mood_score: moodScore };
			});

			const totalEntries = (dailyStats || []).reduce(
				(sum: number, d: any) => sum + (d.entries_count ?? 0),
				0
			);

			const weeklySummaries: unknown[] = [];
			const statsSnapshot = {
				period,
				period_key: periodKey,
				start_date: startDate,
				end_date: endDate,
				total_entries: totalEntries,
				entries_summary: entriesSummary,
				categories,
				mood_trends: moodTrends,
				achievements,
				monthly: monthlyStat,
				weekly_summaries: weeklySummaries,
			};

			const variables: Record<string, string> = {
				user_language: userLanguage,
				total_entries: String(totalEntries),
				entries_summary_json: JSON.stringify(entriesSummary),
				achievements_json: JSON.stringify(achievements),
				categories_json: JSON.stringify(categories),
				mood_trends_json: JSON.stringify(moodTrends),
				weekly_summaries_json: JSON.stringify(weeklySummaries),
			};

			const systemPrompt = replacePlaceholders(config!.system_prompt, variables);
			const userPrompt = replacePlaceholders(config!.user_prompt_template, variables);

			const openaiApiKey = await resolveOpenAiKey(req, supabaseAdmin);
			if (!openaiApiKey) {
				return jsonResponse(
					{
						success: false,
						error: 'OpenAI API key not configured',
					},
					500
				);
			}

			const payload: any = {
				model: config!.model,
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt },
				],
				temperature: config!.temperature,
				max_tokens: config!.max_tokens,
			};

			const extra = (config!.extra_config || {}) as any;
			if (extra.response_format) {
				payload.response_format = extra.response_format;
			}

			const response = await fetch('https://api.openai.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${openaiApiKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorText = await response.text();
				return jsonResponse(
					{
						success: false,
						error: `OpenAI API failed: ${response.status}`,
						details: errorText,
					},
					400
				);
			}

			const result = await response.json();
			const aiResponse = result.choices?.[0]?.message?.content;
			if (!aiResponse) {
				return jsonResponse({ success: false, error: 'No response from AI' }, 500);
			}

			const usage = result.usage;
			if (usage) {
				const promptTokens = usage.prompt_tokens ?? 0;
				const completionTokens = usage.completion_tokens ?? 0;
				const totalTokens = usage.total_tokens ?? promptTokens + completionTokens;

				const modelPricing = { prompt: 0.15 / 1000000, completion: 0.6 / 1000000 };
				const estimatedCost =
					promptTokens * modelPricing.prompt + completionTokens * modelPricing.completion;

				await supabaseAdmin.from('openai_usage').insert({
					user_id: user.id,
					operation_type: period === 'weekly' ? 'weekly_report' : 'monthly_report',
					model: config!.model,
					prompt_tokens: promptTokens,
					completion_tokens: completionTokens,
					total_tokens: totalTokens,
					estimated_cost: estimatedCost,
				});
			}

			let parsed: any;
			try {
				parsed = JSON.parse(aiResponse);
			} catch {
				parsed = {
					title: period === 'weekly' ? 'Weekly report' : 'Monthly report',
					summary: aiResponse,
					insights: [],
				};
			}

			await supabaseAdmin.from('user_reports').upsert(
				{
					user_id: user.id,
					period_type: period,
					period_key: periodKey,
					language: userLanguage,
					is_premium: !!profile?.is_premium,
					stats: statsSnapshot,
					ai_summary: parsed.summary ?? '',
					ai_insights: parsed,
				},
				{ onConflict: 'user_id,period_type,period_key' }
			);

			return jsonResponse({
				success: true,
				period,
				periodKey,
				report: parsed,
				stats: statsSnapshot,
			});
		}

		return jsonResponse({ success: false, error: 'Unknown endpoint' }, 404);
	} catch (error: any) {
		console.error('[REPORTS] Error:', error);
		return jsonResponse({ success: false, error: error?.message ?? 'Unexpected error' }, 500);
	}
});
