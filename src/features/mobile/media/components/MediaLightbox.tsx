import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { MediaFile } from "@/shared/lib/api";

interface MediaLightboxProps {
  media: MediaFile[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function MediaLightbox({ 
  media, 
  initialIndex = 0, 
  isOpen, 
  onClose 
}: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const currentMedia = media[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-50 flex items-center justify-center scrollbar-hide"
          onClick={onClose}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Counter */}
          {media.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-white/10 rounded-full">
              <span className="!text-[14px] text-white !font-semibold">
                {currentIndex + 1} / {media.length}
              </span>
            </div>
          )}

          {/* Media Content */}
          <div
            className="relative w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="max-w-full max-h-full flex items-center justify-center"
              >
                {currentMedia?.type === 'image' ? (
                  <img
                    src={currentMedia.url}
                    alt=""
                    className="max-w-full max-h-full object-contain rounded-[12px]"
                  />
                ) : currentMedia?.type === 'video' ? (
                  <video
                    src={currentMedia.url}
                    controls
                    autoPlay
                    className="max-w-full max-h-full rounded-[12px]"
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          {media.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            </>
          )}

          {/* Thumbnails */}
          {media.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto scrollbar-hide px-4">
              {media.map((item, index) => (
                <button
                  key={item.path}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className={`flex-shrink-0 w-16 h-16 rounded-[8px] overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? 'border-white scale-110'
                      : 'border-white/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
