/**
 * AchievementDetailsModal - React Native Version
 *
 * Модальное окно с деталями достижения
 * Визуально идентично PWA версии (src/features/mobile/achievements/components/AchievementDetailsModal.tsx)
 */

import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';

type RarityType = 'common' | 'rare' | 'epic' | 'legendary';

interface AchievementDetailsModalProps {
	isOpen: boolean;
	onClose: () => void;
	achievement: {
		name: string;
		description: string;
		icon: string; // emoji для React Native
		rarity: RarityType;
		progress: number;
		earned: boolean;
		earnedDate?: string;
	} | null;
}

// Rarity colors (React Native версия)
const RARITY_COLORS = {
	legendary: {
		gradient: ['#c084fc', '#9333ea'],
		badge: '#f3e8ff',
		badgeText: '#9333ea',
		label: '🌟 Легендарное',
	},
	epic: {
		gradient: ['#fb923c', '#ea580c'],
		badge: '#ffedd5',
		badgeText: '#ea580c',
		label: '⚡ Эпическое',
	},
	rare: {
		gradient: ['#60a5fa', '#2563eb'],
		badge: '#dbeafe',
		badgeText: '#2563eb',
		label: '💎 Редкое',
	},
	common: {
		gradient: ['#9ca3af', '#4b5563'],
		badge: '#f3f4f6',
		badgeText: '#6b7280',
		label: '⭐ Обычное',
	},
};

const MOTIVATION_MESSAGES = {
	streak:
		'Вы удерживаете ритм — это важнее, чем идеальные дни. Продолжайте идти маленькими шагами.',
	entries:
		'Каждая запись — это честный разговор с собой. Вы уже делаете больше, чем большинство людей.',
	default:
		'Это достижение — доказательство того, что вы не просто мечтаете, а действуете. Продолжайте в том же духе.',
};

function getMotivationMessage(name: string): string {
	const lowerName = name.toLowerCase();
	if (
		lowerName.includes('дней подряд') ||
		lowerName.includes('неделя') ||
		lowerName.includes('подряд')
	) {
		return MOTIVATION_MESSAGES.streak;
	}
	if (lowerName.includes('записей') || lowerName.includes('запись') || lowerName.includes('слов')) {
		return MOTIVATION_MESSAGES.entries;
	}
	return MOTIVATION_MESSAGES.default;
}

export function AchievementDetailsModal({
	isOpen,
	onClose,
	achievement,
}: AchievementDetailsModalProps) {
	const { colors } = useTheme();
	const scaleAnim = useRef(new Animated.Value(0)).current;
	const progressAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (isOpen) {
			Animated.spring(scaleAnim, {
				toValue: 1,
				useNativeDriver: true,
				tension: 100,
				friction: 10,
			}).start();

			if (achievement && !achievement.earned) {
				Animated.timing(progressAnim, {
					toValue: achievement.progress,
					duration: 1000,
					useNativeDriver: false,
				}).start();
			}
		} else {
			scaleAnim.setValue(0);
			progressAnim.setValue(0);
		}
	}, [isOpen, achievement]);

	if (!achievement) return null;

	const rarityStyle = RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common;

	const _handleShare = async () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		const text = `🏆 Я получил достижение "${achievement.name}" в UNITY!\n\n${achievement.description}`;

		if (await Sharing.isAvailableAsync()) {
			// TODO: Implement sharing with image
			console.log('[AchievementDetailsModal] Share:', text);
		}
	};

	const progressWidth = progressAnim.interpolate({
		inputRange: [0, 100],
		outputRange: ['0%', '100%'],
	});

	return (
		<Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
			<Pressable style={styles.overlay} onPress={onClose}>
				<Animated.View
					style={[
						styles.modal,
						{ backgroundColor: colors.card, transform: [{ scale: scaleAnim }] },
					]}
					onStartShouldSetResponder={() => true}
				>
					{/* Close Button */}
					<Pressable style={styles.closeButton} onPress={onClose}>
						<Text style={[styles.closeButtonText, { color: colors.mutedForeground }]}>✕</Text>
					</Pressable>

					{/* Icon Circle */}
					<View
						style={[
							styles.iconCircle,
							achievement.earned
								? { backgroundColor: rarityStyle.gradient[0] }
								: { backgroundColor: colors.muted, borderWidth: 2, borderColor: colors.border },
						]}
					>
						<Text style={styles.icon}>{achievement.icon}</Text>
					</View>

					{/* Name */}
					<Text style={[styles.name, { color: colors.text }]}>{achievement.name}</Text>

					{/* Status */}
					{achievement.earned ? (
						<>
							<Text style={[styles.congratsText, { color: colors.primary }]}>
								🎉 Поздравляем! Вы сделали это!
							</Text>
							<Text style={[styles.motivationText, { color: colors.mutedForeground }]}>
								{getMotivationMessage(achievement.name)}
							</Text>
						</>
					) : (
						<Text style={[styles.description, { color: colors.mutedForeground }]}>
							{achievement.description}
						</Text>
					)}

					{/* Rarity Badge */}
					<View style={[styles.rarityBadge, { backgroundColor: rarityStyle.badge }]}>
						<Text style={[styles.rarityText, { color: rarityStyle.badgeText }]}>
							{rarityStyle.label}
						</Text>
					</View>

					{/* Progress or Earned Date */}
					{achievement.earned ? (
						<View style={styles.earnedContainer}>
							<Text style={[styles.earnedLabel, { color: colors.text }]}>✅ Получено</Text>
							<Text style={[styles.earnedDate, { color: colors.mutedForeground }]}>
								{achievement.earnedDate}
							</Text>
						</View>
					) : (
						<View style={styles.progressContainer}>
							<View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
								<Animated.View
									style={[
										styles.progressFill,
										{ backgroundColor: colors.primary, width: progressWidth },
									]}
								/>
							</View>
							<Text style={[styles.progressText, { color: colors.mutedForeground }]}>
								Прогресс: {achievement.progress}%
							</Text>
						</View>
					)}
				</Animated.View>
			</Pressable>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 16,
	},
	modal: { width: '100%', maxWidth: 400, borderRadius: 16, padding: 24, alignItems: 'center' },
	closeButton: {
		position: 'absolute',
		top: 16,
		right: 16,
		width: 32,
		height: 32,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
	},
	closeButtonText: { fontSize: 20 },
	iconCircle: {
		width: 96,
		height: 96,
		borderRadius: 48,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 16,
	},
	icon: { fontSize: 48 },
	name: { fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
	congratsText: { fontSize: 16, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
	motivationText: {
		fontSize: 12,
		fontStyle: 'italic',
		marginBottom: 16,
		textAlign: 'center',
		lineHeight: 18,
	},
	description: { fontSize: 14, marginBottom: 16, textAlign: 'center', lineHeight: 20 },
	rarityBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 16 },
	rarityText: { fontSize: 12, fontWeight: '500' },
	earnedContainer: { alignItems: 'center', gap: 4 },
	earnedLabel: { fontSize: 14, fontWeight: '600' },
	earnedDate: { fontSize: 12 },
	progressContainer: { width: '100%', gap: 8 },
	progressBar: { width: '100%', height: 8, borderRadius: 4, overflow: 'hidden' },
	progressFill: { height: '100%', borderRadius: 4 },
	progressText: { fontSize: 12, textAlign: 'center' },
});
