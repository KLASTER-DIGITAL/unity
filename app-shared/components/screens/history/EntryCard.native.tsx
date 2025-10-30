import { Pressable, StyleSheet, Text, View } from "react-native";
import { AnimatedCard } from "../../animated/AnimatedCard";
import { AnimatedPressable } from "../../animated/AnimatedPressable";
import { SwipeableCard } from "../../animated/SwipeableCard";

interface DiaryEntry {
	id: string;
	text: string;
	category: string;
	sentiment: string;
	createdAt: string;
	media?: any[];
	tags?: string[];
}

interface EntryCardProps {
	entry: DiaryEntry;
	index: number;
	onOpenActions: (entry: DiaryEntry) => void;
	onDelete?: (entry: DiaryEntry) => void;
}

// Category icons mapping (emoji for React Native)
const CATEGORY_EMOJIS: { [key: string]: string } = {
	Другое: "✨",
	Семья: "👨‍👩‍👧‍👦",
	Работа: "💼",
	Финансы: "💰",
	Благодарность: "❤️",
	Здоровье: "💪",
	"Личное развитие": "📚",
	Обучение: "🎓",
	Творчество: "🎨",
	Отношения: "💕",
};

// Sentiment colors
const SENTIMENT_COLORS: { [key: string]: { bg: string; text: string } } = {
	positive: { bg: "#D1FAE5", text: "#10B981" },
	neutral: { bg: "#DBEAFE", text: "#3B82F6" },
	negative: { bg: "#FEE2E2", text: "#EF4444" },
};

// Sentiment labels
const SENTIMENT_LABELS: { [key: string]: string } = {
	positive: "😊 Позитив",
	neutral: "😐 Нейтрал",
	negative: "😔 Грусть",
};

/**
 * Format entry date
 */
function formatEntryDate(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

	if (diffHours < 1) return "Только что";
	if (diffHours < 24) return `${diffHours} ч назад`;

	const diffDays = Math.floor(diffHours / 24);
	if (diffDays === 1) return "Вчера";
	if (diffDays < 7) return `${diffDays} дн назад`;

	return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

/**
 * Entry Card Component - React Native
 * Displays a single diary entry with animations and swipe to delete
 */
export function EntryCard({
	entry,
	index,
	onOpenActions,
	onDelete,
}: EntryCardProps) {
	const categoryEmoji = CATEGORY_EMOJIS[entry.category] || "✨";
	const sentimentColor =
		SENTIMENT_COLORS[entry.sentiment] || SENTIMENT_COLORS.neutral;
	const sentimentLabel = SENTIMENT_LABELS[entry.sentiment] || "😐 Нейтрал";
	const entryDate = new Date(entry.createdAt);
	const dateStr = formatEntryDate(entryDate);

	const handleDelete = () => {
		onDelete?.(entry);
	};

	return (
		<AnimatedCard index={index} staggerDelay={50}>
			<SwipeableCard enabled={!!onDelete} onDelete={handleDelete}>
				<AnimatedPressable enableHaptics={false} style={styles.card}>
					{/* Header */}
					<View style={styles.header}>
						<View style={styles.categoryContainer}>
							<View style={styles.categoryIcon}>
								<Text style={styles.categoryEmoji}>{categoryEmoji}</Text>
							</View>
							<View>
								<Text style={styles.categoryText}>{entry.category}</Text>
								<Text style={styles.dateText}>{dateStr}</Text>
							</View>
						</View>

						<Pressable
							onPress={() => onOpenActions(entry)}
							style={styles.moreButton}
						>
							<Text style={styles.moreIcon}>⋮</Text>
						</Pressable>
					</View>

					{/* Content */}
					<Text numberOfLines={5} style={styles.contentText}>
						{entry.text}
					</Text>

					{/* Footer - Sentiment and Tags */}
					<View style={styles.footer}>
						<View
							style={[
								styles.sentimentBadge,
								{
									backgroundColor: sentimentColor.bg,
									borderColor: sentimentColor.text,
								},
							]}
						>
							<Text
								style={[styles.sentimentText, { color: sentimentColor.text }]}
							>
								{sentimentLabel}
							</Text>
						</View>

						{(entry.tags || []).slice(0, 2).map((tag) => (
							<View key={tag} style={styles.tagBadge}>
								<Text style={styles.tagText}>#{tag}</Text>
							</View>
						))}
					</View>
				</AnimatedPressable>
			</SwipeableCard>
		</AnimatedCard>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		padding: 16,
		borderWidth: 1,
		borderColor: "#E5E7EB",
		marginBottom: 12,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 12,
	},
	categoryContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	categoryIcon: {
		width: 32,
		height: 32,
		backgroundColor: "rgba(59, 130, 246, 0.1)",
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	categoryEmoji: {
		fontSize: 18,
	},
	categoryText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#111827",
	},
	dateText: {
		fontSize: 12,
		color: "#6B7280",
		marginTop: 2,
	},
	moreButton: {
		padding: 4,
	},
	moreIcon: {
		fontSize: 20,
		color: "#6B7280",
	},
	contentText: {
		fontSize: 15,
		color: "#111827",
		lineHeight: 22,
		marginBottom: 12,
	},
	footer: {
		flexDirection: "row",
		gap: 8,
		flexWrap: "wrap",
	},
	sentimentBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
		borderWidth: 1,
	},
	sentimentText: {
		fontSize: 11,
		fontWeight: "500",
	},
	tagBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		backgroundColor: "#F3F4F6",
		borderRadius: 6,
		borderWidth: 1,
		borderColor: "#D1D5DB",
	},
	tagText: {
		fontSize: 11,
		color: "#6B7280",
	},
});
