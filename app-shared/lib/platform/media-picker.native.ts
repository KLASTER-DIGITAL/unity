/**
 * Native Media Picker Adapter for React Native
 *
 * Uses expo-image-picker for media selection
 *
 * @module platform/media-picker/native
 */

import type { CameraOptions, MediaFile, MediaPickerAdapter, MediaPickerOptions } from './index';

/**
 * React Native media picker adapter using expo-image-picker
 *
 * Note: This implementation uses dynamic import to avoid bundling
 * expo-image-picker in web builds. The actual ImagePicker will be
 * imported at runtime when running on React Native.
 */
export class NativeMediaPickerAdapter implements MediaPickerAdapter {
  private imagePicker: any = null;
  private initialized = false;

  /**
   * Initialize expo-image-picker (lazy loading)
   */
  private async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Check if we're in a React Native environment
      if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
        // Dynamic import to avoid bundling in web
        const ImagePicker = await import('expo-image-picker');
        this.imagePicker = ImagePicker;
        this.initialized = true;
      } else {
        throw new Error('expo-image-picker is only available in React Native environment');
      }
    } catch (error) {
      console.error('Failed to load expo-image-picker:', error);
      throw new Error(
        'expo-image-picker is not available. Make sure expo-image-picker is installed.'
      );
    }
  }

  isSupported(): boolean {
    // Will be true in React Native environment
    return typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
  }

  async requestPermissions(): Promise<boolean> {
    try {
      await this.init();

      // Request media library permissions
      const { status } = await this.imagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return false;
    }
  }

  async pickImages(options: MediaPickerOptions = {}): Promise<MediaFile[]> {
    try {
      await this.init();

      const result = await this.imagePicker.launchImageLibraryAsync({
        mediaTypes: this.imagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: options.multiple !== false,
        quality: options.quality ?? 1,
        allowsEditing: options.allowsEditing ?? false,
        aspect: options.aspect,
      });

      if (result.canceled) {
        return [];
      }

      // Convert to MediaFile format
      const mediaFiles: MediaFile[] = result.assets.map((asset: any) => ({
        uri: asset.uri,
        type: 'image' as const,
        name: asset.fileName || 'image.jpg',
        width: asset.width,
        height: asset.height,
        mimeType: asset.mimeType,
      }));

      // Apply maxFiles limit
      return options.maxFiles ? mediaFiles.slice(0, options.maxFiles) : mediaFiles;
    } catch (error) {
      console.error('Failed to pick images:', error);
      throw error;
    }
  }

  async pickVideos(options: MediaPickerOptions = {}): Promise<MediaFile[]> {
    try {
      await this.init();

      const result = await this.imagePicker.launchImageLibraryAsync({
        mediaTypes: this.imagePicker.MediaTypeOptions.Videos,
        allowsMultipleSelection: options.multiple !== false,
        quality: options.quality ?? 1,
        allowsEditing: options.allowsEditing ?? false,
      });

      if (result.canceled) {
        return [];
      }

      // Convert to MediaFile format
      const mediaFiles: MediaFile[] = result.assets.map((asset: any) => ({
        uri: asset.uri,
        type: 'video' as const,
        name: asset.fileName || 'video.mp4',
        width: asset.width,
        height: asset.height,
        duration: asset.duration,
        mimeType: asset.mimeType,
      }));

      // Apply maxFiles limit
      return options.maxFiles ? mediaFiles.slice(0, options.maxFiles) : mediaFiles;
    } catch (error) {
      console.error('Failed to pick videos:', error);
      throw error;
    }
  }

  async pickMedia(options: MediaPickerOptions = {}): Promise<MediaFile[]> {
    try {
      await this.init();

      const result = await this.imagePicker.launchImageLibraryAsync({
        mediaTypes: this.imagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: options.multiple !== false,
        quality: options.quality ?? 1,
        allowsEditing: options.allowsEditing ?? false,
        aspect: options.aspect,
      });

      if (result.canceled) {
        return [];
      }

      // Convert to MediaFile format
      const mediaFiles: MediaFile[] = result.assets.map((asset: any) => ({
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' : 'image',
        name: asset.fileName || (asset.type === 'video' ? 'video.mp4' : 'image.jpg'),
        width: asset.width,
        height: asset.height,
        duration: asset.duration,
        mimeType: asset.mimeType,
      }));

      // Apply maxFiles limit
      return options.maxFiles ? mediaFiles.slice(0, options.maxFiles) : mediaFiles;
    } catch (error) {
      console.error('Failed to pick media:', error);
      throw error;
    }
  }

  async takePhoto(options: CameraOptions = {}): Promise<MediaFile | null> {
    try {
      await this.init();

      // Request camera permissions
      const { status } = await this.imagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Camera permission denied');
      }

      const result = await this.imagePicker.launchCameraAsync({
        mediaTypes: this.imagePicker.MediaTypeOptions.Images,
        quality: options.quality ?? 1,
        allowsEditing: options.allowsEditing ?? false,
        aspect: options.aspect,
        cameraType:
          options.cameraType === 'front'
            ? this.imagePicker.CameraType.front
            : this.imagePicker.CameraType.back,
      });

      if (result.canceled) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        type: 'image',
        name: asset.fileName || 'photo.jpg',
        width: asset.width,
        height: asset.height,
        mimeType: asset.mimeType,
      };
    } catch (error) {
      console.error('Failed to take photo:', error);
      throw error;
    }
  }

  async recordVideo(options: CameraOptions = {}): Promise<MediaFile | null> {
    try {
      await this.init();

      // Request camera permissions
      const { status } = await this.imagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Camera permission denied');
      }

      const result = await this.imagePicker.launchCameraAsync({
        mediaTypes: this.imagePicker.MediaTypeOptions.Videos,
        quality: options.quality ?? 1,
        allowsEditing: options.allowsEditing ?? false,
        cameraType:
          options.cameraType === 'front'
            ? this.imagePicker.CameraType.front
            : this.imagePicker.CameraType.back,
      });

      if (result.canceled) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        type: 'video',
        name: asset.fileName || 'video.mp4',
        width: asset.width,
        height: asset.height,
        duration: asset.duration,
        mimeType: asset.mimeType,
      };
    } catch (error) {
      console.error('Failed to record video:', error);
      throw error;
    }
  }
}
