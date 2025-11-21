import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
	'Access-Control-Max-Age': '86400', // 24 hours
};

interface TranslationRequest {
	sourceLanguage: string;
	targetLanguages: string[];
	translationKeys?: string[]; // Optional: specific keys to translate
}

interface TranslationResult {
	key: string;
	language: string;
	originalText: string;
	translatedText: string;
	confidence: number;
	needsReview: boolean;
}

Deno.serve(async (req) => {
	// Handle CORS preflight requests
	if (req.method === 'OPTIONS') {
		return new Response(null, { headers: corsHeaders });
	}

	try {
		// Get JWT token from Authorization header
		const authHeader = req.headers.get('Authorization');
		if (!authHeader) {
			return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
				status: 401,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		const token = authHeader.replace('Bearer ', '');

		// Create Supabase client with service role key for admin operations
		const supabaseClient = createClient(
			Deno.env.get('SUPABASE_URL') ?? '',
			Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
			{
				global: {
					headers: { Authorization: authHeader },
				},
			}
		);

		// Verify user from JWT token
		const {
			data: { user },
			error: authError,
		} = await supabaseClient.auth.getUser(token);

		console.log('🔍 Auth check:', { user: user?.id, authError });

		if (authError || !user) {
			console.error('❌ Auth failed:', authError);
			return new Response(
				JSON.stringify({
					error: 'Unauthorized',
					details: authError?.message || 'No user found',
				}),
				{
					status: 401,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			);
		}

		const { data: profile } = await supabaseClient
			.from('profiles')
			.select('role')
			.eq('id', user.id)
			.single();

		if (profile?.role !== 'super_admin') {
			return new Response(JSON.stringify({ error: 'Access denied. Super admin only.' }), {
				status: 403,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Get OpenAI API key from api_services
		const { data: apiService, error: apiServiceError } = await supabaseClient
			.from('api_services')
			.select('api_key, is_active')
			.eq('name', 'openai')
			.single();

		console.log('🔑 API Service check:', { apiService, apiServiceError });

		if (apiServiceError || !apiService) {
			return new Response(
				JSON.stringify({
					error: 'OpenAI API service not found',
					details: apiServiceError?.message,
				}),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			);
		}

		if (!apiService.is_active) {
			return new Response(
				JSON.stringify({
					error: 'OpenAI API service is not active',
				}),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			);
		}

		if (!apiService.api_key) {
			return new Response(
				JSON.stringify({
					error: 'OpenAI API key not configured',
				}),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			);
		}

		const body: TranslationRequest = await req.json();
		const { sourceLanguage, targetLanguages, translationKeys } = body;

		if (!(sourceLanguage && targetLanguages) || targetLanguages.length === 0) {
			return new Response(
				JSON.stringify({
					error: 'Missing required fields: sourceLanguage, targetLanguages',
				}),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			);
		}

		// Get source translations
		let query = supabaseClient
			.from('translations')
			.select('translation_key, translation_value')
			.eq('lang_code', sourceLanguage);

		if (translationKeys && translationKeys.length > 0) {
			query = query.in('translation_key', translationKeys);
		}

		const { data: sourceTranslations, error: sourceError } = await query;

		if (sourceError) throw sourceError;

		if (!sourceTranslations || sourceTranslations.length === 0) {
			return new Response(JSON.stringify({ error: 'No source translations found' }), {
				status: 404,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Process translations in batches
		const results: TranslationResult[] = [];
		const batchSize = 10; // Translate 10 keys at a time
		let totalCost = 0;

		for (let i = 0; i < sourceTranslations.length; i += batchSize) {
			const batch = sourceTranslations.slice(i, i + batchSize);

			for (const targetLang of targetLanguages) {
				// Check if translation already exists
				const { data: existing } = await supabaseClient
					.from('translations')
					.select('translation_key')
					.eq('lang_code', targetLang)
					.in(
						'translation_key',
						batch.map((t) => t.translation_key)
					);

				const existingKeys = new Set(existing?.map((e) => e.translation_key) || []);
				const toTranslate = batch.filter((t) => !existingKeys.has(t.translation_key));

				if (toTranslate.length === 0) continue;

				// Prepare batch for OpenAI
				const translationMap = toTranslate.reduce(
					(acc, t) => {
						acc[t.translation_key] = t.translation_value;
						return acc;
					},
					{} as Record<string, string>
				);

				// Call OpenAI API
				const prompt = `You are a professional translator. Translate the following key-value pairs from ${sourceLanguage} to ${targetLang}. 
Maintain the same keys and only translate the values. Return a JSON object with the same structure.
Preserve any special characters, emojis, and formatting.

Input:
${JSON.stringify(translationMap, null, 2)}

Output (JSON only, no explanations):`;

				const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${apiService.api_key}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						model: 'gpt-4o-mini',
						messages: [
							{
								role: 'system',
								content: 'You are a professional translator. Always respond with valid JSON only.',
							},
							{ role: 'user', content: prompt },
						],
						temperature: 0.3,
						max_tokens: 2000,
					}),
				});

				if (!openaiResponse.ok) {
					const error = await openaiResponse.text();
					console.error('OpenAI API error:', error);
					continue;
				}

				const openaiData = await openaiResponse.json();
				const translatedText = openaiData.choices[0]?.message?.content;

				// Calculate cost
				const promptTokens = openaiData.usage?.prompt_tokens || 0;
				const completionTokens = openaiData.usage?.completion_tokens || 0;
				const cost = (promptTokens * 0.000_15 + completionTokens * 0.0006) / 1000; // gpt-4o-mini pricing
				totalCost += cost;

				// Parse translated JSON
				let translated: Record<string, string>;
				try {
					// Remove markdown code blocks if present
					const cleanedText = translatedText
						.replace(/```json\n?/g, '')
						.replace(/```\n?/g, '')
						.trim();
					translated = JSON.parse(cleanedText);
				} catch (_parseError) {
					console.error('Failed to parse OpenAI response:', translatedText);
					continue;
				}

				// Save translations to database
				const translationsToInsert = Object.entries(translated).map(([key, value]) => ({
					translation_key: key,
					lang_code: targetLang,
					translation_value: value,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				}));

				const { error: insertError } = await supabaseClient
					.from('translations')
					.upsert(translationsToInsert, {
						onConflict: 'translation_key,lang_code',
					});

				if (insertError) {
					console.error('Error inserting translations:', insertError);
					continue;
				}

				// Add to results
				Object.entries(translated).forEach(([key, value]) => {
					results.push({
						key,
						language: targetLang,
						originalText: translationMap[key],
						translatedText: value,
						confidence: 0.9, // High confidence for GPT-4o-mini
						needsReview: false,
					});
				});
			}
		}

		// Log usage to openai_usage table
		const { error: usageError } = await supabaseClient.from('openai_usage').insert({
			user_id: user.id,
			feature: 'auto-translate',
			model: 'gpt-4o-mini',
			prompt_tokens: 0, // Aggregate if needed
			completion_tokens: 0,
			total_cost: totalCost,
			created_at: new Date().toISOString(),
		});

		if (usageError) {
			console.error('Error logging usage:', usageError);
		}

		return new Response(
			JSON.stringify({
				success: true,
				results,
				totalTranslated: results.length,
				totalCost: totalCost.toFixed(4),
				message: `Successfully translated ${results.length} keys to ${targetLanguages.length} language(s)`,
			}),
			{ headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		);
	} catch (error) {
		console.error('Error:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return new Response(JSON.stringify({ error: errorMessage }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});
