/**
 * Offline Helper Functions for Books
 *
 * Utility functions for caching and retrieving books offline.
 */

import type { Book } from '@/shared/lib/hooks/useBooksList';
import { offlineStorage } from '@/shared/lib/storage/offline-storage';

/**
 * Cache PDF for offline access
 * Downloads PDF from URL and saves to offline storage
 */
export async function cachePDFOffline(book: Book): Promise<boolean> {
	try {
		if (!book.pdfUrl) {
			console.warn('[OFFLINE] No PDF URL for book:', book.id);
			return false;
		}

		const response = await fetch(book.pdfUrl);
		if (!response.ok) {
			console.error('[OFFLINE] Failed to fetch PDF:', response.statusText);
			return false;
		}

		const blob = await response.blob();
		await offlineStorage.savePDF(book.id, blob);

		console.log('[OFFLINE] PDF cached successfully:', book.id);
		return true;
	} catch (error) {
		console.error('[OFFLINE] Failed to cache PDF:', error);
		return false;
	}
}

/**
 * Get PDF from offline cache or network
 * First checks offline cache, falls back to network if not available
 */
export async function getPDFOnline(book: Book): Promise<Blob | null> {
	try {
		// Try offline cache first
		const cachedPDF = await offlineStorage.getPDF(book.id);
		if (cachedPDF) {
			console.log('[OFFLINE] Using cached PDF:', book.id);
			return cachedPDF;
		}

		// Fall back to network
		if (!book.pdfUrl) {
			console.warn('[OFFLINE] No PDF URL for book:', book.id);
			return null;
		}

		if (!navigator.onLine) {
			console.warn('[OFFLINE] Network unavailable and no cached PDF');
			return null;
		}

		console.log('[OFFLINE] Fetching PDF from network:', book.id);
		const response = await fetch(book.pdfUrl);
		if (!response.ok) {
			return null;
		}

		const blob = await response.blob();

		// Auto-cache for future offline use
		try {
			await offlineStorage.savePDF(book.id, blob);
			console.log('[OFFLINE] PDF auto-cached after network fetch');
		} catch (cacheError) {
			console.warn('[OFFLINE] Failed to auto-cache PDF:', cacheError);
			// Continue anyway - we have the blob
		}

		return blob;
	} catch (error) {
		console.error('[OFFLINE] Failed to get PDF:', error);
		return null;
	}
}

/**
 * Remove PDF from offline cache
 */
export async function removeCachedPDF(bookId: string): Promise<boolean> {
	try {
		await offlineStorage.deletePDF(bookId);
		console.log('[OFFLINE] PDF removed from cache:', bookId);
		return true;
	} catch (error) {
		console.error('[OFFLINE] Failed to remove cached PDF:', error);
		return false;
	}
}

/**
 * Get total offline storage size in human-readable format
 */
export async function getOfflineStorageSize(): Promise<string> {
	try {
		const bytes = await offlineStorage.getStorageSize();
		const MB = bytes / 1024 / 1024;

		if (MB < 1) {
			return `${(bytes / 1024).toFixed(1)} KB`;
		}
		return `${MB.toFixed(1)} MB`;
	} catch (error) {
		console.error('[OFFLINE] Failed to get storage size:', error);
		return '0 MB';
	}
}
