/**
 * Offline Storage Types
 * Platform-agnostic types for offline PDF storage
 */

export interface CachedPDF {
	id: string;
	bookId: string;
	pdfUrl: string;
	blob: Blob | string; // Blob for web, base64 for native
	cachedAt: number; // timestamp
	size: number; // bytes
	version: number;
}

export interface OfflineStorageAdapter {
	/**
	 * Cache a PDF for offline access
	 */
	cachePDF(bookId: string, pdfUrl: string, blob: Blob | string): Promise<void>;

	/**
	 * Get cached PDF
	 */
	getCachedPDF(bookId: string): Promise<CachedPDF | null>;

	/**
	 * Remove cached PDF
	 */
	removeCachedPDF(bookId: string): Promise<void>;

	/**
	 * Get all cached PDFs
	 */
	getAllCachedPDFs(): Promise<CachedPDF[]>;

	/**
	 * Clear all cached PDFs
	 */
	clearAllPDFs(): Promise<void>;

	/**
	 * Get total cache size
	 */
	getCacheSize(): Promise<number>;
}
