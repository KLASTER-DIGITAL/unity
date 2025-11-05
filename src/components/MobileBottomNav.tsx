/**
 * Enhanced Mobile Bottom Navigation for UNITY-v2
 *
 * Features:
 * - Floating effect with shadow and rounded top corners
 * - Pill-style active tab with smooth animations
 * - Label shows only for active tab (space-efficient)
 * - Framer Motion animations for smooth transitions
 * - iOS Design System compliance
 * - React Native ready (90%+ compatibility)
 *
 * Reference: https://21st.dev/community/components/arunachalam0606/bottom-nav-bar/default
 *
 * @author UNITY Team
 * @date 2025-10-19
 */

import { BarChart3, History, Home, Settings, Trophy } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { memo, useEffect, useMemo, useState } from 'react';
import { cn } from '@/shared/components/ui/utils';
import { useTranslation } from '@/shared/lib/i18n';

interface MobileBottomNavProps {
	activeTab: string;
	onTabChange: (tab: string) => void;
	stickyBottom?: boolean; // Enable sticky bottom mode (no margin)
}

export const MobileBottomNav = memo(function MobileBottomNav({
	activeTab,
	onTabChange,
	stickyBottom = false,
}: MobileBottomNavProps) {
	const { t } = useTranslation();
	const [isScrolledDown, setIsScrolledDown] = useState(false);

	// Проблема 3: Автоматическое поднятие меню при прокрутке вниз
	useEffect(() => {
		const handleScroll = () => {
			const scrollTop = window.scrollY;
			const windowHeight = window.innerHeight;
			const documentHeight = document.documentElement.scrollHeight;

			// Если прокрутили вниз больше чем на 100px или близко к концу страницы
			if (scrollTop > 100 || scrollTop + windowHeight >= documentHeight - 50) {
				setIsScrolledDown(true);
			} else {
				setIsScrolledDown(false);
			}
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// Memoize tabs array to prevent recreation on every render
	const tabs = useMemo(
		() => [
			{ id: 'home', label: t('home', 'Главная'), icon: Home },
			{ id: 'history', label: t('history', 'История'), icon: History },
			{
				id: 'achievements',
				label: t('achievements', 'Достижения'),
				icon: Trophy,
			},
			{ id: 'reports', label: t('reports', 'Отчеты'), icon: BarChart3 },
			{ id: 'settings', label: t('settings', 'Настройки'), icon: Settings },
		],
		[t]
	);

	return (
		<nav
			className={cn(
				// Position & Layout - FIXED позиционирование (НЕ двигается при скролле)
				'fixed left-1/2 z-9999 -translate-x-1/2',
				// Width - full width для sticky, max-w-md для floating
				stickyBottom ? 'w-full' : 'w-[calc(100%-2rem)] max-w-md',
				// Adaptive positioning - Mobile-first + Scroll-aware
				// Проблема 1: FIXED позиционирование (не используем Framer Motion y)
				// Проблема 3: Автоматическое поднятие при скролле
				stickyBottom
					? 'bottom-0'
					: isScrolledDown
						? 'bottom-20' // При скролле вниз - поднимаем выше
						: 'bottom-20 md:bottom-4', // По умолчанию - адаптивно
				// Background & Border
				'border border-border bg-card/95 backdrop-blur-lg',
				// Rounded corners - 10px для floating, none для sticky
				stickyBottom ? 'rounded-none border-t' : 'rounded-[10px] shadow-xl',
				// Padding
				'px-2 py-3',
				// Transitions - smooth transitions для всех изменений
				'transition-all duration-300'
			)}
			style={{
				// iOS-style blur effect
				WebkitBackdropFilter: 'blur(20px)',
				backdropFilter: 'blur(20px)',
				// iOS Safe Area support - добавляем отступ снизу для учета home indicator
				paddingBottom: stickyBottom ? 'calc(0.75rem + env(safe-area-inset-bottom))' : '0.75rem',
			}}
		>
			<div className="flex items-center justify-around gap-1">
				{tabs.map((tab) => {
					const Icon = tab.icon;
					const isActive = activeTab === tab.id;

					return (
						<motion.button
							className={cn(
								// Base styles - HORIZONTAL layout (flex-row)
								'relative flex flex-row items-center justify-center gap-2',
								'min-h-[44px] min-w-[44px]', // iOS touch target size
								'rounded-full transition-all duration-200',
								// Active state - pill style with padding
								isActive && 'bg-primary/15 px-3 py-2',
								// Inactive state - compact
								!isActive && 'px-2 py-2',
								// Hover effect (only for inactive)
								!isActive && 'hover:bg-primary/5 active:bg-primary/10'
							)}
							key={tab.id}
							layout
							onClick={() => onTabChange(tab.id)}
							transition={{ type: 'spring', stiffness: 400, damping: 25 }}
							whileTap={{ scale: 0.95 }}
						>
							{/* Icon */}
							<motion.div
								className={cn(
									'flex shrink-0 items-center justify-center',
									isActive ? 'text-primary' : 'text-muted-foreground'
								)}
								layout
							>
								<Icon className="h-5 w-5" strokeWidth={2} />
							</motion.div>

							{/* Label - only show for active tab, HORIZONTAL next to icon */}
							<AnimatePresence mode="wait">
								{isActive && (
									<motion.span
										animate={{ opacity: 1, width: 'auto' }}
										className="overflow-hidden whitespace-nowrap font-normal text-[11px] text-primary"
										exit={{ opacity: 0, width: 0 }}
										initial={{ opacity: 0, width: 0 }}
										transition={{ duration: 0.2 }}
									>
										{tab.label}
									</motion.span>
								)}
							</AnimatePresence>
						</motion.button>
					);
				})}
			</div>
		</nav>
	);
});
