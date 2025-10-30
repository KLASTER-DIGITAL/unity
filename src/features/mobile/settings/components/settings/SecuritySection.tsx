import { Lock, Shield } from 'lucide-react';
import { SettingsRow, SettingsSection } from '../SettingsRow';

type SecuritySectionProps = {
  biometricEnabled: boolean;
  biometricAvailable: boolean;
  autoBackupEnabled: boolean;
  isPremium: boolean;
  onBiometricChange: (enabled: boolean) => void;
  onAutoBackupChange: (enabled: boolean) => void;
  onPremiumRequired: () => void;
  t: any; // Translation object
};

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
  t,
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
    <SettingsSection title={t.security || 'Безопасность'}>
      <SettingsRow
        description={biometricAvailable ? 'Доступно' : 'Недоступно в браузере'}
        disabled={!biometricAvailable}
        icon={Lock}
        iconBgColor="bg-[var(--ios-blue)]/10"
        iconColor="text-[var(--ios-blue)]"
        onSwitchChange={onBiometricChange}
        rightElement="switch"
        switchChecked={biometricEnabled}
        title={t.biometricProtection || 'Биометрическая защита'}
      />
      <SettingsRow
        description={isPremium ? 'Премиум функция' : 'Требуется премиум'}
        disabled={!isPremium}
        icon={Shield}
        iconBgColor="bg-[var(--ios-green)]/10"
        iconColor="text-[var(--ios-green)]"
        onClick={handleAutoBackupClick}
        onSwitchChange={handleAutoBackupChange}
        rightElement="switch"
        switchChecked={autoBackupEnabled}
        title={t.autoBackup || 'Автоматическое резервирование'}
      />
    </SettingsSection>
  );
}
