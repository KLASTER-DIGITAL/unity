import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { DesignTokens } from '../../../design-system/tokens';

interface AchievementHeaderProps {
	userName?: string;
	daysInApp?: number;
	userEmail?: string;
	avatarUrl?: string;
	onNavigateToSettings?: () => void;
	onNavigateToHistory?: () => void;
}

// Дефолтное фото для аватара
const DEFAULT_AVATAR_URL = 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png';

// Компонент аватарки - memoized
const UserAvatar = memo(function UserAvatar({
	_userName,
	avatarUrl,
	_onClick,
}: {
	userName?: string;
	avatarUrl?: string;
	onClick?: () => void;
}) {
	// Используем дефолтное фото если нет аватара
	const displayAvatarUrl = avatarUrl || DEFAULT_AVATAR_URL;

	const handlePress = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		onClick?.();
	};

	return (
		<Pressable
			accessibilityLabel="Перейти в настройки профиля"
			onPress={handlePress}
			style={({ pressed }) => [styles.avatarContainer, pressed && styles.avatarPressed]}
		>
			<View style={styles.avatarWrapper}>
				<Image
					defaultSource={{ uri: DEFAULT_AVATAR_URL }}
					source={{ uri: displayAvatarUrl }}
					style={styles.avatar}
				/>

				{/* Network status indicator - зеленая точка с пульсацией */}
				<View style={styles.onlineIndicator}>
					<View style={styles.onlinePulse} />
				</View>
			</View>
		</Pressable>
	);
});

export const AchievementHeader = memo(function AchievementHeader({
	userName = 'Пользователь',
	daysInApp = 1,
	avatarUrl,
	onNavigateToSettings,
}: AchievementHeaderProps) {
	return (
		<View style={styles.container}>
			{/* Top Bar - аватарка, приветствие и счетчик дней */}
			<View style={styles.topBar}>
				{/* Left: Avatar + Greeting */}
				<View style={styles.leftSection}>
					{/* Avatar with online pulse - клик переходит в настройки */}
					<UserAvatar avatarUrl={avatarUrl} onClick={onNavigateToSettings} userName={userName} />

					{/* Greeting */}
					<View style={styles.greetingContainer}>
						{/* Приветствие */}
						<View style={styles.greetingRow}>
							<Ionicons color={DesignTokens.colors.primary} name="hand-left" size={22} />
							<Text numberOfLines={1} style={styles.greeting}>
								Привет {userName.charAt(0).toUpperCase() + userName.slice(1)},
							</Text>
						</View>
						{/* Вопрос */}
						<Text numberOfLines={1} style={styles.question}>
							Какие твои победы сегодня?
						</Text>
					</View>
				</View>

				{/* Right: Days Counter */}
				<View style={styles.daysCounter}>
					{/* Кружок с обводкой */}
					<View style={styles.circle}>
						<Text style={styles.daysNumber}>{daysInApp}</Text>
						<Text style={styles.daysLabel}>День</Text>
					</View>
				</View>
			</View>
		</View>
	);
});

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: DesignTokens.responsiveSpacing.sectionPaddingX,
		paddingTop: DesignTokens.responsiveSpacing.sectionPaddingY,
		paddingBottom: DesignTokens.responsiveSpacing.sectionPaddingY,
		backgroundColor: DesignTokens.colors.background,
	},
	topBar: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: DesignTokens.spacing.md,
	},
	leftSection: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: DesignTokens.spacing.lg,
		flex: 1,
		minWidth: 0,
	},
	avatarContainer: {
		position: 'relative',
		flexShrink: 0,
	},
	avatarPressed: {
		opacity: 0.7,
	},
	avatarWrapper: {
		width: 46,
		height: 46,
		borderRadius: 23,
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
		overflow: 'hidden',
		...DesignTokens.shadows.sm,
	},
	avatar: {
		width: '100%',
		height: '100%',
	},
	onlineIndicator: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		width: 14,
		height: 14,
		borderRadius: 7,
		backgroundColor: DesignTokens.colors.success,
		borderWidth: 2,
		borderColor: DesignTokens.colors.background,
	},
	onlinePulse: {
		width: '100%',
		height: '100%',
		borderRadius: 7,
		backgroundColor: DesignTokens.colors.success,
	},
	greetingContainer: {
		flex: 1,
		minWidth: 0,
	},
	greetingRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: DesignTokens.spacing.xs,
	},
	greeting: {
		fontSize: DesignTokens.fontSizes.h3,
		fontWeight: DesignTokens.fontWeights.semibold,
		color: DesignTokens.colors.text,
		letterSpacing: DesignTokens.letterSpacing.tight,
		lineHeight: DesignTokens.fontSizes.h3 * DesignTokens.lineHeights.tight,
	},
	question: {
		fontSize: DesignTokens.fontSizes.bodySmall,
		color: DesignTokens.colors.textSecondary,
		lineHeight: DesignTokens.fontSizes.bodySmall * DesignTokens.lineHeights.normal,
		marginTop: 2,
	},
	daysCounter: {
		width: 130,
		height: 130,
		flexShrink: 0,
		alignItems: 'center',
		justifyContent: 'center',
	},
	circle: {
		width: 120,
		height: 120,
		borderRadius: 60,
		borderWidth: 2,
		borderColor: DesignTokens.colors.border,
		alignItems: 'center',
		justifyContent: 'center',
		...DesignTokens.shadows.sm,
		backgroundColor: DesignTokens.colors.background,
	},
	daysNumber: {
		fontSize: 44,
		fontWeight: DesignTokens.fontWeights.semibold,
		color: DesignTokens.colors.success,
		lineHeight: 48,
	},
	daysLabel: {
		fontSize: DesignTokens.fontSizes.caption,
		color: DesignTokens.colors.textSecondary,
		lineHeight: DesignTokens.fontSizes.caption * DesignTokens.lineHeights.normal,
	},
});
