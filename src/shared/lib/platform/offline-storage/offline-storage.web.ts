/**
 * Offline Storage Adapter - Web Implementation (IndexedDB)
 */

import type { CachedPDF, OfflineStorageAdapter } from './types';

const DB_NAME = 'unity_offline';
const DB_VERSION = 1;
const STORE_NAME = 'pdfs';

class WebOfflineStorage implements OfflineStorageAdapter {
	private dbPromise: Promise<IDBDatabase> | null = null;

	private getDB(): Promise<IDBDatabase> {
		if (this.dbPromise) {
			return this.dbPromise;
		}

		this.dbPromise = new Promise((resolve, reject) => {
			const request = indexedDB.open(DB_NAME, DB_VERSION);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve(request.result);

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;

				// Create object store
				if (!db.objectStoreNames.contains(STORE_NAME)) {
					const store = db.createObjectStore(STORE_NAME, { keyPath: 'bookId' });
					store.createIndex('cachedAt', 'cachedAt', { unique: false });
				}
			};
		});

		return this.dbPromise;
	}

	async cachePDF(bookId: string, pdfUrl: string, blob: Blob | string): Promise<void> {
		const db = await this.getDB();

		// Convert string to Blob if needed
		const pdfBlob = typeof blob === 'string' ? await this.base64ToBlob(blob) : blob;

		const cachedPDF: CachedPDF = {
			id: `pdf_${bookId}`,
			bookId,
			pdfUrl,
			blob: pdfBlob,
			cachedAt: Date.now(),
			size: pdfBlob.size,
			version: 1,
		};

		return new Promise((resolve, reject) => {
			const transaction = db.transaction([STORE_NAME], 'readwrite');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.put(cachedPDF);

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async getCachedPDF(bookId: string): Promise<CachedPDF | null> {
		const db = await this.getDB();

		return new Promise((resolve, reject) => {
			const transaction = db.transaction([STORE_NAME], 'readonly');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.get(bookId);

			request.onsuccess = () => resolve(request.result || null);
			request.onerror = () => reject(request.error);
		});
	}

	async removeCachedPDF(bookId: string): Promise<void> {
		const db = await this.getDB();

		return new Promise((resolve, reject) => {
			const transaction = db.transaction([STORE_NAME], 'readwrite');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.delete(bookId);

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async getAllCachedPDFs(): Promise<CachedPDF[]> {
		const db = await this.getDB();

		return new Promise((resolve, reject) => {
			const transaction = db.transaction([STORE_NAME], 'readonly');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.getAll();

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	async clearAllPDFs(): Promise<void> {
		const db = await this.getDB();

		return new Promise((resolve, reject) => {
			const transaction = db.transaction([STORE_NAME], 'readwrite');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.clear();

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async getCacheSize(): Promise<number> {
		const pdfs = await this.getAllCachedPDFs();
		return pdfs.reduce((total, pdf) => total + pdf.size, 0);
	}

	private async base64ToBlob(base64: string): Promise<Blob> {
		// Remove data URL prefix if present
		const base64Data = base64.replace(/^data:application\/pdf;base64,/, '');

		// Convert base64 to binary
		const binaryString = atob(base64Data);
		const bytes = new Uint8Array(binaryString.length);

		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}

		return new Blob([bytes], { type: 'application/pdf' });
	}
}

export const offlineStorage: OfflineStorageAdapter = new WebOfflineStorage();
