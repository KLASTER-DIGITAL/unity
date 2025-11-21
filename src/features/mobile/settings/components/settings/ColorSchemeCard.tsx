/**
 * ColorSchemeCard Component
 * Круглая карточка с градиентом для выбора цветовой схемы
 * Дизайн как на втором скриншоте - круглые градиентные сферы
 */

import { Crown } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/shared/components/ui/utils';
import type { ThemeInfo } from '@/shared/lib/themes/types';

interface ColorSchemeCardProps {
	theme: ThemeInfo;
	isSelected: boolean;
	isLocked?: boolean;
	onSelect: () => void;
}

export function ColorSchemeCard({
	theme,
	isSelected,
	isLocked = false,
	onSelect,
}: ColorSchemeCardProps) {
	const gradient = theme.gradient || {
		start: theme.preview.primary,
		end: theme.preview.secondary,
	};

	return (
		<motion.button
			className={cn(
				'relative flex flex-col items-center justify-center gap-2',
				'rounded-2xl p-4 transition-all',
				'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
				isSelected && 'ring-2 ring-primary ring-offset-2',
				isLocked && 'opacity-60 cursor-not-allowed',
				!isLocked && 'hover:scale-105 active:scale-95'
			)}
			disabled={isLocked}
			onClick={onSelect}
			whileHover={!isLocked ? { scale: 1.05 } : {}}
			whileTap={!isLocked ? { scale: 0.95 } : {}}
			transition={{ type: 'spring', stiffness: 400, damping: 25 }}
		>
			{/* Круглая градиентная сфера */}
			<div
				className={cn(
					'relative h-16 w-16 rounded-full',
					'shadow-lg transition-all',
					isSelected && 'shadow-xl ring-2 ring-primary ring-offset-2'
				)}
				style={{
					background: `linear-gradient(135deg, ${gradient.start} 0%, ${gradient.end} 100%)`,
					boxShadow: isSelected
						? `0 8px 16px rgba(0, 0, 0, 0.2), 0 0 0 2px var(--primary), 0 0 0 4px rgba(0, 122, 255, 0.1)`
						: '0 4px 12px rgba(0, 0, 0, 0.15)',
				}}
			>
				{/* Внутренний блик для объема */}
				<div
					className="absolute inset-0 rounded-full opacity-30"
					style={{
						background:
							'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8) 0%, transparent 50%)',
					}}
				/>

				{/* Индикатор выбора */}
				{isSelected && (
					<motion.div
						animate={{ scale: [0, 1.2, 1] }}
						className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
						initial={{ scale: 0 }}
						transition={{ duration: 0.3 }}
					>
						<div className="h-2 w-2 rounded-full bg-white" />
					</motion.div>
				)}

				{/* Замочек для Premium */}
				{isLocked && (
					<div className="absolute -top-1 -right-1 rounded-full bg-muted p-1">
						<Crown className="h-3 w-3 text-muted-foreground" />
					</div>
				)}
			</div>

			{/* Название темы */}
			<div className="text-center">
				<p className="text-foreground text-xs font-medium">{theme.name}</p>
			</div>
		</motion.button>
	);
}
