import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type React from "react";
import { useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { DesignTokens } from "../../design-system/tokens";

interface SwipeableCardProps {
	children: React.ReactNode;
	onDelete?: () => void;
	deleteThreshold?: number;
	enabled?: boolean;
}

/**
 * SwipeableCard Component
 *
 * Карточка с swipe to delete функциональностью
 * - Свайп влево для удаления
 * - Haptic feedback при достижении порога
 * - Анимированное удаление
 * - iOS-style дизайн
 */
export function SwipeableCard({
	children,
	onDelete,
	deleteThreshold = 80,
	enabled = true,
}: SwipeableCardProps) {
	const swipeableRef = useRef<Swipeable>(null);
	const hapticTriggered = useRef(false);

	const renderRightActions = (
		progress: Animated.AnimatedInterpolation<number>,
		dragX: Animated.AnimatedInterpolation<number>,
	) => {
		const scale = dragX.interpolate({
			inputRange: [-deleteThreshold, 0],
			outputRange: [1, 0.8],
			extrapolate: "clamp",
		});

		const opacity = dragX.interpolate({
			inputRange: [-deleteThreshold, -deleteThreshold / 2, 0],
			outputRange: [1, 0.8, 0],
			extrapolate: "clamp",
		});

		return (
			<Animated.View style={[styles.deleteAction, { opacity }]}>
				<Animated.View
					style={[styles.deleteIconContainer, { transform: [{ scale }] }]}
				>
					<Ionicons
						color={DesignTokens.colors.background}
						name="trash-outline"
						size={24}
					/>
				</Animated.View>
			</Animated.View>
		);
	};

	const handleSwipeableOpen = (direction: "left" | "right") => {
		if (direction === "right" && onDelete) {
			// Haptic feedback при открытии
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

			// Закрыть swipeable
			swipeableRef.current?.close();

			// Небольшая задержка перед удалением для анимации
			setTimeout(() => {
				onDelete();
			}, 200);
		}
	};

	const handleSwipeableWillOpen = (direction: "left" | "right") => {
		if (direction === "right" && !hapticTriggered.current) {
			// Haptic feedback при достижении порога
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
			hapticTriggered.current = true;
		}
	};

	const handleSwipeableClose = () => {
		hapticTriggered.current = false;
	};

	if (!(enabled && onDelete)) {
		return <>{children}</>;
	}

	return (
		<Swipeable
			friction={2}
			onSwipeableClose={handleSwipeableClose}
			onSwipeableOpen={handleSwipeableOpen}
			onSwipeableWillOpen={handleSwipeableWillOpen}
			overshootRight={false}
			ref={swipeableRef}
			renderRightActions={renderRightActions}
			rightThreshold={deleteThreshold}
		>
			{children}
		</Swipeable>
	);
}

const styles = StyleSheet.create({
	deleteAction: {
		justifyContent: "center",
		alignItems: "flex-end",
		paddingRight: DesignTokens.spacing.lg,
	},
	deleteIconContainer: {
		width: 56,
		height: 56,
		borderRadius: DesignTokens.borderRadius.full,
		backgroundColor: DesignTokens.colors.error,
		justifyContent: "center",
		alignItems: "center",
		...DesignTokens.shadows.md,
	},
});
