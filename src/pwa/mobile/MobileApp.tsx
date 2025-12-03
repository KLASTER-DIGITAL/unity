import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Toaster } from 'sonner';
import { PushNotificationOnboardingModal } from '@/features/mobile/notifications';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { WelcomeTrialModal } from '@/shared/components/modals/WelcomeTrialModal';
import { TranslationManager, TranslationProvider } from '@/shared/lib/i18n';
import { prefetchOnIdle, routePrefetcher } from '@/shared/lib/performance';
import { AnimatedPresence, AnimatedView, ScreenTransitions } from '@/shared/lib/platform/animation';
import { createClient } from '@/utils/supabase/client';

// ✅ ROUTE-BASED CODE SPLITTING: Все screens загружаются lazy для уменьшения main bundle
// Onboarding screens - lazy loading (показываются только при первом запуске)
const importWelcomeScreen = () =>
	import('@/features/mobile/auth/components/WelcomeScreen').then((module) => ({
		default: module.WelcomeScreen,
	}));
const importOnboardingScreen2 = () =>
	import('@/features/mobile/auth/components/OnboardingScreen2').then((module) => ({
		default: module.OnboardingScreen2,
	}));
const importOnboardingScreen3 = () =>
	import('@/features/mobile/auth/components/OnboardingScreen3').then((module) => ({
		default: module.OnboardingScreen3,
	}));
const importOnboardingScreen4 = () =>
	import('@/features/mobile/auth/components/OnboardingScreen4').then((module) => ({
		default: module.OnboardingScreen4,
	}));

const WelcomeScreen = lazy(importWelcomeScreen);
const OnboardingScreen2 = lazy(importOnboardingScreen2);
const OnboardingScreen3 = lazy(importOnboardingScreen3);
const OnboardingScreen4 = lazy(importOnboardingScreen4);

// Auth screen - lazy loading (показывается только при авторизации)
const importAuthScreen = () =>
	import('@/features/mobile/auth/components/AuthScreenNew').then((module) => ({
		default: module.AuthScreen,
	}));
const AuthScreen = lazy(importAuthScreen);

// Main screens - lazy loading для оптимизации производительности
// Import functions для prefetch
const importAchievementHomeScreen = () =>
	import('@/features/mobile/home').then((module) => ({
		default: module.AchievementHomeScreen,
	}));
const importHistoryScreen = () =>
	import('@/features/mobile/history').then((module) => ({
		default: module.HistoryScreen,
	}));
const importAchievementsScreen = () =>
	import('@/features/mobile/achievements').then((module) => ({
		default: module.AchievementsScreen,
	}));
const importReportsScreen = () =>
	import('@/features/mobile/reports').then((module) => ({
		default: module.ReportsScreen,
	}));
const importSettingsScreen = () =>
	import('@/features/mobile/settings').then((module) => ({
		default: module.SettingsScreen,
	}));

const AchievementHomeScreen = lazy(importAchievementHomeScreen);
const HistoryScreen = lazy(importHistoryScreen);
const AchievementsScreen = lazy(importAchievementsScreen);
const ReportsScreen = lazy(importReportsScreen);
const SettingsScreen = lazy(importSettingsScreen);

// Layout components
import { MobileBottomNav } from '@/shared/components/layout';

type OnboardingData = {
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
};

type MobileAppProps = {
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
};

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
		'home' | 'history' | 'achievements' | 'reports' | 'settings'
	>('home');
	const [direction, setDirection] = useState(0);
	const prevScreenRef = useRef<string>('home');
	const [showPushOnboarding, setShowPushOnboarding] = useState(false);
	const [showWelcomeTrialModal, setShowWelcomeTrialModal] = useState(false);
	const supabase = createClient();

	// Tab order for directional animations
	const tabOrder = ['home', 'history', 'achievements', 'reports', 'settings'];

	// Check if user needs to see Welcome Trial Modal
	useEffect(() => {
		if (userData && onboardingComplete) {
			const userId = userData.user?.id || userData.id;

			// Retry logic для чтения subscriptions (fix 403 error после signup)
			const checkTrialSubscription = async (retryCount = 0) => {
				try {
					// Сначала проверяем что сессия активна
					const {
						data: { session },
					} = await supabase.auth.getSession();

					if (!session) {
						console.log('[WelcomeTrialModal] No active session, skipping');
						return;
					}

					const { data, error } = await supabase
						.from('subscriptions')
						.select('id, metadata')
						.eq('user_id', userId)
						.eq('status', 'active')
						.single();

					if (error) {
						// Если 403 и это первая попытка, retry через 2 секунды
						if (error.code === 'PGRST301' && retryCount < 3) {
							console.log(`[WelcomeTrialModal] Retry ${retryCount + 1}/3 after 2s...`);
							setTimeout(() => checkTrialSubscription(retryCount + 1), 2000);
							return;
						}

						console.log('[WelcomeTrialModal] No active subscription found:', error);
						return;
					}

					// ✅ FIX: Check localStorage FIRST to prevent showing modal multiple times
					const hasSeenWelcomeTrial = localStorage.getItem(`welcome_trial_seen_${userId}`);

					if (
						!hasSeenWelcomeTrial &&
						data?.metadata?.is_trial &&
						!data?.metadata?.welcome_modal_shown
					) {
						console.log('[WelcomeTrialModal] Showing Welcome Trial Modal');
						// Mark as seen immediately in localStorage
						localStorage.setItem(`welcome_trial_seen_${userId}`, 'true');
						// Delay showing modal by 2 seconds for better UX (after push onboarding)
						setTimeout(() => {
							setShowWelcomeTrialModal(true);
						}, 2000);
					}
				} catch (err) {
					console.error('[WelcomeTrialModal] Error:', err);
				}
			};

			checkTrialSubscription();
		}
	}, [userData, onboardingComplete, supabase]);

	// Check if user needs to see push notification onboarding
	useEffect(() => {
		if (userData && onboardingComplete) {
			const userId = userData.user?.id || userData.id;

			// ВАЖНО: Показываем модалку ТОЛЬКО ОДИН РАЗ
			// Проверяем localStorage чтобы не показывать снова после закрытия
			const hasSeenModal = localStorage.getItem(`push_onboarding_seen_${userId}`);

			// Show modal if user hasn't seen it yet
			if (!hasSeenModal && !showPushOnboarding) {
				console.log('[PushOnboarding] Showing Push Onboarding Modal');
				// Delay showing modal by 1 second for better UX
				const timer = setTimeout(() => {
					setShowPushOnboarding(true);
				}, 1000);

				return () => clearTimeout(timer);
			}
		}
	}, [userData, onboardingComplete, showPushOnboarding]);

	// Register routes for smart prefetching
	useEffect(() => {
		routePrefetcher.registerRoute('home', importAchievementHomeScreen);
		routePrefetcher.registerRoute('history', importHistoryScreen);
		routePrefetcher.registerRoute('achievements', importAchievementsScreen);
		routePrefetcher.registerRoute('reports', importReportsScreen);
		routePrefetcher.registerRoute('settings', importSettingsScreen);

		// Prefetch critical screens on idle after onboarding
		if (onboardingComplete) {
			prefetchOnIdle(importHistoryScreen, 1000);
			prefetchOnIdle(importSettingsScreen, 2000);
		}
	}, [onboardingComplete]);

	// Handle tab change with direction and prefetch
	const handleTabChange = (newTab: string) => {
		const prevIndex = tabOrder.indexOf(prevScreenRef.current);
		const newIndex = tabOrder.indexOf(newTab);

		setDirection(newIndex > prevIndex ? 1 : -1);
		prevScreenRef.current = newTab;
		setActiveScreen(newTab as 'home' | 'history' | 'achievements' | 'reports' | 'settings');

		// Track navigation for smart prefetching
		routePrefetcher.trackNavigation(newTab);
	};

	// Show auth screen if user clicked "У меня уже есть аккаунт" or completed onboarding
	if (showAuth && !userData) {
		return (
			<TranslationProvider defaultLanguage={selectedLanguage} fallbackLanguage="ru">
				<TranslationManager
					preloadLanguages={[selectedLanguage || 'ru']}
					validateCacheOnMount={false}
				>
					<Suspense fallback={<LoadingScreen />}>
						<AuthScreen
							initialMode={authMode}
							onAuthComplete={onAuthComplete}
							onboardingData={onboardingData}
							selectedLanguage={selectedLanguage}
						/>
					</Suspense>
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
				<TranslationManager
					preloadLanguages={[selectedLanguage || 'ru']}
					validateCacheOnMount={false}
				>
					<Suspense fallback={<LoadingScreen />}>
						{currentStep === 1 && (
							<WelcomeScreen
								currentStep={currentStep}
								onNext={onWelcomeComplete}
								onSkip={onWelcomeSkip}
								onStepClick={() => {}}
								totalSteps={4}
							/>
						)}
						{currentStep === 2 && (
							<OnboardingScreen2
								currentStep={currentStep - 1}
								onNext={onOnboarding2Complete}
								onStepClick={() => {}}
								selectedLanguage={selectedLanguage}
								totalSteps={totalSteps}
							/>
						)}
						{currentStep === 3 && (
							<OnboardingScreen3
								currentStep={currentStep - 1}
								onNext={onOnboarding3Complete}
								onStepClick={() => {}}
								selectedLanguage={selectedLanguage}
								totalSteps={totalSteps}
							/>
						)}
						{currentStep === 4 && (
							<OnboardingScreen4
								currentStep={currentStep - 1}
								onNext={onOnboarding4Complete}
								onStepClick={() => {}}
								selectedLanguage={selectedLanguage}
								totalSteps={totalSteps}
							/>
						)}
					</Suspense>
					<Toaster position="top-center" />
				</TranslationManager>
			</TranslationProvider>
		);
	}

	// Show auth screen if no user data or onboarding not complete
	// ✅ FIX: Проверяем userData.id ИЛИ userData.user.id
	// После регистрации userData имеет структуру: {id, email, name, onboardingCompleted, ...}
	// После checkSession userData имеет структуру: {success, user, profile, ...}
	const hasUser = userData && (userData.id || userData.user?.id);

	if (!hasUser) {
		return (
			<TranslationProvider defaultLanguage={selectedLanguage} fallbackLanguage="ru">
				<TranslationManager
					preloadLanguages={[selectedLanguage || 'ru']}
					validateCacheOnMount={false}
				>
					<div className="min-h-screen bg-background backdrop-blur-sm">
						<Suspense fallback={<LoadingScreen />}>
							<AuthScreen onComplete={onAuthComplete} />
						</Suspense>
						<Toaster position="top-center" />
					</div>
				</TranslationManager>
			</TranslationProvider>
		);
	}

	// Main mobile app - only show if user is authenticated
	return (
		<TranslationProvider defaultLanguage={selectedLanguage} fallbackLanguage="ru">
			<TranslationManager
				preloadLanguages={[selectedLanguage || 'ru']}
				validateCacheOnMount={false}
			>
				{/* OUTER: Scrollable container - allows vertical scroll */}
				<div className="min-h-screen bg-background backdrop-blur-sm">
					{/* INNER: Animation container - NO overflow-hidden */}
					<div className="min-h-screen">
						{/* Screens container - relative ONLY for absolute positioning of screens, overflow-hidden for animations */}
						<div className="relative min-h-screen overflow-hidden">
							<AnimatedPresence>
								{activeScreen === 'home' && (
									<AnimatedView
										key="home"
										{...(direction > 0
											? ScreenTransitions.slideLeft
											: ScreenTransitions.slideRight)}
										className="absolute inset-0 overflow-y-auto"
										transition={{ type: 'spring', stiffness: 300, damping: 30 }}
									>
										<Suspense fallback={<LoadingScreen />}>
											<AchievementHomeScreen
												onNavigateToHistory={() => handleTabChange('history')}
												onNavigateToSettings={() => handleTabChange('settings')}
												userData={userData}
											/>
										</Suspense>
									</AnimatedView>
								)}
								{activeScreen === 'history' && (
									<AnimatedView
										key="history"
										{...(direction > 0
											? ScreenTransitions.slideLeft
											: ScreenTransitions.slideRight)}
										className="absolute inset-0 overflow-y-auto"
									>
										<Suspense fallback={<LoadingScreen />}>
											<HistoryScreen userData={userData} />
										</Suspense>
									</AnimatedView>
								)}
								{activeScreen === 'achievements' && (
									<AnimatedView
										key="achievements"
										{...(direction > 0
											? ScreenTransitions.slideLeft
											: ScreenTransitions.slideRight)}
										className="absolute inset-0 overflow-y-auto"
									>
										<ErrorBoundary>
											<Suspense fallback={<LoadingScreen />}>
												<AchievementsScreen userData={userData} />
											</Suspense>
										</ErrorBoundary>
									</AnimatedView>
								)}
								{activeScreen === 'reports' && (
									<AnimatedView
										key="reports"
										{...(direction > 0
											? ScreenTransitions.slideLeft
											: ScreenTransitions.slideRight)}
										className="absolute inset-0 overflow-y-auto"
									>
										<Suspense fallback={<LoadingScreen />}>
											<ReportsScreen userData={userData} />
										</Suspense>
									</AnimatedView>
								)}
								{activeScreen === 'settings' && (
									<AnimatedView
										key="settings"
										{...(direction > 0
											? ScreenTransitions.slideLeft
											: ScreenTransitions.slideRight)}
										className="absolute inset-0 overflow-y-auto"
									>
										<Suspense fallback={<LoadingScreen />}>
											<SettingsScreen
												onLogout={onLogout}
												onProfileUpdate={onProfileUpdate}
												userData={userData}
											/>
										</Suspense>
									</AnimatedView>
								)}
							</AnimatedPresence>
						</div>
					</div>

					{/* Mobile Bottom Navigation - FIXED poверх всего */}
					<MobileBottomNav activeTab={activeScreen} onTabChange={handleTabChange} />

					{/* Push Notification Onboarding Modal */}
					{userData && (
						<PushNotificationOnboardingModal
							isOpen={showPushOnboarding}
							onClose={() => {
								const userId = userData.user?.id || userData.id;
								// Mark as seen in localStorage
								localStorage.setItem(`push_onboarding_seen_${userId}`, 'true');
								setShowPushOnboarding(false);
							}}
							onComplete={() => {
								const userId = userData.user?.id || userData.id;
								// Mark as seen in localStorage
								localStorage.setItem(`push_onboarding_seen_${userId}`, 'true');
								setShowPushOnboarding(false);
								// Optionally refresh user data to update has_completed_onboarding
								if (onProfileUpdate) {
									const profile = userData.profile || userData;
									onProfileUpdate({
										...profile,
										has_completed_onboarding: true,
									});
								}
							}}
							userId={userData.user?.id || userData.id}
						/>
					)}

					{/* Welcome Trial Modal */}
					{userData && (
						<WelcomeTrialModal
							open={showWelcomeTrialModal}
							onClose={async () => {
								setShowWelcomeTrialModal(false);

								// ✅ FIX: Set localStorage immediately to prevent re-showing
								const userId = userData.user?.id || userData.id;
								localStorage.setItem(`welcome_trial_seen_${userId}`, 'true');

								// Update metadata to mark welcome modal as shown
								const { data: subscription } = await supabase
									.from('subscriptions')
									.select('id, metadata')
									.eq('user_id', userId)
									.eq('status', 'active')
									.single();

								if (subscription) {
									await supabase
										.from('subscriptions')
										.update({
											metadata: {
												...subscription.metadata,
												welcome_modal_shown: true,
											},
										})
										.eq('id', subscription.id);

									console.log('[WelcomeTrialModal] Metadata updated: welcome_modal_shown = true');
								}
							}}
						/>
					)}

					<Toaster position="top-center" />
				</div>
			</TranslationManager>
		</TranslationProvider>
	);
}
