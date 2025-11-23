/**
 * Books Library Screen (React Native)
 *
 * Displays user's PDF books library with filters and download options.
 * Enhanced with Premium Styling and Layout Animations.
 *
 * @author UNITY Team
 * @date 2025-11-23
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	LayoutAnimation,
	Platform,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	UIManager,
	View,
} from 'react-native';
import { DesignTokens } from '@/shared/design-system/tokens';
import { useAuth } from '@/shared/lib/hooks/useAuth';
import { useBooksList } from '@/shared/lib/hooks/useBooksList';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
	if (UIManager.setLayoutAnimationEnabledExperimental) {
		UIManager.setLayoutAnimationEnabledExperimental(true);
	}
}

type BookDraft = {
	id: string;
	userId: string;
	periodStart: string;
	periodEnd: string;
	contexts: string[];
	style: 'warm_family' | 'biographical' | 'motivational';
	layout: 'photo_text' | 'text_only' | 'minimal';
	theme: 'light' | 'dark';
	planType?: 'free' | 'premium';
	version?: number;
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
	// ✅ Use shared hook for books list management (removes code duplication)
	const {
		books: booksFromHook,
		loading: isLoadingFromHook,
		filter,
		setFilter,
		fetchBooks,
	} = useBooksList(user?.id || null);

	// Convert Book type to BookDraft for native compatibility
	const books: BookDraft[] = booksFromHook.map((book) => ({
		id: book.id,
		userId: book.userId,
		periodStart: book.periodStart,
		periodEnd: book.periodEnd,
		contexts: book.contexts,
		style: book.style as 'warm_family' | 'biographical' | 'motivational',
		layout: book.layout as 'photo_text' | 'text_only' | 'minimal',
		theme: book.theme as 'light' | 'dark',
		planType: book.planType,
		version: book.version,
		pdfUrl: book.pdfUrl || undefined,
		storyJson: book.storyJson,
		metadata: book.metadata,
		isDraft: book.isDraft,
		isFinal: book.isFinal,
		createdAt: book.createdAt,
		updatedAt: book.updatedAt,
	}));

	const isLoading = isLoadingFromHook;
	const [isRefreshing, setIsRefreshing] = useState(false);

	// Refresh handler
	const handleRefresh = async () => {
		setIsRefreshing(true);
		await fetchBooks();
		setIsRefreshing(false);
	};

	useEffect(() => {
		fetchBooks();
	}, [fetchBooks]);

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
		// TODO: Implement PDF download for React Native (P2)
		console.log('[BOOKS-LIBRARY] Download book:', book.id);
	};

	// Handle filter change
	const handleFilterChange = async (newFilter: 'all' | 'drafts' | 'final') => {
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setFilter(newFilter);
	};

	const handleCreateBook = () => {
		// setEditingBookId(null); // Clear editing state - handled in parent or navigation
		onCreateBook?.();
	};

	const handleEditDraft = (book: BookDraft) => {
		// setEditingBookId(book.id); // Set editing book - handled in parent or navigation
		// setShowWizard(true);
		console.log('Edit draft:', book.id);
		onCreateBook?.(); // Temporary fallback
	};

	return (
		<View style={styles.container}>
			{/* Header with Gradient Background Effect */}
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
						handleCreateBook();
					}}
					style={({ pressed }) => [styles.createButton, pressed && styles.createButtonPressed]}
				>
					<Ionicons color={DesignTokens.colors.card} name="add" size={20} />
					<Text style={styles.createButtonText}>Создать новую книгу</Text>
				</Pressable>
			</View>

			{/* Filters */}
			<View style={styles.filtersContainer}>
				{/* Status Filter */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.filtersScroll}
				>
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
									style={[
										styles.filterButtonText,
										filter === 'all' && styles.filterButtonTextActive,
									]}
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
									style={[
										styles.filterButtonText,
										filter === 'final' && styles.filterButtonTextActive,
									]}
								>
									Готовые
								</Text>
							</Pressable>
						</View>
					</View>
				</ScrollView>
			</View>

			{/* Books List */}
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				refreshControl={<RefreshControl onRefresh={handleRefresh} refreshing={isRefreshing} />}
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
							<Pressable
								key={book.id}
								style={({ pressed }) => [
									styles.bookCard,
									pressed && { transform: [{ scale: 0.98 }] },
								]}
								onPress={() => {
									if (book.isFinal) {
										// handleView(book);
									} else {
										handleEditDraft(book);
									}
								}}
							>
								{/* Spine Indicator */}
								<View
									style={[
										styles.bookSpine,
										{
											backgroundColor:
												book.style === 'warm_family'
													? DesignTokens.colors.purple
													: book.style === 'biographical'
														? DesignTokens.colors.primary
														: DesignTokens.colors.secondary,
										},
									]}
								/>

								<View style={styles.bookContent}>
									<View style={styles.bookHeader}>
										<View style={styles.bookTitleContainer}>
											<Text style={styles.bookTitle} numberOfLines={2}>
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
										<View style={styles.bookBadges}>
											{/* Status Badge */}
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
									</View>

									<View style={styles.bookMeta}>
										<View style={styles.bookMetaItem}>
											<Ionicons color={DesignTokens.colors.purple} name="sparkles" size={14} />
											<Text style={styles.bookMetaText}>{getStyleLabel(book.style)}</Text>
										</View>
										{book.version && book.version > 1 && (
											<View style={styles.bookMetaItem}>
												<Text style={styles.bookMetaText}>v{book.version}</Text>
											</View>
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
												<Text style={styles.bookButtonDisabledText}>
													{book.isFinal ? 'Обработка...' : 'Редактировать'}
												</Text>
												{!book.isFinal && (
													<Ionicons
														color={DesignTokens.colors.textSecondary}
														name="chevron-forward"
														size={16}
													/>
												)}
											</View>
										)}
									</View>
								</View>
							</Pressable>
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
		paddingTop: DesignTokens.spacing.xl * 1.5, // More space for status bar
		borderBottomLeftRadius: 24,
		borderBottomRightRadius: 24,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 5,
		zIndex: 10,
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
		fontWeight: DesignTokens.fontWeights.bold,
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
		borderRadius: DesignTokens.borderRadius.lg,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.3)',
	},
	createButtonPressed: {
		backgroundColor: 'rgba(255, 255, 255, 0.3)',
	},
	createButtonText: {
		fontSize: DesignTokens.fontSizes.body,
		fontWeight: DesignTokens.fontWeights.semibold,
		color: DesignTokens.colors.card,
	},
	filtersContainer: {
		backgroundColor: 'transparent',
		marginTop: DesignTokens.spacing.md,
		marginBottom: DesignTokens.spacing.xs,
	},
	filtersScroll: {
		paddingHorizontal: DesignTokens.spacing.md,
	},
	filters: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: DesignTokens.spacing.sm,
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
		paddingVertical: 8,
		borderRadius: 20,
		backgroundColor: DesignTokens.colors.card,
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
	},
	filterButtonActive: {
		backgroundColor: DesignTokens.colors.text,
		borderColor: DesignTokens.colors.text,
	},
	filterButtonText: {
		fontSize: DesignTokens.fontSizes.sm,
		color: DesignTokens.colors.text,
		fontWeight: DesignTokens.fontWeights.medium,
	},
	filterButtonTextActive: {
		color: DesignTokens.colors.card,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: DesignTokens.spacing.md,
		paddingBottom: 100, // Space for bottom tab bar
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
		backgroundColor: DesignTokens.colors.card,
		borderRadius: DesignTokens.borderRadius.xl,
		padding: DesignTokens.spacing.xl,
		marginVertical: DesignTokens.spacing.lg,
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
		borderStyle: 'dashed',
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
		opacity: 0.8,
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
		flexDirection: 'row',
		backgroundColor: DesignTokens.colors.card,
		borderRadius: 16,
		overflow: 'hidden',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 3,
		borderWidth: 1,
		borderColor: 'rgba(0,0,0,0.03)',
	},
	bookSpine: {
		width: 6,
		height: '100%',
	},
	bookContent: {
		flex: 1,
		padding: DesignTokens.spacing.md,
	},
	bookHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: DesignTokens.spacing.sm,
	},
	bookTitleContainer: {
		flex: 1,
		marginRight: DesignTokens.spacing.sm,
	},
	bookTitle: {
		fontSize: 17,
		fontWeight: '700',
		color: DesignTokens.colors.text,
		marginBottom: 4,
		letterSpacing: -0.3,
	},
	bookPeriod: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	bookPeriodText: {
		fontSize: 12,
		color: DesignTokens.colors.textSecondary,
		fontWeight: '500',
	},
	bookBadges: {
		flexDirection: 'row',
		gap: 4,
	},
	bookBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
	},
	bookBadgeFinal: {
		backgroundColor: 'rgba(52, 199, 89, 0.1)',
	},
	bookBadgeDraft: {
		backgroundColor: DesignTokens.colors.background,
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
	},
	bookBadgeText: {
		fontSize: 10,
		fontWeight: '700',
		textTransform: 'uppercase',
	},
	bookBadgeTextFinal: {
		color: '#34C759',
	},
	bookBadgeTextDraft: {
		color: DesignTokens.colors.textSecondary,
	},
	bookMeta: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		marginBottom: 12,
	},
	bookMetaItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	bookMetaText: {
		fontSize: 12,
		color: DesignTokens.colors.textSecondary,
		fontWeight: '500',
	},
	bookActions: {
		flexDirection: 'row',
		gap: DesignTokens.spacing.sm,
		borderTopWidth: 1,
		borderTopColor: DesignTokens.colors.border,
		paddingTop: 12,
	},
	bookButton: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6,
		backgroundColor: DesignTokens.colors.primary,
		paddingVertical: 10,
		borderRadius: 10,
	},
	bookButtonPressed: {
		opacity: 0.8,
	},
	bookButtonText: {
		fontSize: 14,
		fontWeight: '600',
		color: DesignTokens.colors.card,
	},
	bookButtonDisabled: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between', // Align text left, icon right
		paddingHorizontal: 4,
	},
	bookButtonDisabledText: {
		fontSize: 14,
		fontWeight: '500',
		color: DesignTokens.colors.primary,
	},
});
