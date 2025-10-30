import { Image as ImageIcon, Play, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import type { MediaFile } from '@/shared/lib/api';
import { PhotoViewer } from './PhotoViewer';
import { VideoPlayer } from './VideoPlayer';

type MediaGridProps = {
  media: MediaFile[];
  onRemove?: (index: number) => void;
  readonly?: boolean;
};

export function MediaGrid({ media, onRemove, readonly = false }: MediaGridProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const handleMediaClick = (mediaFile: MediaFile) => {
    setSelectedMedia(mediaFile);
    setViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
    setSelectedMedia(null);
  };

  if (media.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {media.map((mediaFile, index) => (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="group relative aspect-square"
            exit={{ opacity: 0, scale: 0.9 }}
            initial={{ opacity: 0, scale: 0.9 }}
            key={index}
          >
            {/* Thumbnail */}
            <button
              className="h-full w-full overflow-hidden rounded-lg bg-muted transition-opacity hover:opacity-90 dark:bg-card"
              onClick={() => handleMediaClick(mediaFile)}
            >
              {mediaFile.type === 'image' ? (
                <img
                  alt={mediaFile.fileName}
                  className="h-full w-full object-cover"
                  src={mediaFile.url}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted dark:bg-muted">
                  <Play className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </button>

            {/* Type indicator */}
            <div className="absolute top-2 left-2 flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-white text-xs backdrop-blur-sm">
              {mediaFile.type === 'image' ? (
                <>
                  <ImageIcon className="h-3 w-3" />
                  <span>Фото</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  <span>Видео</span>
                </>
              )}
            </div>

            {/* Remove button */}
            {!readonly && onRemove && (
              <button
                aria-label="Remove"
                className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* File size */}
            <div className="absolute right-2 bottom-2 rounded bg-black/50 px-2 py-1 text-white text-xs backdrop-blur-sm">
              {(mediaFile.fileSize / 1024 / 1024).toFixed(1)}MB
            </div>
          </motion.div>
        ))}
      </div>

      {/* Photo Viewer */}
      {selectedMedia && selectedMedia.type === 'image' && (
        <PhotoViewer
          fileName={selectedMedia.fileName}
          imageUrl={selectedMedia.url ?? ''}
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
          videoUrl={selectedMedia.url ?? ''}
        />
      )}
    </>
  );
}
