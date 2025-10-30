/**
 * Media Picker Platform Adapter
 *
 * Provides cross-platform media picking functionality:
 * - Web: HTML input[type="file"]
 * - Native: expo-image-picker
 *
 * @module platform/media-picker
 */

import { WebMediaPickerAdapter } from './media-picker.web';
// ✅ PWA + React Native Architecture: ONLY import web module in PWA build
// React Native implementation is in /app/shared/lib/platform/media-picker.native.ts

// ============================================================================
// TYPES
// ============================================================================

export type MediaFile = {
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
};

export type MediaPickerOptions = {
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
};

export type CameraOptions = {
	/** Image quality (0-1, native only) */
	quality?: number;
	/** Allow editing (native only) */
	allowsEditing?: boolean;
	/** Aspect ratio for editing (native only) */
	aspect?: [number, number];
	/** Camera type (front/back, native only) */
	cameraType?: 'front' | 'back';
};

export type MediaPickerAdapter = {
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
};

// ============================================================================
// EXPORT
// ============================================================================

/**
 * Universal media picker instance
 * PWA build: ONLY web implementation
 * React Native build: Uses /app/shared/lib/platform/media-picker.native.ts
 */
export const mediaPicker: MediaPickerAdapter = new WebMediaPickerAdapter();
