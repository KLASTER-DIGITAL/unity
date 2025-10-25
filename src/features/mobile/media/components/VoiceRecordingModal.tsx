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

import { motion } from "motion/react";
import { Mic } from "lucide-react";
import { BottomSheet } from "@/shared/components/ui/BottomSheet";

interface VoiceRecordingModalProps {
  isRecording: boolean;
  audioLevel: number;
  recordingTime: number;
  onCancel: () => void;
}

export function VoiceRecordingModal({
  isRecording,
  audioLevel,
  recordingTime,
  onCancel
}: VoiceRecordingModalProps) {
  const minutes = Math.floor(recordingTime / 60);
  const seconds = recordingTime % 60;

  return (
    <BottomSheet
      isOpen={isRecording}
      onClose={onCancel}
      title="Запись голосовой заметки"
      showCloseButton={true}
      enableSwipeDown={true}
      closeOnBackdrop={true}
      closeOnEscape={true}
      maxHeight="70vh"
    >
      <div className="flex flex-col items-center py-4">
        {/* Mic Icon with Pulse */}
        <div className="flex justify-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="relative"
          >
            <div className="w-24 h-24 bg-linear-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
              <Mic className="w-12 h-12 text-white" />
            </div>

            {/* Pulse rings */}
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 bg-red-500 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
              className="absolute inset-0 bg-red-500 rounded-full"
            />
          </motion.div>
        </div>

        {/* Recording Status */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-3">
            Идёт запись...
          </h3>
          <p className="text-4xl font-bold text-red-500 tabular-nums">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </p>
        </div>

        {/* Audio Level Visualizer */}
        <div className="flex items-center justify-center gap-1 h-20 mb-8 w-full px-4">
          {[...Array(20)].map((_, i) => {
            // Создаем волнообразный эффект
            const intensity = Math.sin((i / 20) * Math.PI) * audioLevel;
            const height = 8 + intensity * 56;

            return (
              <motion.div
                key={i}
                className="flex-1 bg-linear-to-t from-red-500 to-pink-500 rounded-full"
                animate={{
                  height: `${height}px`
                }}
                transition={{ duration: 0.1 }}
              />
            );
          })}
        </div>

        {/* Hint */}
        <p className="text-center text-sm text-muted-foreground px-4">
          Нажмите на микрофон снова или закройте окно,<br />
          чтобы остановить запись
        </p>
      </div>
    </BottomSheet>
  );
}
