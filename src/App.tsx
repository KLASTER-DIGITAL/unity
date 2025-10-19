import { useState, useEffect, Suspense, lazy } from "react";
import { checkSession, signOut } from "./utils/auth";
import { ThemeProvider } from "@/shared/components/theme-provider";

// Lazy load app-level components for code splitting
const MobileApp = lazy(() => import("@/app/mobile").then(module => ({ default: module.MobileApp })));
const AdminApp = lazy(() => import("@/app/admin").then(module => ({ default: module.AdminApp })));

// Onboarding data interface
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

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("ru");
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  // Onboarding data state
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    language: 'ru',
    diaryName: 'Мой дневник',
    diaryEmoji: '🏆',
    notificationSettings: {
      selectedTime: 'none',
      morningTime: '08:00',
      eveningTime: '21:00',
      permissionGranted: false
    },
    firstEntry: ''
  });

  // Check admin route via query parameter OR user role
  useEffect(() => {
    const checkAdminRoute = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const isAdminParam = urlParams.get('view') === 'admin';

      // Check if user has super_admin role
      const isSuperAdmin = userData?.profile?.role === 'super_admin' || userData?.role === 'super_admin';

      // Set admin route if query param OR user is super_admin
      const shouldShowAdmin = isAdminParam || isSuperAdmin;
      setIsAdminRoute(shouldShowAdmin);

      // Auto-redirect super_admin to admin panel
      if (isSuperAdmin && !isAdminParam) {
        console.log('🔐 Super admin detected, redirecting to admin panel');
        window.history.pushState({}, '', '?view=admin');
      }

      if (shouldShowAdmin && !userData) {
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
        console.log("🔍 Session check result:", session);

        // Check if session is successful (has user data)
        if (session && session.success !== false && session.user) {
          setUserData(session);

          // ✅ Проверяем onboardingCompleted из профиля
          if (session.profile?.onboardingCompleted) {
            console.log("✅ Onboarding complete, going to step 5");
            setOnboardingComplete(true);
            setCurrentStep(5);
          } else {
            console.log("⚠️ Session exists but onboarding not complete, going to step 2");
            setCurrentStep(2);
          }
        } else {
          console.log("ℹ️ No session found, staying at step 1 (WelcomeScreen)");
          // Explicitly stay at step 1 for WelcomeScreen
          setCurrentStep(1);
        }
      } catch (error) {
        console.error("Session check error:", error);
        // On error, also stay at step 1
        setCurrentStep(1);
      } finally {
        setIsCheckingSession(false);
      }
    };

    initSession();
  }, []);

  const handleWelcomeComplete = (language: string) => {
    setSelectedLanguage(language);
    setOnboardingData(prev => ({ ...prev, language }));
    setCurrentStep(2);
  };

  const handleWelcomeSkip = () => {
    setAuthMode('login'); // Пользователь хочет войти
    setShowAuth(true);
  };

  const handleOnboarding2Complete = () => {
    setCurrentStep(3);
  };

  const handleOnboarding3Complete = (diaryName: string, emoji: string) => {
    setOnboardingData(prev => ({
      ...prev,
      diaryName,
      diaryEmoji: emoji
    }));
    setCurrentStep(4);
  };

  const handleOnboarding4Complete = (firstEntry: string, settings: any) => {
    setOnboardingData(prev => ({
      ...prev,
      firstEntry,
      notificationSettings: settings
    }));
    // Показываем AuthScreen с сохраненными данными
    setAuthMode('register'); // Пользователь прошел онбординг, нужна регистрация
    setShowAuth(true);
  };

  const handleAuthComplete = async (user: any) => {
    setUserData(user);
    setShowAuth(false);

    if (user.onboardingCompleted) {
      setOnboardingComplete(true);
      setCurrentStep(5);
    } else {
      setCurrentStep(2);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUserData(null);
    setOnboardingComplete(false);
    setCurrentStep(1);
    setShowAdminAuth(false);
  };

  const handleAdminAuthComplete = (adminUser: any) => {
    setUserData(adminUser);
    setShowAdminAuth(false);
  };

  const handleProfileUpdate = (updatedProfile: any) => {
    console.log('🔄 [App.tsx] Updating userData with new profile:', updatedProfile);
    setUserData((prev: any) => ({
      ...prev,
      profile: updatedProfile
    }));
  };

  // Admin view
  if (isAdminRoute) {
    if (isCheckingSession) {
      return (
        <ThemeProvider defaultTheme="light" storageKey="unity-theme">
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Загрузка...</p>
            </div>
          </div>
        </ThemeProvider>
      );
    }

    return (
      <ThemeProvider defaultTheme="light" storageKey="unity-theme">
        <AdminApp
          userData={userData}
          showAdminAuth={showAdminAuth}
          onAuthComplete={handleAdminAuthComplete}
          onLogout={handleLogout}
          onBack={() => {
            window.location.href = '/';
          }}
        />
      </ThemeProvider>
    );
  }

  // Mobile view - loading state
  if (isCheckingSession) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="unity-theme">
        <div className="min-h-screen flex items-center justify-center bg-background max-w-md mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="unity-theme">
      <MobileApp
        userData={userData}
        onboardingComplete={onboardingComplete}
        currentStep={currentStep}
        selectedLanguage={selectedLanguage}
        showAuth={showAuth}
        authMode={authMode}
        onboardingData={onboardingData}
        onWelcomeComplete={handleWelcomeComplete}
        onWelcomeSkip={handleWelcomeSkip}
        onOnboarding2Complete={handleOnboarding2Complete}
        onOnboarding3Complete={handleOnboarding3Complete}
        onOnboarding4Complete={handleOnboarding4Complete}
        onAuthComplete={handleAuthComplete}
        onLogout={handleLogout}
        onProfileUpdate={handleProfileUpdate}
      />
    </ThemeProvider>
  );
}

