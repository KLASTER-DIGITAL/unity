/**
 * Offline Storage - React Native Implementation
 *
 * Uses FileSystem (expo-file-system) for PDFs and AsyncStorage for drafts.
 * This enables mobile users to access their books without internet connection.
 *
 * @platform native
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import type { BookDraft, OfflineStorage } from './types';

// Storage paths
const BOOKS_DIR = `${FileSystem.documentDirectory}unity-books/`;
const METADATA_PREFIX = 'offline:pdf:';
const DRAFT_PREFIX = 'offline:draft:';

// Ensure books directory exists
async function ensureBooksDir() {
	const dirInfo = await FileSystem.getInfoAsync(BOOKS_DIR);
	if (!dirInfo.exists) {
		await FileSystem.makeDirectoryAsync(BOOKS_DIR, { intermediates: true });
		console.log('[OFFLINE-NATIVE] Created books directory:', BOOKS_DIR);
	}
}

// Helper: Convert Blob to Base64 (for React Native)
async function blobToBase64(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			const base64 = (reader.result as string).split(',')[1];
			resolve(base64);
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}

export const offlineStorage: OfflineStorage = {
	// ==================== PDF Operations ====================

	async savePDF(bookId: string, pdfBlob: Blob): Promise<void> {
		try {
			await ensureBooksDir();

			// Convert Blob to Base64
			const base64 = await blobToBase64(pdfBlob);

			// Save to file system
			const filePath = `${BOOKS_DIR}${bookId}.pdf`;
			await FileSystem.writeAsStringAsync(filePath, base64, {
				encoding: FileSystem.EncodingType.Base64,
			});

			// Save metadata (file path and size)
			await AsyncStorage.setItem(
				`${METADATA_PREFIX}${bookId}`,
				JSON.stringify({
					path: filePath,
					size: pdfBlob.size,
					savedAt: new Date().toISOString(),
				})
			);

			console.log(
				'[OFFLINE-NATIVE] PDF saved:',
				bookId,
				`${(pdfBlob.size / 1024 / 1024).toFixed(2)} MB`
			);
		} catch (error) {
			console.error('[OFFLINE-NATIVE] Failed to save PDF:', error);
			throw new Error('Failed to cache PDF offline');
		}
	},

	async getPDF(bookId: string): Promise<Blob | null> {
		try {
			const metadataStr = await AsyncStorage.getItem(`${METADATA_PREFIX}${bookId}`);
			if (!metadataStr) {
				return null;
			}

			const metadata = JSON.parse(metadataStr);
			const fileInfo = await FileSystem.getInfoAsync(metadata.path);

			if (!fileInfo.exists) {
				console.warn('[OFFLINE-NATIVE] PDF file not found, cleaning up metadata');
				await AsyncStorage.removeItem(`${METADATA_PREFIX}${bookId}`);
				return null;
			}

			// Read file as base64
			const base64 = await FileSystem.readAsStringAsync(metadata.path, {
				encoding: FileSystem.EncodingType.Base64,
			});

			// Convert base64 to Blob
			const byteCharacters = atob(base64);
			const byteNumbers = new Array(byteCharacters.length);
			for (let i = 0; i < byteCharacters.length; i++) {
				byteNumbers[i] = byteCharacters.charCodeAt(i);
			}
			const byteArray = new Uint8Array(byteNumbers);
			const blob = new Blob([byteArray], { type: 'application/pdf' });

			console.log('[OFFLINE-NATIVE] PDF loaded from cache:', bookId);
			return blob;
		} catch (error) {
			console.error('[OFFLINE-NATIVE] Failed to get PDF:', error);
			return null;
		}
	},

	async deletePDF(bookId: string): Promise<void> {
		try {
			const metadataStr = await AsyncStorage.getItem(`${METADATA_PREFIX}${bookId}`);
			if (metadataStr) {
				const metadata = JSON.parse(metadataStr);

				// Delete file
				const fileInfo = await FileSystem.getInfoAsync(metadata.path);
				if (fileInfo.exists) {
					await FileSystem.deleteAsync(metadata.path);
				}

				// Delete metadata
				await AsyncStorage.removeItem(`${METADATA_PREFIX}${bookId}`);
				console.log('[OFFLINE-NATIVE] PDF deleted:', bookId);
			}
		} catch (error) {
			console.error('[OFFLINE-NATIVE] Failed to delete PDF:', error);
		}
	},

	async hasPDF(bookId: string): Promise<boolean> {
		try {
			const metadataStr = await AsyncStorage.getItem(`${METADATA_PREFIX}${bookId}`);
			if (!metadataStr) {
				return false;
			}

			const metadata = JSON.parse(metadataStr);
			const fileInfo = await FileSystem.getInfoAsync(metadata.path);
			return fileInfo.exists;
		} catch {
			return false;
		}
	},

	// ==================== Draft Operations ====================

	async saveDraft(bookId: string, draft: BookDraft): Promise<void> {
		try {
			await AsyncStorage.setItem(`${DRAFT_PREFIX}${bookId}`, JSON.stringify(draft));
			console.log('[OFFLINE-NATIVE] Draft saved:', bookId);
		} catch (error) {
			console.error('[OFFLINE-NATIVE] Failed to save draft:', error);
			throw new Error('Failed to cache draft offline');
		}
	},

	async getDraft(bookId: string): Promise<BookDraft | null> {
		try {
			const draftStr = await AsyncStorage.getItem(`${DRAFT_PREFIX}${bookId}`);
			if (draftStr) {
				console.log('[OFFLINE-NATIVE] Draft loaded from cache:', bookId);
				return JSON.parse(draftStr);
			}
			return null;
		} catch (error) {
			console.error('[OFFLINE-NATIVE] Failed to get draft:', error);
			return null;
		}
	},

	async deleteDraft(bookId: string): Promise<void> {
		try {
			await AsyncStorage.removeItem(`${DRAFT_PREFIX}${bookId}`);
			console.log('[OFFLINE-NATIVE] Draft deleted:', bookId);
		} catch (error) {
			console.error('[OFFLINE-NATIVE] Failed to delete draft:', error);
		}
	},

	async hasDraft(bookId: string): Promise<boolean> {
		try {
			const draftStr = await AsyncStorage.getItem(`${DRAFT_PREFIX}${bookId}`);
			return draftStr !== null;
		} catch {
			return false;
		}
	},

	// ==================== List Operations ====================

	async listCachedPDFs(): Promise<string[]> {
		try {
			const keys = await AsyncStorage.getAllKeys();
			const pdfKeys = keys
				.filter((key) => key.startsWith(METADATA_PREFIX))
				.map((key) => key.replace(METADATA_PREFIX, ''));
			return pdfKeys;
		} catch (error) {
			console.error('[OFFLINE-NATIVE] Failed to list PDFs:', error);
			return [];
		}
	},

	async listCachedDrafts(): Promise<string[]> {
		try {
			const keys = await AsyncStorage.getAllKeys();
			const draftKeys = keys
				.filter((key) => key.startsWith(DRAFT_PREFIX))
				.map((key) => key.replace(DRAFT_PREFIX, ''));
			return draftKeys;
		} catch (error) {
			console.error('[OFFLINE-NATIVE] Failed to list drafts:', error);
			return [];
		}
	},

	// ==================== Cleanup ====================

	async clearAll(): Promise<void> {
		try {
			// Delete all PDF files
			const pdfKeys = await this.listCachedPDFs();
			await Promise.all(pdfKeys.map((bookId) => this.deletePDF(bookId)));

			// Delete all drafts
			const draftKeys = await this.listCachedDrafts();
			await Promise.all(draftKeys.map((bookId) => this.deleteDraft(bookId)));

			console.log('[OFFLINE-NATIVE] All offline data cleared');
		} catch (error) {
			console.error('[OFFLINE-NATIVE] Failed to clear data:', error);
			throw new Error('Failed to clear offline storage');
		}
	},

	async getStorageSize(): Promise<number> {
		try {
			const keys = await AsyncStorage.getAllKeys();
			const pdfMetadataKeys = keys.filter((key) => key.startsWith(METADATA_PREFIX));

			let totalSize = 0;
			for (const key of pdfMetadataKeys) {
				const metadataStr = await AsyncStorage.getItem(key);
				if (metadataStr) {
					const metadata = JSON.parse(metadataStr);
					totalSize += metadata.size || 0;
				}
			}

			return totalSize; // in bytes
		} catch (error) {
			console.error('[OFFLINE-NATIVE] Failed to calculate storage size:', error);
			return 0;
		}
	},
};
