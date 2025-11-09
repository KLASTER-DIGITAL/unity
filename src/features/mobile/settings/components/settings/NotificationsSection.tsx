import { Bell, Calendar, Crown, Star } from 'lucide-react';
import { PushSubscriptionManager } from '@/shared/components/pwa/PushSubscriptionManager';
import { SettingsRow, SettingsSection } from '../SettingsRow';
import type { NotificationSettings } from './types';

type NotificationsSectionProps = {
	notifications: NotificationSettings;
	onNotificationsChange: (notifications: NotificationSettings) => void;
	userId?: string;
	t: any; // Translation object
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
	t,
}: NotificationsSectionProps) {
	const handleToggle = (key: keyof NotificationSettings, checked: boolean) => {
		onNotificationsChange({ ...notifications, [key]: checked });
	};

	return (
		<SettingsSection title={t.notifications || 'Уведомления'}>
			{/* Push Notifications Manager */}
			{userId && (
				<div className="mb-4">
					<PushSubscriptionManager userId={userId} />
				</div>
			)}

			<SettingsRow
				description="Напоминания о записях"
				icon={Bell}
				iconBgColor="bg-(--ios-blue)/10"
				iconColor="text-(--ios-blue)"
				onSwitchChange={(checked) => handleToggle('dailyReminder', checked)}
				rightElement="switch"
				switchChecked={notifications.dailyReminder}
				title={t.dailyReminders || 'Ежедневные напоминания'}
			/>
			<SettingsRow
				description="Статистика за неделю"
				icon={Calendar}
				iconBgColor="bg-(--ios-purple)/10"
				iconColor="text-(--ios-purple)"
				onSwitchChange={(checked) => handleToggle('weeklyReport', checked)}
				rightElement="switch"
				switchChecked={notifications.weeklyReport}
				title={t.weeklyReports || 'Еженедельные отчеты'}
			/>
			<SettingsRow
				description="Уведомления о наградах"
				icon={Star}
				iconBgColor="bg-[var(--ios-green)]/10"
				iconColor="text-(--ios-green)"
				onSwitchChange={(checked) => handleToggle('achievements', checked)}
				rightElement="switch"
				switchChecked={notifications.achievements}
				title={t.newAchievements || 'Новые достижения'}
			/>
			<SettingsRow
				description="Мотивационные карточки"
				icon={Crown}
				iconBgColor="bg-[var(--ios-orange)]/10"
				iconColor="text-[var(--ios-orange)]"
				onSwitchChange={(checked) => handleToggle('motivational', checked)}
				rightElement="switch"
				switchChecked={notifications.motivational}
				title={t.motivationalMessages || 'Мотивационные сообщения'}
			/>
		</SettingsSection>
	);
}
