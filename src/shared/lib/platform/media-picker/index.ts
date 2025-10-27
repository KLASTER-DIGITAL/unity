/**
 * Media Picker Platform Adapter
 * 
 * Provides cross-platform media picking functionality:
 * - Web: HTML input[type="file"]
 * - Native: expo-image-picker
 * 
 * @module platform/media-picker
 */

import { Platform } from '../index';
import { WebMediaPickerAdapter } from './media-picker.web';

// ============================================================================
// TYPES
// ============================================================================

export interface MediaFile {
  /** File URI (web: blob URL, native: file:// or content://) */
  uri: string;
  /** Media type */
  type: 'image' | 'video';
  /** File name (optional) */
  name?: string;
  /** File size in bytes (optional) */
  size?: number;
  /** MIME type (optional) */
  mimeType?: string;
  /** Width in pixels (for images/videos) */
  width?: number;
  /** Height in pixels (for images/videos) */
  height?: number;
  /** Duration in seconds (for videos) */
  duration?: number;
}

export interface MediaPickerOptions {
  /** Allow multiple file selection */
  multiple?: boolean;
  /** Maximum number of files to select */
  maxFiles?: number;
  /** Image quality (0-1, native only) */
  quality?: number;
  /** Allow editing (native only) */
  allowsEditing?: boolean;
  /** Aspect ratio for editing (native only) */
  aspect?: [number, number];
}

export interface CameraOptions {
  /** Image quality (0-1, native only) */
  quality?: number;
  /** Allow editing (native only) */
  allowsEditing?: boolean;
  /** Aspect ratio for editing (native only) */
  aspect?: [number, number];
  /** Camera type (front/back, native only) */
  cameraType?: 'front' | 'back';
}

export interface MediaPickerAdapter {
  /**
   * Check if media picker is supported
   */
  isSupported(): boolean;

  /**
   * Request permissions for media access
   */
  requestPermissions(): Promise<boolean>;

  /**
   * Pick images from gallery
   */
  pickImages(options?: MediaPickerOptions): Promise<MediaFile[]>;

  /**
   * Pick videos from gallery
   */
  pickVideos(options?: MediaPickerOptions): Promise<MediaFile[]>;

  /**
   * Pick any media (images or videos)
   */
  pickMedia(options?: MediaPickerOptions): Promise<MediaFile[]>;

  /**
   * Take a photo with camera
   */
  takePhoto(options?: CameraOptions): Promise<MediaFile | null>;

  /**
   * Record a video with camera
   */
  recordVideo(options?: CameraOptions): Promise<MediaFile | null>;
}

// ============================================================================
// EXPORT
// ============================================================================

/**
 * Universal media picker instance
 * Automatically selects the appropriate adapter based on platform
 * 
 * Note: NativeMediaPickerAdapter is not imported to avoid bundling
 * expo-image-picker in web builds
 */
export const mediaPicker: MediaPickerAdapter = Platform.select({
  web: new WebMediaPickerAdapter(),
  native: new WebMediaPickerAdapter(), // Placeholder - will be replaced with NativeMediaPickerAdapter in RN
  default: new WebMediaPickerAdapter(),
});

