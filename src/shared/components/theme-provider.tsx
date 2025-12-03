/**
 * Theme Provider for UNITY-v2
 * Поддержка комбинированных тем: базовая тема (light/dark) + цветовая схема (Premium)
 *
 * Структура:
 * - Базовые темы: light, dark, system (автоопределение)
 * - Premium цветовые схемы: работают как модификаторы базовой темы
 * - Сохранение: отдельно базовая тема и цветовая схема
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '@/shared/lib/platform/storage';
import type { BaseTheme, ColorScheme, Theme } from '@/shared/lib/themes/types';
import { getColorSchemeBaseTheme, PREMIUM_THEMES } from '@/shared/lib/themes/types';

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: BaseTheme;
	defaultColorScheme?: ColorScheme;
	storageKey?: string;
};

type ThemeProviderState = {
	baseTheme: BaseTheme;
	colorScheme: ColorScheme;
	setBaseTheme: (theme: BaseTheme) => void;
	setColorScheme: (scheme: ColorScheme) => void;
	// Legacy методы для обратной совместимости
	theme: Theme;
	setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
	baseTheme: 'system',
	colorScheme: null,
	setBaseTheme: () => null,
	setColorScheme: () => null,
	theme: 'system',
	setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

/**
 * Миграция старой темы в новую структуру
 * Поддерживает форматы:
 * - Старый: 'light', 'dark', 'system', 'sunset', 'ocean', etc.
 * - Новый из БД: 'light-sunset', 'dark-night', etc.
 */
async function migrateLegacyTheme(storageKey: string): Promise<{
	baseTheme: BaseTheme;
	colorScheme: ColorScheme;
}> {
	const legacyTheme = await storage.getItem(storageKey);

	if (!legacyTheme) {
		// ✅ FIX: Темный режим по умолчанию вместо 'system'
		return { baseTheme: 'dark', colorScheme: null };
	}

	// Если это базовая тема
	if (legacyTheme === 'light' || legacyTheme === 'dark' || legacyTheme === 'system') {
		return { baseTheme: legacyTheme as BaseTheme, colorScheme: null };
	}

	// Если это новый формат из БД: 'light-sunset', 'dark-night', etc.
	if (legacyTheme.includes('-')) {
		const [base, scheme] = legacyTheme.split('-');
		if ((base === 'light' || base === 'dark') && scheme) {
			// Проверяем, что схема валидна
			const themeInfo = PREMIUM_THEMES.find((t) => t.id === scheme);
			if (themeInfo) {
				return {
					baseTheme: base as BaseTheme,
					colorScheme: scheme as ColorScheme,
				};
			}
		}
	}

	// Если это старая Premium тема - определяем базовую тему
	const themeInfo = PREMIUM_THEMES.find((t) => t.id === legacyTheme);
	if (themeInfo) {
		return {
			baseTheme: themeInfo.baseTheme || 'dark', // ✅ FIX: Темный режим по умолчанию
			colorScheme: legacyTheme as ColorScheme,
		};
	}

	// ✅ FIX: Темный режим по умолчанию вместо 'system'
	return { baseTheme: 'dark', colorScheme: null };
}

export function ThemeProvider({
	children,
	defaultTheme = 'dark', // ✅ FIX: Темный режим по умолчанию вместо 'system'
	defaultColorScheme = null,
	storageKey = 'unity-theme',
	...props
}: ThemeProviderProps) {
	const [baseTheme, setBaseThemeState] = useState<BaseTheme>(defaultTheme);
	const [colorScheme, setColorSchemeState] = useState<ColorScheme>(defaultColorScheme);
	// ✅ FIX: Флаг для предотвращения лишних ре-рендеров при загрузке
	const [isInitialized, setIsInitialized] = useState(false);

	// Загрузка тем из storage с миграцией и из БД
	useEffect(() => {
		(async () => {
			try {
				// Пытаемся загрузить новую структуру из localStorage
				const savedBaseTheme = await storage.getItem(`${storageKey}-base`);
				const savedColorScheme = await storage.getItem(`${storageKey}-scheme`);

				if (savedBaseTheme && savedColorScheme !== undefined) {
					// Загружаем из localStorage (приоритет)
					setBaseThemeState(savedBaseTheme as BaseTheme);
					setColorSchemeState(savedColorScheme as ColorScheme | null);
				} else {
					// Миграция старой темы или загрузка из БД
					const migrated = await migrateLegacyTheme(storageKey);
					setBaseThemeState(migrated.baseTheme);
					setColorSchemeState(migrated.colorScheme);

					// Сохраняем в новом формате
					await storage.setItem(`${storageKey}-base`, migrated.baseTheme);
					await storage.setItem(`${storageKey}-scheme`, migrated.colorScheme || '');
				}
			} catch (error) {
				console.error('[ThemeProvider] Error loading theme:', error);
				// Используем defaultTheme при ошибке
				setBaseThemeState(defaultTheme);
			} finally {
				setIsInitialized(true);
			}
		})();
	}, [storageKey, defaultTheme]);

	// ✅ FIX: Оптимизированное применение тем к DOM с предотвращением лишних операций
	useEffect(() => {
		// Не применяем темы до инициализации
		if (!isInitialized) {
			return;
		}

		const root = document.documentElement;

		// Определяем активную базовую тему
		let activeBaseTheme: 'light' | 'dark';
		if (baseTheme === 'system') {
			activeBaseTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light';
		} else {
			activeBaseTheme = baseTheme;
		}

		// ✅ FIX: Используем requestAnimationFrame для плавного переключения
		requestAnimationFrame(() => {
			// Удаляем все классы тем
			root.classList.remove(
				'light',
				'dark',
				'theme-sunset',
				'theme-ocean',
				'theme-forest',
				'theme-sakura',
				'theme-coffee',
				'theme-lavender',
				'theme-evening',
				'theme-dusk',
				'theme-midnight',
				'theme-night'
			);

			// Применяем базовую тему
			root.classList.add(activeBaseTheme);

			// Применяем цветовую схему, если она соответствует базовой теме
			if (colorScheme) {
				const schemeBaseTheme = getColorSchemeBaseTheme(colorScheme);
				if (schemeBaseTheme === activeBaseTheme) {
					root.classList.add(`theme-${colorScheme}`);
				} else {
					// Если схема не соответствует базовой теме - сбрасываем
					setColorSchemeState(null);
					storage.setItem(`${storageKey}-scheme`, '').catch((error) => {
						console.error('[ThemeProvider] Error resetting color scheme:', error);
					});
				}
			}
		});
	}, [baseTheme, colorScheme, storageKey, isInitialized]);

	// ✅ FIX: Оптимизированный setBaseTheme - сначала обновляем состояние, потом сохраняем
	const setBaseTheme = (theme: BaseTheme) => {
		// Сначала обновляем состояние для мгновенной реакции UI
		setBaseThemeState(theme);

		// Если цветовая схема не соответствует новой базовой теме - сбрасываем
		if (colorScheme) {
			const schemeBaseTheme = getColorSchemeBaseTheme(colorScheme);
			if (schemeBaseTheme !== theme && theme !== 'system') {
				setColorSchemeState(null);
				// Сохраняем схему неблокирующим способом
				storage.setItem(`${storageKey}-scheme`, '').catch((error) => {
					console.error('[ThemeProvider] Error saving color scheme:', error);
				});
			}
		}

		// Сохраняем базовую тему неблокирующим способом
		storage.setItem(`${storageKey}-base`, theme).catch((error) => {
			console.error('[ThemeProvider] Error saving base theme:', error);
		});
	};

	const setColorScheme = async (scheme: ColorScheme) => {
		setColorSchemeState(scheme);
		await storage.setItem(`${storageKey}-scheme`, scheme || '');
	};

	// Legacy методы для обратной совместимости
	const legacyTheme: Theme = colorScheme || baseTheme;
	const setLegacyTheme = async (theme: Theme) => {
		if (theme === 'light' || theme === 'dark' || theme === 'system') {
			await setBaseTheme(theme);
			await setColorScheme(null);
		} else {
			// Premium тема - определяем базовую и устанавливаем схему
			const themeInfo = PREMIUM_THEMES.find((t) => t.id === theme);
			if (themeInfo) {
				await setBaseTheme(themeInfo.baseTheme || 'light');
				await setColorScheme(theme as ColorScheme);
			}
		}
	};

	const value: ThemeProviderState = {
		baseTheme,
		colorScheme,
		setBaseTheme,
		setColorScheme,
		// Legacy
		theme: legacyTheme,
		setTheme: setLegacyTheme,
	};

	return (
		<ThemeProviderContext.Provider {...props} value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export const useTheme = () => {
	const context = useContext(ThemeProviderContext);

	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}

	return context;
};

// Хук для получения активной базовой темы (с учетом system)
export const useActiveBaseTheme = (): 'light' | 'dark' => {
	const { baseTheme } = useTheme();

	if (baseTheme === 'system') {
		if (typeof window !== 'undefined') {
			return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}
		return 'light';
	}

	return baseTheme;
};
