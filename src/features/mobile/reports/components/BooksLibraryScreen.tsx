/**
 * Books Library Screen
 *
 * Displays user's PDF books library with filters and download options.
 *
 * @author UNITY Team
 * @date 2025-11-07
 */

import {
	AlertCircle,
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
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { createClient } from '@/utils/supabase/client';

type BookDraft = {
	id: string;
	userId: string;
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
};

export function BooksLibraryScreen({ onCreateBook, onBack, onEditDraft }: BooksLibraryScreenProps) {
	const [books, setBooks] = useState<BookDraft[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [filter, setFilter] = useState<'all' | 'drafts' | 'final'>('all');
	const [userId, setUserId] = useState<string | null>(null);
	const [deletingBookId, setDeletingBookId] = useState<string | null>(null);

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
					toast.error('Не удалось загрузить книги');
					return;
				}

				// Convert snake_case to camelCase
				const booksData: BookDraft[] = (data || []).map((book) => ({
					id: book.id,
					userId: book.user_id,
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
				toast.error('Произошла ошибка');
			} finally {
				setIsLoading(false);
			}
		};

		fetchBooks();
	}, [userId, filter]);

	// Format date range
	const formatPeriod = (start: string, end: string) => {
		const startDate = new Date(start);
		const endDate = new Date(end);
		return `${startDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}`;
	};

	// Get style label
	const getStyleLabel = (style: string) => {
		const labels = {
			warm_family: 'Семейная история',
			biographical: 'Биография',
			motivational: 'Мотивация',
		};
		return labels[style as keyof typeof labels] || style;
	};

	// Handle download
	const handleDownload = (book: BookDraft) => {
		if (!book.pdfUrl) {
			toast.error('PDF еще не сгенерирован');
			return;
		}

		window.open(book.pdfUrl, '_blank');
	};

	// Handle view
	const handleView = (book: BookDraft) => {
		if (!book.pdfUrl) {
			toast.info('Черновик еще не завершен');
			return;
		}

		window.open(book.pdfUrl, '_blank');
	};

	// Handle edit draft
	const handleEditDraft = (book: BookDraft) => {
		if (onEditDraft) {
			onEditDraft(book.id);
		} else {
			toast.info('Функция редактирования в разработке');
		}
	};

	// Handle delete book
	const handleDelete = async (book: BookDraft) => {
		try {
			setDeletingBookId(book.id);
			const supabase = createClient();

			// Delete from database
			const { error } = await supabase.from('books_archive').delete().eq('id', book.id);

			if (error) {
				console.error('[BOOKS-LIBRARY] Error deleting book:', error);
				toast.error('Не удалось удалить книгу');
				return;
			}

			// If has PDF, delete from storage
			if (book.pdfUrl) {
				const fileName = book.pdfUrl.split('/').pop();
				if (fileName) {
					const { error: storageError } = await supabase.storage
						.from('books')
						.remove([`${book.userId}/${fileName}`]);

					if (storageError) {
						console.error('[BOOKS-LIBRARY] Error deleting PDF:', storageError);
						// Don't show error to user, book is already deleted from DB
					}
				}
			}

			// Remove from local state
			setBooks((prev) => prev.filter((b) => b.id !== book.id));
			toast.success('Книга удалена');
		} catch (error) {
			console.error('[BOOKS-LIBRARY] Error:', error);
			toast.error('Произошла ошибка');
		} finally {
			setDeletingBookId(null);
		}
	};

	return (
		<div className="scrollbar-hide min-h-screen overflow-x-hidden bg-background pb-20">
			{/* Header */}
			<div className="bg-linear-to-r from-purple-600 to-blue-600 p-4 text-white sm:p-6">
				<div className="flex items-center gap-2 sm:gap-3">
					{onBack && (
						<button
							className="flex h-10 w-10 items-center justify-center rounded-full bg-card/20 backdrop-blur-sm transition-colors duration-300 hover:bg-card/30"
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
						<h2 className="text-lg sm:text-xl">Библиотека книг</h2>
						<p className="text-muted-foreground text-xs opacity-90 sm:text-sm">
							Твои персональные истории
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
							Все
						</Button>
						<Button
							onClick={() => setFilter('drafts')}
							size="sm"
							variant={filter === 'drafts' ? 'default' : 'outline'}
						>
							Черновики
						</Button>
						<Button
							onClick={() => setFilter('final')}
							size="sm"
							variant={filter === 'final' ? 'default' : 'outline'}
						>
							Готовые
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
							<h3 className="mb-2 text-lg">Пока нет книг</h3>
							<p className="mb-4 text-muted-foreground text-sm">
								Создай свою первую книгу достижений
							</p>
							<Button onClick={onCreateBook}>
								<Plus className="mr-2 h-4 w-4" strokeWidth={2} />
								Создать книгу
							</Button>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-4">
						{books.map((book) => (
							<Card className="transition-colors duration-300" key={book.id}>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<CardTitle className="flex items-center gap-2 text-base">
												{book.metadata.diaryEmoji || '📖'} {book.storyJson?.title || 'Без названия'}
											</CardTitle>
											<div className="mt-1 flex items-center gap-2 text-muted-foreground text-xs">
												<Calendar className="h-3 w-3" strokeWidth={2} />
												{formatPeriod(book.periodStart, book.periodEnd)}
											</div>
										</div>
										<Badge variant={book.isFinal ? 'default' : 'secondary'}>
											{book.isFinal ? 'Готово' : 'Черновик'}
										</Badge>
									</div>
								</CardHeader>
								<CardContent>
									<div className="mb-4 space-y-2">
										<div className="flex items-center gap-2 text-sm">
											<Sparkles className="h-4 w-4 text-purple-500" strokeWidth={2} />
											<span className="text-muted-foreground">{getStyleLabel(book.style)}</span>
										</div>
										{book.metadata.entriesCount && (
											<div className="text-muted-foreground text-sm">
												📝 {book.metadata.entriesCount} записей
											</div>
										)}
										{book.metadata.pages && (
											<div className="text-muted-foreground text-sm">
												📄 {book.metadata.pages} страниц
											</div>
										)}
									</div>

									<div className="space-y-2">
										{/* Action buttons */}
										<div className="flex gap-2">
											{book.isFinal && book.pdfUrl ? (
												<>
													<Button
														className="flex-1"
														onClick={() => handleView(book)}
														variant="outline"
													>
														<Eye className="mr-2 h-4 w-4" strokeWidth={2} />
														Просмотр
													</Button>
													<Button className="flex-1" onClick={() => handleDownload(book)}>
														<Download className="mr-2 h-4 w-4" strokeWidth={2} />
														Скачать
													</Button>
												</>
											) : (
												<Button
													className="w-full"
													onClick={() => handleEditDraft(book)}
													variant="outline"
												>
													<Edit className="mr-2 h-4 w-4" strokeWidth={2} />
													Редактировать черновик
												</Button>
											)}
										</div>

										{/* Delete button */}
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													className="w-full transition-colors duration-300"
													disabled={deletingBookId === book.id}
													size="sm"
													variant="ghost"
												>
													<Trash2 className="mr-2 h-4 w-4 text-red-500" strokeWidth={2} />
													<span className="text-red-500">
														{deletingBookId === book.id ? 'Удаление...' : 'Удалить книгу'}
													</span>
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent className="mx-auto max-w-[90vw] sm:max-w-md">
												<AlertDialogHeader>
													<AlertDialogTitle className="flex items-center gap-2">
														<AlertCircle className="h-5 w-5 text-red-500" strokeWidth={2} />
														Удалить книгу?
													</AlertDialogTitle>
													<AlertDialogDescription>
														{book.isFinal ? (
															<>
																Это действие нельзя отменить. Книга{' '}
																<strong>"{book.storyJson?.title || 'Без названия'}"</strong> и PDF
																файл будут удалены навсегда.
															</>
														) : (
															<>
																Черновик{' '}
																<strong>"{book.storyJson?.title || 'Без названия'}"</strong> будет
																удален. Вы сможете создать новую книгу в любое время.
															</>
														)}
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Отмена</AlertDialogCancel>
													<AlertDialogAction
														className="bg-red-500 transition-colors duration-300 hover:bg-red-600"
														onClick={() => handleDelete(book)}
													>
														Удалить
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
