/**
 * Types for Onboarding Screen 4
 */

export interface OnboardingScreen4Props {
  selectedLanguage: string;
  onNext: (firstEntry: string, notificationSettings: NotificationSettingsType) => void;
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
}

export interface NotificationSettingsType {
  selectedTime: 'none' | 'morning' | 'evening' | 'both';
  morningTime: string;
  eveningTime: string;
  permissionGranted: boolean;
}

