import { Lock, Shield } from "lucide-react";
import { SettingsRow, SettingsSection } from "../SettingsRow";

interface SecuritySectionProps {
  biometricEnabled: boolean;
  biometricAvailable: boolean;
  autoBackupEnabled: boolean;
  isPremium: boolean;
  onBiometricChange: (enabled: boolean) => void;
  onAutoBackupChange: (enabled: boolean) => void;
  onPremiumRequired: () => void;
  t: any; // Translation object
}

/**
 * Security settings section
 * Features:
 * - Biometric protection toggle (if available)
 * - Auto backup toggle (premium feature)
 */
export function SecuritySection({
  biometricEnabled,
  biometricAvailable,
  autoBackupEnabled,
  isPremium,
  onBiometricChange,
  onAutoBackupChange,
  onPremiumRequired,
  t
}: SecuritySectionProps) {
  const handleAutoBackupChange = (checked: boolean) => {
    if (!isPremium && checked) {
      onPremiumRequired();
    } else {
      onAutoBackupChange(checked);
    }
  };

  const handleAutoBackupClick = () => {
    if (!isPremium) {
      onPremiumRequired();
    }
  };

  return (
    <SettingsSection title={t.security || "Безопасность"}>
      <SettingsRow
        icon={Lock}
        iconColor="text-[var(--ios-blue)]"
        iconBgColor="bg-[var(--ios-blue)]/10"
        title={t.biometricProtection || "Биометрическая защита"}
        description={biometricAvailable ? "Доступно" : "Недоступно в браузере"}
        rightElement="switch"
        switchChecked={biometricEnabled}
        onSwitchChange={onBiometricChange}
        disabled={!biometricAvailable}
      />
      <SettingsRow
        icon={Shield}
        iconColor="text-[var(--ios-green)]"
        iconBgColor="bg-[var(--ios-green)]/10"
        title={t.autoBackup || "Автоматическое резервирование"}
        description={isPremium ? "Премиум функция" : "Требуется премиум"}
        rightElement="switch"
        switchChecked={autoBackupEnabled}
        onSwitchChange={handleAutoBackupChange}
        onClick={handleAutoBackupClick}
        disabled={!isPremium}
      />
    </SettingsSection>
  );
}

