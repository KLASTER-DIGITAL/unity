import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { DesignTokens } from "../../../design-system/tokens";

interface SearchBarProps {
	searchQuery: string;
	showFilters: boolean;
	activeFiltersCount: number;
	onSearchChange: (query: string) => void;
	onToggleFilters: () => void;
}

/**
 * Search Bar Component - React Native
 * Search input and filters toggle button
 */
export function SearchBar({
	searchQuery,
	activeFiltersCount,
	onSearchChange,
	onToggleFilters,
}: SearchBarProps) {
	const handleFilterPress = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		onToggleFilters();
	};

	return (
		<View style={styles.container}>
			{/* Search Input */}
			<View style={styles.searchContainer}>
				<Ionicons
					color={DesignTokens.colors.textSecondary}
					name="search"
					size={20}
				/>
				<TextInput
					onChangeText={onSearchChange}
					placeholder="Поиск по записям..."
					placeholderTextColor={DesignTokens.colors.textTertiary}
					style={styles.searchInput}
					value={searchQuery}
				/>
			</View>

			{/* Filters Button */}
			<Pressable
				onPress={handleFilterPress}
				style={({ pressed }) => [
					styles.filterButton,
					pressed && styles.filterButtonPressed,
				]}
			>
				<Ionicons
					color={DesignTokens.colors.text}
					name="options-outline"
					size={20}
				/>
				{activeFiltersCount > 0 && (
					<View style={styles.badge}>
						<Text style={styles.badgeText}>{activeFiltersCount}</Text>
					</View>
				)}
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		gap: DesignTokens.spacing.md,
		alignItems: "center",
	},
	searchContainer: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: DesignTokens.colors.gray50,
		borderRadius: DesignTokens.borderRadius.lg,
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
		paddingHorizontal: DesignTokens.spacing.md,
		paddingVertical: DesignTokens.spacing.sm + 2,
		gap: DesignTokens.spacing.sm,
	},
	searchInput: {
		flex: 1,
		fontSize: DesignTokens.fontSizes.bodySmall,
		color: DesignTokens.colors.text,
		padding: 0,
	},
	filterButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: DesignTokens.spacing.sm,
		paddingHorizontal: DesignTokens.spacing.lg,
		paddingVertical: DesignTokens.spacing.md,
		backgroundColor: `${DesignTokens.colors.primary}10`,
		borderRadius: DesignTokens.borderRadius.lg,
		position: "relative",
	},
	filterButtonPressed: {
		opacity: 0.7,
	},
	badge: {
		position: "absolute",
		top: -4,
		right: -4,
		backgroundColor: DesignTokens.colors.primary,
		borderRadius: DesignTokens.borderRadius.full,
		minWidth: 20,
		height: 20,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: DesignTokens.spacing.xs + 2,
	},
	badgeText: {
		color: DesignTokens.colors.background,
		fontSize: DesignTokens.fontSizes.caption,
		fontWeight: DesignTokens.fontWeights.semibold,
	},
});
