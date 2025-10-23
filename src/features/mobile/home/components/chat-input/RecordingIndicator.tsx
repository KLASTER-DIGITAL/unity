import { motion, AnimatePresence } from "motion/react";
import { Square, X } from "lucide-react";

interface RecordingIndicatorProps {
  isRecording: boolean;
  recordingTime: number;
  audioLevel: number;
  onStop: () => void;
  onCancel: () => void;
}

/**
 * Recording indicator shown during voice recording
 * Features:
 * - Animated pulsing dot
 * - Recording time display (MM:SS)
 * - Audio level visualizer (5 bars)
 * - Stop and Cancel buttons
 */
export function RecordingIndicator({
  isRecording,
  recordingTime,
  audioLevel,
  onStop,
  onCancel
}: RecordingIndicatorProps) {
  return (
    <AnimatePresence>
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute -top-16 left-0 right-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-[16px] p-3 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-3 h-3 bg-card rounded-full"
              />
              <div>
                <p className="!text-[13px] text-white !font-semibold">
                  Идет запись...
                </p>
                <p className="!text-[11px] text-white/80">
                  {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </p>
              </div>
            </div>

            {/* Audio Level Visualizer */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-card rounded-full"
                  animate={{
                    height: audioLevel * 20 * (1 + i * 0.2)
                  }}
                  transition={{ duration: 0.1 }}
                  style={{ minHeight: '4px' }}
                />
              ))}
            </div>

            {/* Stop and Cancel buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onStop}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                aria-label="Остановить запись"
              >
                <Square className="w-3.5 h-3.5 text-white" fill="currentColor" />
                <span className="!text-[11px] text-white !font-medium">Stop</span>
              </button>
              <button
                onClick={onCancel}
                className="p-1 hover:bg-card/20 rounded-full transition-colors"
                aria-label="Отменить запись"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

