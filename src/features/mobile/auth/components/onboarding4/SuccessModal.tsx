import { CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

type SuccessModalProps = {
	isOpen: boolean;
	message: string;
};

/**
 * Success Modal Component
 * Modal showing success message
 */
export function SuccessModal({ isOpen, message }: SuccessModalProps) {
	if (!isOpen) {
		return null;
	}

	return (
		<motion.div
			animate={{ opacity: 1 }}
			className="scrollbar-hide fixed inset-0 z-50 flex items-center justify-center bg-black/50 pb-24 backdrop-blur-sm"
			initial={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
		>
			<motion.div
				animate={{ scale: 1, opacity: 1 }}
				className="mx-4 w-[300px] space-y-4 rounded-xl border border-border bg-card p-6 text-center transition-colors duration-300"
				initial={{ scale: 0.9, opacity: 0 }}
				transition={{ duration: 0.3 }}
			>
				<motion.div
					animate={{ scale: 1 }}
					initial={{ scale: 0 }}
					transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
				>
					<CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
				</motion.div>
				<p className="text-base font-medium text-foreground">{message}</p>
			</motion.div>
		</motion.div>
	);
}
