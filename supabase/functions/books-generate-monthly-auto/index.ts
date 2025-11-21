/**
 * Books Generate Monthly Auto API
 *
 * Cron-triggered function to generate monthly books for Premium users.
 *
 * Logic:
 * 1. Identify previous month period (e.g. 2025-10-01 to 2025-10-31)
 * 2. Fetch Premium users
 * 3. Check if book already exists for this period
 * 4. Trigger generation via books-generate-draft
 * 5. Send Push Notification
 *
 * @author UNITY Team
 * @date 2025-11-21
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

		// 1. Calculate period (Previous Month)
		const now = new Date();
		// Get first day of previous month
		const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		// Get last day of previous month
		const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0);

		const startStr = periodStart.toISOString().split('T')[0];
		const endStr = periodEnd.toISOString().split('T')[0];

		console.log(`[AUTO-BOOKS] Starting generation for period: ${startStr} to ${endStr}`);

		// 2. Fetch Premium Users
		// TODO: Add pagination if user base grows large
		const { data: users, error: usersError } = await supabaseAdmin
			.from('profiles')
			.select('id, language, diary_name, diary_emoji')
			.eq('is_premium', true);

		if (usersError) {
			throw new Error(`Failed to fetch users: ${usersError.message}`);
		}

		console.log(`[AUTO-BOOKS] Found ${users.length} premium users`);

		const results = {
			total: users.length,
			generated: 0,
			skipped: 0,
			errors: 0,
		};

		// 3. Process each user
		for (const user of users) {
			try {
				// Check if book exists
				const { count } = await supabaseAdmin
					.from('books_archive')
					.select('id', { count: 'exact', head: true })
					.eq('user_id', user.id)
					.gte('period_start', startStr)
					.lte('period_end', endStr);

				if (count && count > 0) {
					console.log(`[AUTO-BOOKS] User ${user.id} already has a book for this period. Skipping.`);
					results.skipped++;
					continue;
				}

				// Check if user has enough entries (min 5)
				const { count: entriesCount } = await supabaseAdmin
					.from('entries')
					.select('id', { count: 'exact', head: true })
					.eq('user_id', user.id)
					.gte('created_at', startStr)
					.lte('created_at', endStr);

				if (!entriesCount || entriesCount < 5) {
					console.log(`[AUTO-BOOKS] User ${user.id} has only ${entriesCount} entries. Skipping.`);
					results.skipped++;
					continue;
				}

				// Trigger generation
				console.log(`[AUTO-BOOKS] Generating book for user ${user.id}...`);

				const generateRes = await fetch(`${supabaseUrl}/functions/v1/books-generate-draft`, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${supabaseServiceKey}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						userId: user.id,
						periodStart: startStr,
						periodEnd: endStr,
						contexts: [], // All contexts
						style: 'warm_family', // Default style
						layout: 'photo_text', // Default layout
						theme: 'light',
						diaryName: user.diary_name,
						diaryEmoji: user.diary_emoji,
						regenerate: true, // Force new draft
					}),
				});

				if (!generateRes.ok) {
					const errText = await generateRes.text();
					throw new Error(`Generation API failed: ${generateRes.status} - ${errText}`);
				}

				const genData = await generateRes.json();
				if (!genData.success) {
					throw new Error(genData.error || 'Unknown generation error');
				}

				results.generated++;

				// Send Push Notification
				// TODO: Implement push notification call
				// await sendPush(user.id, "Твоя книга за месяц готова! 📖", "Зайди, чтобы посмотреть и отредактировать.");

				console.log(`[AUTO-BOOKS] Success for user ${user.id}`);
			} catch (err) {
				console.error(`[AUTO-BOOKS] Error processing user ${user.id}:`, err);
				results.errors++;
			}
		}

		return new Response(JSON.stringify({ success: true, results }), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('[AUTO-BOOKS] Critical error:', error);
		return new Response(JSON.stringify({ success: false, error: error.message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});
