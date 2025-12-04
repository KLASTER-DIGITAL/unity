/**
 * Books Library Actions Hook
 *
 * Encapsulates all book-related actions (view, download, create PDF, edit, delete)
 * Extracted from BooksLibraryScreen for better code organization
 *
 * @author UNITY Team
 * @date 2025-01-30
 */

import type React from 'react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import type { Book } from '@/shared/lib/hooks/useBooksList';
import { useTranslation } from '@/shared/lib/i18n';
import { getStoryJson } from '@/shared/lib/types/books';
import { formatPeriod } from '@/shared/lib/utils/books';
import { createClient } from '@/utils/supabase/client';

type BookDraft = Book;

type UseBooksLibraryActionsProps = {
	userId: string | null;
	fetchBooks: (reset?: boolean) => Promise<void>;
	deleteBook: (bookId: string) => Promise<boolean>;
	onEditDraft?: (draftId: string) => void;
};

type UseBooksLibraryActionsReturn = {
	// View PDF
	viewingPdfUrl: string | null;
	viewingPdfFileName: string | null;
	setViewingPdfUrl: (url: string | null) => void;
	setViewingPdfFileName: (fileName: string | null) => void;
	handleView: (book: BookDraft, event?: React.MouseEvent) => Promise<void>;

	// Download PDF
	handleDownload: (book: BookDraft, event?: React.MouseEvent) => Promise<void>;

	// Create PDF
	handleCreatePDF: (book: BookDraft) => Promise<void>;

	// Edit draft
	handleEditDraft: (book: BookDraft) => void;

	// Delete book
	bookToDelete: BookDraft | null;
	showDeleteConfirm: boolean;
	deletingBookId: string | null;
	handleDeleteClick: (book: BookDraft) => void;
	handleDeleteConfirm: () => Promise<void>;
	handleDeleteCancel: () => void;
};

/**
 * Hook for managing book library actions
 */
export function useBooksLibraryActions({
	userId,
	fetchBooks,
	deleteBook,
	onEditDraft,
}: UseBooksLibraryActionsProps): UseBooksLibraryActionsReturn {
	const { t, currentLanguage } = useTranslation();
	const [viewingPdfUrl, setViewingPdfUrl] = useState<string | null>(null);
	const [viewingPdfFileName, setViewingPdfFileName] = useState<string | null>(null);
	const [bookToDelete, setBookToDelete] = useState<BookDraft | null>(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [deletingBookId, setDeletingBookId] = useState<string | null>(null);

	/**
	 * Handle view - opens PDF in modal window for viewing
	 */
	const handleView = useCallback(
		async (book: BookDraft, event?: React.MouseEvent) => {
			if (event) {
				event.preventDefault();
				event.stopPropagation();
			}

			// ✅ FIX: If book is final but pdfUrl is missing, try to get URL from Storage
			let pdfUrl = book.pdfUrl;
			if (!pdfUrl && book.isFinal && userId) {
				const supabase = createClient();

				// ✅ FIX: First check if file exists
				try {
					const { data: fileData } = await supabase.storage.from('books').list(`${userId}`, {
						search: `${book.id}.pdf`,
					});

					if (!fileData || fileData.length === 0) {
						console.warn(
							'[BOOKS-LIBRARY] PDF file not found in Storage:',
							`${userId}/${book.id}.pdf`
						);
						toast.error(
							t('books.pdf_not_found', 'PDF файл не найден. Пожалуйста, создайте PDF заново.')
						);
						return;
					}

					// ✅ FIX: Use signed URL instead of public URL (more reliable)
					const { data: signedUrlData, error: signedUrlError } = await supabase.storage
						.from('books')
						.createSignedUrl(`${userId}/${book.id}.pdf`, 3600); // 1 hour

					if (signedUrlError || !signedUrlData?.signedUrl) {
						console.warn(
							'[BOOKS-LIBRARY] Failed to create signed URL, using public URL:',
							signedUrlError
						);
						// Fallback to public URL
						const { data: urlData } = supabase.storage
							.from('books')
							.getPublicUrl(`${userId}/${book.id}.pdf`);
						pdfUrl = urlData.publicUrl;
					} else {
						pdfUrl = signedUrlData.signedUrl;
					}

					// Update pdfUrl in DB for future requests (save public URL for compatibility)
					const { data: publicUrlData } = supabase.storage
						.from('books')
						.getPublicUrl(`${userId}/${book.id}.pdf`);
					await supabase
						.from('books_archive')
						.update({ pdf_url: publicUrlData.publicUrl })
						.eq('id', book.id);
				} catch (error) {
					console.error('[BOOKS-LIBRARY] Error checking PDF file:', error);
					toast.error(t('books.pdf_check_error', 'Ошибка при проверке PDF файла'));
					return;
				}
			}

			if (!pdfUrl) {
				console.warn('[BOOKS-LIBRARY] No PDF URL for book:', book.id);
				toast.info(t('books.draft_not_completed', 'Черновик еще не завершен'));
				return;
			}

			// ✅ FIX: Check that pdfUrl is valid before opening
			if (!pdfUrl || pdfUrl === 'undefined' || pdfUrl === 'null') {
				console.error('[BOOKS-LIBRARY] Invalid PDF URL:', pdfUrl);
				toast.error(t('books.pdf_invalid_url', 'Неверный URL PDF файла'));
				return;
			}

			// Generate filename for display
			const storyJson = getStoryJson(book.storyJson);
			const bookTitle = storyJson?.title || 'book';
			const safeTitle =
				String(bookTitle)
					.replace(/[^a-zа-яё0-9\s-]/gi, '')
					.trim() || 'book';
			const fileName = `${safeTitle}_${formatPeriod(book.periodStart, book.periodEnd, currentLanguage).replace(/\s/g, '_')}.pdf`;

			// Open PDF in modal window
			setViewingPdfFileName(fileName);
			setViewingPdfUrl(pdfUrl);
		},
		[userId, currentLanguage, t]
	);

	/**
	 * Handle create PDF - creates PDF for existing book
	 */
	const handleCreatePDF = useCallback(
		async (book: BookDraft) => {
			if (!userId) {
				toast.error(t('books.auth_required', 'Необходима авторизация'));
				return;
			}

			try {
				const loadingToast = toast.loading(t('books.creating_pdf', 'Создание PDF...'));

				// Dynamically import PDF components
				const { pdf, Font } = await import('@react-pdf/renderer');
				const { BookPDFDocument } = await import('../../BookPDFDocument');

				// ✅ Register fonts before generation
				// NOTE: @react-pdf/renderer supports only .ttf and .otf formats, NOT .woff2
				// Using correct Google Fonts API URLs (v42 for Noto Sans, v33 for Noto Serif)
				try {
					Font.register({
						family: 'Noto Sans',
						fonts: [
							{
								// Regular weight (400) - correct URL from Google Fonts API
								src: 'https://fonts.gstatic.com/s/notosans/v42/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A99d.ttf',
								fontWeight: 400,
							},
							{
								// Medium weight (500)
								src: 'https://fonts.gstatic.com/s/notosans/v42/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyDPA99d.ttf',
								fontWeight: 500,
							},
							{
								// SemiBold weight (600)
								src: 'https://fonts.gstatic.com/s/notosans/v42/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyAjBN9d.ttf',
								fontWeight: 600,
							},
						],
					});

					Font.register({
						family: 'Noto Serif',
						fonts: [
							{
								// Regular weight (400)
								src: 'https://fonts.gstatic.com/s/notoserif/v33/ga6iaw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTa32J4wsL2JAlAhZqFCjwA.ttf',
								fontWeight: 400,
							},
							{
								// SemiBold weight (600)
								src: 'https://fonts.gstatic.com/s/notoserif/v33/ga6iaw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTa32J4wsL2JAlAhZdlejwA.ttf',
								fontWeight: 600,
							},
						],
					});
					console.log('[BOOKS-LIBRARY] Fonts (Noto Sans + Noto Serif) registered successfully');
				} catch (fontError) {
					console.warn('[BOOKS-LIBRARY] Font registration failed, using default fonts:', fontError);
					// Continue anyway - PDF will use default fonts (Helvetica, Times-Roman)
				}

				// Create PDF document
				const pdfDoc = (
					<BookPDFDocument
						story={
							book.storyJson as {
								title?: string;
								subtitle?: string;
								prologue?: string;
								epilogue?: string;
								dedication?: string;
								chapters?: Array<{
									title?: string;
									content?: string;
									highlights?: string[];
									is_divider?: boolean;
									is_chronicle?: boolean;
								}>;
							}
						}
						metadata={book.metadata as { diaryEmoji?: string; period?: string; insight?: string }}
						bookStyle={book.style || 'warm_family'}
						theme={book.theme || 'light'}
					/>
				);

				// Generate blob
				const blob = await pdf(pdfDoc).toBlob();

				// ✅ Validate blob before upload
				if (!blob || blob.size === 0) {
					toast.dismiss(loadingToast);
					throw new Error('PDF blob is empty or invalid. Please try again.');
				}

				// Upload to Supabase Storage
				const supabase = createClient();
				const {
					data: { session },
				} = await supabase.auth.getSession();

				if (!session?.user) {
					toast.dismiss(loadingToast);
					toast.error(t('books.auth_required', 'Необходима авторизация'));
					return;
				}

				const fileName = `${session.user.id}/${book.id}.pdf`;
				const { error: uploadError } = await supabase.storage.from('books').upload(fileName, blob, {
					contentType: 'application/pdf',
					upsert: true,
				});

				if (uploadError) {
					console.error('[BOOKS-LIBRARY] Upload error:', uploadError);
					toast.dismiss(loadingToast);
					throw new Error(`Ошибка загрузки PDF: ${uploadError.message}`);
				}

				// Get public URL
				const { data: urlData } = supabase.storage.from('books').getPublicUrl(fileName);
				const pdfUrl = urlData.publicUrl;

				// Update database
				await supabase
					.from('books_archive')
					.update({
						pdf_url: pdfUrl,
						is_final: true,
						is_draft: false,
					})
					.eq('id', book.id);

				toast.dismiss(loadingToast);
				toast.success(t('books.pdf_created', 'PDF книга создана!'));

				// Refresh books list
				await fetchBooks();

				// Show PDF in modal window after a delay
				setTimeout(() => {
					try {
						const storyJson = getStoryJson(book.storyJson);
						const bookTitle = storyJson?.title || 'book';
						const safeTitle = bookTitle.replace(/[^a-zа-яё0-9\s-]/gi, '').trim() || 'book';
						const displayFileName = `${safeTitle}.pdf`;

						setViewingPdfFileName(displayFileName);
						setViewingPdfUrl(pdfUrl);
					} catch (error) {
						console.warn('[BOOKS-LIBRARY] Failed to open PDF viewer:', error);
					}
				}, 1500);
			} catch (error) {
				console.error('[BOOKS-LIBRARY] Error creating PDF:', error);
				toast.error(
					t('books.pdf_creation_error', 'Произошла ошибка при создании PDF. Попробуйте позже.')
				);
			}
		},
		[userId, fetchBooks, t]
	);

	/**
	 * Handle download - downloads PDF file on PC and mobile devices
	 */
	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: необходимо обработать Web Share API и fallback
	const handleDownload = useCallback(
		async (book: BookDraft, event?: React.MouseEvent) => {
			if (event) {
				event.preventDefault();
				event.stopPropagation();
			}

			// ✅ FIX: If book is final but pdfUrl is missing, try to get URL from Storage
			let pdfUrl = book.pdfUrl;
			if (!pdfUrl && book.isFinal && userId) {
				const supabase = createClient();

				// ✅ FIX: First check if file exists
				try {
					const { data: fileData } = await supabase.storage.from('books').list(`${userId}`, {
						search: `${book.id}.pdf`,
					});

					if (!fileData || fileData.length === 0) {
						console.warn(
							'[BOOKS-LIBRARY] PDF file not found in Storage:',
							`${userId}/${book.id}.pdf`
						);

						// ✅ FIX: If PDF is missing in storage, try to regenerate it client-side
						toast.loading(t('books.pdf_regenerating', 'PDF файл не найден. Генерируем новый...'), {
							duration: 2000,
						});
						await handleCreatePDF(book);
						return;
					}

					// ✅ FIX: Use signed URL instead of public URL (more reliable)
					const { data: signedUrlData, error: signedUrlError } = await supabase.storage
						.from('books')
						.createSignedUrl(`${userId}/${book.id}.pdf`, 3600); // 1 hour

					if (signedUrlError || !signedUrlData?.signedUrl) {
						console.warn(
							'[BOOKS-LIBRARY] Failed to create signed URL, using public URL:',
							signedUrlError
						);
						// Fallback to public URL
						const { data: urlData } = supabase.storage
							.from('books')
							.getPublicUrl(`${userId}/${book.id}.pdf`);
						pdfUrl = urlData.publicUrl;
					} else {
						pdfUrl = signedUrlData.signedUrl;
					}

					// Update pdfUrl in DB for future requests (save public URL for compatibility)
					const { data: publicUrlData } = supabase.storage
						.from('books')
						.getPublicUrl(`${userId}/${book.id}.pdf`);
					await supabase
						.from('books_archive')
						.update({ pdf_url: publicUrlData.publicUrl })
						.eq('id', book.id);
				} catch (error) {
					console.error('[BOOKS-LIBRARY] Error checking PDF file:', error);
					toast.error(t('books.pdf_check_error', 'Ошибка при проверке PDF файла'));
					return;
				}
			}

			if (!pdfUrl) {
				toast.error(t('books.pdf_not_ready', 'PDF еще не сгенерирован'));
				return;
			}

			// ✅ FIX: Show loading indicator
			const loadingToast = toast.loading(t('books.downloading', 'Скачивание PDF...'));

			try {
				// ✅ FIX: Download PDF via fetch with retry logic (up to 3 attempts)
				let response: Response | null = null;
				let blob: Blob | null = null;
				let lastError: Error | null = null;

				for (let attempt = 0; attempt < 3; attempt++) {
					try {
						response = await fetch(pdfUrl, {
							method: 'GET',
							// ✅ FIX: Add timeout to prevent hanging
							signal: AbortSignal.timeout(30000), // 30 seconds timeout
						});

						if (!response.ok) {
							throw new Error(`HTTP error! status: ${response.status}`);
						}

						// Create blob from response
						blob = await response.blob();

						// ✅ FIX: Check that blob is not empty
						if (!blob || blob.size === 0) {
							throw new Error('PDF файл пустой');
						}

						// PDF downloaded successfully
						break; // Successfully downloaded, exit loop
					} catch (error) {
						lastError = error instanceof Error ? error : new Error('Unknown error');
						console.warn(`[BOOKS-LIBRARY] Download attempt ${attempt + 1} failed:`, lastError);

						// If this is the last attempt, throw error
						if (attempt === 2) {
							throw lastError;
						}

						// Wait before next attempt (exponential backoff)
						await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
					}
				}

				if (!blob) {
					throw new Error('Не удалось скачать PDF файл');
				}

				// Generate filename from book title
				const storyJson = getStoryJson(book.storyJson);
				const bookTitle = storyJson?.title || 'book';
				const safeTitle =
					String(bookTitle)
						.replace(/[^a-zа-яё0-9\s-]/gi, '')
						.trim() || 'book';
				const fileName = `${safeTitle}_${formatPeriod(book.periodStart, book.periodEnd, currentLanguage).replace(/\s/g, '_')}.pdf`;

				// ✅ Check Web Share API support for mobile devices
				// ✅ FIX: Check File constructor availability before using
				if (typeof File !== 'undefined' && navigator.share) {
					try {
						// biome-ignore lint/suspicious/noExplicitAny: File constructor might not be typed in RN environment
						// Create File object for download
						const pdfFile = new File([blob], fileName, { type: 'application/pdf' });
						if (navigator.canShare?.({ files: [pdfFile] })) {
							// Use Web Share API for mobile devices
							await navigator.share({
								title: bookTitle,
								files: [pdfFile],
							});
							toast.dismiss(loadingToast);
							toast.success(t('books.downloaded', 'PDF скачан успешно!'));
							return;
						}
					} catch (shareError) {
						// If user cancelled sharing, just exit
						if (shareError instanceof Error && shareError.name === 'AbortError') {
							toast.dismiss(loadingToast);
							return;
						}
						// If error - continue with normal download
						console.warn(
							'[BOOKS-LIBRARY] Web Share API failed, falling back to download:',
							shareError
						);
					}
				}

				// ✅ Normal download for PC and fallback for mobile
				const url = URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = fileName;
				link.style.display = 'none';

				// Add link to DOM, click and remove
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);

				// Free memory
				URL.revokeObjectURL(url);

				// ✅ FIX: Always close loading toast before showing result
				toast.dismiss(loadingToast);
				toast.success(t('books.downloaded', 'PDF скачан успешно!'));
			} catch (error) {
				// ✅ FIX: Always close loading toast even on error
				toast.dismiss(loadingToast);

				console.error('[BOOKS-LIBRARY] Error downloading PDF:', error);
				const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';

				// ✅ FIX: Show more detailed error message
				toast.error(t('books.download_error', 'Произошла ошибка при скачивании PDF'), {
					description:
						errorMessage.length > 100 ? `${errorMessage.substring(0, 100)}...` : errorMessage,
					duration: 5000,
					action: {
						label: t('books.retry', 'Повторить'),
						onClick: () => {
							void handleDownload(book);
						},
					},
				});
			}
		},
		[userId, currentLanguage, t, handleCreatePDF]
	);

	/**
	 * Handle edit draft
	 */
	const handleEditDraft = useCallback(
		(book: BookDraft) => {
			if (onEditDraft) {
				onEditDraft(book.id);
			} else {
				toast.info(t('books.edit_in_development', 'Функция редактирования в разработке'));
			}
		},
		[onEditDraft, t]
	);

	/**
	 * Handle delete button click
	 */
	const handleDeleteClick = useCallback((book: BookDraft) => {
		setBookToDelete(book);
		setShowDeleteConfirm(true);
	}, []);

	/**
	 * Handle delete confirmation
	 */
	const handleDeleteConfirm = useCallback(async () => {
		if (!bookToDelete) return;

		try {
			setDeletingBookId(bookToDelete.id);

			// ✅ Use hook's delete function
			await deleteBook(bookToDelete.id);
		} catch (error) {
			console.error('[BOOKS-LIBRARY] Error:', error);
			toast.error(t('books.editor.error', 'Произошла ошибка'));
		} finally {
			setDeletingBookId(null);
			setShowDeleteConfirm(false);
			setBookToDelete(null);
		}
	}, [bookToDelete, deleteBook, t]);

	/**
	 * Handle delete cancellation
	 */
	const handleDeleteCancel = useCallback(() => {
		setShowDeleteConfirm(false);
		setBookToDelete(null);
	}, []);

	return {
		// View PDF
		viewingPdfUrl,
		viewingPdfFileName,
		setViewingPdfUrl,
		setViewingPdfFileName,
		handleView,

		// Download PDF
		handleDownload,

		// Create PDF
		handleCreatePDF,

		// Edit draft
		handleEditDraft,

		// Delete book
		bookToDelete,
		showDeleteConfirm,
		deletingBookId,
		handleDeleteClick,
		handleDeleteConfirm,
		handleDeleteCancel,
	};
}
