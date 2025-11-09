import { useMemo } from 'react';
import { createAppHandlers } from '@/pwa/handlers/appHandlers';
import { useAppInitialization } from '@/pwa/hooks/useAppInitialization';
import { useAppState } from '@/pwa/hooks/useAppState';
import { ThemeProvider } from '@/shared/components/theme-provider';
import { PerformanceDashboard } from '@/shared/lib/i18n/monitoring/PerformanceDashboard';
import { hasShownLogoBefore } from '@/shared/utils/firstLaunch';
import { AdminView } from './App/AdminView';
import { LoadingView } from './App/LoadingView';
import { MobileView } from './App/MobileView';

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

	// ✅ HOOKS MUST BE AT TOP LEVEL - before any early returns
	// Показываем Lottie только при первом запуске (до онбординга)
	const isFirstLaunch = useMemo(() => !hasShownLogoBefore(), []);
	const shouldShowLottie = useMemo(
		() => isFirstLaunch && (state.isCheckingSession || !state.minLoadingTimeElapsed),
		[isFirstLaunch, state.isCheckingSession, state.minLoadingTimeElapsed]
	);

	if (state.isAdminRoute) {
		return (
			<AdminView
				isCheckingSession={state.isCheckingSession}
				minLoadingTimeElapsed={state.minLoadingTimeElapsed}
				showAdminAuth={state.showAdminAuth}
				userData={state.userData}
				onMinDurationComplete={() => state.setMinLoadingTimeElapsed(true)}
				onAuthComplete={handlers.handleAdminAuthComplete}
				onLogout={handlers.handleAdminLogout}
			/>
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

	if (state.isCheckingSession || !state.minLoadingTimeElapsed) {
		return (
			<LoadingView
				shouldShowLottie={shouldShowLottie}
				isFirstLaunch={isFirstLaunch}
				onMinDurationComplete={() => state.setMinLoadingTimeElapsed(true)}
			/>
		);
	}

	return (
		<MobileView
			userData={state.userData}
			showInstallPrompt={state.showInstallPrompt}
			showSyncComplete={state.showSyncComplete}
			syncedCount={state.syncedCount}
			isAdminRoute={state.isAdminRoute}
			authMode={state.authMode}
			currentStep={state.currentStep}
			onboardingComplete={state.onboardingComplete}
			onboardingData={state.onboardingData}
			selectedLanguage={state.selectedLanguage}
			showAuth={state.showAuth}
			onInstallClose={handlers.handleInstallClose}
			onInstall={handlers.handleInstall}
			onAuthComplete={handlers.handleAuthComplete}
			onLogout={handlers.handleLogout}
			onOnboarding2Complete={handlers.handleOnboarding2Complete}
			onOnboarding3Complete={handlers.handleOnboarding3Complete}
			onOnboarding4Complete={handlers.handleOnboarding4Complete}
			onProfileUpdate={handlers.handleProfileUpdate}
			onWelcomeComplete={handlers.handleWelcomeComplete}
			onWelcomeSkip={handlers.handleWelcomeSkip}
			setSyncComplete={state.setShowSyncComplete}
		/>
	);
}
