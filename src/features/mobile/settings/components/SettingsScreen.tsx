import { AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle';
import { useTranslation } from '@/shared/lib/i18n';
import { PremiumModal } from './PremiumModal';
import { ProfileEditModal } from './ProfileEditModal';
import { SettingsRow, SettingsSection } from './SettingsRow';
import { SettingsScreenSkeleton } from './SettingsScreenSkeleton';
import type { NotificationSettings, SettingsScreenProps } from './settings';
// Import modular components and handlers
import {
	AdditionalSection,
	CategoriesModal,
	CategoriesSection,
	checkBiometricAvailability,
	DEFAULT_LANGUAGES,
	FAQModal,
	handleLanguageChange as handleLanguageChangeUtil,
	LanguageModal,
	loadLanguages,
	NotificationsSection,
	OfflineSection,
	OfflineSettingsModal,
	ProfileHeader,
	PWAInstallModal,
	RateAppModal,
	SecuritySection,
	SupportModal,
	SupportSection,
	saveNotificationSettings,
	saveOfflineSettings,
	saveSecuritySettings,
} from './settings';

// Re-export types for backward compatibility
export type { SettingsScreenProps };

import { LogOut, Palette } from 'lucide-react';

export function SettingsScreen({ userData, onLogout, onProfileUpdate }: SettingsScreenProps) {
	// Extract profile from userData (userData = { success, user, profile })
	const initialProfile = userData?.profile || userData;

	// Local state for profile (to update in real-time)
	const [profile, setProfile] = useState(initialProfile);

	const { t, changeLanguage } = useTranslation();

	// State для уведомлений
	const [notifications, setNotifications] = useState<NotificationSettings>({
		dailyReminder: profile?.notificationSettings?.dailyReminder,
		weeklyReport: profile?.notificationSettings?.weeklyReport,
		achievements: profile?.notificationSettings?.achievements,
		motivational: profile?.notificationSettings?.motivational,
	});

	// State для настроек безопасности
	const [biometricEnabled, setBiometricEnabled] = useState(profile?.biometricEnabled);
	const [autoBackupEnabled, setAutoBackupEnabled] = useState(profile?.backupEnabled);
	const [biometricAvailable, setBiometricAvailable] = useState(false);

	// State для offline режима
	const [offlineEnabled, setOfflineEnabled] = useState(profile?.offlineEnabled);

	// State для модальных окон (Drawer - Bottom Sheets)
	const [showEditProfile, setShowEditProfile] = useState(false);
	const [showLanguage, setShowLanguage] = useState(false);
	const [showSupport, setShowSupport] = useState(false);
	const [showRateApp, setShowRateApp] = useState(false);
	const [showFAQ, setShowFAQ] = useState(false);
	const [showPremium, setShowPremium] = useState(false);
	const [showPWAInstall, setShowPWAInstall] = useState(false);
	const [showCategories, setShowCategories] = useState(false);
	const [showOfflineSettings, setShowOfflineSettings] = useState(false);

	// Динамическая загрузка языков из API
	const [languages, setLanguages] = useState(DEFAULT_LANGUAGES);
	const [isLoading, setIsLoading] = useState(!profile?.id);

	// Загрузка языков из API при монтировании
	useEffect(() => {
		setIsLoading(!profile?.id);
		loadLanguages().then((langs) => {
			if (langs) {
				setLanguages(langs);
			}
		});
	}, [profile?.id]);

	// Проверка поддержки WebAuthn для биометрии
	useEffect(() => {
		checkBiometricAvailability().then(setBiometricAvailable);
	}, []);

	// Синхронизация локального профиля с userData
	useEffect(() => {
		const newProfile = userData?.profile || userData;
		if (newProfile && newProfile.id !== profile?.id) {
			console.log('🔄 [SettingsScreen] Syncing profile from userData:', newProfile);
			setProfile(newProfile);
		}
	}, [userData, profile?.id]); // Added profile?.id to dependencies

	// Синхронизация state с userData при изменении профиля
	useEffect(() => {
		if (profile?.notificationSettings) {
			setNotifications({
				dailyReminder: profile.notificationSettings.dailyReminder,
				weeklyReport: profile.notificationSettings.weeklyReport,
				achievements: profile.notificationSettings.achievements,
				motivational: profile.notificationSettings.motivational,
			});
		}
		if (profile?.biometricEnabled !== undefined) {
			setBiometricEnabled(profile.biometricEnabled);
		}
		if (profile?.backupEnabled !== undefined) {
			setAutoBackupEnabled(profile.backupEnabled);
		}
	}, [
		profile.backupEnabled,
		profile.biometricEnabled,
		profile.notificationSettings.achievements,
		profile.notificationSettings.motivational,
		profile.notificationSettings.weeklyReport,
		profile?.notificationSettings,
	]); // Обновляем только при смене пользователя

	// Автосохранение уведомлений (debounced)
	useEffect(() => {
		const userId = profile?.id;
		if (!userId) {
			return;
		}

		const timeoutId = setTimeout(() => {
			saveNotificationSettings(userId, profile.notificationSettings, notifications);
		}, 1000);
		return () => clearTimeout(timeoutId);
	}, [notifications, profile?.id, profile?.notificationSettings]); // Added profile.notificationSettings

	// Автосохранение настроек безопасности (debounced)
	useEffect(() => {
		const userId = profile?.id;
		if (!userId) {
			return;
		}

		const timeoutId = setTimeout(() => {
			saveSecuritySettings(userId, biometricEnabled, autoBackupEnabled);
		}, 1000);
		return () => clearTimeout(timeoutId);
	}, [biometricEnabled, autoBackupEnabled, profile?.id]);

	// Автосохранение настроек offline режима (debounced)
	useEffect(() => {
		const userId = profile?.id;
		if (!userId) {
			return;
		}

		const timeoutId = setTimeout(() => {
			saveOfflineSettings(userId, offlineEnabled);
		}, 1000);
		return () => clearTimeout(timeoutId);
	}, [offlineEnabled, profile?.id]);

	const handleLogout = () => {
		if (onLogout) {
			onLogout();
		}
	};

	// Обработчик смены языка
	const handleLanguageChangeLocal = async (languageCode: string) => {
		await handleLanguageChangeUtil({
			languageCode,
			userId: profile?.id,
			profile,
			setProfile,
			onProfileUpdate,
			changeLanguage: changeLanguage as (code: string) => Promise<void>,
			t,
			setShowLanguage,
		});
	};

	// ✅ Show skeleton loader while loading
	if (isLoading) {
		return <SettingsScreenSkeleton />;
	}

	return (
		<div className="min-h-screen bg-background pb-20">
			{/* Profile Section */}
			<ProfileHeader onEditClick={() => setShowEditProfile(true)} profile={profile} />

			{/* Уведомления */}
			<NotificationsSection
				notifications={notifications}
				onNotificationsChange={setNotifications}
				profile={profile}
				t={t}
				userId={profile?.id}
			/>

			{/* Темы оформления - shadcn/ui стандарт */}
			<SettingsSection title={t('themes', 'Темы оформления')}>
				<SettingsRow
					customRightElement={<ThemeToggle />}
					description={t('appearanceDescription' as any, 'Переключение темы')}
					icon={Palette}
					iconBgColor="bg-(--ios-purple)/10"
					iconColor="text-(--ios-purple)"
					rightElement="custom"
					title={t('appearance' as any, 'Внешний вид')}
				/>
			</SettingsSection>

			{/* Безопасность и приватность */}
			<SecuritySection
				autoBackupEnabled={autoBackupEnabled}
				biometricAvailable={biometricAvailable}
				biometricEnabled={biometricEnabled}
				isPremium={userData?.isPremium}
				onAutoBackupChange={setAutoBackupEnabled}
				onBiometricChange={setBiometricEnabled}
				onPremiumRequired={() => setShowPremium(true)}
				t={t}
			/>

			{/* Offline режим */}
			<OfflineSection
				isPremium={userData?.isPremium}
				offlineEnabled={offlineEnabled}
				onOfflineChange={setOfflineEnabled}
				onOfflineSettingsClick={() => setShowOfflineSettings(true)}
				onPremiumRequired={() => setShowPremium(true)}
				t={t}
			/>

			{/* Персонализация */}
			<CategoriesSection onCategoriesClick={() => setShowCategories(true)} t={t} />

			{/* Дополнительно */}
			<AdditionalSection
				currentLanguage={profile?.language}
				firstDayOfWeek={userData?.firstDayOfWeek}
				languageName={languages.find((l) => l.code === profile?.language)?.native_name || 'Русский'}
				onLanguageClick={() => setShowLanguage(true)}
				t={t}
			/>

			{/* Поддержка */}
			<SupportSection
				onFAQClick={() => setShowFAQ(true)}
				onPWAInstallClick={() => setShowPWAInstall(true)}
				onRateAppClick={() => setShowRateApp(true)}
				onSupportClick={() => setShowSupport(true)}
				t={t}
			/>

			{/* Logout Button */}
			<div className="px-4 pt-6 pb-8">
				<Button
					className="h-14 w-full border-red-200 font-medium text-red-600 hover:border-red-300 hover:bg-red-50"
					onClick={handleLogout}
					variant="outline"
				>
					<LogOut className="mr-2 h-5 w-5" strokeWidth={2} />
					{t('logout', 'Выйти')}
				</Button>
			</div>

			{/* FAQ Modal */}
			<AnimatePresence>
				<FAQModal isOpen={showFAQ} onClose={() => setShowFAQ(false)} t={t} />
			</AnimatePresence>

			{/* Contact Support Modal */}
			<AnimatePresence>
				<SupportModal
					isOpen={showSupport}
					onClose={() => setShowSupport(false)}
					t={t}
					userEmail={profile?.email}
				/>
			</AnimatePresence>

			{/* Rate App Modal */}
			<AnimatePresence>
				<RateAppModal isOpen={showRateApp} onClose={() => setShowRateApp(false)} />
			</AnimatePresence>

			{/* Language Selection Modal */}
			<AnimatePresence>
				<LanguageModal
					currentLanguage={profile?.language}
					isOpen={showLanguage}
					languages={languages}
					onClose={() => setShowLanguage(false)}
					onLanguageChange={handleLanguageChangeLocal}
					t={t}
				/>
			</AnimatePresence>

			{/* PWA Install Modal */}
			<AnimatePresence>
				<PWAInstallModal isOpen={showPWAInstall} onClose={() => setShowPWAInstall(false)} t={t} />
			</AnimatePresence>

			{/* Categories Modal */}
			<CategoriesModal
				isOpen={showCategories}
				onClose={() => setShowCategories(false)}
				t={t}
				userId={profile?.id}
			/>

			{/* Offline Settings Modal */}
			<AnimatePresence>
				<OfflineSettingsModal
					isOpen={showOfflineSettings}
					onClose={() => setShowOfflineSettings(false)}
					t={t}
				/>
			</AnimatePresence>

			{/* Premium Modal */}
			<PremiumModal onClose={() => setShowPremium(false)} open={showPremium} />

			{/* Profile Edit Modal */}
			<ProfileEditModal
				isOpen={showEditProfile}
				onClose={() => setShowEditProfile(false)}
				onProfileUpdated={(updatedProfile) => {
					console.log('✅ Profile updated in SettingsScreen:', updatedProfile);
					// Update local state immediately for real-time display
					setProfile(updatedProfile);
					// Update global state in App.tsx
					if (onProfileUpdate) {
						onProfileUpdate(updatedProfile);
					}
				}}
				profile={{
					id: profile?.id || '',
					name: profile?.name || '',
					email: profile?.email || '',
					avatar: profile?.avatar || '',
					diaryName: profile?.diaryName || profile?.diary_name || 'Мой дневник',
					diaryEmoji: profile?.diaryEmoji || profile?.diary_emoji || '📝',
				}}
			/>
		</div>
	);
}

export default SettingsScreen;
