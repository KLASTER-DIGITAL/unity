/**
 * useTheme Hook for React Native
 *
 * Управление темой приложения (light/dark)
 * Использует AsyncStorage для сохранения предпочтений
 * Автоматически определяет системную тему
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { ColorsDark, ColorsLight } from '../design-system/tokens';

const THEME_STORAGE_KEY = '@unity_theme_preference';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ActiveTheme = 'light' | 'dark';

interface UseThemeResult {
	theme: ActiveTheme;
	themeMode: ThemeMode;
	colors: typeof ColorsLight;
	isDark: boolean;
	setTheme: (mode: ThemeMode) => Promise<void>;
	toggleTheme: () => Promise<void>;
}

/**
 * Hook для управления темой приложения
 */
export function useTheme(): UseThemeResult {
	const systemColorScheme = useColorScheme();
	const [themeMode, setThemeMode] = useState<ThemeMode>('system');

	// Load theme preference from AsyncStorage
	useEffect(() => {
		loadThemePreference();
	}, [loadThemePreference]);

	const loadThemePreference = async () => {
		try {
			const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
			if (
				savedTheme &&
				(savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')
			) {
				setThemeMode(savedTheme as ThemeMode);
			}
		} catch (error) {
			console.error('[useTheme] Error loading theme preference:', error);
		}
	};

	// Determine active theme
	const getActiveTheme = useCallback((): ActiveTheme => {
		if (themeMode === 'system') {
			return systemColorScheme === 'dark' ? 'dark' : 'light';
		}
		return themeMode;
	}, [themeMode, systemColorScheme]);

	const activeTheme = getActiveTheme();
	const isDark = activeTheme === 'dark';
	const colors = isDark ? ColorsDark : ColorsLight;

	// Set theme and save to AsyncStorage
	const setTheme = useCallback(async (mode: ThemeMode) => {
		try {
			setThemeMode(mode);
			await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
			console.log('[useTheme] Theme set to:', mode);
		} catch (error) {
			console.error('[useTheme] Error saving theme preference:', error);
		}
	}, []);

	// Toggle between light and dark
	const toggleTheme = useCallback(async () => {
		const newMode: ThemeMode = activeTheme === 'dark' ? 'light' : 'dark';
		await setTheme(newMode);
	}, [activeTheme, setTheme]);

	return {
		theme: activeTheme,
		themeMode,
		colors,
		isDark,
		setTheme,
		toggleTheme,
	};
}
