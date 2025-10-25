import { useRef, useCallback } from 'react';

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  reduction: number;
}

export function useImageCompressionWorker() {
  const workerRef = useRef<Worker | null>(null);

  // Initialize worker
  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      // Create worker from inline code (Vite compatible)
      const workerCode = `
        import imageCompression from 'browser-image-compression';

        self.onmessage = async (e) => {
          const { type, file, options } = e.data;

          try {
            switch (type) {
              case 'compress': {
                const compressedFile = await imageCompression(file, {
                  maxSizeMB: 0.5,
                  maxWidthOrHeight: options?.maxWidth || 1920,
                  useWebWorker: false,
                  quality: options?.quality || 0.8,
                  fileType: 'image/jpeg',
                  initialQuality: options?.quality || 0.8,
                  alwaysKeepResolution: false,
                  onProgress: (progress) => {
                    self.postMessage({ type: 'progress', progress });
                  }
                });

                self.postMessage({ type: 'success', data: compressedFile });
                break;
              }

              case 'thumbnail': {
                const thumbnail = await imageCompression(file, {
                  maxSizeMB: 0.05,
                  maxWidthOrHeight: 200,
                  useWebWorker: false,
                  quality: 0.7,
                  fileType: 'image/jpeg'
                });

                self.postMessage({ type: 'success', data: thumbnail });
                break;
              }

              case 'dimensions': {
                const dimensions = await new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                      resolve({ width: img.width, height: img.height });
                    };
                    img.onerror = reject;
                    img.src = e.target?.result;
                  };
                  reader.onerror = reject;
                  reader.readAsDataURL(file);
                });

                self.postMessage({ type: 'success', data: dimensions });
                break;
              }
            }
          } catch (error) {
            self.postMessage({
              type: 'error',
              error: error.message || 'Unknown error'
            });
          }
        };
      `;

      // Note: Web Workers with imports don't work in all environments
      // Fallback to main thread if worker creation fails
      try {
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        workerRef.current = new Worker(workerUrl, { type: 'module' });
      } catch (error) {
        console.warn('Failed to create worker, will use main thread:', error);
        return null;
      }
    }

    return workerRef.current;
  }, []);

  const compressImage = useCallback(
    async (
      file: File,
      options?: CompressionOptions,
      onProgress?: (progress: number) => void
    ): Promise<CompressionResult> => {
      const worker = getWorker();

      // Fallback to main thread if worker not available
      if (!worker) {
        const { compressImage: mainThreadCompress } = await import('../../utils/imageCompression');
        const compressed = await mainThreadCompress(
          file,
          options?.maxWidth,
          options?.quality
        );
        
        return {
          file: compressed,
          originalSize: file.size,
          compressedSize: compressed.size,
          reduction: ((file.size - compressed.size) / file.size) * 100
        };
      }

      return new Promise((resolve, reject) => {
        const handleMessage = (e: MessageEvent) => {
          const { type, data, error, progress } = e.data;

          if (type === 'progress' && onProgress) {
            onProgress(progress);
          } else if (type === 'success') {
            worker.removeEventListener('message', handleMessage);
            resolve({
              file: data,
              originalSize: file.size,
              compressedSize: data.size,
              reduction: ((file.size - data.size) / file.size) * 100
            });
          } else if (type === 'error') {
            worker.removeEventListener('message', handleMessage);
            reject(new Error(error));
          }
        };

        worker.addEventListener('message', handleMessage);
        worker.postMessage({ type: 'compress', file, options });
      });
    },
    [getWorker]
  );

  const generateThumbnail = useCallback(
    async (file: File): Promise<File> => {
      const worker = getWorker();

      // Fallback to main thread
      if (!worker) {
        const { generateThumbnail: mainThreadThumbnail } = await import('../../utils/imageCompression');
        return mainThreadThumbnail(file);
      }

      return new Promise((resolve, reject) => {
        const handleMessage = (e: MessageEvent) => {
          const { type, data, error } = e.data;

          if (type === 'success') {
            worker.removeEventListener('message', handleMessage);
            resolve(data);
          } else if (type === 'error') {
            worker.removeEventListener('message', handleMessage);
            reject(new Error(error));
          }
        };

        worker.addEventListener('message', handleMessage);
        worker.postMessage({ type: 'thumbnail', file });
      });
    },
    [getWorker]
  );

  const getImageDimensions = useCallback(
    async (file: File): Promise<{ width: number; height: number }> => {
      const worker = getWorker();

      // Fallback to main thread
      if (!worker) {
        const { getImageDimensions: mainThreadDimensions } = await import('../../utils/imageCompression');
        return mainThreadDimensions(file);
      }

      return new Promise((resolve, reject) => {
        const handleMessage = (e: MessageEvent) => {
          const { type, data, error } = e.data;

          if (type === 'success') {
            worker.removeEventListener('message', handleMessage);
            resolve(data);
          } else if (type === 'error') {
            worker.removeEventListener('message', handleMessage);
            reject(new Error(error));
          }
        };

        worker.addEventListener('message', handleMessage);
        worker.postMessage({ type: 'dimensions', file });
      });
    },
    [getWorker]
  );

  // Cleanup worker on unmount
  const cleanup = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  return {
    compressImage,
    generateThumbnail,
    getImageDimensions,
    cleanup
  };
}

