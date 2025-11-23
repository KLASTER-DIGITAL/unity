/**
 * Offline Storage - Web Implementation
 *
 * Uses IndexedDB (via localforage) for storing PDFs and drafts offline.
 * This enables PWA users to access their books without internet connection.
 *
 * @platform web
 */

import localforage from 'localforage';
import type { BookDraft, OfflineStorage } from './types';

// Create separate stores for PDFs and drafts
const pdfStore = localforage.createInstance({
	name: 'unity-offline',
	storeName: 'pdfs',
	description: 'PDF books for offline access',
});

const draftStore = localforage.createInstance({
	name: 'unity-offline',
	storeName: 'drafts',
	description: 'Book drafts for offline editing',
});

export const offlineStorage: OfflineStorage = {
	// ==================== PDF Operations ====================

	async savePDF(bookId: string, pdfBlob: Blob): Promise<void> {
		try {
			await pdfStore.setItem(bookId, pdfBlob);
			console.log(
				'[OFFLINE-WEB] PDF saved:',
				bookId,
				`${(pdfBlob.size / 1024 / 1024).toFixed(2)} MB`
			);
		} catch (error) {
			console.error('[OFFLINE-WEB] Failed to save PDF:', error);
			throw new Error('Failed to cache PDF offline');
		}
	},

	async getPDF(bookId: string): Promise<Blob | null> {
		try {
			const blob = await pdfStore.getItem<Blob>(bookId);
			if (blob) {
				console.log('[OFFLINE-WEB] PDF loaded from cache:', bookId);
			}
			return blob;
		} catch (error) {
			console.error('[OFFLINE-WEB] Failed to get PDF:', error);
			return null;
		}
	},

	async deletePDF(bookId: string): Promise<void> {
		try {
			await pdfStore.removeItem(bookId);
			console.log('[OFFLINE-WEB] PDF deleted:', bookId);
		} catch (error) {
			console.error('[OFFLINE-WEB] Failed to delete PDF:', error);
		}
	},

	async hasPDF(bookId: string): Promise<boolean> {
		try {
			const blob = await pdfStore.getItem<Blob>(bookId);
			return blob !== null;
		} catch {
			return false;
		}
	},

	// ==================== Draft Operations ====================

	async saveDraft(bookId: string, draft: BookDraft): Promise<void> {
		try {
			await draftStore.setItem(bookId, draft);
			console.log('[OFFLINE-WEB] Draft saved:', bookId);
		} catch (error) {
			console.error('[OFFLINE-WEB] Failed to save draft:', error);
			throw new Error('Failed to cache draft offline');
		}
	},

	async getDraft(bookId: string): Promise<BookDraft | null> {
		try {
			const draft = await draftStore.getItem<BookDraft>(bookId);
			if (draft) {
				console.log('[OFFLINE-WEB] Draft loaded from cache:', bookId);
			}
			return draft;
		} catch (error) {
			console.error('[OFFLINE-WEB] Failed to get draft:', error);
			return null;
		}
	},

	async deleteDraft(bookId: string): Promise<void> {
		try {
			await draftStore.removeItem(bookId);
			console.log('[OFFLINE-WEB] Draft deleted:', bookId);
		} catch (error) {
			console.error('[OFFLINE-WEB] Failed to delete draft:', error);
		}
	},

	async hasDraft(bookId: string): Promise<boolean> {
		try {
			const draft = await draftStore.getItem<BookDraft>(bookId);
			return draft !== null;
		} catch {
			return false;
		}
	},

	// ==================== List Operations ====================

	async listCachedPDFs(): Promise<string[]> {
		try {
			const keys = await pdfStore.keys();
			return keys;
		} catch (error) {
			console.error('[OFFLINE-WEB] Failed to list PDFs:', error);
			return [];
		}
	},

	async listCachedDrafts(): Promise<string[]> {
		try {
			const keys = await draftStore.keys();
			return keys;
		} catch (error) {
			console.error('[OFFLINE-WEB] Failed to list drafts:', error);
			return [];
		}
	},

	// ==================== Cleanup ====================

	async clearAll(): Promise<void> {
		try {
			await Promise.all([pdfStore.clear(), draftStore.clear()]);
			console.log('[OFFLINE-WEB] All offline data cleared');
		} catch (error) {
			console.error('[OFFLINE-WEB] Failed to clear data:', error);
			throw new Error('Failed to clear offline storage');
		}
	},

	async getStorageSize(): Promise<number> {
		try {
			let totalSize = 0;

			// Calculate PDF storage size
			const pdfKeys = await pdfStore.keys();
			for (const key of pdfKeys) {
				const blob = await pdfStore.getItem<Blob>(key);
				if (blob) {
					totalSize += blob.size;
				}
			}

			// Note: Draft size is negligible (JSON data)

			return totalSize; // in bytes
		} catch (error) {
			console.error('[OFFLINE-WEB] Failed to calculate storage size:', error);
			return 0;
		}
	},
};
