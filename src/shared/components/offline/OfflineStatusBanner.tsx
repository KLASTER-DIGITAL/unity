/**
 * Offline Status Banner
 *
 * Modern banner showing offline status and sync progress.
 * Displays at the top of the screen when offline or when there are pending syncs.
 *
 * @author UNITY Team
 * @date 2025-10-24
 */

import { AlertCircle, CheckCircle, CloudOff, RefreshCw, WifiOff } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useOfflineMode } from '@/shared/lib/offline';

export function OfflineStatusBanner() {
	const { isOnline, lastOnline, pendingCount, syncInProgress, sync, lastSyncEvent } =
		useOfflineMode();

	const [showBanner, setShowBanner] = useState(false);
	const [message, setMessage] = useState('');
	const [variant, setVariant] = useState<'offline' | 'syncing' | 'success' | 'error'>('offline');

	useEffect(() => {
		// Show banner when offline or when there are pending syncs
		setShowBanner(!isOnline || pendingCount > 0);

		// Update message and variant
		if (!isOnline) {
			setVariant('offline');
			setMessage('Нет подключения к интернету');
		} else if (syncInProgress) {
			setVariant('syncing');
			setMessage(`Синхронизация ${pendingCount} записей...`);
		} else if (pendingCount > 0) {
			setVariant('error');
			setMessage(`${pendingCount} записей ожидают синхронизации`);
		} else {
			setVariant('success');
			setMessage('Все синхронизировано');
		}
	}, [isOnline, pendingCount, syncInProgress]);

	// Auto-hide success message after 3 seconds
	useEffect(() => {
		if (variant === 'success' && pendingCount === 0) {
			const timer = setTimeout(() => {
				setShowBanner(false);
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [variant, pendingCount]);

	// Show temporary success message when sync completes
	useEffect(() => {
		if (lastSyncEvent?.type === 'sync-complete') {
			setShowBanner(true);
			setVariant('success');
			setMessage('Синхронизация завершена');
		}
	}, [lastSyncEvent]);

	const getVariantStyles = () => {
		switch (variant) {
			case 'offline':
				return 'bg-linear-to-r from-gray-600 to-gray-700';
			case 'syncing':
				return 'bg-linear-to-r from-blue-500 to-blue-600';
			case 'success':
				return 'bg-linear-to-r from-green-500 to-green-600';
			case 'error':
				return 'bg-linear-to-r from-orange-500 to-orange-600';
			default:
				return 'bg-linear-to-r from-gray-600 to-gray-700';
		}
	};

	const getIcon = () => {
		switch (variant) {
			case 'offline':
				return <WifiOff className="h-5 w-5" />;
			case 'syncing':
				return <RefreshCw className="h-5 w-5 animate-spin" />;
			case 'success':
				return <CheckCircle className="h-5 w-5" />;
			case 'error':
				return <AlertCircle className="h-5 w-5" />;
			default:
				return <CloudOff className="h-5 w-5" />;
		}
	};

	const handleManualSync = async () => {
		if (!isOnline || syncInProgress) {
			return;
		}
		await sync();
	};

	const formatLastOnline = () => {
		if (!lastOnline) {
			return 'Никогда';
		}

		const now = new Date();
		const diff = now.getTime() - lastOnline.getTime();
		const minutes = Math.floor(diff / 60_000);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) {
			return `${days}д назад`;
		}
		if (hours > 0) {
			return `${hours}ч назад`;
		}
		if (minutes > 0) {
			return `${minutes}м назад`;
		}
		return 'Только что';
	};

	return (
		<AnimatePresence>
			{showBanner && (
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className={`fixed top-0 right-0 left-0 z-50 ${getVariantStyles()} text-white shadow-lg`}
					exit={{ opacity: 0, y: -50 }}
					initial={{ opacity: 0, y: -50 }}
					transition={{ duration: 0.3, ease: 'easeOut' }}
				>
					<div className="mx-auto max-w-7xl px-4 py-3">
						<div className="flex items-center justify-between gap-4">
							{/* Left: Icon + Message */}
							<div className="flex min-w-0 flex-1 items-center gap-3">
								<div className="shrink-0">{getIcon()}</div>

								<div className="min-w-0 flex-1">
									<p className="truncate font-medium text-sm">{message}</p>
									{!isOnline && lastOnline && (
										<p className="mt-0.5 text-xs opacity-75">
											Последнее подключение: {formatLastOnline()}
										</p>
									)}
								</div>
							</div>

							{/* Right: Actions */}
							<div className="flex shrink-0 items-center gap-2">
								{isOnline && pendingCount > 0 && !syncInProgress && (
									<button
										className="flex items-center gap-2 rounded-lg bg-primary/20 px-3 py-1.5 font-medium text-sm transition-colors duration-300 hover:bg-primary/30"
										onClick={handleManualSync}
									>
										<RefreshCw className="h-4 w-4" />
										Синхронизировать
									</button>
								)}

								{variant === 'success' && (
									<button
										aria-label="Закрыть"
										className="rounded-lg p-1.5 transition-colors duration-300 hover:bg-muted/20"
										onClick={() => setShowBanner(false)}
									>
										<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												d="M6 18L18 6M6 6l12 12"
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
											/>
										</svg>
									</button>
								)}
							</div>
						</div>

						{/* Progress bar for syncing */}
						{syncInProgress && (
							<div className="mt-2">
								<div className="h-1 w-full overflow-hidden rounded-full bg-muted/20 transition-colors duration-300">
									<motion.div
										animate={{ width: '100%' }}
										className="h-full bg-primary transition-colors duration-300"
										initial={{ width: '0%' }}
										transition={{
											duration: 2,
											ease: 'linear',
											repeat: Number.POSITIVE_INFINITY,
										}}
									/>
								</div>
							</div>
						)}
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
