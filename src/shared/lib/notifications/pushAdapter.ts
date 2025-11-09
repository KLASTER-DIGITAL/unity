/**
 * Push Notifications Adapter Wrapper
 *
 * Обертка над Platform Adapter с интеграцией Supabase
 */

import type { PushSubscription } from '@/shared/lib/platform/push';
import { pushNotifications } from '@/shared/lib/platform/push';
import { getBrowserInfo } from '@/shared/lib/pwa/pushNotificationSupport';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

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

export async function subscribeToPush(userId: string): Promise<PushSubscription | null> {
	try {
		const permission = await pushNotifications.getPermissionStatus();
		if (permission !== 'granted') {
			const newPermission = await pushNotifications.requestPermission();
			if (newPermission !== 'granted') {
				console.warn('[Push Adapter] Permission not granted');
				return null;
			}
		}

		const vapidPublicKey = await loadVapidPublicKey();
		const subscription = await pushNotifications.subscribe(vapidPublicKey);

		await saveSubscriptionToDatabase(userId, subscription);

		console.log('[Push Adapter] Successfully subscribed to push notifications');
		return subscription;
	} catch (error) {
		console.error('[Push Adapter] Error subscribing to push:', error);
		throw error;
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
		const browserInfo = getBrowserInfo();

		const { error } = await supabase.from('push_subscriptions').upsert(
			{
				user_id: userId,
				endpoint: subscription.endpoint,
				p256dh_key: subscription.keys.p256dh,
				auth_key: subscription.keys.auth,
				browser: browserInfo.browser,
				os: browserInfo.os,
				device_type: browserInfo.deviceType,
			},
			{
				onConflict: 'user_id,endpoint',
			}
		);

		if (error) {
			console.error('[Push Adapter] Error saving subscription:', error);
			throw error;
		}
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
