// ✅ REACT NATIVE READY: Use Platform Adapter for animations

import { Square, X } from 'lucide-react';
import { AnimatedPresence, motion } from '@/shared/lib/platform/animation';

type RecordingIndicatorProps = {
  isRecording: boolean;
  recordingTime: number;
  audioLevel: number;
  onStop: () => void;
  onCancel: () => void;
};

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
  onCancel,
}: RecordingIndicatorProps) {
  return (
    <AnimatedPresence>
      {isRecording && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="-top-16 absolute right-0 left-0 rounded-[16px] bg-linear-to-r from-red-500 to-pink-500 p-3 shadow-lg"
          exit={{ opacity: 0, y: 10 }}
          initial={{ opacity: 0, y: 10 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                className="h-3 w-3 rounded-full bg-card"
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
              />
              <div>
                <p className="font-semibold! text-[13px]! text-white">Идет запись...</p>
                <p className="text-[11px]! text-white/80">
                  {Math.floor(recordingTime / 60)}:
                  {(recordingTime % 60).toString().padStart(2, '0')}
                </p>
              </div>
            </div>

            {/* Audio Level Visualizer */}
            <div className="flex items-center gap-1">
              {[...new Array(5)].map((_, i) => (
                <motion.div
                  animate={{
                    height: audioLevel * 20 * (1 + i * 0.2),
                  }}
                  className="w-1 rounded-full bg-card"
                  key={i}
                  style={{ minHeight: '4px' }}
                  transition={{ duration: 0.1 }}
                />
              ))}
            </div>

            {/* Stop and Cancel buttons */}
            <div className="flex items-center gap-2">
              <button
                aria-label="Остановить запись"
                className="flex items-center gap-1.5 rounded-full bg-muted/20 px-3 py-1.5 transition-colors duration-300 hover:bg-muted/30"
                onClick={onStop}
              >
                <Square className="h-3.5 w-3.5 text-white" fill="currentColor" />
                <span className="font-medium! text-[11px]! text-white">Stop</span>
              </button>
              <button
                aria-label="Отменить запись"
                className="rounded-full p-1 transition-colors hover:bg-card/20"
                onClick={onCancel}
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatedPresence>
  );
}
