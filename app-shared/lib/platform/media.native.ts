/**
 * Native Media Adapter for React Native
 *
 * Uses expo-file-system, expo-image-manipulator, and expo-av for media operations
 *
 * @module platform/media/native
 */

import type { MediaAdapter } from '../media';

/**
 * React Native media adapter using Expo modules
 *
 * Note: This implementation uses dynamic import to avoid bundling
 * Expo modules in web builds. The actual modules will be imported
 * at runtime when running on React Native.
 */
export class NativeMediaAdapter implements MediaAdapter {
	private fileSystem: any = null;
	private av: any = null;
	private image: any = null;
	private initialized = false;

	/**
	 * Initialize Expo modules (lazy loaded)
	 */
	private async init(): Promise<void> {
		if (this.initialized) return;

		// Check if we're in a React Native environment
		if (typeof navigator === 'undefined' || navigator.product !== 'ReactNative') {
			console.warn(
				'⚠️ [NativeMediaAdapter] Not in React Native environment, skipping initialization'
			);
			return;
		}

		try {
			// Dynamic imports to avoid bundling in web
			// These will only be executed in React Native environment
			const [fs, im, avModule, imageModule] = await Promise.all([
				import('expo-file-system'),
				import('expo-image-manipulator'),
				import('expo-av'),
				import('react-native').then((rn) => rn.Image),
			]);

			this.fileSystem = fs;
			this.imageManipulator = im;
			this.av = avModule;
			this.image = imageModule;
			this.initialized = true;
		} catch (error) {
			console.error('❌ [NativeMediaAdapter] Failed to initialize Expo modules:', error);
			throw new Error('Failed to initialize native media adapter');
		}
	}

	/**
	 * Read file as Data URL (base64)
	 */
	async readAsDataURL(file: File): Promise<string> {
		await this.init();

		try {
			// In React Native, File object has a uri property
			const uri = (file as any).uri || file.name;

			// Read file as base64
			const base64 = await this.fileSystem.readAsStringAsync(uri, {
				encoding: this.fileSystem.EncodingType.Base64,
			});

			// Determine MIME type
			const mimeType = file.type || 'application/octet-stream';

			return `data:${mimeType};base64,${base64}`;
		} catch (error) {
			console.error('❌ [NativeMediaAdapter] Failed to read as data URL:', error);
			throw error;
		}
	}

	/**
	 * Read file as ArrayBuffer
	 */
	async readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
		await this.init();

		try {
			const uri = (file as any).uri || file.name;

			// Read as base64 first
			const base64 = await this.fileSystem.readAsStringAsync(uri, {
				encoding: this.fileSystem.EncodingType.Base64,
			});

			// Convert base64 to ArrayBuffer
			const binaryString = atob(base64);
			const bytes = new Uint8Array(binaryString.length);
			for (let i = 0; i < binaryString.length; i++) {
				bytes[i] = binaryString.charCodeAt(i);
			}

			return bytes.buffer;
		} catch (error) {
			console.error('❌ [NativeMediaAdapter] Failed to read as ArrayBuffer:', error);
			throw error;
		}
	}

	/**
	 * Read file as text
	 */
	async readAsText(file: File): Promise<string> {
		await this.init();

		try {
			const uri = (file as any).uri || file.name;

			return await this.fileSystem.readAsStringAsync(uri, {
				encoding: this.fileSystem.EncodingType.UTF8,
			});
		} catch (error) {
			console.error('❌ [NativeMediaAdapter] Failed to read as text:', error);
			throw error;
		}
	}

	/**
	 * Create object URL (returns file URI in React Native)
	 */
	createObjectURL(file: File | Blob): string {
		// In React Native, we use file:// URIs instead of blob URLs
		if ((file as any).uri) {
			return (file as any).uri;
		}

		// Fallback: return file name as URI
		return `file://${file.name || 'unknown'}`;
	}

	/**
	 * Revoke object URL (no-op in React Native)
	 */
	revokeObjectURL(_url: string): void {
		// No cleanup needed for file:// URIs in React Native
	}

	/**
	 * Get image dimensions
	 */
	async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
		await this.init();

		try {
			const uri = (file as any).uri || file.name;

			return new Promise((resolve, reject) => {
				this.image.getSize(
					uri,
					(width: number, height: number) => {
						resolve({ width, height });
					},
					(error: Error) => {
						console.error('❌ [NativeMediaAdapter] Failed to get image dimensions:', error);
						reject(error);
					}
				);
			});
		} catch (error) {
			console.error('❌ [NativeMediaAdapter] Failed to get image dimensions:', error);
			throw error;
		}
	}

	/**
	 * Get video metadata
	 */
	async getVideoMetadata(file: File): Promise<{
		duration: number;
		width: number;
		height: number;
	}> {
		await this.init();

		try {
			const uri = (file as any).uri || file.name;

			// Create video instance
			const { Video } = this.av;
			const video = new Video.Sound();

			// Load video
			await video.loadAsync({ uri }, {}, false);

			// Get status
			const status = await video.getStatusAsync();

			// Unload video
			await video.unloadAsync();

			if (!status.isLoaded) {
				throw new Error('Failed to load video');
			}

			return {
				duration: (status.durationMillis || 0) / 1000, // Convert to seconds
				width: status.naturalSize?.width || 0,
				height: status.naturalSize?.height || 0,
			};
		} catch (error) {
			console.error('❌ [NativeMediaAdapter] Failed to get video metadata:', error);
			throw error;
		}
	}

	/**
	 * Create canvas (not supported in React Native)
	 */
	createCanvas(_width: number, _height: number): any {
		console.warn(
			'⚠️ [NativeMediaAdapter] Canvas not supported in React Native. Use react-native-skia instead.'
		);
		return null;
	}

	/**
	 * Create image (returns React Native Image component reference)
	 */
	createImage(): any {
		if (!this.image) {
			console.warn('⚠️ [NativeMediaAdapter] Image module not initialized');
			return null;
		}
		return this.image;
	}

	/**
	 * Create video (returns expo-av Video component reference)
	 */
	createVideo(): any {
		if (!this.av) {
			console.warn('⚠️ [NativeMediaAdapter] AV module not initialized');
			return null;
		}
		return this.av.Video;
	}
}
