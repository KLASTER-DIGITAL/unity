/**
 * Universal Media Adapter for UNITY-v2
 * 
 * Provides cross-platform media handling that works on both
 * Web (DOM APIs) and React Native (native modules)
 * 
 * @author UNITY Team
 * @date 2025-01-18
 */

import { Platform } from './detection';

/**
 * Universal media interface
 */
export interface MediaAdapter {
  /**
   * Read file as data URL
   * @param file - File to read
   * @returns Promise resolving to data URL
   */
  readAsDataURL(file: File): Promise<string>;

  /**
   * Read file as array buffer
   * @param file - File to read
   * @returns Promise resolving to array buffer
   */
  readAsArrayBuffer(file: File): Promise<ArrayBuffer>;

  /**
   * Read file as text
   * @param file - File to read
   * @returns Promise resolving to text content
   */
  readAsText(file: File): Promise<string>;

  /**
   * Create object URL for file
   * @param file - File to create URL for
   * @returns Object URL string
   */
  createObjectURL(file: File | Blob): string;

  /**
   * Revoke object URL
   * @param url - Object URL to revoke
   */
  revokeObjectURL(url: string): void;

  /**
   * Get image dimensions
   * @param file - Image file
   * @returns Promise resolving to dimensions
   */
  getImageDimensions(file: File): Promise<{ width: number; height: number }>;

  /**
   * Get video metadata
   * @param file - Video file
   * @returns Promise resolving to metadata
   */
  getVideoMetadata(file: File): Promise<{
    duration: number;
    width: number;
    height: number;
  }>;

  /**
   * Create canvas element
   * @param width - Canvas width
   * @param height - Canvas height
   * @returns Canvas element or equivalent
   */
  createCanvas(width: number, height: number): HTMLCanvasElement | any;

  /**
   * Create image element
   * @returns Image element or equivalent
   */
  createImage(): HTMLImageElement | any;

  /**
   * Create video element
   * @returns Video element or equivalent
   */
  createVideo(): HTMLVideoElement | any;
}

/**
 * Web media adapter using DOM APIs
 */
class WebMediaAdapter implements MediaAdapter {
  async readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file as data URL'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  async readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target?.result as ArrayBuffer);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file as array buffer'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  async readAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file as text'));
      };
      
      reader.readAsText(file);
    });
  }

  createObjectURL(file: File | Blob): string {
    return URL.createObjectURL(file);
  }

  revokeObjectURL(url: string): void {
    URL.revokeObjectURL(url);
  }

  async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
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
        reject(new Error('Failed to read image file'));
      };

      reader.readAsDataURL(file);
    });
  }

  async getVideoMetadata(file: File): Promise<{
    duration: number;
    width: number;
    height: number;
  }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve({
          duration: Math.round(video.duration),
          width: video.videoWidth,
          height: video.videoHeight
        });
      };

      video.onerror = () => {
        reject(new Error('Failed to load video metadata'));
      };

      video.src = URL.createObjectURL(file);
    });
  }

  createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  createImage(): HTMLImageElement {
    return new Image();
  }

  createVideo(): HTMLVideoElement {
    return document.createElement('video');
  }
}

/**
 * React Native media adapter (placeholder)
 * This will be implemented when migrating to React Native
 */
class NativeMediaAdapter implements MediaAdapter {
  async readAsDataURL(file: File): Promise<string> {
    // TODO: Implement with React Native FileSystem
    console.warn('NativeMediaAdapter not implemented yet');
    throw new Error('NativeMediaAdapter not implemented yet');
  }

  async readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    // TODO: Implement with React Native FileSystem
    console.warn('NativeMediaAdapter not implemented yet');
    throw new Error('NativeMediaAdapter not implemented yet');
  }

  async readAsText(file: File): Promise<string> {
    // TODO: Implement with React Native FileSystem
    console.warn('NativeMediaAdapter not implemented yet');
    throw new Error('NativeMediaAdapter not implemented yet');
  }

  createObjectURL(file: File | Blob): string {
    // TODO: Implement with React Native file URI
    console.warn('NativeMediaAdapter not implemented yet');
    throw new Error('NativeMediaAdapter not implemented yet');
  }

  revokeObjectURL(url: string): void {
    // TODO: Implement cleanup for React Native
    console.warn('NativeMediaAdapter not implemented yet');
  }

  async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    // TODO: Implement with React Native Image.getSize
    console.warn('NativeMediaAdapter not implemented yet');
    throw new Error('NativeMediaAdapter not implemented yet');
  }

  async getVideoMetadata(file: File): Promise<{
    duration: number;
    width: number;
    height: number;
  }> {
    // TODO: Implement with React Native Video or expo-av
    console.warn('NativeMediaAdapter not implemented yet');
    throw new Error('NativeMediaAdapter not implemented yet');
  }

  createCanvas(width: number, height: number): any {
    // TODO: Implement with React Native Skia or similar
    console.warn('NativeMediaAdapter not implemented yet');
    throw new Error('NativeMediaAdapter not implemented yet');
  }

  createImage(): any {
    // TODO: Implement with React Native Image component
    console.warn('NativeMediaAdapter not implemented yet');
    throw new Error('NativeMediaAdapter not implemented yet');
  }

  createVideo(): any {
    // TODO: Implement with React Native Video component
    console.warn('NativeMediaAdapter not implemented yet');
    throw new Error('NativeMediaAdapter not implemented yet');
  }
}

/**
 * Memory media adapter (fallback)
 */
class MemoryMediaAdapter implements MediaAdapter {
  async readAsDataURL(file: File): Promise<string> {
    // Fallback: return empty data URL
    return 'data:text/plain;base64,';
  }

  async readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    // Fallback: return empty array buffer
    return new ArrayBuffer(0);
  }

  async readAsText(file: File): Promise<string> {
    // Fallback: return empty string
    return '';
  }

  createObjectURL(file: File | Blob): string {
    // Fallback: return blob URL
    return 'blob:memory://fallback';
  }

  revokeObjectURL(url: string): void {
    // No-op for memory adapter
  }

  async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    // Fallback: return default dimensions
    return { width: 0, height: 0 };
  }

  async getVideoMetadata(file: File): Promise<{
    duration: number;
    width: number;
    height: number;
  }> {
    // Fallback: return default metadata
    return { duration: 0, width: 0, height: 0 };
  }

  createCanvas(width: number, height: number): any {
    // Fallback: return mock canvas
    return {
      width,
      height,
      getContext: () => null,
      toDataURL: () => 'data:image/png;base64,'
    };
  }

  createImage(): any {
    // Fallback: return mock image
    return {
      width: 0,
      height: 0,
      onload: null,
      onerror: null,
      src: ''
    };
  }

  createVideo(): any {
    // Fallback: return mock video
    return {
      duration: 0,
      videoWidth: 0,
      videoHeight: 0,
      onloadedmetadata: null,
      onerror: null,
      src: ''
    };
  }
}

/**
 * Universal media instance
 * Automatically selects the appropriate media adapter based on platform
 */
export const media: MediaAdapter = Platform.select({
  web: new WebMediaAdapter(),
  native: new NativeMediaAdapter(),
  default: new MemoryMediaAdapter()
});

/**
 * Media utilities for common operations
 */
export const MediaUtils = {
  /**
   * Check if file is an image
   */
  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  },

  /**
   * Check if file is a video
   */
  isVideoFile(file: File): boolean {
    return file.type.startsWith('video/');
  },

  /**
   * Get file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Validate file size
   */
  validateFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  },

  /**
   * Get file extension
   */
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }
};
