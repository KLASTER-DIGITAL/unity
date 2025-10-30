/**
 * useAppState Hook
 *
 * Централизованное управление состоянием приложения
 * Разбито из App.tsx для соблюдения AI-friendly правила (<250 строк)
 */

import { useState } from 'react';

// Onboarding data interface
export type OnboardingData = {
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
};

/**
 * Hook для управления состоянием приложения
 */
export function useAppState() {
  // Onboarding state
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('ru');

  // User state
  const [userData, setUserData] = useState<any>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [minLoadingTimeElapsed, setMinLoadingTimeElapsed] = useState(false);

  // Route state
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isTestRoute, setIsTestRoute] = useState(false);
  const [isPerformanceRoute, setIsPerformanceRoute] = useState(false);

  // Auth state
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  // PWA state
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Offline state
  const [showSyncComplete, setShowSyncComplete] = useState(false);
  const [syncedCount, setSyncedCount] = useState(0);

  // Onboarding data state
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    language: 'ru',
    diaryName: 'Мой дневник',
    diaryEmoji: '🏆',
    notificationSettings: {
      selectedTime: 'none',
      morningTime: '08:00',
      eveningTime: '21:00',
      permissionGranted: false,
    },
    firstEntry: '',
  });

  return {
    // Onboarding
    currentStep,
    setCurrentStep,
    onboardingComplete,
    setOnboardingComplete,
    selectedLanguage,
    setSelectedLanguage,

    // User
    userData,
    setUserData,
    isCheckingSession,
    setIsCheckingSession,
    minLoadingTimeElapsed,
    setMinLoadingTimeElapsed,

    // Routes
    isAdminRoute,
    setIsAdminRoute,
    isTestRoute,
    setIsTestRoute,
    isPerformanceRoute,
    setIsPerformanceRoute,

    // Auth
    showAdminAuth,
    setShowAdminAuth,
    showAuth,
    setShowAuth,
    authMode,
    setAuthMode,

    // PWA
    showInstallPrompt,
    setShowInstallPrompt,
    deferredPrompt,
    setDeferredPrompt,

    // Offline
    showSyncComplete,
    setShowSyncComplete,
    syncedCount,
    setSyncedCount,

    // Onboarding data
    onboardingData,
    setOnboardingData,
  };
}
