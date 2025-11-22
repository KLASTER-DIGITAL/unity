import { Bell, Calendar, Crown, Star } from 'lucide-react';
import { NotificationTimeSelector } from '@/features/mobile/notifications';
import { PushSubscriptionManager } from '@/shared/components/pwa/PushSubscriptionManager';
import { useTranslation } from '@/shared/lib/i18n';
import { SettingsRow, SettingsSection } from '../SettingsRow';
import type { NotificationSettings } from './types';

type NotificationsSectionProps = {
	notifications: NotificationSettings;
	onNotificationsChange: (notifications: NotificationSettings) => void;
	userId?: string;
	profile?: Record<string, unknown>; // User profile with notification_time_preferences
	t: (key: string, fallback?: string) => string; // Translation object (deprecated, using useTranslation hook instead)
};

/**
 * Notifications settings section
 * Features:
 * - Push notifications manager
 * - Daily reminders toggle
 * - Weekly reports toggle
 * - Achievements notifications toggle
 * - Motivational messages toggle
 */
export function NotificationsSection({
	notifications,
	onNotificationsChange,
	userId,
	profile,
	t: _t,
}: NotificationsSectionProps) {
	const { t } = useTranslation();

	const handleToggle = (key: keyof NotificationSettings, checked: boolean) => {
		onNotificationsChange({ ...notifications, [key]: checked });
	};

	return (
		<SettingsSection title={t('settings.notifications.title', 'Уведомления')}>
			{/* Push Notifications Manager */}
			{userId && (
				<div className="mb-4">
					<PushSubscriptionManager userId={userId} />
				</div>
			)}

			<SettingsRow
				description={t('notifications.daily_reminder.description', 'Напоминания о записях')}
				icon={Bell}
				iconBgColor="bg-(--ios-blue)/10"
				iconColor="text-(--ios-blue)"
				onSwitchChange={(checked) => handleToggle('dailyReminder', checked)}
				rightElement="switch"
				switchChecked={notifications.dailyReminder}
				title={t('dailyReminders', 'Ежедневные напоминания')}
			/>
			<SettingsRow
				description={t('notifications.weekly_report.description', 'Статистика за неделю')}
				icon={Calendar}
				iconBgColor="bg-(--ios-purple)/10"
				iconColor="text-(--ios-purple)"
				onSwitchChange={(checked) => handleToggle('weeklyReport', checked)}
				rightElement="switch"
				switchChecked={notifications.weeklyReport}
				title={t('weeklyReports', 'Еженедельные отчеты')}
			/>
			<SettingsRow
				description={t('notifications.achievements.description', 'Уведомления о наградах')}
				icon={Star}
				iconBgColor="bg-(--ios-green)/10"
				iconColor="text-(--ios-green)"
				onSwitchChange={(checked) => handleToggle('achievements', checked)}
				rightElement="switch"
				switchChecked={notifications.achievements}
				title={t('newAchievements', 'Новые достижения')}
			/>
			<SettingsRow
				description={t('notifications.motivational.description', 'Мотивационные карточки')}
				icon={Crown}
				iconBgColor="bg-(--ios-orange)/10"
				iconColor="text-(--ios-orange)"
				onSwitchChange={(checked) => handleToggle('motivational', checked)}
				rightElement="switch"
				switchChecked={notifications.motivational}
				title={t('motivationalMessages', 'Мотивационные сообщения')}
			/>

			{/* Notification Time Selector */}
			{userId && (
				<NotificationTimeSelector
					initialEveningTime={profile?.notification_time_preferences?.eveningTime}
					initialMorningTime={profile?.notification_time_preferences?.morningTime}
					initialSelectedTimes={profile?.notification_time_preferences?.selectedTimes}
					userId={userId}
				/>
			)}
		</SettingsSection>
	);
}
