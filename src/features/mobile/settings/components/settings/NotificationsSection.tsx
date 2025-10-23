import { Bell, Calendar, Star, Crown } from "lucide-react";
import { SettingsRow, SettingsSection } from "../SettingsRow";
import { PushSubscriptionManager } from "@/shared/components/pwa/PushSubscriptionManager";
import type { NotificationSettings } from "./types";

interface NotificationsSectionProps {
  notifications: NotificationSettings;
  onNotificationsChange: (notifications: NotificationSettings) => void;
  userId?: string;
  t: any; // Translation object
}

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
  t
}: NotificationsSectionProps) {
  const handleToggle = (key: keyof NotificationSettings, checked: boolean) => {
    onNotificationsChange({ ...notifications, [key]: checked });
  };

  return (
    <SettingsSection title={t.notifications || "Уведомления"}>
      {/* Push Notifications Manager */}
      {userId && (
        <div className="mb-4">
          <PushSubscriptionManager userId={userId} />
        </div>
      )}

      <SettingsRow
        icon={Bell}
        iconColor="text-[var(--ios-blue)]"
        iconBgColor="bg-[var(--ios-blue)]/10"
        title={t.dailyReminders || "Ежедневные напоминания"}
        description="Напоминания о записях"
        rightElement="switch"
        switchChecked={notifications.dailyReminder}
        onSwitchChange={(checked) => handleToggle('dailyReminder', checked)}
      />
      <SettingsRow
        icon={Calendar}
        iconColor="text-[var(--ios-purple)]"
        iconBgColor="bg-[var(--ios-purple)]/10"
        title={t.weeklyReports || "Еженедельные отчеты"}
        description="Статистика за неделю"
        rightElement="switch"
        switchChecked={notifications.weeklyReport}
        onSwitchChange={(checked) => handleToggle('weeklyReport', checked)}
      />
      <SettingsRow
        icon={Star}
        iconColor="text-[var(--ios-green)]"
        iconBgColor="bg-[var(--ios-green)]/10"
        title={t.newAchievements || "Новые достижения"}
        description="Уведомления о наградах"
        rightElement="switch"
        switchChecked={notifications.achievements}
        onSwitchChange={(checked) => handleToggle('achievements', checked)}
      />
      <SettingsRow
        icon={Crown}
        iconColor="text-[var(--ios-orange)]"
        iconBgColor="bg-[var(--ios-orange)]/10"
        title={t.motivationalMessages || "Мотивационные сообщения"}
        description="Мотивационные карточки"
        rightElement="switch"
        switchChecked={notifications.motivational}
        onSwitchChange={(checked) => handleToggle('motivational', checked)}
      />
    </SettingsSection>
  );
}

