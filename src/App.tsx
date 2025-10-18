import { useState, useEffect } from "react";
import { checkSession, signOut } from "./utils/auth";

// App-level components
import { MobileApp } from "@/app/mobile";
import { AdminApp } from "@/app/admin";

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

    return (
      <AdminApp
        userData={userData}
        showAdminAuth={showAdminAuth}
        onAuthComplete={handleAdminAuthComplete}
        onLogout={handleLogout}
        onBack={() => {
          window.location.href = '/';
        }}
      />
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

  return (
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
    />
  );
}

