import { CloudOff, Crown, Settings } from 'lucide-react';
import { useTranslation } from '@/shared/lib/i18n';
import { useOfflineMode } from '@/shared/lib/offline';
import { SettingsRow, SettingsSection } from '../SettingsRow';

type OfflineSectionProps = {
	offlineEnabled: boolean;
	isPremium: boolean;
	onOfflineChange: (enabled: boolean) => void;
	onOfflineSettingsClick: () => void;
	onPremiumRequired: () => void;
	t: (key: string, fallback?: string) => string; // Translation object
};

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
	t: _t,
}: OfflineSectionProps) {
	const { t } = useTranslation();
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

	// ✅ FIX: Формируем description с учетом pending syncs
	const getDescription = () => {
		const premiumFeature = t('settings.offline.premium_feature', 'Премиум функция');

		// Для Premium пользователей - показываем статус
		if (isPremium) {
			if (!offlineEnabled) {
				return premiumFeature;
			}
			if (syncInProgress) {
				return `Синхронизация ${pendingCount} записей...`;
			}
			if (pendingCount > 0) {
				return `${pendingCount} записей ожидают синхронизации`;
			}
			return 'Работает в фоновом режиме';
		}

		// Для Free пользователей - показываем что это Premium функция
		return premiumFeature;
	};

	// ✅ FIX: Для Premium пользователей показываем Crown иконку
	const getRightElement = () => {
		if (isPremium) {
			return 'switch';
		}
		// Для Free пользователей показываем Crown иконку
		return <Crown className="h-4 w-4 text-yellow-500" />;
	};

	return (
		<SettingsSection title={t('settings.offline.title', 'Offline режим')}>
			<SettingsRow
				description={getDescription()}
				disabled={false}
				icon={CloudOff}
				iconBgColor="bg-(--ios-purple)/10"
				iconColor="text-(--ios-purple)"
				onClick={handleOfflineClick}
				onSwitchChange={handleOfflineChange}
				rightElement={getRightElement()}
				switchChecked={offlineEnabled}
				title={t('settings.offline.enable', 'Включить offline режим')}
			/>

			{/* Offline Settings - только для премиум пользователей */}
			{isPremium && offlineEnabled && (
				<SettingsRow
					description="Синхронизация и конфликты"
					icon={Settings}
					iconBgColor="bg-(--ios-blue)/10"
					iconColor="text-(--ios-blue)"
					onClick={handleSettingsClick}
					title={t('settings.offline.settings', 'Настройки offline')}
				/>
			)}
		</SettingsSection>
	);
}
