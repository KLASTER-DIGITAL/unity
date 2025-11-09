/**
 * Push Notifications Platform Adapter
 *
 * Автоматически выбирает правильную реализацию:
 * - .web.ts для PWA (Web Push API)
 * - .native.ts для React Native (Expo Notifications)
 */

import { WebPushAdapter } from './push.web';
import type { PushAdapter } from './types';

export type {
	PushAdapter,
	PushNotificationOptions,
	PushNotificationPayload,
	PushPermissionStatus,
	PushSubscription,
} from './types';

export const pushNotifications: PushAdapter = new WebPushAdapter();
