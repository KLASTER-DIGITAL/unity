/**
 * AchievementBadge3D - React Native Version
 *
 * 3D бейдж достижения с анимацией и rarity градиентами
 * Визуально идентичен PWA версии (src/features/mobile/achievements/components/AchievementBadge3D.tsx)
 */

import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';

type RarityType = 'common' | 'rare' | 'epic' | 'legendary';

interface AchievementBadge3DProps {
	id: string;
	name: string;
	description: string;
	icon: string; // emoji для React Native
	rarity: RarityType;
	progress: number;
	earned: boolean;
	earnedDate?: string | null;
	earnedText?: string; // ✅ NEW: Правильный текст для выполненных достижений
	index: number;
	onPress?: () => void;
}

// Rarity colors (React Native версия)
const RARITY_COLORS = {
	legendary: {
		gradient: ['#c084fc', '#9333ea'], // purple-400 to purple-600
		badge: '#f3e8ff', // purple-100
		badgeText: '#9333ea', // purple-600
	},
	epic: {
		gradient: ['#fb923c', '#ea580c'], // orange-400 to orange-600
		badge: '#ffedd5', // orange-100
		badgeText: '#ea580c', // orange-600
	},
	rare: {
		gradient: ['#60a5fa', '#2563eb'], // blue-400 to blue-600
		badge: '#dbeafe', // blue-100
		badgeText: '#2563eb', // blue-600
	},
	common: {
		gradient: ['#9ca3af', '#4b5563'], // gray-400 to gray-600
		badge: '#f3f4f6', // gray-100
		badgeText: '#6b7280', // gray-600
	},
};

export function AchievementBadge3D({
	name,
	description,
	icon,
	rarity,
	progress,
	earned,
	earnedDate: _earnedDate, // ✅ REMOVED: Дата убрана из карточек (есть в модальном окне)
	earnedText = 'Выполнено', // ✅ NEW: Правильный текст для выполненных достижений
	index: _index, // unused but kept for API compatibility
	onPress,
}: AchievementBadge3DProps) {
	const { colors } = useTheme();
	const [isPressed, setIsPressed] = useState(false);

	const handlePress = () => {
		if (earned) {
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
		} else {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
		onPress?.();
	};

	const rarityStyle = RARITY_COLORS[rarity] || RARITY_COLORS.common;

	return (
		<Pressable
			onPress={handlePress}
			onPressIn={() => setIsPressed(true)}
			onPressOut={() => setIsPressed(false)}
			style={[
				styles.container,
				{ backgroundColor: colors.card, opacity: earned ? 1 : 0.6 },
				isPressed && styles.pressed,
			]}
		>
			{/* Icon Circle */}
			<View
				style={[
					styles.iconCircle,
					earned
						? { backgroundColor: rarityStyle.gradient[0] }
						: { backgroundColor: colors.muted, borderWidth: 2, borderColor: colors.border },
				]}
			>
				<Text style={styles.icon}>{icon}</Text>
			</View>

			{/* Name */}
			<Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
				{name}
			</Text>

			{/* Description */}
			<Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
				{description}
			</Text>

			{/* Status */}
			{earned ? (
				<View style={[styles.badge, { backgroundColor: rarityStyle.badge }]}>
					<Text style={[styles.badgeText, { color: rarityStyle.badgeText }]}>✅ {earnedText}</Text>
				</View>
			) : (
				<View style={styles.statusContainer}>
					{/* Progress Bar */}
					<View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
						<View
							style={[
								styles.progressFill,
								{ backgroundColor: colors.primary, width: `${Math.min(progress || 0, 100)}%` },
							]}
						/>
					</View>
					<Text style={[styles.progressText, { color: colors.mutedForeground }]}>
						{progress || 0}%
					</Text>
				</View>
			)}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '48%', // 2 columns grid
		borderRadius: 12,
		padding: 16,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	pressed: {
		transform: [{ scale: 0.95 }],
	},
	iconCircle: {
		width: 64,
		height: 64,
		borderRadius: 32,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 12,
	},
	icon: {
		fontSize: 32,
	},
	name: {
		fontSize: 12, // ✅ FIXED: Уменьшен размер для маленьких экранов (было 14)
		fontWeight: '600',
		marginBottom: 4,
		textAlign: 'center',
	},
	description: {
		fontSize: 10, // ✅ FIXED: Уменьшен размер для маленьких экранов (было 12)
		marginBottom: 8,
		textAlign: 'center',
		lineHeight: 14, // ✅ FIXED: Уменьшен line-height (было 16)
	},
	badge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	badgeText: {
		fontSize: 10, // ✅ FIXED: Единый размер для всех платформ
		fontWeight: '500',
	},
	progressBar: {
		width: '100%',
		height: 8,
		borderRadius: 4,
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		borderRadius: 4,
	},
	progressText: {
		fontSize: 12,
	},
});
