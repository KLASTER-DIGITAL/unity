import { lazy, Suspense } from 'react';
import type { UserData } from '@/pwa/hooks/useAppState';
import { ThemeProvider } from '@/shared/components/theme-provider';
import { ThemeProvider } from '@/shared/components/theme-provider';
import type { UserData } from '@/pwa/hooks/useAppState';

const MobileApp = lazy(() =>
	import('@/pwa/mobile').then((module) => ({ default: module.MobileApp }))
);

const PWAHead = lazy(() => import('@/shared/components/pwa/PWAHead'));
const PWASplash = lazy(() => import('@/shared/components/pwa/PWASplash'));
const PWAStatus = lazy(() => import('@/shared/components/pwa/PWAStatus'));
const PWAUpdatePrompt = lazy(() => import('@/shared/components/pwa/PWAUpdatePrompt'));
const InstallPrompt = lazy(() => import('@/shared/components/pwa/InstallPrompt'));

const OfflineSyncIndicator = lazy(() => import('@/shared/components/offline/OfflineSyncIndicator'));
const OfflineModeBadge = lazy(() =>
	import('@/shared/components/offline/OfflineModeBadge').then((m) => ({
		default: m.OfflineModeBadge,
	}))
);
const SyncCompletionModal = lazy(() =>
	import('@/shared/components/offline/SyncCompletionModal').then((m) => ({
		default: m.SyncCompletionModal,
	}))
);

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

export function MobileView({
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
	return (
		<ThemeProvider defaultTheme="light" storageKey="unity-theme">
			<Suspense fallback={null}>
				<PWAHead />
				<PWASplash />
				<PWAStatus />

				{userData && <PWAUpdatePrompt />}

				{showInstallPrompt && <InstallPrompt onClose={onInstallClose} onInstall={onInstall} />}

				{userData?.user?.id && !isAdminRoute && <OfflineSyncIndicator userId={userData.user.id} />}
				{showInstallPrompt && (
					<InstallPrompt onClose={onInstallClose} onInstall={onInstall} />
				)}

				{userData?.user?.id && !isAdminRoute && (
					<OfflineSyncIndicator userId={userData.user.id} />
				)}

				{userData?.user?.id && !isAdminRoute && <OfflineModeBadge />}

				{userData?.user?.id && !isAdminRoute && (
					<SyncCompletionModal
						isOpen={showSyncComplete}
						onClose={() => setSyncComplete(false)}
						syncedCount={syncedCount}
					/>
				)}
			</Suspense>

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
		</ThemeProvider>
	);
}

