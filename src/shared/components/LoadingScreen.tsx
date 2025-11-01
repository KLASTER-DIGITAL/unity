/**
 * Быстрый Loading Screen без тяжелых Lottie анимаций
 * Используется для переходов между страницами после первого запуска
 */

import { useEffect } from 'react';

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

	// Легкий Skeleton вместо тяжелой Lottie анимации
	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="flex flex-col items-center gap-4">
				{/* Быстрый pulsing circle вместо Lottie */}
				<div className="h-12 w-12 animate-pulse rounded-full bg-primary/20" />
			</div>
		</div>
	);
}

export default LoadingScreen;
