import { motion, AnimatePresence } from "motion/react";
import { X, Play } from "lucide-react";
import type { MediaFile } from "@/shared/lib/api";

interface MediaPreviewProps {
  media: MediaFile[];
  onRemove?: (index: number) => void;
  onImageClick?: (index: number) => void;
  editable?: boolean;
}

export function MediaPreview({ 
  media, 
  onRemove, 
  onImageClick,
  editable = true 
}: MediaPreviewProps) {
  if (media.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2">
      <AnimatePresence mode="popLayout">
        {media.map((item, index) => (
          <motion.div
            key={item.path}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="relative aspect-square rounded-[12px] overflow-hidden bg-gray-100 group"
            onClick={() => onImageClick?.(index)}
          >
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt=""
                className="w-full h-full object-cover cursor-pointer"
              />
            ) : (
              <div className="relative w-full h-full">
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-gray-900 ml-1" />
                  </div>
                </div>
              </div>
            )}

            {/* Remove Button */}
            {editable && onRemove && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
              >
                <X className="w-4 h-4 text-white" />
              </motion.button>
            )}

            {/* Media Counter Badge */}
            {index === 0 && media.length > 1 && (
              <div className="absolute bottom-1 right-1 px-2 py-0.5 bg-black/70 rounded-full">
                <span className="!text-[11px] text-white !font-semibold">
                  +{media.length - 1}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
