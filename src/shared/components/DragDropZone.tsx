import { useState, useCallback, DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Image as ImageIcon, Video } from 'lucide-react';

interface DragDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function DragDropZone({
  onFilesSelected,
  accept = 'image/*,video/*',
  maxFiles = 10,
  disabled = false,
  children
}: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [_dragCounter, setDragCounter] = useState(0);

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setDragCounter(prev => prev + 1);
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setDragCounter(prev => {
      const newCounter = prev - 1;
      if (newCounter === 0) {
        setIsDragging(false);
      }
      return newCounter;
    });
  }, [disabled]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setIsDragging(false);
    setDragCounter(0);
    
    const files = Array.from(e.dataTransfer.files);
    
    if (files.length === 0) return;
    
    // Filter by accept type
    const acceptedFiles = files.filter(file => {
      if (accept === 'image/*,video/*') {
        return file.type.startsWith('image/') || file.type.startsWith('video/');
      }
      if (accept === 'image/*') {
        return file.type.startsWith('image/');
      }
      if (accept === 'video/*') {
        return file.type.startsWith('video/');
      }
      return true;
    });
    
    // Limit number of files
    const limitedFiles = acceptedFiles.slice(0, maxFiles);
    
    if (limitedFiles.length > 0) {
      onFilesSelected(limitedFiles);
    }
  }, [disabled, accept, maxFiles, onFilesSelected]);

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative"
    >
      {children}
      
      {/* Drag Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-blue-500/10 backdrop-blur-sm border-2 border-dashed border-blue-500 rounded-lg pointer-events-none"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse' }}
                className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-3"
              >
                <Upload className="w-8 h-8 text-white" />
              </motion.div>
              <p className="text-lg font-semibold text-blue-600">
                Отпустите файлы для загрузки
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-500">Фото</span>
                <span className="text-sm text-blue-500">•</span>
                <Video className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-500">Видео</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

