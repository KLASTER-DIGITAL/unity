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
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
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
	const handleCreateNewVersion = async (book: BookDraft) => {
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
								className="group relative flex h-40 flex-row overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md"
								key={book.id}
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
											<h3 className="line-clamp-2 text-sm font-medium leading-tight text-foreground">
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

									{/* Meta */}
									<div className="mb-auto flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
										{/* Plan Type Badge */}
										<Badge
											className="h-4 px-1.5 text-[9px]"
											variant={book.planType === 'premium' ? 'default' : 'outline'}
										>
											{book.planType === 'premium' ? (
												<>
													<Sparkles className="mr-1 h-2.5 w-2.5" />
													Premium
												</>
											) : (
												'FREE'
											)}
										</Badge>
										{/* Style */}
										{book.planType === 'premium' && book.style && (
											<div className="flex items-center gap-1">
												<Sparkles className="h-3 w-3 text-[--ios-purple]" />
												<span className="truncate max-w-[80px]">{getStyleLabel(book.style)}</span>
											</div>
										)}
										{/* Version */}
										{book.version && book.version > 1 && (
											<div className="flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 font-medium">
												<span>v{book.version}</span>
											</div>
										)}
									</div>

									{/* Actions */}
									<div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2">
										<div className="flex items-center gap-2">
											{book.isFinal && book.pdfUrl ? (
												<>
													<Button
														className="h-7 w-7 p-0"
														onClick={() => handleView(book)}
														size="sm"
														variant="ghost"
														title={t('books.view', 'Просмотр')}
													>
														<Eye className="h-4 w-4 text-[--ios-purple]" />
													</Button>
													<Button
														className="h-7 w-7 p-0"
														onClick={() => handleDownload(book)}
														size="sm"
														variant="ghost"
														title={t('books.download', 'Скачать')}
													>
														<Download className="h-4 w-4 text-[--ios-purple]" />
													</Button>
												</>
											) : (
												<Button
													className="h-7 px-2 text-xs"
													onClick={() => handleEditDraft(book)}
													size="sm"
													variant="outline"
												>
													<Edit className="mr-1.5 h-3 w-3" />
													{t('books.edit_draft', 'Редактировать')}
												</Button>
											)}
										</div>

										<div className="flex items-center gap-1">
											{book.isFinal && (
												<Button
													className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
													disabled={creatingVersionId === book.id}
													onClick={() => handleCreateNewVersion(book)}
													size="sm"
													variant="ghost"
													title={t('books.new_version', 'Новая версия')}
												>
													<Edit className="h-3.5 w-3.5" />
												</Button>
											)}
											<Button
												className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
												disabled={deletingBookId === book.id}
												onClick={() => handleDeleteClick(book)}
												size="sm"
												variant="ghost"
												title={t('common.delete', 'Удалить')}
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
