/**
 * Theme Selector Component
 * Новая структура:
 * - Базовые темы: ThemeToggle с анимацией (light/dark с автоопределением)
 * - Premium темы: круглые градиентные карточки (4 для light, 4 для dark)
 */

import { Crown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useActiveBaseTheme, useTheme } from '@/shared/components/theme-provider';
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle';
import { useTranslation } from '@/shared/lib/i18n';
import {
	type ColorScheme,
	DARK_COLOR_SCHEMES,
	LIGHT_COLOR_SCHEMES,
} from '@/shared/lib/themes/types';
import { createClient } from '@/utils/supabase/client';
import { ColorSchemeCard } from './ColorSchemeCard';

interface ThemeSelectorProps {
	isPremium: boolean;
	onPremiumRequired: () => void;
}

export function ThemeSelector({ isPremium, onPremiumRequired }: ThemeSelectorProps) {
	const { t } = useTranslation();
	const { colorScheme, setColorScheme } = useTheme();
	const activeBaseTheme = useActiveBaseTheme();
	const [userId, setUserId] = useState<string | null>(null);

	// Загрузка user ID
	useEffect(() => {
		(async () => {
			const supabase = createClient();
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) {
				setUserId(user.id);
			}
		})();
	}, []);

	// Обработка выбора цветовой схемы
	const handleColorSchemeSelect = async (scheme: ColorScheme) => {
		// Проверка Premium
		if (scheme && !isPremium) {
			onPremiumRequired();
			return;
		}

		// Устанавливаем цветовую схему через ThemeProvider
		// ThemeProvider автоматически сохраняет в localStorage
		await setColorScheme(scheme);

		// Сохранение в базу данных для синхронизации между устройствами
		if (userId) {
			try {
				const supabase = createClient();
				// Сохраняем комбинацию базовой темы и схемы
				const themeValue = scheme ? `${activeBaseTheme}-${scheme}` : activeBaseTheme;
				await supabase.from('profiles').update({ theme: themeValue }).eq('id', userId);
			} catch (error) {
				console.error('Failed to save theme to database:', error);
				// Не прерываем работу, если не удалось сохранить в БД
			}
		}
	};

	// Получаем доступные цветовые схемы для текущей базовой темы
	const availableColorSchemes =
		activeBaseTheme === 'light' ? LIGHT_COLOR_SCHEMES : DARK_COLOR_SCHEMES;

	return (
		<div className="space-y-6">
			{/* Базовые темы - переключатель с анимацией на одной строке */}
			<div className="flex items-center justify-between">
				<h3 className="text-foreground text-sm font-medium">
					{t('settings.themes.basic_themes', 'Базовые темы')}
				</h3>
				<ThemeToggle />
			</div>

			{/* Premium цветовые схемы */}
			<div>
				<div className="mb-4 flex items-center gap-2">
					<Crown className="text-primary h-4 w-4" />
					<h3 className="text-foreground text-sm font-medium">
						{t('settings.themes.premium_themes', 'Premium темы')}
					</h3>
				</div>
				<div className="grid grid-cols-4 gap-4">
					{availableColorSchemes.map((scheme) => (
						<ColorSchemeCard
							key={scheme.id}
							isLocked={!isPremium}
							isSelected={colorScheme === scheme.id}
							onSelect={() => handleColorSchemeSelect(scheme.id as ColorScheme)}
							theme={scheme}
						/>
					))}
				</div>
				{availableColorSchemes.length === 0 && (
					<p className="text-muted-foreground text-center text-sm">
						{t('settings.themes.no_schemes_available', 'Нет доступных цветовых схем для этой темы')}
					</p>
				)}
			</div>
		</div>
	);
}
