/**
 * useAppInitialization Hook
 *
 * Инициализация приложения: сессия, роуты, PWA, аналитика
 * Разбито из App.tsx для соблюдения AI-friendly правила (<250 строк)
 */

import { useCallback, useEffect } from 'react';
import { useInitPushAnalytics } from '@/shared/hooks/usePushAnalytics';
import {
	incrementVisitCount,
	shouldShowInstallPrompt,
	usePWASettings,
} from '@/shared/hooks/usePWASettings';
import { initPWAAnalytics, trackInstallPromptShown } from '@/shared/lib/analytics/pwa-tracking';
import { getEntries, getUserStats } from '@/shared/lib/api';
import { markInstallPromptAsShown } from '@/shared/lib/api/pwaUtils';
import {
	isAdminRoute as checkIsAdminRoute,
	isPerformanceRoute as checkIsPerformanceRoute,
	isTestRoute as checkIsTestRoute,
	checkSession,
	parseRouteParams,
} from '@/shared/lib/auth';
import { addBreadcrumb, setUser } from '@/shared/lib/monitoring/lazy';
import { initBackgroundSync } from '@/shared/lib/offline';
import { reportWebVitals } from '@/shared/lib/performance';
import { markLogoAsShown } from '@/shared/utils/firstLaunch';
import type { OnboardingData } from './useAppState';

type SessionProfile = {
	name?: string;
	email?: string;
	role?: string;
	language?: string;
	onboardingCompleted?: boolean;
	has_completed_onboarding?: boolean;
};

type SessionUser = {
	id?: string;
	email?: string;
} | null;

type SessionData = {
	id?: string;
	user?: SessionUser;
	profile?: SessionProfile;
	[key: string]: unknown;
} | null;

type UseAppInitializationProps = {
	userData: SessionData;
	isCheckingSession: boolean;
	onboardingComplete: boolean;
	setUserData: (data: SessionData) => void;
	setIsCheckingSession: (checking: boolean) => void;
	setOnboardingComplete: (complete: boolean) => void;
	setIsAdminRoute: (isAdmin: boolean) => void;
	setIsTestRoute: (isTest: boolean) => void;
	setIsPerformanceRoute: (isPerf: boolean) => void;
	setShowAdminAuth: (show: boolean) => void;
	setShowInstallPrompt: (show: boolean) => void;
	setDeferredPrompt: (prompt: Event | null) => void;
	setShowSyncComplete: (show: boolean) => void;
	setSyncedCount: (count: number) => void;
	setCurrentStep: (step: number) => void;
	setSelectedLanguage: (lang: string) => void;
	setOnboardingData: (data: OnboardingData) => void;
};

/**
 * Hook для инициализации приложения
 */
export function useAppInitialization(props: UseAppInitializationProps) {
	const {
		userData,
		isCheckingSession: _isCheckingSession,
		setUserData,
		setIsCheckingSession,
		setOnboardingComplete,
		setIsAdminRoute,
		setIsTestRoute,
		setIsPerformanceRoute,
		setShowAdminAuth,
		setShowInstallPrompt,
		setDeferredPrompt,
		setShowSyncComplete,
		setSyncedCount,
		setSelectedLanguage,
	} = props;

	// PWA settings
	const { settings: pwaSettings, isLoading: isPWALoading } = usePWASettings();

	// Initialize Push Analytics
	useInitPushAnalytics(userData?.id);

	// Check admin route ONLY via query parameter (NO auto-redirect based on role)
	const checkRouteAndAccess = useCallback(() => {
		const params = parseRouteParams();
		const isAdminParam = checkIsAdminRoute(params);
		const isTestParam = checkIsTestRoute(params);
		const isPerformanceParam = checkIsPerformanceRoute(params);

		console.log('🔍 [App.tsx] Route check:', {
			isAdminParam,
			isTestParam,
			isPerformanceParam,
			params,
		});

		setIsAdminRoute(isAdminParam);
		setIsTestRoute(isTestParam);
		setIsPerformanceRoute(isPerformanceParam);

		// Show/hide admin auth screen based on session
		if (isAdminParam && !userData) {
			setShowAdminAuth(true);
		} else if (isAdminParam && userData) {
			// User is authenticated, hide auth screen
			setShowAdminAuth(false);
		}
	}, [
		userData,
		setIsAdminRoute,
		setIsPerformanceRoute,
		setIsTestRoute, // User is authenticated, hide auth screen
		setShowAdminAuth,
	]);

	// Initialize Performance Monitoring with Sentry integration
	useEffect(() => {
		if (import.meta.env.PROD) {
			reportWebVitals((metric) => {
				// Send Web Vitals to Sentry
				addBreadcrumb({
					category: 'performance',
					message: `${metric.name}: ${metric.value.toFixed(2)}ms`,
					level:
						metric.rating === 'good'
							? 'info'
							: metric.rating === 'needs-improvement'
								? 'warning'
								: 'error',
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

	// Check route on mount and popstate
	useEffect(() => {
		checkRouteAndAccess();
		window.addEventListener('popstate', checkRouteAndAccess);

		return () => {
			window.removeEventListener('popstate', checkRouteAndAccess);
		};
	}, [checkRouteAndAccess]);

	// ✅ Helper: Check onboarding status with timeout
	const checkOnboardingStatus = useCallback(async (userId: string): Promise<boolean> => {
		try {
			console.log('📊 [App.tsx] Checking onboarding status with 10s timeout...');

			// Create timeout promise
			const timeoutPromise = new Promise<never>((_, reject) => {
				setTimeout(() => reject(new Error('Onboarding check timeout')), 10000);
			});

			// Race between data fetch and timeout
			const [entries, stats] = await Promise.race([
				Promise.all([
					getEntries(userId).catch((err) => {
						console.error('❌ [App.tsx] Failed to fetch entries:', err);
						return null;
					}),
					getUserStats(userId).catch((err) => {
						console.error('❌ [App.tsx] Failed to fetch stats:', err);
						return null;
					}),
				]),
				timeoutPromise,
			]);

			console.log('📊 [App.tsx] User stats:', {
				entriesCount: entries?.length || 0,
				hasStats: !!stats,
			});

			// User has completed onboarding if they have entries or stats
			const hasCompletedOnboarding = (entries && entries.length > 0) || !!stats;

			// ✅ OPTIMIZATION: Отмечаем, что логотип был показан (если онбординг завершен)
			if (hasCompletedOnboarding) {
				markLogoAsShown();
			}

			console.log(
				'🎯 [App.tsx] Onboarding status:',
				hasCompletedOnboarding ? 'COMPLETE' : 'INCOMPLETE'
			);

			return hasCompletedOnboarding;
		} catch (onboardingError) {
			console.error('❌ [App.tsx] Onboarding check failed:', onboardingError);
			// ✅ FALLBACK: If onboarding check fails, assume user needs onboarding
			console.log('🎯 [App.tsx] Onboarding status: INCOMPLETE (fallback due to error)');
			return false;
		}
	}, []);

	// Initialize session
	useEffect(() => {
		// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Session bootstrap has multiple guarded branches; splitting now would add indirection without clarity.
		const initSession = async () => {
			try {
				console.log('🔐 [App.tsx] Checking session with 15s timeout...');

				// ✅ FIX: Add timeout to checkSession to prevent infinite loading
				const timeoutPromise = new Promise<null>((_, reject) => {
					setTimeout(() => reject(new Error('Session check timeout after 15s')), 15000);
				});

				const session = await Promise.race([checkSession(), timeoutPromise]);

				if (session?.user) {
					console.log('✅ [App.tsx] Session found:', session.user.email);

					// Set user in Sentry for error tracking
					setUser({
						id: session.user.id,
						email: session.user.email,
						username: session.profile?.name || session.user.email,
					});

					setUserData(session);

					// ✅ FIX: Set selectedLanguage from profile
					if (session.profile?.language) {
						console.log('[App.tsx] Setting language from profile:', session.profile.language);
						setSelectedLanguage(session.profile.language);
					}

					// ✅ CRITICAL: Check if super_admin trying to access PWA → redirect to admin panel
					const params = parseRouteParams();
					const isAdminRoute = checkIsAdminRoute(params);
					const userRole = session.profile?.role;

					if (userRole === 'super_admin' && !isAdminRoute) {
						console.log('🔄 [App.tsx] super_admin detected on PWA, redirecting to admin panel');
						window.location.href = '/?view=admin';
						return;
					}

					// ✅ Do not block first paint on onboarding check: use profile flag first
					const profileOnboarding =
						(
							session.profile as {
								onboardingCompleted?: boolean;
								has_completed_onboarding?: boolean;
							}
						)?.onboardingCompleted ??
						(
							session.profile as {
								onboardingCompleted?: boolean;
								has_completed_onboarding?: boolean;
							}
						)?.has_completed_onboarding ??
						false;
					setOnboardingComplete(profileOnboarding);

					// Background verification (entries/stats) to correct stale flag
					checkOnboardingStatus(session.user.id)
						.then((hasCompletedOnboarding) => {
							if (hasCompletedOnboarding !== profileOnboarding) {
								setOnboardingComplete(hasCompletedOnboarding);
							}
						})
						.catch((error) => {
							console.error('❌ [App.tsx] Onboarding check (background) failed:', error);
						});
				} else {
					console.log('❌ [App.tsx] No session found');
					setUserData(null);
					setOnboardingComplete(false);
				}
			} catch (error) {
				console.error('❌ [App.tsx] Session check error:', error);
				setUserData(null);
				setOnboardingComplete(false);
			} finally {
				// ✅ CRITICAL: Always set isCheckingSession to false to prevent infinite loading
				console.log('✅ [App.tsx] Session check complete, hiding loading screen');
				setIsCheckingSession(false);
			}
		};

		initSession();
	}, [
		setIsCheckingSession,
		setOnboardingComplete,
		setUserData,
		setSelectedLanguage,
		checkOnboardingStatus,
	]);

	// Initialize PWA features
	useEffect(() => {
		// Инкремент счетчика визитов
		incrementVisitCount();

		// Initialize PWA Analytics
		initPWAAnalytics(userData?.id || null);

		// Initialize Background Sync
		if (userData?.id) {
			initBackgroundSync().catch((error) => {
				console.error('[App] Failed to initialize Background Sync:', error);
			});
		}

		// Обработчик beforeinstallprompt
		const handleBeforeInstallPrompt = (e: Event) => {
			console.log('[PWA] beforeinstallprompt event fired');
			e.preventDefault();
			setDeferredPrompt(e);

			// Проверяем условия показа install prompt
			shouldShowInstallPrompt(pwaSettings).then((shouldShow) => {
				if (shouldShow) {
					console.log('[PWA] Showing install prompt based on settings');
					setShowInstallPrompt(true);
					trackInstallPromptShown(userData?.id || null);
					markInstallPromptAsShown();
				} else {
					console.log('[PWA] Install prompt conditions not met');
				}
			});
		};

		// Обработчик appinstalled
		const handleAppInstalled = () => {
			console.log('[PWA] App installed successfully');
			setShowInstallPrompt(false);
			setDeferredPrompt(null);
		};

		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
		window.addEventListener('appinstalled', handleAppInstalled);

		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
			window.removeEventListener('appinstalled', handleAppInstalled);
		};
	}, [pwaSettings, userData, setDeferredPrompt, setShowInstallPrompt]);

	// Handle sync complete events from Service Worker
	useEffect(() => {
		const handleSyncComplete = (event: MessageEvent) => {
			const { type, data } = event.data || {};

			if (type === 'SYNC_COMPLETE') {
				console.log('[Offline] Sync complete:', data);
				setSyncedCount(data?.count || 0);
				setShowSyncComplete(true);

				// Auto-hide after 5 seconds
				setTimeout(() => {
					setShowSyncComplete(false);
				}, 5000);
			}
		};

		navigator.serviceWorker?.addEventListener('message', handleSyncComplete);

		return () => {
			navigator.serviceWorker?.removeEventListener('message', handleSyncComplete);
		};
	}, [setShowSyncComplete, setSyncedCount]);

	return {
		pwaSettings,
		isPWALoading,
		checkRouteAndAccess,
	};
}
