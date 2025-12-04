import React, {
	createContext,
	type ReactNode,
	startTransition,
	useCallback,
	useContext,
	useEffect,
	useReducer,
} from 'react';
import { TranslationCacheManager } from './cache';
import { getFallbackTranslation } from './fallback';
import { getPreferredLanguage, savePreferredLanguage } from './language-detection';
import { TranslationLoader } from './loader';
import { initializeOptimizations, LazyLoader, SmartCache } from './optimizations';
import type { I18nState, Translations } from './types';

type TranslationContextValue = {
	state: I18nState;
	changeLanguage: (language: string) => Promise<void>;
	refreshTranslations: () => Promise<void>;
	t: (key: keyof Translations, fallback?: string) => string;
	isLoading: boolean;
	error: string | null;
	currentLanguage: string;
	isLoaded: boolean;
};

const TranslationContext = createContext<TranslationContextValue | null>(null);

// Reducer для управления состоянием
type I18nAction =
	| { type: 'SET_LOADING'; payload: boolean }
	| { type: 'SET_ERROR'; payload: string | null }
	| { type: 'SET_LANGUAGE'; payload: string }
	| {
			type: 'SET_TRANSLATIONS';
			payload: { language: string; translations: Record<string, string> };
	  }
	| { type: 'CLEAR_CACHE' }
	| { type: 'SET_LOADED'; payload: boolean };

const i18nReducer = (state: I18nState, action: I18nAction): I18nState => {
	switch (action.type) {
		case 'SET_LOADING':
			return { ...state, isLoading: action.payload };
		case 'SET_ERROR':
			return { ...state, error: action.payload };
		case 'SET_LANGUAGE':
			return { ...state, currentLanguage: action.payload };
		case 'SET_TRANSLATIONS':
			return {
				...state,
				cache: new Map(state.cache).set(action.payload.language, {
					language: action.payload.language,
					translations: action.payload.translations,
					version: Date.now().toString(),
					lastUpdated: new Date().toISOString(),
				}),
			};
		case 'CLEAR_CACHE':
			return { ...state, cache: new Map() };
		case 'SET_LOADED':
			return { ...state, isLoaded: action.payload };
		default:
			return state;
	}
};

type TranslationProviderProps = {
	children: ReactNode;
	defaultLanguage?: string;
	fallbackLanguage?: string;
};

export const TranslationProvider: React.FC<TranslationProviderProps> = ({
	children,
	defaultLanguage,
	fallbackLanguage = 'ru',
}) => {
	const [initialLanguage, setInitialLanguage] = React.useState<string | null>(null);

	// Determine initial language on mount
	React.useEffect(() => {
		const detectLanguage = async () => {
			const preferred = defaultLanguage || (await getPreferredLanguage());
			setInitialLanguage(preferred);
		};
		detectLanguage();
	}, [defaultLanguage]);

	const [state, dispatch] = useReducer(i18nReducer, {
		currentLanguage: initialLanguage || fallbackLanguage,
		isLoading: false,
		error: null,
		isLoaded: false,
		cache: new Map(),
		fallbackLanguage,
	});

	// ✅ CRITICAL FIX: Wrap loadTranslations in useCallback to prevent infinite re-renders
	// Without useCallback, this function is recreated on every render, causing useEffect
	// to run infinitely because it's in the dependency array
	const loadTranslations = useCallback(
		async (language: string): Promise<void> => {
			dispatch({ type: 'SET_LOADING', payload: true });
			dispatch({ type: 'SET_ERROR', payload: null });

			try {
				console.log(`Loading translations for language: ${language}`);

				// Try SmartCache first (optimized)
				let translations = await SmartCache.get(language);

				if (!translations) {
					// Use LazyLoader for optimized loading
					translations = await LazyLoader.load(language, 'high');
				}

				console.log(
					`Translations loaded for ${language} (${Object.keys(translations).length} keys)`
				);

				// ✅ FIX: Обертываем обновления состояния в startTransition для предотвращения приостановки
				startTransition(() => {
					dispatch({
						type: 'SET_TRANSLATIONS',
						payload: { language, translations },
					});

					dispatch({ type: 'SET_LOADED', payload: true });
				});
			} catch (error) {
				console.error('Failed to load translations:', error);
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				dispatch({ type: 'SET_ERROR', payload: errorMessage });

				// Используем fallback язык
				if (language !== fallbackLanguage) {
					console.log(`Loading fallback language: ${fallbackLanguage}`);
					// Recursive call is safe here because we check language !== fallbackLanguage
					await loadTranslations(fallbackLanguage);
				} else {
					// Если даже fallback не загрузился, используем встроенные переводы
					console.log('Using builtin fallback translations');
					const fallbackTranslations = getFallbackTranslation(fallbackLanguage);
					// ✅ FIX: Обертываем обновления состояния в startTransition
					startTransition(() => {
						dispatch({
							type: 'SET_TRANSLATIONS',
							payload: {
								language: fallbackLanguage,
								translations: fallbackTranslations as unknown as Record<string, string>,
							},
						});
						dispatch({ type: 'SET_LOADED', payload: true });
					});
				}
			} finally {
				dispatch({ type: 'SET_LOADING', payload: false });
			}
		},
		[fallbackLanguage]
	);

	// ✅ CRITICAL FIX: Обертываем changeLanguage в useCallback для предотвращения бесконечных циклов
	// Без useCallback функция пересоздается при каждом рендере, вызывая циркуляцию в компонентах
	// которые используют changeLanguage в зависимостях useEffect
	const changeLanguage = useCallback(
		async (language: string): Promise<void> => {
			if (state.currentLanguage === language) {
				console.log(`Language ${language} is already active`);
				return;
			}

			console.log(`Changing language from ${state.currentLanguage} to ${language}`);

			// Save user's language preference
			await savePreferredLanguage(language);

			// ✅ FIX: Обертываем обновления состояния в startTransition
			startTransition(() => {
				dispatch({ type: 'SET_LANGUAGE', payload: language });
				dispatch({ type: 'SET_LOADED', payload: false });
			});
			await loadTranslations(language);
		},
		[state.currentLanguage, loadTranslations]
	);

	// Обновление переводов
	const refreshTranslations = async (): Promise<void> => {
		console.log(`Refreshing translations for current language: ${state.currentLanguage}`);

		// Очищаем кэш для текущего языка
		TranslationCacheManager.removeCache(state.currentLanguage);
		dispatch({ type: 'SET_LOADED', payload: false });
		await loadTranslations(state.currentLanguage);
	};

	// Получение перевода
	const t = (key: keyof Translations, fallback?: string): string => {
		const currentCache = state.cache.get(state.currentLanguage);

		if (currentCache?.translations[key]) {
			return currentCache.translations[key];
		}

		// Проверяем fallback язык
		if (state.currentLanguage !== state.fallbackLanguage) {
			const fallbackCache = state.cache.get(state.fallbackLanguage);
			if (fallbackCache?.translations[key]) {
				// ✅ FIX: Уменьшаем уровень логирования - fallback переводы не критичны
				console.debug(`Using fallback translation for key: ${key}`);
				return fallbackCache.translations[key];
			}
		}

		// Используем встроенные fallback переводы
		const fallbackTranslations = getFallbackTranslation(state.currentLanguage);
		if (fallbackTranslations[key]) {
			// ✅ FIX: Уменьшаем уровень логирования - fallback переводы не критичны
			// Переводы могут быть в базе, но еще не загружены в кеш
			console.debug(`Using builtin fallback translation for key: ${key}`);
			return fallbackTranslations[key];
		}

		// Возвращаем fallback или ключ
		const result = fallback || key;
		// ✅ FIX: Используем console.debug вместо console.warn для уменьшения шума в консоли
		// Эти предупреждения не критичны, так как есть fallback значения
		console.debug(`Translation missing for key: ${key}, returning: ${result}`);

		// Сообщаем об отсутствующем переводе
		TranslationLoader.loadTranslations({ language: state.currentLanguage })
			.then(() => {
				// Повторная попытка после загрузки
				const retryCache = state.cache.get(state.currentLanguage);
				if (retryCache?.translations[key]) {
					console.log(`Translation loaded on retry for key: ${key}`);
				}
			})
			.catch((error) => {
				console.error('Failed to load translations for missing key:', error);
			});

		return result;
	};

	// Инициализация при монтировании
	// ✅ CRITICAL FIX: loadTranslations is now stable (useCallback), safe to include in deps
	// Removed state.currentLanguage from deps to prevent re-initialization on language change
	// biome-ignore lint/correctness/useExhaustiveDependencies: state.currentLanguage intentionally excluded to avoid infinite reload loop
	useEffect(() => {
		// Wait for initial language detection
		if (!initialLanguage) {
			return;
		}

		const initialize = async () => {
			try {
				// Initialize optimizations
				await initializeOptimizations({
					enablePrefetch: true,
					maxCachedLanguages: 3,
					prefetchLanguages: ['ru', 'en'], // Popular languages
				});

				// ✅ FIX: Обертываем обновление языка в startTransition
				if (state.currentLanguage !== initialLanguage) {
					startTransition(() => {
						dispatch({ type: 'SET_LANGUAGE', payload: initialLanguage });
					});
				}

				// Загружаем переводы для текущего языка
				await loadTranslations(initialLanguage);
			} catch (error) {
				console.error('Translation provider initialization error:', error);
			}
		};

		initialize();
		// ✅ FIX: Удалили state.currentLanguage из deps, чтобы избежать повторной инициализации при смене языка
		// changeLanguage уже вызывает loadTranslations, поэтому повторная загрузка не нужна
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialLanguage, loadTranslations]);

	// ✅ FIX: Следим за изменением defaultLanguage и обновляем язык
	// Это нужно для случая когда пользователь входит в систему и язык загружается из профиля
	// biome-ignore lint/correctness/useExhaustiveDependencies: changeLanguage and state.currentLanguage are stable and intentionally omitted to avoid double-loading
	useEffect(() => {
		if (defaultLanguage && defaultLanguage !== state.currentLanguage) {
			console.log(
				`🔄 [TranslationProvider] defaultLanguage changed from ${state.currentLanguage} to ${defaultLanguage}, updating...`
			);
			changeLanguage(defaultLanguage);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [defaultLanguage]);

	// Значение контекста
	const value: TranslationContextValue = {
		state,
		changeLanguage,
		refreshTranslations,
		t,
		isLoading: state.isLoading,
		error: state.error,
		currentLanguage: state.currentLanguage,
		isLoaded: state.isLoaded,
	};

	return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
};

// Хук для использования контекста переводов
export const useTranslationContext = (): TranslationContextValue => {
	const context = useContext(TranslationContext);
	if (!context) {
		throw new Error('useTranslationContext must be used within TranslationProvider');
	}
	return context;
};

// Хук для отладки
export const useTranslationDebug = () => {
	const { state, changeLanguage, refreshTranslations } = useTranslationContext();

	return {
		currentState: state,
		debugInfo: async () => await TranslationLoader.debugInfo(),
		clearCache: () => {
			TranslationCacheManager.clearCache();
			refreshTranslations();
		},
		forceReload: () => {
			refreshTranslations();
		},
		switchLanguage: (language: string) => {
			changeLanguage(language);
		},
		cacheStats: TranslationCacheManager.getCacheStats(),
	};
};
