import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';

type VideoPlayerProps = {
  videoUrl: string;
  fileName?: string;
  isOpen: boolean;
  onClose: () => void;
};

export function VideoPlayer({ videoUrl, fileName, isOpen, onClose }: VideoPlayerProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Close button */}
          <button
            aria-label="Close"
            className="absolute top-4 right-4 z-10 rounded-lg bg-white/10 p-2 backdrop-blur-sm transition-colors hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* Video container */}
          <motion.div
            animate={{ scale: 1 }}
            className="relative max-h-[90vh] max-w-[90vw]"
            exit={{ scale: 0.9 }}
            initial={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video with native controls */}
            <video
              autoPlay
              className="max-h-[90vh] max-w-full rounded-lg"
              controls
              src={videoUrl}
            />
          </motion.div>

          {/* File name */}
          {fileName && (
            <div className="-translate-x-1/2 absolute bottom-4 left-1/2 rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
              <p className="text-sm text-white">{fileName}</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
