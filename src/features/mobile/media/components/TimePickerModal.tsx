/**
 * Time Picker Modal - Refactored with motion.div (FAQModal pattern)
 *
 * Features:
 * - Slide-up animation from bottom
 * - Click backdrop to close
 * - iOS-style design with scroll pickers
 * - Better mobile UX than <select> elements
 *
 * @author UNITY Team
 * @date 2025-11-09
 */

import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';

type TimePickerModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onTimeSelect: (time: string) => void;
	initialTime: string;
	title: string;
};

export function TimePickerModal({
	isOpen,
	onClose,
	onTimeSelect,
	initialTime,
	title,
}: TimePickerModalProps) {
	const [selectedHour, setSelectedHour] = useState(
		Number.parseInt(initialTime.split(':')[0], 10) || 8
	);
	const [selectedMinute, setSelectedMinute] = useState(
		Number.parseInt(initialTime.split(':')[1], 10) || 0
	);

	// Unused variables removed (using increment/decrement functions instead)

	const formatTime = (hour: number, minute: number) =>
		`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

	const handleConfirm = () => {
		onTimeSelect(formatTime(selectedHour, selectedMinute));
		onClose();
	};

	const incrementHour = () => setSelectedHour((h) => (h + 1) % 24);
	const decrementHour = () => setSelectedHour((h) => (h - 1 + 24) % 24);
	const incrementMinute = () => setSelectedMinute((m) => (m + 5) % 60);
	const decrementMinute = () => setSelectedMinute((m) => (m - 5 + 60) % 60);

	if (!isOpen) {
		return null;
	}

	return (
		<AnimatePresence>
			{/* Backdrop */}
			<motion.div
				animate={{ opacity: 1 }}
				className="fixed inset-0 z-modal-backdrop bg-black/40 backdrop-blur-sm"
				exit={{ opacity: 0 }}
				initial={{ opacity: 0 }}
				onClick={onClose}
			/>

			{/* Modal */}
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="modal-bottom-sheet z-modal mx-auto max-w-md border-border border-t bg-card p-modal transition-colors duration-300"
				exit={{ opacity: 0, y: 100 }}
				initial={{ opacity: 0, y: 100 }}
			>
				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<h3 className="text-foreground text-title-3">{title}</h3>
					<button
						type="button"
						className="rounded-full p-1 transition-colors hover:bg-accent/10"
						onClick={onClose}
					>
						<X className="h-5 w-5 text-foreground" />
					</button>
				</div>

				{/* Time Picker */}
				<div className="space-y-6">
					{/* Time Selectors with Buttons */}
					<div className="flex items-center justify-center gap-4">
						{/* Hour Picker */}
						<div className="flex flex-col items-center gap-2">
							<button
								type="button"
								className="rounded-lg p-2 transition-colors hover:bg-accent/10"
								onClick={incrementHour}
							>
								<ChevronUp className="h-6 w-6 text-foreground" />
							</button>
							<div className="flex h-16 w-20 items-center justify-center rounded-xl border-2 border-border bg-background">
								<span className="font-bold text-3xl text-foreground">
									{selectedHour.toString().padStart(2, '0')}
								</span>
							</div>
							<button
								type="button"
								className="rounded-lg p-2 transition-colors hover:bg-accent/10"
								onClick={decrementHour}
							>
								<ChevronDown className="h-6 w-6 text-foreground" />
							</button>
						</div>

						<span className="font-bold text-3xl text-muted-foreground">:</span>

						{/* Minute Picker */}
						<div className="flex flex-col items-center gap-2">
							<button
								type="button"
								className="rounded-lg p-2 transition-colors hover:bg-accent/10"
								onClick={incrementMinute}
							>
								<ChevronUp className="h-6 w-6 text-foreground" />
							</button>
							<div className="flex h-16 w-20 items-center justify-center rounded-xl border-2 border-border bg-background">
								<span className="font-bold text-3xl text-foreground">
									{selectedMinute.toString().padStart(2, '0')}
								</span>
							</div>
							<button
								type="button"
								className="rounded-lg p-2 transition-colors hover:bg-accent/10"
								onClick={decrementMinute}
							>
								<ChevronDown className="h-6 w-6 text-foreground" />
							</button>
						</div>
					</div>

					{/* Preview */}
					<div className="rounded-xl bg-muted/30 p-4 text-center">
						<p className="mb-2 text-muted-foreground text-sm">Выбранное время</p>
						<p className="font-bold text-3xl text-primary">
							{formatTime(selectedHour, selectedMinute)}
						</p>
					</div>

					{/* Footer Buttons */}
					<div className="flex gap-3">
						<Button className="flex-1" onClick={onClose} variant="outline">
							Отмена
						</Button>
						<Button className="flex-1" onClick={handleConfirm}>
							Готово
						</Button>
					</div>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
