import { toast } from 'sonner';
import { updateUserProfile } from '@/shared/lib/api';
import type { NotificationSettings } from './types';

/**
 * Load active languages from API
 */
export async function loadLanguages() {
	try {
		const response = await fetch(
			`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translations-api/languages`,
			{
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
					apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
				},
			}
		);
		if (response.ok) {
			const data = await response.json();
			const loadedLanguages = Array.isArray(data) ? data : data.languages || [];
			// Фильтруем только активные языки
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const activeLanguages = loadedLanguages.filter((lang: any) => lang.is_active || lang.enabled);
			if (activeLanguages.length > 0) {
				console.log('✅ Loaded languages from API:', activeLanguages.length);
				return activeLanguages;
			}
		}
	} catch (error) {
		console.error('Error loading languages:', error);
	}
	return null;
}

/**
 * Check if biometric authentication is available
 */
export async function checkBiometricAvailability(): Promise<boolean> {
	if (window.PublicKeyCredential) {
		try {
			const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
			return available;
		} catch (_error) {
			return false;
		}
	}
	return false;
}

/**
 * Save notification settings to database
 */
export async function saveNotificationSettings(
	userId: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	currentSettings: any, // TODO: Create NotificationSettings type
	newSettings: NotificationSettings
) {
	try {
		await updateUserProfile(userId, {
			notificationSettings: {
				...currentSettings,
				...newSettings,
			},
		});
		console.log('✅ Notifications saved:', newSettings);
	} catch (error) {
		console.error('❌ Error saving notifications:', error);
	}
}

/**
 * Save security settings to database
 */
export async function saveSecuritySettings(
	userId: string,
	biometricEnabled: boolean,
	autoBackupEnabled: boolean
) {
	try {
		await updateUserProfile(userId, {
			biometricEnabled,
			backupEnabled: autoBackupEnabled,
		});
		console.log('✅ Security settings saved');
	} catch (error) {
		console.error('❌ Error saving security settings:', error);
	}
}

/**
 * Save offline mode setting to database
 */
export async function saveOfflineSettings(userId: string, offlineEnabled: boolean) {
	try {
		await updateUserProfile(userId, {
			offlineEnabled,
		});
		console.log('✅ Offline settings saved:', offlineEnabled);
	} catch (error) {
		console.error('❌ Error saving offline settings:', error);
	}
}

type LanguageChangeParams = {
	languageCode: string;
	userId?: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	profile: any; // TODO: Create UserProfile type
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	setProfile: (updater: (prev: any) => any) => void; // TODO: Create UserProfile type
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onProfileUpdate?: (profile: any) => void; // TODO: Create UserProfile type
	changeLanguage: (code: string) => Promise<void>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	t: any; // Translation function
	setShowLanguage: (show: boolean) => void;
};

/**
 * Handle language change
 */
export async function handleLanguageChange({
	languageCode,
	userId,
	profile,
	setProfile,
	onProfileUpdate,
	changeLanguage,
	t,
	setShowLanguage,
}: LanguageChangeParams) {
	try {
		if (userId) {
			// Сохраняем язык в базу данных
			await updateUserProfile(userId, { language: languageCode });
			console.log(`✅ Language "${languageCode}" saved to DB`);

			// Обновляем локальный профиль
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			setProfile((prev: any) => ({ ...prev, language: languageCode }));

			// Вызываем onProfileUpdate если передан
			if (onProfileUpdate) {
				onProfileUpdate({ ...profile, language: languageCode });
			}
		}

		// Переключаем язык в i18n системе
		await changeLanguage(languageCode);

		toast.success(t('languageChanged', 'Язык изменен!'));
		setShowLanguage(false);
	} catch (error) {
		console.error('Error changing language:', error);
		toast.error(t('languageChangeError', 'Ошибка при изменении языка'));
	}
}
