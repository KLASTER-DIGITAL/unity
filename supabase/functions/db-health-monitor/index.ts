/**
 * Database Health Monitor Edge Function
 *
 * Мониторинг здоровья БД для раннего обнаружения проблем при масштабировании до 100K пользователей
 *
 * Метрики:
 * - Database size (MB)
 * - Active/Idle connections
 * - Cache hit ratio (should be > 99%)
 * - Index hit ratio (should be > 95%)
 * - Table bloat ratio
 * - Deadlocks count
 * - Slow queries count
 *
 * Вызывается:
 * - Через Cron Job каждый час
 * - Вручную через API для проверки
 *
 * API:
 * GET /db-health-monitor
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase Admin Client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Database Health Metrics
 */
interface DBHealthMetrics {
	timestamp: string;
	database: string;
	size_mb: number;
	connections: {
		active: number;
		idle: number;
		max: number;
		usage_percent: number;
	};
	cache: {
		hit_ratio: number;
		status: 'healthy' | 'warning' | 'critical';
	};
	indexes: {
		hit_ratio: number;
		status: 'healthy' | 'warning' | 'critical';
	};
	bloat: {
		ratio: number;
		status: 'healthy' | 'warning' | 'critical';
	};
	performance: {
		deadlocks: number;
		slow_queries: number;
		status: 'healthy' | 'warning' | 'critical';
	};
}

/**
 * Get database health metrics
 */
async function getDBHealthMetrics(): Promise<DBHealthMetrics> {
	const { data, error } = await supabaseAdmin.rpc('get_db_health_metrics');

	if (error) {
		console.error('[DB-HEALTH] Error getting metrics:', error);
		throw error;
	}

	return data as DBHealthMetrics;
}

/**
 * Save metrics to history table
 */
async function saveMetricsToHistory(metrics: DBHealthMetrics): Promise<void> {
	const { error } = await supabaseAdmin.from('db_health_history').insert({
		metrics,
	});

	if (error) {
		console.error('[DB-HEALTH] Error saving to history:', error);
		// Don't throw - saving to history is optional
	}
}

/**
 * Log metrics in structured format for Supabase Logs
 */
function logMetrics(metrics: DBHealthMetrics): void {
	console.log('[DB-HEALTH-METRIC]', JSON.stringify(metrics));

	// Log warnings
	if (metrics.cache.status !== 'healthy') {
		console.warn('[DB-HEALTH-WARNING]', {
			metric: 'cache_hit_ratio',
			value: metrics.cache.hit_ratio,
			status: metrics.cache.status,
			threshold: 99,
		});
	}

	if (metrics.indexes.status !== 'healthy') {
		console.warn('[DB-HEALTH-WARNING]', {
			metric: 'index_hit_ratio',
			value: metrics.indexes.hit_ratio,
			status: metrics.indexes.status,
			threshold: 95,
		});
	}

	if (metrics.bloat.status !== 'healthy') {
		console.warn('[DB-HEALTH-WARNING]', {
			metric: 'table_bloat_ratio',
			value: metrics.bloat.ratio,
			status: metrics.bloat.status,
			threshold: 20,
		});
	}

	if (metrics.performance.status !== 'healthy') {
		console.warn('[DB-HEALTH-WARNING]', {
			metric: 'performance',
			deadlocks: metrics.performance.deadlocks,
			slow_queries: metrics.performance.slow_queries,
			status: metrics.performance.status,
		});
	}

	// Log critical issues
	if (metrics.connections.usage_percent > 80) {
		console.error('[DB-HEALTH-CRITICAL]', {
			metric: 'connection_usage',
			value: metrics.connections.usage_percent,
			active: metrics.connections.active,
			idle: metrics.connections.idle,
			max: metrics.connections.max,
		});
	}
}

// Main handler
Deno.serve(async (req) => {
	// Handle CORS preflight
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		console.log('[DB-HEALTH] Starting health check...');

		// Get metrics
		const metrics = await getDBHealthMetrics();

		// Log metrics
		logMetrics(metrics);

		// Save to history
		await saveMetricsToHistory(metrics);

		console.log('[DB-HEALTH] Health check completed successfully');

		return new Response(JSON.stringify(metrics), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			status: 200,
		});
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		console.error('[DB-HEALTH] Error:', error);

		return new Response(
			JSON.stringify({
				error: errorMessage,
			}),
			{
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				status: 500,
			}
		);
	}
});
