/**
 * Быстрый Loading Screen без тяжелых Lottie анимаций
 * Используется для переходов между страницами после первого запуска
 */

import { useEffect } from 'react';
import { Skeleton } from '@/shared/components/ui/skeleton';

type LoadingScreenProps = {
	message?: string;
	/**
	 * Минимальное время показа прелоадера в миллисекундах
	 * @default 0 (мгновенное отображение)
	 */
	minDuration?: number;
	/**
	 * Callback когда минимальное время истекло
	 */
	onMinDurationComplete?: () => void;
};

export function LoadingScreen({
	message: _message = 'Загрузка...',
	minDuration = 0,
	onMinDurationComplete,
}: LoadingScreenProps) {
	// Быстрый таймер для callback (если указан)
	useEffect(() => {
		if (minDuration > 0 && onMinDurationComplete) {
			const timer = setTimeout(() => {
				onMinDurationComplete();
			}, minDuration);

			return () => clearTimeout(timer);
		}
	}, [minDuration, onMinDurationComplete]);

	// Skeleton с shimmer эффектом вместо простого animate-pulse
	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="flex flex-col items-center gap-4">
				{/* Skeleton с shimmer эффектом для лучшего UX */}
				<Skeleton variant="circle" size="2xl" />
			</div>
		</div>
	);
}

export default LoadingScreen;
