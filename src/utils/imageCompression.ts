/**
 * Сжатие изображения с сохранением качества
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.85
): Promise<File> {
  // Проверка типа файла
  if (!file.type.startsWith('image/')) {
    throw new Error('Файл не является изображением');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) {
        reject(new Error('Не удалось прочитать файл'));
        return;
      }

      const img = new Image();

      img.onload = () => {
        try {
          // Вычисляем новые размеры с сохранением пропорций
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          // Создаем canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Не удалось создать контекст canvas'));
            return;
          }

          // Рисуем изображение на canvas с сглаживанием
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Конвертируем в Blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Не удалось сжать изображение'));
                return;
              }

              // Создаем новый File из Blob
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });

              console.log(
                `Image compressed: ${(file.size / 1024).toFixed(2)}KB -> ${(compressedFile.size / 1024).toFixed(2)}KB`
              );

              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        } catch (error) {
          reject(new Error('Ошибка при обработке изображения: ' + (error as Error).message));
        }
      };

      img.onerror = () => {
        reject(new Error('Не удалось загрузить изображение. Файл может быть поврежден.'));
      };

      // Устанавливаем crossOrigin для избежания проблем с CORS
      img.crossOrigin = 'anonymous';
      img.src = e.target.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Не удалось прочитать файл'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Создание thumbnail для изображения
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
