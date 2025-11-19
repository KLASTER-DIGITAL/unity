import { Download, Smartphone, X } from 'lucide-react';
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
					<div className="p-8 pt-10 pb-10">
						{/* Icon with animation */}
						<motion.div
							animate={{ scale: 1, rotate: 0 }}
							className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[24px] bg-linear-to-br from-primary to-accent shadow-xl transition-colors duration-300"
							initial={{ scale: 0, rotate: -180 }}
							transition={{ delay: 0.2, type: 'spring', damping: 15 }}
						>
							<span className="text-[48px]">🏆</span>
						</motion.div>

						{/* Title */}
						<motion.h2
							animate={{ y: 0, opacity: 1 }}
							className="mb-3 text-center font-semibold! text-[24px]! text-foreground"
							initial={{ y: 20, opacity: 0 }}
							transition={{ delay: 0.3 }}
						>
							{t('pwa.install.title', 'Добавить на главный экран?')}
						</motion.h2>

						{/* Description */}
						<motion.p
							animate={{ y: 0, opacity: 1 }}
							className="mb-8 text-center font-normal! text-[15px]! text-muted-foreground leading-[1.5]"
							initial={{ y: 20, opacity: 0 }}
							transition={{ delay: 0.4 }}
						>
							{t('pwa.install.description', 'Установите приложение для быстрого доступа к вашему дневнику достижений')}
						</motion.p>

						{/* Features */}
						<motion.div
							animate={{ y: 0, opacity: 1 }}
							className="mb-8 space-y-3"
							initial={{ y: 20, opacity: 0 }}
							transition={{ delay: 0.5 }}
						>
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
									<span className="text-[20px]">⚡️</span>
								</div>
								<p className="font-normal! text-[14px]! text-foreground">
									{t('pwa.install.feature1', 'Мгновенный запуск как нативное приложение')}
								</p>
							</div>
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
									<span className="text-[20px]">📱</span>
								</div>
								<p className="font-normal! text-[14px]! text-foreground">
									{t('pwa.install.feature2', 'Работает без интернета')}
								</p>
							</div>
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
									<span className="text-[20px]">🔔</span>
								</div>
								<p className="font-normal! text-[14px]! text-foreground">
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
							<motion.button
								animate={{ y: 0, opacity: 1 }}
								className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-4 text-accent-foreground shadow-lg transition-all hover:bg-accent/90 hover:shadow-xl active:scale-95"
								initial={{ y: 20, opacity: 0 }}
								onClick={onInstall}
								transition={{ delay: 0.6 }}
							>
								<Smartphone className="h-5 w-5" />
								<span className="font-semibold! text-[16px]!">
									{t('pwa.install.install_button', 'Установить приложение')}
								</span>
							</motion.button>
						)}

						{/* Skip button */}
						<motion.button
							animate={{ y: 0, opacity: 1 }}
							className="mt-3 w-full py-3 text-muted-foreground transition-colors hover:text-foreground"
							initial={{ y: 20, opacity: 0 }}
							onClick={onClose}
							transition={{ delay: 0.7 }}
						>
							<span className="font-normal! text-[14px]!">
								{t('pwa.install.maybe_later', 'Может быть позже')}
							</span>
						</motion.button>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
export default InstallPrompt;
