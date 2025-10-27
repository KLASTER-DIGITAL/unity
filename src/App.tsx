import { useState, useEffect, Suspense, lazy, useCallback } from "react";
import { checkSession, signOut } from "./utils/auth";
import { checkAccessAndRedirect, parseRouteParams, isAdminRoute as checkIsAdminRoute, isTestRoute as checkIsTestRoute, isPerformanceRoute as checkIsPerformanceRoute } from "@/shared/lib/auth";
import { ThemeProvider } from "@/shared/components/theme-provider";
import { setUser, addBreadcrumb } from "@/shared/lib/monitoring";
import { LottiePreloader } from "@/shared/components/LottiePreloader";
import { reportWebVitals } from "@/shared/lib/performance";

// Lazy load app-level components for code splitting
const MobileApp = lazy(() => import("@/app/mobile").then(module => ({ default: module.MobileApp })));
const AdminApp = lazy(() => import("@/app/admin").then(module => ({ default: module.AdminApp })));

// PWA Components - Lazy loaded для улучшения производительности
const PWAHead = lazy(() => import("@/shared/components/pwa/PWAHead"));
const PWASplash = lazy(() => import("@/shared/components/pwa/PWASplash"));
const PWAStatus = lazy(() => import("@/shared/components/pwa/PWAStatus"));
const PWAUpdatePrompt = lazy(() => import("@/shared/components/pwa/PWAUpdatePrompt"));
const InstallPrompt = lazy(() => import("@/shared/components/pwa/InstallPrompt"));

// Offline Components
const OfflineSyncIndicator = lazy(() => import("@/shared/components/offline/OfflineSyncIndicator"));

import { usePWASettings, shouldShowInstallPrompt, incrementVisitCount } from "@/shared/hooks/usePWASettings";
import { markInstallPromptAsShown } from "@/shared/lib/api/pwaUtils";
import {
  initPWAAnalytics,
  trackInstallPromptShown,
  trackInstallAccepted,
  trackInstallDismissed,
} from "@/shared/lib/analytics/pwa-tracking";
import { useInitPushAnalytics } from "@/shared/hooks/usePushAnalytics";
import { initBackgroundSync } from "@/shared/lib/offline";

// Import E2E test component (disabled - moved to .example.tsx)
// import { I18nE2ETest } from "@/shared/lib/i18n/I18nE2ETest";
import { PerformanceDashboard } from "@/shared/lib/i18n/monitoring/PerformanceDashboard";

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
  const [minLoadingTimeElapsed, setMinLoadingTimeElapsed] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("ru");
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  // PWA state
  const { settings: pwaSettings, isLoading: isPWALoading } = usePWASettings();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

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

  // Check for test route
  const [isTestRoute, setIsTestRoute] = useState(false);
  const [isPerformanceRoute, setIsPerformanceRoute] = useState(false);

  // Check admin route ONLY via query parameter (NO auto-redirect based on role)
  // Memoized route check function to avoid recreating on every render
  const checkRouteAndAccess = useCallback(() => {
    const params = parseRouteParams();
    const isAdminParam = checkIsAdminRoute(params);
    const isTestParam = checkIsTestRoute(params);
    const isPerformanceParam = checkIsPerformanceRoute(params);

    // Set route states
    setIsTestRoute(isTestParam);
    setIsPerformanceRoute(isPerformanceParam);
    setIsAdminRoute(isAdminParam);

    // 🔒 SECURITY: Проверка роли при изменении маршрута
    // ТОЛЬКО если сессия проверена (userData !== null)
    if (userData && !isCheckingSession) {
      const redirected = checkAccessAndRedirect(userData, params);
      if (redirected) return;
    }

    // Show/hide admin auth screen based on session
    if (isAdminParam && !userData) {
      setShowAdminAuth(true);
    } else if (isAdminParam && userData) {
      // User is authenticated, hide auth screen
      setShowAdminAuth(false);
    }
  }, [userData, isCheckingSession]);

  // Initialize Performance Monitoring with Sentry integration
  useEffect(() => {
    if (import.meta.env.PROD) {
      reportWebVitals((metric) => {
        // Send Web Vitals to Sentry
        addBreadcrumb({
          category: 'performance',
          message: `${metric.name}: ${metric.value.toFixed(2)}ms`,
          level: metric.rating === 'good' ? 'info' : metric.rating === 'needs-improvement' ? 'warning' : 'error',
          data: {
            name: metric.name,
            value: metric.value,
            rating: metric.rating,
            timestamp: metric.timestamp,
          },
        });
      });
    }
  }, []);

  useEffect(() => {
    checkRouteAndAccess();
    window.addEventListener('popstate', checkRouteAndAccess);
    window.addEventListener('hashchange', checkRouteAndAccess);

    return () => {
      window.removeEventListener('popstate', checkRouteAndAccess);
      window.removeEventListener('hashchange', checkRouteAndAccess);
    };
  }, [checkRouteAndAccess]);

  // Check session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const session = await checkSession();
        console.log("🔍 Session check result:", session);

        // Check if session is successful (has user data)
        if (session && session.success !== false && session.user) {
          setUserData(session);

          // Устанавливаем пользователя в Sentry для отслеживания
          setUser({
            id: session.user.id,
            email: session.user.email,
            username: session.profile?.name || session.user.email,
          });

          addBreadcrumb({
            category: 'auth',
            message: 'User session restored',
            level: 'info',
            data: {
              role: session.profile?.role || 'user',
            },
          });

          // 🔒 SECURITY: Проверка роли и редирект при несоответствии
          const redirected = checkAccessAndRedirect(session);
          if (redirected) return;

          // ✅ Загружаем язык из профиля пользователя
          if (session.profile?.language) {
            console.log("🌐 Loading user language from profile:", session.profile.language);
            setSelectedLanguage(session.profile.language);
            const language = session.profile.language || 'ru';
            setOnboardingData(prev => ({ ...prev, language }));
          }

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

  // PWA Install Prompt Logic
  useEffect(() => {
    // Инкремент счетчика визитов
    incrementVisitCount();

    // Слушаем beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      console.log('[PWA] beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Проверяем нужно ли показать install prompt (async)
    if (!isPWALoading) {
      (async () => {
        // Определяем текущую локацию
        let currentLocation: 'onboarding' | 'user_cabinet' | undefined;

        if (!userData) {
          // Пользователь не залогинен = онбординг
          currentLocation = 'onboarding';
        } else if (userData && onboardingComplete) {
          // Пользователь залогинен и прошел онбординг = кабинет
          currentLocation = 'user_cabinet';
        }

        const shouldShow = await shouldShowInstallPrompt(pwaSettings, currentLocation);
        console.log('[PWA] Should show install prompt:', shouldShow, 'location:', currentLocation, pwaSettings);

        if (shouldShow) {
          // Небольшая задержка для лучшего UX
          setTimeout(() => {
            setShowInstallPrompt(true);
            // Track показ install prompt
            trackInstallPromptShown(userData?.id || null);
          }, 1000);
        }
      })();
    }

    // Инициализируем PWA analytics
    initPWAAnalytics(userData?.id || null);

    // Инициализируем Background Sync
    if (userData?.id) {
      initBackgroundSync().catch(error => {
        console.error('[App] Failed to initialize Background Sync:', error);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isPWALoading, pwaSettings, userData, onboardingComplete]);

  // Инициализируем Push Analytics
  useInitPushAnalytics(userData?.id);

  // PWA Install Handlers
  const handleInstall = async () => {
    console.log('[PWA] Install button clicked');

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] User response: ${outcome}`);

      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
        // Track установку PWA
        trackInstallAccepted(userData?.id || null);
      } else {
        console.log('[PWA] User dismissed the install prompt');
        // Track отказ от установки
        trackInstallDismissed(userData?.id || null, 'user_declined');
      }

      setDeferredPrompt(null);
    } else {
      console.log('[PWA] No deferred prompt available (iOS or already installed)');
    }

    await markInstallPromptAsShown();
    setShowInstallPrompt(false);
  };

  const handleInstallClose = async () => {
    // Track закрытие install prompt
    trackInstallDismissed(userData?.id || null, 'user_closed');
    console.log('[PWA] Install prompt closed');
    await markInstallPromptAsShown();
    setShowInstallPrompt(false);
  };

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

    // Устанавливаем пользователя в Sentry
    setUser({
      id: user.user?.id || user.id,
      email: user.user?.email || user.email,
      username: user.profile?.name || user.name || user.email,
    });

    addBreadcrumb({
      category: 'auth',
      message: 'User authenticated',
      level: 'info',
      data: {
        role: user.profile?.role || user.role,
        onboardingCompleted: user.onboardingCompleted,
      },
    });

    if (user.onboardingCompleted) {
      setOnboardingComplete(true);
      setCurrentStep(5);
    } else {
      setCurrentStep(2);
    }
  };

  // PWA пользователь: ПОЛНЫЙ выход через настройки (показывает welcome screen)
  const handleLogout = async () => {
    console.log("🚪 [App.tsx] PWA user full logout - clearing session for welcome screen");

    addBreadcrumb({
      category: 'auth',
      message: 'PWA user logged out',
      level: 'info',
    });

    await signOut(); // Полная очистка сессии чтобы показать welcome screen
    setUser(null); // Очищаем пользователя в Sentry
    setUserData(null);
    setOnboardingComplete(false);
    setCurrentStep(1); // Возврат к welcome screen
    setShowAdminAuth(false);
  };

  // Супер-админ: полный выход с очисткой сессии для безопасности
  const handleAdminLogout = async () => {
    console.log("🔐 [App.tsx] Admin logout - clearing session for security");

    addBreadcrumb({
      category: 'auth',
      message: 'Admin logged out',
      level: 'info',
    });

    await signOut(); // Полная очистка сессии для безопасности
    setUser(null); // Очищаем пользователя в Sentry
    setUserData(null);
    setOnboardingComplete(false);
    setCurrentStep(1);
    setShowAdminAuth(true); // Показываем форму входа админа
  };

  const handleAdminAuthComplete = (adminUser: any) => {
    console.log("🔐 [App.tsx] Admin auth complete:", adminUser.email, "role:", adminUser.role);

    // Устанавливаем админа в Sentry
    setUser({
      id: adminUser.id,
      email: adminUser.email,
      username: adminUser.profile?.name || adminUser.email,
    });

    addBreadcrumb({
      category: 'auth',
      message: 'Admin authenticated',
      level: 'info',
      data: {
        role: adminUser.role,
      },
    });

    setUserData(adminUser);
    setShowAdminAuth(false);
    setIsCheckingSession(false); // ✅ FIX: Stop showing loading screen after admin login
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
    // Показываем прелоадер пока не завершена проверка сессии И не истекло минимальное время
    if (isCheckingSession || !minLoadingTimeElapsed) {
      return (
        <ThemeProvider defaultTheme="light" storageKey="unity-theme">
          <LottiePreloader
            showMessage={false}
            minDuration={5000}
            onMinDurationComplete={() => setMinLoadingTimeElapsed(true)}
            size="lg"
          />
        </ThemeProvider>
      );
    }

    return (
      <ThemeProvider defaultTheme="light" storageKey="unity-theme">
        <AdminApp
          userData={userData}
          showAdminAuth={showAdminAuth}
          onAuthComplete={handleAdminAuthComplete}
          onLogout={handleAdminLogout} // Используем handleAdminLogout для полной очистки сессии
          onBack={() => {
            window.location.href = '/';
          }}
        />
      </ThemeProvider>
    );
  }

  // Mobile view - loading state
  // Показываем прелоадер пока не завершена проверка сессии И не истекло минимальное время
  if (isCheckingSession || !minLoadingTimeElapsed) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="unity-theme">
        <div className="max-w-md mx-auto">
          <LottiePreloader
            showMessage={false}
            minDuration={5000}
            onMinDurationComplete={() => setMinLoadingTimeElapsed(true)}
            size="lg"
          />
        </div>
      </ThemeProvider>
    );
  }

  // Test route (disabled - I18nE2ETest moved to .example.tsx)
  if (isTestRoute) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="unity-theme">
        <div className="p-8">
          <h1 className="text-2xl font-bold">Test Route Disabled</h1>
          <p className="mt-4">I18nE2ETest component has been moved to .example.tsx file</p>
        </div>
      </ThemeProvider>
    );
  }

  // Performance dashboard route
  if (isPerformanceRoute) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="unity-theme">
        <PerformanceDashboard />
      </ThemeProvider>
    );
  }

  return (
    <>
      <ThemeProvider defaultTheme="light" storageKey="unity-theme">
        {/* PWA Components - Lazy loaded с Suspense для производительности */}
        <Suspense fallback={null}>
          {/* PWA Head - динамические meta tags */}
          <PWAHead />

          {/* PWA Splash Screen - показывается при первом запуске в standalone */}
          <PWASplash />

          {/* PWA Status - уведомление об успешной установке */}
          <PWAStatus />

          {/* PWA Update Prompt - обновление Service Worker */}
          <PWAUpdatePrompt />

          {/* Install Prompt - настраиваемый через админ-панель */}
          {showInstallPrompt && (
            <InstallPrompt
              onClose={handleInstallClose}
              onInstall={handleInstall}
            />
          )}

          {/* Offline Sync Indicator - показывает pending syncs */}
          {userData?.user?.id && !isAdminRoute && (
            <OfflineSyncIndicator userId={userData.user.id} />
          )}
        </Suspense>

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
    </>
  );
}

