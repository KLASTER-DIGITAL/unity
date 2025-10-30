/**
 * Types for Settings Screen
 */

export type SettingsScreenProps = {
  userData?: any;
  onLogout?: () => void;
  onProfileUpdate?: (updatedProfile: any) => void;
};

export type NotificationSettings = {
  dailyReminder: boolean;
  weeklyReport: boolean;
  achievements: boolean;
  motivational: boolean;
};

export type Language = {
  code: string;
  name: string;
  native_name: string;
  flag: string;
  is_active: boolean;
};
