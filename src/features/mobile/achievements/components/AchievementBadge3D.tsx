import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { RARITY_STYLES, type RarityType } from '../constants/rarityStyles';

interface AchievementBadge3DProps {
	id: string;
	name: string;
	description: string;
	icon: any;
	rarity: RarityType;
	progress: number;
	earned: boolean;
	earnedDate?: string | null;
	index: number;
	onClick?: () => void;
}

export function AchievementBadge3D({
	name,
	description,
	icon: Icon,
	rarity,
	progress,
	earned,
	earnedDate,
	index,
	onClick,
}: AchievementBadge3DProps) {
	const [isHovered, setIsHovered] = useState(false);
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

	// ✅ NEW: Проверка prefers-reduced-motion
	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		setPrefersReducedMotion(mediaQuery.matches);

		const handleChange = (e: MediaQueryListEvent) => {
			setPrefersReducedMotion(e.matches);
		};

		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	}, []);

	const handleClick = () => {
		if (earned && onClick && !prefersReducedMotion) {
			// Confetti effect for earned achievements (только если НЕ reduced-motion)
			confetti({
				particleCount: 50,
				spread: 60,
				origin: { y: 0.6 },
				colors: ['#FFD700', '#FFA500', '#FF6347'],
			});
		}
		onClick?.();
	};

	return (
		<motion.div
			initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={
				prefersReducedMotion
					? { duration: 0 }
					: {
							duration: 0.3,
							delay: index * 0.05,
							type: 'spring',
							stiffness: 260,
							damping: 20,
						}
			}
			whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
			whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
		>
			<Card
				className={`cursor-pointer border-0 bg-card shadow-sm transition-all hover:shadow-md ${
					earned ? '' : 'opacity-60'
				}`}
				onClick={handleClick}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				<CardContent className="p-4 text-center">
					<div className="relative mb-3">
						<motion.div
							className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 ${
								earned
									? RARITY_STYLES[rarity]?.gradient || RARITY_STYLES.common.gradient
									: 'bg-muted border-2 border-border'
							} ${earned ? RARITY_STYLES[rarity]?.glow || '' : ''}`}
							animate={{
								rotate: isHovered && earned ? [0, -10, 10, -10, 0] : 0,
							}}
							transition={{ duration: 0.5 }}
						>
							{Icon && (
								<Icon
									className={`h-8 w-8 transition-colors duration-300 ${earned ? 'text-white' : 'text-foreground'}`}
								/>
							)}
						</motion.div>
					</div>

					<h4 className="mb-1 font-semibold text-foreground text-sm transition-colors duration-300">
						{name}
					</h4>
					<p className="mb-2 text-muted-foreground text-xs leading-tight transition-colors duration-300">
						{description}
					</p>

					{earned ? (
						<Badge
							className={`text-xs transition-colors duration-300 ${
								RARITY_STYLES[rarity]?.badge || RARITY_STYLES.common.badge
							}`}
						>
							{earnedDate}
						</Badge>
					) : (
						<div className="space-y-1">
							<div className="h-2 w-full rounded-full bg-muted transition-colors duration-300">
								<motion.div
									className="h-2 rounded-full bg-primary transition-all duration-300"
									initial={{ width: 0 }}
									animate={{ width: `${Math.min(progress || 0, 100)}%` }}
									transition={{ duration: 0.8, delay: index * 0.05 }}
								/>
							</div>
							<p className="text-muted-foreground text-xs transition-colors duration-300">
								{progress || 0}%
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}
