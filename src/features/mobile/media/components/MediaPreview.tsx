import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Play, Image as ImageIcon } from "lucide-react";
import type { MediaFile } from "@/shared/lib/api";
import { PhotoViewer } from "@/shared/components/PhotoViewer";
import { VideoPlayer } from "@/shared/components/VideoPlayer";
import { LazyImage } from "@/shared/components/LazyImage";

interface MediaPreviewProps {
  media: MediaFile[];
  onRemove?: (index: number) => void;
  onImageClick?: (index: number) => void;
  editable?: boolean;
  isUploading?: boolean;
  uploadProgress?: number;
  layout?: 'grid' | 'row'; // ✅ NEW: Layout mode
}

export function MediaPreview({
  media,
  onRemove,
  onImageClick,
  editable = true,
  isUploading = false,
  uploadProgress = 0,
  layout = 'grid' // ✅ NEW: Default to grid layout
}: MediaPreviewProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  if (media.length === 0 && !isUploading) return null;

  const handleMediaClick = (item: MediaFile, index: number) => {
    // Call legacy callback if provided
    onImageClick?.(index);

    // Open new viewer
    setSelectedMedia(item);
    setViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
    setSelectedMedia(null);
  };

  // ✅ FIX: Динамический класс контейнера в зависимости от layout
  const containerClass = layout === 'row'
    ? 'flex gap-2 overflow-x-auto pb-2'
    : 'grid grid-cols-3 gap-2';

  // ✅ FIX: Динамический класс элемента в зависимости от layout
  const itemClass = layout === 'row'
    ? 'flex-shrink-0 w-32 h-32' // Фиксированный размер для row
    : 'aspect-square'; // Квадрат для grid

  return (
    <>
      <div className={containerClass}>
        <AnimatePresence mode="popLayout">
          {/* Uploading placeholder */}
          {isUploading && (
            <motion.div
              key="uploading"
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className={`relative ${itemClass} rounded-[12px] overflow-hidden bg-gray-100`}
            >
              {/* Progress overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200">
                <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-xs text-gray-600 font-medium">{Math.round(uploadProgress)}%</span>
              </div>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </motion.div>
          )}

          {/* Uploaded media */}
          {media.map((item, index) => (
            <motion.div
              key={item.path}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className={`relative ${itemClass} rounded-[12px] overflow-hidden bg-gray-100 group`}
              onClick={() => handleMediaClick(item, index)}
            >
              {item.type === 'image' ? (
                <LazyImage
                  src={item.url}
                  alt={item.fileName || ''}
                  className="w-full h-full cursor-pointer"
                />
              ) : (
                <div className="relative w-full h-full">
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-gray-900 ml-1" />
                    </div>
                  </div>
                </div>
              )}

              {/* Type indicator */}
              <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded text-white text-[10px] flex items-center gap-0.5">
                {item.type === 'image' ? (
                  <>
                    <ImageIcon className="w-2.5 h-2.5" />
                    <span>Фото</span>
                  </>
                ) : (
                  <>
                    <Play className="w-2.5 h-2.5" />
                    <span>Видео</span>
                  </>
                )}
              </div>

              {/* ✅ FIX: Remove Button - всегда видна */}
              {editable && onRemove && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 active:scale-90 transition-all"
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

      {/* Photo Viewer */}
      {selectedMedia && selectedMedia.type === 'image' && (
        <PhotoViewer
          imageUrl={selectedMedia.url}
          fileName={selectedMedia.fileName}
          isOpen={viewerOpen}
          onClose={handleCloseViewer}
        />
      )}

      {/* Video Player */}
      {selectedMedia && selectedMedia.type === 'video' && (
        <VideoPlayer
          videoUrl={selectedMedia.url}
          fileName={selectedMedia.fileName}
          isOpen={viewerOpen}
          onClose={handleCloseViewer}
        />
      )}
    </>
  );
}
