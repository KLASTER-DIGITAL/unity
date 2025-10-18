/**
 * 🔧 IMAGE COMPRESSION WEB WORKER
 * Offloads image compression to a separate thread for better performance
 */

import imageCompression from 'browser-image-compression';

// Message types
interface CompressMessage {
  type: 'compress' | 'thumbnail' | 'dimensions';
  file: File;
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  };
}

interface CompressResponse {
  type: 'success' | 'error' | 'progress';
  data?: File | { width: number; height: number };
  error?: string;
  progress?: number;
}

// Handle messages from main thread
self.onmessage = async (e: MessageEvent<CompressMessage>) => {
  const { type, file, options } = e.data;

  try {
    switch (type) {
      case 'compress': {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: options?.maxWidth || 1920,
          useWebWorker: false, // Already in worker
          quality: options?.quality || 0.8,
          fileType: 'image/jpeg',
          initialQuality: options?.quality || 0.8,
          alwaysKeepResolution: false,
          onProgress: (progress) => {
            self.postMessage({
              type: 'progress',
              progress
            } as CompressResponse);
          }
        });

        self.postMessage({
          type: 'success',
          data: compressedFile
        } as CompressResponse);
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

        self.postMessage({
          type: 'success',
          data: thumbnail
        } as CompressResponse);
        break;
      }

      case 'dimensions': {
        const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              resolve({ width: img.width, height: img.height });
            };
            img.onerror = reject;
            img.src = e.target?.result as string;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        self.postMessage({
          type: 'success',
          data: dimensions
        } as CompressResponse);
        break;
      }

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as CompressResponse);
  }
};

export {};

