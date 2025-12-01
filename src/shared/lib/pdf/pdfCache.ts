/**
 * PDF Cache Service
 *
 * Manages PDF caching in Supabase Storage to avoid re-generating
 * the same PDF multiple times.
 *
 * @author UNITY Team
 * @date 2025-12-01
 */

import { createClient } from '@/utils/supabase/client';

export type PDFCacheKey = {
	userId: string;
	draftId: string;
	// Content hash to detect changes
	contentHash?: string;
};

/**
 * Generate a hash for the book content to detect changes
 */
export function generateContentHash(story: {
	title?: string;
	subtitle?: string;
	chapters?: Array<{ title?: string; content?: string }>;
}): string {
	const content = JSON.stringify({
		title: story.title,
		subtitle: story.subtitle,
		chapters: story.chapters?.map((ch) => ({
			title: ch.title,
			content: ch.content?.substring(0, 100), // First 100 chars for efficiency
		})),
	});

	// Simple hash function (not cryptographic, just for cache invalidation)
	let hash = 0;
	for (let i = 0; i < content.length; i++) {
		const char = content.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash.toString(36);
}

/**
 * Check if a PDF exists in cache and return its URL
 */
export async function getCachedPDF(
	key: PDFCacheKey
): Promise<{ url: string; isStale: boolean } | null> {
	try {
		const supabase = createClient();
		const fileName = `${key.userId}/${key.draftId}.pdf`;

		// Check if file exists in storage
		const { data: files, error } = await supabase.storage.from('books').list(key.userId, {
			search: `${key.draftId}.pdf`,
		});

		if (error || !files || files.length === 0) {
			console.log('[PDF-CACHE] No cached PDF found');
			return null;
		}

		// Get public URL
		const { data: urlData } = supabase.storage.from('books').getPublicUrl(fileName);

		// Check if content has changed (stale cache)
		if (key.contentHash) {
			// In production, we could store hash in metadata
			// For now, we'll assume cache is valid if file exists
			console.log('[PDF-CACHE] Cached PDF found:', urlData.publicUrl);
			return {
				url: urlData.publicUrl,
				isStale: false,
			};
		}

		return {
			url: urlData.publicUrl,
			isStale: false,
		};
	} catch (error) {
		console.error('[PDF-CACHE] Error checking cache:', error);
		return null;
	}
}

/**
 * Upload PDF to cache (Supabase Storage)
 */
export async function cachePDF(key: PDFCacheKey, blob: Blob): Promise<string> {
	const supabase = createClient();
	const fileName = `${key.userId}/${key.draftId}.pdf`;

	console.log('[PDF-CACHE] Uploading PDF to cache:', fileName);

	const { error: uploadError } = await supabase.storage.from('books').upload(fileName, blob, {
		contentType: 'application/pdf',
		upsert: true,
	});

	if (uploadError) {
		console.error('[PDF-CACHE] Upload error:', uploadError);
		throw new Error(`Ошибка загрузки PDF: ${uploadError.message}`);
	}

	// Get public URL
	const { data: urlData } = supabase.storage.from('books').getPublicUrl(fileName);
	const pdfUrl = urlData.publicUrl;

	console.log('[PDF-CACHE] PDF cached successfully:', pdfUrl);

	return pdfUrl;
}

/**
 * Invalidate cached PDF (delete from storage)
 */
export async function invalidatePDFCache(key: PDFCacheKey): Promise<void> {
	try {
		const supabase = createClient();
		const fileName = `${key.userId}/${key.draftId}.pdf`;

		const { error } = await supabase.storage.from('books').remove([fileName]);

		if (error) {
			console.error('[PDF-CACHE] Error invalidating cache:', error);
		} else {
			console.log('[PDF-CACHE] Cache invalidated:', fileName);
		}
	} catch (error) {
		console.error('[PDF-CACHE] Error invalidating cache:', error);
	}
}
