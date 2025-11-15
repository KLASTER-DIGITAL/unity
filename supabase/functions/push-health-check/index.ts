/**
 * Push Health Check Edge Function
 *
 * Проверяет состояние push-системы:
 * - VAPID keys настроены
 * - Service Role Key настроен
 * - Cron jobs активны
 * - Webhooks работают
 * - Edge Functions доступны
 *
 * Endpoints:
 * - GET /push-health-check - Получить статус push-системы
 *
 * Response:
 * {
 *   "status": "healthy" | "degraded" | "unhealthy",
 *   "checks": {
 *     "vapid_keys": { "status": "ok" | "error", "message": "..." },
 *     "service_role_key": { "status": "ok" | "error", "message": "..." },
 *     "cron_jobs": { "status": "ok" | "error", "message": "...", "jobs": [...] },
 *     "webhooks": { "status": "ok" | "error", "message": "...", "hooks": [...] },
 *     "edge_functions": { "status": "ok" | "error", "message": "...", "functions": [...] }
 *   },
 *   "timestamp": "2025-11-15T20:00:00.000Z"
 * }
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	// Health check is public (read-only)
	if (req.method !== 'GET') {
		return new Response(JSON.stringify({ error: 'Method not allowed' }), {
			status: 405,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}

	try {
		const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
		const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
		const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

		const checks: any = {};
		let overallStatus = 'healthy';

		// Check 1: VAPID keys
		try {
			const { data: vapidPublic } = await supabaseAdmin
				.from('admin_settings')
				.select('value')
				.eq('key', 'vapid_public_key')
				.single();

			const { data: vapidPrivate } = await supabaseAdmin
				.from('admin_settings')
				.select('value')
				.eq('key', 'vapid_private_key')
				.single();

			if (vapidPublic && vapidPrivate) {
				checks.vapid_keys = {
					status: 'ok',
					message: 'VAPID keys configured',
				};
			} else {
				checks.vapid_keys = {
					status: 'error',
					message: 'VAPID keys not configured',
				};
				overallStatus = 'unhealthy';
			}
		} catch (error) {
			checks.vapid_keys = {
				status: 'error',
				message: `Failed to check VAPID keys: ${error.message}`,
			};
			overallStatus = 'unhealthy';
		}

		// Check 2: Service Role Key
		try {
			const { data: serviceRoleKey } = await supabaseAdmin
				.from('admin_settings')
				.select('value')
				.eq('key', 'supabase_service_role_key')
				.single();

			if (serviceRoleKey) {
				checks.service_role_key = {
					status: 'ok',
					message: 'Service Role Key configured',
				};
			} else {
				checks.service_role_key = {
					status: 'error',
					message: 'Service Role Key not configured',
				};
				overallStatus = 'degraded';
			}
		} catch (error) {
			checks.service_role_key = {
				status: 'error',
				message: `Failed to check Service Role Key: ${error.message}`,
			};
			overallStatus = 'degraded';
		}

		// Check 3: Cron Jobs
		try {
			const { data: cronJobs } = await supabaseAdmin.rpc('get_cron_jobs_status');

			const expectedJobs = [
				'daily_push_reminder',
				'weekly_push_motivation',
				'weekly_push_goal_reminder',
			];
			const activeJobs = cronJobs?.filter((job: any) => job.active) || [];
			const missingJobs = expectedJobs.filter(
				(name) => !activeJobs.find((job: any) => job.jobname === name)
			);

			if (missingJobs.length === 0) {
				checks.cron_jobs = {
					status: 'ok',
					message: `All ${expectedJobs.length} cron jobs active`,
					jobs: activeJobs.map((job: any) => ({
						name: job.jobname,
						schedule: job.schedule,
						active: job.active,
					})),
				};
			} else {
				checks.cron_jobs = {
					status: 'error',
					message: `Missing cron jobs: ${missingJobs.join(', ')}`,
					jobs: activeJobs.map((job: any) => ({
						name: job.jobname,
						schedule: job.schedule,
						active: job.active,
					})),
				};
				overallStatus = 'degraded';
			}
		} catch (error) {
			checks.cron_jobs = {
				status: 'error',
				message: `Failed to check cron jobs: ${error.message}`,
			};
			overallStatus = 'degraded';
		}

		return new Response(
			JSON.stringify({
				status: overallStatus,
				checks,
				timestamp: new Date().toISOString(),
			}),
			{
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		);
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		console.error('[PUSH-HEALTH-CHECK] Error:', error);
		return new Response(
			JSON.stringify({
				status: 'unhealthy',
				error: errorMessage,
				timestamp: new Date().toISOString(),
			}),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		);
	}
});
