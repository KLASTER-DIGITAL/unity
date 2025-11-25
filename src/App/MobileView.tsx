import { lazy, Suspense, useEffect, useRef } from 'react';
import type { UserData } from '@/pwa/hooks/useAppState';
import { ThemeProvider, useTheme } from '@/shared/components/theme-provider';
import { TranslationProvider } from '@/shared/lib/i18n';
import { storage } from '@/shared/lib/platform/storage';

const MobileApp = lazy(() =>
	import('@/pwa/mobile').then((module) => ({ default: module.MobileApp }))
);

const PWAHead = lazy(() => import('@/shared/components/pwa/PWAHead'));
const PWASplash = lazy(() => import('@/shared/components/pwa/PWASplash'));
const PWAStatus = lazy(() => import('@/shared/components/pwa/PWAStatus'));

import { OfflineModeBadge } from '@/shared/components/offline/OfflineModeBadge';
import { OfflineSyncIndicator } from '@/shared/components/offline/OfflineSyncIndicator';
import { SyncCompletionModal } from '@/shared/components/offline/SyncCompletionModal';
import { InstallPrompt } from '@/shared/components/pwa/InstallPrompt';
// ✅ FIX: Import directly instead of lazy to prevent React hook context issues
import { PWAUpdatePrompt } from '@/shared/components/pwa/PWAUpdatePrompt';

interface MobileViewProps {
	userData: UserData | null;
	showInstallPrompt: boolean;
	showSyncComplete: boolean;
	syncedCount: number;
	isAdminRoute: boolean;
	authMode: 'login' | 'register';
	currentStep: number;
	onboardingComplete: boolean;
	onboardingData: Record<string, unknown>;
	selectedLanguage: string;
	showAuth: boolean;
	onInstallClose: () => void;
	onInstall: () => void;
	onAuthComplete: () => void;
	onLogout: () => void;
	onOnboarding2Complete: (data: Record<string, unknown>) => void;
	onOnboarding3Complete: (data: Record<string, unknown>) => void;
	onOnboarding4Complete: (data: Record<string, unknown>) => void;
	onProfileUpdate: (data: Record<string, unknown>) => void;
	onWelcomeComplete: () => void;
	onWelcomeSkip: () => void;
	setSyncComplete: (value: boolean) => void;
}

/**
 * Inner component that manages theme based on workflow
 * Must be inside ThemeProvider to access useTheme hook
 */
function MobileViewContent({
	userData,
	showInstallPrompt,
	showSyncComplete,
	syncedCount,
	isAdminRoute,
	authMode,
	currentStep,
	onboardingComplete,
	onboardingData,
	selectedLanguage,
	showAuth,
	onInstallClose,
	onInstall,
	onAuthComplete,
	onLogout,
	onOnboarding2Complete,
	onOnboarding3Complete,
	onOnboarding4Complete,
	onProfileUpdate,
	onWelcomeComplete,
	onWelcomeSkip,
	setSyncComplete,
}: MobileViewProps) {
	const { setTheme } = useTheme();
	const hasManuallyChangedTheme = useRef(false);

	// Проблема 4 FIX: Автоматическая смена темы с учетом ручного выбора пользователя
	useEffect(() => {
		// Проверяем флаг ручного изменения темы в localStorage
		storage.getItem('unity-theme-manual-override').then((manualOverride) => {
			if (manualOverride === 'true') {
				hasManuallyChangedTheme.current = true;
				return; // НЕ переопределяем тему если пользователь уже выбрал вручную
			}

			const isOnboarding = !onboardingComplete || currentStep <= 4;

			// Onboarding workflow → light theme
			// Cabinet workflow → dark theme
			if (isOnboarding) {
				setTheme('light');
			} else if (onboardingComplete && userData) {
				setTheme('dark');
			}
		});
	}, [onboardingComplete, currentStep, userData, setTheme]);

	return (
		<TranslationProvider defaultLanguage={selectedLanguage || 'ru'} fallbackLanguage="ru">
			<Suspense fallback={null}>
				<PWAHead />
				<PWASplash />
				<PWAStatus />
			</Suspense>

			{/* ✅ FIX: Direct imports outside Suspense to prevent React hook context issues */}
			{userData && <PWAUpdatePrompt />}

			{showInstallPrompt && <InstallPrompt onClose={onInstallClose} onInstall={onInstall} />}

			{userData?.user?.id && !isAdminRoute && (
				<>
					<OfflineSyncIndicator userId={userData.user.id} />
					<OfflineModeBadge />
					<SyncCompletionModal
						isOpen={showSyncComplete}
						onClose={() => setSyncComplete(false)}
						syncedCount={syncedCount}
					/>
				</>
			)}

			<MobileApp
				authMode={authMode}
				currentStep={currentStep}
				onAuthComplete={onAuthComplete}
				onboardingComplete={onboardingComplete}
				onboardingData={onboardingData}
				onLogout={onLogout}
				onOnboarding2Complete={onOnboarding2Complete}
				onOnboarding3Complete={onOnboarding3Complete}
				onOnboarding4Complete={onOnboarding4Complete}
				onProfileUpdate={onProfileUpdate}
				onWelcomeComplete={onWelcomeComplete}
				onWelcomeSkip={onWelcomeSkip}
				selectedLanguage={selectedLanguage}
				showAuth={showAuth}
				userData={userData}
			/>
		</TranslationProvider>
	);
}

/**
 * Main MobileView component with ThemeProvider wrapper
 */
export function MobileView(props: MobileViewProps) {
	// Проблема 4: Разные темы для Onboarding и Кабинета
	// Onboarding (currentStep 1-4, !onboardingComplete) → light theme (default)
	// Cabinet (onboardingComplete && userData) → dark theme (auto-switched by useEffect)
	// Ручной выбор пользователя → сохраняется в localStorage, НЕ переопределяется
	const isOnboarding = !props.onboardingComplete || props.currentStep <= 4;
	const defaultTheme = isOnboarding ? 'light' : 'dark';

	return (
		<ThemeProvider defaultTheme={defaultTheme} storageKey="unity-theme">
			<MobileViewContent {...props} />
		</ThemeProvider>
	);
}
