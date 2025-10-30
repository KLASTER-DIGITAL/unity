import { useCallback, useState } from 'react';
import { type MediaFile, uploadMedia } from '@/shared/lib/api';
import {
  compressImage,
  generateThumbnail,
  getImageDimensions,
  isImageFile,
  isVideoFile,
} from '../../utils/imageCompression';
import {
  compressVideo,
  generateVideoThumbnail,
  getVideoMetadata,
  validateVideo,
} from '../../utils/videoCompression';
import { mediaPicker } from '../lib/platform/media-picker';

// Export MediaFile as UploadedMedia for backward compatibility
export type UploadedMedia = MediaFile;

export type UploadStatus = {
  fileName: string;
  progress: number;
  status: 'processing' | 'uploading' | 'success' | 'error';
  error?: string;
};

type UseMediaUploaderResult = {
  uploadedMedia: MediaFile[];
  isUploading: boolean;
  uploadProgress: number;
  currentUpload: UploadStatus | null;
  selectAndUploadMedia: (userId: string) => Promise<void>;
  uploadFiles: (files: File[], userId: string) => Promise<void>;
  removeMedia: (index: number) => void;
  clearMedia: () => void;
};

export function useMediaUploader(): UseMediaUploaderResult {
  const [uploadedMedia, setUploadedMedia] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUpload, setCurrentUpload] = useState<UploadStatus | null>(null);

  // Core upload function (used by both selectAndUploadMedia and uploadFiles)
  const processAndUploadFiles = useCallback(async (files: File[], userId: string) => {
    setIsUploading(true);
    setUploadProgress(0);

    const errors: string[] = [];

    try {
      const newMedia: MediaFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          // Проверяем размер файла (макс 10MB)
          if (file.size > 10 * 1024 * 1024) {
            errors.push(`${file.name}: Файл слишком большой (макс 10MB)`);
            console.error(`File ${file.name} is too large (max 10MB)`);
            continue;
          }

          // Проверяем тип файла
          if (!(isImageFile(file) || isVideoFile(file))) {
            errors.push(`${file.name}: Неподдерживаемый формат файла`);
            console.error(`File ${file.name} has unsupported format`);
            continue;
          }

          // 📸 PHOTO PROCESSING
          let fileToUpload = file;
          let thumbnailFile: File | undefined;
          let dimensions: { width: number; height: number } | undefined;

          if (isImageFile(file)) {
            console.log('📸 Processing image:', file.name);

            // Update status: Processing
            setCurrentUpload({
              fileName: file.name,
              progress: 0,
              status: 'processing',
            });

            try {
              // Step 1: Compress main image (10MB → ~500KB)
              setCurrentUpload((prev) => (prev ? { ...prev, progress: 20 } : null));
              fileToUpload = await compressImage(file);

              // Step 2: Generate thumbnail (200x200, ~50KB)
              setCurrentUpload((prev) => (prev ? { ...prev, progress: 50 } : null));
              thumbnailFile = await generateThumbnail(file);

              // Step 3: Extract dimensions
              setCurrentUpload((prev) => (prev ? { ...prev, progress: 70 } : null));
              dimensions = await getImageDimensions(file);

              console.log(`📸 ✅ Image processed: ${file.name}`, {
                original: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
                compressed: `${(fileToUpload.size / 1024).toFixed(2)}KB`,
                thumbnail: `${(thumbnailFile.size / 1024).toFixed(2)}KB`,
                dimensions: `${dimensions.width}x${dimensions.height}`,
              });
            } catch (compressionError) {
              console.error('📸 ❌ Processing error:', compressionError);
              setCurrentUpload({
                fileName: file.name,
                progress: 0,
                status: 'error',
                error: 'Ошибка обработки изображения',
              });
              errors.push(`${file.name}: Ошибка обработки изображения`);
              continue;
            }
          }

          // 🎥 VIDEO PROCESSING
          if (isVideoFile(file)) {
            console.log('🎥 Processing video:', file.name);

            // Update status: Processing
            setCurrentUpload({
              fileName: file.name,
              progress: 0,
              status: 'processing',
            });

            try {
              // Step 1: Validate video
              setCurrentUpload((prev) => (prev ? { ...prev, progress: 10 } : null));
              const validation = await validateVideo(file);
              if (!validation.valid) {
                setCurrentUpload({
                  fileName: file.name,
                  progress: 0,
                  status: 'error',
                  error: validation.error,
                });
                errors.push(`${file.name}: ${validation.error}`);
                continue;
              }

              console.log('🎥 Video metadata:', validation.metadata);

              // Step 2: Compress video (max 30s, 720p, ~5MB)
              setCurrentUpload((prev) => (prev ? { ...prev, progress: 30 } : null));
              fileToUpload = await compressVideo(file, 30, 1280, 720);

              // Step 3: Generate thumbnail (first frame)
              setCurrentUpload((prev) => (prev ? { ...prev, progress: 60 } : null));
              thumbnailFile = await generateVideoThumbnail(file);

              // Step 4: Get metadata
              setCurrentUpload((prev) => (prev ? { ...prev, progress: 70 } : null));
              const metadata = await getVideoMetadata(fileToUpload);
              dimensions = { width: metadata.width, height: metadata.height };

              console.log(`🎥 ✅ Video processed: ${file.name}`, {
                original: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
                compressed: `${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`,
                thumbnail: `${(thumbnailFile.size / 1024).toFixed(2)}KB`,
                duration: `${metadata.duration}s`,
                dimensions: `${metadata.width}x${metadata.height}`,
              });
            } catch (videoError) {
              console.error('🎥 ❌ Processing error:', videoError);
              setCurrentUpload({
                fileName: file.name,
                progress: 0,
                status: 'error',
                error: 'Ошибка обработки видео',
              });
              errors.push(`${file.name}: Ошибка обработки видео`);
              continue;
            }
          }

          // 📤 UPLOAD TO SUPABASE
          console.log('📤 Uploading:', fileToUpload.name);

          // Update status: Uploading
          setCurrentUpload((prev) =>
            prev ? { ...prev, progress: 80, status: 'uploading' } : null
          );

          // Get duration for video
          let duration: number | undefined;
          if (isVideoFile(fileToUpload)) {
            const metadata = await getVideoMetadata(fileToUpload);
            duration = metadata.duration;
          }

          const mediaFile = await uploadMedia(fileToUpload, userId, {
            thumbnail: thumbnailFile,
            width: dimensions?.width,
            height: dimensions?.height,
            duration,
          });
          newMedia.push(mediaFile);

          // Update status: Success
          setCurrentUpload({
            fileName: file.name,
            progress: 100,
            status: 'success',
          });
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          errors.push(`${file.name}: ${(fileError as Error).message}`);
        }

        // Обновляем прогресс
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      // Добавляем успешно загруженные файлы
      if (newMedia.length > 0) {
        setUploadedMedia((prev) => [...prev, ...newMedia]);
      }

      // Если были ошибки, выбрасываем их
      if (errors.length > 0 && newMedia.length === 0) {
        throw new Error(errors.join('\n'));
      }
      if (errors.length > 0) {
        console.warn('Some files failed to upload:', errors);
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Clear upload status after 2 seconds
      setTimeout(() => {
        setCurrentUpload(null);
      }, 2000);
    }
  }, []);

  // File picker method
  const selectAndUploadMedia = useCallback(
    async (userId: string) => {
      try {
        // Use Media Picker Adapter for cross-platform file selection
        const mediaFiles = await mediaPicker.pickMedia({
          multiple: true,
          maxFiles: 10,
        });

        if (mediaFiles.length === 0) {
          return;
        }

        // Convert MediaFile[] to File[] for processing
        // For web: fetch blob from URI and create File
        // For native: will need different handling in future
        const files = await Promise.all(
          mediaFiles.map(async (mediaFile) => {
            const response = await fetch(mediaFile.uri);
            const blob = await response.blob();
            return new File([blob], mediaFile.name || 'file', {
              type: mediaFile.mimeType || 'application/octet-stream',
            });
          })
        );

        await processAndUploadFiles(files, userId);
      } catch (error) {
        console.error('Failed to select media:', error);
      }
    },
    [processAndUploadFiles]
  );

  // Direct upload method (for drag & drop)
  const uploadFiles = useCallback(
    async (files: File[], userId: string) => {
      await processAndUploadFiles(files, userId);
    },
    [processAndUploadFiles]
  );

  const removeMedia = useCallback((index: number) => {
    setUploadedMedia((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearMedia = useCallback(() => {
    setUploadedMedia([]);
  }, []);

  return {
    uploadedMedia,
    isUploading,
    uploadProgress,
    currentUpload,
    selectAndUploadMedia,
    uploadFiles,
    removeMedia,
    clearMedia,
  };
}
