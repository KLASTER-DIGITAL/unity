/**
 * Onboarding Step 2 - React Native Implementation
 *
 * Second onboarding screen explaining diary features
 * Visual parity with PWA OnboardingScreen2
 *
 * @module app/onboarding/step2
 */

import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DesignTokens } from '../../app-shared/design-system/tokens';

export default function OnboardingStep2() {
	const handleNext = () => {
		router.push('/onboarding/step3');
	};

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				{/* Hero Image */}
				<View style={styles.heroSection}>
					<Image
						source={require('../../src/assets/5f4bd000111b1df6537a53aaf570a9424e39fbcf.webp')}
						style={styles.heroImage}
						resizeMode="cover"
					/>
				</View>

				{/* Content */}
				<View style={styles.contentSection}>
					<Text style={styles.title}>Отслеживайте свой прогресс</Text>
					<Text style={styles.subtitle}>
						Записывайте свои мысли, отслеживайте привычки и достигайте целей каждый день
					</Text>

					{/* Features List */}
					<View style={styles.featuresList}>
						<FeatureItem
							icon="📝"
							title="Ежедневные записи"
							description="Ведите дневник и фиксируйте важные моменты"
						/>
						<FeatureItem
							icon="🎯"
							title="Отслеживание привычек"
							description="Формируйте полезные привычки и следите за прогрессом"
						/>
						<FeatureItem
							icon="📊"
							title="Аналитика"
							description="Визуализируйте свои достижения и рост"
						/>
					</View>

					{/* Progress Indicator */}
					<View style={styles.progressContainer}>
						<View style={[styles.progressDot, styles.progressDotActive]} />
						<View style={[styles.progressDot, styles.progressDotActive]} />
						<View style={styles.progressDot} />
						<View style={styles.progressDot} />
					</View>

					{/* Next Button */}
					<Pressable
						onPress={handleNext}
						style={({ pressed }) => [styles.nextButton, pressed && styles.nextButtonPressed]}
					>
						<Text style={styles.nextButtonText}>Далее</Text>
						<Text style={styles.arrow}>→</Text>
					</Pressable>
				</View>
			</ScrollView>
		</View>
	);
}

// ============================================================================
// FEATURE ITEM COMPONENT
// ============================================================================

type FeatureItemProps = {
	icon: string;
	title: string;
	description: string;
};

function FeatureItem({ icon, title, description }: FeatureItemProps) {
	return (
		<View style={styles.featureItem}>
			<Text style={styles.featureIcon}>{icon}</Text>
			<View style={styles.featureContent}>
				<Text style={styles.featureTitle}>{title}</Text>
				<Text style={styles.featureDescription}>{description}</Text>
			</View>
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
	heroSection: {
		height: 300,
	},
	heroImage: {
		width: '100%',
		height: '100%',
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
	},
	subtitle: {
		fontSize: DesignTokens.fontSizes.body,
		color: DesignTokens.colors.textSecondary,
		textAlign: 'center',
		lineHeight: 24,
	},
	featuresList: {
		gap: DesignTokens.spacing.lg,
		marginTop: DesignTokens.spacing.lg,
	},
	featureItem: {
		flexDirection: 'row',
		gap: DesignTokens.spacing.md,
		alignItems: 'flex-start',
	},
	featureIcon: {
		fontSize: 32,
	},
	featureContent: {
		flex: 1,
		gap: DesignTokens.spacing.xs,
	},
	featureTitle: {
		fontSize: DesignTokens.fontSizes.body,
		fontWeight: '600',
		color: DesignTokens.colors.text,
	},
	featureDescription: {
		fontSize: DesignTokens.fontSizes.bodySmall,
		color: DesignTokens.colors.textSecondary,
		lineHeight: 20,
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
	nextButtonPressed: {
		opacity: 0.8,
	},
	nextButtonText: {
		fontSize: DesignTokens.fontSizes.body,
		fontWeight: '600',
		color: '#FFFFFF',
	},
	arrow: {
		fontSize: 20,
		color: '#FFFFFF',
	},
});
