/**
 * Onboarding Step 3 - React Native Implementation
 *
 * Third onboarding screen for diary personalization
 * Visual parity with PWA OnboardingScreen3
 *
 * @module app/onboarding/step3
 */

import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { DesignTokens } from '../../app-shared/design-system/tokens';

const EMOJI_PRESETS = ['📔', '📖', '📓', '📕', '📗', '📘', '📙', '✨', '🌟', '💫', '🎯', '🚀'];

export default function OnboardingStep3() {
	const [diaryName, setDiaryName] = useState('');
	const [selectedEmoji, setSelectedEmoji] = useState('📔');

	const handleNext = () => {
		// Save diary name and emoji, then navigate
		router.push('/onboarding/step4');
	};

	const isFormComplete = diaryName.trim().length > 0;

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				<View style={styles.contentSection}>
					<Text style={styles.title}>Персонализируйте свой дневник</Text>
					<Text style={styles.subtitle}>Дайте имя своему дневнику и выберите иконку</Text>

					{/* Diary Name Input */}
					<View style={styles.formGroup}>
						<Text style={styles.label}>Название дневника</Text>
						<TextInput
							style={styles.input}
							placeholder="Мой дневник"
							placeholderTextColor={DesignTokens.colors.textTertiary}
							value={diaryName}
							onChangeText={setDiaryName}
							maxLength={50}
						/>
					</View>

					{/* Emoji Selector */}
					<View style={styles.formGroup}>
						<Text style={styles.label}>Выберите иконку</Text>
						<View style={styles.emojiGrid}>
							{EMOJI_PRESETS.map((emoji) => (
								<Pressable
									key={emoji}
									onPress={() => setSelectedEmoji(emoji)}
									style={({ pressed }) => [
										styles.emojiButton,
										selectedEmoji === emoji && styles.emojiButtonSelected,
										pressed && styles.emojiButtonPressed,
									]}
								>
									<Text style={styles.emojiText}>{emoji}</Text>
								</Pressable>
							))}
						</View>
					</View>

					{/* Preview */}
					<View style={styles.preview}>
						<Text style={styles.previewLabel}>Предпросмотр:</Text>
						<View style={styles.previewCard}>
							<Text style={styles.previewEmoji}>{selectedEmoji}</Text>
							<Text style={styles.previewName}>{diaryName || 'Мой дневник'}</Text>
						</View>
					</View>

					{/* Progress Indicator */}
					<View style={styles.progressContainer}>
						<View style={[styles.progressDot, styles.progressDotActive]} />
						<View style={[styles.progressDot, styles.progressDotActive]} />
						<View style={[styles.progressDot, styles.progressDotActive]} />
						<View style={styles.progressDot} />
					</View>

					{/* Next Button */}
					<Pressable
						onPress={handleNext}
						disabled={!isFormComplete}
						style={({ pressed }) => [
							styles.nextButton,
							!isFormComplete && styles.nextButtonDisabled,
							pressed && isFormComplete && styles.nextButtonPressed,
						]}
					>
						<Text style={[styles.nextButtonText, !isFormComplete && styles.nextButtonTextDisabled]}>
							Далее
						</Text>
						<Text style={[styles.arrow, !isFormComplete && styles.arrowDisabled]}>→</Text>
					</Pressable>

					{!isFormComplete && (
						<Text style={styles.validationError}>Пожалуйста, введите название дневника</Text>
					)}
				</View>
			</ScrollView>
		</View>
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
	input: {
		backgroundColor: DesignTokens.colors.backgroundSecondary,
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
		borderRadius: DesignTokens.borderRadius.lg,
		paddingHorizontal: DesignTokens.spacing.md,
		paddingVertical: DesignTokens.spacing.md,
		fontSize: DesignTokens.fontSizes.body,
		color: DesignTokens.colors.text,
		minHeight: 44,
	},
	emojiGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: DesignTokens.spacing.sm,
	},
	emojiButton: {
		width: 60,
		height: 60,
		borderRadius: DesignTokens.borderRadius.lg,
		backgroundColor: DesignTokens.colors.backgroundSecondary,
		borderWidth: 2,
		borderColor: 'transparent',
		alignItems: 'center',
		justifyContent: 'center',
	},
	emojiButtonSelected: {
		borderColor: DesignTokens.colors.primary,
		backgroundColor: `${DesignTokens.colors.primaryLight}20`,
	},
	emojiButtonPressed: {
		opacity: 0.7,
	},
	emojiText: {
		fontSize: 32,
	},
	preview: {
		marginTop: DesignTokens.spacing.lg,
		gap: DesignTokens.spacing.sm,
	},
	previewLabel: {
		fontSize: DesignTokens.fontSizes.bodySmall,
		fontWeight: '500',
		color: DesignTokens.colors.textSecondary,
	},
	previewCard: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: DesignTokens.spacing.md,
		backgroundColor: DesignTokens.colors.backgroundSecondary,
		padding: DesignTokens.spacing.lg,
		borderRadius: DesignTokens.borderRadius.lg,
	},
	previewEmoji: {
		fontSize: 40,
	},
	previewName: {
		fontSize: DesignTokens.fontSizes.h3,
		fontWeight: '600',
		color: DesignTokens.colors.text,
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
	nextButton: {
		flexDirection: 'row',
		backgroundColor: DesignTokens.colors.primary,
		paddingVertical: DesignTokens.spacing.md,
		borderRadius: DesignTokens.borderRadius.lg,
		alignItems: 'center',
		justifyContent: 'center',
		gap: DesignTokens.spacing.sm,
		minHeight: 44,
		marginTop: DesignTokens.spacing.lg,
	},
	nextButtonDisabled: {
		backgroundColor: DesignTokens.colors.border,
	},
	nextButtonPressed: {
		opacity: 0.8,
	},
	nextButtonText: {
		fontSize: DesignTokens.fontSizes.body,
		fontWeight: '600',
		color: '#FFFFFF',
	},
	nextButtonTextDisabled: {
		color: DesignTokens.colors.textTertiary,
	},
	arrow: {
		fontSize: 20,
		color: '#FFFFFF',
	},
	arrowDisabled: {
		color: DesignTokens.colors.textTertiary,
	},
	validationError: {
		fontSize: DesignTokens.fontSizes.bodySmall,
		color: DesignTokens.colors.error,
		textAlign: 'center',
	},
});
