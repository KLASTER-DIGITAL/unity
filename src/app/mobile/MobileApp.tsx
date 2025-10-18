import { useState } from "react";
import { Toaster } from "sonner";
import { TranslationProvider } from "@/shared/lib/i18n";
import { TranslationManager } from "@/shared/lib/i18n";

// Onboarding screens
import { WelcomeScreen } from "@/features/mobile/auth/components/WelcomeScreen";
import { OnboardingScreen2 } from "@/features/mobile/auth/components/OnboardingScreen2";
import { OnboardingScreen3 } from "@/features/mobile/auth/components/OnboardingScreen3";
import { OnboardingScreen4 } from "@/features/mobile/auth/components/OnboardingScreen4";

// Auth screen
import { AuthScreen } from "@/features/mobile/auth/components/AuthScreenNew";

// Main screens - using feature flags
import { SettingsScreen } from "@/features/mobile/settings";
import { AchievementHomeScreen } from "@/features/mobile/home";
import { HistoryScreen } from "@/features/mobile/history";
import { AchievementsScreen } from "@/features/mobile/achievements";
import { ReportsScreen } from "@/features/mobile/reports";

// Layout components
import { MobileBottomNav } from "@/shared/components/layout";

interface OnboardingData {
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

interface MobileAppProps {
  userData: any;
  onboardingComplete: boolean;
  currentStep: number;
  selectedLanguage: string;
  showAuth: boolean;
  authMode: 'login' | 'register';
  onboardingData: OnboardingData;
  onWelcomeComplete: (language: string) => void;
  onWelcomeSkip: () => void;
  onOnboarding2Complete: () => void;
  onOnboarding3Complete: (diaryName: string, emoji: string) => void;
  onOnboarding4Complete: (firstEntry: string, settings: any) => void;
  onAuthComplete: (userData: any) => void;
  onLogout: () => void;
}

export function MobileApp({
  userData,
  onboardingComplete,
  currentStep,
  selectedLanguage,
  showAuth,
  authMode,
  onboardingData,
  onWelcomeComplete,
  onWelcomeSkip,
  onOnboarding2Complete,
  onOnboarding3Complete,
  onOnboarding4Complete,
  onAuthComplete,
  onLogout,
}: MobileAppProps) {
  const [activeScreen, setActiveScreen] = useState<
    "home" | "history" | "achievements" | "reports" | "settings"
  >("home");

  // Show auth screen if user clicked "У меня уже есть аккаунт" or completed onboarding
  if (showAuth && !userData) {
    return (
      <TranslationProvider defaultLanguage={selectedLanguage} fallbackLanguage="ru">
        <TranslationManager preloadLanguages={['en']}>
          <AuthScreen
            onAuthComplete={onAuthComplete}
            onboardingData={onboardingData}
            selectedLanguage={selectedLanguage}
            initialMode={authMode}
          />
          <Toaster position="top-center" />
        </TranslationManager>
      </TranslationProvider>
    );
  }

  // Show onboarding flow if not completed
  if (!onboardingComplete) {
    const totalSteps = 4;

    return (
      <TranslationProvider defaultLanguage={selectedLanguage} fallbackLanguage="ru">
        <TranslationManager preloadLanguages={['en']}>
          {currentStep === 1 && <WelcomeScreen onNext={onWelcomeComplete} onSkip={onWelcomeSkip} currentStep={currentStep} totalSteps={4} onStepClick={() => {}} />}
          {currentStep === 2 && (
            <OnboardingScreen2
              onNext={onOnboarding2Complete}
              selectedLanguage={selectedLanguage}
              currentStep={currentStep - 1}
              totalSteps={totalSteps}
              onStepClick={() => {}}
            />
          )}
          {currentStep === 3 && (
            <OnboardingScreen3
              onNext={onOnboarding3Complete}
              selectedLanguage={selectedLanguage}
              currentStep={currentStep - 1}
              totalSteps={totalSteps}
              onStepClick={() => {}}
            />
          )}
          {currentStep === 4 && (
            <OnboardingScreen4
              onNext={onOnboarding4Complete}
              selectedLanguage={selectedLanguage}
              currentStep={currentStep - 1}
              totalSteps={totalSteps}
              onStepClick={() => {}}
            />
          )}
          <Toaster position="top-center" />
        </TranslationManager>
      </TranslationProvider>
    );
  }

  // Show auth screen if no user data or onboarding not complete
  // ✅ FIX: Проверяем userData.id ИЛИ userData.user.id
  // После регистрации userData имеет структуру: {id, email, name, onboardingCompleted, ...}
  // После checkSession userData имеет структуру: {success, user, profile, ...}
  const hasUser = userData && (userData.id || (userData.user && userData.user.id));

  if (!hasUser) {
    return (
      <TranslationProvider defaultLanguage={selectedLanguage} fallbackLanguage="ru">
        <TranslationManager preloadLanguages={['en']}>
          <div className="min-h-screen bg-gray-50">
            <AuthScreen onComplete={onAuthComplete} />
            <Toaster position="top-center" />
          </div>
        </TranslationManager>
      </TranslationProvider>
    );
  }

  // Main mobile app - only show if user is authenticated
  return (
    <TranslationProvider defaultLanguage={selectedLanguage} fallbackLanguage="ru">
      <TranslationManager preloadLanguages={['en']}>
        <div className="min-h-screen bg-gray-50">
          {activeScreen === "home" && (
            <AchievementHomeScreen
              userData={userData}
              onNavigate={setActiveScreen}
              onLogout={onLogout}
            />
          )}
          {activeScreen === "history" && (
            <HistoryScreen
              userData={userData}
              onNavigate={setActiveScreen}
            />
          )}
          {activeScreen === "achievements" && (
            <AchievementsScreen
              userData={userData}
              onNavigate={setActiveScreen}
            />
          )}
          {activeScreen === "reports" && (
            <ReportsScreen
              userData={userData}
              onNavigate={setActiveScreen}
            />
          )}
          {activeScreen === "settings" && (
            <SettingsScreen
              userData={userData}
              onNavigate={setActiveScreen}
              onLogout={onLogout}
            />
          )}

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav
            activeTab={activeScreen}
            onTabChange={setActiveScreen}
            language={userData?.language || 'ru'}
          />

          <Toaster position="top-center" />
        </div>
      </TranslationManager>
    </TranslationProvider>
  );
}

