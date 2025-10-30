/**
 * Web Media Picker Adapter
 *
 * Uses HTML input[type="file"] for media selection
 *
 * @module platform/media-picker/web
 */

import type { CameraOptions, MediaFile, MediaPickerAdapter, MediaPickerOptions } from './index';

/**
 * Web media picker adapter using HTML input[type="file"]
 */
export class WebMediaPickerAdapter implements MediaPickerAdapter {
  isSupported(): boolean {
    return typeof document !== 'undefined' && typeof HTMLInputElement !== 'undefined';
  }

  async requestPermissions(): Promise<boolean> {
    // Web doesn't require explicit permissions for file picker
    // Permissions are requested when user interacts with file input
    return this.isSupported();
  }

  async pickImages(options: MediaPickerOptions = {}): Promise<MediaFile[]> {
    return this.pickFiles('image/*', options);
  }

  async pickVideos(options: MediaPickerOptions = {}): Promise<MediaFile[]> {
    return this.pickFiles('video/*', options);
  }

  async pickMedia(options: MediaPickerOptions = {}): Promise<MediaFile[]> {
    return this.pickFiles('image/*,video/*', options);
  }

  async takePhoto(_options?: CameraOptions): Promise<MediaFile | null> {
    // Web: use file input with camera capture
    const files = await this.pickFiles('image/*', {
      multiple: false,
      capture: 'environment',
    });
    return files.length > 0 ? files[0] : null;
  }

  async recordVideo(_options?: CameraOptions): Promise<MediaFile | null> {
    // Web: use file input with camera capture
    const files = await this.pickFiles('video/*', {
      multiple: false,
      capture: 'environment',
    });
    return files.length > 0 ? files[0] : null;
  }

  /**
   * Generic file picker implementation
   */
  private async pickFiles(
    accept: string,
    options: MediaPickerOptions & { capture?: string } = {}
  ): Promise<MediaFile[]> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('File picker is not supported in this environment'));
        return;
      }

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.multiple = options.multiple !== false; // Default to true

      // Add capture attribute if specified (for camera access)
      if (options.capture) {
        input.setAttribute('capture', options.capture);
      }

      input.onchange = async (e) => {
        try {
          const files = Array.from((e.target as HTMLInputElement).files || []);

          if (files.length === 0) {
            resolve([]);
            return;
          }

          // Apply maxFiles limit
          const limitedFiles = options.maxFiles ? files.slice(0, options.maxFiles) : files;

          // Convert to MediaFile format
          const mediaFiles = await Promise.all(
            limitedFiles.map((file) => this.fileToMediaFile(file))
          );

          resolve(mediaFiles);
        } catch (error) {
          reject(error);
        }
      };

      input.onerror = () => {
        reject(new Error('File selection failed'));
      };

      input.oncancel = () => {
        resolve([]); // User cancelled - return empty array
      };

      // Trigger file picker
      input.click();
    });
  }

  /**
   * Convert File to MediaFile
   */
  private async fileToMediaFile(file: File): Promise<MediaFile> {
    const uri = URL.createObjectURL(file);
    const type = file.type.startsWith('image/') ? 'image' : 'video';

    const mediaFile: MediaFile = {
      uri,
      type,
      name: file.name,
      size: file.size,
      mimeType: file.type,
    };

    // Get dimensions for images
    if (type === 'image') {
      try {
        const dimensions = await this.getImageDimensions(uri);
        mediaFile.width = dimensions.width;
        mediaFile.height = dimensions.height;
      } catch (error) {
        console.warn('Failed to get image dimensions:', error);
      }
    }

    // Get metadata for videos
    if (type === 'video') {
      try {
        const metadata = await this.getVideoMetadata(uri);
        mediaFile.width = metadata.width;
        mediaFile.height = metadata.height;
        mediaFile.duration = metadata.duration;
      } catch (error) {
        console.warn('Failed to get video metadata:', error);
      }
    }

    return mediaFile;
  }

  /**
   * Get image dimensions
   */
  private async getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = uri;
    });
  }

  /**
   * Get video metadata
   */
  private async getVideoMetadata(uri: string): Promise<{
    width: number;
    height: number;
    duration: number;
  }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration,
        });
      };

      video.onerror = () => {
        reject(new Error('Failed to load video metadata'));
      };

      video.src = uri;
    });
  }
}
