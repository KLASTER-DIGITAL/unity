import { useState, useCallback } from 'react';
import { uploadMedia, type MediaFile } from '@/shared/lib/api';
import { compressImage, isImageFile, isVideoFile } from '@/utils/imageCompression';

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
            // Проверяем размер файла (макс 10MB)
            if (file.size > 10 * 1024 * 1024) {
              errors.push(`${file.name}: Файл слишком большой (макс 10MB)`);
              console.error(`File ${file.name} is too large (max 10MB)`);
              continue;
            }

            // Проверяем тип файла
            if (!isImageFile(file) && !isVideoFile(file)) {
              errors.push(`${file.name}: Неподдерживаемый формат файла`);
              console.error(`File ${file.name} has unsupported format`);
              continue;
            }

            // Сжимаем изображения
            let fileToUpload = file;
            if (isImageFile(file)) {
              console.log('Compressing image:', file.name);
              try {
                fileToUpload = await compressImage(file);
              } catch (compressionError) {
                console.error('Compression error:', compressionError);
                errors.push(`${file.name}: Ошибка сжатия изображения`);
                continue;
              }
            }

            // Загружаем файл
            console.log('Uploading:', fileToUpload.name);
            const mediaFile = await uploadMedia(fileToUpload, userId);
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
