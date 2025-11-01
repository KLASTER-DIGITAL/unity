import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

interface DiaryEntry {
	id: string;
	text: string;
	category?: string;
	sentiment?: string;
	created_at: string;
	// biome-ignore lint/suspicious/noExplicitAny: Media type varies
	media?: any[];
}

interface RecentEntriesFeedProps {
	// biome-ignore lint/suspicious/noExplicitAny: User data type varies
	userData: any;
	language?: string;
	onEntryClick?: (entry: DiaryEntry) => void;
	onViewAllClick?: () => void;
}

// Категории с эмодзи
const CATEGORY_EMOJIS: Record<string, string> = {
	work: '💼',
	health: '💪',
	learning: '📚',
	relationships: '❤️',
	hobby: '🎨',
	travel: '✈️',
	finance: '💰',
	other: '📝',
};

// Sentiment colors
const SENTIMENT_COLORS: Record<string, string> = {
	positive: '#10B981',
	neutral: '#6B7280',
	negative: '#EF4444',
};

export function RecentEntriesFeed({
	userData,
	language: _language = 'ru',
	onEntryClick,
	onViewAllClick,
}: RecentEntriesFeedProps) {
	const [entries, setEntries] = useState<DiaryEntry[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// biome-ignore lint/correctness/useExhaustiveDependencies: loadEntries is stable
	useEffect(() => {
		loadEntries();
	}, []);

	const loadEntries = async () => {
		try {
			setIsLoading(true);
			const userId = userData?.user?.id || userData?.id || 'anonymous';

			// TODO: Implement actual API call
			console.log('Loading entries for user:', userId);

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Mock data
			const mockEntries: DiaryEntry[] = [
				{
					id: '1',
					text: 'Сегодня завершил важный проект на работе! 🎉',
					category: 'work',
					sentiment: 'positive',
					created_at: new Date().toISOString(),
				},
				{
					id: '2',
					text: 'Пробежал 5 км утром, чувствую себя отлично!',
					category: 'health',
					sentiment: 'positive',
					created_at: new Date(Date.now() - 86_400_000).toISOString(),
				},
			];

			setEntries(mockEntries);
		} catch (error) {
			console.error('Error loading entries:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

		if (diffHours < 1) return 'Только что';
		if (diffHours < 24) return `${diffHours} ч назад`;

		const diffDays = Math.floor(diffHours / 24);
		if (diffDays === 1) return 'Вчера';
		if (diffDays < 7) return `${diffDays} дн назад`;

		return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
	};

	const renderEntry = ({ item }: { item: DiaryEntry }) => (
		<Pressable onPress={() => onEntryClick?.(item)} style={styles.entryCard}>
			{/* Header */}
			<View style={styles.entryHeader}>
				{/* Category */}
				<View style={styles.categoryBadge}>
					<Text style={styles.categoryEmoji}>{CATEGORY_EMOJIS[item.category || 'other']}</Text>
					<Text style={styles.categoryText}>{item.category || 'other'}</Text>
				</View>

				{/* Time */}
				<Text style={styles.timeText}>{formatDate(item.created_at)}</Text>
			</View>

			{/* Content */}
			<Text numberOfLines={3} style={styles.entryText}>
				{item.text}
			</Text>

			{/* Sentiment Indicator */}
			{item.sentiment && (
				<View
					style={[styles.sentimentIndicator, { backgroundColor: SENTIMENT_COLORS[item.sentiment] }]}
				/>
			)}
		</Pressable>
	);

	if (isLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator color="#3B82F6" size="large" />
			</View>
		);
	}

	if (entries.length === 0) {
		return (
			<View style={styles.emptyContainer}>
				<Text style={styles.emptyEmoji}>📝</Text>
				<Text style={styles.emptyTitle}>Пока нет записей</Text>
				<Text style={styles.emptyText}>Начните делиться своими достижениями!</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.title}>Последние записи</Text>
				<Pressable onPress={onViewAllClick}>
					<Text style={styles.viewAllButton}>Все →</Text>
				</Pressable>
			</View>

			{/* Entries List */}
			<FlatList
				contentContainerStyle={styles.listContent}
				data={entries}
				keyExtractor={(item) => item.id}
				renderItem={renderEntry}
				scrollEnabled={false}
				showsVerticalScrollIndicator={false} // Disable scroll since it's inside ScrollView
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 24,
		paddingVertical: 16,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	title: {
		fontSize: 20,
		fontWeight: '600',
		color: '#111827',
	},
	viewAllButton: {
		fontSize: 16,
		fontWeight: '500',
		color: '#3B82F6',
	},
	listContent: {
		gap: 12,
	},
	entryCard: {
		padding: 16,
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#E5E7EB',
		position: 'relative',
	},
	entryHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	categoryBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 10,
		paddingVertical: 4,
		backgroundColor: '#F3F4F6',
		borderRadius: 8,
	},
	categoryEmoji: {
		fontSize: 14,
	},
	categoryText: {
		fontSize: 12,
		fontWeight: '500',
		color: '#6B7280',
		textTransform: 'capitalize',
	},
	timeText: {
		fontSize: 12,
		color: '#9CA3AF',
	},
	entryText: {
		fontSize: 15,
		color: '#374151',
		lineHeight: 22,
	},
	sentimentIndicator: {
		position: 'absolute',
		left: 0,
		top: 0,
		bottom: 0,
		width: 4,
		borderTopLeftRadius: 16,
		borderBottomLeftRadius: 16,
	},
	loadingContainer: {
		padding: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	emptyContainer: {
		padding: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	emptyEmoji: {
		fontSize: 48,
		marginBottom: 16,
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#111827',
		marginBottom: 8,
	},
	emptyText: {
		fontSize: 14,
		color: '#6B7280',
		textAlign: 'center',
	},
});
