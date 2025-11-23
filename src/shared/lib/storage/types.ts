/**
 * Offline Storage - Types and Interface
 *
 * Defines the contract for offline storage across platforms.
 * Used for caching PDFs and book drafts for offline access.
 */

export interface BookDraft {
	id: string;
	userId: string;
	title?: string;
	periodStart: string;
	periodEnd: string;
	storyJson: any;
	metadata: any;
	isFinal: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface OfflineStorage {
	// PDF Operations
	savePDF(bookId: string, pdfBlob: Blob): Promise<void>;
	getPDF(bookId: string): Promise<Blob | null>;
	deletePDF(bookId: string): Promise<void>;
	hasPDF(bookId: string): Promise<boolean>;

	// Draft Operations
	saveDraft(bookId: string, draft: BookDraft): Promise<void>;
	getDraft(bookId: string): Promise<BookDraft | null>;
	deleteDraft(bookId: string): Promise<void>;
	hasDraft(bookId: string): Promise<boolean>;

	// List Operations
	listCachedPDFs(): Promise<string[]>;
	listCachedDrafts(): Promise<string[]>;

	// Cleanup
	clearAll(): Promise<void>;
	getStorageSize(): Promise<number>;
}
