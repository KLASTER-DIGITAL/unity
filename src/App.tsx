import { lazy, Suspense } from "react";
import { createAppHandlers } from "@/pwa/handlers/appHandlers";
import { useAppInitialization } from "@/pwa/hooks/useAppInitialization";
// PWA hooks and handlers (renamed from @/app/ to @/pwa/ to avoid conflict with React Native /app/)
import { useAppState } from "@/pwa/hooks/useAppState";
import { LottiePreloader } from "@/shared/components/LottiePreloader";
import { ThemeProvider } from "@/shared/components/theme-provider";
import { PerformanceDashboard } from "@/shared/lib/i18n/monitoring/PerformanceDashboard";

// Lazy load PWA-level components for code splitting
const MobileApp = lazy(() =>
	import("@/pwa/mobile").then((module) => ({ default: module.MobileApp })),
);
const AdminApp = lazy(() =>
	import("@/pwa/admin").then((module) => ({ default: module.AdminApp })),
);

// PWA Components - Lazy loaded для улучшения производительности
const PWAHead = lazy(() => import("@/shared/components/pwa/PWAHead"));
const PWASplash = lazy(() => import("@/shared/components/pwa/PWASplash"));
const PWAStatus = lazy(() => import("@/shared/components/pwa/PWAStatus"));
const PWAUpdatePrompt = lazy(
	() => import("@/shared/components/pwa/PWAUpdatePrompt"),
);
const InstallPrompt = lazy(
	() => import("@/shared/components/pwa/InstallPrompt"),
);

// Offline Components
const OfflineSyncIndicator = lazy(
	() => import("@/shared/components/offline/OfflineSyncIndicator"),
);
const OfflineModeBadge = lazy(() =>
	import("@/shared/components/offline/OfflineModeBadge").then((m) => ({
		default: m.OfflineModeBadge,
	})),
);
const SyncCompletionModal = lazy(() =>
	import("@/shared/components/offline/SyncCompletionModal").then((m) => ({
		default: m.SyncCompletionModal,
	})),
);

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
						minDuration={1500}
						onMinDurationComplete={() => state.setMinLoadingTimeElapsed(true)}
						showMessage={false}
						size="lg"
					/>
				</ThemeProvider>
			);
		}

		return (
			<ThemeProvider defaultTheme="light" storageKey="unity-theme">
				<AdminApp
					onAuthComplete={handlers.handleAdminAuthComplete}
					onBack={() => {
						window.location.href = "/";
					}}
					onLogout={handlers.handleAdminLogout}
					showAdminAuth={state.showAdminAuth}
					userData={state.userData}
				/>
			</ThemeProvider>
		);
	}

	// Test route (disabled - I18nE2ETest moved to .example.tsx)
	if (state.isTestRoute) {
		return (
			<ThemeProvider defaultTheme="light" storageKey="unity-theme">
				<div className="p-8">
					<h1 className="font-bold text-2xl">Test Route Disabled</h1>
					<p className="mt-4">
						I18nE2ETest component has been moved to .example.tsx file
					</p>
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
				<div className="mx-auto max-w-md">
					<LottiePreloader
						minDuration={1500}
						onMinDurationComplete={() => state.setMinLoadingTimeElapsed(true)}
						showMessage={false}
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

					{/* PWA Update Prompt - обновление Service Worker (только для залогиненных пользователей) */}
					{state.userData && <PWAUpdatePrompt />}

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
							onClose={() => state.setShowSyncComplete(false)}
							syncedCount={state.syncedCount}
						/>
					)}
				</Suspense>

				<MobileApp
					authMode={state.authMode}
					currentStep={state.currentStep}
					onAuthComplete={handlers.handleAuthComplete}
					onboardingComplete={state.onboardingComplete}
					onboardingData={state.onboardingData}
					onLogout={handlers.handleLogout}
					onOnboarding2Complete={handlers.handleOnboarding2Complete}
					onOnboarding3Complete={handlers.handleOnboarding3Complete}
					onOnboarding4Complete={handlers.handleOnboarding4Complete}
					onProfileUpdate={handlers.handleProfileUpdate}
					onWelcomeComplete={handlers.handleWelcomeComplete}
					onWelcomeSkip={handlers.handleWelcomeSkip}
					selectedLanguage={state.selectedLanguage}
					showAuth={state.showAuth}
					userData={state.userData}
				/>
			</ThemeProvider>
		</>
	);
}
