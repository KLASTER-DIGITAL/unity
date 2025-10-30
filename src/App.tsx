import { Suspense, lazy } from "react";
import { ThemeProvider } from "@/shared/components/theme-provider";
import { LottiePreloader } from "@/shared/components/LottiePreloader";
import { PerformanceDashboard } from "@/shared/lib/i18n/monitoring/PerformanceDashboard";

// App hooks and handlers
import { useAppState } from "@/app/hooks/useAppState";
import { useAppInitialization } from "@/app/hooks/useAppInitialization";
import { createAppHandlers } from "@/app/handlers/appHandlers";

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
const OfflineModeBadge = lazy(() => import("@/shared/components/offline/OfflineModeBadge").then(m => ({ default: m.OfflineModeBadge })));
const SyncCompletionModal = lazy(() => import("@/shared/components/offline/SyncCompletionModal").then(m => ({ default: m.SyncCompletionModal })));

export default function App() {
  // App state management
  const state = useAppState();

  // App initialization (session, routes, PWA, analytics)
  const { pwaSettings, isPWALoading } = useAppInitialization({
    userData: state.userData,
    isCheckingSession: state.isCheckingSession,
    setUserData: state.setUserData,
    setIsCheckingSession: state.setIsCheckingSession,
    setOnboardingComplete: state.setOnboardingComplete,
    setIsAdminRoute: state.setIsAdminRoute,
    setIsTestRoute: state.setIsTestRoute,
    setIsPerformanceRoute: state.setIsPerformanceRoute,
    setShowAdminAuth: state.setShowAdminAuth,
    setShowInstallPrompt: state.setShowInstallPrompt,
    setDeferredPrompt: state.setDeferredPrompt,
    setShowSyncComplete: state.setShowSyncComplete,
    setSyncedCount: state.setSyncedCount,
    setCurrentStep: state.setCurrentStep,
    setSelectedLanguage: state.setSelectedLanguage,
    setOnboardingData: state.setOnboardingData,
    onboardingComplete: state.onboardingComplete,
  });

  // Event handlers
  const handlers = createAppHandlers({
    userData: state.userData,
    deferredPrompt: state.deferredPrompt,
    setUserData: state.setUserData,
    setOnboardingComplete: state.setOnboardingComplete,
    setCurrentStep: state.setCurrentStep,
    setSelectedLanguage: state.setSelectedLanguage,
    setOnboardingData: state.setOnboardingData,
    setShowAuth: state.setShowAuth,
    setAuthMode: state.setAuthMode,
    setShowInstallPrompt: state.setShowInstallPrompt,
    setDeferredPrompt: state.setDeferredPrompt,
    setShowAdminAuth: state.setShowAdminAuth,
    setIsCheckingSession: state.setIsCheckingSession,
    pwaSettings,
    isPWALoading,
    onboardingComplete: state.onboardingComplete,
  });

  // Admin view
  if (state.isAdminRoute) {
    // Показываем прелоадер пока не завершена проверка сессии И не истекло минимальное время
    if (state.isCheckingSession || !state.minLoadingTimeElapsed) {
      return (
        <ThemeProvider defaultTheme="light" storageKey="unity-theme">
          <LottiePreloader
            showMessage={false}
            minDuration={1500}
            onMinDurationComplete={() => state.setMinLoadingTimeElapsed(true)}
            size="lg"
          />
        </ThemeProvider>
      );
    }

    return (
      <ThemeProvider defaultTheme="light" storageKey="unity-theme">
        <AdminApp
          userData={state.userData}
          showAdminAuth={state.showAdminAuth}
          onAuthComplete={handlers.handleAdminAuthComplete}
          onLogout={handlers.handleAdminLogout}
          onBack={() => {
            window.location.href = '/';
          }}
        />
      </ThemeProvider>
    );
  }

  // Test route (disabled - I18nE2ETest moved to .example.tsx)
  if (state.isTestRoute) {
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
  if (state.isPerformanceRoute) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="unity-theme">
        <PerformanceDashboard />
      </ThemeProvider>
    );
  }

  // Mobile view - loading state
  // Показываем прелоадер пока не завершена проверка сессии И не истекло минимальное время
  if (state.isCheckingSession || !state.minLoadingTimeElapsed) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="unity-theme">
        <div className="max-w-md mx-auto">
          <LottiePreloader
            showMessage={false}
            minDuration={1500}
            onMinDurationComplete={() => state.setMinLoadingTimeElapsed(true)}
            size="lg"
          />
        </div>
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
          {state.showInstallPrompt && (
            <InstallPrompt
              onClose={handlers.handleInstallClose}
              onInstall={handlers.handleInstall}
            />
          )}

          {/* Offline Sync Indicator - показывает pending syncs */}
          {state.userData?.user?.id && !state.isAdminRoute && (
            <OfflineSyncIndicator userId={state.userData.user.id} />
          )}

          {/* Offline Mode Badge - показывает offline статус и pending count */}
          {state.userData?.user?.id && !state.isAdminRoute && (
            <OfflineModeBadge />
          )}

          {/* Sync Completion Modal - показывается после успешной синхронизации */}
          {state.userData?.user?.id && !state.isAdminRoute && (
            <SyncCompletionModal
              isOpen={state.showSyncComplete}
              syncedCount={state.syncedCount}
              onClose={() => state.setShowSyncComplete(false)}
            />
          )}
        </Suspense>

        <MobileApp
          userData={state.userData}
          onboardingComplete={state.onboardingComplete}
          currentStep={state.currentStep}
          selectedLanguage={state.selectedLanguage}
          showAuth={state.showAuth}
          authMode={state.authMode}
          onboardingData={state.onboardingData}
          onWelcomeComplete={handlers.handleWelcomeComplete}
          onWelcomeSkip={handlers.handleWelcomeSkip}
          onOnboarding2Complete={handlers.handleOnboarding2Complete}
          onOnboarding3Complete={handlers.handleOnboarding3Complete}
          onOnboarding4Complete={handlers.handleOnboarding4Complete}
          onAuthComplete={handlers.handleAuthComplete}
          onLogout={handlers.handleLogout}
          onProfileUpdate={handlers.handleProfileUpdate}
        />
      </ThemeProvider>
    </>
  );
}

