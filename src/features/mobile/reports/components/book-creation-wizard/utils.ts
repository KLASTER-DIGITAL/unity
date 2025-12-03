/**
 * Utility functions for Book Creation Wizard
 */

import { API_URLS } from '@/shared/lib/api/config/urls';
import { createClient } from '@/utils/supabase/client';
import { FREE_TIER_LIMIT, MIN_ENTRIES_REQUIRED } from './constants';
import type { BookConfig } from './types';

/**
 * Validate minimum entries in selected period
 */
export async function validateMinimumEntries(
	userId: string,
	periodStart: string,
	periodEnd: string,
	contexts: string[]
): Promise<{ valid: boolean; count: number }> {
	const supabase = createClient();

	let query = supabase
		.from('entries')
		.select('id', { count: 'exact' })
		.eq('user_id', userId)
		.gte('created_at', periodStart)
		.lte('created_at', periodEnd);

	if (contexts.length > 0) {
		query = query.in('category', contexts);
	}

	const { count, error } = await query;

	if (error) {
		console.error('[WIZARD] Error checking entries:', error);
		return { valid: false, count: 0 };
	}

	return {
		valid: (count || 0) >= MIN_ENTRIES_REQUIRED,
		count: count || 0,
	};
}

/**
 * Check if user has reached free tier limit
 */
export async function checkFreeTierLimit(
	userId: string,
	isPremium: boolean
): Promise<{ canGenerate: boolean; booksCount: number }> {
	if (isPremium) {
		return { canGenerate: true, booksCount: 0 };
	}

	const supabase = createClient();
	const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

	const { data: recentBooks, error } = await supabase
		.from('books_archive')
		.select('id')
		.eq('user_id', userId)
		.gte('created_at', thirtyDaysAgo.toISOString());

	if (error) {
		console.error('[WIZARD] Error checking books limit:', error);
		return { canGenerate: true, booksCount: 0 }; // Don't block on error
	}

	const booksCount = recentBooks?.length || 0;
	return {
		canGenerate: booksCount < FREE_TIER_LIMIT,
		booksCount,
	};
}

/**
 * Generate book draft via Edge Function (FREE or PREMIUM)
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: endpoint selection requires multiple conditions
export async function generateBookDraft(
	config: BookConfig,
	userId: string,
	diaryName: string,
	diaryEmoji: string
): Promise<{
	success: boolean;
	draftId?: string;
	error?: string;
	cached?: boolean;
	isFree?: boolean;
}> {
	try {
		const supabase = createClient();
		const {
			data: { session },
		} = await supabase.auth.getSession();

		if (!session?.access_token) {
			return { success: false, error: 'Не авторизован' };
		}

		// Choose the right endpoint based on plan type and book type
		const isFree = config.planType === 'free';
		let endpoint: string = isFree ? API_URLS.BOOKS_GENERATE_FREE : API_URLS.BOOKS_GENERATE_DRAFT;

		// Premium books: use specific endpoint for quarter/year
		if (!isFree && config.type === 'quarter') {
			endpoint = API_URLS.BOOKS_GENERATE_QUARTER;
		} else if (!isFree && config.type === 'year') {
			endpoint = API_URLS.BOOKS_GENERATE_ANNUAL;
		}

		console.log('[WIZARD] Generating book with config:', {
			planType: config.planType,
			endpoint: isFree ? 'FREE' : 'PREMIUM',
			userId,
			periodStart: config.periodStart,
			periodEnd: config.periodEnd,
			contexts: config.contexts,
			style: config.style,
			layout: config.layout,
		});

		const requestBody = isFree
			? {
					// FREE: minimal payload (no AI, no style/layout)
					userId,
					periodStart: config.periodStart,
					periodEnd: config.periodEnd,
					contexts: config.contexts,
					diaryName: diaryName || 'Мой дневник',
					diaryEmoji: diaryEmoji || '📝',
				}
			: config.type === 'year'
				? {
						// YEAR: uses year instead of period
						userId,
						year: new Date(config.periodStart).getFullYear(),
						style: config.style,
						layout: config.layout,
						theme: 'light',
						diaryName: diaryName || 'Мой дневник',
						diaryEmoji: diaryEmoji || '📝',
					}
				: {
						// PREMIUM: full payload with AI config
						userId,
						periodStart: config.periodStart,
						periodEnd: config.periodEnd,
						contexts: config.contexts,
						style: config.style,
						layout: config.layout,
						theme: 'light',
						type: config.type || 'month',
						diaryName: diaryName || 'Мой дневник',
						diaryEmoji: diaryEmoji || '📝',
					};

		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${session.access_token}`,
			},
			body: JSON.stringify(requestBody),
		});

		const result = await response.json();

		console.log('[WIZARD] API response:', result);

		if (!result.success) {
			return {
				success: false,
				error: result.error || 'Не удалось создать черновик',
			};
		}

		return {
			success: true,
			draftId: result.draftId,
			cached: result.cached || false,
			isFree,
		};
	} catch (error) {
		console.error('[WIZARD] Error generating book:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Произошла ошибка при создании книги',
		};
	}
}

/**
 * Fetch available categories from user's entries
 */
export async function fetchAvailableCategories(userId: string): Promise<string[]> {
	try {
		const supabase = createClient();
		const { data, error } = await supabase
			.from('entries')
			.select('category')
			.eq('user_id', userId)
			.not('category', 'is', null);

		if (error) {
			console.error('[WIZARD] Error fetching categories:', error);
			return [];
		}

		const uniqueCategories = Array.from(new Set(data.map((entry) => entry.category)));
		return uniqueCategories.filter((cat) => cat && cat.trim() !== '');
	} catch (error) {
		console.error('[WIZARD] Error fetching categories:', error);
		return [];
	}
}

/**
 * Delete a book from books_archive table
 * Also deletes associated PDF from storage and local cache if exists
 */
export async function deleteBook(bookId: string, userId: string): Promise<boolean> {
	try {
		const supabase = createClient();

		// First, get the book to check if it has a PDF
		const { data: book, error: fetchError } = await supabase
			.from('books_archive')
			.select('pdf_url')
			.eq('id', bookId)
			.eq('user_id', userId)
			.single();

		if (fetchError) {
			console.error('[WIZARD] Error fetching book:', fetchError);
			return false;
		}

		// ✅ Step 1: Delete PDF from Supabase Storage if exists
		if (book?.pdf_url) {
			try {
				// Extract file path from URL
				// Format: https://...supabase.co/storage/v1/object/public/books/{userId}/{bookId}/{filename}
				const urlParts = book.pdf_url.split('/');
				const fileName = urlParts[urlParts.length - 1]?.split('?')[0]; // Remove query params
				const filePath = `${userId}/${bookId}/${fileName}`;

				if (fileName && filePath) {
					const { error: storageError } = await supabase.storage.from('books').remove([filePath]);

					if (storageError) {
						console.warn('[WIZARD] Error deleting PDF from storage:', storageError);
						// Continue with DB deletion even if storage deletion fails
					} else {
						console.log('[WIZARD] PDF deleted from Supabase Storage:', filePath);
					}
				}
			} catch (storageErr) {
				console.warn('[WIZARD] Error deleting PDF from storage:', storageErr);
				// Continue with DB deletion even if storage deletion fails
			}
		}

		// ✅ Step 2: Delete from local offline cache (IndexedDB/FileSystem)
		try {
			// Dynamic import to avoid circular dependencies
			const { offlineStorage } = await import('@/shared/lib/storage/offline-storage');
			await offlineStorage.deletePDF(bookId);
			console.log('[WIZARD] PDF deleted from local cache:', bookId);
		} catch (cacheErr) {
			console.warn('[WIZARD] Error deleting PDF from local cache:', cacheErr);
			// Continue with DB deletion even if cache deletion fails
		}

		// ✅ Step 3: Delete book from database
		// CASCADE will automatically delete related records from book_photos table
		const { error: deleteError } = await supabase
			.from('books_archive')
			.delete()
			.eq('id', bookId)
			.eq('user_id', userId);

		if (deleteError) {
			console.error('[WIZARD] Error deleting book from database:', deleteError);
			return false;
		}

		console.log('[WIZARD] Book deleted successfully from all locations:', bookId);
		return true;
	} catch (error) {
		console.error('[WIZARD] Error deleting book:', error);
		return false;
	}
}
