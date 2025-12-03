// Fix Vercel PDF render typings and local fonts
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

// ✅ Define StoryJson type if missing
type StoryJson = {
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
	} = useBooksList(userId);

	// ✅ FIX: Refetch when refreshKey changes or component mounts
	useEffect(() => {
		if (userId) {
			// ✅ FIX: Всегда вызываем fetchBooks при изменении refreshKey или userId
			// Важно: вызываем fetchBooks() даже если компонент был скрыт и снова показан
			console.log('[BOOKS-LIBRARY] Refreshing books list, refreshKey:', refreshKey);
			fetchBooks();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [refreshKey, userId, fetchBooks]); // ✅ FIX: Убираем fetchBooks из зависимостей, чтобы избежать лишних вызовов

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
				// biome-ignore lint/suspicious/noExplicitAny: Dynamic translation key
				return t('books.style.warm_family' as any, 'Семейная история');
			case 'biographical':
				// biome-ignore lint/suspicious/noExplicitAny: Dynamic translation key
				return t('books.style.biographical' as any, 'Биография');
			case 'motivational':
				// biome-ignore lint/suspicious/noExplicitAny: Dynamic translation key
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

			// ✅ FIX: Сначала проверяем существование файла
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

				// ✅ FIX: Используем signed URL вместо public URL (более надежно)
				const { data: signedUrlData, error: signedUrlError } = await supabase.storage
					.from('books')
					.createSignedUrl(`${userId}/${book.id}.pdf`, 3600); // 1 час

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

				console.log('[BOOKS-LIBRARY] Generated PDF URL from Storage:', pdfUrl);

				// Обновляем pdfUrl в БД для будущих запросов (сохраняем public URL для совместимости)
				const { data: publicUrlData } = supabase.storage
					.from('books')
					.getPublicUrl(`${userId}/${book.id}.pdf`);
				await supabase
					.from('books_archive')
					.update({ pdf_url: publicUrlData.publicUrl })
					.eq('id', book.id);
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

		// ✅ FIX: Проверяем, что pdfUrl валидный перед открытием
		if (!pdfUrl || pdfUrl === 'undefined' || pdfUrl === 'null') {
			console.error('[BOOKS-LIBRARY] Invalid PDF URL:', pdfUrl);
			toast.error(t('books.pdf_invalid_url', 'Неверный URL PDF файла'));
			return;
		}

		// Генерируем имя файла для отображения
		const bookTitle = (book.storyJson as { title?: string })?.title || 'book';
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

			console.log('[BOOKS-LIBRARY] Generating PDF client-side...');

			// Динамически импортируем компоненты для PDF
			const { pdf, Font } = await import('@react-pdf/renderer');
			const { BookPDFDocument } = await import('./BookPDFDocument');

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

			// Создаем PDF документ
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
					metadata={book.metadata as { diaryEmoji?: string }}
					bookStyle={book.style || 'warm_family'} // ✅ Updated prop name
					theme={book.theme || 'light'}
				/>
			);

			// Генерируем blob
			const blob = await pdf(pdfDoc).toBlob();

			// ✅ Validate blob before upload
			if (!blob || blob.size === 0) {
				toast.dismiss(loadingToast);
				throw new Error('PDF blob is empty or invalid. Please try again.');
			}

			console.log('[BOOKS-LIBRARY] PDF blob generated:', {
				size: blob.size,
				type: blob.type,
				sizeKB: Math.round(blob.size / 1024),
			});

			// Загружаем в Supabase Storage
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

			// Получаем публичный URL
			const { data: urlData } = supabase.storage.from('books').getPublicUrl(fileName);
			const pdfUrl = urlData.publicUrl;

			// Обновляем базу данных
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

			// Обновляем список книг
			await fetchBooks();

			// Показываем PDF в модальном окне через некоторое время
			setTimeout(() => {
				try {
					const bookTitle = (book.storyJson as { title?: string })?.title || 'book';
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

			// ✅ FIX: Сначала проверяем существование файла
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

				// ✅ FIX: Используем signed URL вместо public URL (более надежно)
				const { data: signedUrlData, error: signedUrlError } = await supabase.storage
					.from('books')
					.createSignedUrl(`${userId}/${book.id}.pdf`, 3600); // 1 час

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

				console.log('[BOOKS-LIBRARY] Generated PDF URL from Storage:', pdfUrl);

				// Обновляем pdfUrl в БД для будущих запросов (сохраняем public URL для совместимости)
				const { data: publicUrlData } = supabase.storage
					.from('books')
					.getPublicUrl(`${userId}/${book.id}.pdf`);
				await supabase
					.from('books_archive')
					.update({ pdf_url: publicUrlData.publicUrl })
					.eq('id', book.id);
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
			const bookTitle = (book.storyJson as { title?: string })?.title || 'book';
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
			// ✅ FIX: Проверяем доступность File constructor перед использованием
			if (typeof File !== 'undefined' && navigator.share) {
				try {
					// biome-ignore lint/suspicious/noExplicitAny: File constructor might not be typed in RN environment
					const pdfFile = new (File as any)([blob], fileName, { type: 'application/pdf' });
					if (navigator.canShare?.({ files: [pdfFile] })) {
						// Используем Web Share API для мобильных устройств
						await navigator.share({
							title: bookTitle,
							files: [pdfFile],
						});
						toast.dismiss(loadingToast);
						toast.success(t('books.downloaded', 'PDF скачан успешно!'));
						return;
					}
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
					{onCreateBook && (
						<motion.div
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.2 }}
						>
							<Button
								onClick={onCreateBook}
								size="icon"
								variant="ghost"
								className="h-10 w-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
							>
								<Plus className="h-6 w-6" strokeWidth={2.5} />
							</Button>
						</motion.div>
					)}
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
													{(book.metadata as { diaryEmoji?: string })?.diaryEmoji || '📖'}{' '}
													{(book.storyJson as unknown as StoryJson)?.title ||
														t('books.untitled', 'Без названия')}
												</h3>
												{(book.storyJson as unknown as StoryJson)?.dedication && (
													<div className="mb-2 text-xs text-muted-foreground italic">
														{(book.storyJson as unknown as StoryJson)?.dedication}
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
													? t('books.status.ready_short', 'Готово')
													: t('books.status.draft_short', 'Черновик')}
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
					pdfUrl={viewingPdfUrl}
				/>
			)}

			{/* Delete Confirmation Modal */}
			<BookDeleteConfirmModal
				bookTitle={
					(bookToDelete?.storyJson as unknown as StoryJson)?.title ||
					t('books.untitled', 'Без названия')
				}
				isFinal={bookToDelete?.isFinal}
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
