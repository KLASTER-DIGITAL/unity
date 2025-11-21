// ✅ REACT NATIVE READY: Use Platform Adapter for animations

import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { useTranslation } from '@/shared/lib/i18n';
import { AnimatedPresence, motion } from '@/shared/lib/platform/animation';

type SuccessModalProps = {
	isOpen: boolean;
	userName?: string;
	onClose?: () => void;
	autoCloseDuration?: number; // Время автозакрытия в миллисекундах (по умолчанию 3000)
};

/**
 * Success modal shown after entry is saved
 * Features:
 * - Animated backdrop
 * - Success icon with spring animation
 * - User name personalization
 * - AI processing message
 * - Offline mode indicator
 * - Auto-close after 3 seconds
 */
export function SuccessModal({
	isOpen,
	userName = 'Анна',
	onClose,
	autoCloseDuration = 3000,
}: SuccessModalProps) {
	const { t } = useTranslation();

	// ✅ NEW: Confetti effect when modal opens
	useEffect(() => {
		if (isOpen) {
			// Check if user prefers reduced motion
			const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

			if (!prefersReducedMotion) {
				// Launch confetti with celebration effect
				confetti({
					particleCount: 100,
					spread: 70,
					origin: { y: 0.6 },
					colors: ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB'],
				});
			}
		}
	}, [isOpen]);

	// Автозакрытие через 3 секунды
	useEffect(() => {
		if (isOpen && onClose) {
			const timer = setTimeout(() => {
				onClose();
			}, autoCloseDuration);

			return () => clearTimeout(timer);
		}
	}, [isOpen, onClose, autoCloseDuration]);
	return (
		<AnimatedPresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						animate={{ opacity: 1 }}
						className="fixed inset-0 z-modal-backdrop bg-black/40 backdrop-blur-sm"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
					/>

					{/* Modal */}
					<motion.div
						animate={{ opacity: 1, scale: 1 }}
						className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-modal rounded-[24px] border border-border bg-card p-modal shadow-2xl transition-colors duration-300"
						exit={{ opacity: 0, scale: 0.9 }}
						initial={{ opacity: 0, scale: 0.9 }}
						style={{ width: '300px', minHeight: '230px' }}
						transition={{ type: 'spring', stiffness: 260, damping: 24 }}
					>
						{/* Success Icon */}
						<div className="mx-auto mb-responsive-md flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
							<motion.div
								animate={{ scale: 1 }}
								initial={{ scale: 0 }}
								transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 24 }}
							>
								<svg
									aria-label="Success checkmark"
									className="h-8 w-8 text-(--ios-green)"
									fill="none"
									role="img"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<title>Success</title>
									<path
										d="M5 13l4 4L19 7"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={3}
									/>
								</svg>
							</motion.div>
						</div>

						{/* Text */}
						<h3 className="mb-2 text-center font-semibold! text-[18px]! text-foreground">
							{t('success.entry_saved', `Отлично ${userName}!`)}
							<br />
							{t('success.entry_saved_message', 'Ваша запись сохранена! 🎉')}
						</h3>
					</motion.div>
				</>
			)}
		</AnimatedPresence>
	);
}
