/**
 * Settings Screen - Modular exports
 */

export { AdditionalSection } from './AdditionalSection';
export { CategoriesSection } from './CategoriesSection';
export { DEFAULT_AVATAR_URL, DEFAULT_LANGUAGES } from './constants';
// Modals
export {
  CategoriesModal,
  FAQModal,
  LanguageModal,
  OfflineSettingsModal,
  PWAInstallModal,
  RateAppModal,
  SupportModal,
} from './modals';
export { NotificationsSection } from './NotificationsSection';
export { OfflineSection } from './OfflineSection';
export { ProfileHeader } from './ProfileHeader';
export { SecuritySection } from './SecuritySection';
export { SupportSection } from './SupportSection';
// Handlers
export {
  checkBiometricAvailability,
  handleLanguageChange,
  loadLanguages,
  saveNotificationSettings,
  saveOfflineSettings,
  saveSecuritySettings,
} from './settingsHandlers';
export type { Language, NotificationSettings, SettingsScreenProps } from './types';
