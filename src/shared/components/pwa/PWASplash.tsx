import { AnimatePresence, motion } from 'motion/react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { useTranslation } from '@/shared/lib/i18n';

// Lazy load lottie-react для уменьшения bundle
const Lottie = lazy(() => import('lottie-react').then((module) => ({ default: module.default })));

/**
 * Splash screen для PWA
 * Показывается только при запуске установленного приложения в standalone режиме
 * Улучшенная версия с Lottie анимацией и i18n поддержкой
 */
export function PWASplash() {
	const [showSplash, setShowSplash] = useState(false);
	const [animationData, setAnimationData] = useState<Record<string, unknown> | null>(null);
	const { t } = useTranslation();

	// Загружаем Lottie анимацию
	useEffect(() => {
		const loadAnimation = async () => {
			try {
				const data = (await import('@/components/preloader/White-2.json')).default;
				setAnimationData(data);
			} catch (error) {
				console.error('Failed to load splash animation:', error);
			}
		};
		loadAnimation();
	}, []);

	useEffect(() => {
		// Проверяем standalone режим
		const isStandalone =
			window.matchMedia('(display-mode: standalone)').matches ||
			(window.navigator as any).standalone === true;

		// Проверяем, первый ли это запуск после установки
		const splashShown = sessionStorage.getItem('pwaSplashShown');

		if (isStandalone && !splashShown) {
			setShowSplash(true);
			sessionStorage.setItem('pwaSplashShown', 'true');

			// Автоматически скрываем через 2 секунды
			const timer = setTimeout(() => {
				setShowSplash(false);
			}, 2000);

			return () => clearTimeout(timer);
		}
	}, []);

	return (
		<AnimatePresence>
			{showSplash && (
				<motion.div
					animate={{ opacity: 1 }}
					className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-linear-to-br from-background via-card to-background transition-colors duration-300"
					exit={{ opacity: 0 }}
					initial={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
				>
					<motion.div
						animate={{ scale: 1, opacity: 1 }}
						className="flex flex-col items-center justify-center"
						exit={{ scale: 1.2, opacity: 0 }}
						initial={{ scale: 0.8, opacity: 0 }}
						transition={{ duration: 0.5, ease: 'easeOut' }}
					>
						{/* Lottie Animation Logo */}
						<motion.div
							animate={{ opacity: 1 }}
							className="mb-8 h-32 w-32"
							initial={{ opacity: 0 }}
							transition={{ delay: 0.1, duration: 0.5 }}
						>
							{animationData && (
								<Suspense fallback={<div className="h-32 w-32" />}>
									<Lottie animationData={animationData} autoplay={true} loop={true} />
								</Suspense>
							)}
						</motion.div>

						{/* Title - UNITY */}
						<motion.h1
							animate={{ y: 0, opacity: 1 }}
							className="mb-2 font-bold text-4xl text-foreground tracking-tight transition-colors duration-300"
							initial={{ y: 20, opacity: 0 }}
							transition={{ delay: 0.3, duration: 0.5 }}
						>
							UNITY
						</motion.h1>

						{/* Subtitle - i18n translated */}
						<motion.p
							animate={{ y: 0, opacity: 1 }}
							className="text-center font-normal text-base text-muted-foreground transition-colors duration-300"
							initial={{ y: 20, opacity: 0 }}
							transition={{ delay: 0.5, duration: 0.5 }}
						>
							{t('splash.subtitle', 'Ваш дневник достижений')}
						</motion.p>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

export default PWASplash;
