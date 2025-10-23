/**
 * Types for Onboarding Screen 4
 */

export interface OnboardingScreen4Props {
  selectedLanguage: string;
  onNext: (firstEntry: string, notificationSettings: NotificationSettings) => void;
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
}

export interface NotificationSettings {
  selectedTime: 'none' | 'morning' | 'evening' | 'both';
  morningTime: string;
  eveningTime: string;
  permissionGranted: boolean;
}

