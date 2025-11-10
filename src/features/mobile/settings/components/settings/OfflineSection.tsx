import { CloudOff, Crown, Settings } from 'lucide-react';
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

	// ✅ FIX: Формируем description с учетом pending syncs
	const getDescription = () => {
		// Для Premium пользователей - показываем статус
		if (isPremium) {
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
		}

		// Для Free пользователей - показываем что это Premium функция
		return 'Премиум функция';
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
		<SettingsSection title={t.offlineMode || 'Offline режим'}>
			<SettingsRow
				description={getDescription()}
				disabled={!isPremium}
				icon={CloudOff}
				iconBgColor="bg-(--ios-purple)/10"
				iconColor="text-(--ios-purple)"
				onClick={handleOfflineClick}
				onSwitchChange={isPremium ? handleOfflineChange : undefined}
				rightElement={getRightElement()}
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
