import { LottiePreloader } from '@/shared/components/LottiePreloader';
import { ThemeProvider } from '@/shared/components/theme-provider';

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
						<div className="h-12 w-12 animate-pulse rounded-full bg-primary/20" />
					</div>
				)}
			</div>
		</ThemeProvider>
	);
}
