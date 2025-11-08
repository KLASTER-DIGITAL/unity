/**
 * Onboarding Step 4 - React Native Implementation
 *
 * Fourth onboarding screen for first entry and notification settings
 * Visual parity with PWA OnboardingScreen4
 *
 * @module app/onboarding/step4
 */

import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { DesignTokens } from '../../app-shared/design-system/tokens';

type NotificationTime = 'none' | 'morning' | 'evening' | 'both';

export default function OnboardingStep4() {
	const [firstEntry, setFirstEntry] = useState('');
	const [notificationTime, setNotificationTime] = useState<NotificationTime>('none');

	const handleComplete = () => {
		// Save first entry and notification settings
		// Navigate to main app
		router.replace('/(tabs)');
	};

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				<View style={styles.contentSection}>
					<Text style={styles.title}>Начните свой путь</Text>
					<Text style={styles.subtitle}>Сделайте первую запись и настройте напоминания</Text>

					{/* First Entry Input */}
					<View style={styles.formGroup}>
						<Text style={styles.label}>Ваша первая запись (необязательно)</Text>
						<TextInput
							style={styles.textArea}
							placeholder="Сегодня я начинаю вести дневник..."
							placeholderTextColor={DesignTokens.colors.textTertiary}
							value={firstEntry}
							onChangeText={setFirstEntry}
							multiline
							numberOfLines={6}
							textAlignVertical="top"
						/>
					</View>

					{/* Notification Settings */}
					<View style={styles.formGroup}>
						<Text style={styles.label}>Напоминания</Text>
						<Text style={styles.hint}>Когда вы хотите получать напоминания о записи?</Text>

						<View style={styles.notificationOptions}>
							<NotificationOption
								label="Без напоминаний"
								value="none"
								selected={notificationTime === 'none'}
								onSelect={() => setNotificationTime('none')}
							/>
							<NotificationOption
								label="Утром (9:00)"
								value="morning"
								selected={notificationTime === 'morning'}
								onSelect={() => setNotificationTime('morning')}
							/>
							<NotificationOption
								label="Вечером (21:00)"
								value="evening"
								selected={notificationTime === 'evening'}
								onSelect={() => setNotificationTime('evening')}
							/>
							<NotificationOption
								label="Утром и вечером"
								value="both"
								selected={notificationTime === 'both'}
								onSelect={() => setNotificationTime('both')}
							/>
						</View>
					</View>

					{/* Progress Indicator */}
					<View style={styles.progressContainer}>
						<View style={[styles.progressDot, styles.progressDotActive]} />
						<View style={[styles.progressDot, styles.progressDotActive]} />
						<View style={[styles.progressDot, styles.progressDotActive]} />
						<View style={[styles.progressDot, styles.progressDotActive]} />
					</View>

					{/* Complete Button */}
					<Pressable
						onPress={handleComplete}
						style={({ pressed }) => [
							styles.completeButton,
							pressed && styles.completeButtonPressed,
						]}
					>
						<Text style={styles.completeButtonText}>Начать использовать UNITY</Text>
						<Text style={styles.checkmark}>✓</Text>
					</Pressable>
				</View>
			</ScrollView>
		</View>
	);
}

// ============================================================================
// NOTIFICATION OPTION COMPONENT
// ============================================================================

type NotificationOptionProps = {
	label: string;
	value: string;
	selected: boolean;
	onSelect: () => void;
};

function NotificationOption({ label, selected, onSelect }: NotificationOptionProps) {
	return (
		<Pressable
			onPress={onSelect}
			style={({ pressed }) => [
				styles.notificationOption,
				selected && styles.notificationOptionSelected,
				pressed && styles.notificationOptionPressed,
			]}
		>
			<View style={[styles.radio, selected && styles.radioSelected]}>
				{selected && <View style={styles.radioInner} />}
			</View>
			<Text style={[styles.notificationLabel, selected && styles.notificationLabelSelected]}>
				{label}
			</Text>
		</Pressable>
	);
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: DesignTokens.colors.card,
	},
	scrollContent: {
		flexGrow: 1,
	},
	contentSection: {
		flex: 1,
		paddingHorizontal: DesignTokens.spacing.xl,
		paddingVertical: DesignTokens.spacing.xxl,
		gap: DesignTokens.spacing.lg,
	},
	title: {
		fontSize: DesignTokens.fontSizes.h1,
		fontWeight: '700',
		color: DesignTokens.colors.text,
		textAlign: 'center',
		marginTop: DesignTokens.spacing.xxl,
	},
	subtitle: {
		fontSize: DesignTokens.fontSizes.body,
		color: DesignTokens.colors.textSecondary,
		textAlign: 'center',
		lineHeight: 24,
	},
	formGroup: {
		gap: DesignTokens.spacing.sm,
		marginTop: DesignTokens.spacing.md,
	},
	label: {
		fontSize: DesignTokens.fontSizes.bodySmall,
		fontWeight: '500',
		color: DesignTokens.colors.text,
	},
	hint: {
		fontSize: DesignTokens.fontSizes.caption,
		color: DesignTokens.colors.textSecondary,
	},
	textArea: {
		backgroundColor: DesignTokens.colors.backgroundSecondary,
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
		borderRadius: DesignTokens.borderRadius.lg,
		paddingHorizontal: DesignTokens.spacing.md,
		paddingVertical: DesignTokens.spacing.md,
		fontSize: DesignTokens.fontSizes.body,
		color: DesignTokens.colors.text,
		minHeight: 120,
	},
	notificationOptions: {
		gap: DesignTokens.spacing.sm,
		marginTop: DesignTokens.spacing.sm,
	},
	notificationOption: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: DesignTokens.spacing.md,
		backgroundColor: DesignTokens.colors.backgroundSecondary,
		padding: DesignTokens.spacing.md,
		borderRadius: DesignTokens.borderRadius.lg,
		borderWidth: 2,
		borderColor: 'transparent',
		minHeight: 44,
	},
	notificationOptionSelected: {
		borderColor: DesignTokens.colors.primary,
		backgroundColor: `${DesignTokens.colors.primaryLight}10`,
	},
	notificationOptionPressed: {
		opacity: 0.7,
	},
	radio: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: DesignTokens.colors.border,
		alignItems: 'center',
		justifyContent: 'center',
	},
	radioSelected: {
		borderColor: DesignTokens.colors.primary,
	},
	radioInner: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: DesignTokens.colors.primary,
	},
	notificationLabel: {
		fontSize: DesignTokens.fontSizes.body,
		color: DesignTokens.colors.text,
	},
	notificationLabelSelected: {
		fontWeight: '500',
	},
	progressContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: DesignTokens.spacing.sm,
		marginTop: DesignTokens.spacing.xl,
	},
	progressDot: {
		width: 8,
		height: 6,
		borderRadius: 4,
		backgroundColor: DesignTokens.colors.border,
	},
	progressDotActive: {
		width: 25,
		backgroundColor: DesignTokens.colors.primary,
	},
	completeButton: {
		flexDirection: 'row',
		backgroundColor: DesignTokens.colors.success,
		paddingVertical: DesignTokens.spacing.md,
		borderRadius: DesignTokens.borderRadius.lg,
		alignItems: 'center',
		justifyContent: 'center',
		gap: DesignTokens.spacing.sm,
		minHeight: 44,
		marginTop: DesignTokens.spacing.lg,
	},
	completeButtonPressed: {
		opacity: 0.8,
	},
	completeButtonText: {
		fontSize: DesignTokens.fontSizes.body,
		fontWeight: '600',
		color: '#FFFFFF',
	},
	checkmark: {
		fontSize: 20,
		color: '#FFFFFF',
	},
});
