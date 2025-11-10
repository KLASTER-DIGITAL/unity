/**
 * Push Notifications Adapter Wrapper
 *
 * Обертка над Platform Adapter с интеграцией Supabase
 */

import type { PushSubscription } from '@/shared/lib/platform/push';
import { pushNotifications } from '@/shared/lib/platform/push';
import { getBrowserInfo } from '@/shared/lib/pwa/pushNotificationSupport';
import { createClient } from '@/utils/supabase/client';
import { getPushPlatformInfo } from './platformDetection';

const supabase = createClient();

// Типы ошибок подписки
export type PushSubscriptionError =
	| 'service_worker_not_registered'
	| 'vapid_key_missing'
	| 'permission_denied'
	| 'platform_not_supported'
	| 'ios_requires_pwa'
	| 'unknown_error';

export interface PushSubscriptionResult {
	success: boolean;
	subscription?: PushSubscription;
	error?: PushSubscriptionError;
	errorMessage?: string;
	instructions?: string;
}

let VAPID_PUBLIC_KEY: string | null = null;

async function loadVapidPublicKey(): Promise<string> {
	if (VAPID_PUBLIC_KEY) {
		return VAPID_PUBLIC_KEY;
	}

	try {
		const { data, error } = await supabase
			.from('admin_settings')
			.select('value')
			.eq('key', 'vapid_public_key')
			.single();

		if (error) {
			console.error('[Push Adapter] Failed to load VAPID public key:', error);
			throw new Error('VAPID public key not configured');
		}

		VAPID_PUBLIC_KEY = data.value;
		return data.value;
	} catch (error) {
		console.error('[Push Adapter] Error loading VAPID public key:', error);
		throw error;
	}
}

export function isPushSupported(): boolean {
	return pushNotifications.isSupported();
}

export function getNotificationPermission(): NotificationPermission {
	if (!('Notification' in window)) {
		return 'denied';
	}
	return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
	try {
		const permission = await pushNotifications.requestPermission();
		console.log('[Push Adapter] Permission result:', permission);
		return permission as NotificationPermission;
	} catch (error) {
		console.error('[Push Adapter] Error requesting permission:', error);
		return 'denied';
	}
}

export async function isPushSubscribed(): Promise<boolean> {
	try {
		const subscription = await pushNotifications.getSubscription();
		return subscription !== null;
	} catch (error) {
		console.error('[Push Adapter] Error checking subscription:', error);
		return false;
	}
}

export async function subscribeToPush(userId: string): Promise<PushSubscriptionResult> {
	try {
		// 1. Проверяем поддержку платформы
		const platformInfo = getPushPlatformInfo();
		if (!platformInfo.pushSupported) {
			console.warn('[Push Adapter] Platform not supported:', platformInfo.pushSupportReason);
			return {
				success: false,
				error: platformInfo.pushSupportReason as PushSubscriptionError,
				errorMessage: 'Платформа не поддерживает push уведомления',
				instructions: platformInfo.instructions,
			};
		}

		// 2. Проверяем регистрацию Service Worker
		if (!('serviceWorker' in navigator)) {
			console.error('[Push Adapter] Service Worker not supported');
			return {
				success: false,
				error: 'service_worker_not_registered',
				errorMessage: 'Service Worker не поддерживается',
			};
		}

		// Ждем готовности Service Worker
		try {
			await navigator.serviceWorker.ready;
			console.log('[Push Adapter] Service Worker is ready');
		} catch (error) {
			console.error('[Push Adapter] Service Worker not ready:', error);
			return {
				success: false,
				error: 'service_worker_not_registered',
				errorMessage: 'Service Worker не зарегистрирован',
			};
		}

		// 3. Проверяем разрешение
		const permission = await pushNotifications.getPermissionStatus();
		if (permission !== 'granted') {
			const newPermission = await pushNotifications.requestPermission();
			if (newPermission !== 'granted') {
				console.warn('[Push Adapter] Permission not granted:', newPermission);
				return {
					success: false,
					error: 'permission_denied',
					errorMessage: 'Разрешение на уведомления не предоставлено',
				};
			}
		}

		// 4. Загружаем VAPID ключ
		let vapidPublicKey: string;
		try {
			vapidPublicKey = await loadVapidPublicKey();
		} catch (error) {
			console.error('[Push Adapter] Failed to load VAPID key:', error);
			return {
				success: false,
				error: 'vapid_key_missing',
				errorMessage: 'VAPID ключ не настроен',
			};
		}

		// 5. Подписываемся на push
		const subscription = await pushNotifications.subscribe(vapidPublicKey);

		// 6. Сохраняем подписку в БД
		await saveSubscriptionToDatabase(userId, subscription);

		console.log('[Push Adapter] Successfully subscribed to push notifications');
		return {
			success: true,
			subscription,
		};
	} catch (error) {
		console.error('[Push Adapter] Error subscribing to push:', error);
		return {
			success: false,
			error: 'unknown_error',
			errorMessage: error instanceof Error ? error.message : 'Неизвестная ошибка',
		};
	}
}

export async function unsubscribeFromPush(userId: string): Promise<void> {
	try {
		await pushNotifications.unsubscribe();
		await removeSubscriptionFromDatabase(userId);

		console.log('[Push Adapter] Successfully unsubscribed from push notifications');
	} catch (error) {
		console.error('[Push Adapter] Error unsubscribing from push:', error);
		throw error;
	}
}

async function saveSubscriptionToDatabase(
	userId: string,
	subscription: PushSubscription
): Promise<void> {
	try {
		const subscriptionJson = subscription.toJSON();
		const browserInfo = getBrowserInfo();

		if (
			!subscriptionJson.endpoint ||
			!subscriptionJson.keys?.p256dh ||
			!subscriptionJson.keys?.auth
		) {
			throw new Error('Invalid subscription data');
		}

		const { error } = await supabase.from('push_subscriptions').upsert(
			{
				user_id: userId,
				endpoint: subscriptionJson.endpoint,
				p256dh: subscriptionJson.keys.p256dh,
				auth: subscriptionJson.keys.auth,
				user_agent: navigator.userAgent,
				browser_info: {
					browser: browserInfo.browser,
					os: browserInfo.os,
					deviceType: browserInfo.deviceType,
				},
				is_active: true,
				last_used_at: new Date().toISOString(),
			},
			{
				onConflict: 'endpoint',
			}
		);

		if (error) {
			console.error('[Push Adapter] Error saving subscription:', error);
			throw error;
		}

		console.log('[Push Adapter] Subscription saved successfully');
	} catch (error) {
		console.error('[Push Adapter] Error in saveSubscriptionToDatabase:', error);
		throw error;
	}
}

async function removeSubscriptionFromDatabase(userId: string): Promise<void> {
	try {
		const { error } = await supabase.from('push_subscriptions').delete().eq('user_id', userId);

		if (error) {
			console.error('[Push Adapter] Error removing subscription:', error);
			throw error;
		}
	} catch (error) {
		console.error('[Push Adapter] Error in removeSubscriptionFromDatabase:', error);
		throw error;
	}
}

export function initWebPush(_userId: string): void {
	console.log('[Push Adapter] Using Platform Adapter - no initialization needed');
}
