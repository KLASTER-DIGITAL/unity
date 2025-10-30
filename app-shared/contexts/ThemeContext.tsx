/**
 * Theme Context for React Native
 *
 * Глобальный контекст для управления темой приложения
 * Предоставляет theme, colors, isDark для всех компонентов
 */

import { createContext, type ReactNode, useContext } from 'react';
import type { ColorsLight } from '../design-system/tokens';
import { type ActiveTheme, type ThemeMode, useTheme as useThemeHook } from '../hooks/useTheme';

interface ThemeContextValue {
	theme: ActiveTheme;
	themeMode: ThemeMode;
	colors: typeof ColorsLight;
	isDark: boolean;
	setTheme: (mode: ThemeMode) => Promise<void>;
	toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
	children: ReactNode;
}

/**
 * Theme Provider Component
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
	const themeValue = useThemeHook();

	return <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to use theme context
 */
export function useTheme(): ThemeContextValue {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('useTheme must be used within ThemeProvider');
	}
	return context;
}
