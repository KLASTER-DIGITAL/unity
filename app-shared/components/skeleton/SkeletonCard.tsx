import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";
import { DesignTokens } from "../../design-system/tokens";

interface SkeletonCardProps {
	/**
	 * Ширина карточки
	 * @default "100%"
	 */
	width?: number | string;

	/**
	 * Высота карточки
	 * @default 120
	 */
	height?: number;

	/**
	 * Border radius
	 * @default DesignTokens.borderRadius.lg
	 */
	borderRadius?: number;

	/**
	 * Показывать ли shimmer эффект
	 * @default true
	 */
	shimmer?: boolean;

	/**
	 * Дополнительные стили
	 */
	style?: any;
}

/**
 * SkeletonCard Component
 *
 * Skeleton loader с shimmer эффектом для карточек
 * - LinearGradient для shimmer
 * - Reanimated для плавной анимации
 * - iOS-style дизайн
 */
export function SkeletonCard({
	width = "100%",
	height = 120,
	borderRadius = DesignTokens.borderRadius.lg,
	shimmer = true,
	style,
}: SkeletonCardProps) {
	const translateX = useSharedValue(-1);

	useEffect(() => {
		if (shimmer) {
			translateX.value = withRepeat(
				withTiming(1, {
					duration: 1500,
					easing: Easing.linear,
				}),
				-1,
				false,
			);
		}
	}, [shimmer]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [
			{
				translateX: translateX.value * 300,
			},
		],
	}));

	return (
		<View
			style={[
				styles.container,
				{
					width,
					height,
					borderRadius,
				},
				style,
			]}
		>
			{shimmer && (
				<Animated.View style={[styles.shimmerContainer, animatedStyle]}>
					<LinearGradient
						colors={[
							"rgba(255, 255, 255, 0)",
							"rgba(255, 255, 255, 0.3)",
							"rgba(255, 255, 255, 0)",
						]}
						end={{ x: 1, y: 0 }}
						start={{ x: 0, y: 0 }}
						style={styles.shimmer}
					/>
				</Animated.View>
			)}
		</View>
	);
}

/**
 * SkeletonText Component
 *
 * Skeleton loader для текста
 */
export function SkeletonText({
	width = "100%",
	height = 16,
	borderRadius = DesignTokens.borderRadius.sm,
	shimmer = true,
	style,
}: SkeletonCardProps) {
	return (
		<SkeletonCard
			borderRadius={borderRadius}
			height={height}
			shimmer={shimmer}
			style={style}
			width={width}
		/>
	);
}

/**
 * SkeletonCircle Component
 *
 * Skeleton loader для круглых элементов (аватары, иконки)
 */
export function SkeletonCircle({
	size = 48,
	shimmer = true,
	style,
}: {
	size?: number;
	shimmer?: boolean;
	style?: any;
}) {
	return (
		<SkeletonCard
			borderRadius={size / 2}
			height={size}
			shimmer={shimmer}
			style={style}
			width={size}
		/>
	);
}

/**
 * SkeletonEntryCard Component
 *
 * Skeleton loader для EntryCard
 */
export function SkeletonEntryCard() {
	return (
		<View style={styles.entryCard}>
			{/* Header */}
			<View style={styles.entryHeader}>
				<View style={styles.entryHeaderLeft}>
					<SkeletonCircle size={40} />
					<View style={styles.entryHeaderText}>
						<SkeletonText height={14} width={80} />
						<SkeletonText height={12} style={{ marginTop: 4 }} width={60} />
					</View>
				</View>
				<SkeletonCircle size={24} />
			</View>

			{/* Content */}
			<View style={styles.entryContent}>
				<SkeletonText height={14} width="100%" />
				<SkeletonText height={14} style={{ marginTop: 6 }} width="90%" />
				<SkeletonText height={14} style={{ marginTop: 6 }} width="70%" />
			</View>

			{/* Footer */}
			<View style={styles.entryFooter}>
				<SkeletonText
					borderRadius={DesignTokens.borderRadius.full}
					height={24}
					width={80}
				/>
				<SkeletonText
					borderRadius={DesignTokens.borderRadius.full}
					height={24}
					width={60}
				/>
			</View>
		</View>
	);
}

/**
 * SkeletonAchievementCard Component
 *
 * Skeleton loader для AchievementCard
 */
export function SkeletonAchievementCard() {
	return (
		<View style={styles.achievementCard}>
			<SkeletonCircle size={56} />
			<SkeletonText height={16} style={{ marginTop: 12 }} width={100} />
			<SkeletonText height={12} style={{ marginTop: 6 }} width={80} />
		</View>
	);
}

/**
 * SkeletonMilestoneCard Component
 *
 * Skeleton loader для MilestoneCard
 */
export function SkeletonMilestoneCard() {
	return (
		<View style={styles.milestoneCard}>
			<View style={styles.milestoneHeader}>
				<SkeletonText height={16} width={120} />
				<SkeletonText height={14} width={60} />
			</View>
			<SkeletonText
				borderRadius={DesignTokens.borderRadius.full}
				height={8}
				style={{ marginTop: 12 }}
				width="100%"
			/>
			<SkeletonText height={12} style={{ marginTop: 8 }} width={100} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: DesignTokens.colors.gray100,
		overflow: "hidden",
	},
	shimmerContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	shimmer: {
		flex: 1,
		width: 300,
	},
	entryCard: {
		backgroundColor: DesignTokens.colors.card,
		borderRadius: DesignTokens.borderRadius.lg,
		padding: DesignTokens.spacing.lg,
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
		marginBottom: DesignTokens.spacing.md,
	},
	entryHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: DesignTokens.spacing.md,
	},
	entryHeaderLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: DesignTokens.spacing.md,
	},
	entryHeaderText: {
		gap: DesignTokens.spacing.xs,
	},
	entryContent: {
		marginBottom: DesignTokens.spacing.md,
	},
	entryFooter: {
		flexDirection: "row",
		gap: DesignTokens.spacing.sm,
	},
	achievementCard: {
		backgroundColor: DesignTokens.colors.card,
		borderRadius: DesignTokens.borderRadius.lg,
		padding: DesignTokens.spacing.lg,
		alignItems: "center",
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
	},
	milestoneCard: {
		backgroundColor: DesignTokens.colors.card,
		borderRadius: DesignTokens.borderRadius.lg,
		padding: DesignTokens.spacing.lg,
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
		marginBottom: DesignTokens.spacing.md,
	},
	milestoneHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
});
