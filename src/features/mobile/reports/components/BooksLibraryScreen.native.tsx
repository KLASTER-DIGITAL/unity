/**
 * Books Library Screen (React Native)
 *
 * Displays user's PDF books library with filters and download options.
 *
 * @author UNITY Team
 * @date 2025-11-07
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { DesignTokens } from '@/shared/design-system/tokens';
import { supabase } from '@/shared/lib/api/supabase/client';
import { useAuth } from '@/shared/lib/hooks/useAuth';

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
};

export function BooksLibraryScreen({ onCreateBook }: BooksLibraryScreenProps) {
	const { user } = useAuth();
	const [books, setBooks] = useState<BookDraft[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [filter, setFilter] = useState<'all' | 'drafts' | 'final'>('all');

	// Fetch books
	const fetchBooks = async (refresh = false) => {
		if (!user?.id) return;

		try {
			if (refresh) {
				setIsRefreshing(true);
			} else {
				setIsLoading(true);
			}

			let query = supabase
				.from('books_archive')
				.select('*')
				.eq('user_id', user.id)
				.order('created_at', { ascending: false });

			if (filter === 'drafts') {
				query = query.eq('is_draft', true);
			} else if (filter === 'final') {
				query = query.eq('is_final', true);
			}

			const { data, error } = await query;

			if (error) {
				console.error('[BOOKS-LIBRARY] Error fetching books:', error);
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
		} finally {
			setIsLoading(false);
			setIsRefreshing(false);
		}
	};

	useEffect(() => {
		fetchBooks();
	}, [user?.id, filter]);

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
	const handleDownload = async (book: BookDraft) => {
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		// TODO: Implement PDF download for React Native
		console.log('[BOOKS-LIBRARY] Download book:', book.id);
	};

	// Handle filter change
	const handleFilterChange = async (newFilter: 'all' | 'drafts' | 'final') => {
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		setFilter(newFilter);
	};

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<View style={styles.headerContent}>
					<View style={styles.headerIcon}>
						<Ionicons color={DesignTokens.colors.card} name="book" size={24} />
					</View>
					<View style={styles.headerText}>
						<Text style={styles.headerTitle}>Библиотека книг</Text>
						<Text style={styles.headerSubtitle}>Твои персональные истории</Text>
					</View>
				</View>

				{/* Create Book Button */}
				<Pressable
					accessibilityLabel="Создать новую книгу"
					onPress={async () => {
						await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
						onCreateBook?.();
					}}
					style={({ pressed }) => [styles.createButton, pressed && styles.createButtonPressed]}
				>
					<Ionicons color={DesignTokens.colors.card} name="add" size={20} />
					<Text style={styles.createButtonText}>Создать новую книгу</Text>
				</Pressable>
			</View>

			{/* Filters */}
			<View style={styles.filters}>
				<Ionicons
					color={DesignTokens.colors.textSecondary}
					name="filter"
					size={16}
					style={styles.filterIcon}
				/>
				<View style={styles.filterButtons}>
					<Pressable
						onPress={() => handleFilterChange('all')}
						style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
					>
						<Text
							style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}
						>
							Все
						</Text>
					</Pressable>
					<Pressable
						onPress={() => handleFilterChange('drafts')}
						style={[styles.filterButton, filter === 'drafts' && styles.filterButtonActive]}
					>
						<Text
							style={[
								styles.filterButtonText,
								filter === 'drafts' && styles.filterButtonTextActive,
							]}
						>
							Черновики
						</Text>
					</Pressable>
					<Pressable
						onPress={() => handleFilterChange('final')}
						style={[styles.filterButton, filter === 'final' && styles.filterButtonActive]}
					>
						<Text
							style={[styles.filterButtonText, filter === 'final' && styles.filterButtonTextActive]}
						>
							Готовые
						</Text>
					</Pressable>
				</View>
			</View>

			{/* Books List */}
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				refreshControl={
					<RefreshControl onRefresh={() => fetchBooks(true)} refreshing={isRefreshing} />
				}
				style={styles.scrollView}
			>
				{isLoading ? (
					<View style={styles.loadingContainer}>
						<ActivityIndicator color={DesignTokens.colors.primary} size="large" />
					</View>
				) : books.length === 0 ? (
					<View style={styles.emptyContainer}>
						<Ionicons color={DesignTokens.colors.textSecondary} name="book-outline" size={48} />
						<Text style={styles.emptyTitle}>Пока нет книг</Text>
						<Text style={styles.emptySubtitle}>Создай свою первую книгу достижений</Text>
						<Pressable
							onPress={async () => {
								await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
								onCreateBook?.();
							}}
							style={({ pressed }) => [styles.emptyButton, pressed && styles.emptyButtonPressed]}
						>
							<Ionicons color={DesignTokens.colors.card} name="add" size={16} />
							<Text style={styles.emptyButtonText}>Создать книгу</Text>
						</Pressable>
					</View>
				) : (
					<View style={styles.booksList}>
						{books.map((book) => (
							<View key={book.id} style={styles.bookCard}>
								<View style={styles.bookHeader}>
									<View style={styles.bookTitleContainer}>
										<Text style={styles.bookTitle}>
											{book.metadata.diaryEmoji || '📖'} {book.storyJson?.title || 'Без названия'}
										</Text>
										<View style={styles.bookPeriod}>
											<Ionicons
												color={DesignTokens.colors.textSecondary}
												name="calendar-outline"
												size={12}
											/>
											<Text style={styles.bookPeriodText}>
												{formatPeriod(book.periodStart, book.periodEnd)}
											</Text>
										</View>
									</View>
									<View
										style={[
											styles.bookBadge,
											book.isFinal ? styles.bookBadgeFinal : styles.bookBadgeDraft,
										]}
									>
										<Text
											style={[
												styles.bookBadgeText,
												book.isFinal ? styles.bookBadgeTextFinal : styles.bookBadgeTextDraft,
											]}
										>
											{book.isFinal ? 'Готово' : 'Черновик'}
										</Text>
									</View>
								</View>

								<View style={styles.bookMeta}>
									<View style={styles.bookMetaItem}>
										<Ionicons color={DesignTokens.colors.purple} name="sparkles" size={16} />
										<Text style={styles.bookMetaText}>{getStyleLabel(book.style)}</Text>
									</View>
									{book.metadata.entriesCount && (
										<Text style={styles.bookMetaText}>📝 {book.metadata.entriesCount} записей</Text>
									)}
									{book.metadata.pages && (
										<Text style={styles.bookMetaText}>📄 {book.metadata.pages} страниц</Text>
									)}
								</View>

								<View style={styles.bookActions}>
									{book.isFinal && book.pdfUrl ? (
										<Pressable
											onPress={() => handleDownload(book)}
											style={({ pressed }) => [
												styles.bookButton,
												pressed && styles.bookButtonPressed,
											]}
										>
											<Ionicons color={DesignTokens.colors.card} name="download" size={16} />
											<Text style={styles.bookButtonText}>Скачать</Text>
										</Pressable>
									) : (
										<View style={styles.bookButtonDisabled}>
											<Ionicons
												color={DesignTokens.colors.textSecondary}
												name="sparkles"
												size={16}
											/>
											<Text style={styles.bookButtonDisabledText}>Генерация...</Text>
										</View>
									)}
								</View>
							</View>
						))}
					</View>
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: DesignTokens.colors.background,
	},
	header: {
		backgroundColor: DesignTokens.colors.purple,
		padding: DesignTokens.spacing.lg,
	},
	headerContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: DesignTokens.spacing.md,
		marginBottom: DesignTokens.spacing.md,
	},
	headerIcon: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	headerText: {
		flex: 1,
	},
	headerTitle: {
		fontSize: DesignTokens.fontSizes.xl,
		fontWeight: DesignTokens.fontWeights.semibold,
		color: DesignTokens.colors.card,
	},
	headerSubtitle: {
		fontSize: DesignTokens.fontSizes.sm,
		color: DesignTokens.colors.card,
		opacity: 0.9,
	},
	createButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: DesignTokens.spacing.sm,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		padding: DesignTokens.spacing.md,
		borderRadius: DesignTokens.borderRadius.md,
	},
	createButtonPressed: {
		opacity: 0.7,
	},
	createButtonText: {
		fontSize: DesignTokens.fontSizes.body,
		fontWeight: DesignTokens.fontWeights.medium,
		color: DesignTokens.colors.card,
	},
	filters: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: DesignTokens.spacing.sm,
		padding: DesignTokens.spacing.md,
		backgroundColor: DesignTokens.colors.card,
		borderBottomWidth: 1,
		borderBottomColor: DesignTokens.colors.border,
	},
	filterIcon: {
		marginRight: DesignTokens.spacing.xs,
	},
	filterButtons: {
		flexDirection: 'row',
		gap: DesignTokens.spacing.sm,
	},
	filterButton: {
		paddingHorizontal: DesignTokens.spacing.md,
		paddingVertical: DesignTokens.spacing.sm,
		borderRadius: DesignTokens.borderRadius.md,
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
	},
	filterButtonActive: {
		backgroundColor: DesignTokens.colors.primary,
		borderColor: DesignTokens.colors.primary,
	},
	filterButtonText: {
		fontSize: DesignTokens.fontSizes.sm,
		color: DesignTokens.colors.text,
	},
	filterButtonTextActive: {
		color: DesignTokens.colors.card,
		fontWeight: DesignTokens.fontWeights.medium,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: DesignTokens.spacing.md,
	},
	loadingContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: DesignTokens.spacing.xl * 2,
	},
	emptyContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: DesignTokens.spacing.xl * 2,
		gap: DesignTokens.spacing.md,
	},
	emptyTitle: {
		fontSize: DesignTokens.fontSizes.lg,
		fontWeight: DesignTokens.fontWeights.semibold,
		color: DesignTokens.colors.text,
	},
	emptySubtitle: {
		fontSize: DesignTokens.fontSizes.sm,
		color: DesignTokens.colors.textSecondary,
		textAlign: 'center',
	},
	emptyButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: DesignTokens.spacing.sm,
		backgroundColor: DesignTokens.colors.primary,
		paddingHorizontal: DesignTokens.spacing.lg,
		paddingVertical: DesignTokens.spacing.md,
		borderRadius: DesignTokens.borderRadius.md,
		marginTop: DesignTokens.spacing.md,
	},
	emptyButtonPressed: {
		opacity: 0.7,
	},
	emptyButtonText: {
		fontSize: DesignTokens.fontSizes.body,
		fontWeight: DesignTokens.fontWeights.medium,
		color: DesignTokens.colors.card,
	},
	booksList: {
		gap: DesignTokens.spacing.md,
	},
	bookCard: {
		backgroundColor: DesignTokens.colors.card,
		borderRadius: DesignTokens.borderRadius.lg,
		padding: DesignTokens.spacing.md,
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
	},
	bookHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: DesignTokens.spacing.md,
	},
	bookTitleContainer: {
		flex: 1,
		marginRight: DesignTokens.spacing.sm,
	},
	bookTitle: {
		fontSize: DesignTokens.fontSizes.body,
		fontWeight: DesignTokens.fontWeights.semibold,
		color: DesignTokens.colors.text,
		marginBottom: DesignTokens.spacing.xs,
	},
	bookPeriod: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: DesignTokens.spacing.xs,
	},
	bookPeriodText: {
		fontSize: DesignTokens.fontSizes.xs,
		color: DesignTokens.colors.textSecondary,
	},
	bookBadge: {
		paddingHorizontal: DesignTokens.spacing.sm,
		paddingVertical: DesignTokens.spacing.xs,
		borderRadius: DesignTokens.borderRadius.sm,
	},
	bookBadgeFinal: {
		backgroundColor: DesignTokens.colors.primary,
	},
	bookBadgeDraft: {
		backgroundColor: DesignTokens.colors.secondary,
	},
	bookBadgeText: {
		fontSize: DesignTokens.fontSizes.xs,
		fontWeight: DesignTokens.fontWeights.medium,
	},
	bookBadgeTextFinal: {
		color: DesignTokens.colors.card,
	},
	bookBadgeTextDraft: {
		color: DesignTokens.colors.text,
	},
	bookMeta: {
		gap: DesignTokens.spacing.sm,
		marginBottom: DesignTokens.spacing.md,
	},
	bookMetaItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: DesignTokens.spacing.sm,
	},
	bookMetaText: {
		fontSize: DesignTokens.fontSizes.sm,
		color: DesignTokens.colors.textSecondary,
	},
	bookActions: {
		flexDirection: 'row',
		gap: DesignTokens.spacing.sm,
	},
	bookButton: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: DesignTokens.spacing.sm,
		backgroundColor: DesignTokens.colors.primary,
		padding: DesignTokens.spacing.md,
		borderRadius: DesignTokens.borderRadius.md,
	},
	bookButtonPressed: {
		opacity: 0.7,
	},
	bookButtonText: {
		fontSize: DesignTokens.fontSizes.body,
		fontWeight: DesignTokens.fontWeights.medium,
		color: DesignTokens.colors.card,
	},
	bookButtonDisabled: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: DesignTokens.spacing.sm,
		backgroundColor: DesignTokens.colors.secondary,
		padding: DesignTokens.spacing.md,
		borderRadius: DesignTokens.borderRadius.md,
	},
	bookButtonDisabledText: {
		fontSize: DesignTokens.fontSizes.body,
		fontWeight: DesignTokens.fontWeights.medium,
		color: DesignTokens.colors.textSecondary,
	},
});
