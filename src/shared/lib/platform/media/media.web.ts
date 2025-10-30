/**
 * Web Media Adapter
 *
 * Uses browser APIs (FileReader, URL, Image, Video) for media operations
 *
 * @module platform/media/web
 */

import type { MediaAdapter } from '../media';

/**
 * Web media adapter using browser APIs
 */
export class WebMediaAdapter implements MediaAdapter {
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
					height: video.videoHeight,
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
