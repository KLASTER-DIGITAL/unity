import { useState } from "react";
import { Toaster } from "sonner";
import { TranslationProvider } from "@/shared/lib/i18n";
import { TranslationManager } from "@/shared/lib/i18n";

// Onboarding screens
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { OnboardingScreen2 } from "@/components/OnboardingScreen2";
import { OnboardingScreen3 } from "@/components/OnboardingScreen3";
import { OnboardingScreen4 } from "@/components/OnboardingScreen4";

// Auth screen
import { AuthScreen } from "@/components/AuthScreen";

// Main screens - using feature flags
import { SettingsScreen } from "@/features/mobile/settings";
import { AchievementHomeScreen } from "@/features/mobile/home";
import { HistoryScreen } from "@/features/mobile/history";
import { AchievementsScreen } from "@/features/mobile/achievements";
import { ReportsScreen } from "@/features/mobile/reports";

interface MobileAppProps {
  userData: any;
  onboardingComplete: boolean;
  currentStep: number;
  selectedLanguage: string;
  onWelcomeComplete: (language: string) => void;
  onOnboarding2Complete: () => void;
  onOnboarding3Complete: () => void;
  onOnboarding4Complete: () => void;
  onAuthComplete: (userData: any) => void;
  onLogout: () => void;
}

export function MobileApp({
  userData,
  onboardingComplete,
  currentStep,
  selectedLanguage,
  onWelcomeComplete,
  onOnboarding2Complete,
  onOnboarding3Complete,
  onOnboarding4Complete,
  onAuthComplete,
  onLogout,
}: MobileAppProps) {
  const [activeScreen, setActiveScreen] = useState<
    "home" | "history" | "achievements" | "reports" | "settings"
  >("home");

  // Show onboarding flow if not completed
  if (!onboardingComplete) {
    switch (currentStep) {
      case 1:
        return <WelcomeScreen onComplete={onWelcomeComplete} />;
      case 2:
        return <OnboardingScreen2 onComplete={onOnboarding2Complete} selectedLanguage={selectedLanguage} />;
      case 3:
        return <OnboardingScreen3 onComplete={onOnboarding3Complete} selectedLanguage={selectedLanguage} />;
      case 4:
        return <OnboardingScreen4 onComplete={onOnboarding4Complete} selectedLanguage={selectedLanguage} />;
      default:
        return null;
    }
  }

  // Show auth screen if no user data
  if (!userData) {
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

  // Main mobile app
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
          <Toaster position="top-center" />
        </div>
      </TranslationManager>
    </TranslationProvider>
  );
}

