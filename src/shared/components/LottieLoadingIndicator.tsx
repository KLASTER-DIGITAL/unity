import { lazy, Suspense, useEffect, useState } from 'react';
import { useTheme } from '@/shared/components/theme-provider';
import { LottiePreloaderInline } from './LottiePreloader';

// Lazy load lottie-react для уменьшения bundle
const Lottie = lazy(() => import('lottie-react').then((module) => ({ default: module.default })));

interface LottieLoadingIndicatorProps {
	size?: 'sm' | 'md' | 'lg';
	showText?: boolean;
	text?: string;
	className?: string;
}

/**
 * Lottie Loading Indicator Component
 * Replaces Loader2 spinner with animated Lottie preloader
 * Supports light and dark themes automatically
 *
 * ✅ FIXED: Suspense fallback now shows LottiePreloaderInline instead of empty div
 * This prevents double loading indicators (spinner + lottie)
 */
export function LottieLoadingIndicator({
	size = 'sm',
	showText = false,
	text = 'Loading...',
	className = '',
}: LottieLoadingIndicatorProps) {
	const { theme } = useTheme();
	const [animationData, setAnimationData] = useState<Record<string, unknown> | null>(null);

	// Dynamically load animation based on theme
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
	};

	return (
		<div className={`flex items-center gap-2 ${className}`}>
			<div className={sizeClasses[size]}>
				{animationData && (
					<Suspense fallback={<LottiePreloaderInline size={size} />}>
						<Lottie animationData={animationData} autoplay={true} loop={true} />
					</Suspense>
				)}
			</div>
			{showText && <span className="text-muted-foreground text-xs">{text}</span>}
		</div>
	);
}

export default LottieLoadingIndicator;
