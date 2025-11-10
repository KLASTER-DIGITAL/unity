/**
 * Push Segments API Edge Function
 *
 * CRUD операции для управления сегментами пользователей:
 * - GET /push-segments-api - получить все сегменты
 * - POST /push-segments-api - создать новый сегмент
 * - PUT /push-segments-api/:id - обновить сегмент
 * - DELETE /push-segments-api/:id - удалить сегмент
 * - POST /push-segments-api/calculate - рассчитать количество пользователей в сегменте
 *
 * Только для super_admin
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

/**
 * Проверяет что пользователь - super_admin
 */
async function verifySuperAdmin(authHeader: string | null): Promise<string> {
	if (!authHeader) {
		throw new Error('Missing authorization header');
	}

	const supabase = createClient(supabaseUrl, supabaseServiceKey, {
		global: { headers: { Authorization: authHeader } },
	});

	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		throw new Error('Unauthorized');
	}

	const { data: profile, error: profileError } = await supabase
		.from('profiles')
		.select('role')
		.eq('id', user.id)
		.single();

	if (profileError || profile?.role !== 'super_admin') {
		throw new Error('Forbidden: super_admin only');
	}

	return user.id;
}

/**
 * Рассчитывает количество пользователей в сегменте
 */
async function calculateSegmentSize(criteria: Record<string, unknown>): Promise<number> {
	const supabase = createClient(supabaseUrl, supabaseServiceKey);

	let query = supabase.from('profiles').select('id', { count: 'exact', head: true });

	// Apply criteria filters
	if (criteria.is_premium !== undefined) {
		query = query.eq('is_premium', criteria.is_premium);
	}

	if (criteria.language) {
		query = query.eq('language', criteria.language);
	}

	if (criteria.last_active_days) {
		const daysAgo = new Date();
		daysAgo.setDate(daysAgo.getDate() - Number(criteria.last_active_days));
		query = query.gte('last_login_at', daysAgo.toISOString());
	}

	if (criteria.registered_within_days) {
		const daysAgo = new Date();
		daysAgo.setDate(daysAgo.getDate() - Number(criteria.registered_within_days));
		query = query.gte('created_at', daysAgo.toISOString());
	}

	const { count, error } = await query;

	if (error) {
		console.error('[SEGMENTS] Error calculating size:', error);
		return 0;
	}

	return count || 0;
}

// Main handler
Deno.serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		const userId = await verifySuperAdmin(req.headers.get('Authorization'));
		const supabase = createClient(supabaseUrl, supabaseServiceKey);
		const url = new URL(req.url);
		const pathParts = url.pathname.split('/').filter(Boolean);

		// GET /push-segments-api - получить все сегменты
		if (req.method === 'GET' && pathParts.length === 1) {
			const { data, error } = await supabase
				.from('push_campaign_segments')
				.select('*')
				.order('created_at', { ascending: false });

			if (error) throw error;

			return new Response(JSON.stringify({ segments: data }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// POST /push-segments-api - создать сегмент
		if (req.method === 'POST' && pathParts.length === 1) {
			const body = await req.json();
			const { name, description, criteria } = body;

			if (!name || !criteria) {
				throw new Error('Missing required fields: name, criteria');
			}

			// Calculate user count
			const userCount = await calculateSegmentSize(criteria);

			const { data, error } = await supabase
				.from('push_campaign_segments')
				.insert({
					name,
					description,
					criteria,
					user_count: userCount,
					last_calculated_at: new Date().toISOString(),
					created_by: userId,
					updated_by: userId,
				})
				.select()
				.single();

			if (error) throw error;

			return new Response(JSON.stringify({ segment: data }), {
				status: 201,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// PUT /push-segments-api/:id - обновить сегмент
		if (req.method === 'PUT' && pathParts.length === 2) {
			const segmentId = pathParts[1];
			const body = await req.json();
			const { name, description, criteria } = body;

			// Recalculate user count if criteria changed
			let userCount: number | undefined;
			if (criteria) {
				userCount = await calculateSegmentSize(criteria);
			}

			const updateData: Record<string, unknown> = {
				updated_by: userId,
			};

			if (name) updateData.name = name;
			if (description !== undefined) updateData.description = description;
			if (criteria) {
				updateData.criteria = criteria;
				updateData.user_count = userCount;
				updateData.last_calculated_at = new Date().toISOString();
			}

			const { data, error } = await supabase
				.from('push_campaign_segments')
				.update(updateData)
				.eq('id', segmentId)
				.select()
				.single();

			if (error) throw error;

			return new Response(JSON.stringify({ segment: data }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// DELETE /push-segments-api/:id - удалить сегмент
		if (req.method === 'DELETE' && pathParts.length === 2) {
			const segmentId = pathParts[1];

			const { error } = await supabase.from('push_campaign_segments').delete().eq('id', segmentId);

			if (error) throw error;

			return new Response(JSON.stringify({ success: true }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// POST /push-segments-api/calculate - рассчитать количество пользователей
		if (req.method === 'POST' && pathParts[1] === 'calculate') {
			const body = await req.json();
			const { criteria } = body;

			if (!criteria) {
				throw new Error('Missing required field: criteria');
			}

			const userCount = await calculateSegmentSize(criteria);

			return new Response(JSON.stringify({ user_count: userCount }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		throw new Error('Not found');
	} catch (error) {
		console.error('[SEGMENTS] Error:', error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: error.message.includes('Forbidden') ? 403 : 400,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});
