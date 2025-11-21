import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { DesignTokens } from '../../../design-system/tokens';
import { AnimatedCard } from '../../animated/AnimatedCard';

interface Achievement {
	id: string;
	name: string;
	description: string;
	icon: string;
	earned: boolean;
	rarity: string;
	earnedDate?: string;
	earnedText?: string; // ✅ NEW: Правильный текст для выполненных достижений
	progress?: number;
}

interface AchievementCardProps {
	achievement: Achievement;
	index?: number;
}

// Rarity colors with gradients
const RARITY_COLORS: {
	[key: string]: { gradient: string[]; border: string; text: string };
} = {
	common: {
		gradient: [DesignTokens.colors.gray100, DesignTokens.colors.gray200],
		border: DesignTokens.colors.gray300,
		text: DesignTokens.colors.gray600,
	},
	uncommon: {
		gradient: [DesignTokens.colors.successLight, DesignTokens.colors.success],
		border: DesignTokens.colors.success,
		text: DesignTokens.colors.success,
	},
	rare: {
		gradient: [DesignTokens.colors.primaryLight, DesignTokens.colors.primary],
		border: DesignTokens.colors.primary,
		text: DesignTokens.colors.primary,
	},
	legendary: {
		gradient: ['#F3E8FF', '#A855F7'],
		border: '#A855F7',
		text: '#A855F7',
	},
};

// Rarity labels
const RARITY_LABELS: { [key: string]: string } = {
	common: 'Обычное',
	uncommon: 'Необычное',
	rare: 'Редкое',
	legendary: 'Легендарное',
};

// Icon mapping (emoji to Ionicons)
const ICON_MAP: { [key: string]: keyof typeof Ionicons.glyphMap } = {
	'⭐': 'star',
	'🔥': 'flame',
	'📚': 'book',
	'👑': 'trophy',
	'💪': 'fitness',
	'❤️': 'heart',
	'🎯': 'target',
};

/**
 * Achievement Card Component - React Native
 * Displays a single achievement badge
 */
export function AchievementCard({ achievement, index = 0 }: AchievementCardProps) {
	const rarityColor = RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common;
	const rarityLabel = RARITY_LABELS[achievement.rarity] || 'Обычное';
	const iconName = ICON_MAP[achievement.icon] || 'star';

	return (
		<AnimatedCard index={index} staggerDelay={75}>
			<View style={[styles.card, !achievement.earned && styles.cardLocked]}>
				{/* Icon with gradient */}
				<LinearGradient
					colors={rarityColor.gradient}
					end={{ x: 1, y: 1 }}
					start={{ x: 0, y: 0 }}
					style={[styles.iconContainer, { borderColor: rarityColor.border }]}
				>
					<Ionicons
						color={achievement.earned ? '#FFFFFF' : 'rgba(255,255,255,0.5)'}
						name={iconName}
						size={28}
					/>
					{!achievement.earned && (
						<View style={styles.lockOverlay}>
							<Ionicons color="#FFFFFF" name="lock-closed" size={20} />
						</View>
					)}
				</LinearGradient>

				{/* Content */}
				<View style={styles.content}>
					<Text style={[styles.name, !achievement.earned && styles.textLocked]}>
						{achievement.name}
					</Text>
					<Text style={[styles.description, !achievement.earned && styles.textLocked]}>
						{achievement.description}
					</Text>

					{/* Footer */}
					<View style={styles.footer}>
						{achievement.earned ? (
							<View
								style={[
									styles.earnedBadge,
									{
										backgroundColor: rarityColor.bg || '#f3f4f6',
										borderColor: rarityColor.border,
									},
								]}
							>
								<Text style={[styles.earnedText, { color: rarityColor.text }]}>
									✅ {achievement.earnedText || 'Выполнено'}
								</Text>
							</View>
						) : (
							<>
								<View
									style={[
										styles.rarityBadge,
										{
											backgroundColor: rarityColor.bg,
											borderColor: rarityColor.border,
										},
									]}
								>
									<Text style={[styles.rarityText, { color: rarityColor.text }]}>
										{rarityLabel}
									</Text>
								</View>
								{achievement.progress !== undefined && (
									<Text style={styles.progress}>{Math.round(achievement.progress)}%</Text>
								)}
							</>
						)}
					</View>
				</View>
			</View>
		</AnimatedCard>
	);
}

const styles = StyleSheet.create({
	card: {
		flexDirection: 'row',
		backgroundColor: DesignTokens.colors.card,
		borderRadius: DesignTokens.borderRadius.xl,
		padding: DesignTokens.spacing.lg,
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
		marginBottom: DesignTokens.spacing.md,
		...DesignTokens.shadows.md,
	},
	cardLocked: {
		opacity: 0.6,
	},
	iconContainer: {
		width: 56,
		height: 56,
		borderRadius: 28,
		borderWidth: 2,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: DesignTokens.spacing.lg,
		position: 'relative',
		...DesignTokens.shadows.sm,
	},
	lockOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.4)',
		borderRadius: 28,
		alignItems: 'center',
		justifyContent: 'center',
	},
	content: {
		flex: 1,
	},
	name: {
		fontSize: DesignTokens.fontSizes.body,
		fontWeight: DesignTokens.fontWeights.semibold,
		color: DesignTokens.colors.text,
		marginBottom: DesignTokens.spacing.xs,
	},
	description: {
		fontSize: DesignTokens.fontSizes.bodySmall,
		color: DesignTokens.colors.textSecondary,
		lineHeight: DesignTokens.fontSizes.bodySmall * DesignTokens.lineHeights.normal,
		marginBottom: DesignTokens.spacing.md,
	},
	textLocked: {
		color: DesignTokens.colors.textTertiary,
	},
	footer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: DesignTokens.spacing.sm,
	},
	rarityBadge: {
		paddingHorizontal: DesignTokens.spacing.sm,
		paddingVertical: DesignTokens.spacing.xs,
		borderRadius: DesignTokens.borderRadius.md,
		borderWidth: 1,
	},
	rarityText: {
		fontSize: DesignTokens.fontSizes.caption,
		fontWeight: DesignTokens.fontWeights.medium,
	},
	earnedBadge: {
		paddingHorizontal: DesignTokens.spacing.sm,
		paddingVertical: DesignTokens.spacing.xs,
		borderRadius: DesignTokens.borderRadius.md,
		borderWidth: 1,
	},
	earnedText: {
		fontSize: DesignTokens.fontSizes.caption,
		fontWeight: DesignTokens.fontWeights.medium,
	},
	progress: {
		fontSize: DesignTokens.fontSizes.caption,
		color: DesignTokens.colors.textSecondary,
		fontWeight: DesignTokens.fontWeights.medium,
	},
});
