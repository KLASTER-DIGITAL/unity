import { Heart } from 'lucide-react';
// ✅ REACT NATIVE READY: Use Platform Adapter for animations
import { motion, useMotionValue, useTransform } from '@/shared/lib/platform/animation';
import type { SwipeCardProps } from './types';

/**
 * Swipe Card Component
 * Features:
 * - Drag and swipe gestures
 * - Stack visualization (up to 4 cards visible)
 * - Like overlay on right swipe
 * - Haptic feedback
 * - Smooth animations
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

	const handleDragEnd = (_event: any, info: any) => {
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

	// ✅ FIX: Конвертируем Tailwind градиент в CSS gradient для inline style
	const getGradientStyle = () => {
		// ✅ FIX: Проверяем что gradient существует и не пустой
		if (!card.gradient || card.gradient.trim() === '') {
			// Fallback gradient если gradient отсутствует
			return 'linear-gradient(to bottom right, #ec4899, #ef4444, #eab308)';
		}

		// Парсим Tailwind класс градиента (например: "from-pink-300 via-purple-300 to-indigo-400")
		const gradientParts = card.gradient.split(' ');
		const fromColor = gradientParts.find((p) => p.startsWith('from-'))?.replace('from-', '');
		const viaColor = gradientParts.find((p) => p.startsWith('via-'))?.replace('via-', '');
		const toColor = gradientParts.find((p) => p.startsWith('to-'))?.replace('to-', '');

		// Конвертируем Tailwind цвета в CSS цвета
		const colorMap: Record<string, string> = {
			// Pink
			'pink-300': '#f9a8d4',
			'pink-500': '#ec4899',
			// Purple
			'purple-300': '#d8b4fe',
			'purple-400': '#c084fc',
			'purple-600': '#9333ea',
			// Red
			'red-500': '#ef4444',
			// Yellow
			'yellow-500': '#eab308',
			'yellow-200': '#fef08a',
			'yellow-100': '#fef9c3',
			'yellow-300': '#fde047',
			// Indigo
			'indigo-400': '#818cf8',
			'indigo-200': '#c7d2fe',
			// Green
			'green-300': '#86efac',
			'green-200': '#bbf7d0',
			'green-400': '#4ade80',
			// Blue
			'blue-500': '#3b82f6',
			// Pink (additional)
			'pink-200': '#fbcfe8',
			'pink-400': '#f472b6',
		};

		const from = fromColor ? colorMap[fromColor] || fromColor : '#ec4899';
		const via = viaColor ? colorMap[viaColor] || viaColor : '#ef4444';
		const to = toColor ? colorMap[toColor] || toColor : '#eab308';

		return `linear-gradient(to bottom right, ${from}, ${via}, ${to})`;
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
						className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-r from-transparent via-green-500/20 to-green-500/40"
						style={{ opacity: likeOpacity }}
					>
						<div className="rotate-12 rounded-2xl border-4 border-white bg-green-500 px-8 py-4 text-white shadow-xl">
							<Heart className="h-12 w-12" fill="currentColor" />
						</div>
					</motion.div>
				)}

				{/* Основное содержимое карточки */}
				<div className="relative z-0 p-card">
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
