/**
 * Push Notification Types
 *
 * Defines all notification types and their configurations
 */

/**
 * Notification types supported by the system
 */
export type NotificationType =
	| 'entry_reminder' // Daily reminder to create an entry
	| 'weekly_summary' // Weekly summary of achievements
	| 'achievement' // New achievement unlocked
	| 'motivational' // Motivational message
	| 'custom'; // Custom notification from admin panel

/**
 * Notification priority levels
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Notification configuration
 */
export type NotificationConfig = {
	type: NotificationType;
	title: string;
	body: string;
	icon?: string;
	badge?: string;
	data?: Record<string, unknown>;
	priority?: NotificationPriority;
	requireInteraction?: boolean;
	silent?: boolean;
	tag?: string;
	timestamp?: number;
	vibrate?: number[];
	actions?: NotificationAction[];
};

/**
 * Notification action button
 */
export type NotificationAction = {
	action: string;
	title: string;
	icon?: string;
};

/**
 * Notification templates for different types
 */
export const NOTIFICATION_TEMPLATES: Record<NotificationType, Omit<NotificationConfig, 'data'>> = {
	entry_reminder: {
		type: 'entry_reminder',
		title: 'Время для записи! 📝',
		body: 'Не забудьте записать свои достижения сегодня',
		icon: '/icons/icon-192x192.png',
		badge: '/icons/badge-72x72.png',
		priority: 'normal',
		tag: 'entry_reminder',
		actions: [
			{
				action: 'create_entry',
				title: 'Создать запись',
			},
			{
				action: 'dismiss',
				title: 'Позже',
			},
		],
	},
	weekly_summary: {
		type: 'weekly_summary',
		title: 'Ваши достижения за неделю 🏆',
		body: 'Посмотрите, чего вы достигли на этой неделе!',
		icon: '/icons/icon-192x192.png',
		badge: '/icons/badge-72x72.png',
		priority: 'normal',
		tag: 'weekly_summary',
		actions: [
			{
				action: 'view_summary',
				title: 'Посмотреть',
			},
			{
				action: 'dismiss',
				title: 'Закрыть',
			},
		],
	},
	achievement: {
		type: 'achievement',
		title: 'Новое достижение! 🎉',
		body: 'Поздравляем! Вы разблокировали новое достижение',
		icon: '/icons/icon-192x192.png',
		badge: '/icons/badge-72x72.png',
		priority: 'high',
		requireInteraction: true,
		tag: 'achievement',
		vibrate: [200, 100, 200],
		actions: [
			{
				action: 'view_achievement',
				title: 'Посмотреть',
			},
			{
				action: 'share',
				title: 'Поделиться',
			},
		],
	},
	motivational: {
		type: 'motivational',
		title: 'Мотивация дня 💪',
		body: 'Каждый день - это новая возможность стать лучше!',
		icon: '/icons/icon-192x192.png',
		badge: '/icons/badge-72x72.png',
		priority: 'low',
		tag: 'motivational',
		actions: [
			{
				action: 'dismiss',
				title: 'Спасибо',
			},
		],
	},
	custom: {
		type: 'custom',
		title: 'Уведомление',
		body: 'У вас новое уведомление',
		icon: '/icons/icon-192x192.png',
		badge: '/icons/badge-72x72.png',
		priority: 'normal',
		tag: 'custom',
	},
};

/**
 * Get notification template by type
 */
export function getNotificationTemplate(
	type: NotificationType,
	customData?: Partial<NotificationConfig>
): NotificationConfig {
	const template = NOTIFICATION_TEMPLATES[type];
	return {
		...template,
		...customData,
		data: {
			type,
			timestamp: Date.now(),
			...customData?.data,
		},
	};
}
