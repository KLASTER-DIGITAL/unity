/**
 * useBooksList Hook
 * Shared logic for Books Library Screen (web and native)
 */

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';

export type Book = {
	id: string;
	userId: string;
	periodStart: string;
	periodEnd: string;
	contexts: string[];
	style: string;
	layout: string;
	theme: string;
	planType: 'free' | 'premium';
	type: string;
	language: string;
	storyJson: Record<string, unknown>;
	metadata: Record<string, unknown>;
	pdfUrl: string | null;
	isDraft: boolean;
	isFinal: boolean;
	version: number;
	parentBookId: string | null;
	createdAt: string;
	updatedAt: string;
};

export type BooksFilter = 'all' | 'drafts' | 'final';
export type BooksPlanFilter = 'all' | 'free' | 'premium';

export function useBooksList(userId: string | null) {
	const [books, setBooks] = useState<Book[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<BooksFilter>('all');
	const [planFilter, setPlanFilter] = useState<BooksPlanFilter>('all');

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: legacy fetch merges multiple filters/sorts
	const fetchBooks = useCallback(async () => {
		if (!userId) {
			setBooks([]);
			setLoading(false);
			return;
		}

		try {
			const supabase = createClient();
			let query = supabase
				.from('books_archive')
				.select('*')
				.eq('user_id', userId)
				.order('created_at', { ascending: false });

			// Apply status filter
			if (filter === 'drafts') {
				query = query.eq('is_draft', true);
			} else if (filter === 'final') {
				query = query.eq('is_final', true);
			}

			// Apply plan filter
			if (planFilter === 'free') {
				query = query.eq('plan_type', 'free');
			} else if (planFilter === 'premium') {
				query = query.eq('plan_type', 'premium');
			}

			const { data, error } = await query;

			if (error) {
				console.error('[useBooksList] Error fetching books:', error);
				toast.error('Не удалось загрузить книги');
				return;
			}

			// Transform snake_case to camelCase
			const transformedBooks: Book[] =
				data?.map((book) => ({
					id: book.id,
					userId: book.user_id,
					periodStart: book.period_start,
					periodEnd: book.period_end,
					contexts: book.contexts || [],
					style: book.style,
					layout: book.layout,
					theme: book.theme,
					planType: book.plan_type || 'premium',
					type: book.type || 'month',
					language: book.language || 'ru',
					storyJson: book.story_json,
					metadata: book.metadata || {},
					pdfUrl: book.pdf_url,
					isDraft: book.is_draft,
					isFinal: book.is_final,
					version: book.version || 1,
					parentBookId: book.parent_book_id,
					createdAt: book.created_at,
					updatedAt: book.updated_at,
				})) || [];

			setBooks(transformedBooks);
		} catch (error) {
			console.error('[useBooksList] Error:', error);
			toast.error('Произошла ошибка');
		} finally {
			setLoading(false);
		}
	}, [userId, filter, planFilter]);

	useEffect(() => {
		fetchBooks();
	}, [fetchBooks]);

	const deleteBook = useCallback(
		async (bookId: string) => {
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
					console.error('[useBooksList] Error deleting book:', error);
					toast.error('Не удалось удалить книгу');
					return false;
				}

				// Try to delete PDF from storage (optional, don't fail if it errors)
				if (book?.pdf_url) {
					try {
						const fileName = book.pdf_url.split('/').pop();
						if (fileName && userId) {
							await supabase.storage.from('books').remove([`${userId}/${fileName}`]);
						}
					} catch (storageError) {
						console.warn('[useBooksList] Could not delete PDF from storage:', storageError);
						// Don't fail the whole operation
					}
				}

				// Remove from local state
				setBooks((prev) => prev.filter((b) => b.id !== bookId));
				toast.success('Книга удалена');
				return true;
			} catch (error) {
				console.error('[useBooksList] Error:', error);
				toast.error('Произошла ошибка');
				return false;
			}
		},
		[userId]
	);

	const createNewVersion = useCallback(
		async (bookId: string) => {
			try {
				const supabase = createClient();

				// Get original book
				const { data: originalBook, error: fetchError } = await supabase
					.from('books_archive')
					.select('*')
					.eq('id', bookId)
					.single();

				if (fetchError || !originalBook) {
					console.error('[useBooksList] Error fetching book:', fetchError);
					toast.error('Не удалось найти книгу');
					return null;
				}

				// Create new version
				const { data: newBook, error: insertError } = await supabase
					.from('books_archive')
					.insert({
						user_id: originalBook.user_id,
						parent_book_id: originalBook.parent_book_id || originalBook.id, // Always point to v1
						version: (originalBook.version || 1) + 1,
						period_start: originalBook.period_start,
						period_end: originalBook.period_end,
						contexts: originalBook.contexts,
						style: originalBook.style,
						layout: originalBook.layout,
						theme: originalBook.theme,
						plan_type: originalBook.plan_type,
						type: originalBook.type,
						language: originalBook.language,
						story_json: originalBook.story_json, // Copy story_json
						metadata: originalBook.metadata,
						is_draft: true, // New version is a draft
						is_final: false,
						pdf_url: null, // No PDF yet
					})
					.select()
					.single();

				if (insertError || !newBook) {
					console.error('[useBooksList] Error creating new version:', insertError);
					toast.error('Не удалось создать новую версию');
					return null;
				}

				toast.success(`Создана версия ${newBook.version}`);
				fetchBooks(); // Refresh list
				return newBook.id;
			} catch (error) {
				console.error('[useBooksList] Error:', error);
				toast.error('Произошла ошибка');
				return null;
			}
		},
		[fetchBooks]
	);

	return {
		books,
		loading,
		filter,
		setFilter,
		planFilter,
		setPlanFilter,
		fetchBooks,
		deleteBook,
		createNewVersion,
	};
}
