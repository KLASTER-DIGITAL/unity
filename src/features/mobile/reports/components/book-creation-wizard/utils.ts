/**
 * Utility functions for Book Creation Wizard
 */

import { API_URLS } from '../../../../../shared/lib/api/config/urls';
import { createClient } from '../../../../../utils/supabase/client';
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
						planType: config.planType || 'premium', // ✅ Include planType
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

		// ✅ FIX: Check response status before parsing JSON
		if (!response.ok) {
			let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
			try {
				const errorData = await response.json();
				errorMessage = errorData.error || errorMessage;
				console.error('[WIZARD] API error response:', errorData);
			} catch {
				// If JSON parsing fails, try to read as text
				try {
					const errorText = await response.text();
					errorMessage = errorText || errorMessage;
				} catch {
					// Use default error message
				}
			}
			return {
				success: false,
				error: errorMessage,
			};
		}

		const result = await response.json();

		console.log('[WIZARD] API response:', result);

		if (!result.success) {
			return {
				success: false,
				error: result.error || 'Не удалось создать черновик',
			};
		}

		// ✅ FIX: Validate that draftId exists
		if (!result.draftId) {
			console.error('[WIZARD] No draftId in response:', result);
			return {
				success: false,
				error: 'Черновик создан, но ID не получен',
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
 * ✅ Deduplicates categories by normalizing to lowercase
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: legacy fetch merges deduplication and fallbacks
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

		// ✅ Normalize categories: lowercase for deduplication, but keep best case for display
		const categoryMap = new Map<string, string>();

		for (const entry of data) {
			const category = entry.category?.trim();
			if (!category) continue;

			const normalized = category.toLowerCase();
			const existing = categoryMap.get(normalized);

			// Keep the best version: prefer capitalized over all lowercase
			if (!existing) {
				categoryMap.set(normalized, category);
			} else {
				const existingIsLower = existing === existing.toLowerCase();
				const categoryIsLower = category === category.toLowerCase();

				// Prefer non-lowercase over all lowercase
				if (categoryIsLower && !existingIsLower) {
					// Keep existing (it's better)
					continue;
				}
				if (!categoryIsLower && existingIsLower) {
					// Replace with better version
					categoryMap.set(normalized, category);
				}
			}
		}

		return Array.from(categoryMap.values()).sort();
	} catch (error) {
		console.error('[WIZARD] Error fetching categories:', error);
		return [];
	}
}

/**
 * Delete book draft (DB + Storage)
 */
export async function deleteBook(bookId: string, userId: string): Promise<boolean> {
	try {
		const supabase = createClient();

		// Get book to find PDF URL
		const { data: book } = await supabase
			.from('books_archive')
			.select('pdf_url')
			.eq('id', bookId)
			.single();

		// Delete from database (CASCADE will delete book_photos)
		const { error } = await supabase.from('books_archive').delete().eq('id', bookId);

		if (error) {
			console.error('[UTILS] Error deleting book:', error);
			return false;
		}

		// Try to delete PDF from storage
		if (book?.pdf_url) {
			try {
				const fileName = book.pdf_url.split('/').pop();
				if (fileName && userId) {
					await supabase.storage.from('books').remove([`${userId}/${fileName}`]);
				}
			} catch (storageError) {
				console.warn('[UTILS] Could not delete PDF from storage:', storageError);
			}
		}

		return true;
	} catch (error) {
		console.error('[UTILS] Error:', error);
		return false;
	}
}
