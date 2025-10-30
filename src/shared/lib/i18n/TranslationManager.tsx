import type React from "react";
import { useEffect, useState } from "react";
import { LottiePreloader } from "@/shared/components/LottiePreloader";
import { TranslationLoader } from "./loader";
import { useTranslationContext } from "./TranslationProvider";

type TranslationManagerProps = {
	children: React.ReactNode;
	preloadLanguages?: string[];
	onLanguageChange?: (language: string) => void;
	validateCacheOnMount?: boolean;
};

export const TranslationManager: React.FC<TranslationManagerProps> = ({
	children,
	preloadLanguages = ["en"],
	onLanguageChange,
	validateCacheOnMount = true,
}) => {
	const {
		currentLanguage,
		changeLanguage: _changeLanguage,
		isLoading: _isLoading,
		error: _error,
		isLoaded,
	} = useTranslationContext();
	const [isInitialized, setIsInitialized] = useState(false);
	const [initError, setInitError] = useState<string | null>(null);

	useEffect(() => {
		const initialize = async () => {
			try {
				console.log("TranslationManager: Initializing...");

				// Валидация кэша при запуске
				if (validateCacheOnMount) {
					console.log("TranslationManager: Validating cache...");
					await TranslationLoader.validateCache();
				}

				// Предзагрузка дополнительных языков
				if (preloadLanguages.length > 0) {
					console.log(
						`TranslationManager: Preloading languages: ${preloadLanguages.join(", ")}`,
					);
					await TranslationLoader.preloadLanguages(preloadLanguages);
				}

				console.log("TranslationManager: Initialization complete");
				setIsInitialized(true);
				setInitError(null);
			} catch (error) {
				console.error("TranslationManager initialization error:", error);
				setInitError(error instanceof Error ? error.message : "Unknown error");
				setIsInitialized(true); // Все равно продолжаем работу
			}
		};

		initialize();
	}, [preloadLanguages, validateCacheOnMount]);

	useEffect(() => {
		onLanguageChange?.(currentLanguage);
	}, [currentLanguage, onLanguageChange]);

	// Показываем загрузку только при первой инициализации
	if (!isInitialized) {
		return <LottiePreloader minDuration={5000} showMessage={false} size="lg" />;
	}

	// Показываем ошибку инициализации
	if (initError && !isLoaded) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="mx-auto max-w-md p-6 text-center">
					<div className="mb-4 text-4xl text-red-500">⚠️</div>
					<h2 className="mb-2 font-semibold text-xl">Initialization Error</h2>
					<p className="mb-4 text-muted-foreground">
						We had trouble setting up the app, but we'll try to continue with
						basic functionality.
					</p>
					<div className="rounded bg-red-50 p-3 text-red-500 text-sm">
						{initError}
					</div>
				</div>
			</div>
		);
	}

	return <>{children}</>;
};

// Хук для отслеживания состояния инициализации
export const useTranslationManager = () => {
	const { currentLanguage, isLoading, error, isLoaded } =
		useTranslationContext();
	const [isInitializing, setIsInitializing] = useState(true);

	useEffect(() => {
		// Эмулируем состояние инициализации
		const timer = setTimeout(() => {
			setIsInitializing(false);
		}, 100);

		return () => clearTimeout(timer);
	}, []);

	return {
		isInitializing,
		isReady: !isInitializing && isLoaded && !error,
		currentLanguage,
		isLoading,
		error,
		isLoaded,
	};
};

// Компонент для обертки с безопасной миграцией
export const SafeTranslationProvider: React.FC<{
	children: React.ReactNode;
	useNewSystem?: boolean;
}> = ({ children, useNewSystem = true }) => {
	// В будущем здесь будет логика для переключения между старой и новой системами
	if (useNewSystem) {
		return (
			<TranslationManager preloadLanguages={["en"]}>
				{children}
			</TranslationManager>
		);
	}

	return <>{children}</>;
};
