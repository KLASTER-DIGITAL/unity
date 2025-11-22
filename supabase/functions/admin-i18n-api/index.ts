/**
 * Admin i18n API
 *
 * Provides internationalization management for super admin panel.
 *
 * Endpoints:
 * - GET /languages - List all languages
 * - GET /translations - Get all translations
 * - GET /translation-stats - Translation progress per language
 *
 * @author UNITY Team
 * @date 2025-10-26
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

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
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
});

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

	// Check if user is super admin
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

Deno.serve(async (req) => {
	// Handle CORS preflight requests
	const origin = req.headers.get('Origin') || undefined;
	if (origin && !isAllowedOrigin(origin)) {
		return new Response(JSON.stringify({ success: false, error: 'Origin not allowed' }), {
			status: 403,
			headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
		});
	}

	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders(origin) });
	}

	try {
		// Verify super admin
		const authResult = await verifySuperAdmin(req);
		if (authResult.error) {
			return authResult.error;
		}

		const { supabaseAdmin } = authResult;

		// Parse URL path
		const url = new URL(req.url);
		const pathParts = url.pathname.split('/').filter((p) => p);
		const relevantParts = pathParts.filter(
			(p) => !['functions', 'v1', 'admin-i18n-api'].includes(p)
		);
		const endpoint = relevantParts.join('/') || 'languages';

		console.log('[ADMIN-I18N] Request:', req.method, endpoint);

		// Route: GET /languages - List all languages
		if (endpoint === 'languages' && req.method === 'GET') {
			const { data, error } = await supabaseAdmin.from('languages').select('*').order('name');

			if (error) throw error;

			return new Response(JSON.stringify({ success: true, languages: data || [] }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Route: GET /translations - Get all translations
		if (endpoint === 'translations' && req.method === 'GET') {
			const { data, error } = await supabaseAdmin
				.from('translations')
				.select('*')
				.order('translation_key');

			if (error) throw error;

			return new Response(JSON.stringify({ success: true, translations: data || [] }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Route: GET /translation-stats - Translation progress per language
		if (endpoint === 'translation-stats' && req.method === 'GET') {
			// Get all languages
			const { data: languages, error: langError } = await supabaseAdmin
				.from('languages')
				.select('code, name')
				.eq('is_active', true);

			if (langError) throw langError;

			// Get total keys from base language (ru)
			const { data: baseKeys, error: baseError } = await supabaseAdmin
				.from('translations')
				.select('translation_key')
				.eq('lang_code', 'ru');

			if (baseError) throw baseError;

			const totalKeys = baseKeys?.length || 0;
			const stats: any = {
				totalKeys,
				translatedKeys: {},
				progress: {},
				lastUpdated: {},
			};

			// Get stats for each language
			for (const lang of languages || []) {
				const { data: translations, error } = await supabaseAdmin
					.from('translations')
					.select('translation_key, updated_at')
					.eq('lang_code', lang.code);

				if (error) throw error;

				const translatedCount = translations?.length || 0;
				stats.translatedKeys[lang.code] = translatedCount;
				stats.progress[lang.code] =
					totalKeys > 0 ? Math.round((translatedCount / totalKeys) * 100) : 0;

				// Get last updated timestamp
				if (translations && translations.length > 0) {
					const lastUpdated = translations.reduce(
						(latest, t) => (new Date(t.updated_at) > new Date(latest) ? t.updated_at : latest),
						translations[0].updated_at
					);
					stats.lastUpdated[lang.code] = lastUpdated;
				}
			}

			return new Response(JSON.stringify({ success: true, ...stats }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Unknown endpoint
		return new Response(JSON.stringify({ success: false, error: 'Endpoint not found' }), {
			status: 404,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('[ADMIN-I18N] Error:', error);
		return new Response(JSON.stringify({ success: false, error: error.message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});
