import { CheckCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

type SuccessModalProps = {
	isOpen: boolean;
	message: string;
};

/**
 * Success Modal Component
 * Modal for success messages
 */
export function SuccessModal({ isOpen, message }: SuccessModalProps) {
	if (!isOpen) {
		return null;
	}

	return (
		<AnimatePresence>
			<motion.div
				animate={{ opacity: 1 }}
				className="fixed inset-0 z-modal-backdrop bg-black/40 backdrop-blur-sm"
				exit={{ opacity: 0 }}
				initial={{ opacity: 0 }}
			/>

			<motion.div
				animate={{ opacity: 1, scale: 1 }}
				className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-modal mx-auto w-[90%] max-w-[320px] rounded-[24px] border border-border bg-card p-8 shadow-xl transition-colors duration-300"
				exit={{ opacity: 0, scale: 0.9 }}
				initial={{ opacity: 0, scale: 0.9 }}
			>
				<div className="flex flex-col items-center gap-4 text-center">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--ios-green)]/10">
						<CheckCircle2 className="h-8 w-8 text-(--ios-green)" strokeWidth={2} />
					</div>

					<h3 className="font-semibold! text-[20px]! text-foreground">Успешно!</h3>

					<p className="text-[15px]! text-muted-foreground">{message}</p>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
