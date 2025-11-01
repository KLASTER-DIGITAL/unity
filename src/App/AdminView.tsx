import { lazy } from 'react';
import type { UserData } from '@/pwa/hooks/useAppState';
import { LottiePreloader } from '@/shared/components/LottiePreloader';
import { ThemeProvider } from '@/shared/components/theme-provider';

const AdminApp = lazy(() => import('@/pwa/admin').then((module) => ({ default: module.AdminApp })));

interface AdminViewProps {
	isCheckingSession: boolean;
	minLoadingTimeElapsed: boolean;
	showAdminAuth: boolean;
	userData: UserData | null;
	onMinDurationComplete: () => void;
	onAuthComplete: () => void;
	onLogout: () => void;
}

export function AdminView({
	isCheckingSession,
	minLoadingTimeElapsed,
	showAdminAuth,
	userData,
	onMinDurationComplete,
	onAuthComplete,
	onLogout,
}: AdminViewProps) {
	if (isCheckingSession || !minLoadingTimeElapsed) {
		return (
			<ThemeProvider defaultTheme="light" storageKey="unity-theme">
				<LottiePreloader
					minDuration={1500}
					onMinDurationComplete={onMinDurationComplete}
					showMessage={false}
					size="lg"
				/>
			</ThemeProvider>
		);
	}

	return (
		<ThemeProvider defaultTheme="light" storageKey="unity-theme">
			<AdminApp
				onAuthComplete={onAuthComplete}
				onBack={() => {
					window.location.href = '/';
				}}
				onLogout={onLogout}
				showAdminAuth={showAdminAuth}
				userData={userData}
			/>
		</ThemeProvider>
	);
}
