import { Heart, Sparkles, Target, ThumbsUp, TrendingUp } from 'lucide-react';
// ✅ REACT NATIVE READY: Use Platform Adapter for animations
import { motion, useMotionValue, useTransform } from '@/shared/lib/platform/animation';
import type { CardType, SwipeCardProps } from './types';

/**
 * Get card type styling (gradient, icon, animation)
 */
function getCardTypeStyle(cardType?: CardType) {
	const styles = {
		celebrate: {
			gradient: 'from-yellow-300 via-orange-400 to-pink-500',
			icon: Sparkles,
			iconColor: '#fbbf24', // yellow-400
			accentColor: '#f59e0b', // amber-500
		},
		reflect: {
			gradient: 'from-blue-300 via-purple-400 to-indigo-500',
			icon: Heart,
			iconColor: '#93c5fd', // blue-300
			accentColor: '#818cf8', // indigo-400
		},
		focus: {
			gradient: 'from-green-300 via-teal-400 to-blue-500',
			icon: Target,
			iconColor: '#6ee7b7', // emerald-300
			accentColor: '#14b8a6', // teal-500
		},
		gratitude: {
			gradient: 'from-pink-300 via-rose-400 to-red-400',
			icon: ThumbsUp,
			iconColor: '#fda4af', // rose-300
			accentColor: '#fb7185', // rose-400
		},
		progress: {
			gradient: 'from-green-200 via-blue-400 to-purple-600',
			icon: TrendingUp,
			iconColor: '#86efac', // green-300
			accentColor: '#3b82f6', // blue-500
		},
		generic: {
			gradient: 'from-pink-300 via-purple-300 to-indigo-400',
			icon: Heart,
			iconColor: '#f9a8d4', // pink-300
			accentColor: '#c084fc', // purple-400
		},
	};

	return styles[cardType || 'generic'];
}

/**
 * Swipe Card Component
 * Features:
 * - Drag and swipe gestures
 * - Stack visualization (up to 4 cards visible)
 * - Like overlay on right swipe
 * - Haptic feedback
 * - Smooth animations
 * - Type-specific styling (celebrate, reflect, focus, gratitude, progress)
 */
export function SwipeCard({
	card,
	index,
	totalCards: _totalCards,
	onSwipe,
	isTop,
}: SwipeCardProps) {
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const rotate = useTransform(x, [-300, 0, 300], [-25, 0, 25]);
	const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

	// Overlay для визуального feedback при свайпе (только лайк)
	const likeOpacity = useTransform(x, [0, 100], [0, 1]);

	// ✅ FIX UNITY-V2-S: Вызываем useTransform ВСЕГДА (не условно)
	const scaleTransform = useTransform(opacity, [0.5, 1], [0.9, 1]);

	// ✅ FIX: Вычисляем положение карточек в стеке (стопка ВНИЗ, не вверх)
	const getStackStyle = () => {
		switch (index) {
			case 0: // Верхняя карточка - полностью видна
				return {
					scale: 1,
					y: 0,
					rotate: 0,
					opacity: 1,
					blur: 0,
					zIndex: 40,
				};
			case 1: // Вторая карточка - хорошо видна сзади
				return {
					scale: 0.96,
					y: 8, // ✅ FIX: Положительный offset - карточка НИЖЕ первой
					rotate: -2,
					opacity: 0.9,
					blur: 1.5, // ✅ FIX: Легкий blur для глубины
					zIndex: 30,
				};
			case 2: // Третья карточка - видна за второй
				return {
					scale: 0.92,
					y: 16, // ✅ FIX: Положительный offset - карточка НИЖЕ второй
					rotate: 2,
					opacity: 0.8,
					blur: 2.5, // ✅ FIX: Средний blur для глубины
					zIndex: 20,
				};
			default: // Остальные карточки - слегка видны
				return {
					scale: 0.88,
					y: 24, // ✅ FIX: Положительный offset - карточка НИЖЕ третьей
					rotate: 0,
					opacity: 0.7,
					blur: 3, // ✅ FIX: Сильный blur для глубины
					zIndex: 10,
				};
		}
	};

	const stackStyle = getStackStyle();

	const handleDragEnd = (
		_event: unknown,
		info: { offset: { x: number }; velocity: { x: number } }
	) => {
		const offset = info.offset.x;
		const velocity = info.velocity.x;

		// Если свайп достаточно быстрый или далекий
		if (Math.abs(velocity) > 500 || Math.abs(offset) > 100) {
			// Haptic feedback
			if (navigator.vibrate) {
				navigator.vibrate(50);
			}

			onSwipe(offset > 0 ? 'right' : 'left');
		} else {
			// Возвращаем карточку на место
			x.set(0);
			y.set(0);
		}
	};

	// ✅ Get card type styling
	const cardTypeStyle = getCardTypeStyle(card.card_type);

	// ✅ FIX: Конвертируем Tailwind градиент в CSS gradient для inline style
	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: gradient parsing covers multiple fallbacks
	const getGradientStyle = () => {
		// ✅ ПРИОРИТЕТ 1: Используем градиент из card_type если доступен
		if (card.card_type) {
			const typeGradient = cardTypeStyle.gradient;
			const gradientParts = typeGradient.split(' ');
			const fromColor = gradientParts.find((p) => p.startsWith('from-'))?.replace('from-', '');
			const viaColor = gradientParts.find((p) => p.startsWith('via-'))?.replace('via-', '');
			const toColor = gradientParts.find((p) => p.startsWith('to-'))?.replace('to-', '');

			// Конвертируем Tailwind цвета в CSS цвета
			const colorMap: Record<string, string> = {
				// Yellow/Orange/Pink (celebrate)
				'yellow-300': '#fde047',
				'orange-400': '#fb923c',
				'pink-500': '#ec4899',
				// Blue/Purple/Indigo (reflect)
				'blue-300': '#93c5fd',
				'purple-400': '#c084fc',
				'indigo-500': '#6366f1',
				// Green/Teal/Blue (focus)
				'green-300': '#86efac',
				'teal-400': '#2dd4bf',
				'blue-500': '#3b82f6',
				// Pink/Rose/Red (gratitude)
				'pink-300': '#f9a8d4',
				'rose-400': '#fb7185',
				'red-400': '#f87171',
				// Green/Blue/Purple (progress)
				'green-200': '#bbf7d0',
				'blue-400': '#60a5fa',
				'purple-600': '#9333ea',
				// Generic fallback
				'purple-300': '#d8b4fe',
				'indigo-400': '#818cf8',
			};

			const from = fromColor ? colorMap[fromColor] || fromColor : '#ec4899';
			const via = viaColor ? colorMap[viaColor] || viaColor : '#ef4444';
			const to = toColor ? colorMap[toColor] || toColor : '#eab308';

			return `linear-gradient(to bottom right, ${from}, ${via}, ${to})`;
		}

		// ✅ ПРИОРИТЕТ 2: Используем card.gradient если есть
		if (card.gradient && card.gradient.trim() !== '') {
			const gradientParts = card.gradient.split(' ');
			const fromColor = gradientParts.find((p) => p.startsWith('from-'))?.replace('from-', '');
			const viaColor = gradientParts.find((p) => p.startsWith('via-'))?.replace('via-', '');
			const toColor = gradientParts.find((p) => p.startsWith('to-'))?.replace('to-', '');

			const colorMap: Record<string, string> = {
				'pink-300': '#f9a8d4',
				'pink-500': '#ec4899',
				'purple-300': '#d8b4fe',
				'purple-400': '#c084fc',
				'purple-600': '#9333ea',
				'red-500': '#ef4444',
				'yellow-500': '#eab308',
				'indigo-400': '#818cf8',
				'green-300': '#86efac',
				'blue-500': '#3b82f6',
			};

			const from = fromColor ? colorMap[fromColor] || fromColor : '#ec4899';
			const via = viaColor ? colorMap[viaColor] || viaColor : '#ef4444';
			const to = toColor ? colorMap[toColor] || toColor : '#eab308';

			return `linear-gradient(to bottom right, ${from}, ${via}, ${to})`;
		}

		// ✅ FALLBACK: Generic gradient
		return 'linear-gradient(to bottom right, #f9a8d4, #d8b4fe, #818cf8)';
	};

	return (
		<motion.div
			animate={
				isTop
					? undefined // Верхняя карточка НЕ анимируется автоматически (только через drag)
					: {
							scale: stackStyle.scale,
							y: stackStyle.y,
							rotate: stackStyle.rotate,
							opacity: stackStyle.opacity,
							filter: `blur(${stackStyle.blur}px)`, // ✅ FIX: Вернули blur для глубины стопки
							transition: { duration: 0.3, ease: 'easeOut' },
						}
			}
			className="absolute left-0 top-0 w-full cursor-grab active:cursor-grabbing"
			drag={isTop}
			dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
			dragElastic={0.7}
			exit={{
				x: x.get() > 0 ? 400 : -400,
				opacity: 0,
				rotate: x.get() > 0 ? 30 : -30,
				transition: { duration: 0.3, ease: 'easeIn' },
			}}
			initial={{
				scale: stackStyle.scale,
				y: stackStyle.y,
				rotate: stackStyle.rotate,
				opacity: stackStyle.opacity,
			}}
			onDragEnd={handleDragEnd}
			style={{
				x: isTop ? x : 0,
				y: isTop ? y : stackStyle.y,
				rotate: isTop ? rotate : stackStyle.rotate,
				scale: isTop ? (opacity.get() > 0.8 ? 1 : scaleTransform) : stackStyle.scale,
				zIndex: stackStyle.zIndex,
				filter: isTop ? 'none' : `blur(${stackStyle.blur}px)`, // ✅ FIX: Blur ТОЛЬКО для задних карточек
			}}
			whileTap={{ cursor: 'grabbing', scale: isTop ? 1.02 : stackStyle.scale }}
		>
			<div
				className="relative overflow-hidden rounded-[36px]"
				style={{
					backgroundImage: getGradientStyle(),
					boxShadow: index === 0 ? '0 20px 60px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.2)',
				}}
			>
				{/* Like overlay - показывается при свайпе вправо */}
				{isTop && (
					<motion.div
						className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-linear-to-r from-transparent via-green-500/20 to-green-500/40"
						style={{ opacity: likeOpacity }}
					>
						<div className="rotate-12 rounded-2xl border-4 border-white bg-green-500 px-8 py-4 text-white shadow-xl">
							<Heart className="h-12 w-12" fill="currentColor" />
						</div>
					</motion.div>
				)}

				{/* Основное содержимое карточки */}
				<div className="relative z-0 p-card">
					{/* Card Type Icon - показываем в правом верхнем углу */}
					{card.card_type && (
						<div className="absolute top-4 right-4 z-10">
							<div
								className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
								style={{
									boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
								}}
							>
								<cardTypeStyle.icon
									className="h-5 w-5 text-white"
									strokeWidth={2.5}
									style={{ color: 'white' }}
								/>
							</div>
						</div>
					)}

					{/* Title */}
					<motion.div className="mb-3">
						<h3 className="text-title-2 text-white leading-tight tracking-[-0.5px]">
							{card.title}
						</h3>
					</motion.div>

					{/* Description */}
					<motion.div className="mb-0">
						<p className="text-callout text-white leading-[22px] opacity-95">{card.description}</p>
					</motion.div>
				</div>
			</div>
		</motion.div>
	);
}
