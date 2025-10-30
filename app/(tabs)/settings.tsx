/**
 * Settings Tab Screen
 */

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	View,
} from "react-native";
import { useTheme } from "../../app-shared/contexts/ThemeContext";
import { DesignTokens } from "../../app-shared/design-system/tokens";

const MOCK_USER = {
	name: "Анна",
	email: "anna@example.com",
	avatar: "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png",
};

export default function SettingsScreen() {
	const { colors, isDark, themeMode, setTheme } = useTheme();
	const [notificationsEnabled, setNotificationsEnabled] = useState(true);
	const [soundEnabled, setSoundEnabled] = useState(true);

	const handleToggle = (
		setter: (value: boolean) => void,
		currentValue: boolean,
	) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		setter(!currentValue);
	};

	const handlePress = (action: string) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		console.log(`Action: ${action}`);
	};

	const handleLogout = () => {
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
		console.log("Logout");
	};

	return (
		<ScrollView
			contentContainerStyle={styles.contentContainer}
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			{/* Profile Section */}
			<View
				style={[
					styles.profileSection,
					{ backgroundColor: colors.card, borderColor: colors.border },
				]}
			>
				<Image source={{ uri: MOCK_USER.avatar }} style={styles.avatar} />
				<View style={styles.profileInfo}>
					<Text style={[styles.profileName, { color: colors.text }]}>
						{MOCK_USER.name}
					</Text>
					<Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
						{MOCK_USER.email}
					</Text>
				</View>
				<Pressable
					onPress={() => handlePress("edit_profile")}
					style={({ pressed }) => [
						styles.editButton,
						pressed && styles.buttonPressed,
					]}
				>
					<Ionicons color={colors.primary} name="create-outline" size={20} />
				</Pressable>
			</View>

			{/* Notifications */}
			<View style={styles.section}>
				<Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
					Уведомления
				</Text>

				<View
					style={[
						styles.settingItem,
						{ backgroundColor: colors.card, borderColor: colors.border },
					]}
				>
					<View style={styles.settingLeft}>
						<View
							style={[
								styles.iconContainer,
								{ backgroundColor: `${colors.primary}20` },
							]}
						>
							<Ionicons color={colors.primary} name="notifications" size={20} />
						</View>
						<View style={styles.settingText}>
							<Text style={[styles.settingTitle, { color: colors.text }]}>
								Push-уведомления
							</Text>
							<Text
								style={[
									styles.settingDescription,
									{ color: colors.textSecondary },
								]}
							>
								Получать напоминания о записях
							</Text>
						</View>
					</View>
					<Switch
						onValueChange={() =>
							handleToggle(setNotificationsEnabled, notificationsEnabled)
						}
						thumbColor={colors.background}
						trackColor={{ false: colors.gray300, true: colors.primary }}
						value={notificationsEnabled}
					/>
				</View>

				<View
					style={[
						styles.settingItem,
						{ backgroundColor: colors.card, borderColor: colors.border },
					]}
				>
					<View style={styles.settingLeft}>
						<View
							style={[
								styles.iconContainer,
								{ backgroundColor: `${colors.warning}20` },
							]}
						>
							<Ionicons color={colors.warning} name="volume-high" size={20} />
						</View>
						<View style={styles.settingText}>
							<Text style={[styles.settingTitle, { color: colors.text }]}>
								Звуки
							</Text>
							<Text
								style={[
									styles.settingDescription,
									{ color: colors.textSecondary },
								]}
							>
								Звуковые эффекты в приложении
							</Text>
						</View>
					</View>
					<Switch
						onValueChange={() => handleToggle(setSoundEnabled, soundEnabled)}
						thumbColor={colors.background}
						trackColor={{ false: colors.gray300, true: colors.primary }}
						value={soundEnabled}
					/>
				</View>
			</View>

			{/* Appearance */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Внешний вид</Text>

				<View style={styles.settingItem}>
					<View style={styles.settingLeft}>
						<View
							style={[
								styles.iconContainer,
								{ backgroundColor: `${colors.primary}20` },
							]}
						>
							<Ionicons
								color={colors.primary}
								name={isDark ? "moon" : "sunny"}
								size={20}
							/>
						</View>
						<View style={styles.settingText}>
							<Text style={[styles.settingTitle, { color: colors.text }]}>
								Темная тема
							</Text>
							<Text
								style={[
									styles.settingDescription,
									{ color: colors.textSecondary },
								]}
							>
								{themeMode === "system"
									? "Следовать системной теме"
									: isDark
										? "Темное оформление"
										: "Светлое оформление"}
							</Text>
						</View>
					</View>
					<Switch
						onValueChange={async () => {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
							const newMode = isDark ? "light" : "dark";
							await setTheme(newMode);
						}}
						thumbColor={colors.background}
						trackColor={{ false: colors.gray300, true: colors.primary }}
						value={isDark}
					/>
				</View>

				<Pressable
					onPress={() => handlePress("language")}
					style={({ pressed }) => [
						styles.settingItem,
						pressed && styles.itemPressed,
					]}
				>
					<View style={styles.settingLeft}>
						<View
							style={[
								styles.iconContainer,
								{ backgroundColor: `${DesignTokens.colors.success}20` },
							]}
						>
							<Ionicons
								color={DesignTokens.colors.success}
								name="language"
								size={20}
							/>
						</View>
						<View style={styles.settingText}>
							<Text style={styles.settingTitle}>Язык</Text>
							<Text style={styles.settingDescription}>Русский</Text>
						</View>
					</View>
					<Ionicons
						color={DesignTokens.colors.textTertiary}
						name="chevron-forward"
						size={20}
					/>
				</Pressable>
			</View>

			{/* Account */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Аккаунт</Text>

				<Pressable
					onPress={() => handlePress("privacy")}
					style={({ pressed }) => [
						styles.settingItem,
						pressed && styles.itemPressed,
					]}
				>
					<View style={styles.settingLeft}>
						<View
							style={[
								styles.iconContainer,
								{ backgroundColor: `${DesignTokens.colors.systemBlue}20` },
							]}
						>
							<Ionicons
								color={DesignTokens.colors.systemBlue}
								name="shield-checkmark"
								size={20}
							/>
						</View>
						<View style={styles.settingText}>
							<Text style={styles.settingTitle}>Конфиденциальность</Text>
						</View>
					</View>
					<Ionicons
						color={DesignTokens.colors.textTertiary}
						name="chevron-forward"
						size={20}
					/>
				</Pressable>
			</View>

			{/* Logout Button */}
			<Pressable
				onPress={handleLogout}
				style={({ pressed }) => [
					styles.logoutButton,
					pressed && styles.buttonPressed,
				]}
			>
				<Ionicons
					color={DesignTokens.colors.error}
					name="log-out-outline"
					size={20}
				/>
				<Text style={styles.logoutText}>Выйти из аккаунта</Text>
			</Pressable>

			<View style={{ height: 100 }} />
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: DesignTokens.colors.backgroundSecondary,
	},
	contentContainer: {
		paddingTop: DesignTokens.responsiveSpacing.headerPaddingTop,
		paddingBottom: 120, // Space for floating bottom tab bar
	},
	profileSection: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: DesignTokens.colors.card,
		padding: DesignTokens.spacing.xl,
		marginBottom: DesignTokens.spacing.lg,
		...DesignTokens.shadows.sm,
	},
	avatar: {
		width: 64,
		height: 64,
		borderRadius: 32,
		borderWidth: 2,
		borderColor: DesignTokens.colors.border,
	},
	profileInfo: {
		flex: 1,
		marginLeft: DesignTokens.spacing.lg,
	},
	profileName: {
		fontSize: DesignTokens.fontSizes.h3,
		fontWeight: DesignTokens.fontWeights.semibold,
		color: DesignTokens.colors.text,
		marginBottom: DesignTokens.spacing.xs,
	},
	profileEmail: {
		fontSize: DesignTokens.fontSizes.bodySmall,
		color: DesignTokens.colors.textSecondary,
	},
	editButton: {
		width: DesignTokens.touchTargets.minimum,
		height: DesignTokens.touchTargets.minimum,
		borderRadius: DesignTokens.borderRadius.full,
		backgroundColor: `${DesignTokens.colors.primary}10`,
		alignItems: "center",
		justifyContent: "center",
	},
	buttonPressed: {
		opacity: 0.7,
	},
	section: {
		marginBottom: DesignTokens.spacing.xl,
	},
	sectionTitle: {
		fontSize: DesignTokens.fontSizes.footnote,
		fontWeight: DesignTokens.fontWeights.semibold,
		color: DesignTokens.colors.textSecondary,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		paddingHorizontal: DesignTokens.spacing.xl,
		marginBottom: DesignTokens.spacing.md,
	},
	settingItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: DesignTokens.colors.card,
		paddingVertical: DesignTokens.spacing.md,
		paddingHorizontal: DesignTokens.spacing.xl,
		borderBottomWidth: 1,
		borderBottomColor: DesignTokens.colors.border,
		minHeight: DesignTokens.touchTargets.comfortable,
	},
	itemPressed: {
		backgroundColor: DesignTokens.colors.gray50,
	},
	settingLeft: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	iconContainer: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: "center",
		justifyContent: "center",
		marginRight: DesignTokens.spacing.md,
	},
	settingText: {
		flex: 1,
	},
	settingTitle: {
		fontSize: DesignTokens.fontSizes.body,
		fontWeight: DesignTokens.fontWeights.medium,
		color: DesignTokens.colors.text,
	},
	settingDescription: {
		fontSize: DesignTokens.fontSizes.caption,
		color: DesignTokens.colors.textSecondary,
		marginTop: 2,
	},
	logoutButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: DesignTokens.colors.card,
		paddingVertical: DesignTokens.spacing.lg,
		marginHorizontal: DesignTokens.spacing.xl,
		borderRadius: DesignTokens.borderRadius.lg,
		gap: DesignTokens.spacing.sm,
		...DesignTokens.shadows.sm,
	},
	logoutText: {
		fontSize: DesignTokens.fontSizes.body,
		fontWeight: DesignTokens.fontWeights.semibold,
		color: DesignTokens.colors.error,
	},
});
