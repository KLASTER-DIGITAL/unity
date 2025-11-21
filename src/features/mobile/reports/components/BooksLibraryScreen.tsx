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
	Book,
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
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useTranslation } from '@/shared/lib/i18n';
import { createClient } from '@/utils/supabase/client';
import { BookDeleteConfirmModal } from './BookDeleteConfirmModal';

type BookDraft = {
	id: string;
	userId: string;
	parentBookId?: string | null;
	version?: number | null;
	periodStart: string;
	periodEnd: string;
	contexts: string[];
	style: 'warm_family' | 'biographical' | 'motivational';
	layout: 'photo_text' | 'text_only' | 'minimal';
	theme: 'light' | 'dark';
	pdfUrl?: string;
	storyJson: any;
	metadata: {
		entriesCount?: number;
		achievementsCount?: number;
		tokensUsed?: number;
		diaryName?: string;
		diaryEmoji?: string;
		pages?: number;
		wordCount?: number;
	};
	isDraft: boolean;
	isFinal: boolean;
	createdAt: string;
	updatedAt: string;
};

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
	const [books, setBooks] = useState<BookDraft[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [filter, setFilter] = useState<'all' | 'drafts' | 'final'>('all');
	const [userId, setUserId] = useState<string | null>(null);
	const [deletingBookId, setDeletingBookId] = useState<string | null>(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [bookToDelete, setBookToDelete] = useState<BookDraft | null>(null);
	const [creatingVersionId, setCreatingVersionId] = useState<string | null>(null);

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

	// Fetch books
	useEffect(() => {
		if (!userId) return;

		const fetchBooks = async () => {
			try {
				setIsLoading(true);
				const supabase = createClient();

				let query = supabase
					.from('books_archive')
					.select('*')
					.eq('user_id', userId)
					.order('created_at', { ascending: false });

				if (filter === 'drafts') {
					query = query.eq('is_draft', true);
				} else if (filter === 'final') {
					query = query.eq('is_final', true);
				}

				const { data, error } = await query;

				if (error) {
					console.error('[BOOKS-LIBRARY] Error fetching books:', error);
					toast.error(t('books.load_error', 'Не удалось загрузить книги'));
					return;
				}

				// Convert snake_case to camelCase
				const booksData: BookDraft[] = (data || []).map((book) => ({
					id: book.id,
					userId: book.user_id,
					parentBookId: (book as { parent_book_id?: string | null }).parent_book_id ?? null,
					version: (book as { version?: number | null }).version ?? 1,
					periodStart: book.period_start,
					periodEnd: book.period_end,
					contexts: book.contexts || [],
					style: book.style,
					layout: book.layout,
					theme: book.theme,
					pdfUrl: book.pdf_url,
					storyJson: book.story_json,
					metadata: book.metadata || {},
					isDraft: book.is_draft,
					isFinal: book.is_final,
					createdAt: book.created_at,
					updatedAt: book.updated_at,
				}));

				setBooks(booksData);
			} catch (error) {
				console.error('[BOOKS-LIBRARY] Error:', error);
				toast.error(t('books.editor.error', 'Произошла ошибка'));
			} finally {
				setIsLoading(false);
			}
		};

		fetchBooks();
	}, [userId, filter, refreshKey]); // ✅ Добавлен refreshKey для принудительного обновления

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

	// Handle download
	const handleDownload = (book: BookDraft) => {
		if (!book.pdfUrl) {
			toast.error(t('books.pdf_not_ready', 'PDF еще не сгенерирован'));
			return;
		}

		window.open(book.pdfUrl, '_blank');
	};

	// Handle view
	const handleView = (book: BookDraft) => {
		if (!book.pdfUrl) {
			toast.info(t('books.draft_not_completed', 'Черновик еще не завершен'));
			return;
		}

		window.open(book.pdfUrl, '_blank');
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
			const supabase = createClient();

			// Delete from database
			const { error } = await supabase.from('books_archive').delete().eq('id', bookToDelete.id);

			if (error) {
				console.error('[BOOKS-LIBRARY] Error deleting book:', error);
				toast.error(t('books.delete_error', 'Не удалось удалить книгу'));
				return;
			}

			// If has PDF, delete from storage
			if (bookToDelete.pdfUrl) {
				const fileName = bookToDelete.pdfUrl.split('/').pop();
				if (fileName) {
					const { error: storageError } = await supabase.storage
						.from('books')
						.remove([`${bookToDelete.userId}/${fileName}`]);

					if (storageError) {
						console.error('[BOOKS-LIBRARY] Error deleting PDF:', storageError);
						// Don't show error to user, book is already deleted from DB
					}
				}
			}

			// Remove from local state
			setBooks((prev) => prev.filter((b) => b.id !== bookToDelete.id));
			toast.success(t('books.delete_success', 'Книга удалена'));
		} catch (error) {
			console.error('[BOOKS-LIBRARY] Error:', error);
			toast.error(t('books.editor.error', 'Произошла ошибка'));
		} finally {
			setDeletingBookId(null);
			setBookToDelete(null);
		}
	};

	// Handle create new version from final book
	const handleCreateNewVersion = async (book: BookDraft) => {
		if (!onEditDraft) return;

		// Простое подтверждение, чтобы объяснить пользователю, что оригинал останется
		const confirmed = window.confirm(
			'Мы создадим копию текущей книги как новый черновик. Оригинальный PDF останется доступен.'
		);
		if (!confirmed) return;

		try {
			setCreatingVersionId(book.id);
			const supabase = createClient();

			const { data, error } = await supabase
				.from('books_archive')
				.insert({
					user_id: book.userId,
					parent_book_id: book.parentBookId || book.id,
					version: (book.version ?? 1) + 1,
					period_start: book.periodStart,
					period_end: book.periodEnd,
					contexts: book.contexts,
					style: book.style,
					layout: book.layout,
					theme: book.theme,
					metadata: book.metadata,
					story_json: book.storyJson,
					is_draft: true,
					is_final: false,
					pdf_url: null,
				})
				.select('id')
				.single();

			if (error || !data) {
				console.error('[BOOKS-LIBRARY] Error creating new version:', error);
				toast.error(t('books.version_error', 'Не удалось создать новую версию книги'));
				return;
			}

			toast.success(t('books.version_created', 'Создан новый черновик книги'));
			onEditDraft(data.id);
		} catch (error) {
			console.error('[BOOKS-LIBRARY] Error:', error);
			toast.error(t('books.editor.error', 'Произошла ошибка'));
		} finally {
			setCreatingVersionId(null);
		}
	};

	return (
		<div className="scrollbar-hide min-h-screen overflow-x-hidden bg-(--ios-bg-primary) pb-20">
			{/* Header */}
			<div className="border-b border-border bg-(--ios-bg-primary) p-4 text-(--ios-text-primary) sm:p-6">
				<div className="flex items-center gap-2 sm:gap-3">
					{onBack && (
						<button
							className="flex h-10 w-10 items-center justify-center rounded-full bg-(--ios-bg-secondary) backdrop-blur-sm transition-colors duration-300 hover:bg-accent"
							onClick={onBack}
							type="button"
						>
							<ArrowLeft className="h-5 w-5" strokeWidth={2} />
						</button>
					)}
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-card/20 backdrop-blur-sm sm:h-12 sm:w-12">
						<Book className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
					</div>
					<div className="flex-1">
						<h2 className="text-lg sm:text-xl">{t('books.library_title', 'Библиотека книг')}</h2>
						<p className="text-muted-foreground text-xs opacity-90 sm:text-sm">
							{t('books.library_subtitle', 'Твои персональные истории')}
						</p>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="border-border border-b bg-card p-4">
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
							<Book className="mx-auto mb-4 h-12 w-12 text-muted-foreground" strokeWidth={1.5} />
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
						{books.map((book) => (
							<div
								className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md"
								key={book.id}
							>
								{/* Book Cover Area */}
								<div className="relative flex items-center justify-center overflow-hidden bg-muted/30 p-4 sm:p-6">
									{/* Background pattern based on style */}
									<div
										className={`absolute inset-0 opacity-10 ${
											book.style === 'warm_family'
												? 'bg-[radial-gradient(circle_at_center,_var(--ios-purple),_transparent_70%)]'
												: book.style === 'biographical'
													? 'bg-[radial-gradient(circle_at_center,_var(--ios-blue),_transparent_70%)]'
													: 'bg-[radial-gradient(circle_at_center,_var(--ios-green),_transparent_70%)]'
										}`}
									/>

									{/* Book Cover */}
									<div className="relative z-10 flex aspect-[3/4] w-24 flex-col items-center justify-center rounded-md bg-card p-2 text-center shadow-lg transition-transform duration-300 group-hover:scale-105 sm:w-32">
										<div className="mb-2 text-2xl sm:text-3xl">
											{book.metadata.diaryEmoji || '📖'}
										</div>
										<div className="line-clamp-2 text-[10px] font-medium leading-tight text-foreground sm:text-xs">
											{book.storyJson?.title || t('books.untitled', 'Без названия')}
										</div>
										{book.version && book.version > 1 && (
											<div className="mt-1 rounded-full bg-muted px-1.5 py-0.5 text-[8px] font-bold text-muted-foreground">
												v{book.version}
											</div>
										)}
									</div>

									{/* Status Badge */}
									<div className="absolute top-3 right-3">
										<Badge className="shadow-sm" variant={book.isFinal ? 'default' : 'secondary'}>
											{book.isFinal
												? t('books.status.ready_short', 'Готово')
												: t('books.status.draft_short', 'Черновик')}
										</Badge>
									</div>
								</div>

								{/* Book Details */}
								<div className="flex flex-1 flex-col p-4">
									<div className="mb-3">
										<div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
											<Calendar className="h-3 w-3" />
											{formatPeriod(book.periodStart, book.periodEnd)}
										</div>
										<h3 className="line-clamp-1 font-medium text-base">
											{book.storyJson?.title || t('books.untitled', 'Без названия')}
										</h3>
									</div>

									<div className="mb-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
										<div className="flex items-center gap-1.5">
											<Sparkles className="h-3 w-3 text-[--ios-purple]" />
											<span className="truncate">{getStyleLabel(book.style)}</span>
										</div>
										{book.metadata.entriesCount && (
											<div className="flex items-center gap-1.5">
												<span className="text-base">📝</span>
												<span>{book.metadata.entriesCount}</span>
											</div>
										)}
										{book.metadata.pages && (
											<div className="flex items-center gap-1.5">
												<span className="text-base">📄</span>
												<span>{book.metadata.pages} стр.</span>
											</div>
										)}
										{book.metadata.achievementsCount && (
											<div className="flex items-center gap-1.5">
												<span className="text-base">🏆</span>
												<span>{book.metadata.achievementsCount}</span>
											</div>
										)}
									</div>

									<div className="mt-auto space-y-2">
										{/* Primary Actions */}
										<div className="grid grid-cols-2 gap-2">
											{book.isFinal && book.pdfUrl ? (
												<>
													<Button
														className="h-8"
														onClick={() => handleView(book)}
														size="sm"
														variant="outline"
													>
														<Eye className="mr-1.5 h-3.5 w-3.5" />
														{t('books.view', 'Просмотр')}
													</Button>
													<Button
														className="h-8 bg-[--ios-purple] text-white hover:bg-[--ios-purple]/90"
														onClick={() => handleDownload(book)}
														size="sm"
													>
														<Download className="mr-1.5 h-3.5 w-3.5" />
														{t('books.download', 'Скачать')}
													</Button>
												</>
											) : (
												<Button
													className="col-span-2 h-8"
													onClick={() => handleEditDraft(book)}
													size="sm"
													variant="outline"
												>
													<Edit className="mr-1.5 h-3.5 w-3.5" />
													{t('books.edit_draft', 'Редактировать')}
												</Button>
											)}
										</div>

										{/* Secondary Actions (Edit version / Delete) */}
										<div className="flex items-center justify-between border-t border-border/50 pt-1">
											{book.isFinal ? (
												<Button
													className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
													disabled={creatingVersionId === book.id}
													onClick={() => handleCreateNewVersion(book)}
													size="sm"
													variant="ghost"
												>
													<Edit className="mr-1.5 h-3 w-3" />
													{creatingVersionId === book.id
														? 'Создание...'
														: t('books.new_version', 'Новая версия')}
												</Button>
											) : (
												<div /> /* Spacer */
											)}

											<Button
												className="h-7 px-2 text-destructive text-xs hover:bg-destructive/10 hover:text-destructive/80"
												disabled={deletingBookId === book.id}
												onClick={() => handleDeleteClick(book)}
												size="sm"
												variant="ghost"
											>
												<Trash2 className="h-3.5 w-3.5" />
											</Button>
										</div>
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
		</div>
	);
}
