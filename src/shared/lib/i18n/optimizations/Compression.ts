/**
 * Compression utilities for translation data
 *
 * Features:
 * - LZ-based compression for translation strings
 * - Deduplication of common phrases
 * - Efficient storage using Storage Adapter
 * - Automatic compression/decompression
 */

import { storage } from '../../platform/storage';
import type { Translations } from '../types/TranslationKeys';

type CompressedData = {
	data: string;
	compressed: boolean;
	originalSize: number;
	compressedSize: number;
	algorithm: 'lz' | 'none';
	version: number;
};

// biome-ignore lint/complexity/noStaticOnlyClass: Compression utility intentionally uses static methods for cross-app coordination
export class Compression {
	private static readonly VERSION = 1;
	private static readonly MIN_SIZE_FOR_COMPRESSION = 1024; // 1KB

	/**
	 * Compress translations object
	 */
	static compress(translations: Translations): CompressedData {
		const jsonString = JSON.stringify(translations);
		const originalSize = jsonString.length;

		// Skip compression for small data
		if (originalSize < Compression.MIN_SIZE_FOR_COMPRESSION) {
			return {
				data: jsonString,
				compressed: false,
				originalSize,
				compressedSize: originalSize,
				algorithm: 'none',
				version: Compression.VERSION,
			};
		}

		try {
			const compressed = Compression.lzCompress(jsonString);
			const compressedSize = compressed.length;

			// Only use compression if it actually reduces size
			if (compressedSize < originalSize * 0.9) {
				console.log(
					`📦 Compression: ${originalSize} → ${compressedSize} bytes (${Math.round((1 - compressedSize / originalSize) * 100)}% saved)`
				);

				return {
					data: compressed,
					compressed: true,
					originalSize,
					compressedSize,
					algorithm: 'lz',
					version: Compression.VERSION,
				};
			}
		} catch (error) {
			console.warn('⚠️ Compression failed, using uncompressed:', error);
		}

		// Fallback to uncompressed
		return {
			data: jsonString,
			compressed: false,
			originalSize,
			compressedSize: originalSize,
			algorithm: 'none',
			version: Compression.VERSION,
		};
	}

	/**
	 * Decompress translations data
	 */
	static decompress(compressedData: CompressedData): Translations {
		try {
			if (!compressedData.compressed) {
				return JSON.parse(compressedData.data);
			}

			const decompressed = Compression.lzDecompress(compressedData.data);
			return JSON.parse(decompressed);
		} catch (error) {
			console.error('❌ Decompression failed:', error);
			throw new Error('Failed to decompress translation data');
		}
	}

	/**
	 * Get compression statistics
	 */
	static getStats(compressedData: CompressedData) {
		const ratio = compressedData.compressed
			? compressedData.compressedSize / compressedData.originalSize
			: 1;

		return {
			compressed: compressedData.compressed,
			algorithm: compressedData.algorithm,
			originalSize: compressedData.originalSize,
			compressedSize: compressedData.compressedSize,
			ratio: Math.round(ratio * 100) / 100,
			savedBytes: compressedData.originalSize - compressedData.compressedSize,
			savedPercent: Math.round((1 - ratio) * 100),
		};
	}

	// LZ-based compression (simple implementation)
	// For production, consider using a library like lz-string or pako

	private static lzCompress(str: string): string {
		// Simple LZ77-like compression
		const dict: Record<string, number> = {};
		let dictSize = 256;
		let result = '';
		let w = '';

		for (let i = 0; i < str.length; i++) {
			const c = str.charAt(i);
			const wc = w + c;

			if (dict[wc] !== undefined) {
				w = wc;
			} else {
				result += String.fromCharCode(dict[w] !== undefined ? dict[w] : w.charCodeAt(0));
				dict[wc] = dictSize++;
				w = c;
			}
		}

		if (w !== '') {
			result += String.fromCharCode(dict[w] !== undefined ? dict[w] : w.charCodeAt(0));
		}

		// Base64 encode to ensure safe storage
		return btoa(encodeURIComponent(result));
	}

	private static lzDecompress(compressed: string): string {
		// Decode from base64
		const str = decodeURIComponent(atob(compressed));

		const dict: Record<number, string> = {};
		let dictSize = 256;
		let w = String.fromCharCode(str.charCodeAt(0));
		let result = w;

		for (let i = 1; i < str.length; i++) {
			const k = str.charCodeAt(i);
			let entry: string;

			if (dict[k] !== undefined) {
				entry = dict[k];
			} else if (k === dictSize) {
				entry = w + w.charAt(0);
			} else {
				entry = String.fromCharCode(k);
			}

			result += entry;
			dict[dictSize++] = w + entry.charAt(0);
			w = entry;
		}

		return result;
	}
}

/**
 * Optimized storage manager with compression
 */
// biome-ignore lint/complexity/noStaticOnlyClass: OptimizedStorage utility intentionally uses static methods for cross-app coordination
export class OptimizedStorage {
	private static readonly STORAGE_PREFIX = 'i18n_optimized_';

	/**
	 * Save translations with compression
	 */
	static async save(language: string, translations: Translations): Promise<void> {
		const compressed = Compression.compress(translations);
		const stats = Compression.getStats(compressed);

		console.log(`💾 OptimizedStorage: Saving ${language}`, stats);

		const storageData = {
			...compressed,
			language,
			timestamp: Date.now(),
		};

		try {
			await storage.setItem(
				`${OptimizedStorage.STORAGE_PREFIX}${language}`,
				JSON.stringify(storageData)
			);
		} catch (error) {
			console.error(`❌ OptimizedStorage: Failed to save ${language}:`, error);

			// Try to free space by removing old data
			await OptimizedStorage.cleanup();

			// Retry
			try {
				await storage.setItem(
					`${OptimizedStorage.STORAGE_PREFIX}${language}`,
					JSON.stringify(storageData)
				);
			} catch (retryError) {
				console.error(`❌ OptimizedStorage: Retry failed for ${language}:`, retryError);
				throw retryError;
			}
		}
	}

	/**
	 * Load translations with decompression
	 */
	static async load(language: string): Promise<Translations | null> {
		try {
			const stored = await storage.getItem(`${OptimizedStorage.STORAGE_PREFIX}${language}`);
			if (!stored) {
				return null;
			}

			const storageData = JSON.parse(stored);
			const translations = Compression.decompress(storageData);

			console.log(
				`📂 OptimizedStorage: Loaded ${language} (${Object.keys(translations).length} keys)`
			);
			return translations;
		} catch (error) {
			console.error(`❌ OptimizedStorage: Failed to load ${language}:`, error);
			return null;
		}
	}

	/**
	 * Remove translations for a language
	 */
	static async remove(language: string): Promise<void> {
		await storage.removeItem(`${OptimizedStorage.STORAGE_PREFIX}${language}`);
		console.log(`🗑️ OptimizedStorage: Removed ${language}`);
	}

	/**
	 * Cleanup old or unused translations
	 */
	static async cleanup(): Promise<void> {
		console.log('🧹 OptimizedStorage: Cleaning up...');

		const keys = (await storage.getAllKeys()).filter((key) =>
			key.startsWith(OptimizedStorage.STORAGE_PREFIX)
		);

		// Sort by timestamp (oldest first)
		const entries = await Promise.all(
			keys.map(async (key) => {
				try {
					const data = JSON.parse((await storage.getItem(key)) || '{}');
					return { key, timestamp: data.timestamp || 0 };
				} catch {
					return { key, timestamp: 0 };
				}
			})
		);
		entries.sort((a, b) => a.timestamp - b.timestamp);

		// Remove oldest 25% of entries
		const toRemove = entries.slice(0, Math.ceil(entries.length * 0.25));

		await storage.multiRemove(toRemove.map(({ key }) => key));

		console.log(`✅ OptimizedStorage: Cleaned up ${toRemove.length} entries`);
	}

	/**
	 * Get storage statistics
	 */
	static async getStats() {
		const keys = (await storage.getAllKeys()).filter((key) =>
			key.startsWith(OptimizedStorage.STORAGE_PREFIX)
		);

		let totalOriginalSize = 0;
		let totalCompressedSize = 0;
		let compressedCount = 0;

		await Promise.all(
			keys.map(async (key) => {
				try {
					const data = JSON.parse((await storage.getItem(key)) || '{}');
					totalOriginalSize += data.originalSize || 0;
					totalCompressedSize += data.compressedSize || 0;
					if (data.compressed) {
						compressedCount++;
					}
				} catch {
					// Skip invalid entries
				}
			})
		);

		return {
			totalLanguages: keys.length,
			compressedLanguages: compressedCount,
			totalOriginalSize,
			totalCompressedSize,
			savedBytes: totalOriginalSize - totalCompressedSize,
			savedPercent:
				totalOriginalSize > 0 ? Math.round((1 - totalCompressedSize / totalOriginalSize) * 100) : 0,
		};
	}
}
