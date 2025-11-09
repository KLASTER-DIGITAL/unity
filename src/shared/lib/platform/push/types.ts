/**
 * Push Notifications Platform Adapter Types
 */

export type PushPermissionStatus = 'granted' | 'denied' | 'default';

export interface PushSubscription {
	endpoint: string;
	keys: {
		p256dh: string;
		auth: string;
	};
}

export interface PushNotificationOptions {
	title: string;
	body: string;
	icon?: string;
	badge?: string;
	image?: string;
	data?: Record<string, unknown>;
	tag?: string;
	requireInteraction?: boolean;
	vibrate?: number[];
	silent?: boolean;
}

export interface PushNotificationPayload {
	title: string;
	body: string;
	icon?: string;
	badge?: string;
	image?: string;
	data?: Record<string, unknown>;
	tag?: string;
	requireInteraction?: boolean;
	vibrate?: number[];
	silent?: boolean;
	actions?: Array<{
		action: string;
		title: string;
		icon?: string;
	}>;
}

export interface PushAdapter {
	requestPermission(): Promise<PushPermissionStatus>;
	getPermissionStatus(): Promise<PushPermissionStatus>;
	subscribe(vapidPublicKey?: string): Promise<PushSubscription>;
	unsubscribe(): Promise<void>;
	getSubscription(): Promise<PushSubscription | null>;
	showNotification(options: PushNotificationOptions): Promise<void>;
	isSupported(): boolean;
}
