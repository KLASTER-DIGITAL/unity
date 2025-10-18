import imageCompression from 'browser-image-compression';

/**
 * 📸 PROFESSIONAL IMAGE COMPRESSION
 * Uses browser-image-compression library for optimal results
 * 10MB → ~500KB (95% reduction)
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.8
): Promise<File> {
  // Проверка типа файла
  if (!file.type.startsWith('image/')) {
    throw new Error('Файл не является изображением');
  }

  console.log(`📸 [COMPRESS] Starting compression: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

  try {
    const options = {
      maxSizeMB: 0.5,              // Max 500KB
      maxWidthOrHeight: maxWidth,  // Max 1920x1080
      useWebWorker: true,          // Parallel processing
      quality: quality,            // 80% quality
      fileType: 'image/jpeg',      // Always JPEG (smaller)
      initialQuality: quality,     // Initial quality
      alwaysKeepResolution: false  // Allow resize
    };

    const compressedFile = await imageCompression(file, options);

    console.log(
      `📸 [COMPRESS] ✅ Success: ${(file.size / 1024).toFixed(2)}KB → ${(compressedFile.size / 1024).toFixed(2)}KB (${((1 - compressedFile.size / file.size) * 100).toFixed(1)}% reduction)`
    );

    return compressedFile;
  } catch (error) {
    console.error('📸 [COMPRESS] ❌ Error:', error);
    throw new Error('Ошибка при сжатии изображения: ' + (error as Error).message);
  }
}

/**
 * 🖼️ GENERATE THUMBNAIL
 * Creates 200x200 thumbnail for instant preview
 */
export async function generateThumbnail(file: File): Promise<File> {
  console.log(`🖼️ [THUMBNAIL] Generating thumbnail for: ${file.name}`);

  try {
    const options = {
      maxSizeMB: 0.05,             // 50KB max
      maxWidthOrHeight: 200,       // 200x200
      useWebWorker: true,
      quality: 0.7,
      fileType: 'image/jpeg'
    };

    const thumbnail = await imageCompression(file, options);

    console.log(`🖼️ [THUMBNAIL] ✅ Generated: ${(thumbnail.size / 1024).toFixed(2)}KB`);

    return thumbnail;
  } catch (error) {
    console.error('🖼️ [THUMBNAIL] ❌ Error:', error);
    throw new Error('Ошибка при создании thumbnail: ' + (error as Error).message);
  }
}

/**
 * 📐 EXTRACT IMAGE DIMENSIONS
 * Returns width and height of the image
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 🎨 CREATE THUMBNAIL DATA URL (for instant preview)
 * Returns base64 data URL for immediate display
 */
export async function createThumbnail(
  file: File,
  maxSize: number = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Вычисляем размеры thumbnail (квадрат)
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;

        // Создаем canvas
        const canvas = document.createElement('canvas');
        canvas.width = maxSize;
        canvas.height = maxSize;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Рисуем квадратный crop
        ctx.drawImage(
          img,
          x, y, size, size,
          0, 0, maxSize, maxSize
        );

        // Возвращаем data URL
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Проверка является ли файл изображением
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Проверка является ли файл видео
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

/**
 * Получение preview URL для файла
 */
export function getFilePreviewUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}
