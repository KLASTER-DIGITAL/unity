import { lazy, Suspense, useEffect, useState } from 'react';
import { useTheme } from '@/shared/components/theme-provider';

// Lazy load lottie-react библиотеки для уменьшения initial bundle на ~150 KB
const Lottie = lazy(() => import('lottie-react').then((module) => ({ default: module.default })));

// Lottie animations будут загружаться динамически через import()
// Page-level loading - Black-2.json для темной темы, White-2.json для светлой
// Используется ТОЛЬКО для первой загрузки страницы (page-level loading)
// Для component-level loading используйте Skeleton компоненты

type LottiePreloaderProps = {
	/**
	 * Текст сообщения под анимацией
	 * @default "Загрузка..."
	 */
	message?: string;

	/**
	 * Минимальное время показа прелоадера в миллисекундах
	 * @default 5000 (5 секунд)
	 */
	minDuration?: number;

	/**
	 * Показывать ли текст сообщения
	 * @default true
	 */
	showMessage?: boolean;

	/**
	 * Размер анимации
	 * @default "md"
	 * sm: 96x96px (w-24 h-24)
	 * md: 128x128px (w-32 h-32)
	 * lg: 192x192px (w-48 h-48)
	 * xl: 256x256px (w-64 h-64)
	 */
	size?: 'sm' | 'md' | 'lg' | 'xl';

	/**
	 * Дополнительные CSS классы
	 */
	className?: string;

	/**
	 * Callback когда минимальное время истекло
	 */
	onMinDurationComplete?: () => void;

	/**
	 * Тип анимации прелоадера (DEPRECATED - теперь всегда используется 'transition')
	 * @deprecated Используйте Skeleton компоненты для component-level loading
	 * @default "transition" - Black-2.json/White-2.json для page-level loading
	 */
	animationType?: 'initial' | 'transition';
};

/**
 * Универсальный Lottie прелоадер с поддержкой тем и типов анимации
 *
 * Автоматически переключается между черной и белой анимацией
 * в зависимости от текущей темы (light/dark) и типа анимации
 *
 * @example
 * ```tsx
 * // Для первой загрузки (Welcome screen)
 * <LottiePreloader message="Загрузка..." minDuration={5000} animationType="initial" />
 *
 * // Для переходов между страницами
 * <LottiePreloader showMessage={false} animationType="transition" size="md" />
 * ```
 */
export function LottiePreloader({
	message = 'Загрузка...',
	minDuration = 5000,
	showMessage = true,
	size = 'md',
	className = '',
	onMinDurationComplete,
	animationType: _animationType = 'initial', // Deprecated parameter, kept for backwards compatibility
}: LottiePreloaderProps) {
	const { theme } = useTheme();
	const [_minDurationElapsed, setMinDurationElapsed] = useState(false);
	const [animationData, setAnimationData] = useState<any>(null);

	// Динамически загружаем анимацию в зависимости от темы
	// Page-level loading (ТОЛЬКО для первой загрузки страницы):
	//   - White-2.json - для светлой темы
	//   - Black-2.json - для темной темы
	// Для component-level loading используйте Skeleton компоненты
	useEffect(() => {
		const loadAnimation = async () => {
			const data =
				theme === 'dark'
					? (await import('@/components/preloader/Black-2.json')).default
					: (await import('@/components/preloader/White-2.json')).default;
			setAnimationData(data);
		};
		loadAnimation();
	}, [theme]);

	// Размеры анимации
	const sizeClasses = {
		sm: 'w-24 h-24',
		md: 'w-32 h-32',
		lg: 'w-48 h-48',
		xl: 'w-64 h-64',
	};

	// Отслеживаем минимальное время показа
	useEffect(() => {
		const timer = setTimeout(() => {
			setMinDurationElapsed(true);
			onMinDurationComplete?.();
		}, minDuration);

		return () => clearTimeout(timer);
	}, [minDuration, onMinDurationComplete]);

	return (
		<div className={`flex min-h-screen items-center justify-center bg-background ${className}`}>
			<div className="text-center">
				{/* Lottie Animation with Suspense for lazy loading */}
				<div className={`${sizeClasses[size]} mx-auto mb-4`}>
					{animationData && (
						<Suspense fallback={<div className={sizeClasses[size]} />}>
							<Lottie animationData={animationData} autoplay={true} loop={true} />
						</Suspense>
					)}
				</div>

				{/* Message */}
				{showMessage && <p className="text-muted-foreground text-sm md:text-base">{message}</p>}
			</div>
		</div>
	);
}

/**
 * Компактный вариант прелоадера для использования внутри компонентов
 * Поддерживает опциональный minDuration для страниц
 * Используется для переходов между страницами (animationType="transition")
 */
export function LottiePreloaderCompact({
	message = 'Загрузка...',
	size = 'sm',
	showMessage = false,
	minDuration,
	onMinDurationComplete,
	className = '',
	animationType: _animationType = 'transition', // Deprecated parameter, kept for backwards compatibility
}: Omit<LottiePreloaderProps, 'minDuration' | 'onMinDurationComplete'> & {
	minDuration?: number;
	onMinDurationComplete?: () => void;
}) {
	const { theme } = useTheme();
	const [animationData, setAnimationData] = useState<any>(null);
	const [_minDurationElapsed, setMinDurationElapsed] = useState(false);

	// DEPRECATED: Используйте Skeleton компоненты вместо LottiePreloaderCompact
	// Динамически загружаем анимацию page-level loading (Black-2.json/White-2.json)
	useEffect(() => {
		const loadAnimation = async () => {
			const data =
				theme === 'dark'
					? (await import('@/components/preloader/Black-2.json')).default
					: (await import('@/components/preloader/White-2.json')).default;
			setAnimationData(data);
		};
		loadAnimation();
	}, [theme]);

	// Если указан minDuration, запускаем таймер
	useEffect(() => {
		if (minDuration && minDuration > 0) {
			const timer = setTimeout(() => {
				setMinDurationElapsed(true);
				onMinDurationComplete?.();
			}, minDuration);

			return () => clearTimeout(timer);
		}
	}, [minDuration, onMinDurationComplete]);

	const sizeClasses = {
		sm: 'w-12 h-12',
		md: 'w-16 h-16',
		lg: 'w-24 h-24',
		xl: 'w-32 h-32',
	};

	return (
		<div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
			<div className={`${sizeClasses[size]}`}>
				{animationData && (
					<Suspense fallback={<div className={sizeClasses[size]} />}>
						<Lottie animationData={animationData} autoplay={true} loop={true} />
					</Suspense>
				)}
			</div>
			{showMessage && <p className="text-muted-foreground text-xs md:text-sm">{message}</p>}
		</div>
	);
}

/**
 * Inline вариант прелоадера для использования в кнопках и других элементах
 * Используется для переходов между страницами (animationType="transition")
 */
export function LottiePreloaderInline({
	size = 'sm',
	className = '',
	animationType: _animationType = 'transition', // Deprecated parameter, kept for backwards compatibility
}: Pick<LottiePreloaderProps, 'size' | 'className' | 'animationType'>) {
	const { theme } = useTheme();
	const [animationData, setAnimationData] = useState<any>(null);

	// DEPRECATED: Используйте Skeleton компоненты вместо LottiePreloaderInline
	// Динамически загружаем анимацию page-level loading (Black-2.json/White-2.json)
	// Инвертируем цвета для inline элементов (светлая анимация на темном фоне и наоборот)
	useEffect(() => {
		const loadAnimation = async () => {
			const data =
				theme === 'dark'
					? (await import('@/components/preloader/White-2.json')).default
					: (await import('@/components/preloader/Black-2.json')).default;
			setAnimationData(data);
		};
		loadAnimation();
	}, [theme]);

	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-6 h-6',
		lg: 'w-8 h-8',
		xl: 'w-12 h-12',
	};

	return (
		<div className={`inline-block ${sizeClasses[size]} ${className}`}>
			{animationData && (
				<Suspense fallback={<div className={sizeClasses[size]} />}>
					<Lottie animationData={animationData} autoplay={true} loop={true} />
				</Suspense>
			)}
		</div>
	);
}

export default LottiePreloader;
