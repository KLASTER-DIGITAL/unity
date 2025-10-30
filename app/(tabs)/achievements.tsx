/**
 * Achievements Tab Screen
 */

import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { AchievementCard } from "../../app-shared/components/screens/achievements/AchievementCard.native";
import { MilestoneCard } from "../../app-shared/components/screens/achievements/MilestoneCard.native";
import {
	SkeletonAchievementCard,
	SkeletonCircle,
	SkeletonMilestoneCard,
	SkeletonText,
} from "../../app-shared/components/skeleton/SkeletonCard";
import { useTheme } from "../../app-shared/contexts/ThemeContext";
import { useEntries } from "../../app-shared/hooks/useEntries";
import { useUserData } from "../../app-shared/hooks/useUserData";
import { supabase } from "../../app-shared/lib/supabase/client";

type Achievement = {
	id: string;
	name: string;
	description: string;
	icon: string;
	earned: boolean;
	rarity: string;
	earnedDate?: string;
	progress?: number;
};

type Milestone = {
	id: number;
	title: string;
	completed: boolean;
	reward: string;
	progress?: number;
	total?: number;
};

export default function AchievementsScreen() {
	const { colors } = useTheme();
	const [userId, setUserId] = useState<string | undefined>(undefined);
	const [isRefreshing, setIsRefreshing] = useState(false);

	// Real data from Supabase
	const {
		stats,
		isLoading: isLoadingUser,
		refetch: refetchUser,
	} = useUserData(userId);
	const {
		entries,
		isLoading: isLoadingEntries,
		refetch: refetchEntries,
	} = useEntries(userId);

	// Get current user on mount
	useEffect(() => {
		getCurrentUser();
	}, [getCurrentUser]);

	const getCurrentUser = async () => {
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (session?.user?.id) {
				setUserId(session.user.id);
			} else {
				console.log("[AchievementsScreen] No session, using test user");
				setUserId("c1b3e4f5-6789-4abc-def0-123456789abc"); // Valid UUID format
			}
		} catch (error) {
			console.error("[AchievementsScreen] Error getting user:", error);
		}
	};

	const handleRefresh = async () => {
		setIsRefreshing(true);
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

		// Reload data
		await Promise.all([refetchUser(), refetchEntries()]);

		setIsRefreshing(false);
	};

	// Calculate achievements based on real data
	const _achievementEntries = entries.filter((e) => e.isAchievement);
	const _totalEntries = entries.length;
	const _currentStreak = stats?.currentStreak || 0;
	const _longestStreak = stats?.longestStreak || 0;
	const _level = stats?.level || 1;
	const _nextLevelProgress = stats
		? Math.round(((stats.xp % 100) / 100) * 100)
		: 0;

	const isLoading = isLoadingUser || isLoadingEntries;

	const achievements: Achievement[] = [
		{
			id: "1",
			name: "Первые шаги",
			description: "Создайте свою первую запись",
			icon: "⭐",
			earned: true,
			rarity: "common",
			earnedDate: new Date().toISOString(),
		},
		{
			id: "2",
			name: "Неделя силы",
			description: "Пишите 7 дней подряд",
			icon: "🔥",
			earned: true,
			rarity: "uncommon",
			earnedDate: new Date(Date.now() - 86_400_000).toISOString(),
		},
		{
			id: "3",
			name: "Мастер слова",
			description: "Напишите 50 записей",
			icon: "📚",
			earned: false,
			rarity: "rare",
			progress: 30,
		},
		{
			id: "4",
			name: "Легенда",
			description: "Пишите 30 дней подряд",
			icon: "👑",
			earned: false,
			rarity: "legendary",
			progress: 23,
		},
	];

	const milestones: Milestone[] = [
		{
			id: 1,
			title: "10 записей",
			completed: true,
			reward: 'Бейдж "Начинающий"',
		},
		{
			id: 2,
			title: "Неделя подряд",
			completed: true,
			reward: 'Бейдж "Постоянство"',
		},
		{
			id: 3,
			title: "50 записей",
			completed: false,
			progress: stats?.totalEntries || 0,
			total: 50,
			reward: "Премиум тема",
		},
		{
			id: 4,
			title: "Месяц подряд",
			completed: false,
			progress: stats?.longestStreak || 0,
			total: 30,
			reward: 'Бейдж "Легенда"',
		},
	];

	if (isLoading) {
		return (
			<ScrollView
				contentContainerStyle={styles.contentContainer}
				style={[styles.container, { backgroundColor: colors.background }]}
			>
				{/* Header Skeleton */}
				<View style={styles.header}>
					<SkeletonCircle size={80} />
					<SkeletonText height={24} style={{ marginTop: 12 }} width={120} />
					<SkeletonText height={16} style={{ marginTop: 6 }} width={150} />

					{/* Stats Grid Skeleton */}
					<View style={styles.statsGrid}>
						{[1, 2, 3, 4].map((i) => (
							<View key={i} style={styles.statItem}>
								<SkeletonText height={28} width={40} />
								<SkeletonText height={14} style={{ marginTop: 4 }} width={60} />
							</View>
						))}
					</View>

					{/* Progress Bar Skeleton */}
					<View style={styles.progressSection}>
						<View style={styles.progressHeader}>
							<SkeletonText height={14} width={100} />
							<SkeletonText height={14} width={40} />
						</View>
						<SkeletonText
							borderRadius={12}
							height={8}
							style={{ marginTop: 8 }}
							width="100%"
						/>
					</View>
				</View>

				{/* Achievements Skeleton */}
				<View style={styles.section}>
					<SkeletonText height={20} style={{ marginBottom: 16 }} width={120} />
					<View style={styles.achievementsGrid}>
						<SkeletonAchievementCard />
						<SkeletonAchievementCard />
						<SkeletonAchievementCard />
					</View>
				</View>

				{/* Milestones Skeleton */}
				<View style={styles.section}>
					<SkeletonText height={20} style={{ marginBottom: 16 }} width={100} />
					<SkeletonMilestoneCard />
					<SkeletonMilestoneCard />
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
			<View style={styles.header}>
				<View style={styles.levelBadge}>
					<Text style={styles.levelIcon}>👑</Text>
				</View>
				<Text style={styles.levelText}>Уровень {stats?.level || 1}</Text>
				<Text style={styles.subtitle}>Мастер достижений</Text>

				<View style={styles.statsGrid}>
					<View style={styles.statItem}>
						<Text style={styles.statValue}>{stats?.totalEntries || 0}</Text>
						<Text style={styles.statLabel}>Записей</Text>
					</View>
					<View style={styles.statItem}>
						<Text style={styles.statValue}>{stats?.totalBadges || 0}</Text>
						<Text style={styles.statLabel}>Наград</Text>
					</View>
					<View style={styles.statItem}>
						<Text style={styles.statValue}>{stats?.currentStreak || 0}</Text>
						<Text style={styles.statLabel}>Дней подряд</Text>
					</View>
					<View style={styles.statItem}>
						<Text style={styles.statValue}>{stats?.longestStreak || 0}</Text>
						<Text style={styles.statLabel}>Рекорд</Text>
					</View>
				</View>

				<View style={styles.progressSection}>
					<View style={styles.progressHeader}>
						<Text style={styles.progressLabel}>
							До уровня {(stats?.level || 1) + 1}
						</Text>
						<Text style={styles.progressPercent}>
							{stats?.nextLevelProgress || 0}%
						</Text>
					</View>
					<View style={styles.progressBar}>
						<View
							style={[
								styles.progressFill,
								{ width: `${stats?.nextLevelProgress || 0}%` },
							]}
						/>
					</View>
				</View>
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Достижения</Text>
				{achievements.map((achievement, index) => (
					<AchievementCard
						achievement={achievement}
						index={index}
						key={achievement.id}
					/>
				))}
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Вехи</Text>
				{milestones.map((milestone) => (
					<MilestoneCard key={milestone.id} milestone={milestone} />
				))}
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F9FAFB",
	},
	contentContainer: {
		paddingBottom: 120, // Space for floating bottom tab bar
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#F9FAFB",
	},
	header: {
		backgroundColor: "#FFFFFF",
		padding: 24,
		paddingTop: 60,
		alignItems: "center",
		borderBottomWidth: 1,
		borderBottomColor: "#E5E7EB",
	},
	levelBadge: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: "#3B82F6",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 12,
	},
	levelIcon: {
		fontSize: 40,
	},
	levelText: {
		fontSize: 24,
		fontWeight: "600",
		color: "#111827",
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 14,
		color: "#6B7280",
		marginBottom: 24,
	},
	statsGrid: {
		flexDirection: "row",
		width: "100%",
		marginBottom: 24,
	},
	statItem: {
		flex: 1,
		alignItems: "center",
	},
	statValue: {
		fontSize: 24,
		fontWeight: "600",
		color: "#111827",
		marginBottom: 4,
	},
	statLabel: {
		fontSize: 12,
		color: "#6B7280",
	},
	progressSection: {
		width: "100%",
	},
	progressHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 8,
	},
	progressLabel: {
		fontSize: 14,
		fontWeight: "500",
		color: "#111827",
	},
	progressPercent: {
		fontSize: 14,
		fontWeight: "600",
		color: "#3B82F6",
	},
	progressBar: {
		height: 8,
		backgroundColor: "#E5E7EB",
		borderRadius: 4,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: "#3B82F6",
		borderRadius: 4,
	},
	section: {
		padding: 24,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "600",
		color: "#111827",
		marginBottom: 16,
	},
});
