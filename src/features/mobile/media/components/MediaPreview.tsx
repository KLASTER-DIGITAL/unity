import { Image as ImageIcon, Play, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { LazyImage } from '@/shared/components/LazyImage';
import { PhotoViewer } from '@/shared/components/PhotoViewer';
import { VideoPlayer } from '@/shared/components/VideoPlayer';
import type { MediaFile } from '@/shared/lib/api';

type MediaPreviewProps = {
  media: MediaFile[];
  onRemove?: (index: number) => void;
  onImageClick?: (index: number) => void;
  editable?: boolean;
  isUploading?: boolean;
  uploadProgress?: number;
  layout?: 'grid' | 'row'; // ✅ NEW: Layout mode
};

export function MediaPreview({
  media,
  onRemove,
  onImageClick,
  editable = true,
  isUploading = false,
  uploadProgress = 0,
  layout = 'grid', // ✅ NEW: Default to grid layout
}: MediaPreviewProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  if (media.length === 0 && !isUploading) {
    return null;
  }

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
  const containerClass =
    layout === 'row' ? 'flex gap-2 overflow-x-auto pb-2' : 'grid grid-cols-3 gap-2';

  // ✅ FIX: Динамический класс элемента в зависимости от layout
  const itemClass =
    layout === 'row'
      ? 'flex-shrink-0 w-32 h-32' // Фиксированный размер для row
      : 'aspect-square'; // Квадрат для grid

  return (
    <>
      <div className={containerClass}>
        <AnimatePresence mode="popLayout">
          {/* Uploading placeholder */}
          {isUploading && (
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={`relative ${itemClass} overflow-hidden rounded-[12px] bg-muted`}
              exit={{ opacity: 0, scale: 0.8 }}
              initial={{ opacity: 0, scale: 0.8 }}
              key="uploading"
              layout
              transition={{ duration: 0.2 }}
            >
              {/* Progress overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
                <div className="mb-2 h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent" />
                <span className="font-medium text-muted-foreground text-xs">
                  {Math.round(uploadProgress)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="absolute right-0 bottom-0 left-0 h-1 bg-border">
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
              animate={{ opacity: 1, scale: 1 }}
              className={`relative ${itemClass} group overflow-hidden rounded-[12px] bg-muted`}
              exit={{ opacity: 0, scale: 0.8 }}
              initial={{ opacity: 0, scale: 0.8 }}
              key={item.path}
              layout
              onClick={() => handleMediaClick(item, index)}
              transition={{ duration: 0.2 }}
            >
              {item.type === 'image' ? (
                <LazyImage
                  alt={item.fileName || ''}
                  className="h-full w-full cursor-pointer"
                  src={item.url || ''}
                />
              ) : (
                <div className="relative h-full w-full">
                  <video
                    className="h-full w-full object-cover"
                    muted
                    preload="metadata"
                    src={item.url}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-card/90">
                      <Play className="ml-1 h-6 w-6 text-foreground" />
                    </div>
                  </div>
                </div>
              )}

              {/* Type indicator */}
              <div className="absolute top-1 left-1 flex items-center gap-0.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm">
                {item.type === 'image' ? (
                  <>
                    <ImageIcon className="h-2.5 w-2.5" />
                    <span>Фото</span>
                  </>
                ) : (
                  <>
                    <Play className="h-2.5 w-2.5" />
                    <span>Видео</span>
                  </>
                )}
              </div>

              {/* ✅ FIX: Remove Button - всегда видна */}
              {editable && onRemove && (
                <motion.button
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 shadow-lg transition-all hover:bg-red-600 active:scale-90"
                  initial={{ opacity: 0, scale: 0.8 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(index);
                  }}
                >
                  <X className="h-4 w-4 text-white" />
                </motion.button>
              )}

              {/* Media Counter Badge */}
              {index === 0 && media.length > 1 && (
                <div className="absolute right-1 bottom-1 rounded-full bg-black/70 px-2 py-0.5">
                  <span className="font-semibold! text-[11px]! text-white">
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
          fileName={selectedMedia.fileName}
          imageUrl={selectedMedia.url || ''}
          isOpen={viewerOpen}
          onClose={handleCloseViewer}
        />
      )}

      {/* Video Player */}
      {selectedMedia && selectedMedia.type === 'video' && (
        <VideoPlayer
          fileName={selectedMedia.fileName}
          isOpen={viewerOpen}
          onClose={handleCloseViewer}
          videoUrl={selectedMedia.url || ''}
        />
      )}
    </>
  );
}
