import { Shield } from 'lucide-react';
import { useTranslation } from '@/shared/lib/i18n';
import { SettingsRow, SettingsSection } from '../SettingsRow';

type SecuritySectionProps = {
	autoBackupEnabled: boolean;
	isPremium: boolean;
	onAutoBackupChange: (enabled: boolean) => void;
	onPremiumRequired: () => void;
	t: (key: string, fallback?: string) => string; // Translation object
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
	t: _t,
}: SecuritySectionProps) {
	const { t } = useTranslation();

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
		<SettingsSection title={t('settings.security.title', 'Безопасность')}>
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
				description={
					isPremium
						? t('settings.offline.premium_feature', 'Премиум функция')
						: t('settings.security.requires_premium', 'Требуется премиум')
				}
				disabled={false}
				icon={Shield}
				iconBgColor="bg-(--ios-green)/10"
				iconColor="text-(--ios-green)"
				onClick={handleAutoBackupClick}
				onSwitchChange={handleAutoBackupChange}
				rightElement="switch"
				switchChecked={autoBackupEnabled}
				title={t('settings.security.auto_backup', 'Автоматическое резервирование')}
			/>
		</SettingsSection>
	);
}
