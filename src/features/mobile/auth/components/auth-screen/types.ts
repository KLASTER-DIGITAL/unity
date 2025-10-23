/**
 * Types for AuthScreen components
 */

export interface OnboardingData {
  language: string;
  diaryName: string;
  diaryEmoji: string;
  notificationSettings: {
    selectedTime: 'none' | 'morning' | 'evening' | 'both';
    morningTime: string;
    eveningTime: string;
    permissionGranted: boolean;
  };
  firstEntry: string;
}

export interface AuthScreenProps {
  onComplete?: (userData: any) => void;
  onAuthComplete?: (userData: any) => void;
  onBack?: () => void;
  showTopBar?: boolean;
  contextText?: string;
  selectedLanguage?: string;
  initialMode?: 'login' | 'register';
  onboardingData?: OnboardingData;
}

export interface UserData {
  id: string;
  email: string | null;
  name: string;
  role?: string;
  diaryData: {
    name: string;
    emoji: string;
  };
  diaryName: string;
  diaryEmoji: string;
  language: string;
  notificationSettings: {
    selectedTime: 'none' | 'morning' | 'evening' | 'both';
    morningTime: string;
    eveningTime: string;
    permissionGranted: boolean;
  };
  onboardingCompleted: boolean;
  createdAt: string;
  telegramData?: {
    id: number;
    username?: string;
    photo_url?: string;
  };
}

