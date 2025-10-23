import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "@/shared/lib/i18n";
import { updateUserProfile } from "@/shared/lib/api";
import { SettingsRow, SettingsSection } from "./SettingsRow";
import { ThemeToggle } from "@/shared/components/ui/ThemeToggle";
import { PremiumModal } from "./PremiumModal";
import { ProfileEditModal } from "./ProfileEditModal";

// Import modular components
import {
  DEFAULT_AVATAR_URL,
  DEFAULT_LANGUAGES,
  NotificationsSection,
  SecuritySection,
  ProfileHeader,
  AdditionalSection,
  SupportSection,
  FAQModal,
  SupportModal,
  RateAppModal,
  LanguageModal,
  PWAInstallModal
} from "./settings";
import type { SettingsScreenProps, NotificationSettings } from "./settings";

// Re-export types for backward compatibility
export type { SettingsScreenProps };

import {
  LogOut,
  Palette
} from "lucide-react";

export function SettingsScreen({ userData, onLogout, onProfileUpdate }: SettingsScreenProps) {
  // Extract profile from userData (userData = { success, user, profile })
  const initialProfile = userData?.profile || userData;

  // Local state for profile (to update in real-time)
  const [profile, setProfile] = useState(initialProfile);

  const { t, changeLanguage } = useTranslation();

  // State для уведомлений
  const [notifications, setNotifications] = useState<NotificationSettings>({
    dailyReminder: profile?.notificationSettings?.dailyReminder || false,
    weeklyReport: profile?.notificationSettings?.weeklyReport || false,
    achievements: profile?.notificationSettings?.achievements || false,
    motivational: profile?.notificationSettings?.motivational || false,
  });

  // State для настроек безопасности
  const [biometricEnabled, setBiometricEnabled] = useState(profile?.biometricEnabled || false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(profile?.backupEnabled || false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  // State для модальных окон (Drawer - Bottom Sheets)
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showRateApp, setShowRateApp] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showPWAInstall, setShowPWAInstall] = useState(false);

  // Динамическая загрузка языков из API
  const [languages, setLanguages] = useState(DEFAULT_LANGUAGES);

  // Загрузка языков из API при монтировании
  useEffect(() => {
    const loadLanguages = async () => {
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
            setLanguages(activeLanguages);
            console.log('✅ Loaded languages from API:', activeLanguages.length);
          }
        }
      } catch (error) {
        console.error('Error loading languages:', error);
        // Используем fallback языки при ошибке
      }
    };

    loadLanguages();
  }, []);

  // Проверка поддержки WebAuthn для биометрии
  useEffect(() => {
    const checkBiometric = async () => {
      if (window.PublicKeyCredential) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setBiometricAvailable(available);
        } catch (error) {
          setBiometricAvailable(false);
        }
      }
    };
    checkBiometric();
  }, []);



  // Синхронизация локального профиля с userData
  useEffect(() => {
    const newProfile = userData?.profile || userData;
    if (newProfile && newProfile.id !== profile?.id) {
      console.log('🔄 [SettingsScreen] Syncing profile from userData:', newProfile);
      setProfile(newProfile);
    }
  }, [userData]);

  // Синхронизация state с userData при изменении профиля
  useEffect(() => {
    if (profile?.notificationSettings) {
      setNotifications({
        dailyReminder: profile.notificationSettings.dailyReminder || false,
        weeklyReport: profile.notificationSettings.weeklyReport || false,
        achievements: profile.notificationSettings.achievements || false,
        motivational: profile.notificationSettings.motivational || false,
      });
    }
    if (profile?.biometricEnabled !== undefined) {
      setBiometricEnabled(profile.biometricEnabled);
    }
    if (profile?.backupEnabled !== undefined) {
      setAutoBackupEnabled(profile.backupEnabled);
    }
  }, [profile?.id]); // Обновляем только при смене пользователя

  // Автосохранение уведомлений
  useEffect(() => {
    const saveNotifications = async () => {
      const userId = profile?.id;
      if (!userId) return;

      try {
        await updateUserProfile(userId, {
          notificationSettings: {
            ...profile.notificationSettings,
            ...notifications
          }
        });
        console.log('✅ Notifications saved:', notifications);
      } catch (error) {
        console.error('❌ Error saving notifications:', error);
      }
    };

    const timeoutId = setTimeout(saveNotifications, 1000);
    return () => clearTimeout(timeoutId);
  }, [notifications, profile?.id]);

  // Автосохранение настроек безопасности
  useEffect(() => {
    const saveSecurity = async () => {
      const userId = profile?.id;
      if (!userId) return;

      try {
        await updateUserProfile(userId, {
          biometricEnabled: biometricEnabled,
          backupEnabled: autoBackupEnabled
        });
        console.log('✅ Security settings saved');
      } catch (error) {
        console.error('❌ Error saving security settings:', error);
      }
    };

    const timeoutId = setTimeout(saveSecurity, 1000);
    return () => clearTimeout(timeoutId);
  }, [biometricEnabled, autoBackupEnabled, profile?.id]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };



  // Обработчик смены языка
  const handleLanguageChange = async (languageCode: string) => {
    try {
      const userId = profile?.id;
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
  };

  return (
    <div className="pb-20 min-h-screen bg-background">
      {/* Profile Section */}
      <ProfileHeader profile={profile} onEditClick={() => setShowEditProfile(true)} />

      {/* Уведомления */}
      <NotificationsSection
        notifications={notifications}
        onNotificationsChange={setNotifications}
        userId={profile?.id}
        t={t}
      />

      {/* Темы оформления - shadcn/ui стандарт */}
      <SettingsSection title={t.themes || "Темы оформления"}>
        <SettingsRow
          icon={Palette}
          iconColor="text-[var(--ios-purple)]"
          iconBgColor="bg-[var(--ios-purple)]/10"
          title={t.appearance || "Внешний вид"}
          description={t.appearanceDescription || "Переключение темы"}
          rightElement="custom"
          customRightElement={<ThemeToggle />}
        />
      </SettingsSection>

      {/* Безопасность и приватность */}
      <SecuritySection
        biometricEnabled={biometricEnabled}
        biometricAvailable={biometricAvailable}
        autoBackupEnabled={autoBackupEnabled}
        isPremium={userData?.isPremium || false}
        onBiometricChange={setBiometricEnabled}
        onAutoBackupChange={setAutoBackupEnabled}
        onPremiumRequired={() => setShowPremium(true)}
        t={t}
      />

      {/* Дополнительно */}
      <AdditionalSection
        currentLanguage={profile?.language}
        languageName={languages.find(l => l.code === profile?.language)?.native_name || 'Русский'}
        firstDayOfWeek={userData?.firstDayOfWeek}
        onLanguageClick={() => setShowLanguage(true)}
        t={t}
      />

      {/* Поддержка */}
      <SupportSection
        onSupportClick={() => setShowSupport(true)}
        onRateAppClick={() => setShowRateApp(true)}
        onFAQClick={() => setShowFAQ(true)}
        onPWAInstallClick={() => setShowPWAInstall(true)}
        t={t}
      />

      {/* Logout Button */}
      <div className="px-4 pt-6 pb-8">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-14 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 font-medium"
        >
          <LogOut className="h-5 w-5 mr-2" strokeWidth={2} />
          {t.logout || "Выйти"}
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
          userEmail={profile?.email}
          t={t}
        />
      </AnimatePresence>

      {/* Rate App Modal */}
      <AnimatePresence>
        <RateAppModal isOpen={showRateApp} onClose={() => setShowRateApp(false)} />
      </AnimatePresence>

      {/* Language Selection Modal */}
      <AnimatePresence>
        <LanguageModal
          isOpen={showLanguage}
          onClose={() => setShowLanguage(false)}
          languages={languages}
          currentLanguage={profile?.language}
          onLanguageChange={handleLanguageChange}
          t={t}
        />
      </AnimatePresence>

      {/* PWA Install Modal */}
      <AnimatePresence>
        <PWAInstallModal isOpen={showPWAInstall} onClose={() => setShowPWAInstall(false)} t={t} />
      </AnimatePresence>

      {/* Premium Modal */}
      <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        profile={{
          id: profile?.id || '',
          name: profile?.name || '',
          email: profile?.email || '',
          avatar: profile?.avatar || '',
        }}
        onProfileUpdated={(updatedProfile) => {
          console.log('✅ Profile updated in SettingsScreen:', updatedProfile);
          // Update local state immediately for real-time display
          setProfile(updatedProfile);
          // Update global state in App.tsx
          if (onProfileUpdate) {
            onProfileUpdate(updatedProfile);
          }
        }}
      />
    </div>
  );
}

