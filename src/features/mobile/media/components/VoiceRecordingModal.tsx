/**
 * Voice Recording Modal - Refactored with BottomSheet
 *
 * Features:
 * - Uses universal BottomSheet component
 * - Slide-up animation from bottom
 * - Swipe-down to close
 * - iOS-style design
 * - Proper z-index hierarchy
 * - Audio level visualizer
 *
 * @author UNITY Team
 * @date 2025-10-19
 */

import { Mic } from 'lucide-react';
import { motion } from 'motion/react';
import { BottomSheet } from '@/shared/components/ui/BottomSheet';

type VoiceRecordingModalProps = {
	isRecording: boolean;
	audioLevel: number;
	recordingTime: number;
	onCancel: () => void;
};

export function VoiceRecordingModal({
	isRecording,
	audioLevel,
	recordingTime,
	onCancel,
}: VoiceRecordingModalProps) {
	const minutes = Math.floor(recordingTime / 60);
	const seconds = recordingTime % 60;

	return (
		<BottomSheet
			closeOnBackdrop={true}
			closeOnEscape={true}
			enableSwipeDown={true}
			isOpen={isRecording}
			maxHeight="70vh"
			onClose={onCancel}
			showCloseButton={true}
			title="Запись голосовой заметки"
		>
			<div className="flex flex-col items-center py-4">
				{/* Mic Icon with Pulse */}
				<div className="mb-8 flex justify-center">
					<motion.div
						animate={{ scale: [1, 1.1, 1] }}
						className="relative"
						transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
					>
						<div className="flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-pink-500 shadow-xl">
							<Mic className="h-12 w-12 text-white" />
						</div>

						{/* Pulse rings */}
						<motion.div
							animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
							className="absolute inset-0 rounded-full bg-red-500"
							transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
						/>
						<motion.div
							animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
							className="absolute inset-0 rounded-full bg-red-500"
							transition={{
								repeat: Number.POSITIVE_INFINITY,
								duration: 1.5,
								delay: 0.3,
							}}
						/>
					</motion.div>
				</div>

				{/* Recording Status */}
				<div className="mb-8 text-center">
					<h3 className="mb-3 font-semibold text-foreground text-xl">Идёт запись...</h3>
					<p className="font-bold text-4xl text-red-500 tabular-nums">
						{minutes}:{seconds.toString().padStart(2, '0')}
					</p>
				</div>

				{/* Audio Level Visualizer */}
				<div className="mb-8 flex h-20 w-full items-center justify-center gap-1 px-4">
					{Array.from({ length: 20 }, (_, i) => `bar-${i}`).map((key, i) => {
						// Создаем волнообразный эффект
						const intensity = Math.sin((i / 20) * Math.PI) * audioLevel;
						const height = 8 + intensity * 56;

						return (
							<motion.div
								animate={{
									height: `${height}px`,
								}}
								className="flex-1 rounded-full bg-linear-to-t from-red-500 to-pink-500"
								key={key}
								transition={{ duration: 0.1 }}
							/>
						);
					})}
				</div>

				{/* Hint */}
				<p className="px-4 text-center text-muted-foreground text-sm">
					Нажмите на микрофон снова или закройте окно,
					<br />
					чтобы остановить запись
				</p>
			</div>
		</BottomSheet>
	);
}
