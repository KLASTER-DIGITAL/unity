/**
 * Achievements Tab Screen - React Native Version
 *
 * ВАЖНО: Этот файл должен быть визуально идентичен PWA версии
 * (src/features/mobile/achievements/components/AchievementsScreen.tsx)
 */

import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AchievementCard } from '../../app-shared/components/screens/achievements/AchievementCard.native';
import {
	SkeletonAchievementCard,
	SkeletonCircle,
	SkeletonText,
} from '../../app-shared/components/skeleton/SkeletonCard';
import { useTheme } from '../../app-shared/contexts/ThemeContext';
import { useAchievements } from '../../app-shared/hooks/useAchievements';
import { supabase } from '../../app-shared/lib/supabase/client';

// Icon mapping (React Native не поддерживает lucide-react, используем emoji)
const iconMap: Record<string, string> = {
	Star: '⭐',
	Flame: '🔥',
	Trophy: '🏆',
	Medal: '🏅',
	Crown: '👑',
	Rocket: '🚀',
	Zap: '⚡',
	Target: '🎯',
	Award: '🎖️',
	Gift: '🎁',
	Heart: '❤️',
	Sparkles: '✨',
	TrendingUp: '📈',
	Calendar: '📅',
	BookOpen: '📚',
	Dumbbell: '💪',
	Home: '🏠',
	Lightbulb: '💡',
	Users: '👥',
	Camera: '📷',
	// Emoji icons (используются напрямую)
	'🎭': '🎭',
	'🌸': '🌸',
	'💰': '💰',
	'🌱': '🌱',
	'🎨': '🎨',
	'💞': '💞',
};

export default function AchievementsScreen() {
	const { colors } = useTheme();
	const [userId, setUserId] = useState<string | undefined>(undefined);
	const [isRefreshing, setIsRefreshing] = useState(false);

	// ✅ NEW: Используем useAchievements hook для загрузки реальных данных
	const { achievements, isLoading, error, refetch, earnedCount, totalCount } =
		useAchievements(userId);

	// Get current user on mount
	useEffect(() => {
		getCurrentUser();
	}, []);

	const getCurrentUser = async () => {
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (session?.user?.id) {
				setUserId(session.user.id);
			} else {
				console.log('[AchievementsScreen] No session, using test user');
				setUserId('c1b3e4f5-6789-4abc-def0-123456789abc'); // Valid UUID format
			}
		} catch (error) {
			console.error('[AchievementsScreen] Error getting user:', error);
		}
	};

	const handleRefresh = async () => {
		setIsRefreshing(true);
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

		// Reload achievements
		await refetch();

		setIsRefreshing(false);
	};

	// ✅ NEW: Преобразовать достижения из БД в формат для UI с иконками
	const formattedAchievements = useMemo(
		() =>
			achievements.map((achievement) => ({
				...achievement,
				icon: iconMap[achievement.icon] || '⭐', // Fallback to star if icon not found
				earnedDate: achievement.earnedAt
					? new Date(achievement.earnedAt).toLocaleDateString('ru-RU')
					: undefined,
			})),
		[achievements]
	);

	// ✅ NEW: Категоризация достижений (как в PWA версии)
	const categorizedAchievements = useMemo(() => {
		// Постоянство (Streaks)
		const streaks = formattedAchievements.filter(
			(a) => a.name.includes('подряд') || a.name.includes('силы') || a.name.includes('постоянств')
		);

		// Вовлечённость (Milestones)
		const milestones = formattedAchievements.filter(
			(a) =>
				a.name.includes('записей') ||
				a.name.includes('побед') ||
				a.name.includes('Первые') ||
				a.name.includes('историй')
		);

		// Категории (Work, Health, Family, Gratitude, Finance, Growth, Creativity, Relationships)
		const categories = formattedAchievements.filter(
			(a) =>
				a.name.includes('Семья') ||
				a.name.includes('Здоровье') ||
				a.name.includes('Работа') ||
				a.name.includes('Благодарность') ||
				a.name.includes('Финанс') ||
				a.name.includes('развити') ||
				a.name.includes('Творч') ||
				a.name.includes('отношени')
		);

		// Осознанность и эмоции (Mindfulness & Emotions) - НОВАЯ КАТЕГОРИЯ
		const mindfulness = formattedAchievements.filter((a) => {
			const name = a.name.toLowerCase();
			return (
				name.includes('честн') ||
				name.includes('баланс') ||
				name.includes('эмоциональ') ||
				name.includes('эмоци')
			);
		});

		// Специальные (Special)
		const special = formattedAchievements.filter(
			(a) =>
				!streaks.includes(a) &&
				!milestones.includes(a) &&
				!categories.includes(a) &&
				!mindfulness.includes(a)
		);

		return { streaks, milestones, categories, mindfulness, special };
	}, [formattedAchievements]);

	// ✅ NEW: Показываем ошибку если не удалось загрузить достижения
	if (error) {
		console.error('[AchievementsScreen RN] Achievements error:', error);
		// TODO: Показать toast с ошибкой (нужен toast для React Native)
	}

	// Skeleton loading state
	if (isLoading) {
		return (
			<ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
				<View style={styles.header}>
					<SkeletonCircle size={80} />
					<SkeletonText width={120} height={24} style={{ marginTop: 12 }} />
					<SkeletonText width={160} height={16} style={{ marginTop: 8 }} />
				</View>

				<View style={styles.statsGrid}>
					{[1, 2, 3, 4].map((i) => (
						<View key={i} style={styles.statItem}>
							<SkeletonText width={40} height={28} />
							<SkeletonText width={60} height={12} style={{ marginTop: 4 }} />
						</View>
					))}
				</View>

				<View style={styles.section}>
					<SkeletonText width={100} height={20} style={{ marginBottom: 16 }} />
					{[1, 2].map((i) => (
						<SkeletonAchievementCard key={i} style={{ marginBottom: 12 }} />
					))}
				</View>
			</ScrollView>
		);
	}

	return (
		<ScrollView
			contentContainerStyle={styles.contentContainer}
			refreshControl={
				<RefreshControl
					colors={[colors.primary]}
					onRefresh={handleRefresh}
					refreshing={isRefreshing}
					tintColor={colors.primary}
				/>
			}
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			{/* Header */}
			<View style={styles.header}>
				<View style={styles.levelBadge}>
					<Text style={styles.levelIcon}>🏆</Text>
				</View>
				<Text style={styles.levelText}>Достижения</Text>
				<Text style={styles.subtitle}>
					{earnedCount} из {totalCount} заработано
				</Text>

				<View style={styles.statsGrid}>
					<View style={styles.statItem}>
						<Text style={styles.statValue}>{totalCount}</Text>
						<Text style={styles.statLabel}>Всего</Text>
					</View>
					<View style={styles.statItem}>
						<Text style={styles.statValue}>{earnedCount}</Text>
						<Text style={styles.statLabel}>Заработано</Text>
					</View>
					<View style={styles.statItem}>
						<Text style={styles.statValue}>{totalCount - earnedCount}</Text>
						<Text style={styles.statLabel}>Осталось</Text>
					</View>
					<View style={styles.statItem}>
						<Text style={styles.statValue}>{Math.round((earnedCount / totalCount) * 100)}%</Text>
						<Text style={styles.statLabel}>Прогресс</Text>
					</View>
				</View>

				<View style={styles.progressSection}>
					<View style={styles.progressHeader}>
						<Text style={styles.progressLabel}>Общий прогресс</Text>
						<Text style={styles.progressPercent}>
							{Math.round((earnedCount / totalCount) * 100)}%
						</Text>
					</View>
					<View style={styles.progressBar}>
						<View
							style={[
								styles.progressFill,
								{ width: `${Math.round((earnedCount / totalCount) * 100)}%` },
							]}
						/>
					</View>
				</View>
			</View>

			{/* ✅ NEW: Категория "Постоянство" (Streaks) */}
			{categorizedAchievements.streaks.length > 0 && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>🔥 Постоянство</Text>
					<Text style={styles.sectionDescription}>Достижения за регулярность ведения дневника</Text>
					{categorizedAchievements.streaks.map((achievement, index) => (
						<AchievementCard achievement={achievement} index={index} key={achievement.id} />
					))}
				</View>
			)}

			{/* ✅ NEW: Категория "Вовлечённость" (Milestones) */}
			{categorizedAchievements.milestones.length > 0 && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>📚 Вовлечённость</Text>
					<Text style={styles.sectionDescription}>Достижения за количество записей</Text>
					{categorizedAchievements.milestones.map((achievement, index) => (
						<AchievementCard achievement={achievement} index={index} key={achievement.id} />
					))}
				</View>
			)}

			{/* ✅ NEW: Категория "Осознанность и эмоции" (Mindfulness) */}
			{categorizedAchievements.mindfulness.length > 0 && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>🎭 Осознанность и эмоции</Text>
					<Text style={styles.sectionDescription}>
						Достижения за эмоциональный баланс и честность
					</Text>
					{categorizedAchievements.mindfulness.map((achievement, index) => (
						<AchievementCard achievement={achievement} index={index} key={achievement.id} />
					))}
				</View>
			)}

			{/* ✅ NEW: Категория "Категории" (Work, Health, Family, etc.) */}
			{categorizedAchievements.categories.length > 0 && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>🏷️ Категории</Text>
					<Text style={styles.sectionDescription}>Достижения за записи в разных категориях</Text>
					{categorizedAchievements.categories.map((achievement, index) => (
						<AchievementCard achievement={achievement} index={index} key={achievement.id} />
					))}
				</View>
			)}

			{/* ✅ NEW: Категория "Специальные" (Special) */}
			{categorizedAchievements.special.length > 0 && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>⭐ Специальные</Text>
					<Text style={styles.sectionDescription}>Уникальные достижения</Text>
					{categorizedAchievements.special.map((achievement, index) => (
						<AchievementCard achievement={achievement} index={index} key={achievement.id} />
					))}
				</View>
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F9FAFB',
	},
	contentContainer: {
		paddingBottom: 120, // Space for floating bottom tab bar
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F9FAFB',
	},
	header: {
		backgroundColor: '#FFFFFF',
		padding: 24,
		paddingTop: 60,
		alignItems: 'center',
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
	},
	levelBadge: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: '#3B82F6',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 12,
	},
	levelIcon: {
		fontSize: 40,
	},
	levelText: {
		fontSize: 24,
		fontWeight: '600',
		color: '#111827',
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 14,
		color: '#6B7280',
		marginBottom: 24,
	},
	statsGrid: {
		flexDirection: 'row',
		width: '100%',
		marginBottom: 24,
	},
	statItem: {
		flex: 1,
		alignItems: 'center',
	},
	statValue: {
		fontSize: 24,
		fontWeight: '600',
		color: '#111827',
		marginBottom: 4,
	},
	statLabel: {
		fontSize: 12,
		color: '#6B7280',
	},
	progressSection: {
		width: '100%',
	},
	progressHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	progressLabel: {
		fontSize: 14,
		fontWeight: '500',
		color: '#111827',
	},
	progressPercent: {
		fontSize: 14,
		fontWeight: '600',
		color: '#3B82F6',
	},
	progressBar: {
		height: 8,
		backgroundColor: '#E5E7EB',
		borderRadius: 4,
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		backgroundColor: '#3B82F6',
		borderRadius: 4,
	},
	section: {
		padding: 24,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: '600',
		color: '#111827',
		marginBottom: 8,
	},
	sectionDescription: {
		fontSize: 14,
		color: '#6B7280',
		marginBottom: 16,
	},
});
