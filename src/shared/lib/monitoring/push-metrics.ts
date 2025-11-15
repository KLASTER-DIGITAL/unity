/**
 * Push Notifications Metrics for Sentry
 *
 * Отслеживание успешности доставки push уведомлений через Sentry Metrics
 *
 * @author UNITY Team
 * @date 2025-11-15
 */

import * as Sentry from '@sentry/react';

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
 * Отправляет метрику в Sentry для мониторинга успешности доставки
 *
 * @example
 * // Успешная отправка
 * trackPushDelivery('sent', {
 *   campaign_id: 'abc123',
 *   user_count: 100,
 *   channel: 'web_push'
 * });
 *
 * // Ошибка доставки
 * trackPushDelivery('failed', {
 *   campaign_id: 'abc123',
 *   error_code: '410',
 *   error_message: 'Subscription expired'
 * });
 */
export function trackPushDelivery(status: PushDeliveryStatus, metadata?: PushMetadata): void {
	if (!import.meta.env.PROD) {
		console.log('📊 [Push Metrics Dev]', status, metadata);
		return;
	}

	try {
		// Increment counter metric
		Sentry.metrics.increment('push_notifications', 1, {
			tags: {
				status,
				campaign_id: metadata?.campaign_id || 'unknown',
				notification_type: metadata?.notification_type || 'unknown',
				channel: metadata?.channel || 'web_push',
			},
		});

		// Track user count as gauge
		if (metadata?.user_count) {
			Sentry.metrics.gauge('push_notifications_user_count', metadata.user_count, {
				tags: {
					status,
					campaign_id: metadata.campaign_id || 'unknown',
				},
			});
		}

		// Capture error details if failed
		if (status === 'failed' && metadata?.error_message) {
			Sentry.captureMessage(`Push notification failed: ${metadata.error_message}`, {
				level: 'warning',
				tags: {
					push_status: status,
					campaign_id: metadata.campaign_id,
					error_code: metadata.error_code,
				},
				contexts: {
					push: {
						...metadata,
					},
				},
			});
		}

		// Capture rate limit events
		if (status === 'rate_limited') {
			Sentry.captureMessage('Push notification rate limited', {
				level: 'info',
				tags: {
					push_status: status,
					campaign_id: metadata?.campaign_id,
				},
				contexts: {
					push: {
						...metadata,
					},
				},
			});
		}
	} catch (error) {
		console.error('❌ [Push Metrics] Failed to track delivery:', error);
	}
}

/**
 * Track push campaign statistics
 *
 * Отправляет сводную статистику по кампании
 *
 * @example
 * trackPushCampaignStats({
 *   campaign_id: 'abc123',
 *   total_users: 1000,
 *   sent: 950,
 *   delivered: 900,
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
	if (!import.meta.env.PROD) {
		console.log('📊 [Push Campaign Stats Dev]', stats);
		return;
	}

	try {
		// Track delivery rate as percentage
		const deliveryRate = stats.sent > 0 ? (stats.sent / stats.total_users) * 100 : 0;

		Sentry.metrics.gauge('push_campaign_delivery_rate', deliveryRate, {
			tags: {
				campaign_id: stats.campaign_id,
			},
		});

		// Track individual metrics
		Sentry.metrics.gauge('push_campaign_total_users', stats.total_users, {
			tags: { campaign_id: stats.campaign_id },
		});

		Sentry.metrics.gauge('push_campaign_sent', stats.sent, {
			tags: { campaign_id: stats.campaign_id },
		});

		Sentry.metrics.gauge('push_campaign_failed', stats.failed, {
			tags: { campaign_id: stats.campaign_id },
		});

		if (stats.rate_limited) {
			Sentry.metrics.gauge('push_campaign_rate_limited', stats.rate_limited, {
				tags: { campaign_id: stats.campaign_id },
			});
		}

		// Capture message for low delivery rate
		if (deliveryRate < 80) {
			Sentry.captureMessage(`Low push delivery rate: ${deliveryRate.toFixed(2)}%`, {
				level: deliveryRate < 50 ? 'error' : 'warning',
				tags: {
					campaign_id: stats.campaign_id,
					delivery_rate: deliveryRate.toFixed(2),
				},
				contexts: {
					campaign: stats,
				},
			});
		}
	} catch (error) {
		console.error('❌ [Push Campaign Stats] Failed to track:', error);
	}
}
