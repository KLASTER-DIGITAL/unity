import { useState, Suspense, lazy, useRef } from "react";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { TranslationProvider } from "@/shared/lib/i18n";
import { TranslationManager } from "@/shared/lib/i18n";
import { LoadingScreen } from "@/shared/components/LoadingScreen";

// Onboarding screens - критичные для первого запуска, загружаем сразу
import { WelcomeScreen } from "@/features/mobile/auth/components/WelcomeScreen";
import { OnboardingScreen2 } from "@/features/mobile/auth/components/OnboardingScreen2";
import { OnboardingScreen3 } from "@/features/mobile/auth/components/OnboardingScreen3";
import { OnboardingScreen4 } from "@/features/mobile/auth/components/OnboardingScreen4";

// Auth screen - критичный для авторизации, загружаем сразу
import { AuthScreen } from "@/features/mobile/auth/components/AuthScreenNew";

// Main screens - lazy loading для оптимизации производительности
const AchievementHomeScreen = lazy(() => import("@/features/mobile/home").then(module => ({ default: module.AchievementHomeScreen })));
const HistoryScreen = lazy(() => import("@/features/mobile/history").then(module => ({ default: module.HistoryScreen })));
const AchievementsScreen = lazy(() => import("@/features/mobile/achievements").then(module => ({ default: module.AchievementsScreen })));
const ReportsScreen = lazy(() => import("@/features/mobile/reports").then(module => ({ default: module.ReportsScreen })));
const SettingsScreen = lazy(() => import("@/features/mobile/settings").then(module => ({ default: module.SettingsScreen })));

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
  onProfileUpdate?: (updatedProfile: any) => void;
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
  onProfileUpdate,
}: MobileAppProps) {
  const [activeScreen, setActiveScreen] = useState<
    "home" | "history" | "achievements" | "reports" | "settings"
  >("home");
  const [direction, setDirection] = useState(0);
  const prevScreenRef = useRef<string>("home");

  // Tab order for directional animations
  const tabOrder = ["home", "history", "achievements", "reports", "settings"];

  // Handle tab change with direction
  const handleTabChange = (newTab: string) => {
    const prevIndex = tabOrder.indexOf(prevScreenRef.current);
    const newIndex = tabOrder.indexOf(newTab);

    setDirection(newIndex > prevIndex ? 1 : -1);
    prevScreenRef.current = newTab;
    setActiveScreen(newTab as "home" | "history" | "achievements" | "reports" | "settings");
  };

  // Show auth screen if user clicked "У меня уже есть аккаунт" or completed onboarding
  if (showAuth && !userData) {
    return (
      <TranslationProvider defaultLanguage={selectedLanguage} fallbackLanguage="ru">
        <TranslationManager preloadLanguages={['en']} validateCacheOnMount={false}>
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
        <TranslationManager preloadLanguages={['en']} validateCacheOnMount={false}>
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
        <TranslationManager preloadLanguages={['en']} validateCacheOnMount={false}>
          <div className="min-h-[100dvh] bg-gray-50">
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
      <TranslationManager preloadLanguages={['en']} validateCacheOnMount={false}>
        <div className="min-h-[100dvh] bg-background overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {activeScreen === "home" && (
              <motion.div
                key="home"
                custom={direction}
                initial={(dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 })}
                animate={{ x: 0, opacity: 1 }}
                exit={(dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 })}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute inset-0"
              >
                <Suspense fallback={<LoadingScreen />}>
                  <AchievementHomeScreen
                    userData={userData}
                    onNavigateToHistory={() => handleTabChange("history")}
                    onNavigateToSettings={() => handleTabChange("settings")}
                  />
                </Suspense>
              </motion.div>
            )}
            {activeScreen === "history" && (
              <motion.div
                key="history"
                custom={direction}
                initial={(dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 })}
                animate={{ x: 0, opacity: 1 }}
                exit={(dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 })}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute inset-0"
              >
                <Suspense fallback={<LoadingScreen />}>
                  <HistoryScreen
                    userData={userData}
                  />
                </Suspense>
              </motion.div>
            )}
            {activeScreen === "achievements" && (
              <motion.div
                key="achievements"
                custom={direction}
                initial={(dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 })}
                animate={{ x: 0, opacity: 1 }}
                exit={(dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 })}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute inset-0"
              >
                <Suspense fallback={<LoadingScreen />}>
                  <AchievementsScreen
                    userData={userData}
                  />
                </Suspense>
              </motion.div>
            )}
            {activeScreen === "reports" && (
              <motion.div
                key="reports"
                custom={direction}
                initial={(dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 })}
                animate={{ x: 0, opacity: 1 }}
                exit={(dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 })}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute inset-0"
              >
                <Suspense fallback={<LoadingScreen />}>
                  <ReportsScreen
                    userData={userData}
                  />
                </Suspense>
              </motion.div>
            )}
            {activeScreen === "settings" && (
              <motion.div
                key="settings"
                custom={direction}
                initial={(dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 })}
                animate={{ x: 0, opacity: 1 }}
                exit={(dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 })}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute inset-0"
              >
                <Suspense fallback={<LoadingScreen />}>
                  <SettingsScreen
                    userData={userData}
                    onLogout={onLogout}
                    onProfileUpdate={onProfileUpdate}
                  />
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav
            activeTab={activeScreen}
            onTabChange={handleTabChange}
            language={userData?.language || 'ru'}
          />

          <Toaster position="top-center" />
        </div>
      </TranslationManager>
    </TranslationProvider>
  );
}

