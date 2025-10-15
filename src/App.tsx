import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { checkSession, signOut } from "./utils/auth";
import { updateUserProfile } from "./utils/api";
import { isPWAEnabled, logPWADebugInfo } from "./utils/pwaUtils";

// Layout components
import { MobileBottomNav } from "./components/MobileBottomNav";

// Auth screens
import { WelcomeScreen } from "./components/WelcomeScreen";
import { OnboardingScreen2 } from "./components/OnboardingScreen2";
import { OnboardingScreen3 } from "./components/OnboardingScreen3";
import { OnboardingScreen4 } from "./components/OnboardingScreen4";
import { AuthScreen } from "./components/AuthScreen";

// Main screens
import { HistoryScreen } from "./components/screens/HistoryScreen";
import { AchievementsScreen } from "./components/screens/AchievementsScreen";
import { ReportsScreen } from "./components/screens/ReportsScreen";

// Admin screens
import { AdminLoginScreen } from "./components/AdminLoginScreen";
import { AdminDashboard } from "./components/screens/AdminDashboard";

// PWA components - Feature flag for gradual migration
// Set VITE_USE_NEW_PWA=true in .env to use new PWA components from @/shared
const USE_NEW_PWA = false; // Change to true to test new PWA components

// Old PWA components (current)
import { InstallPrompt as OldInstallPrompt } from "./components/InstallPrompt";
import { PWAHead as OldPWAHead } from "./components/PWAHead";
import { PWAStatus as OldPWAStatus } from "./components/PWAStatus";
import { PWAUpdatePrompt as OldPWAUpdatePrompt } from "./components/PWAUpdatePrompt";
import { PWASplash as OldPWASplash } from "./components/PWASplash";

// New PWA components (migrated to shared)
import {
  InstallPrompt as NewInstallPrompt,
  PWAHead as NewPWAHead,
  PWAStatus as NewPWAStatus,
  PWAUpdatePrompt as NewPWAUpdatePrompt,
  PWASplash as NewPWASplash
} from "@/shared/components/pwa";

// Select which version to use based on feature flag
const InstallPrompt = USE_NEW_PWA ? NewInstallPrompt : OldInstallPrompt;
const PWAHead = USE_NEW_PWA ? NewPWAHead : OldPWAHead;
const PWAStatus = USE_NEW_PWA ? NewPWAStatus : OldPWAStatus;
const PWAUpdatePrompt = USE_NEW_PWA ? NewPWAUpdatePrompt : OldPWAUpdatePrompt;
const PWASplash = USE_NEW_PWA ? NewPWASplash : OldPWASplash;

// i18n components - Feature flag for gradual migration
// Set USE_NEW_I18N=true to use new i18n system from @/shared/lib/i18n
const USE_NEW_I18N = false; // Change to true to test new i18n system

// Old i18n components (current)
import {
  TranslationProvider as OldTranslationProvider,
  TranslationManager as OldTranslationManager
} from "./components/i18n";
import { TranslationDebugInfo } from "./components/i18n/TranslationLoader";
import { I18nTestComponent } from "./components/i18n/I18nTestComponent";

// New i18n components (migrated to shared)
import {
  TranslationProvider as NewTranslationProvider,
  TranslationManager as NewTranslationManager
} from "@/shared/lib/i18n";

// Select which version to use based on feature flag
const TranslationProvider = USE_NEW_I18N ? NewTranslationProvider : OldTranslationProvider;
const TranslationManager = USE_NEW_I18N ? NewTranslationManager : OldTranslationManager;

// Settings screen - Feature flag for gradual migration
// Set USE_NEW_SETTINGS=true to use new Settings from @/features/mobile/settings
const USE_NEW_SETTINGS = false; // Change to true to test new Settings screen

// Old Settings screen (current)
import { SettingsScreen as OldSettingsScreen } from "./components/screens/SettingsScreen";

// New Settings screen (migrated to features)
import { SettingsScreen as NewSettingsScreen } from "@/features/mobile/settings";

// Select which version to use based on feature flag
const SettingsScreen = USE_NEW_SETTINGS ? NewSettingsScreen : OldSettingsScreen;

// Home screen - Feature flag for gradual migration
// Set USE_NEW_HOME=true to use new Home from @/features/mobile/home
const USE_NEW_HOME = false; // Change to true to test new Home screen

// Old Home screen (current)
import { AchievementHomeScreen as OldAchievementHomeScreen } from "./components/screens/AchievementHomeScreen";

// New Home screen (migrated to features)
import { AchievementHomeScreen as NewAchievementHomeScreen } from "@/features/mobile/home";

// Select which version to use based on feature flag
const AchievementHomeScreen = USE_NEW_HOME ? NewAchievementHomeScreen : OldAchievementHomeScreen;

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [showAuth, setShowAuth] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("ru");
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);

  // Check admin route via query parameter
  useEffect(() => {
    const checkAdminRoute = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const isAdmin = urlParams.get('view') === 'admin';
      setIsAdminRoute(isAdmin);
      
      if (isAdmin && !userData) {
        setShowAdminAuth(true);
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);

    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, [userData]);

  // Check session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const session = await checkSession();
        if (session) {
          setUserData(session);
          
          if (session.onboardingComplete) {
            setOnboardingComplete(true);
            setCurrentStep(5);
          } else {
            setCurrentStep(2);
          }
        } else {
          setShowAuth(false);
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    initSession();
  }, []);

  // PWA install prompt
  useEffect(() => {
    if (!isPWAEnabled()) return;

    logPWADebugInfo();

    let deferredPrompt: any;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      
      const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-seen');
      if (!hasSeenPrompt && onboardingComplete) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [onboardingComplete]);

  const handleInstallClick = async () => {
    const deferredPrompt = (window as any).deferredPrompt;
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    (window as any).deferredPrompt = null;
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-prompt-seen', 'true');
  };

  const handleInstallClose = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-prompt-seen', 'true');
  };

  const handleWelcomeComplete = (language: string) => {
    setSelectedLanguage(language);
    setCurrentStep(2);
  };

  const handleOnboarding2Complete = () => {
    setCurrentStep(3);
  };

  const handleOnboarding3Complete = () => {
    setCurrentStep(4);
  };

  const handleOnboarding4Complete = () => {
    setShowAuth(true);
  };

  const handleAuthComplete = async (user: any) => {
    setUserData(user);
    setShowAuth(false);
    
    if (user.onboardingComplete) {
      setOnboardingComplete(true);
      setCurrentStep(5);
    } else {
      setCurrentStep(2);
    }
  };

  const handleProfileComplete = async (profileData: any) => {
    try {
      await updateUserProfile(userData.id, {
        ...profileData,
        onboardingComplete: true
      });
      
      setUserData({
        ...userData,
        ...profileData,
        onboardingComplete: true
      });
      
      setOnboardingComplete(true);
      setCurrentStep(5);
    } catch (error) {
      console.error("Profile update error:", error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUserData(null);
    setOnboardingComplete(false);
    setCurrentStep(1);
    setActiveTab("home");
    setShowAdminAuth(false);
  };

  const handleAdminAuthComplete = (adminUser: any) => {
    setUserData(adminUser);
    setShowAdminAuth(false);
  };

  // Admin view
  if (isAdminRoute) {
    if (isCheckingSession) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка...</p>
          </div>
        </div>
      );
    }

    if (showAdminAuth) {
      return (
        <TranslationProvider defaultLanguage="ru" fallbackLanguage="ru">
          <TranslationManager preloadLanguages={['en']}>
            <div className="min-h-screen bg-gray-50">
              <AdminLoginScreen 
                onComplete={handleAdminAuthComplete}
                onBack={() => {
                  window.location.href = '/';
                }}
              />
              <Toaster position="top-center" />
            </div>
          </TranslationManager>
        </TranslationProvider>
      );
    }

    return (
      <TranslationProvider defaultLanguage="ru" fallbackLanguage="ru">
        <TranslationManager preloadLanguages={['en']}>
          <div className="min-h-screen bg-gray-50">
            <AdminDashboard 
              userData={userData} 
              onLogout={handleLogout}
            />
            <Toaster position="top-center" />
          </div>
        </TranslationManager>
      </TranslationProvider>
    );
  }

  // Mobile view - loading state
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 max-w-md mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  const renderActiveScreen = () => {
    if (showAuth) {
      return (
        <AuthScreen
          onComplete={handleAuthComplete}
          onBack={() => setShowAuth(false)}
          showTopBar={true}
          selectedLanguage={selectedLanguage}
        />
      );
    }

    if (!onboardingComplete) {
      switch (currentStep) {
        case 1:
          return <WelcomeScreen onComplete={handleWelcomeComplete} />;
        case 2:
          return <OnboardingScreen2 onComplete={handleOnboarding2Complete} selectedLanguage={selectedLanguage} />;
        case 3:
          return <OnboardingScreen3 onComplete={handleOnboarding3Complete} selectedLanguage={selectedLanguage} />;
        case 4:
          return <OnboardingScreen4 onComplete={handleOnboarding4Complete} selectedLanguage={selectedLanguage} />;
        default:
          return <WelcomeScreen onComplete={handleWelcomeComplete} />;
      }
    }

    switch (activeTab) {
      case "home":
        return <AchievementHomeScreen userData={userData} selectedLanguage={selectedLanguage} />;
      case "history":
        return <HistoryScreen userData={userData} selectedLanguage={selectedLanguage} />;
      case "achievements":
        return <AchievementsScreen userData={userData} selectedLanguage={selectedLanguage} />;
      case "reports":
        return <ReportsScreen userData={userData} selectedLanguage={selectedLanguage} />;
      case "settings":
        return <SettingsScreen userData={userData} onLogout={handleLogout} selectedLanguage={selectedLanguage} />;
      default:
        return <AchievementHomeScreen userData={userData} selectedLanguage={selectedLanguage} />;
    }
  };

  return (
    <TranslationProvider defaultLanguage={selectedLanguage} fallbackLanguage="ru">
      <TranslationManager preloadLanguages={['en']}>
        <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative overflow-x-hidden scrollbar-hide">
          <PWAHead />
          <PWASplash />

          <main className="min-h-screen overflow-x-hidden scrollbar-hide">
            {renderActiveScreen()}
          </main>

          {onboardingComplete && (
            <MobileBottomNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
              language={selectedLanguage as any}
            />
          )}

          <Toaster position="top-center" toastOptions={{ style: { fontFamily: 'var(--font-family-primary)' } }} />

          {showInstallPrompt && <InstallPrompt onClose={handleInstallClose} onInstall={handleInstallClick} />}

          <PWAStatus />
          <PWAUpdatePrompt />

          {process.env.NODE_ENV === 'development' && <TranslationDebugInfo show={true} />}
          {process.env.NODE_ENV === 'development' && window.location.search.includes('i18n-test') && (
            <div className="absolute inset-0 bg-white z-50 overflow-auto">
              <I18nTestComponent />
            </div>
          )}
        </div>
      </TranslationManager>
    </TranslationProvider>
  );
}

