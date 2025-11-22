import { Bell } from 'lucide-react';
import { motion } from 'motion/react';

type PermissionModalProps = {
	isOpen: boolean;
	title: string;
	laterLabel: string;
	allowLabel: string;
	onAllow: () => void;
	onLater: () => void;
};

/**
 * Permission Modal Component
 * Modal for requesting notification permissions
 */
export function PermissionModal({
	isOpen,
	title,
	laterLabel,
	allowLabel,
	onAllow,
	onLater,
}: PermissionModalProps) {
	if (!isOpen) {
		return null;
	}

	return (
		<motion.div
			animate={{ opacity: 1 }}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 pb-24 backdrop-blur-sm"
			initial={{ opacity: 0 }}
			onClick={onLater}
			transition={{ duration: 0.3 }}
		>
			<motion.div
				animate={{ scale: 1, opacity: 1 }}
				className="w-full max-w-[300px] rounded-(--radius) border border-border bg-card p-6 shadow-lg transition-colors duration-300"
				initial={{ scale: 0.9, opacity: 0 }}
				onClick={(e) => e.stopPropagation()}
				transition={{ duration: 0.3 }}
			>
				<div className="mb-6 space-y-3 text-center">
					<Bell className="mx-auto h-12 w-12 text-[#756ef3]" />
					<h3 className="!text-[#002055] dark:!text-[#1a1a1a] font-semibold! text-[17px]!">
						{title}
					</h3>
				</div>

				<div className="flex gap-3">
					<button
						type="button"
						className="flex-1 rounded-(--radius) bg-secondary px-4 py-3 text-secondary-foreground transition-all duration-200 hover:bg-secondary/80 active:scale-95"
						onClick={onLater}
					>
						{laterLabel}
					</button>
					<button
						type="button"
						className="flex-1 rounded-(--radius) bg-[#756ef3] px-4 py-3 text-white transition-all duration-200 hover:bg-[#6b62e8] active:scale-95"
						onClick={onAllow}
					>
						{allowLabel}
					</button>
				</div>
			</motion.div>
		</motion.div>
	);
}
