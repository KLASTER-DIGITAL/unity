import { useEffect } from 'react';
import { LottiePreloader } from '@/shared/components/LottiePreloader';
import { ThemeProvider } from '@/shared/components/theme-provider';
import { Skeleton } from '@/shared/components/ui/skeleton';

interface LoadingViewProps {
	shouldShowLottie: boolean;
	isFirstLaunch: boolean;
	onMinDurationComplete: () => void;
}

export function LoadingView({
	shouldShowLottie,
	isFirstLaunch,
	onMinDurationComplete,
}: LoadingViewProps) {
	// ✅ CRITICAL FIX: Если НЕ показываем Lottie, немедленно вызываем onMinDurationComplete
	// Иначе приложение застрянет в loading состоянии навсегда
	useEffect(() => {
		if (!shouldShowLottie) {
			console.log('⚡ [LoadingView] No Lottie, calling onMinDurationComplete immediately');
			onMinDurationComplete();
		}
	}, [shouldShowLottie, onMinDurationComplete]);

	return (
		<ThemeProvider defaultTheme="light" storageKey="unity-theme">
			<div className="mx-auto max-w-md">
				{shouldShowLottie ? (
					<LottiePreloader
						minDuration={isFirstLaunch ? 3000 : 500}
						onMinDurationComplete={onMinDurationComplete}
						showMessage={false}
						size="lg"
					/>
				) : (
					<div className="flex min-h-screen items-center justify-center">
						<Skeleton variant="circle" size="2xl" />
					</div>
				)}
			</div>
		</ThemeProvider>
	);
}
