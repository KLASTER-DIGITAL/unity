import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface FiltersPanelProps {
	showFilters: boolean;
	categories: string[];
	selectedCategory: string | null;
	selectedSentiment: string | null;
	onCategoryChange: (category: string | null) => void;
	onSentimentChange: (sentiment: string | null) => void;
}

/**
 * Filters Panel Component - React Native
 * Category and sentiment filters
 */
export function FiltersPanel({
	showFilters,
	categories,
	selectedCategory,
	selectedSentiment,
	onCategoryChange,
	onSentimentChange,
}: FiltersPanelProps) {
	if (!showFilters) return null;

	return (
		<View style={styles.container}>
			{/* Categories */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Категория</Text>
				<ScrollView
					contentContainerStyle={styles.filterRow}
					horizontal
					showsHorizontalScrollIndicator={false}
				>
					<Pressable
						onPress={() => onCategoryChange(null)}
						style={[styles.filterButton, !selectedCategory && styles.filterButtonActive]}
					>
						<Text
							style={[styles.filterButtonText, !selectedCategory && styles.filterButtonTextActive]}
						>
							Все
						</Text>
					</Pressable>

					{categories.map((cat) => (
						<Pressable
							key={cat}
							onPress={() => onCategoryChange(cat)}
							style={[styles.filterButton, selectedCategory === cat && styles.filterButtonActive]}
						>
							<Text
								style={[
									styles.filterButtonText,
									selectedCategory === cat && styles.filterButtonTextActive,
								]}
							>
								{cat}
							</Text>
						</Pressable>
					))}
				</ScrollView>
			</View>

			{/* Sentiment */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Настроение</Text>
				<View style={styles.filterRow}>
					<Pressable
						onPress={() => onSentimentChange(null)}
						style={[styles.filterButton, !selectedSentiment && styles.filterButtonActive]}
					>
						<Text
							style={[styles.filterButtonText, !selectedSentiment && styles.filterButtonTextActive]}
						>
							Все
						</Text>
					</Pressable>

					<Pressable
						onPress={() => onSentimentChange('positive')}
						style={[
							styles.filterButton,
							selectedSentiment === 'positive' && styles.filterButtonPositive,
						]}
					>
						<Text
							style={[
								styles.filterButtonText,
								selectedSentiment === 'positive' && styles.filterButtonTextActive,
							]}
						>
							😊 Позитив
						</Text>
					</Pressable>

					<Pressable
						onPress={() => onSentimentChange('neutral')}
						style={[
							styles.filterButton,
							selectedSentiment === 'neutral' && styles.filterButtonNeutral,
						]}
					>
						<Text
							style={[
								styles.filterButtonText,
								selectedSentiment === 'neutral' && styles.filterButtonTextActive,
							]}
						>
							😐 Нейтрал
						</Text>
					</Pressable>

					<Pressable
						onPress={() => onSentimentChange('negative')}
						style={[
							styles.filterButton,
							selectedSentiment === 'negative' && styles.filterButtonNegative,
						]}
					>
						<Text
							style={[
								styles.filterButtonText,
								selectedSentiment === 'negative' && styles.filterButtonTextActive,
							]}
						>
							😔 Грусть
						</Text>
					</Pressable>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#FFFFFF',
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
		paddingHorizontal: 24,
		paddingVertical: 16,
	},
	section: {
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 13,
		fontWeight: '500',
		color: '#6B7280',
		marginBottom: 8,
	},
	filterRow: {
		flexDirection: 'row',
		gap: 8,
		flexWrap: 'wrap',
	},
	filterButton: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		backgroundColor: '#F3F4F6',
		borderRadius: 8,
	},
	filterButtonActive: {
		backgroundColor: '#3B82F6',
	},
	filterButtonPositive: {
		backgroundColor: '#10B981',
	},
	filterButtonNeutral: {
		backgroundColor: '#6B7280',
	},
	filterButtonNegative: {
		backgroundColor: '#EF4444',
	},
	filterButtonText: {
		fontSize: 13,
		color: '#111827',
	},
	filterButtonTextActive: {
		color: '#FFFFFF',
		fontWeight: '500',
	},
});
