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

// Import modular components and handlers
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
  PWAInstallModal,
  loadLanguages,
  checkBiometricAvailability,
  saveNotificationSettings,
  saveSecuritySettings,
  handleLanguageChange as handleLanguageChangeUtil
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
    loadLanguages().then(langs => {
      if (langs) setLanguages(langs);
    });
  }, []);

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

  // Автосохранение уведомлений (debounced)
  useEffect(() => {
    const userId = profile?.id;
    if (!userId) return;

    const timeoutId = setTimeout(() => {
      saveNotificationSettings(userId, profile.notificationSettings, notifications);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [notifications, profile?.id, profile?.notificationSettings]); // Added profile.notificationSettings

  // Автосохранение настроек безопасности (debounced)
  useEffect(() => {
    const userId = profile?.id;
    if (!userId) return;

    const timeoutId = setTimeout(() => {
      saveSecuritySettings(userId, biometricEnabled, autoBackupEnabled);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [biometricEnabled, autoBackupEnabled, profile?.id]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };



  // Обработчик смены языка
  const handleLanguageChangeLocal = (languageCode: string) => handleLanguageChangeUtil({
    languageCode,
    userId: profile?.id,
    profile,
    setProfile,
    onProfileUpdate,
    changeLanguage,
    t,
    setShowLanguage
  });

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
          onLanguageChange={handleLanguageChangeLocal}
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

