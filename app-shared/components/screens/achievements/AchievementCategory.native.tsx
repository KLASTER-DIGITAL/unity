/**
 * AchievementCategory - React Native Version
 *
 * Категория достижений с заголовком и списком
 * Визуально идентична PWA версии (src/features/mobile/achievements/components/AchievementCategory.tsx)
 */

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';

interface AchievementCategoryProps {
	title: string;
	icon: string;
	children: ReactNode;
	delay?: number;
}

export function AchievementCategory({
	title,
	icon,
	children,
	delay: _delay = 0, // unused but kept for API compatibility
}: AchievementCategoryProps) {
	const { colors } = useTheme();

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.icon}>{icon}</Text>
				<Text style={[styles.title, { color: colors.text }]}>{title}</Text>
			</View>

			{/* Children (grid of achievements) */}
			<View style={styles.grid}>{children}</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 24,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		paddingHorizontal: 16,
		marginBottom: 12,
	},
	icon: {
		fontSize: 24,
	},
	title: {
		fontSize: 18,
		fontWeight: '600',
		// color будет установлен динамически через colors.text
	},
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 12,
		paddingHorizontal: 16,
	},
});
