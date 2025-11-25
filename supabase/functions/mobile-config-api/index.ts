import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
	'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
};

interface MobileSettings {
	id?: string;
	app_name: string;
	logo_light_url?: string;
	logo_dark_url?: string;
	primary_color: string;
	accent_color: string;
	default_language: string;
	dark_theme_enabled: boolean;
	splash_enabled: boolean;
	splash_image_url?: string;
	splash_bg_color: string;
	splash_duration_ms: number;
	splash_animation: 'fade' | 'zoom' | 'slide' | 'none';
	splash_next_screen: 'onboarding' | 'login' | 'home';
	onboarding_enabled: boolean;
	onboarding_screens: any[];
	onboarding_skip_enabled: boolean;
	auth_methods: string[];
	auth_bg_color: string;
	auth_title: string;
	auth_subtitle: string;
	languages_config: {
		default: string;
		available: string[];
		autoDetect: boolean;
		offlineCache: boolean;
	};
	version?: number;
	created_at?: string;
	updated_at?: string;
}

serve(async (req) => {
	// Handle CORS preflight requests
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		const supabaseUrl = Deno.env.get('SUPABASE_URL');
		const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

		if (!(supabaseUrl && supabaseAnonKey)) {
			throw new Error('Missing Supabase environment variables');
		}

		const supabase = createClient(supabaseUrl, supabaseAnonKey);

		// GET /mobile-config - получить конфигурацию
		if (req.method === 'GET') {
			const { data, error } = await supabase.from('mobile_settings').select('*').single();

			if (error) {
				console.error('Error fetching mobile settings:', error);
				return new Response(
					JSON.stringify({
						success: false,
						error: error.message,
					}),
					{
						status: 500,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					}
				);
			}

			return new Response(
				JSON.stringify({
					success: true,
					config: data,
				}),
				{
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			);
		}

		// PUT /mobile-config - обновить конфигурацию (только super_admin)
		if (req.method === 'PUT') {
			const authHeader = req.headers.get('Authorization');
			if (!authHeader) {
				return new Response(
					JSON.stringify({
						success: false,
						error: 'Unauthorized: Missing authorization header',
					}),
					{
						status: 401,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					}
				);
			}

			// Проверка роли super_admin
			const token = authHeader.replace('Bearer ', '');
			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser(token);

			if (userError || !user) {
				return new Response(
					JSON.stringify({
						success: false,
						error: 'Unauthorized: Invalid token',
					}),
					{
						status: 401,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					}
				);
			}

			const { data: profile, error: profileError } = await supabase
				.from('profiles')
				.select('role')
				.eq('id', user.id)
				.single();

			if (profileError || !profile) {
				return new Response(
					JSON.stringify({
						success: false,
						error: 'Unauthorized: Profile not found',
					}),
					{
						status: 401,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					}
				);
			}

			if (profile.role !== 'super_admin') {
				return new Response(
					JSON.stringify({
						success: false,
						error: 'Forbidden: Only super admins can update mobile settings',
					}),
					{
						status: 403,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					}
				);
			}

			// Create authenticated Supabase client with user's token
			const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
				global: {
					headers: {
						Authorization: authHeader,
					},
				},
			});

			const body: Partial<MobileSettings> = await req.json();

			// Validate required fields
			if (
				body.splash_duration_ms !== undefined &&
				(body.splash_duration_ms < 0 || body.splash_duration_ms > 10_000)
			) {
				return new Response(
					JSON.stringify({
						success: false,
						error: 'splash_duration_ms must be between 0 and 10000',
					}),
					{
						status: 400,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					}
				);
			}

			// Get current settings to update
			const { data: currentSettings, error: fetchError } = await supabaseAuth
				.from('mobile_settings')
				.select('id, version')
				.single();

			if (fetchError) {
				console.error('Error fetching current settings:', fetchError);
				return new Response(
					JSON.stringify({
						success: false,
						error: `Failed to fetch current settings: ${fetchError.message}`,
					}),
					{
						status: 500,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					}
				);
			}

			// Exclude read-only fields from update
			const {
				id: _id,
				version: _version,
				created_at: _created_at,
				updated_at: _updated_at,
				...updateData
			} = body;

			// Update settings
			const { data, error } = await supabaseAuth
				.from('mobile_settings')
				.update({
					...updateData,
					version: (currentSettings.version || 1) + 1,
					updated_at: new Date().toISOString(),
				})
				.eq('id', currentSettings.id)
				.select();

			if (error) {
				console.error('Error updating mobile settings:', error);
				return new Response(
					JSON.stringify({
						success: false,
						error: error.message,
					}),
					{
						status: 500,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					}
				);
			}

			// Get the first (and only) result
			const updatedSettings = data?.[0];

			if (!updatedSettings) {
				return new Response(
					JSON.stringify({
						success: false,
						error: 'Failed to update settings',
					}),
					{
						status: 500,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					}
				);
			}

			return new Response(
				JSON.stringify({
					success: true,
					config: updatedSettings,
				}),
				{
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			);
		}

		return new Response(
			JSON.stringify({
				success: false,
				error: 'Method not allowed',
			}),
			{
				status: 405,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		);
	} catch (error) {
		console.error('Unexpected error:', error);
		return new Response(
			JSON.stringify({
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			}),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		);
	}
});
