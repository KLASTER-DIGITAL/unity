/**
 * Books Library Screen
 *
 * Displays user's PDF books library with filters and download options.
 *
 * @author UNITY Team
 * @date 2025-11-07
 */

import {
	ArrowLeft,
	Book as BookIcon,
	Calendar,
	Download,
	Edit,
	Eye,
	Filter,
	Plus,
	Sparkles,
	Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PDFViewer } from '@/shared/components/PDFViewer';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { API_URLS } from '@/shared/lib/api/config/urls';
import { useTranslation } from '@/shared/lib/i18n';
import { createClient } from '@/utils/supabase/client';
import { type Book, useBooksList } from '../hooks/useBooksList';
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
	const [deletingBookId, setDeletingBookId] = useState<string | null>(null);
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
		if (refreshKey > 0) {
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
				return t('books.style.warm_family', 'Семейная история');
			case 'biographical':
				return t('books.style.biographical', 'Биография');
			case 'motivational':
				return t('books.style.motivational', 'Мотивация');
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
			// Если PDF недоступен после всех попыток, предлагаем создать его заново
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

		// Генерируем имя файла для отображения
		const bookTitle = book.storyJson?.title || 'book';
		const safeTitle = bookTitle.replace(/[^a-zа-яё0-9\s-]/gi, '').trim() || 'book';
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

			// Обновляем список книг
			await fetchBooks();

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

		try {
			// Показываем индикатор загрузки
			const loadingToast = toast.loading(t('books.downloading', 'Скачивание PDF...'));

			// Скачиваем PDF через fetch
			const response = await fetch(pdfUrl);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			// Создаем blob из ответа
			const blob = await response.blob();

			// Генерируем имя файла из названия книги
			const bookTitle = book.storyJson?.title || 'book';
			const safeTitle = bookTitle.replace(/[^a-zа-яё0-9\s-]/gi, '').trim() || 'book';
			const fileName = `${safeTitle}_${formatPeriod(book.periodStart, book.periodEnd).replace(/\s/g, '_')}.pdf`;

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

			toast.dismiss(loadingToast);
			toast.success(t('books.downloaded', 'PDF скачан успешно!'));
		} catch (error) {
			console.error('[BOOKS-LIBRARY] Error downloading PDF:', error);
			toast.error(t('books.download_error', 'Произошла ошибка при скачивании PDF'));
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
			{/* Header */}
			<div className="border-b border-border bg-[var(--ios-bg-primary)] p-4 text-[var(--ios-text-primary)] sm:p-6">
				<div className="flex items-center gap-2 sm:gap-3">
					{onBack && (
						<button
							className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ios-bg-secondary)] backdrop-blur-sm transition-colors duration-300 hover:bg-accent"
							onClick={onBack}
							type="button"
						>
							<ArrowLeft className="h-5 w-5" strokeWidth={2} />
						</button>
					)}
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-card/20 backdrop-blur-sm sm:h-12 sm:w-12">
						<BookIcon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
					</div>
					<div className="flex-1">
						<h2 className="text-lg sm:text-xl">{t('books.library_title', 'Библиотека книг')}</h2>
						<p className="text-muted-foreground text-xs sm:text-sm">
							{t('books.library_subtitle', 'Твои персональные истории')}
						</p>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="border-border border-b bg-card p-4">
				<div className="space-y-3">
					{/* Status Filter */}
					<div className="flex items-center gap-2">
						<Filter className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
						<div className="flex gap-2">
							<Button
								onClick={() => setFilter('all')}
								size="sm"
								variant={filter === 'all' ? 'default' : 'outline'}
							>
								{t('books.filter.all', 'Все')}
							</Button>
							<Button
								onClick={() => setFilter('drafts')}
								size="sm"
								variant={filter === 'drafts' ? 'default' : 'outline'}
							>
								{t('books.filter.drafts', 'Черновики')}
							</Button>
							<Button
								onClick={() => setFilter('final')}
								size="sm"
								variant={filter === 'final' ? 'default' : 'outline'}
							>
								{t('books.filter.final', 'Готовые')}
							</Button>
						</div>
					</div>

					{/* Убрали Plan Type Filter - это автоопределение тарифов */}
				</div>
			</div>

			{/* Books List */}
			<div className="p-4">
				{isLoading ? (
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<Card key={i}>
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
					<Card>
						<CardContent className="py-12 text-center">
							<BookIcon
								className="mx-auto mb-4 h-12 w-12 text-muted-foreground"
								strokeWidth={1.5}
							/>
							<h3 className="mb-2 text-lg">{t('books.empty.title', 'Пока нет книг')}</h3>
							<p className="mb-4 text-muted-foreground text-sm">
								{t('books.empty.description', 'Создай свою первую книгу достижений')}
							</p>
							<Button onClick={onCreateBook}>
								<Plus className="mr-2 h-4 w-4" strokeWidth={2} />
								{t('books.create', 'Создать книгу')}
							</Button>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{/* biome-ignore lint/complexity/noExcessiveCognitiveComplexity: book card rendering requires multiple conditional branches */}
						{books.map((book) => (
							<div
								className="group relative flex h-40 flex-row overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md"
								key={book.id}
								role="button"
								tabIndex={0}
								onClick={(e) => {
									// ✅ FIX: Предотвращаем клик по карточке если кликнули по кнопке
									// Проверяем, был ли клик по кнопке или её дочерним элементам
									const target = e.target as HTMLElement;
									const button = target.closest('button');
									if (button) {
										console.log(
											'[BOOKS-LIBRARY] Card onClick: button clicked, stopping propagation',
											{
												bookId: book.id,
												button: button,
												target: target,
											}
										);
										// НЕ вызываем stopPropagation здесь, так как кнопка уже должна была это сделать
										// Просто не обрабатываем клик по карточке
										return;
									}
									console.log('[BOOKS-LIBRARY] Card clicked (not button):', book.id);
								}}
							>
								{/* Book Spine / Cover Strip */}
								<div
									className={`w-3 h-full ${
										book.style === 'warm_family'
											? 'bg-gradient-to-b from-[--ios-purple] to-[--ios-blue]'
											: book.style === 'biographical'
												? 'bg-gradient-to-b from-[--ios-blue] to-[--ios-green]'
												: 'bg-gradient-to-b from-[--ios-green] to-[--ios-yellow]'
									}`}
								/>

								{/* Content Area */}
								<div className="flex flex-1 flex-col p-3">
									{/* Header */}
									<div className="mb-2 flex items-start justify-between gap-2">
										<div className="min-w-0 flex-1">
											{/* Полное название без сокращения */}
											<h3 className="text-sm font-medium leading-tight text-foreground">
												{book.metadata.diaryEmoji || '📖'}{' '}
												{book.storyJson?.title || t('books.untitled', 'Без названия')}
											</h3>
											<div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
												<Calendar className="h-3 w-3" />
												{formatPeriod(book.periodStart, book.periodEnd)}
											</div>
										</div>

										{/* Status Badge */}
										<Badge
											className="h-5 px-1.5 text-[10px]"
											variant={book.isFinal ? 'default' : 'secondary'}
										>
											{book.isFinal
												? t('books.status.ready_short', 'Готово')
												: t('books.status.draft_short', 'Черновик')}
										</Badge>
									</div>

									{/* Meta - перемещаем стиль (мотивация) в отдельную строку */}
									<div className="mb-auto space-y-1">
										{/* Стиль книги (мотивация, семейная история и т.д.) - отдельной строкой */}
										{book.planType === 'premium' && book.style && (
											<div className="flex items-center gap-1 text-[10px] text-muted-foreground">
												<Sparkles className="h-3 w-3 text-[--ios-purple]" />
												<span>{getStyleLabel(book.style)}</span>
											</div>
										)}
										{/* Version */}
										{book.version && book.version > 1 && (
											<div className="flex items-center gap-1 text-[10px] text-muted-foreground">
												<span>v{book.version}</span>
											</div>
										)}
									</div>

									{/* Actions - иконки для готовых книг: Редактировать, Просмотр, Скачать, Удалить */}
									{/* ✅ FIX: Добавлен relative z-10 для правильного z-index и pointer-events-auto */}
									<div className="relative z-10 mt-2 flex items-center justify-between gap-2 border-t border-border/50 pt-2">
										<div className="flex items-center gap-1.5">
											{/* Для готовых книг - показываем все иконки в ряд */}
											{book.isFinal ? (
												<>
													{/* Редактировать - всегда показываем */}
													<button
														className="relative z-10 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md p-0 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															console.log('[BOOKS-LIBRARY] Edit button clicked:', book.id);
															handleEditDraft(book);
														}}
														title={t('books.edit', 'Редактировать')}
														type="button"
													>
														<Edit className="h-3.5 w-3.5 pointer-events-none shrink-0" />
													</button>
													{/* Просмотр - показываем для готовых книг, даже если pdfUrl не установлен (проверим существование в handleView) */}
													{book.isFinal ? (
														<button
															className="relative z-10 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md p-0 text-muted-foreground transition-colors hover:bg-accent hover:text-[--ios-purple] disabled:pointer-events-none disabled:opacity-50"
															onClick={(e) => {
																console.log('[BOOKS-LIBRARY] View button onClick triggered:', {
																	bookId: book.id,
																	pdfUrl: book.pdfUrl,
																	isFinal: book.isFinal,
																	event: e,
																	target: e.target,
																	currentTarget: e.currentTarget,
																});
																e.preventDefault();
																e.stopPropagation();
																console.log('[BOOKS-LIBRARY] Calling handleView...');
																handleView(book, e);
																console.log('[BOOKS-LIBRARY] handleView called');
															}}
															onMouseDown={(_e) => {
																console.log('[BOOKS-LIBRARY] View button onMouseDown:', book.id);
															}}
															title={t('books.view', 'Просмотр')}
															type="button"
														>
															<Eye className="h-3.5 w-3.5 pointer-events-none shrink-0" />
														</button>
													) : (
														<button
															className="flex h-7 w-7 shrink-0 cursor-not-allowed items-center justify-center rounded-md p-0 text-muted-foreground/50 disabled:pointer-events-none disabled:opacity-50"
															disabled
															title={t('books.no_pdf', 'PDF не создан')}
															type="button"
														>
															<Eye className="h-3.5 w-3.5 pointer-events-none shrink-0" />
														</button>
													)}
													{/* Скачать - показываем для готовых книг, даже если pdfUrl не установлен (проверим существование в handleDownload) */}
													{book.isFinal ? (
														<button
															className="relative z-10 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md p-0 text-muted-foreground transition-colors hover:bg-accent hover:text-[--ios-purple] disabled:pointer-events-none disabled:opacity-50"
															onClick={(e) => {
																console.log('[BOOKS-LIBRARY] Download button onClick triggered:', {
																	bookId: book.id,
																	pdfUrl: book.pdfUrl,
																	isFinal: book.isFinal,
																	event: e,
																	target: e.target,
																	currentTarget: e.currentTarget,
																});
																e.preventDefault();
																e.stopPropagation();
																console.log('[BOOKS-LIBRARY] Calling handleDownload...');
																void handleDownload(book, e);
																console.log('[BOOKS-LIBRARY] handleDownload called');
															}}
															onMouseDown={(_e) => {
																console.log(
																	'[BOOKS-LIBRARY] Download button onMouseDown:',
																	book.id
																);
															}}
															title={t('books.download', 'Скачать')}
															type="button"
														>
															<Download className="h-3.5 w-3.5 pointer-events-none shrink-0" />
														</button>
													) : (
														<button
															className="flex h-7 w-7 shrink-0 cursor-not-allowed items-center justify-center rounded-md p-0 text-muted-foreground/50 disabled:pointer-events-none disabled:opacity-50"
															disabled
															title={t('books.no_pdf', 'PDF не создан')}
															type="button"
														>
															<Download className="h-3.5 w-3.5 pointer-events-none shrink-0" />
														</button>
													)}
													{/* Удалить - всегда показываем справа */}
												</>
											) : (
												/* Для черновиков - только Редактировать */
												<Button
													className="h-7 px-2 text-[10px]"
													onClick={(e) => {
														e.stopPropagation();
														handleEditDraft(book);
													}}
													size="sm"
													variant="outline"
													type="button"
												>
													<Edit className="mr-1 h-3 w-3" />
													Редактировать
												</Button>
											)}
										</div>

										{/* Удалить - всегда справа, для готовых книг иконка, для черновиков скрыта */}
										{book.isFinal && (
											<button
												className="relative z-10 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md p-0 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
												disabled={deletingBookId === book.id}
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													console.log('[BOOKS-LIBRARY] Delete button clicked:', book.id);
													handleDeleteClick(book);
												}}
												title={t('common.delete', 'Удалить')}
												type="button"
											>
												<Trash2 className="h-3.5 w-3.5 pointer-events-none shrink-0" />
											</button>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Delete Confirmation Modal */}
			<BookDeleteConfirmModal
				bookTitle={bookToDelete?.storyJson?.title}
				isFinal={bookToDelete?.isFinal || false}
				isOpen={showDeleteConfirm}
				onClose={() => {
					setShowDeleteConfirm(false);
					setBookToDelete(null);
				}}
				onConfirm={handleDeleteConfirm}
			/>

			{/* PDF Viewer Modal */}
			{viewingPdfUrl && (
				<PDFViewer
					fileName={viewingPdfFileName || undefined}
					isOpen={!!viewingPdfUrl}
					pdfUrl={viewingPdfUrl}
					onClose={() => {
						setViewingPdfUrl(null);
						setViewingPdfFileName(null);
					}}
				/>
			)}
		</div>
	);
}
