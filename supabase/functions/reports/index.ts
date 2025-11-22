import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Inline AI Operation Config helpers (from _shared/ai/getAiOperationConfig.ts)
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

async function getAiOperationConfig(
	supabase: SupabaseClient,
	operationId: string
): Promise<AIOperationConfig | null> {
	try {
		const { data, error } = await supabase
			.from('ai_operations')
			.select('*')
			.eq('id', operationId)
			.single();

		if (error || !data) return null;
		return data as AIOperationConfig;
	} catch {
		return null;
	}
}

function replacePlaceholders(template: string, variables: Record<string, string>): string {
	let result = template;
	for (const [key, value] of Object.entries(variables)) {
		result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
	}
	return result;
}

function isOperationAvailable(config: AIOperationConfig | null): boolean {
	return config !== null && config.is_enabled === true;
}

const ALLOWED_ORIGINS = [
	'https://unity-wine.vercel.app',
	Deno.env.get('APP_URL') || '',
	Deno.env.get('ADMIN_URL') || '',
].filter(Boolean);

const isAllowedOrigin = (origin?: string | null) =>
	!origin ||
	ALLOWED_ORIGINS.includes(origin) ||
	origin.startsWith('http://localhost') ||
	origin.startsWith('https://localhost') ||
	origin.startsWith('http://127.0.0.1') ||
	origin.startsWith('https://127.0.0.1');

const corsHeaders = (origin?: string | null) => ({
	'Access-Control-Allow-Origin':
		origin && isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0] || 'null',
	'Access-Control-Allow-Headers':
		'authorization, x-client-info, apikey, content-type, x-openai-key',
});

type PeriodType = 'weekly' | 'monthly';

function jsonResponse(body: unknown, status = 200, origin?: string | null): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
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

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: reports edge function orchestrates multiple branches and IO operations
Deno.serve(async (req) => {
	const origin = req.headers.get('Origin') || undefined;
	if (origin && !isAllowedOrigin(origin)) {
		return jsonResponse({ success: false, error: 'Origin not allowed' }, 403, origin);
	}

	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders(origin) });
	}

	try {
		const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
		const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

		const authHeader = req.headers.get('Authorization');
		if (!authHeader) {
			return jsonResponse({ success: false, error: 'Missing authorization header' }, 401, origin);
		}

		const accessToken = authHeader.replace('Bearer ', '');
		const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

		const {
			data: { user },
			error: authError,
		} = await supabaseAdmin.auth.getUser(accessToken);

		if (authError || !user) {
			return jsonResponse({ success: false, error: 'Invalid access token' }, 401, origin);
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
					message: 'AI-отчеты доступны только в Premium-подписке.',
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

		console.log('[REPORTS] Request URL:', req.url);
		console.log('[REPORTS] Path parts:', pathParts);
		console.log('[REPORTS] Relevant parts:', relevantParts);
		console.log('[REPORTS] Endpoint:', endpoint);
		console.log('[REPORTS] Method:', req.method);

		if (endpoint === 'health' && req.method === 'GET') {
			return jsonResponse({ success: true, status: 'healthy', service: 'reports' });
		}

		if (endpoint === 'generate' && req.method === 'POST') {
			const body = await req.json();
			const period: PeriodType = body.period === 'weekly' ? 'weekly' : 'monthly';
			const periodKeyInput: string | undefined = body.periodKey ?? undefined;
			const { periodKey, startDate, endDate, year, month } = getPeriodRange(period, periodKeyInput);
			const forceRegenerate: boolean = Boolean(body.force_regenerate);

			if (!forceRegenerate) {
				const { data: existingReport, error: existingError } = await supabaseAdmin
					.from('user_reports')
					.select('ai_summary, ai_insights, stats')
					.eq('user_id', user.id)
					.eq('period_type', period)
					.eq('period_key', periodKey)
					.eq('language', userLanguage)
					.maybeSingle();

				if (!existingError && existingReport?.ai_insights) {
					return jsonResponse({
						success: true,
						period,
						periodKey,
						report: existingReport.ai_insights,
						stats: existingReport.stats,
						cached: true,
					});
				}
			}

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

			// Aggregated mood distribution for the whole period (server-side),
			// so UI and PDF отчеты могут использовать готовые проценты
			const moodTotals = moodTrends.reduce(
				(acc, item) => ({
					positive: acc.positive + item.positive,
					neutral: acc.neutral + item.neutral,
					negative: acc.negative + item.negative,
				}),
				{ positive: 0, neutral: 0, negative: 0 }
			);
			const moodTotalCount = moodTotals.positive + moodTotals.neutral + moodTotals.negative;
			const moodDistribution =
				moodTotalCount > 0
					? [
							{
								mood: '😊',
								label: 'positive',
								count: moodTotals.positive,
								percentage: Math.round((moodTotals.positive / moodTotalCount) * 100),
							},
							{
								mood: '😐',
								label: 'neutral',
								count: moodTotals.neutral,
								percentage: Math.round((moodTotals.neutral / moodTotalCount) * 100),
							},
							{
								mood: '☁️',
								label: 'negative',
								count: moodTotals.negative,
								percentage: Math.round((moodTotals.negative / moodTotalCount) * 100),
							},
						].filter((item) => item.count > 0)
					: [];

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
				mood_distribution: moodDistribution,
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

			if (!config) {
				return jsonResponse(
					{
						success: false,
						error: 'AI operation configuration not found',
					},
					500
				);
			}

			const systemPrompt = replacePlaceholders(config.system_prompt, variables);
			const userPrompt = replacePlaceholders(config.user_prompt_template, variables);

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
				model: config.model,
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt },
				],
				temperature: config.temperature,
				max_tokens: config.max_tokens,
			};

			const extra = (config.extra_config || {}) as any;
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
					operation_type: 'other',
					model: config?.model ?? 'gpt-4o-mini',
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

		// ✅ NEW: Export PDF endpoint
		if (endpoint === 'export-pdf' && req.method === 'POST') {
			const body = await req.json();
			const period: PeriodType = body.period === 'weekly' ? 'weekly' : 'monthly';
			const periodKeyInput: string | undefined = body.periodKey ?? undefined;
			const { periodKey } = getPeriodRange(period, periodKeyInput);

			// Load report from user_reports
			const { data: report, error: reportError } = await supabaseAdmin
				.from('user_reports')
				.select('*')
				.eq('user_id', user.id)
				.eq('period_type', period)
				.eq('period_key', periodKey)
				.eq('language', userLanguage)
				.single();

			if (reportError || !report) {
				return jsonResponse(
					{
						success: false,
						error: 'Report not found',
						message: 'Отчет не найден. Сначала создайте отчет.',
					},
					404
				);
			}

			// Return report data for PDF generation (client will generate PDF)
			// Structure matches PDFReportData type expectations
			return jsonResponse({
				success: true,
				report: {
					userName: profile?.name || 'User',
					userLanguage: userLanguage,
					isPremium: !!profile?.is_premium,
					periodType: period,
					periodKey,
					periodStart: report.stats?.start_date || '',
					periodEnd: report.stats?.end_date || '',
					stats: report.stats,
					aiSummary: report.ai_summary,
					aiInsights: report.ai_insights,
					reportId: report.id,
					pdfUrl: report.pdf_url,
				},
			});
		}

		// ✅ NEW: Save PDF URL endpoint
		if (endpoint === 'save-pdf' && req.method === 'POST') {
			const body = await req.json();
			const { reportId, pdfBlob } = body;

			if (!reportId || !pdfBlob) {
				return jsonResponse({ success: false, error: 'reportId and pdfBlob required' }, 400);
			}

			// Verify report belongs to user
			const { data: report, error: reportError } = await supabaseAdmin
				.from('user_reports')
				.select('id, user_id')
				.eq('id', reportId)
				.eq('user_id', user.id)
				.single();

			if (reportError || !report) {
				return jsonResponse({ success: false, error: 'Report not found' }, 404);
			}

			// Convert base64 to buffer
			const base64Data = pdfBlob.includes(',') ? pdfBlob.split(',')[1] : pdfBlob;
			const pdfBuffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

			// Upload to Storage
			const fileName = `${user.id}/${reportId}.pdf`;
			const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
				.from('reports')
				.upload(fileName, pdfBuffer, {
					contentType: 'application/pdf',
					upsert: true,
				});

			if (uploadError) {
				console.error('[REPORTS] PDF upload error:', uploadError);
				return jsonResponse({ success: false, error: 'Failed to upload PDF' }, 500);
			}

			// Get public URL
			const { data: urlData } = supabaseAdmin.storage.from('reports').getPublicUrl(fileName);
			const pdfUrl = urlData.publicUrl;

			// Update report with PDF URL
			const { error: updateError } = await supabaseAdmin
				.from('user_reports')
				.update({ pdf_url: pdfUrl })
				.eq('id', reportId);

			if (updateError) {
				console.error('[REPORTS] PDF URL update error:', updateError);
				return jsonResponse({ success: false, error: 'Failed to update PDF URL' }, 500);
			}

			return jsonResponse({
				success: true,
				pdfUrl,
				message: 'PDF сохранен успешно',
			});
		}

		return jsonResponse({ success: false, error: 'Unknown endpoint' }, 404);
	} catch (error: any) {
		console.error('[REPORTS] Error:', error);
		return jsonResponse({ success: false, error: error?.message ?? 'Unexpected error' }, 500);
	}
});
