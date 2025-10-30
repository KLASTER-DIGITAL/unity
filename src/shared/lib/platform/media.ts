/**
 * Universal Media Adapter for UNITY-v2
 *
 * Provides cross-platform media handling that works on both
 * Web (DOM APIs) and React Native (native modules)
 *
 * @author UNITY Team
 * @date 2025-01-18
 */

import { media as platformMedia } from './media/index';

/**
 * Universal media interface
 */
export type MediaAdapter = {
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
};

/**
 * Universal media instance
 * Re-exported from platform/media for backward compatibility
 */
export const media: MediaAdapter = platformMedia;

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
		if (bytes === 0) {
			return '0 Bytes';
		}

		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
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
	},
};
