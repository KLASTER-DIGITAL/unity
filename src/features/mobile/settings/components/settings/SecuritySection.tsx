import { Shield } from 'lucide-react';
import { SettingsRow, SettingsSection } from '../SettingsRow';

type SecuritySectionProps = {
	autoBackupEnabled: boolean;
	isPremium: boolean;
	onAutoBackupChange: (enabled: boolean) => void;
	onPremiumRequired: () => void;
	t: any; // Translation object
};

/**
 * Security settings section
 * Features:
 * - Auto backup toggle (premium feature)
 */
export function SecuritySection({
	autoBackupEnabled,
	isPremium,
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
			{/* Биометрическая защита - СКРЫТА по запросу пользователя */}
			{/* <SettingsRow
				description={biometricAvailable ? 'Доступно' : 'Недоступно в браузере'}
				disabled={!biometricAvailable}
				icon={Lock}
				iconBgColor="bg-(--ios-blue)/10"
				iconColor="text-(--ios-blue)"
				onSwitchChange={onBiometricChange}
				rightElement="switch"
				switchChecked={biometricEnabled}
				title={t.biometricProtection || 'Биометрическая защита'}
			/> */}
			<SettingsRow
				description={isPremium ? 'Премиум функция' : 'Требуется премиум'}
				disabled={false}
				icon={Shield}
				iconBgColor="bg-(--ios-green)/10"
				iconColor="text-(--ios-green)"
				onClick={handleAutoBackupClick}
				onSwitchChange={handleAutoBackupChange}
				rightElement="switch"
				switchChecked={autoBackupEnabled}
				title={t.autoBackup || 'Автоматическое резервирование'}
			/>
		</SettingsSection>
	);
}
