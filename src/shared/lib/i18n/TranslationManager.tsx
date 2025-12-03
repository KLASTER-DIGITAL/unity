import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { TranslationLoader } from './loader';
import { useTranslationContext } from './TranslationProvider';

// Глобальный флаг, чтобы не гонять инициализацию и прелоадер при каждом маунте
const initializedLanguages = new Set<string>();

type TranslationManagerProps = {
	children: React.ReactNode;
	preloadLanguages?: string[];
	onLanguageChange?: (language: string) => void;
	validateCacheOnMount?: boolean;
};

export const TranslationManager: React.FC<TranslationManagerProps> = ({
	children,
	preloadLanguages = ['en'],
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

	// Нормализуем список языков и даём ему стабильную ссылку между рендерами,
	// чтобы не триггерить повторную инициализацию из-за нового массива
	const normalizedLanguages = useMemo(
		() => Array.from(new Set(preloadLanguages)),
		[preloadLanguages]
	);

	const shouldSkipInit =
		!validateCacheOnMount &&
		normalizedLanguages.length > 0 &&
		normalizedLanguages.every((lang) => initializedLanguages.has(lang));

	const [isInitialized, setIsInitialized] = useState(shouldSkipInit);
	const [initError, setInitError] = useState<string | null>(null);

	useEffect(() => {
		if (shouldSkipInit) {
			// Уже загружали эти языки ранее — не блокируем UI
			setInitError(null);
			return;
		}

		const initialize = async () => {
			try {
				console.log('TranslationManager: Initializing...');

				// Валидация кэша при запуске
				if (validateCacheOnMount) {
					console.log('TranslationManager: Validating cache...');
					await TranslationLoader.validateCache();
				}

				// Предзагрузка дополнительных языков
				if (normalizedLanguages.length > 0) {
					console.log(
						`TranslationManager: Preloading languages: ${normalizedLanguages.join(', ')}`
					);
					await TranslationLoader.preloadLanguages(normalizedLanguages);
				}

				console.log('TranslationManager: Initialization complete');
				normalizedLanguages.forEach((lang) => {
					initializedLanguages.add(lang);
				});
				setIsInitialized(true);
				setInitError(null);
			} catch (error) {
				console.error('TranslationManager initialization error:', error);
				setInitError(error instanceof Error ? error.message : 'Unknown error');
				setIsInitialized(true); // Все равно продолжаем работу
			}
		};

		initialize();
	}, [normalizedLanguages, validateCacheOnMount, shouldSkipInit]);

	useEffect(() => {
		onLanguageChange?.(currentLanguage);
	}, [currentLanguage, onLanguageChange]);

	// Показываем загрузку только при первой инициализации
	if (!isInitialized) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
					<div className="h-10 w-10 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
					<p className="text-sm">Загружаем интерфейс...</p>
				</div>
			</div>
		);
	}

	// Показываем ошибку инициализации
	if (initError && !isLoaded) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="mx-auto max-w-md p-6 text-center">
					<div className="mb-4 text-4xl text-red-500">⚠️</div>
					<h2 className="mb-2 font-semibold text-xl">Initialization Error</h2>
					<p className="mb-4 text-muted-foreground">
						We had trouble setting up the app, but we'll try to continue with basic functionality.
					</p>
					<div className="rounded bg-red-50 p-3 text-red-500 text-sm">{initError}</div>
				</div>
			</div>
		);
	}

	return <>{children}</>;
};

// Хук для отслеживания состояния инициализации
export const useTranslationManager = () => {
	const { currentLanguage, isLoading, error, isLoaded } = useTranslationContext();
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
		return <TranslationManager preloadLanguages={['en']}>{children}</TranslationManager>;
	}

	return <>{children}</>;
};
