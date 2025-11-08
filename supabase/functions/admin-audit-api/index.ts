/**
 * Admin Audit API
 *
 * Provides audit logging for critical admin actions.
 *
 * Endpoints:
 * - POST /log - Create audit log entry
 * - GET /logs - Get audit logs (with filters)
 *
 * @author UNITY Team
 * @date 2025-11-08
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

	// Create Supabase client with service role key
	const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
		global: {
			headers: { Authorization: `Bearer ${token}` },
		},
	});

	// Get user from token
	const {
		data: { user },
		error: userError,
	} = await supabaseAdmin.auth.getUser(token);

	if (userError || !user) {
		return {
			error: new Response(
				JSON.stringify({
					success: false,
					error: 'Invalid token',
				}),
				{
					status: 401,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			),
		};
	}

	// Check if user is super_admin
	const { data: profile, error: profileError } = await supabaseAdmin
		.from('profiles')
		.select('role, email')
		.eq('id', user.id)
		.single();

	if (profileError || !profile || profile.role !== 'super_admin') {
		return {
			error: new Response(
				JSON.stringify({
					success: false,
					error: 'Forbidden: super_admin role required',
				}),
				{
					status: 403,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			),
		};
	}

	return { supabaseAdmin, user, profile };
}

// ============================================
// MAIN HANDLER: Admin Audit API
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

		const { supabaseAdmin, user, profile } = authResult;

		// Parse URL path
		const url = new URL(req.url);
		const pathParts = url.pathname.split('/').filter((p) => p);
		const relevantParts = pathParts.filter(
			(p) => !['functions', 'v1', 'admin-audit-api'].includes(p)
		);

		const endpoint = relevantParts[0] || 'logs';

		// POST /log - Create audit log entry
		if (req.method === 'POST' && endpoint === 'log') {
			const body = await req.json();
			const { action, category, target_id, target_type, details } = body;

			// Get IP address and User-Agent
			const ip_address =
				req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
			const user_agent = req.headers.get('user-agent') || 'unknown';

			// Insert audit log
			const { error: insertError } = await supabaseAdmin.from('admin_audit_log').insert({
				action,
				category,
				user_id: user.id,
				user_email: profile.email,
				target_id,
				target_type,
				details,
				ip_address,
				user_agent,
			});

			if (insertError) {
				throw insertError;
			}

			return new Response(JSON.stringify({ success: true }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// GET /logs - Get audit logs
		if (req.method === 'GET' && endpoint === 'logs') {
			// Parse query parameters
			const category = url.searchParams.get('category');
			const action = url.searchParams.get('action');
			const user_id = url.searchParams.get('user_id');
			const limit = parseInt(url.searchParams.get('limit') || '100');
			const offset = parseInt(url.searchParams.get('offset') || '0');

			// Build query
			let query = supabaseAdmin
				.from('admin_audit_log')
				.select('*')
				.order('created_at', { ascending: false })
				.range(offset, offset + limit - 1);

			// Apply filters
			if (category) {
				query = query.eq('category', category);
			}
			if (action) {
				query = query.eq('action', action);
			}
			if (user_id) {
				query = query.eq('user_id', user_id);
			}

			const { data: logs, error: logsError } = await query;

			if (logsError) {
				throw logsError;
			}

			return new Response(JSON.stringify({ success: true, logs }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		return new Response(JSON.stringify({ success: false, error: 'Not found' }), {
			status: 404,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('Error:', error);
		return new Response(JSON.stringify({ success: false, error: error.message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});
