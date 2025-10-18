import { useState, useCallback } from 'react';
import { uploadMedia, type MediaFile } from '@/shared/lib/api';
import { compressImage, generateThumbnail, getImageDimensions, isImageFile, isVideoFile } from '@/utils/imageCompression';
import { compressVideo, generateVideoThumbnail, getVideoMetadata, validateVideo } from '@/utils/videoCompression';

interface UseMediaUploaderResult {
  uploadedMedia: MediaFile[];
  isUploading: boolean;
  uploadProgress: number;
  selectAndUploadMedia: (userId: string) => Promise<void>;
  removeMedia: (index: number) => void;
  clearMedia: () => void;
}

export function useMediaUploader(): UseMediaUploaderResult {
  const [uploadedMedia, setUploadedMedia] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const selectAndUploadMedia = useCallback(async (userId: string) => {
    // Создаем input для выбора файлов
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.multiple = true;

    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      
      if (files.length === 0) return;

      setIsUploading(true);
      setUploadProgress(0);

      const errors: string[] = [];

      try {
        const newMedia: MediaFile[] = [];
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          try {
            // ✅ FIX: Валидация размера файла (макс 50MB)
            const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
            if (file.size > MAX_FILE_SIZE) {
              errors.push(`${file.name}: Файл слишком большой (макс 50MB)`);
              console.error(`File ${file.name} is too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
              continue;
            }

            // Проверяем тип файла
            if (!isImageFile(file) && !isVideoFile(file)) {
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
              try {
                // Step 1: Compress main image (10MB → ~500KB)
                fileToUpload = await compressImage(file);

                // Step 2: Generate thumbnail (200x200, ~50KB)
                thumbnailFile = await generateThumbnail(file);

                // Step 3: Extract dimensions
                dimensions = await getImageDimensions(file);

                console.log(`📸 ✅ Image processed: ${file.name}`, {
                  original: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
                  compressed: `${(fileToUpload.size / 1024).toFixed(2)}KB`,
                  thumbnail: `${(thumbnailFile.size / 1024).toFixed(2)}KB`,
                  dimensions: `${dimensions.width}x${dimensions.height}`
                });
              } catch (compressionError) {
                console.error('📸 ❌ Processing error:', compressionError);
                errors.push(`${file.name}: Ошибка обработки изображения`);
                continue;
              }
            }

            // 🎥 VIDEO PROCESSING
            if (isVideoFile(file)) {
              console.log('🎥 Processing video:', file.name);
              try {
                // Step 1: Validate video
                const validation = await validateVideo(file);
                if (!validation.valid) {
                  errors.push(`${file.name}: ${validation.error}`);
                  continue;
                }

                console.log(`🎥 Video metadata:`, validation.metadata);

                // Step 2: Compress video (max 30s, 720p, ~5MB)
                fileToUpload = await compressVideo(file, 30, 1280, 720);

                // Step 3: Generate thumbnail (first frame)
                thumbnailFile = await generateVideoThumbnail(file);

                // Step 4: Get metadata
                const metadata = await getVideoMetadata(fileToUpload);
                dimensions = { width: metadata.width, height: metadata.height };

                console.log(`🎥 ✅ Video processed: ${file.name}`, {
                  original: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
                  compressed: `${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`,
                  thumbnail: `${(thumbnailFile.size / 1024).toFixed(2)}KB`,
                  duration: `${metadata.duration}s`,
                  dimensions: `${metadata.width}x${metadata.height}`
                });

              } catch (videoError) {
                console.error('🎥 ❌ Processing error:', videoError);
                errors.push(`${file.name}: Ошибка обработки видео`);
                continue;
              }
            }

            // 📤 UPLOAD TO SUPABASE
            console.log('📤 Uploading:', fileToUpload.name);

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
              duration: duration
            });
            newMedia.push(mediaFile);

          } catch (fileError) {
            console.error(`Error processing file ${file.name}:`, fileError);
            errors.push(`${file.name}: ${(fileError as Error).message}`);
          }

          // Обновляем прогресс
          setUploadProgress(((i + 1) / files.length) * 100);
        }

        // Добавляем успешно загруженные файлы
        if (newMedia.length > 0) {
          setUploadedMedia(prev => [...prev, ...newMedia]);
        }

        // Если были ошибки, выбрасываем их
        if (errors.length > 0 && newMedia.length === 0) {
          throw new Error(errors.join('\n'));
        } else if (errors.length > 0) {
          console.warn('Some files failed to upload:', errors);
        }

      } catch (error) {
        console.error('Error uploading media:', error);
        throw error;
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    };

    input.click();
  }, []);

  const removeMedia = useCallback((index: number) => {
    setUploadedMedia(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearMedia = useCallback(() => {
    setUploadedMedia([]);
  }, []);

  return {
    uploadedMedia,
    isUploading,
    uploadProgress,
    selectAndUploadMedia,
    removeMedia,
    clearMedia
  };
}
