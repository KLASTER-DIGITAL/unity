/**
 * Types for Settings Screen
 */

export interface SettingsScreenProps {
  userData?: any;
  onLogout?: () => void;
  onProfileUpdate?: (updatedProfile: any) => void;
}

export interface NotificationSettings {
  dailyReminder: boolean;
  weeklyReport: boolean;
  achievements: boolean;
  motivational: boolean;
}

export interface Language {
  code: string;
  name: string;
  native_name: string;
  flag: string;
  is_active: boolean;
}

