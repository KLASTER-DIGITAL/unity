import { CloudOff, Settings, Crown } from "lucide-react";
import { SettingsRow, SettingsSection } from "../SettingsRow";
import { useOfflineMode } from "@/shared/lib/offline";

interface OfflineSectionProps {
  offlineEnabled: boolean;
  isPremium: boolean;
  onOfflineChange: (enabled: boolean) => void;
  onOfflineSettingsClick: () => void;
  onPremiumRequired: () => void;
  t: any; // Translation object
}

/**
 * Offline Mode settings section
 * Features:
 * - Offline mode toggle (premium feature)
 * - Offline settings modal
 * - Pending syncs indicator
 */
export function OfflineSection({
  offlineEnabled,
  isPremium,
  onOfflineChange,
  onOfflineSettingsClick,
  onPremiumRequired,
  t
}: OfflineSectionProps) {
  const { pendingCount, syncInProgress } = useOfflineMode();

  const handleOfflineChange = (checked: boolean) => {
    if (!isPremium && checked) {
      onPremiumRequired();
    } else {
      onOfflineChange(checked);
    }
  };

  const handleOfflineClick = () => {
    if (!isPremium) {
      onPremiumRequired();
    }
  };

  const handleSettingsClick = () => {
    if (!isPremium) {
      onPremiumRequired();
    } else {
      onOfflineSettingsClick();
    }
  };

  // Формируем description с учетом pending syncs
  const getDescription = () => {
    if (!isPremium) {
      return "Требуется премиум";
    }
    if (!offlineEnabled) {
      return "Премиум функция";
    }
    if (syncInProgress) {
      return `Синхронизация ${pendingCount} записей...`;
    }
    if (pendingCount > 0) {
      return `${pendingCount} записей ожидают синхронизации`;
    }
    return "Работает в фоновом режиме";
  };

  return (
    <SettingsSection title={t.offlineMode || "Offline режим"}>
      <SettingsRow
        icon={CloudOff}
        iconColor="text-[var(--ios-purple)]"
        iconBgColor="bg-[var(--ios-purple)]/10"
        title={t.enableOfflineMode || "Включить offline режим"}
        description={getDescription()}
        rightElement="switch"
        switchChecked={offlineEnabled}
        onSwitchChange={handleOfflineChange}
        onClick={handleOfflineClick}
        disabled={!isPremium}
      />
      
      {/* Offline Settings - только для премиум пользователей */}
      {isPremium && offlineEnabled && (
        <SettingsRow
          icon={Settings}
          iconColor="text-[var(--ios-blue)]"
          iconBgColor="bg-[var(--ios-blue)]/10"
          title={t.offlineSettings || "Настройки offline"}
          description="Синхронизация и конфликты"
          onClick={handleSettingsClick}
        />
      )}
    </SettingsSection>
  );
}

