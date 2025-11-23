/**
 * Books Library Screen
 *
 * Displays user's PDF books library with filters and download options.
 * Enhanced with Framer Motion animations and premium styling.
 *
 * @author UNITY Team
 * @date 2025-11-23
 */

import {
	ArrowLeft,
	BookOpen,
	Calendar,
	Download,
	Edit,
	Eye,
	File,
	Plus,
	Sparkles,
	Trash2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PDFViewer } from '@/shared/components/PDFViewer';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { API_URLS } from '@/shared/lib/api/config/urls';
import type { Book } from '@/shared/lib/hooks/useBooksList';
import { useBooksList } from '@/shared/lib/hooks/useBooksList';
import { useTranslation } from '@/shared/lib/i18n';
import { createClient } from '@/utils/supabase/client';
import { BookDeleteConfirmModal } from './BookDeleteConfirmModal';

type BookDraft = Book;

type BooksLibraryScreenProps = {
	onCreateBook?: () => void;
	onBack?: () => void;
	onEditDraft?: (draftId: string) => void;
	refreshKey?: string | number; // Key для принудительного обновления списка книг
};

export function BooksLibraryScreen({
	onCreateBook,
	onBack,
	onEditDraft,
	refreshKey,
}: BooksLibraryScreenProps) {
	const { t, currentLanguage } = useTranslation();
	const [userId, setUserId] = useState<string | null>(null);
	const [_deletingBookId, setDeletingBookId] = useState<string | null>(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [bookToDelete, setBookToDelete] = useState<BookDraft | null>(null);
	const [_creatingVersionId, setCreatingVersionId] = useState<string | null>(null);
	const [viewingPdfUrl, setViewingPdfUrl] = useState<string | null>(null);
	const [viewingPdfFileName, setViewingPdfFileName] = useState<string | null>(null);

	// Get user ID from session
	useEffect(() => {
		const getUserId = async () => {
			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (session?.user?.id) {
				setUserId(session.user.id);
			}
		};
		getUserId();
	}, []);

	// ✅ Use shared hook for books list management
	const {
		books,
		loading: isLoading,
		filter,
		setFilter,
		fetchBooks,
		deleteBook: deleteBookHook,
		createNewVersion: createNewVersionHook,
	} = useBooksList(userId);

	// Refetch when refreshKey changes
	useEffect(() => {
		if (refreshKey && refreshKey > 0) {
			fetchBooks();
		}
	}, [refreshKey, fetchBooks]);

	// Format date range
	const formatPeriod = (start: string, end: string) => {
		const startDate = new Date(start);
		const endDate = new Date(end);
		const locale =
			currentLanguage === 'kk'
				? 'kk-KZ'
				: currentLanguage === 'ka'
					? 'ka-GE'
					: `${currentLanguage}-${currentLanguage.toUpperCase()}`;
		const startStr = startDate.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
		const endStr = endDate.toLocaleDateString(locale, {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		});
		return `${startStr} – ${endStr}`;
	};

	// Get style label
	const getStyleLabel = (style: string) => {
		switch (style) {
			case 'warm_family':
				return t('books.style.warm_family' as any, 'Семейная история');
			case 'biographical':
				return t('books.style.biographical' as any, 'Биография');
			case 'motivational':
				return t('books.style.motivational' as any, 'Мотивация');
			default:
				return style;
		}
	};

	// ✅ Handle view - открывает PDF в модальном окне для просмотра
	const handleView = async (book: BookDraft, event?: React.MouseEvent) => {
		console.log('[BOOKS-LIBRARY] handleView START:', {
			bookId: book.id,
			pdfUrl: book.pdfUrl,
			isFinal: book.isFinal,
			hasEvent: !!event,
			book: book,
		});

		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}

		// ✅ FIX: Если книга готова, но pdfUrl отсутствует, пытаемся получить URL из Storage
		let pdfUrl = book.pdfUrl;
		if (!pdfUrl && book.isFinal && userId) {
			console.log('[BOOKS-LIBRARY] PDF URL missing, trying to generate from Storage...');
			const supabase = createClient();
			const { data: urlData } = supabase.storage
				.from('books')
				.getPublicUrl(`${userId}/${book.id}.pdf`);
			pdfUrl = urlData.publicUrl;
			console.log('[BOOKS-LIBRARY] Generated PDF URL from Storage:', pdfUrl);

			// Проверяем существование файла
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

				// Обновляем pdfUrl в БД для будущих запросов
				await supabase.from('books_archive').update({ pdf_url: pdfUrl }).eq('id', book.id);
				console.log('[BOOKS-LIBRARY] Updated pdf_url in database');
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

		// ✅ FIX: Проверяем доступность PDF перед открытием модального окна с retry логикой
		let isAvailable = false;
		let lastError: Error | null = null;

		// Пытаемся проверить доступность до 3 раз с задержкой
		for (let attempt = 0; attempt < 3; attempt++) {
			try {
				console.log(
					`[BOOKS-LIBRARY] Checking PDF availability (attempt ${attempt + 1}/3):`,
					pdfUrl
				);
				const response = await fetch(pdfUrl, { method: 'HEAD' });

				if (response.ok) {
					isAvailable = true;
					console.log('[BOOKS-LIBRARY] PDF is accessible, opening viewer');
					break;
				} else {
					console.warn(
						`[BOOKS-LIBRARY] PDF not accessible (attempt ${attempt + 1}):`,
						response.status,
						response.statusText
					);
					lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
			} catch (error) {
				console.warn(
					`[BOOKS-LIBRARY] Error checking PDF availability (attempt ${attempt + 1}):`,
					error
				);
				lastError = error instanceof Error ? error : new Error('Unknown error');
			}

			// Ждем перед следующей попыткой (только если не последняя)
			if (attempt < 2 && !isAvailable) {
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}
		}

		if (!isAvailable) {
			console.error('[BOOKS-LIBRARY] PDF not accessible after retries:', lastError);

			// ✅ FIX: Если PDF недоступен, пытаемся обновить URL из Storage и проверить еще раз
			if (userId) {
				const supabase = createClient();
				const { data: urlData } = supabase.storage
					.from('books')
					.getPublicUrl(`${userId}/${book.id}.pdf`);
				const newPdfUrl = urlData.publicUrl;

				// Проверяем новый URL
				try {
					const checkResponse = await fetch(newPdfUrl, { method: 'HEAD' });
					if (checkResponse.ok) {
						// ✅ FIX: Обновляем pdfUrl в БД и используем новый URL
						await supabase.from('books_archive').update({ pdf_url: newPdfUrl }).eq('id', book.id);
						pdfUrl = newPdfUrl;
						console.log('[BOOKS-LIBRARY] PDF URL updated and verified');
					} else {
						// Если новый URL тоже не работает, предлагаем создать PDF заново
						toast.error(
							t(
								'books.pdf_not_accessible',
								'PDF файл недоступен. Возможно, файл был удален или перемещен.'
							),
							{
								duration: 5000,
								action: {
									label: t('books.create_pdf', 'Создать PDF'),
									onClick: () => {
										void handleCreatePDF(book);
									},
								},
							}
						);
						return;
					}
				} catch (error) {
					console.error('[BOOKS-LIBRARY] Error checking updated PDF URL:', error);
					toast.error(
						t(
							'books.pdf_not_accessible',
							'PDF файл недоступен. Возможно, файл был удален или перемещен.'
						),
						{
							duration: 5000,
							action: {
								label: t('books.create_pdf', 'Создать PDF'),
								onClick: () => {
									void handleCreatePDF(book);
								},
							},
						}
					);
					return;
				}
			} else {
				// Если userId отсутствует, просто показываем ошибку
				toast.error(
					t(
						'books.pdf_not_accessible',
						'PDF файл недоступен. Возможно, файл был удален или перемещен.'
					),
					{
						duration: 5000,
						action: {
							label: t('books.create_pdf', 'Создать PDF'),
							onClick: () => {
								void handleCreatePDF(book);
							},
						},
					}
				);
				return;
			}
		}

		// Генерируем имя файла для отображения
		const bookTitle = (book.storyJson as any)?.title || 'book';
		const safeTitle =
			String(bookTitle)
				.replace(/[^a-zа-яё0-9\s-]/gi, '')
				.trim() || 'book';
		const fileName = `${safeTitle}_${formatPeriod(book.periodStart, book.periodEnd).replace(/\s/g, '_')}.pdf`;

		console.log('[BOOKS-LIBRARY] Opening PDF viewer:', { fileName, pdfUrl });

		// Открываем PDF в модальном окне
		console.log('[BOOKS-LIBRARY] Setting state:', { fileName, pdfUrl });
		setViewingPdfFileName(fileName);
		setViewingPdfUrl(pdfUrl);
		console.log('[BOOKS-LIBRARY] State set, PDF viewer should open');
	};

	// ✅ Handle create PDF - создает PDF для существующей книги
	const handleCreatePDF = async (book: BookDraft) => {
		if (!userId) {
			toast.error(t('books.auth_required', 'Необходима авторизация'));
			return;
		}

		try {
			const loadingToast = toast.loading(t('books.creating_pdf', 'Создание PDF...'));

			// Get access token
			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session?.access_token) {
				toast.error(t('books.auth_required', 'Необходима авторизация'));
				toast.dismiss(loadingToast);
				return;
			}

			// Вызываем Edge Function для создания PDF
			const response = await fetch(API_URLS.BOOKS_RENDER_PUPPETEER, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${session.access_token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					bookId: book.id,
				}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error('[BOOKS-LIBRARY] PDF creation failed:', response.status, errorText);
				throw new Error(`HTTP ${response.status}: ${errorText}`);
			}

			const result = await response.json();

			if (!result.success) {
				throw new Error(result.error || 'Не удалось создать PDF');
			}

			toast.dismiss(loadingToast);
			toast.success(t('books.pdf_created', 'PDF книга создана!'));

			// ✅ FIX: Обновляем список книг для отображения нового статуса
			await fetchBooks();

			// ✅ FIX: Если PDF доступен, сразу открываем его для просмотра
			if (result.pdfUrl) {
				// Проверяем доступность PDF с небольшой задержкой
				setTimeout(async () => {
					try {
						const checkResponse = await fetch(result.pdfUrl, { method: 'HEAD' });
						if (checkResponse.ok) {
							const bookTitle = book.storyJson?.title || 'book';
							const safeTitle = bookTitle.replace(/[^a-zа-яё0-9\s-]/gi, '').trim() || 'book';
							const fileName = `${safeTitle}_${formatPeriod(book.periodStart, book.periodEnd).replace(/\s/g, '_')}.pdf`;

							setViewingPdfFileName(fileName);
							setViewingPdfUrl(result.pdfUrl);
						}
					} catch (error) {
						console.warn('[BOOKS-LIBRARY] PDF not yet available for viewing:', error);
					}
				}, 1000);
			}

			// ✅ FIX: Ждем немного, чтобы PDF успел стать доступным в Storage
			// Затем проверяем доступность перед открытием модального окна
			if (result.pdfUrl) {
				const bookTitle = book.storyJson?.title || 'book';
				const safeTitle = bookTitle.replace(/[^a-zа-яё0-9\s-]/gi, '').trim() || 'book';
				const fileName = `${safeTitle}_${formatPeriod(book.periodStart, book.periodEnd).replace(/\s/g, '_')}.pdf`;

				// Ждем 1 секунду и проверяем доступность PDF с retry
				await new Promise((resolve) => setTimeout(resolve, 1000));

				// Проверяем доступность PDF с retry (до 3 попыток)
				let isAvailable = false;
				for (let attempt = 0; attempt < 3; attempt++) {
					try {
						const checkResponse = await fetch(result.pdfUrl, { method: 'HEAD' });
						if (checkResponse.ok) {
							isAvailable = true;
							break;
						}
					} catch (error) {
						console.warn(
							`[BOOKS-LIBRARY] PDF availability check attempt ${attempt + 1} failed:`,
							error
						);
					}

					// Ждем перед следующей попыткой
					if (attempt < 2) {
						await new Promise((resolve) => setTimeout(resolve, 1000));
					}
				}

				if (isAvailable) {
					setViewingPdfFileName(fileName);
					setViewingPdfUrl(result.pdfUrl);
				} else {
					toast.warning(
						t(
							'books.pdf_check_warning',
							'PDF создан, но еще не доступен. Попробуйте открыть через несколько секунд.'
						)
					);
				}
			}
		} catch (error) {
			console.error('[BOOKS-LIBRARY] Error creating PDF:', error);
			toast.error(
				t('books.pdf_creation_error', 'Произошла ошибка при создании PDF. Попробуйте позже.')
			);
		}
	};

	// ✅ Handle download - скачивает PDF файл на ПК и мобильных устройствах
	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: необходимо обработать Web Share API и fallback
	const handleDownload = async (book: BookDraft, event?: React.MouseEvent) => {
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}

		console.log('[BOOKS-LIBRARY] handleDownload called:', {
			bookId: book.id,
			pdfUrl: book.pdfUrl,
			isFinal: book.isFinal,
		});

		// ✅ FIX: Если книга готова, но pdfUrl отсутствует, пытаемся получить URL из Storage
		let pdfUrl = book.pdfUrl;
		if (!pdfUrl && book.isFinal && userId) {
			console.log('[BOOKS-LIBRARY] PDF URL missing, trying to generate from Storage...');
			const supabase = createClient();
			const { data: urlData } = supabase.storage
				.from('books')
				.getPublicUrl(`${userId}/${book.id}.pdf`);
			pdfUrl = urlData.publicUrl;
			console.log('[BOOKS-LIBRARY] Generated PDF URL from Storage:', pdfUrl);

			// Проверяем существование файла
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

				// Обновляем pdfUrl в БД для будущих запросов
				await supabase.from('books_archive').update({ pdf_url: pdfUrl }).eq('id', book.id);
				console.log('[BOOKS-LIBRARY] Updated pdf_url in database');
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

		// ✅ FIX: Показываем индикатор загрузки
		const loadingToast = toast.loading(t('books.downloading', 'Скачивание PDF...'));

		try {
			// ✅ FIX: Скачиваем PDF через fetch с retry логикой (до 3 попыток)
			let response: Response | null = null;
			let blob: Blob | null = null;
			let lastError: Error | null = null;

			for (let attempt = 0; attempt < 3; attempt++) {
				try {
					console.log(`[BOOKS-LIBRARY] Download attempt ${attempt + 1}/3`);
					response = await fetch(pdfUrl, {
						method: 'GET',
						// ✅ FIX: Добавляем timeout для предотвращения зависания
						signal: AbortSignal.timeout(30000), // 30 секунд timeout
					});

					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}

					// Создаем blob из ответа
					blob = await response.blob();

					// ✅ FIX: Проверяем, что blob не пустой
					if (!blob || blob.size === 0) {
						throw new Error('PDF файл пустой');
					}

					console.log(`[BOOKS-LIBRARY] PDF downloaded successfully, size: ${blob.size} bytes`);
					break; // Успешно скачали, выходим из цикла
				} catch (error) {
					lastError = error instanceof Error ? error : new Error('Unknown error');
					console.warn(`[BOOKS-LIBRARY] Download attempt ${attempt + 1} failed:`, lastError);

					// Если это последняя попытка, выбрасываем ошибку
					if (attempt === 2) {
						throw lastError;
					}

					// Ждем перед следующей попыткой (экспоненциальная задержка)
					await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
				}
			}

			if (!blob) {
				throw new Error('Не удалось скачать PDF файл');
			}

			// Генерируем имя файла из названия книги
			const bookTitle = (book.storyJson as any)?.title || 'book';
			const safeTitle =
				String(bookTitle)
					.replace(/[^a-zа-яё0-9\s-]/gi, '')
					.trim() || 'book';
			const fileName = `${safeTitle}_${formatPeriod(book.periodStart, book.periodEnd).replace(
				/\s/g,
				'_'
			)}.pdf`;

			// Используем pdfUrl (может быть сгенерирован из Storage)
			console.log('[BOOKS-LIBRARY] Downloading PDF from:', pdfUrl);

			// ✅ Проверяем поддержку Web Share API для мобильных устройств
			if (
				navigator.share &&
				navigator.canShare?.({ files: [new File([blob], fileName, { type: 'application/pdf' })] })
			) {
				// Используем Web Share API для мобильных устройств
				try {
					await navigator.share({
						title: bookTitle,
						files: [new File([blob], fileName, { type: 'application/pdf' })],
					});
					toast.dismiss(loadingToast);
					toast.success(t('books.downloaded', 'PDF скачан успешно!'));
					return;
				} catch (shareError) {
					// Если пользователь отменил шаринг, просто выходим
					if (shareError instanceof Error && shareError.name === 'AbortError') {
						toast.dismiss(loadingToast);
						return;
					}
					// Если ошибка - продолжаем с обычным скачиванием
					console.warn(
						'[BOOKS-LIBRARY] Web Share API failed, falling back to download:',
						shareError
					);
				}
			}

			// ✅ Обычное скачивание для ПК и fallback для мобильных
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = fileName;
			link.style.display = 'none';

			// Добавляем ссылку в DOM, кликаем и удаляем
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			// Освобождаем память
			URL.revokeObjectURL(url);

			// ✅ FIX: Всегда закрываем loading toast перед показом результата
			toast.dismiss(loadingToast);
			toast.success(t('books.downloaded', 'PDF скачан успешно!'));
		} catch (error) {
			// ✅ FIX: Всегда закрываем loading toast даже при ошибке
			toast.dismiss(loadingToast);

			console.error('[BOOKS-LIBRARY] Error downloading PDF:', error);
			const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';

			// ✅ FIX: Показываем более детальное сообщение об ошибке
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
	};

	// Handle edit draft
	const handleEditDraft = (book: BookDraft) => {
		if (onEditDraft) {
			onEditDraft(book.id);
		} else {
			toast.info(t('books.edit_in_development', 'Функция редактирования в разработке'));
		}
	};

	// Handle delete button click
	const handleDeleteClick = (book: BookDraft) => {
		setBookToDelete(book);
		setShowDeleteConfirm(true);
	};

	// Handle delete confirmation
	const handleDeleteConfirm = async () => {
		if (!bookToDelete) return;

		try {
			setDeletingBookId(bookToDelete.id);

			// ✅ Use hook's delete function
			await deleteBookHook(bookToDelete.id);
		} catch (error) {
			console.error('[BOOKS-LIBRARY] Error:', error);
			toast.error(t('books.editor.error', 'Произошла ошибка'));
		} finally {
			setDeletingBookId(null);
			setShowDeleteConfirm(false);
			setBookToDelete(null);
		}
	};

	// Handle create new version from final book
	const _handleCreateNewVersion = async (book: BookDraft) => {
		if (!onEditDraft) return;

		// Простое подтверждение
		const confirmed = window.confirm(
			'Мы создадим копию текущей книги как новый черновик. Оригинальный PDF останется доступен.'
		);
		if (!confirmed) return;

		try {
			setCreatingVersionId(book.id);

			// ✅ Use hook's create new version function
			const newBookId = await createNewVersionHook(book.id);

			if (newBookId) {
				onEditDraft(newBookId);
			}
		} catch (error) {
			console.error('[BOOKS-LIBRARY] Error:', error);
			toast.error(t('books.editor.error', 'Произошла ошибка'));
		} finally {
			setCreatingVersionId(null);
		}
	};

	return (
		<div className="scrollbar-hide min-h-screen overflow-x-hidden bg-[var(--ios-bg-primary)] pb-20">
			{/* Header with Gradient Background */}
			<div className="relative overflow-hidden border-b border-border bg-[var(--ios-bg-primary)] p-4 text-[var(--ios-text-primary)] sm:p-6">
				{/* Gradient Orb */}
				<div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--ios-purple)]/10 blur-3xl" />
				<div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[var(--ios-blue)]/10 blur-3xl" />

				<div className="relative z-10 flex items-center gap-2 sm:gap-3">
					{onBack && (
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ios-bg-secondary)] backdrop-blur-sm transition-colors duration-300 hover:bg-accent"
							onClick={onBack}
							type="button"
						>
							<ArrowLeft className="h-5 w-5" strokeWidth={2} />
						</motion.button>
					)}
					<motion.div
						initial={{ rotate: -10, scale: 0.9 }}
						animate={{ rotate: 0, scale: 1 }}
						transition={{ type: 'spring', stiffness: 300, damping: 15 }}
						className="flex h-10 w-10 items-center justify-center rounded-full bg-card/20 backdrop-blur-sm sm:h-12 sm:w-12"
					>
						<BookOpen className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
					</motion.div>
					<div className="flex-1">
						<motion.h2
							initial={{ opacity: 0, y: 5 }}
							animate={{ opacity: 1, y: 0 }}
							className="text-lg sm:text-xl"
						>
							{t('books.library_title', 'Библиотека книг')}
						</motion.h2>
						<motion.p
							initial={{ opacity: 0, y: 5 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							className="text-muted-foreground text-xs sm:text-sm"
						>
							{t('books.library_subtitle', 'Твои персональные истории')}
						</motion.p>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="sticky top-0 z-20 border-border border-b bg-card/80 p-4 backdrop-blur-md">
				<div className="space-y-3">
					{/* Status Filter */}
					<div className="flex items-center gap-2">
						<File className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
						<div className="flex gap-2">
							<Button
								onClick={() => setFilter('all')}
								size="sm"
								variant={filter === 'all' ? 'default' : 'outline'}
								className="transition-all duration-300"
							>
								{t('books.filter.all', 'Все')}
							</Button>
							<Button
								onClick={() => setFilter('drafts')}
								size="sm"
								variant={filter === 'drafts' ? 'default' : 'outline'}
								className="transition-all duration-300"
							>
								{t('books.filter.drafts', 'Черновики')}
							</Button>
							<Button
								onClick={() => setFilter('final')}
								size="sm"
								variant={filter === 'final' ? 'default' : 'outline'}
								className="transition-all duration-300"
							>
								{t('books.filter.final', 'Готовые')}
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Books List */}
			<div className="p-4">
				{isLoading ? (
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<Card key={i} className="overflow-hidden">
								<CardHeader>
									<Skeleton className="h-6 w-3/4" />
									<Skeleton className="h-4 w-1/2" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-20 w-full" />
								</CardContent>
							</Card>
						))}
					</div>
				) : books.length === 0 ? (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5 }}
					>
						<Card className="border-dashed border-2 bg-card/50">
							<CardContent className="py-12 text-center">
								<motion.div
									animate={{
										y: [0, -10, 0],
									}}
									transition={{
										duration: 4,
										repeat: Number.POSITIVE_INFINITY,
										ease: 'easeInOut',
									}}
								>
									<BookOpen
										className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50"
										strokeWidth={1.5}
									/>
								</motion.div>
								<h3 className="mb-2 text-lg font-medium">
									{t('books.empty.title', 'Пока нет книг')}
								</h3>
								<p className="mb-6 text-muted-foreground text-sm">
									{t('books.empty.description', 'Создай свою первую книгу достижений')}
								</p>
								<Button onClick={onCreateBook} className="group relative overflow-hidden">
									<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />
									<Plus className="mr-2 h-4 w-4" strokeWidth={2} />
									{t('books.create', 'Создать книгу')}
								</Button>
							</CardContent>
						</Card>
					</motion.div>
				) : (
					<motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<AnimatePresence mode="popLayout">
							{books.map((book, index) => (
								<motion.div
									layout
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.9 }}
									transition={{ delay: index * 0.05 }}
									key={book.id}
									className="group relative flex h-40 flex-row overflow-hidden rounded-xl border border-border bg-card/50 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:bg-card/80 hover:border-[var(--ios-purple)]/30"
									role="button"
									tabIndex={0}
									onClick={(e) => {
										// ✅ FIX: Предотвращаем клик по карточке если кликнули по кнопке
										const target = e.target as HTMLElement;
										const button = target.closest('button');
										if (button) return;
										console.log('[BOOKS-LIBRARY] Card clicked (not button):', book.id);
									}}
								>
									{/* Book Spine / Cover Strip with Gradient */}
									<div
										className={`w-4 h-full transition-all duration-300 group-hover:w-5 ${
											book.style === 'warm_family'
												? 'bg-gradient-to-b from-[--ios-purple] to-[--ios-blue]'
												: book.style === 'biographical'
													? 'bg-gradient-to-b from-[--ios-blue] to-[--ios-green]'
													: 'bg-gradient-to-b from-[--ios-green] to-[--ios-yellow]'
										}`}
									/>

									{/* Content Area */}
									<div className="flex flex-1 flex-col p-4">
										{/* Header */}
										<div className="mb-2 flex items-start justify-between gap-2">
											<div className="min-w-0 flex-1">
												<h3 className="text-sm font-semibold leading-tight text-foreground line-clamp-2">
													{book.metadata.diaryEmoji || '📖'}{' '}
													{(book.storyJson as any)?.title || t('books.untitled', 'Без названия')}
												</h3>
												{(book.storyJson as any)?.dedication && (
													<div className="mb-2 text-xs text-muted-foreground italic">
														{(book.storyJson as any)?.dedication}
													</div>
												)}
												<div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
													<Calendar className="h-3 w-3" />
													{formatPeriod(book.periodStart, book.periodEnd)}
												</div>
											</div>

											{/* Status Badge */}
											<Badge
												className={`h-5 px-2 text-[10px] transition-colors ${
													book.isFinal
														? 'bg-[var(--ios-green)]/10 text-[var(--ios-green)] hover:bg-[var(--ios-green)]/20'
														: 'bg-secondary text-secondary-foreground'
												}`}
												variant="outline"
											>
												{book.isFinal
													? t('books.status.ready_short' as any, 'Готово')
													: t('books.status.draft_short' as any, 'Черновик')}
											</Badge>

											{/* 🆕 Offline Status Badge */}
											{book.isAvailableOffline && (
												<Badge
													className="h-5 px-2 text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
													variant="outline"
												>
													<Download className="h-2.5 w-2.5 mr-1" />
													Offline
												</Badge>
											)}
										</div>

										{/* Meta */}
										<div className="mb-auto space-y-1">
											{book.planType === 'premium' && book.style && (
												<div className="flex items-center gap-1 text-[10px] text-muted-foreground">
													<Sparkles className="h-3 w-3 text-[--ios-purple]" />
													<span>{getStyleLabel(book.style)}</span>
												</div>
											)}
											{book.version && book.version > 1 && (
												<div className="flex items-center gap-1 text-[10px] text-muted-foreground">
													<span className="rounded-sm bg-muted px-1">v{book.version}</span>
												</div>
											)}
										</div>

										{/* Actions */}
										<div className="relative z-10 mt-2 flex items-center justify-between gap-2 border-t border-border/50 pt-2 opacity-80 transition-opacity group-hover:opacity-100">
											<div className="flex items-center gap-1">
												{book.isFinal ? (
													<>
														<motion.button
															whileHover={{ scale: 1.1, color: 'var(--foreground)' }}
															whileTap={{ scale: 0.9 }}
															className="relative z-10 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md p-0 text-muted-foreground transition-colors hover:bg-accent"
															onClick={(e) => {
																e.preventDefault();
																e.stopPropagation();
																handleEditDraft(book);
															}}
															title={t('books.edit', 'Редактировать')}
															type="button"
														>
															<Edit className="h-3.5 w-3.5 pointer-events-none shrink-0" />
														</motion.button>
														<motion.button
															whileHover={{ scale: 1.1, color: 'var(--ios-purple)' }}
															whileTap={{ scale: 0.9 }}
															className="relative z-10 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md p-0 text-muted-foreground transition-colors hover:bg-accent"
															onClick={(e) => {
																e.preventDefault();
																e.stopPropagation();
																handleView(book, e);
															}}
															title={t('books.view', 'Просмотр')}
															type="button"
														>
															<Eye className="h-3.5 w-3.5 pointer-events-none shrink-0" />
														</motion.button>
														<motion.button
															whileHover={{ scale: 1.1, color: 'var(--ios-blue)' }}
															whileTap={{ scale: 0.9 }}
															className="relative z-10 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md p-0 text-muted-foreground transition-colors hover:bg-accent"
															onClick={(e) => {
																e.preventDefault();
																e.stopPropagation();
																handleDownload(book, e);
															}}
															title={t('books.download', 'Скачать')}
															type="button"
														>
															<Download className="h-3.5 w-3.5 pointer-events-none shrink-0" />
														</motion.button>
													</>
												) : (
													<Button
														variant="ghost"
														size="sm"
														className="h-7 px-2 text-xs font-normal"
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															handleEditDraft(book);
														}}
													>
														{t('books.continue_editing', 'Продолжить')}
													</Button>
												)}
											</div>

											<motion.button
												whileHover={{ scale: 1.1, color: 'var(--destructive)' }}
												whileTap={{ scale: 0.9 }}
												className="relative z-10 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md p-0 text-muted-foreground/50 transition-colors hover:bg-destructive/10"
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													handleDeleteClick(book);
												}}
												title={t('books.delete', 'Удалить')}
												type="button"
											>
												<Trash2 className="h-3.5 w-3.5 pointer-events-none shrink-0" />
											</motion.button>
										</div>
									</div>
								</motion.div>
							))}
						</AnimatePresence>
					</motion.div>
				)}
			</div>

			{/* PDF Viewer Modal */}
			{viewingPdfUrl && viewingPdfFileName && (
				<PDFViewer
					fileName={viewingPdfFileName}
					isOpen={!!viewingPdfUrl}
					onClose={() => {
						setViewingPdfUrl(null);
						setViewingPdfFileName(null);
					}}
					url={viewingPdfUrl}
				/>
			)}

			{/* Delete Confirmation Modal */}
			<BookDeleteConfirmModal
				bookTitle={
					(bookToDelete?.storyJson as any)?.title || t('books.untitled' as any, 'Без названия')
				}
				isOpen={showDeleteConfirm}
				onClose={() => {
					setShowDeleteConfirm(false);
					setBookToDelete(null);
				}}
				onConfirm={handleDeleteConfirm}
			/>
		</div>
	);
}
