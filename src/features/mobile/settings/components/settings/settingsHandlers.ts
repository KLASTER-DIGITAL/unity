import { updateUserProfile } from "@/shared/lib/api";
import { toast } from "sonner";
import type { NotificationSettings } from "./types";

/**
 * Load active languages from API
 */
export async function loadLanguages() {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translations-api/languages`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
      }
    });
    if (response.ok) {
      const data = await response.json();
      const loadedLanguages = Array.isArray(data) ? data : (data.languages || []);
      // Фильтруем только активные языки
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
    } catch (error) {
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
  currentSettings: any,
  newSettings: NotificationSettings
) {
  try {
    await updateUserProfile(userId, {
      notificationSettings: {
        ...currentSettings,
        ...newSettings
      }
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
      biometricEnabled: biometricEnabled,
      backupEnabled: autoBackupEnabled
    });
    console.log('✅ Security settings saved');
  } catch (error) {
    console.error('❌ Error saving security settings:', error);
  }
}

interface LanguageChangeParams {
  languageCode: string;
  userId?: string;
  profile: any;
  setProfile: (updater: (prev: any) => any) => void;
  onProfileUpdate?: (profile: any) => void;
  changeLanguage: (code: string) => Promise<void>;
  t: any;
  setShowLanguage: (show: boolean) => void;
}

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
  setShowLanguage
}: LanguageChangeParams) {
  try {
    if (userId) {
      // Сохраняем язык в базу данных
      await updateUserProfile(userId, { language: languageCode });
      console.log(`✅ Language "${languageCode}" saved to DB`);

      // Обновляем локальный профиль
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

