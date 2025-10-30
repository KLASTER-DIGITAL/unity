/**
 * App Event Handlers
 *
 * Обработчики событий для App.tsx
 * Разбито из App.tsx для соблюдения AI-friendly правила (<250 строк)
 */

import {
	trackInstallAccepted,
	trackInstallDismissed,
} from "@/shared/lib/analytics/pwa-tracking";
import { setUser } from "@/shared/lib/monitoring/lazy";
import { signOut } from "@/utils/auth";
import type { OnboardingData } from "../hooks/useAppState";

type AppHandlersProps = {
	userData: any;
	deferredPrompt: any;
	pwaSettings: any;
	isPWALoading: boolean;
	onboardingComplete: boolean;
	setUserData: (data: any) => void;
	setOnboardingComplete: (complete: boolean) => void;
	setCurrentStep: (step: number) => void;
	setSelectedLanguage: (lang: string) => void;
	setOnboardingData: (
		data: OnboardingData | ((prev: OnboardingData) => OnboardingData),
	) => void;
	setShowAuth: (show: boolean) => void;
	setAuthMode: (mode: "login" | "register") => void;
	setShowInstallPrompt: (show: boolean) => void;
	setDeferredPrompt: (prompt: any) => void;
	setShowAdminAuth: (show: boolean) => void;
	setIsCheckingSession: (checking: boolean) => void;
};

/**
 * Создает обработчики событий для приложения
 */
export function createAppHandlers(props: AppHandlersProps) {
	const {
		userData,
		deferredPrompt,
		setUserData,
		setOnboardingComplete,
		setCurrentStep,
		setSelectedLanguage,
		setOnboardingData,
		setShowAuth,
		setAuthMode,
		setShowInstallPrompt,
		setDeferredPrompt,
		setShowAdminAuth,
		setIsCheckingSession,
	} = props;

	/**
	 * Обработчик установки PWA
	 */
	const handleInstall = async () => {
		console.log("[PWA] Install button clicked");

		if (!deferredPrompt) {
			console.log("[PWA] No deferred prompt available");
			return;
		}

		// Show the install prompt
		deferredPrompt.prompt();

		// Wait for the user to respond to the prompt
		const { outcome } = await deferredPrompt.userChoice;
		console.log(`[PWA] User response to the install prompt: ${outcome}`);

		// Track install acceptance
		trackInstallAccepted(userData?.id || null);

		// Clear the deferred prompt
		setDeferredPrompt(null);
		setShowInstallPrompt(false);
	};

	/**
	 * Обработчик закрытия Install Prompt
	 */
	const handleInstallClose = async () => {
		// Track закрытие install prompt
		trackInstallDismissed(userData?.id || null, "user_closed");
		setShowInstallPrompt(false);
	};

	/**
	 * Обработчик завершения Welcome Screen
	 */
	const handleWelcomeComplete = (language: string) => {
		setSelectedLanguage(language);
		setOnboardingData((prev) => ({ ...prev, language }));
		setCurrentStep(2);
	};

	/**
	 * Обработчик пропуска Welcome Screen (переход к логину)
	 */
	const handleWelcomeSkip = () => {
		setAuthMode("login"); // Пользователь хочет войти
		setShowAuth(true);
	};

	/**
	 * Обработчик завершения Onboarding Screen 2
	 */
	const handleOnboarding2Complete = () => {
		setCurrentStep(3);
	};

	/**
	 * Обработчик завершения Onboarding Screen 3
	 */
	const handleOnboarding3Complete = (diaryName: string, emoji: string) => {
		setOnboardingData((prev) => ({
			...prev,
			diaryName,
			diaryEmoji: emoji,
		}));
		setCurrentStep(4);
	};

	/**
	 * Обработчик завершения Onboarding Screen 4
	 */
	const handleOnboarding4Complete = (firstEntry: string, settings: any) => {
		setOnboardingData((prev) => ({
			...prev,
			firstEntry,
			notificationSettings: settings,
		}));
		setShowAuth(true);
	};

	/**
	 * Обработчик завершения авторизации
	 */
	const handleAuthComplete = async (user: any) => {
		setUserData(user);
		setShowAuth(false);

		// Set user in Sentry for error tracking
		setUser({
			id: user.id,
			email: user.email,
			username: user.profile?.name || user.email,
		});

		console.log("✅ [App.tsx] Auth complete, user:", user.email);

		// Если пользователь прошел онбординг (есть firstEntry), создаем первую запись
		// Это будет обработано в MobileApp через onAuthComplete
		setOnboardingComplete(true);
	};

	/**
	 * Обработчик выхода из PWA кабинета
	 */
	const handleLogout = async () => {
		console.log(
			"🚪 [App.tsx] PWA user full logout - clearing session for welcome screen",
		);

		try {
			await signOut();
			setUserData(null);
			setOnboardingComplete(false);
			setCurrentStep(1);
			console.log(
				"✅ [App.tsx] PWA logout successful - redirecting to welcome",
			);
		} catch (error) {
			console.error("❌ [App.tsx] PWA logout error:", error);
		}
	};

	/**
	 * Обработчик выхода из админ-панели
	 */
	const handleAdminLogout = async () => {
		console.log("🔐 [App.tsx] Admin logout - clearing session for security");

		try {
			await signOut();
			setUserData(null);
			setShowAdminAuth(true);
			console.log("✅ [App.tsx] Admin logout successful");
		} catch (error) {
			console.error("❌ [App.tsx] Admin logout error:", error);
		}
	};

	/**
	 * Обработчик завершения авторизации админа
	 */
	const handleAdminAuthComplete = (adminUser: any) => {
		console.log(
			"🔐 [App.tsx] Admin auth complete:",
			adminUser.email,
			"role:",
			adminUser.role,
		);

		// Set user in Sentry for error tracking
		setUser({
			id: adminUser.id,
			email: adminUser.email,
			username: adminUser.profile?.name || adminUser.email,
		});

		setUserData(adminUser);
		setShowAdminAuth(false);
		setIsCheckingSession(false); // ✅ FIX: Stop showing loading screen after admin login
	};

	/**
	 * Обработчик обновления профиля
	 */
	const handleProfileUpdate = (updatedProfile: any) => {
		console.log(
			"🔄 [App.tsx] Updating userData with new profile:",
			updatedProfile,
		);
		setUserData((prev: any) => ({
			...prev,
			...updatedProfile,
		}));
	};

	return {
		handleInstall,
		handleInstallClose,
		handleWelcomeComplete,
		handleWelcomeSkip,
		handleOnboarding2Complete,
		handleOnboarding3Complete,
		handleOnboarding4Complete,
		handleAuthComplete,
		handleLogout,
		handleAdminLogout,
		handleAdminAuthComplete,
		handleProfileUpdate,
	};
}
