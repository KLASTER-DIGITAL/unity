/**
 * useBooksList Hook
 * Shared logic for Books Library Screen (web and native)
 */

import { useCallback, useEffect, useState } from 'react';
import { toast } from '@/shared/components/ui/universal/Toast';
import { offlineStorage } from '@/shared/lib/storage/offline-storage';
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
	isAvailableOffline?: boolean; // ✨ NEW: Offline availability
	isDraft: boolean;
	isFinal: boolean;
	version: number;
	parentBookId: string | null;
	createdAt: string;
	updatedAt: string;
};

export type BooksFilter = 'all' | 'drafts' | 'final';

export function useBooksList(userId: string | null) {
	const [books, setBooks] = useState<Book[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<BooksFilter>('all');

	const fetchBooks = useCallback(async () => {
		if (!userId) {
			setBooks([]);
			setLoading(false);
			return;
		}

		try {
			setLoading(true); // ✅ FIX: Устанавливаем loading перед запросом
			const supabase = createClient();
			let query = supabase
				.from('books_archive')
				.select('*')
				.eq('user_id', userId)
				.order('updated_at', { ascending: false }); // ✅ FIX: Сортируем по updated_at для отображения последних изменений

			// Apply status filter
			if (filter === 'drafts') {
				query = query.eq('is_draft', true);
			} else if (filter === 'final') {
				query = query.eq('is_final', true);
			}

			const { data, error } = await query;

			if (error) {
				console.error('[useBooksList] Error fetching books:', error);
				toast.error('Не удалось загрузить книги');
				return;
			}

			// Transform snake_case to camelCase
			const transformedBooks: Book[] =
				data?.map((book) => {
					// ✅ FIX: Если книга готова (is_final = true), но pdf_url отсутствует,
					// пытаемся сгенерировать URL из Storage (возможно, PDF есть, но URL не сохранен)
					let pdfUrl = book.pdf_url;
					if (!pdfUrl && book.is_final && book.user_id) {
						// Генерируем возможный URL: books/{userId}/{bookId}.pdf
						const supabase = createClient();
						const { data: urlData } = supabase.storage
							.from('books')
							.getPublicUrl(`${book.user_id}/${book.id}.pdf`);
						// Проверяем существование файла (async, но мы не можем ждать здесь)
						// Устанавливаем URL, но проверка существования будет в компоненте
						pdfUrl = urlData.publicUrl;
					}

					return {
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
						pdfUrl,
						isDraft: book.is_draft,
						isFinal: book.is_final,
						version: book.version || 1,
						parentBookId: book.parent_book_id,
						createdAt: book.created_at,
						updatedAt: book.updated_at,
					};
				}) || [];

			// ✨ Check offline availability for each book
			const booksWithOfflineStatus = await Promise.all(
				transformedBooks.map(async (book) => {
					const isAvailableOffline = await offlineStorage.hasPDF(book.id);
					return { ...book, isAvailableOffline };
				})
			);

			setBooks(booksWithOfflineStatus);
		} catch (error) {
			console.error('[useBooksList] Error:', error);
			toast.error('Произошла ошибка');
		} finally {
			setLoading(false);
		}
	}, [userId, filter]);

	useEffect(() => {
		fetchBooks();
	}, [fetchBooks]);

	const deleteBook = useCallback(
		async (bookId: string) => {
			if (!userId) return false;

			// Import dynamically to avoid circular dependencies
			const { deleteBook: deleteBookUtil } = await import(
				'@/features/mobile/reports/components/book-creation-wizard/utils'
			);

			const success = await deleteBookUtil(bookId, userId);

			if (success) {
				setBooks((prev) => prev.filter((b) => b.id !== bookId));
				toast.success('Книга удалена');
			} else {
				toast.error('Не удалось удалить книгу');
			}
			return success;
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
		fetchBooks,
		deleteBook,
		createNewVersion,
	};
}
