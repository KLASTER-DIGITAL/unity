/**
 * Books Generate Quarter API
 *
 * Generates quarterly book (3 months) using entry_summaries and monthly_snapshots.
 *
 * Endpoint:
 * - POST /books-generate-quarter - Generate quarterly book
 *
 * Request body:
 * {
 *   userId: string,
 *   periodStart: string (YYYY-MM-DD),
 *   periodEnd: string (YYYY-MM-DD),
 *   contexts?: string[],
 *   style: 'warm_family' | 'biographical' | 'motivational',
 *   layout: 'photo_text' | 'text_only' | 'minimal',
 *   theme: 'light' | 'dark',
 *   language?: string,
 *   diaryName?: string,
 *   diaryEmoji?: string
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

Deno.serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
		const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
		const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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

		const body = await req.json();
		const {
			userId,
			periodStart,
			periodEnd,
			contexts = [],
			style = 'warm_family',
			layout = 'photo_text',
			theme = 'light',
			language,
			diaryName,
			diaryEmoji,
		} = body;

		if (!userId || !periodStart || !periodEnd) {
			return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Get user profile for language
		const { data: profile } = await supabaseAdmin
			.from('profiles')
			.select('language, diary_name, diary_emoji, is_premium')
			.eq('id', userId)
			.single();

		const userLanguage = language || profile?.language || 'ru';
		const finalDiaryName = diaryName || profile?.diary_name || 'Мой дневник';
		const finalDiaryEmoji = diaryEmoji || profile?.diary_emoji || '📖';

		// ✅ Use books-generate-draft with type='quarter'
		// This reuses all the optimization logic (entry_summaries, snapshots, caching)
		const draftResponse = await fetch(`${supabaseUrl}/functions/v1/books-generate-draft`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				userId,
				periodStart,
				periodEnd,
				contexts,
				style,
				layout,
				theme,
				plan_type: 'premium', // Quarterly books are Premium only
				type: 'quarter',
				language: userLanguage,
				diaryName: finalDiaryName,
				diaryEmoji: finalDiaryEmoji,
				regenerate: false,
			}),
		});

		const draftResult = await draftResponse.json();

		if (!draftResult.success) {
			return new Response(
				JSON.stringify({ success: false, error: draftResult.error || 'Failed to generate book' }),
				{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		return new Response(
			JSON.stringify({
				success: true,
				draftId: draftResult.draftId,
			}),
			{ status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		);
		// biome-ignore lint/suspicious/noExplicitAny: Deno error types are unknown
	} catch (error: any) {
		console.error('[BOOKS-GENERATE-QUARTER] Error:', error);
		return new Response(
			JSON.stringify({
				success: false,
				error: error?.message || 'Unknown error',
			}),
			{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		);
	}
});
