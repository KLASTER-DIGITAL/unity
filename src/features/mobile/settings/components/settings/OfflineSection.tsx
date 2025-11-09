import { CloudOff, Settings } from 'lucide-react';
import { useOfflineMode } from '@/shared/lib/offline';
import { SettingsRow, SettingsSection } from '../SettingsRow';

type OfflineSectionProps = {
	offlineEnabled: boolean;
	isPremium: boolean;
	onOfflineChange: (enabled: boolean) => void;
	onOfflineSettingsClick: () => void;
	onPremiumRequired: () => void;
	t: any; // Translation object
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
	t,
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
			return 'Требуется премиум';
		}
		if (!offlineEnabled) {
			return 'Премиум функция';
		}
		if (syncInProgress) {
			return `Синхронизация ${pendingCount} записей...`;
		}
		if (pendingCount > 0) {
			return `${pendingCount} записей ожидают синхронизации`;
		}
		return 'Работает в фоновом режиме';
	};

	return (
		<SettingsSection title={t.offlineMode || 'Offline режим'}>
			<SettingsRow
				description={getDescription()}
				disabled={!isPremium}
				icon={CloudOff}
				iconBgColor="bg-(--ios-purple)/10"
				iconColor="text-(--ios-purple)"
				onClick={handleOfflineClick}
				onSwitchChange={handleOfflineChange}
				rightElement="switch"
				switchChecked={offlineEnabled}
				title={t.enableOfflineMode || 'Включить offline режим'}
			/>

			{/* Offline Settings - только для премиум пользователей */}
			{isPremium && offlineEnabled && (
				<SettingsRow
					description="Синхронизация и конфликты"
					icon={Settings}
					iconBgColor="bg-(--ios-blue)/10"
					iconColor="text-(--ios-blue)"
					onClick={handleSettingsClick}
					title={t.offlineSettings || 'Настройки offline'}
				/>
			)}
		</SettingsSection>
	);
}
