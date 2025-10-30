import { lazy, Suspense } from 'react';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { TranslationManager, TranslationProvider } from '@/shared/lib/i18n';

// Admin screens - lazy loading для оптимизации производительности
const AdminLoginScreen = lazy(() =>
	import('@/features/admin/auth').then((module) => ({
		default: module.AdminLoginScreen,
	}))
);
const AdminDashboard = lazy(() =>
	import('@/features/admin/dashboard').then((module) => ({
		default: module.AdminDashboard,
	}))
);

type AdminAppProps = {
	userData: any;
	showAdminAuth: boolean;
	onAuthComplete: (userData: any) => void;
	onLogout: () => void;
	onBack: () => void;
};

export function AdminApp({
	userData,
	showAdminAuth,
	onAuthComplete,
	onLogout,
	onBack,
}: AdminAppProps) {
	// Show admin login if not authenticated
	if (showAdminAuth) {
		return (
			<ErrorBoundary showHomeButton>
				<TranslationProvider defaultLanguage="ru" fallbackLanguage="ru">
					<TranslationManager preloadLanguages={['en']}>
						<div className="min-h-screen bg-muted">
							<Suspense fallback={<LoadingScreen />}>
								<AdminLoginScreen onBack={onBack} onComplete={onAuthComplete} />
							</Suspense>
							<Toaster position="top-center" />
						</div>
					</TranslationManager>
				</TranslationProvider>
			</ErrorBoundary>
		);
	}

	// Main admin dashboard
	return (
		<ErrorBoundary showHomeButton>
			<TranslationProvider defaultLanguage="ru" fallbackLanguage="ru">
				<TranslationManager preloadLanguages={['en']}>
					<div className="min-h-screen bg-muted">
						<Suspense fallback={<LoadingScreen />}>
							<AdminDashboard onLogout={onLogout} userData={userData} />
						</Suspense>
						<Toaster position="top-center" />
					</div>
				</TranslationManager>
			</TranslationProvider>
		</ErrorBoundary>
	);
}
