import { motion } from "motion/react";
import { X, Mic } from "lucide-react";

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
  if (!isRecording) return null;

  const minutes = Math.floor(recordingTime / 60);
  const seconds = recordingTime % 60;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6 pb-24 scrollbar-hide"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[24px] p-8 max-w-sm w-full shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Mic Icon with Pulse */}
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="relative"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <Mic className="w-10 h-10 text-white" />
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
        <div className="text-center mb-6">
          <h3 className="!text-[20px] !font-semibold text-gray-900 mb-2">
            Идёт запись...
          </h3>
          <p className="!text-[32px] !font-bold text-red-500 tabular-nums">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </p>
        </div>

        {/* Audio Level Visualizer */}
        <div className="flex items-center justify-center gap-1 h-16 mb-6">
          {[...Array(20)].map((_, i) => {
            // Создаем волнообразный эффект
            const intensity = Math.sin((i / 20) * Math.PI) * audioLevel;
            const height = 8 + intensity * 48;

            return (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-t from-red-500 to-pink-500 rounded-full"
                animate={{
                  height: `${height}px`
                }}
                transition={{ duration: 0.1 }}
              />
            );
          })}
        </div>

        {/* Hint */}
        <p className="text-center !text-[14px] text-gray-500">
          Нажмите на микрофон снова,<br />чтобы остановить запись
        </p>
      </motion.div>
    </motion.div>
  );
}
