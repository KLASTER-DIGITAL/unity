import { Download, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/shared/lib/i18n';

type InstallPromptProps = {
	onClose: () => void;
	onInstall: () => void;
};

export function InstallPrompt({ onClose, onInstall }: InstallPromptProps) {
	const { t } = useTranslation();
	const [isIOS, setIsIOS] = useState(false);

	useEffect(() => {
		// Определяем iOS устройство
		const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
		setIsIOS(iOS);
	}, []);

	return (
		<AnimatePresence>
			<motion.div
				animate={{ opacity: 1 }}
				className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm md:items-center md:p-4"
				exit={{ opacity: 0 }}
				initial={{ opacity: 0 }}
				onClick={onClose}
			>
				<motion.div
					animate={{ y: 0, opacity: 1, scale: 1 }}
					className="relative w-full overflow-hidden rounded-t-[32px] bg-card shadow-2xl transition-colors duration-300 md:max-w-md md:rounded-[32px]"
					exit={{ y: 400, opacity: 0, scale: 0.9 }}
					initial={{ y: 400, opacity: 0, scale: 0.9 }}
					onClick={(e) => e.stopPropagation()}
					transition={{ type: 'spring', damping: 30, stiffness: 300 }}
				>
					{/* Close button */}
					<button
						className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 transition-colors hover:bg-muted"
						onClick={onClose}
					>
						<X className="h-5 w-5 text-foreground" />
					</button>

					{/* Content */}
					<div className="p-6 pt-8 pb-6">
						{/* Icon with animation */}
						<motion.div
							animate={{ scale: 1, rotate: 0 }}
							className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-primary to-accent shadow-lg transition-colors duration-300"
							initial={{ scale: 0, rotate: -180 }}
							transition={{ delay: 0.2, type: 'spring', damping: 15 }}
						>
							<span className="text-[32px]">🏆</span>
						</motion.div>

						{/* Title */}
						<motion.h2
							animate={{ y: 0, opacity: 1 }}
							className="mb-2 text-center font-semibold text-[20px] text-foreground leading-tight"
							initial={{ y: 20, opacity: 0 }}
							transition={{ delay: 0.3 }}
						>
							{t('pwa.install.title', 'Установить приложение')}
						</motion.h2>

						{/* Description */}
						<motion.p
							animate={{ y: 0, opacity: 1 }}
							className="mb-5 text-center font-normal text-[13px] text-muted-foreground leading-[1.4]"
							initial={{ y: 20, opacity: 0 }}
							transition={{ delay: 0.4 }}
						>
							{t(
								'pwa.install.description',
								'Установите приложение для быстрого доступа и работы офлайн'
							)}
						</motion.p>

						{/* Features */}
						<motion.div
							animate={{ y: 0, opacity: 1 }}
							className="mb-5 space-y-2.5"
							initial={{ y: 20, opacity: 0 }}
							transition={{ delay: 0.5 }}
						>
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
									<span className="text-[16px]">⚡️</span>
								</div>
								<p className="font-normal text-[13px] text-foreground">
									{t('pwa.install.feature1', 'Быстрый запуск приложения')}
								</p>
							</div>
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
									<span className="text-[16px]">📱</span>
								</div>
								<p className="font-normal text-[13px] text-foreground">
									{t('pwa.install.feature2', 'Быстрый доступ с главного экрана')}
								</p>
							</div>
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
									<span className="text-[16px]">🔔</span>
								</div>
								<p className="font-normal text-[13px] text-foreground">
									{t('pwa.install.feature3', 'Push-уведомления о ваших целях')}
								</p>
							</div>
						</motion.div>

						{/* Install Instructions */}
						{isIOS ? (
							<motion.div
								animate={{ y: 0, opacity: 1 }}
								className="mb-6 rounded-xl bg-accent/5 p-4"
								initial={{ y: 20, opacity: 0 }}
								transition={{ delay: 0.6 }}
							>
								<p className="text-center font-normal! text-[13px]! text-foreground leading-[1.5]">
									{t('pwa.install.ios_instruction', 'Нажмите')}{' '}
									<span className="mx-1 inline-flex items-center gap-1 rounded-md bg-accent/20 px-2 py-0.5">
										<Download className="h-3 w-3" />
										{t('pwa.install.ios_share', 'Поделиться')}
									</span>{' '}
									{t('pwa.install.ios_then', 'внизу экрана, затем выберите')}{' '}
									<span className="mx-1 rounded-md bg-accent/20 px-2 py-0.5">
										{t('pwa.install.ios_add_to_home', '"На экран Домой"')}
									</span>
								</p>
							</motion.div>
						) : (
							<>
								{/* Install Button */}
								<motion.div
									animate={{ y: 0, opacity: 1 }}
									initial={{ y: 20, opacity: 0 }}
									transition={{ delay: 0.6 }}
								>
									<button
										type="button"
										className="mb-3 w-full rounded-xl bg-primary px-6 py-3 font-semibold text-[15px] text-primary-foreground shadow-lg transition-all active:scale-[0.98]"
										onClick={onInstall}
									>
										<span className="flex items-center justify-center gap-2">
											<Download className="h-4 w-4" />
											{t('pwa.install.button', 'Установить приложение')}
										</span>
									</button>
								</motion.div>

								{/* Skip Button */}
								<motion.button
									animate={{ opacity: 1 }}
									type="button"
									className="w-full py-2 font-medium text-[13px] text-muted-foreground transition-colors hover:text-foreground"
									initial={{ opacity: 0 }}
									onClick={onClose}
									transition={{ delay: 0.7 }}
								>
									{t('pwa.install.skip', 'Может быть позже')}
								</motion.button>
							</>
						)}
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
export default InstallPrompt;
