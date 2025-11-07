import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { DesignTokens } from '@/shared/design-system/tokens';

type ProfileHeaderProps = {
	profile: {
		id: string;
		name?: string;
		email?: string;
		avatar?: string;
		diaryName?: string;
		diaryEmoji?: string;
		isPremium?: boolean; // camelCase for compatibility
		is_premium?: boolean; // snake_case from database
	};
	onEditClick: () => void;
	onPremiumClick?: () => void;
};

const DEFAULT_AVATAR_URL = 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png';

/**
 * Profile header section - React Native
 * Features:
 * - User avatar with fallback
 * - Edit button overlay
 * - User name and email display
 * - Premium badge (if user has active subscription)
 * - Diary name and emoji display
 */
export function ProfileHeader({ profile, onEditClick, onPremiumClick }: ProfileHeaderProps) {
	const handleEditPress = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		onEditClick();
	};

	const handlePremiumPress = () => {
		if (onPremiumClick) {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			onPremiumClick();
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				{/* Avatar with Edit Button */}
				<View style={styles.avatarContainer}>
					<Image
						defaultSource={{ uri: DEFAULT_AVATAR_URL }}
						source={{ uri: profile?.avatar || DEFAULT_AVATAR_URL }}
						style={styles.avatar}
					/>
					<Pressable
						accessibilityLabel="Редактировать профиль"
						onPress={handleEditPress}
						style={({ pressed }) => [styles.editButton, pressed && styles.editButtonPressed]}
					>
						<Ionicons color="#FFFFFF" name="pencil" size={16} />
					</Pressable>
				</View>

				{/* User Info - Name, Premium Badge, Email */}
				<View style={styles.userInfo}>
					{/* Name and Premium Badge Row */}
					<View style={styles.nameRow}>
						<Text numberOfLines={1} style={styles.name}>
							{profile?.name || 'Мой аккаунт'}
						</Text>
						{(profile?.is_premium || profile?.isPremium) && (
							<Pressable
								accessibilityLabel="Информация о подписке"
								onPress={handlePremiumPress}
								style={({ pressed }) => [
									styles.premiumBadge,
									pressed && styles.premiumBadgePressed,
								]}
							>
								<Ionicons color={DesignTokens.colors.warning} name="crown" size={12} />
								<Text style={styles.premiumText}>Premium</Text>
							</Pressable>
						)}
					</View>

					{/* Email */}
					<Text numberOfLines={1} style={styles.email}>
						{profile?.email}
					</Text>

					{/* Diary Name and Emoji */}
					{(profile?.diaryName || profile?.diaryEmoji) && (
						<View style={styles.diaryContainer}>
							{profile?.diaryEmoji && <Text style={styles.diaryEmoji}>{profile.diaryEmoji}</Text>}
							<Text numberOfLines={1} style={styles.diaryName}>
								{profile?.diaryName || 'Мой дневник'}
							</Text>
						</View>
					)}
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: DesignTokens.colors.card,
		borderBottomWidth: 1,
		borderBottomColor: DesignTokens.colors.border,
		paddingHorizontal: DesignTokens.spacing.xl,
		paddingVertical: DesignTokens.spacing['2xl'],
	},
	content: {
		alignItems: 'center',
	},
	avatarContainer: {
		position: 'relative',
		width: 96,
		height: 96,
	},
	avatar: {
		width: 96,
		height: 96,
		borderRadius: 48,
		borderWidth: 4,
		borderColor: `${DesignTokens.colors.primary}20`,
	},
	editButton: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: DesignTokens.colors.primary,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 2,
		borderColor: DesignTokens.colors.card,
		...DesignTokens.shadows.md,
	},
	editButtonPressed: {
		backgroundColor: DesignTokens.colors.primaryDark,
		transform: [{ scale: 0.95 }],
	},
	userInfo: {
		marginTop: DesignTokens.spacing.md,
		alignItems: 'center',
		width: '100%',
	},
	nameRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: DesignTokens.spacing.sm,
		marginBottom: DesignTokens.spacing.xs,
	},
	name: {
		fontSize: DesignTokens.fontSizes.lg,
		fontWeight: DesignTokens.fontWeights.semibold,
		color: DesignTokens.colors.text,
	},
	premiumBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingHorizontal: DesignTokens.spacing.sm,
		paddingVertical: 4,
		borderRadius: DesignTokens.borderRadius.md,
		backgroundColor: `${DesignTokens.colors.warning}10`,
		borderWidth: 1,
		borderColor: `${DesignTokens.colors.warning}20`,
	},
	premiumBadgePressed: {
		backgroundColor: `${DesignTokens.colors.warning}20`,
		transform: [{ scale: 0.95 }],
	},
	premiumText: {
		fontSize: DesignTokens.fontSizes.xs,
		fontWeight: DesignTokens.fontWeights.medium,
		color: DesignTokens.colors.warning,
	},
	email: {
		fontSize: DesignTokens.fontSizes.sm,
		color: DesignTokens.colors.textSecondary,
	},
	diaryContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: DesignTokens.spacing.sm,
		marginTop: DesignTokens.spacing.md,
		paddingHorizontal: DesignTokens.spacing.md,
		paddingVertical: DesignTokens.spacing.sm,
		borderRadius: DesignTokens.borderRadius.lg,
		backgroundColor: `${DesignTokens.colors.gray500}20`,
	},
	diaryEmoji: {
		fontSize: 20,
	},
	diaryName: {
		fontSize: DesignTokens.fontSizes.sm,
		fontWeight: DesignTokens.fontWeights.medium,
		color: DesignTokens.colors.text,
	},
});
