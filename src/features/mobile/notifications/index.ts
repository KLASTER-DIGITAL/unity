/**
 * Mobile Notifications Feature
 */

export type { NotificationTimePreferences } from './components/NotificationTimeSelector';
export { NotificationTimeSelector } from './components/NotificationTimeSelector';
export { PushNotificationOnboardingModal } from './components/PushNotificationOnboardingModal';
export { PushNotificationSettingsModal } from './components/PushNotificationSettingsModal';

// Notification types and templates
export type {
	NotificationAction,
	NotificationConfig,
	NotificationPriority,
	NotificationType,
} from './types';
export { getNotificationTemplate, NOTIFICATION_TEMPLATES } from './types';
