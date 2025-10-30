/**
 * Time Picker Modal - Refactored with BottomSheet
 *
 * Features:
 * - Uses universal BottomSheet component
 * - Slide-up animation from bottom
 * - Swipe-down to close
 * - iOS-style design
 * - Proper z-index hierarchy
 *
 * @author UNITY Team
 * @date 2025-10-19
 */

import { useState } from "react";
import {
	BottomSheet,
	BottomSheetFooter,
} from "@/shared/components/ui/BottomSheet";

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
		Number.parseInt(initialTime.split(":")[0], 10) || 8,
	);
	const [selectedMinute, setSelectedMinute] = useState(
		Number.parseInt(initialTime.split(":")[1], 10) || 0,
	);

	const hours = Array.from({ length: 24 }, (_, i) => i);
	const minutes = Array.from({ length: 60 }, (_, i) => i);

	const formatTime = (hour: number, minute: number) =>
		`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

	const handleConfirm = () => {
		onTimeSelect(formatTime(selectedHour, selectedMinute));
		onClose();
	};

	return (
		<BottomSheet
			closeOnBackdrop={true}
			closeOnEscape={true}
			enableSwipeDown={true}
			footer={
				<BottomSheetFooter
					cancelText="Отмена"
					confirmText="Готово"
					onCancel={onClose}
					onConfirm={handleConfirm}
				/>
			}
			isOpen={isOpen}
			maxHeight="60vh"
			onClose={onClose}
			showCloseButton={false}
			title={title}
		>
			{/* Time Picker Content */}
			<div className="space-y-6">
				{/* Time Selectors */}
				<div>
					<label className="mb-3 block text-muted-foreground text-sm">
						Выберите время
					</label>
					<div className="flex items-center justify-center space-x-4">
						<select
							className="h-14 w-24 rounded-xl border-2 border-border bg-background text-center font-medium text-foreground text-lg outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
							onChange={(e) =>
								setSelectedHour(Number.parseInt(e.target.value, 10))
							}
							value={selectedHour}
						>
							{hours.map((hour) => (
								<option key={hour} value={hour}>
									{hour.toString().padStart(2, "0")}
								</option>
							))}
						</select>

						<span className="font-bold text-2xl text-muted-foreground">:</span>

						<select
							className="h-14 w-24 rounded-xl border-2 border-border bg-background text-center font-medium text-foreground text-lg outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
							onChange={(e) =>
								setSelectedMinute(Number.parseInt(e.target.value, 10))
							}
							value={selectedMinute}
						>
							{minutes
								.filter((m) => m % 5 === 0)
								.map((minute) => (
									<option key={minute} value={minute}>
										{minute.toString().padStart(2, "0")}
									</option>
								))}
						</select>
					</div>
				</div>

				{/* Preview */}
				<div className="rounded-xl bg-muted/30 p-4 text-center">
					<p className="mb-2 text-muted-foreground text-sm">Выбранное время</p>
					<p className="font-bold text-3xl text-primary">
						{formatTime(selectedHour, selectedMinute)}
					</p>
				</div>
			</div>
		</BottomSheet>
	);
}
