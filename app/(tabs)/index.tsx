/**
 * Home Tab Screen - Achievement Home
 */

import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { LottiePreloader } from '../../app-shared/components/LottiePreloader.native';
import { AchievementHeader } from '../../app-shared/components/screens/home/AchievementHeader.native';
import { ChatInputSection } from '../../app-shared/components/screens/home/ChatInputSection.native';
import { RecentEntriesFeed } from '../../app-shared/components/screens/home/RecentEntriesFeed.native';
import { useTheme } from '../../app-shared/contexts/ThemeContext';
import { useEntries } from '../../app-shared/hooks/useEntries';
import { useUserData } from '../../app-shared/hooks/useUserData';
import { supabase } from '../../app-shared/lib/supabase/client';

export default function HomeScreen() {
	const router = useRouter();
	const { colors } = useTheme();
	const [userId, setUserId] = useState<string | undefined>(undefined);
	const [isRefreshing, setIsRefreshing] = useState(false);

	// Real data from Supabase
	const { profile, stats, isLoading: isLoadingUser, refetch: refetchUser } = useUserData(userId);
	const { isLoading: isLoadingEntries, refetch: refetchEntries } = useEntries(userId);

	// Get current user on mount
	// biome-ignore lint/correctness/useExhaustiveDependencies: getCurrentUser is stable
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
				// Fallback to test user for development (Rustam's real UUID)
				console.log('[HomeScreen] No session, using test user');
				// TODO: Implement proper auth flow
				setUserId('c1b3e4f5-6789-4abc-def0-123456789abc'); // Valid UUID format
			}
		} catch (error) {
			console.error('[HomeScreen] Error getting user:', error);
		}
	};

	// biome-ignore lint/suspicious/noExplicitAny: Dynamic entry type
	const handleNewEntry = (entry: any) => {
		console.log('[HomeScreen] New entry created:', entry);
		// Reload data
		refetchUser();
		refetchEntries();
	};

	const handleNavigateToSettings = () => {
		router.push('/settings');
	};

	const handleNavigateToHistory = () => {
		router.push('/diary');
	};

	const handleRefresh = async () => {
		setIsRefreshing(true);
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

		// Reload data
		await Promise.all([refetchUser(), refetchEntries()]);

		setIsRefreshing(false);
	};

	// Extract user data
	const userName = profile?.name || 'Пользователь';
	const userEmail = profile?.email || '';
	const avatarUrl = profile?.avatar || 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png';
	const daysInApp = stats?.currentStreak || 1;

	// Show loading state
	const isLoading = isLoadingUser || isLoadingEntries;

	if (isLoading && !profile) {
		return (
			<LottiePreloader
				message="Загрузка данных..."
				minDuration={1000}
				showMessage={true}
				size="md"
			/>
		);
	}

	// Create userData object for compatibility with existing components
	const userData = {
		user: { id: userId },
		profile: {
			name: userName,
			email: userEmail,
			avatar: avatarUrl,
		},
		language: 'ru',
	};

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
			showsVerticalScrollIndicator={false}
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			{/* Achievement Header */}
			<AchievementHeader
				avatarUrl={avatarUrl}
				daysInApp={daysInApp}
				onNavigateToHistory={handleNavigateToHistory}
				onNavigateToSettings={handleNavigateToSettings}
				userEmail={userEmail}
				userName={userName}
			/>

			{/* Chat Input Section */}
			<ChatInputSection
				onEntrySaved={handleNewEntry}
				onMessageSent={(message) => {
					console.log('New achievement message:', message);
				}}
				userId={userData?.user?.id || userData?.id || 'anonymous'}
				userName={userName}
			/>

			{/* Recent Entries Feed */}
			<RecentEntriesFeed
				language={userData?.language || 'ru'}
				onEntryClick={(entry) => {
					console.log('Entry clicked:', entry);
					// TODO: Open entry detail modal
				}}
				onViewAllClick={handleNavigateToHistory}
				userData={userData}
			/>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	contentContainer: {
		paddingBottom: 120, // Space for floating bottom tab bar
	},
});
