/**
 * Web Push API Implementation
 */

import type {
	PushAdapter,
	PushNotificationOptions,
	PushPermissionStatus,
	PushSubscription,
} from './types';

export class WebPushAdapter implements PushAdapter {
	private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

	isSupported(): boolean {
		return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
	}

	async requestPermission(): Promise<PushPermissionStatus> {
		if (!this.isSupported()) {
			throw new Error('Push notifications not supported');
		}

		const permission = await Notification.requestPermission();
		return permission as PushPermissionStatus;
	}

	async getPermissionStatus(): Promise<PushPermissionStatus> {
		if (!this.isSupported()) {
			return 'denied';
		}

		return Notification.permission as PushPermissionStatus;
	}

	async subscribe(vapidPublicKey?: string): Promise<PushSubscription> {
		if (!vapidPublicKey) {
			throw new Error('VAPID public key is required');
		}

		const registration = await this.getServiceWorkerRegistration();
		const applicationServerKey = this.urlBase64ToUint8Array(vapidPublicKey);

		const subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey,
		});

		const subscriptionJSON = subscription.toJSON();

		return {
			endpoint: subscriptionJSON.endpoint || '',
			keys: {
				p256dh: subscriptionJSON.keys?.p256dh || '',
				auth: subscriptionJSON.keys?.auth || '',
			},
		};
	}

	async unsubscribe(): Promise<void> {
		const registration = await this.getServiceWorkerRegistration();
		const subscription = await registration.pushManager.getSubscription();

		if (subscription) {
			await subscription.unsubscribe();
		}
	}

	async getSubscription(): Promise<PushSubscription | null> {
		try {
			const registration = await this.getServiceWorkerRegistration();
			const subscription = await registration.pushManager.getSubscription();

			if (!subscription) {
				return null;
			}

			const subscriptionJSON = subscription.toJSON();

			return {
				endpoint: subscriptionJSON.endpoint || '',
				keys: {
					p256dh: subscriptionJSON.keys?.p256dh || '',
					auth: subscriptionJSON.keys?.auth || '',
				},
			};
		} catch (error) {
			console.error('[WebPushAdapter] Error getting subscription:', error);
			return null;
		}
	}

	async showNotification(options: PushNotificationOptions): Promise<void> {
		const registration = await this.getServiceWorkerRegistration();

		await registration.showNotification(options.title, {
			body: options.body,
			icon: options.icon,
			badge: options.badge,
			image: options.image,
			data: options.data,
			tag: options.tag,
			requireInteraction: options.requireInteraction,
			vibrate: options.vibrate,
			silent: options.silent,
		});
	}

	private async getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
		if (this.serviceWorkerRegistration) {
			return this.serviceWorkerRegistration;
		}

		if (!('serviceWorker' in navigator)) {
			throw new Error('Service Worker not supported');
		}

		const registration = await navigator.serviceWorker.ready;
		this.serviceWorkerRegistration = registration;

		return registration;
	}

	private urlBase64ToUint8Array(base64String: string): Uint8Array {
		const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);

		for (let i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);
		}

		return outputArray;
	}
}
