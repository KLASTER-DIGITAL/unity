/**
 * Settings Screen - Modular exports
 */

export { DEFAULT_AVATAR_URL, DEFAULT_LANGUAGES } from "./constants";
export { NotificationsSection } from "./NotificationsSection";
export { SecuritySection } from "./SecuritySection";
export { OfflineSection } from "./OfflineSection";
export { ProfileHeader } from "./ProfileHeader";
export { AdditionalSection } from "./AdditionalSection";
export { SupportSection } from "./SupportSection";
export { CategoriesSection } from "./CategoriesSection";
export type { SettingsScreenProps, NotificationSettings, Language } from "./types";

// Modals
export {
  FAQModal,
  SupportModal,
  RateAppModal,
  LanguageModal,
  PWAInstallModal,
  CategoriesModal,
  OfflineSettingsModal
} from "./modals";

// Handlers
export {
  loadLanguages,
  checkBiometricAvailability,
  saveNotificationSettings,
  saveSecuritySettings,
  saveOfflineSettings,
  handleLanguageChange
} from "./settingsHandlers";

