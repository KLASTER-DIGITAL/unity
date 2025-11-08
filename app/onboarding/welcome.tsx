/**
 * Welcome Screen - React Native Implementation
 *
 * First onboarding screen with language selection
 * Visual parity with PWA WelcomeScreen
 *
 * @module app/onboarding/welcome
 */

import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DesignTokens } from '../../app-shared/design-system/tokens';

type Language = {
	code: string;
	name: string;
	native_name: string;
	flag: string;
};

const fallbackLanguages: Language[] = [
	{ code: 'ru', name: 'Russian', native_name: 'Русский', flag: '🇷🇺' },
	{ code: 'en', name: 'English', native_name: 'English', flag: '🇬🇧' },
	{ code: 'es', name: 'Spanish', native_name: 'Español', flag: '🇪🇸' },
	{ code: 'de', name: 'German', native_name: 'Deutsch', flag: '🇩🇪' },
	{ code: 'fr', name: 'French', native_name: 'Français', flag: '🇫🇷' },
	{ code: 'zh', name: 'Chinese', native_name: '中文', flag: '🇨🇳' },
	{ code: 'ja', name: 'Japanese', native_name: '日本語', flag: '🇯🇵' },
];

export default function WelcomeScreen() {
	const [selectedLanguage, setSelectedLanguage] = useState('ru');
	const [showDropdown, setShowDropdown] = useState(false);

	const selectedLang = fallbackLanguages.find((lang) => lang.code === selectedLanguage);

	const handleNext = () => {
		// Navigate to next onboarding screen
		router.push('/onboarding/step2');
	};

	const handleSkip = () => {
		// Navigate to auth screen
		router.push('/auth');
	};

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				{/* Hero Image Section */}
				<View style={styles.heroSection}>
					<Image
						source={require('../../src/assets/5f4bd000111b1df6537a53aaf570a9424e39fbcf.webp')}
						style={styles.heroImage}
						resizeMode="cover"
					/>

					{/* Language Selector */}
					<View style={styles.languageSelector}>
						<Pressable
							onPress={() => setShowDropdown(!showDropdown)}
							style={({ pressed }) => [
								styles.languageButton,
								pressed && styles.languageButtonPressed,
							]}
						>
							<Text style={styles.languageFlag}>{selectedLang?.flag}</Text>
							<Text style={styles.languageText}>{selectedLang?.native_name}</Text>
							<Text style={styles.chevron}>{showDropdown ? '▲' : '▼'}</Text>
						</Pressable>

						{showDropdown && (
							<View style={styles.dropdown}>
								<ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
									{fallbackLanguages.map((lang) => (
										<Pressable
											key={lang.code}
											onPress={() => {
												setSelectedLanguage(lang.code);
												setShowDropdown(false);
											}}
											style={({ pressed }) => [
												styles.dropdownItem,
												pressed && styles.dropdownItemPressed,
												lang.code === selectedLanguage && styles.dropdownItemSelected,
											]}
										>
											<Text style={styles.dropdownFlag}>{lang.flag}</Text>
											<Text style={styles.dropdownText}>{lang.native_name}</Text>
										</Pressable>
									))}
								</ScrollView>
							</View>
						)}
					</View>
				</View>

				{/* Content Section */}
				<View style={styles.contentSection}>
					<Text style={styles.title}>Добро пожаловать в UNITY</Text>
					<Text style={styles.subtitle}>
						Ваш персональный дневник для отслеживания привычек и достижений
					</Text>

					{/* Action Buttons */}
					<Pressable
						onPress={handleNext}
						style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
					>
						<Text style={styles.primaryButtonText}>Начать</Text>
					</Pressable>

					<Pressable
						onPress={handleSkip}
						style={({ pressed }) => [
							styles.secondaryButton,
							pressed && styles.secondaryButtonPressed,
						]}
					>
						<Text style={styles.secondaryButtonText}>У меня уже есть аккаунт</Text>
					</Pressable>
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
	heroSection: {
		height: 400,
		position: 'relative',
	},
	heroImage: {
		width: '100%',
		height: '100%',
	},
	languageSelector: {
		position: 'absolute',
		top: 60,
		right: 20,
		zIndex: 10,
	},
	languageButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.9)',
		paddingHorizontal: DesignTokens.spacing.md,
		paddingVertical: DesignTokens.spacing.sm,
		borderRadius: DesignTokens.borderRadius.full,
		gap: DesignTokens.spacing.xs,
		minHeight: 44, // iOS touch target
	},
	languageButtonPressed: {
		opacity: 0.7,
	},
	languageFlag: {
		fontSize: 20,
	},
	languageText: {
		fontSize: DesignTokens.fontSizes.bodySmall,
		fontWeight: '500',
		color: DesignTokens.colors.text,
	},
	chevron: {
		fontSize: 12,
		color: DesignTokens.colors.textSecondary,
	},
	dropdown: {
		marginTop: DesignTokens.spacing.xs,
		backgroundColor: DesignTokens.colors.card,
		borderRadius: DesignTokens.borderRadius.lg,
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
		maxHeight: 300,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 5,
	},
	dropdownScroll: {
		maxHeight: 300,
	},
	dropdownItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: DesignTokens.spacing.md,
		paddingVertical: DesignTokens.spacing.md,
		gap: DesignTokens.spacing.sm,
		minHeight: 44,
	},
	dropdownItemPressed: {
		backgroundColor: DesignTokens.colors.backgroundSecondary,
	},
	dropdownItemSelected: {
		backgroundColor: `${DesignTokens.colors.primaryLight}20`,
	},
	dropdownFlag: {
		fontSize: 20,
	},
	dropdownText: {
		fontSize: DesignTokens.fontSizes.bodySmall,
		color: DesignTokens.colors.text,
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
	primaryButton: {
		backgroundColor: DesignTokens.colors.primary,
		paddingVertical: DesignTokens.spacing.md,
		borderRadius: DesignTokens.borderRadius.lg,
		alignItems: 'center',
		minHeight: 44,
		marginTop: DesignTokens.spacing.lg,
	},
	primaryButtonPressed: {
		opacity: 0.8,
	},
	primaryButtonText: {
		fontSize: DesignTokens.fontSizes.body,
		fontWeight: '600',
		color: '#FFFFFF',
	},
	secondaryButton: {
		paddingVertical: DesignTokens.spacing.md,
		alignItems: 'center',
		minHeight: 44,
	},
	secondaryButtonPressed: {
		opacity: 0.7,
	},
	secondaryButtonText: {
		fontSize: DesignTokens.fontSizes.bodySmall,
		color: DesignTokens.colors.primary,
		fontWeight: '500',
	},
});
