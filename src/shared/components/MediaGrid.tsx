import { useState } from 'react';
import { X, Play, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { PhotoViewer } from './PhotoViewer';
import { VideoPlayer } from './VideoPlayer';
import type { MediaFile } from '../../utils/api';

interface MediaGridProps {
  media: MediaFile[];
  onRemove?: (index: number) => void;
  readonly?: boolean;
}

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
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative aspect-square group"
          >
            {/* Thumbnail */}
            <button
              onClick={() => handleMediaClick(mediaFile)}
              className="w-full h-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 hover:opacity-90 transition-opacity"
            >
              {mediaFile.type === 'image' ? (
                <img
                  src={mediaFile.url}
                  alt={mediaFile.fileName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <Play className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </button>

            {/* Type indicator */}
            <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-white text-xs flex items-center gap-1">
              {mediaFile.type === 'image' ? (
                <>
                  <ImageIcon className="w-3 h-3" />
                  <span>Фото</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  <span>Видео</span>
                </>
              )}
            </div>

            {/* Remove button */}
            {!readonly && onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* File size */}
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-white text-xs">
              {(mediaFile.fileSize / 1024 / 1024).toFixed(1)}MB
            </div>
          </motion.div>
        ))}
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

