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

	const accessToken = authHeader.replace('Bearer ', '');

	// Create Supabase admin client (bypasses RLS)
	const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

	// Verify user JWT token
	const {
		data: { user },
		error: authError,
	} = await supabaseAdmin.auth.getUser(accessToken);
	if (authError || !user) {
		console.error('[AUTH] User verification failed:', authError);
		return {
			error: new Response(JSON.stringify({ success: false, error: 'Invalid access token' }), {
				status: 401,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}),
		};
	}

	console.log('[AUTH] User verified:', user.id, user.email);

	// Check if user is super admin using service role (bypasses RLS)
	const { data: profile, error: profileError } = await supabaseAdmin
		.from('profiles')
		.select('role')
		.eq('id', user.id)
		.single();

	if (profileError || !profile) {
		console.error('[AUTH] Error fetching profile:', profileError);
		return {
			error: new Response(
				JSON.stringify({
					success: false,
					error: 'Failed to verify admin role',
				}),
				{
					status: 403,
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
// MAIN HANDLER: Admin Stats API
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

		const { supabaseAdmin } = authResult;

		console.log('[ADMIN-STATS-API] Fetching admin stats...');

		// Get all profiles
		const { data: profiles, error: profilesError } = await supabaseAdmin
			.from('profiles')
			.select('id, created_at, is_premium');

		if (profilesError) throw profilesError;

		const totalUsers = profiles?.length || 0;

		// Get all entries
		const { data: entries, error: entriesError } = await supabaseAdmin
			.from('entries')
			.select('id, user_id, created_at');

		if (entriesError) throw entriesError;

		const totalEntries = entries?.length || 0;

		// Calculate active users and new users today
		const activeUsersSet = new Set();
		let newUsersToday = 0;
		const activeTodaySet = new Set();

		// ✅ FIX: Use UTC date string comparison (YYYY-MM-DD) instead of timestamp
		// This is timezone-independent and more reliable
		const todayUTC = new Date().toISOString().split('T')[0]; // "2025-11-08"

		// Count new users today
		for (const profile of profiles || []) {
			if (profile.created_at) {
				const createdDateUTC = new Date(profile.created_at).toISOString().split('T')[0];
				if (createdDateUTC === todayUTC) {
					newUsersToday++;
				}
			}
		}

		// Count active users
		for (const entry of entries || []) {
			activeUsersSet.add(entry.user_id);

			// Active today
			const entryDateUTC = new Date(entry.created_at).toISOString().split('T')[0];
			if (entryDateUTC === todayUTC) {
				activeTodaySet.add(entry.user_id);
			}
		}

		// Count premium users
		const premiumUsers = profiles?.filter((p) => p.is_premium).length || 0;

		// Calculate revenue (estimate: 499 RUB/month per premium user)
		const totalRevenue = premiumUsers * 499;

		const stats = {
			totalUsers,
			totalEntries,
			activeUsers: activeUsersSet.size,
			newUsersToday,
			activeToday: activeTodaySet.size,
			premiumUsers,
			totalRevenue,
			pwaInstalls: 0,
		};

		console.log('[ADMIN-STATS-API] ✅ Stats:', stats);

		return new Response(JSON.stringify({ success: true, ...stats }), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('[ADMIN-STATS-API] ❌ Error:', error);
		return new Response(JSON.stringify({ success: false, error: error.message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});
