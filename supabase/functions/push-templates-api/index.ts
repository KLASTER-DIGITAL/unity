// Push Templates API - CRUD операции для управления шаблонами уведомлений
// Standalone Edge Function (max 300 строк)

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Template {
	id?: string;
	type: string;
	title: string;
	body: string;
	icon?: string;
	is_premium_only?: boolean;
	is_ai_enabled?: boolean;
	variables?: string[];
	translations?: Record<string, { title: string; body: string }>;
	ai_settings?: Record<string, unknown>;
	description?: string;
	is_active?: boolean;
}

Deno.serve(async (req) => {
	// Handle CORS preflight
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		// Initialize Supabase client
		const supabaseClient = createClient(
			Deno.env.get('SUPABASE_URL') ?? '',
			Deno.env.get('SUPABASE_ANON_KEY') ?? '',
			{
				global: {
					headers: { Authorization: req.headers.get('Authorization')! },
				},
			}
		);

		// Get authenticated user
		const {
			data: { user },
			error: authError,
		} = await supabaseClient.auth.getUser();

		if (authError || !user) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Check if user is super_admin
		const { data: profile } = await supabaseClient
			.from('profiles')
			.select('role')
			.eq('id', user.id)
			.single();

		if (profile?.role !== 'super_admin') {
			return new Response(JSON.stringify({ error: 'Forbidden: Super admin access required' }), {
				status: 403,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		const url = new URL(req.url);
		const method = req.method;

		// GET /push-templates-api - List all templates
		if (method === 'GET' && !url.searchParams.get('id')) {
			const { data: templates, error } = await supabaseClient
				.from('push_notification_templates')
				.select('*')
				.order('created_at', { ascending: false });

			if (error) throw error;

			return new Response(JSON.stringify({ templates }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// GET /push-templates-api?id=xxx - Get single template
		if (method === 'GET' && url.searchParams.get('id')) {
			const id = url.searchParams.get('id');

			const { data: template, error } = await supabaseClient
				.from('push_notification_templates')
				.select('*')
				.eq('id', id)
				.single();

			if (error) throw error;

			return new Response(JSON.stringify({ template }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// GET /push-templates-api?type=xxx - Get template by type
		if (method === 'GET' && url.searchParams.get('type')) {
			const type = url.searchParams.get('type');

			const { data: template, error } = await supabaseClient
				.from('push_notification_templates')
				.select('*')
				.eq('type', type)
				.single();

			if (error) throw error;

			return new Response(JSON.stringify({ template }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// POST /push-templates-api - Create new template
		if (method === 'POST') {
			const body: Template = await req.json();

			const { data: template, error } = await supabaseClient
				.from('push_notification_templates')
				.insert({
					type: body.type,
					title: body.title,
					body: body.body,
					icon: body.icon || '/icon-192.png',
					is_premium_only: body.is_premium_only || false,
					is_ai_enabled: body.is_ai_enabled || false,
					variables: body.variables || [],
					translations: body.translations || {},
					ai_settings: body.ai_settings || {},
					description: body.description,
					is_active: body.is_active !== undefined ? body.is_active : true,
					created_by: user.id,
				})
				.select()
				.single();

			if (error) throw error;

			return new Response(JSON.stringify({ template }), {
				status: 201,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// PUT /push-templates-api?id=xxx - Update template
		if (method === 'PUT') {
			const id = url.searchParams.get('id');
			if (!id) {
				return new Response(JSON.stringify({ error: 'Template ID required' }), {
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			const body: Template = await req.json();

			const updateData: Partial<Template> = {};
			if (body.title !== undefined) updateData.title = body.title;
			if (body.body !== undefined) updateData.body = body.body;
			if (body.icon !== undefined) updateData.icon = body.icon;
			if (body.is_premium_only !== undefined) updateData.is_premium_only = body.is_premium_only;
			if (body.is_ai_enabled !== undefined) updateData.is_ai_enabled = body.is_ai_enabled;
			if (body.variables !== undefined) updateData.variables = body.variables;
			if (body.translations !== undefined) updateData.translations = body.translations;
			if (body.ai_settings !== undefined) updateData.ai_settings = body.ai_settings;
			if (body.description !== undefined) updateData.description = body.description;
			if (body.is_active !== undefined) updateData.is_active = body.is_active;

			const { data: template, error } = await supabaseClient
				.from('push_notification_templates')
				.update(updateData)
				.eq('id', id)
				.select()
				.single();

			if (error) throw error;

			// Increment usage_count
			await supabaseClient
				.from('push_notification_templates')
				.update({ usage_count: template.usage_count + 1 })
				.eq('id', id);

			return new Response(JSON.stringify({ template }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// DELETE /push-templates-api?id=xxx - Delete template
		if (method === 'DELETE') {
			const id = url.searchParams.get('id');
			if (!id) {
				return new Response(JSON.stringify({ error: 'Template ID required' }), {
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			const { error } = await supabaseClient
				.from('push_notification_templates')
				.delete()
				.eq('id', id);

			if (error) throw error;

			return new Response(JSON.stringify({ success: true }), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Method not allowed
		return new Response(JSON.stringify({ error: 'Method not allowed' }), {
			status: 405,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('Error:', error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});
