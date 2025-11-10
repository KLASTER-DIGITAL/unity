/**
 * Admin Subscriptions API
 *
 * Provides subscription management for super admin panel.
 *
 * Endpoints:
 * - GET /subscriptions - List all subscriptions
 * - GET /subscriptions/:userId - Get user subscriptions
 * - POST /subscriptions - Create new subscription
 * - PUT /subscriptions/:id - Update subscription
 * - DELETE /subscriptions/:id - Delete subscription
 *
 * @author UNITY Team
 * @date 2025-11-07
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// EMBEDDED UTILITY: Super Admin Auth Middleware
// ============================================
async function verifySuperAdmin(req: Request) {
	const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
	const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

	// Get access token from Authorization header
	const authHeader = req.headers.get('Authorization');
	if (!authHeader) {
		return {
			error: new Response(
				JSON.stringify({
					success: false,
					error: 'Missing authorization header',
				}),
				{
					status: 401,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			),
		};
	}

	const token = authHeader.replace('Bearer ', '');

	// Create Supabase admin client
	const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

	// Verify JWT token
	const {
		data: { user },
		error: authError,
	} = await supabaseAdmin.auth.getUser(token);

	if (authError || !user) {
		console.log('[AUTH] Invalid token:', authError?.message);
		return {
			error: new Response(
				JSON.stringify({
					success: false,
					error: 'Invalid access token',
				}),
				{
					status: 401,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			),
		};
	}

	console.log('[AUTH] User authenticated:', user.email);

	// Check if user is super admin
	const { data: profile, error: profileError } = await supabaseAdmin
		.from('profiles')
		.select('role')
		.eq('id', user.id)
		.single();

	if (profileError || !profile) {
		console.log('[AUTH] Profile not found:', profileError?.message);
		return {
			error: new Response(
				JSON.stringify({
					success: false,
					error: 'Profile not found',
				}),
				{
					status: 404,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			),
		};
	}

	console.log('[AUTH] Profile role:', profile.role);

	if (profile.role !== 'super_admin') {
		console.log('[AUTH] Access denied - user is not super admin');
		return {
			error: new Response(
				JSON.stringify({
					success: false,
					error: 'Forbidden: Super admin access required',
				}),
				{
					status: 403,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			),
		};
	}

	console.log('[AUTH] ✅ Super admin verified:', user.email);

	return { supabaseAdmin, user };
}

// ============================================
// MAIN HANDLER: Admin Subscriptions API
// ============================================
Deno.serve(async (req) => {
	// Handle CORS preflight requests
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		// Verify super admin
		const authResult = await verifySuperAdmin(req);
		if (authResult.error) {
			return authResult.error;
		}

		const { supabaseAdmin, user } = authResult;

		// Parse URL path
		const url = new URL(req.url);
		const pathParts = url.pathname.split('/').filter((p) => p);
		const relevantParts = pathParts.filter(
			(p) => !['functions', 'v1', 'admin-subscriptions-api'].includes(p)
		);
		const endpoint = relevantParts.join('/') || 'subscriptions';

		console.log('[ADMIN-SUBSCRIPTIONS] Request:', req.method, endpoint);

		// Route: GET /subscriptions - List all subscriptions
		if (endpoint === 'subscriptions' && req.method === 'GET') {
			const { data, error } = await supabaseAdmin
				.from('subscriptions')
				.select('*, profiles!subscriptions_user_id_fkey(id, name, email)')
				.order('created_at', { ascending: false });

			if (error) throw error;

			return new Response(JSON.stringify({ success: true, subscriptions: data || [] }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Route: GET /subscriptions/:userId - Get user subscriptions
		if (endpoint.startsWith('subscriptions/') && req.method === 'GET') {
			const userId = relevantParts[1];

			const { data, error } = await supabaseAdmin
				.from('subscriptions')
				.select('*')
				.eq('user_id', userId)
				.order('created_at', { ascending: false });

			if (error) throw error;

			return new Response(JSON.stringify({ success: true, subscriptions: data || [] }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Route: POST /subscriptions - Create new subscription
		if (endpoint === 'subscriptions' && req.method === 'POST') {
			const body = await req.json();
			const {
				userId,
				planType,
				status = 'active',
				startDate,
				endDate,
				autoRenew = true,
				paymentMethod = 'manual',
				amount,
				currency = 'USD',
				metadata = {},
			} = body;

			// Validate required fields
			if (!userId || !planType) {
				return new Response(
					JSON.stringify({
						success: false,
						error: 'Missing required fields: userId, planType',
					}),
					{
						status: 400,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					}
				);
			}

			// Insert subscription
			const { data, error } = await supabaseAdmin
				.from('subscriptions')
				.insert({
					user_id: userId,
					plan_type: planType,
					status,
					start_date: startDate || new Date().toISOString(),
					end_date: endDate,
					auto_renew: autoRenew,
					payment_method: paymentMethod,
					amount,
					currency,
					metadata,
					created_by: user.id,
					updated_by: user.id,
				})
				.select()
				.single();

			if (error) throw error;

			// Update user's is_premium field
			if (status === 'active') {
				await supabaseAdmin.from('profiles').update({ is_premium: true }).eq('id', userId);

				// ✅ REAL-TIME UPDATE: Supabase Realtime автоматически отправит UPDATE event
				// PWA подписан на изменения profiles таблицы и покажет PremiumActivatedModal
				console.log('[ADMIN-SUBSCRIPTIONS] ✅ Premium activated for user:', userId);
				console.log(
					'[ADMIN-SUBSCRIPTIONS] 📡 Real-time update will trigger PremiumActivatedModal in PWA'
				);
			}

			console.log('[ADMIN-SUBSCRIPTIONS] ✅ Subscription created:', data.id);

			return new Response(JSON.stringify({ success: true, subscription: data }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Route: PUT /subscriptions/:id - Update subscription
		if (endpoint.startsWith('subscriptions/') && req.method === 'PUT') {
			const subscriptionId = relevantParts[1];
			const body = await req.json();

			const { data, error } = await supabaseAdmin
				.from('subscriptions')
				.update({
					...body,
					updated_by: user.id,
				})
				.eq('id', subscriptionId)
				.select()
				.single();

			if (error) throw error;

			// Update user's is_premium field based on status
			if (body.status) {
				const isPremium = body.status === 'active';
				await supabaseAdmin
					.from('profiles')
					.update({ is_premium: isPremium })
					.eq('id', data.user_id);
			}

			console.log('[ADMIN-SUBSCRIPTIONS] ✅ Subscription updated:', subscriptionId);

			return new Response(JSON.stringify({ success: true, subscription: data }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Route: DELETE /subscriptions/:id - Delete subscription
		if (endpoint.startsWith('subscriptions/') && req.method === 'DELETE') {
			const subscriptionId = relevantParts[1];

			// Get subscription to update user's is_premium
			const { data: subscription } = await supabaseAdmin
				.from('subscriptions')
				.select('user_id')
				.eq('id', subscriptionId)
				.single();

			const { error } = await supabaseAdmin.from('subscriptions').delete().eq('id', subscriptionId);

			if (error) throw error;

			// Update user's is_premium field
			if (subscription) {
				await supabaseAdmin
					.from('profiles')
					.update({ is_premium: false })
					.eq('id', subscription.user_id);
			}

			console.log('[ADMIN-SUBSCRIPTIONS] ✅ Subscription deleted:', subscriptionId);

			return new Response(JSON.stringify({ success: true }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Unknown endpoint
		return new Response(
			JSON.stringify({
				success: false,
				error: `Unknown endpoint: ${endpoint}`,
			}),
			{
				status: 404,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		);
	} catch (error) {
		console.error('[ADMIN-SUBSCRIPTIONS] ❌ Error:', error);
		return new Response(JSON.stringify({ success: false, error: error.message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});
