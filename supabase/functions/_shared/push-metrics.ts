/**
 * Push Notifications Metrics for Edge Functions
 *
 * Логирование метрик push уведомлений для мониторинга через Supabase Logs
 * В будущем можно интегрировать с Sentry Deno SDK
 *
 * @author UNITY Team
 * @date 2025-11-15
 */

/**
 * Push Delivery Status
 */
export type PushDeliveryStatus = 'sent' | 'delivered' | 'failed' | 'rate_limited';

/**
 * Push Notification Metadata
 */
export interface PushMetadata {
	campaign_id?: string;
	notification_type?: string;
	user_count?: number;
	channel?: 'web_push' | 'telegram' | 'email';
	error_code?: string;
	error_message?: string;
}

/**
 * Track push notification delivery
 *
 * Логирует метрику для мониторинга через Supabase Logs
 * Формат: [PUSH-METRIC] status=sent campaign_id=abc123 user_count=100
 *
 * @example
 * trackPushDelivery('sent', {
 *   campaign_id: 'abc123',
 *   user_count: 100,
 *   channel: 'web_push'
 * });
 */
export function trackPushDelivery(status: PushDeliveryStatus, metadata?: PushMetadata): void {
	const tags = {
		status,
		campaign_id: metadata?.campaign_id || 'unknown',
		notification_type: metadata?.notification_type || 'unknown',
		channel: metadata?.channel || 'web_push',
		user_count: metadata?.user_count || 0,
	};

	// Structured logging для Supabase Logs
	console.log('[PUSH-METRIC]', JSON.stringify(tags));

	// Дополнительное логирование для ошибок
	if (status === 'failed' && metadata?.error_message) {
		console.error('[PUSH-METRIC-ERROR]', {
			status,
			campaign_id: metadata.campaign_id,
			error_code: metadata.error_code,
			error_message: metadata.error_message,
		});
	}

	// Логирование rate limit событий
	if (status === 'rate_limited') {
		console.warn('[PUSH-METRIC-RATE-LIMIT]', {
			status,
			campaign_id: metadata?.campaign_id,
			user_count: metadata?.user_count,
		});
	}
}

/**
 * Track push campaign statistics
 *
 * Логирует сводную статистику по кампании
 *
 * @example
 * trackPushCampaignStats({
 *   campaign_id: 'abc123',
 *   total_users: 1000,
 *   sent: 950,
 *   failed: 50,
 *   rate_limited: 50
 * });
 */
export function trackPushCampaignStats(stats: {
	campaign_id: string;
	total_users: number;
	sent: number;
	delivered?: number;
	failed: number;
	rate_limited?: number;
}): void {
	// Calculate delivery rate
	const deliveryRate = stats.sent > 0 ? (stats.sent / stats.total_users) * 100 : 0;

	const metrics = {
		campaign_id: stats.campaign_id,
		total_users: stats.total_users,
		sent: stats.sent,
		failed: stats.failed,
		rate_limited: stats.rate_limited || 0,
		delivery_rate: deliveryRate.toFixed(2),
	};

	// Structured logging
	console.log('[PUSH-CAMPAIGN-STATS]', JSON.stringify(metrics));

	// Warning для низкого delivery rate
	if (deliveryRate < 80) {
		console.warn('[PUSH-CAMPAIGN-LOW-DELIVERY]', {
			campaign_id: stats.campaign_id,
			delivery_rate: deliveryRate.toFixed(2),
			level: deliveryRate < 50 ? 'critical' : 'warning',
		});
	}
}

/**
 * Track rate limit event
 *
 * Логирует событие блокировки пользователя из-за rate limit
 *
 * @example
 * trackRateLimitEvent({
 *   user_id: 'user123',
 *   count_hour: 105,
 *   count_day: 450,
 *   limit_hour: 100,
 *   limit_day: 500
 * });
 */
export function trackRateLimitEvent(event: {
	user_id: string;
	count_hour: number;
	count_day: number;
	limit_hour: number;
	limit_day: number;
}): void {
	console.warn('[PUSH-RATE-LIMIT-BLOCKED]', JSON.stringify(event));
}
