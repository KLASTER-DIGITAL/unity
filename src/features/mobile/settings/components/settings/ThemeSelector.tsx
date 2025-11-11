/**
 * Theme Selector Component
 * Выбор темы с поддержкой Premium тем
 */

import { Crown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { storage } from '@/shared/lib/platform/storage';
import { ALL_THEMES, type Theme, type ThemeInfo } from '@/shared/lib/themes/types';
import { createClient } from '@/utils/supabase/client';

interface ThemeSelectorProps {
	isPremium: boolean;
	onPremiumRequired: () => void;
}

export function ThemeSelector({ isPremium, onPremiumRequired }: ThemeSelectorProps) {
	const [currentTheme, setCurrentTheme] = useState<Theme>('light');
	const [userId, setUserId] = useState<string | null>(null);

	// Load current theme from storage and user ID
	useEffect(() => {
		const loadTheme = async () => {
			const savedTheme = await storage.getItem('unity-theme');
			if (savedTheme) {
				setCurrentTheme(savedTheme as Theme);
			}

			// Get user ID
			const supabase = createClient();
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) {
				setUserId(user.id);
			}
		};
		loadTheme();
	}, []);

	const handleThemeSelect = async (theme: ThemeInfo) => {
		// Check if theme is Premium and user doesn't have Premium
		if (theme.isPremium && !isPremium) {
			onPremiumRequired();
			return;
		}

		// Apply theme
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

		// Add new theme class
		if (theme.id === 'light' || theme.id === 'dark') {
			root.classList.add(theme.id);
		} else if (theme.id !== 'system') {
			root.classList.add(`theme-${theme.id}`);
		}

		// Save to storage
		await storage.setItem('unity-theme', theme.id);
		setCurrentTheme(theme.id);

		// Save to database
		if (userId) {
			const supabase = createClient();
			await supabase.from('profiles').update({ theme: theme.id }).eq('id', userId);
		}
	};

	return (
		<div className="space-y-4">
			{/* Base Themes */}
			<div>
				<h3 className="text-foreground mb-3 text-sm font-medium">Базовые темы</h3>
				<div className="grid grid-cols-2 gap-3">
					{ALL_THEMES.filter((t) => !t.isPremium).map((theme) => (
						<ThemeCard
							key={theme.id}
							isSelected={currentTheme === theme.id}
							onSelect={() => handleThemeSelect(theme)}
							theme={theme}
						/>
					))}
				</div>
			</div>

			{/* Premium Themes */}
			<div>
				<h3 className="text-foreground mb-3 flex items-center gap-2 text-sm font-medium">
					<Crown className="text-primary h-4 w-4" />
					Premium темы
				</h3>
				<div className="grid grid-cols-2 gap-3">
					{ALL_THEMES.filter((t) => t.isPremium).map((theme) => (
						<ThemeCard
							key={theme.id}
							isLocked={!isPremium}
							isSelected={currentTheme === theme.id}
							onSelect={() => handleThemeSelect(theme)}
							theme={theme}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

interface ThemeCardProps {
	theme: ThemeInfo;
	isSelected: boolean;
	isLocked?: boolean;
	onSelect: () => void;
}

function ThemeCard({ theme, isSelected, isLocked, onSelect }: ThemeCardProps) {
	return (
		<button
			className={`
        relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all
        ${isSelected ? 'border-primary' : 'border-border'}
        ${isLocked ? 'opacity-60' : 'hover:border-primary/50'}
      `}
			onClick={onSelect}
			type="button"
		>
			{/* Preview Colors */}
			<div className="mb-3 flex gap-2">
				<div className="h-8 w-8 rounded-lg" style={{ backgroundColor: theme.preview.primary }} />
				<div className="h-8 w-8 rounded-lg" style={{ backgroundColor: theme.preview.secondary }} />
			</div>

			{/* Theme Info */}
			<div className="space-y-1">
				<div className="flex items-center gap-2">
					<span className="text-lg">{theme.icon}</span>
					<h4 className="text-foreground text-sm font-medium">{theme.name}</h4>
					{isLocked && <Crown className="text-muted-foreground h-3 w-3" />}
				</div>
				<p className="text-muted-foreground text-xs">{theme.description}</p>
			</div>

			{/* Selected Indicator */}
			{isSelected && <div className="bg-primary absolute right-2 top-2 h-2 w-2 rounded-full" />}
		</button>
	);
}
