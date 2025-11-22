/**
 * Entry Summaries Generate API
 *
 * Generates AI summaries for entries to optimize token usage (90% savings).
 *
 * Endpoint:
 * - POST /entry-summaries-generate - Generate summaries for entries
 *
 * Request body:
 * {
 *   entryIds?: string[], // Optional: specific entries to process
 *   userId?: string,     // Optional: process all entries for user
 *   periodStart?: string, // Optional: start date
 *   periodEnd?: string,   // Optional: end date
 * }
 *
 * @author UNITY Team
 * @date 2025-11-22
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getOpenAIKey(supabaseAdmin: any): Promise<string | null> {
	const { data: setting } = await supabaseAdmin
		.from('admin_settings')
		.select('value')
		.eq('key', 'openai_api_key')
		.single();

	if (setting?.value) return setting.value;

	const envKey = Deno.env.get('OPENAI_API_KEY');
	return envKey || null;
}

async function generateSummary(
	entry: any,
	userLanguage: string,
	openaiApiKey: string
): Promise<{
	short_summary: string;
	insight: string;
	mood: string;
	topics: string[];
	persons: string[];
	has_achievement: boolean;
	excerpt: string;
	tokens_used: number;
} | null> {
	try {
		const systemPrompt = `You are an AI assistant that creates concise summaries of diary entries.
Your task is to extract key information from the entry and create a structured summary.

IMPORTANT: Write the entire response in the user's language: ${userLanguage}

Return a JSON object with:
- short_summary: Brief summary (max 50 words)
- insight: Key insight or reflection (max 30 words)
- mood: Emotional state (one word: positive, neutral, negative, mixed)
- topics: Array of main topics (max 5)
- persons: Array of people mentioned (max 5)
- has_achievement: Boolean indicating if this is an achievement
- excerpt: Short memorable quote or phrase (max 20 words)

Keep summaries concise to save tokens.`;

		const userPrompt = `Entry text: "${entry.text}"

Create a structured summary for this entry.`;

		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${openaiApiKey}`,
			},
			body: JSON.stringify({
				model: 'gpt-4o-mini',
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt },
				],
				temperature: 0.3,
				max_tokens: 300,
			}),
		});

		if (!response.ok) {
			const error = await response.text();
			console.error('[ENTRY-SUMMARIES] OpenAI API error:', error);
			return null;
		}

		const data = await response.json();
		const content = data.choices[0]?.message?.content;

		if (!content) {
			console.error('[ENTRY-SUMMARIES] No content in OpenAI response');
			return null;
		}

		// Parse JSON response
		let summaryData: any;
		try {
			summaryData = JSON.parse(content);
		} catch {
			// Fallback if not JSON
			summaryData = {
				short_summary: content.substring(0, 200),
				insight: '',
				mood: 'neutral',
				topics: [],
				persons: [],
				has_achievement: entry.is_achievement || false,
				excerpt: entry.text.substring(0, 100),
			};
		}

		return {
			short_summary: summaryData.short_summary || entry.text.substring(0, 200),
			insight: summaryData.insight || '',
			mood: summaryData.mood || 'neutral',
			topics: Array.isArray(summaryData.topics) ? summaryData.topics : [],
			persons: Array.isArray(summaryData.persons) ? summaryData.persons : [],
			has_achievement: summaryData.has_achievement ?? entry.is_achievement ?? false,
			excerpt: summaryData.excerpt || entry.text.substring(0, 100),
			tokens_used: data.usage?.total_tokens || 0,
		};
	} catch (error) {
		console.error('[ENTRY-SUMMARIES] Error generating summary:', error);
		return null;
	}
}

Deno.serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
		const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
		const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

		// Get authorization (optional - can be called internally)
		const authHeader = req.headers.get('Authorization');
		let userId: string | null = null;

		if (authHeader) {
			const token = authHeader.replace('Bearer ', '');
			const {
				data: { user },
			} = await supabaseAdmin.auth.getUser(token);
			userId = user?.id || null;
		}

		const body = await req.json();
		const { entryIds, userId: bodyUserId, periodStart, periodEnd } = body;

		// Determine target user
		const targetUserId = bodyUserId || userId;
		if (!targetUserId && !entryIds) {
			return new Response(
				JSON.stringify({ success: false, error: 'userId or entryIds required' }),
				{ status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		// Get OpenAI API key
		const openaiApiKey = await getOpenAIKey(supabaseAdmin);
		if (!openaiApiKey) {
			return new Response(
				JSON.stringify({ success: false, error: 'OpenAI API key not configured' }),
				{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		// Fetch entries to process
		let query = supabaseAdmin.from('entries').select('*');

		if (entryIds && Array.isArray(entryIds) && entryIds.length > 0) {
			query = query.in('id', entryIds);
		} else if (targetUserId) {
			query = query.eq('user_id', targetUserId);
			if (periodStart) query = query.gte('created_at', periodStart);
			if (periodEnd) query = query.lte('created_at', periodEnd);
		} else {
			return new Response(
				JSON.stringify({ success: false, error: 'entryIds or userId required' }),
				{ status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		// Exclude entries that already have summaries
		const { data: entries, error: entriesError } = await query
			.order('created_at', { ascending: true })
			.limit(100); // Process max 100 at a time

		if (entriesError) {
			console.error('[ENTRY-SUMMARIES] Error fetching entries:', entriesError);
			return new Response(JSON.stringify({ success: false, error: 'Failed to fetch entries' }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		if (!entries || entries.length === 0) {
			return new Response(
				JSON.stringify({ success: true, message: 'No entries to process', processed: 0 }),
				{ status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		// Get user language
		const userLanguage = entries[0]?.user_id
			? (
					await supabaseAdmin
						.from('profiles')
						.select('language')
						.eq('id', entries[0].user_id)
						.single()
				).data?.language || 'ru'
			: 'ru';

		// Filter out entries that already have summaries
		const { data: existingSummaries } = await supabaseAdmin
			.from('entry_summaries')
			.select('entry_id')
			.in(
				'entry_id',
				entries.map((e) => e.id)
			);

		const existingEntryIds = new Set(existingSummaries?.map((s) => s.entry_id) || []);
		const entriesToProcess = entries.filter((e) => !existingEntryIds.has(e.id));

		if (entriesToProcess.length === 0) {
			return new Response(
				JSON.stringify({
					success: true,
					message: 'All entries already have summaries',
					processed: 0,
					skipped: entries.length,
				}),
				{ status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		console.log(
			`[ENTRY-SUMMARIES] Processing ${entriesToProcess.length} entries (${entries.length - entriesToProcess.length} already have summaries)`
		);

		// Process entries (limit to 50 for rate limiting)
		const entriesBatch = entriesToProcess.slice(0, 50);
		const results = {
			processed: 0,
			failed: 0,
			skipped: entries.length - entriesToProcess.length,
		};

		for (const entry of entriesBatch) {
			try {
				const summary = await generateSummary(entry, userLanguage, openaiApiKey);

				if (!summary) {
					results.failed++;
					continue;
				}

				// Save summary to database
				const { error: insertError } = await supabaseAdmin.from('entry_summaries').insert({
					entry_id: entry.id,
					user_id: entry.user_id,
					summary_json: {
						short_summary: summary.short_summary,
						insight: summary.insight,
						mood: summary.mood,
						topics: summary.topics,
						persons: summary.persons,
						has_achievement: summary.has_achievement,
						excerpt: summary.excerpt,
					},
					tokens_used: summary.tokens_used,
				});

				if (insertError) {
					console.error(
						`[ENTRY-SUMMARIES] Error saving summary for entry ${entry.id}:`,
						insertError
					);
					results.failed++;
				} else {
					results.processed++;
				}

				// Rate limiting: wait 100ms between requests
				await new Promise((resolve) => setTimeout(resolve, 100));
			} catch (error) {
				console.error(`[ENTRY-SUMMARIES] Error processing entry ${entry.id}:`, error);
				results.failed++;
			}
		}

		return new Response(
			JSON.stringify({
				success: true,
				...results,
				total: entries.length,
			}),
			{ status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		);
	} catch (error: any) {
		console.error('[ENTRY-SUMMARIES] Error:', error);
		return new Response(
			JSON.stringify({
				success: false,
				error: error?.message || 'Unknown error',
			}),
			{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		);
	}
});
