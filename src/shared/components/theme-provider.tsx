/**
 * Theme Provider for UNITY-v2
 * Based on shadcn/ui dark mode implementation
 * Supports: light, dark, system modes + 7 Premium themes
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '@/shared/lib/platform/storage';
import type { Theme } from '@/shared/lib/themes/types';

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
};

type ThemeProviderState = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
	theme: 'system',
	setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
	children,
	defaultTheme = 'system',
	storageKey = 'unity-theme',
	...props
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(defaultTheme);

	// Load theme from storage on mount
	useEffect(() => {
		storage.getItem(storageKey).then((savedTheme) => {
			if (savedTheme) {
				setTheme(savedTheme as Theme);
			}
		});
	}, [storageKey]);

	useEffect(() => {
		const root = document.documentElement;

		// Remove all theme classes
		root.classList.remove(
			'light',
			'dark',
			'theme-sunset',
			'theme-ocean',
			'theme-forest',
			'theme-sakura',
			'theme-night',
			'theme-coffee',
			'theme-lavender'
		);

		if (theme === 'system') {
			const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light';

			root.classList.add(systemTheme);
			return;
		}

		// Apply theme class
		if (theme === 'light' || theme === 'dark') {
			root.classList.add(theme);
		} else {
			// Premium theme
			root.classList.add(`theme-${theme}`);
		}
	}, [theme]);

	const value = {
		theme,
		setTheme: (theme: Theme) => {
			storage.setItem(storageKey, theme);
			setTheme(theme);
		},
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
