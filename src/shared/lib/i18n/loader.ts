import { storage } from '../platform/storage';
import { I18nAPI } from './api';
import { TranslationCacheManager } from './cache';
import type { LoadTranslationsOptions, TranslationResult } from './types';

// biome-ignore lint/complexity/noStaticOnlyClass: Static loader keeps translation pipeline stateless and easy to reason about
export class TranslationLoader {
	private static readonly DEFAULT_TIMEOUT = 10_000; // 10 секунд
	private static readonly DEFAULT_RETRY_COUNT = 3;
	private static readonly RETRY_DELAY = 1000; // 1 секунда

	// Основной метод загрузки переводов
	static async loadTranslations(options: LoadTranslationsOptions): Promise<TranslationResult> {
		const {
			language,
			fallbackLanguage = 'ru',
			forceRefresh = false,
			timeout = TranslationLoader.DEFAULT_TIMEOUT,
			retryCount = TranslationLoader.DEFAULT_RETRY_COUNT,
		} = options;

		console.log(`Loading translations for ${language} (fallback: ${fallbackLanguage})`);

		let attempt = 0;
		// let lastError: Error | null = null;

		while (attempt < retryCount) {
			try {
				const result = await TranslationLoader.attemptLoad({
					language,
					fallbackLanguage,
					forceRefresh,
					timeout,
					attempt,
				});

				console.log(
					`Successfully loaded translations for ${language}, source: ${result.fromCache ? 'cache' : 'api'}`
				);
				return result;
			} catch (error) {
				// lastError = error as Error;
				attempt++;

				console.warn(`Attempt ${attempt} failed for ${language}:`, error);

				if (attempt < retryCount) {
					await TranslationLoader.delay(TranslationLoader.RETRY_DELAY * attempt);
				}
			}
		}

		// Все попытки неудачны, используем fallback
		console.error(
			`Failed to load translations for ${language} after ${retryCount} attempts, using fallback`
		);
		return TranslationLoader.loadFallback(fallbackLanguage);
	}

	// Попытка загрузки переводов
	private static async attemptLoad(options: {
		language: string;
		fallbackLanguage: string;
		forceRefresh: boolean;
		timeout: number;
		attempt: number;
	}): Promise<TranslationResult> {
		const {
			language,
			fallbackLanguage: _fallbackLanguage,
			forceRefresh,
			timeout,
			attempt,
		} = options;

		// 1. Проверяем кэш (если не принудительное обновление)
		if (!forceRefresh && attempt === 0) {
			const cached = await TranslationCacheManager.getCache(language);
			if (cached && !TranslationLoader.isCacheStale(cached)) {
				return {
					translations: cached.translations,
					language,
					usedFallback: false,
					fromCache: true,
				};
			}
		}

		// 2. Загружаем из API с таймаутом
		const etag = attempt === 0 ? await TranslationCacheManager.getCacheETag(language) : undefined;
		const translations = await TranslationLoader.withTimeout(
			I18nAPI.getTranslations(language, {
				useCache: true,
				etag,
			}),
			timeout
		);

		if (Object.keys(translations).length === 0) {
			throw new Error('No translations received from API');
		}

		return {
			translations,
			language,
			usedFallback: false,
			fromCache: false,
		};
	}

	// Загрузка fallback переводов
	private static async loadFallback(fallbackLanguage: string): Promise<TranslationResult> {
		console.log(`Loading fallback translations for ${fallbackLanguage}`);

		// Сначала пробуем кэш fallback языка
		const cached = await TranslationCacheManager.getCache(fallbackLanguage);
		if (cached) {
			console.log(`Using cached fallback translations for ${fallbackLanguage}`);
			return {
				translations: cached.translations,
				language: fallbackLanguage,
				usedFallback: true,
				fromCache: true,
			};
		}

		// Загружаем fallback из API
		try {
			const translations = await TranslationLoader.withTimeout(
				I18nAPI.getTranslations(fallbackLanguage),
				TranslationLoader.DEFAULT_TIMEOUT
			);

			console.log(`Loaded fallback translations from API for ${fallbackLanguage}`);
			return {
				translations,
				language: fallbackLanguage,
				usedFallback: true,
				fromCache: false,
			};
		} catch (error) {
			console.error(`Failed to load fallback translations for ${fallbackLanguage}:`, error);

			// Если даже fallback не загрузился, используем встроенные переводы
			console.log('Using builtin fallback translations');
			return {
				translations: TranslationLoader.getBuiltinTranslations(fallbackLanguage),
				language: fallbackLanguage,
				usedFallback: true,
				fromCache: false,
			};
		}
	}

	// Предзагрузка переводов для нескольких языков
	static async preloadLanguages(
		languages: string[],
		options: Partial<LoadTranslationsOptions> = {}
	): Promise<void> {
		console.log(`Preloading translations for languages: ${languages.join(', ')}`);

		const promises = languages.map((language) =>
			TranslationLoader.loadTranslations({ ...options, language })
				.then((result) => {
					console.log(
						`Preloaded ${Object.keys(result.translations).length} translations for ${language}`
					);
				})
				.catch((error) => {
					console.warn(`Failed to preload ${language}:`, error);
					return null;
				})
		);

		await Promise.allSettled(promises);
		console.log('Preloading completed');
	}

	// Валидация и восстановление кэша
	static async validateCache(): Promise<void> {
		console.log('Validating translation cache...');

		try {
			const languages = await I18nAPI.getSupportedLanguages();
			const validLanguages = languages.map((lang) => lang.code);

			// Проверяем кэш для каждого языка
			for (const language of validLanguages) {
				const cached = await TranslationCacheManager.getCache(language);

				if (cached) {
					// Проверяем целостность кэша
					if (!TranslationLoader.validateCacheIntegrity(cached)) {
						console.warn(`Cache integrity check failed for ${language}, removing...`);
						await TranslationCacheManager.removeCache(language);
					}
				}
			}

			// Очищаем кэш для неактивных языков
			const allKeys = await storage.getAllKeys();
			const cacheKeys = allKeys.filter((key) => key.startsWith('i18n_cache_'));

			for (const cacheKey of cacheKeys) {
				const language = cacheKey.replace('i18n_cache_', '');
				if (!validLanguages.includes(language)) {
					console.log(`Removing cache for inactive language: ${language}`);
					await TranslationCacheManager.removeCache(language);
				}
			}

			console.log('Cache validation completed');
		} catch (error) {
			console.error('Cache validation failed:', error);
		}
	}

	// Очистка всех переводов
	static async clearAllTranslations(): Promise<void> {
		console.log('Clearing all translations...');

		await TranslationCacheManager.clearCache();

		// Очищаем возможные временные данные
		const allKeys = await storage.getAllKeys();
		const i18nKeys = allKeys.filter((key) => key.startsWith('i18n_'));

		if (i18nKeys.length > 0) {
			await storage.multiRemove(i18nKeys);
		}

		console.log('All translations cleared');
	}

	// Получение статистики загрузки
	static async getLoadingStats(): Promise<{
		cacheStats: Awaited<ReturnType<typeof TranslationCacheManager.getCacheStats>>;
		lastSync: Date | null;
		supportedLanguages: string[];
	}> {
		return {
			cacheStats: TranslationCacheManager.getCacheStats(),
			lastSync: await TranslationCacheManager.getLastSync(),
			supportedLanguages: await TranslationCacheManager.getCachedLanguages(),
		};
	}

	// Вспомогательные методы

	private static withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
		const timeoutPromise = new Promise<never>((_, reject) => {
			setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout);
		});

		return Promise.race([promise, timeoutPromise]);
	}

	private static delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	private static isCacheStale(cache: { lastUpdated: string } | { timestamp: number }): boolean {
		const maxAge = 24 * 60 * 60 * 1000; // 24 часа
		const age = Date.now() - new Date(cache.lastUpdated).getTime();
		return age > maxAge;
	}

	private static validateCacheIntegrity(cache: {
		language: string;
		translations: Record<string, string>;
		lastUpdated: string;
		version: string;
	}): boolean {
		return !!(
			cache.language &&
			cache.translations &&
			typeof cache.translations === 'object' &&
			Object.keys(cache.translations).length > 0 &&
			cache.lastUpdated &&
			cache.version
		);
	}

	private static getBuiltinTranslations(language: string): Record<string, string> {
		// Встроенные переводы для критических ситуаций
		const builtin: Record<string, Record<string, string>> = {
			ru: {
				welcome_title: 'Создавай дневник побед',
				start_button: 'Начать',
				skip: 'Пропустить',
				next: 'Далее',
				back: 'Назад',
				home: 'Главная',
				history: 'История',
				achievements: 'Достижения',
				reports: 'Отчеты',
				settings: 'Настройки',
				loading_translations: 'Загрузка переводов...',
				translation_error: 'Ошибка загрузки переводов',
				retry: 'Повторить',
				cancel_button: 'Отмена',
				select_language: 'Выберите язык',
				language: 'Язык',
				'about.title': 'UNITY',
				'about.project': 'О проекте',
				'about.whats_new': 'Что нового',
				'about.whats_new_description': 'Все изменения и обновления',
				'welcomeTrial.title': 'Добро пожаловать в UNITY!',
				'welcomeTrial.youReceived': 'Вы получили',
				'welcomeTrial.premiumDays': '14 дней Premium',
				'welcomeTrial.free': 'бесплатно',
				'welcomeTrial.startUsing': 'Начать использовать',
				'welcomeTrial.feature.aiAnalysis.title': 'AI анализ записей',
				'welcomeTrial.feature.aiAnalysis.description': 'Умный анализ ваших мыслей и эмоций',
				'welcomeTrial.feature.unlimitedEntries.title': 'Неограниченные записи',
				'welcomeTrial.feature.unlimitedEntries.description':
					'Создавайте сколько угодно записей в месяц',
				'welcomeTrial.feature.offline.title': 'Offline режим',
				'welcomeTrial.feature.offline.description': 'Работайте без интернета с автосинхронизацией',
				'welcomeTrial.feature.pdfBooks.title': 'PDF-книги',
				'welcomeTrial.feature.pdfBooks.description': 'Генерация красивых PDF с вашими записями',
				// PWA Install
				'pwa.install.title': 'Установить приложение',
				'pwa.install.description': 'Установите приложение для быстрого доступа и работы офлайн',
				'pwa.install.feature1': 'Быстрый запуск приложения',
				'pwa.install.feature2': 'Быстрый доступ с главного экрана',
				'pwa.install.feature3': 'Push-уведомления о ваших целях',
				'pwa.install.button': 'Установить приложение',
				'pwa.install.skip': 'Может быть позже',
				'pwa.install.ios_instruction': 'Нажмите',
				'pwa.install.ios_share': 'Поделиться',
				'pwa.install.ios_then': 'внизу экрана, затем выберите',
				'pwa.install.ios_add_to_home': '"На экран Домой"',
				'pwa.install.install_button': 'Установить приложение',
				'pwa.install.maybe_later': 'Может быть позже',
				'welcomeTrial.feature.premiumThemes.title': 'Премиум-темы',
				'welcomeTrial.feature.premiumThemes.description': 'Эксклюзивные цветовые схемы',
				'welcomeTrial.feature.analytics.title': 'Расширенная аналитика',
				'welcomeTrial.feature.analytics.description': 'Детальные отчеты и графики прогресса',
			},
			en: {
				welcome_title: 'Create a victory diary',
				start_button: 'Get Started',
				skip: 'Skip',
				next: 'Next',
				back: 'Back',
				home: 'Home',
				history: 'History',
				achievements: 'Achievements',
				reports: 'Reports',
				settings: 'Settings',
				loading_translations: 'Loading translations...',
				translation_error: 'Translation loading error',
				retry: 'Retry',
				cancel_button: 'Cancel',
				select_language: 'Select language',
				language: 'Language',
				'about.title': 'UNITY',
				'about.project': 'About project',
				'about.whats_new': "What's new",
				'about.whats_new_description': 'All changes and updates',
				'welcomeTrial.title': 'Welcome to UNITY!',
				'welcomeTrial.youReceived': 'You received',
				'welcomeTrial.premiumDays': '14 days Premium',
				'welcomeTrial.free': 'free',
				'welcomeTrial.startUsing': 'Start using',
				'welcomeTrial.feature.aiAnalysis.title': 'AI analysis of entries',
				'welcomeTrial.feature.aiAnalysis.description':
					'Smart analysis of your thoughts and emotions',
				'welcomeTrial.feature.unlimitedEntries.title': 'Unlimited entries',
				'welcomeTrial.feature.unlimitedEntries.description':
					'Create as many entries per month as you want',
				'welcomeTrial.feature.offline.title': 'Offline mode',
				'welcomeTrial.feature.offline.description': 'Work offline with auto-sync',
				'welcomeTrial.feature.pdfBooks.title': 'PDF Books',
				'welcomeTrial.feature.pdfBooks.description': 'Generate beautiful PDFs with your entries',
				// PWA Install
				'pwa.install.title': 'Install Application',
				'pwa.install.description': 'Install the app for quick access and offline work',
				'pwa.install.feature1': 'Fast app launch',
				'pwa.install.feature2': 'Quick access from home screen',
				'pwa.install.feature3': 'Push notifications about your goals',
				'pwa.install.button': 'Install Application',
				'pwa.install.skip': 'Maybe later',
				'pwa.install.ios_instruction': 'Tap',
				'pwa.install.ios_share': 'Share',
				'pwa.install.ios_then': 'at the bottom of the screen, then select',
				'pwa.install.ios_add_to_home': '"Add to Home Screen"',
				'pwa.install.install_button': 'Install Application',
				'pwa.install.maybe_later': 'Maybe later',
				'welcomeTrial.feature.premiumThemes.title': 'Premium themes',
				'welcomeTrial.feature.premiumThemes.description': 'Exclusive color schemes',
				'welcomeTrial.feature.analytics.title': 'Advanced analytics',
				'welcomeTrial.feature.analytics.description': 'Detailed reports and progress graphs',
			},
		};

		return builtin[language] || builtin.ru;
	}

	// Метод для отладки
	static async debugInfo(): Promise<{
		currentCache: ReturnType<typeof TranslationCacheManager.exportCache>;
		loadingStats: Awaited<ReturnType<typeof TranslationLoader.getLoadingStats>>;
		apiHealth: boolean;
		storageUsage: number;
	}> {
		// Получаем все ключи из storage для подсчета использования
		const allKeys = await storage.getAllKeys();
		const allValues = await storage.multiGet(allKeys);
		const storageSize = allValues.reduce(
			(total, [, value]) => total + (value ? JSON.stringify(value).length : 0),
			0
		);

		return {
			currentCache: TranslationCacheManager.exportCache(),
			loadingStats: TranslationLoader.getLoadingStats(),
			apiHealth: await I18nAPI.healthCheck(),
			storageUsage: storageSize,
		};
	}
}
