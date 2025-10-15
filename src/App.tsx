import { useState, useEffect } from "react";
import { checkSession, signOut } from "./utils/auth";

// App-level components
import { MobileApp } from "@/app/mobile";
import { AdminApp } from "@/app/admin";

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
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
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    initSession();
  }, []);

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
    setCurrentStep(5);
  };

  const handleAuthComplete = async (user: any) => {
    setUserData(user);

    if (user.onboardingComplete) {
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
      onWelcomeComplete={handleWelcomeComplete}
      onOnboarding2Complete={handleOnboarding2Complete}
      onOnboarding3Complete={handleOnboarding3Complete}
      onOnboarding4Complete={handleOnboarding4Complete}
      onAuthComplete={handleAuthComplete}
      onLogout={handleLogout}
    />
  );
}

