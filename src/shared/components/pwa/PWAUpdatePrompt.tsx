import { ArrowRight, RefreshCw, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

import { WhatsNewModal } from '@/shared/components/version/WhatsNewModal';
import { CURRENT_VERSION } from '@/shared/lib/version/changelog';

/**
 * Premium Update Prompt Component
 *
 * Features:
 * - Glassmorphism design
 * - Smooth animations
 * - Robust update logic
 * - "What's New" modal integration
 */
export function PWAUpdatePrompt() {
	const [showUpdate, setShowUpdate] = useState(false);
	const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const [showWhatsNew, setShowWhatsNew] = useState(false);
	const [previousVersion, setPreviousVersion] = useState<string | undefined>();
	const [updateProgress, setUpdateProgress] = useState(0);

	useEffect(() => {
		if (!('serviceWorker' in navigator)) return;

		const handleServiceWorkerUpdate = (registration: ServiceWorkerRegistration) => {
			const worker = registration.waiting;
			if (worker) {
				console.log('[PWA Update] Waiting worker found');
				setWaitingWorker(worker);
				setShowUpdate(true);
			}

			registration.addEventListener('updatefound', () => {
				const newWorker = registration.installing;
				if (newWorker) {
					console.log('[PWA Update] New worker installing...');
					newWorker.addEventListener('statechange', () => {
						if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
							console.log('[PWA Update] New worker installed');
							setWaitingWorker(newWorker);
							setShowUpdate(true);
						}
					});
				}
			});
		};

		navigator.serviceWorker.getRegistration().then((reg) => {
			if (reg) handleServiceWorkerUpdate(reg);
		});

		const handleControllerChange = () => {
			console.log('[PWA Update] Controller changed');
			// Check if we should show "What's New"
			const storedVersion = localStorage.getItem('app_version');
			if (storedVersion && storedVersion !== CURRENT_VERSION) {
				setPreviousVersion(storedVersion);
				setShowWhatsNew(true);
				return;
			}
			window.location.reload();
		};

		navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
		return () =>
			navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
	}, []);

	const handleUpdate = () => {
		if (!waitingWorker) return;

		setIsUpdating(true);

		// Simulate progress for better UX
		let progress = 0;
		const interval = setInterval(() => {
			progress += 5;
			if (progress > 90) clearInterval(interval);
			setUpdateProgress(progress);
		}, 50);

		console.log('[PWA Update] Sending SKIP_WAITING...');
		waitingWorker.postMessage({ type: 'SKIP_WAITING' });

		// Fallback reload if controllerchange doesn't fire
		setTimeout(() => {
			console.log('[PWA Update] Timeout, forcing reload...');
			window.location.reload();
		}, 4000);
	};

	const handleSkip = () => {
		setShowUpdate(false);
	};

	const handleCloseWhatsNew = () => {
		setShowWhatsNew(false);
		// Update version in storage
		localStorage.setItem('app_version', CURRENT_VERSION);
		window.location.reload();
	};

	return (
		<>
			<WhatsNewModal
				isOpen={showWhatsNew}
				onClose={handleCloseWhatsNew}
				previousVersion={previousVersion}
			/>

			<AnimatePresence>
				{showUpdate && (
					<motion.div
						initial={{ opacity: 0, y: 50, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 50, scale: 0.95 }}
						transition={{ type: 'spring', damping: 25, stiffness: 300 }}
						className="fixed bottom-6 left-1/2 z-modal -translate-x-1/2 mx-auto w-[calc(100%-2rem)] max-w-sm"
						style={{
							// ✅ FIX: Учитываем safe-area-inset-bottom для iPhone
							bottom: 'max(calc(1.5rem + env(safe-area-inset-bottom, 0px)), 1.5rem)',
						}}
					>
						<div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/80 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-black/80">
							{/* Background Glow Effect */}
							<div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl" />
							<div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl" />

							<div className="relative flex flex-col gap-4">
								{/* Header */}
								<div className="flex items-start justify-between gap-3">
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
											{isUpdating ? (
												<RefreshCw className="h-5 w-5 animate-spin text-white" />
											) : (
												<Sparkles className="h-5 w-5 text-white" />
											)}
										</div>
										<div>
											<h3 className="font-semibold text-white">
												{isUpdating ? 'Обновление...' : 'Доступно обновление'}
											</h3>
											<p className="text-xs text-white/70">
												{isUpdating ? 'Устанавливаем новую версию' : 'Новые функции и улучшения'}
											</p>
										</div>
									</div>
									{!isUpdating && (
										<button
											type="button"
											onClick={handleSkip}
											className="rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
										>
											<X className="h-5 w-5" />
										</button>
									)}
								</div>

								{/* Progress Bar (only when updating) */}
								{isUpdating && (
									<div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
										<motion.div
											className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
											initial={{ width: '0%' }}
											animate={{ width: `${updateProgress}%` }}
											transition={{ duration: 0.2 }}
										/>
									</div>
								)}

								{/* Actions */}
								{!isUpdating && (
									<div className="flex gap-2">
										<button
											type="button"
											onClick={handleUpdate}
											className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-black transition-transform active:scale-95"
										>
											Обновить сейчас
											<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
										</button>
									</div>
								)}
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
