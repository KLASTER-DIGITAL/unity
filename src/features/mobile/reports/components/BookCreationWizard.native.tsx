/**
 * Book Creation Wizard (React Native)
 *
 * 5-step wizard for creating a personalized PDF book.
 *
 * @author UNITY Team
 * @date 2025-11-07
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import { DesignTokens } from '@/shared/design-system/tokens';
import { API_URLS } from '@/shared/lib/api/config/urls';
import { supabase } from '@/shared/lib/api/supabase/client';
import { useAuth } from '@/shared/lib/hooks/useAuth';

type BookCreationWizardProps = {
	onComplete?: (draftId: string) => void;
	onCancel?: () => void;
};

type WizardStep = 1 | 2 | 3 | 4 | 5;

type BookConfig = {
	periodStart: string;
	periodEnd: string;
	contexts: string[];
	style: 'warm_family' | 'biographical' | 'motivational';
	layout: 'photo_text' | 'text_only' | 'minimal';
	theme: 'light' | 'dark';
};

export function BookCreationWizard({ onComplete, onCancel }: BookCreationWizardProps) {
	const { user, profile } = useAuth();
	const [currentStep, setCurrentStep] = useState<WizardStep>(1);
	const [isGenerating, setIsGenerating] = useState(false);
	const [availableCategories, setAvailableCategories] = useState<string[]>([]);

	const [config, setConfig] = useState<BookConfig>({
		periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
		periodEnd: new Date().toISOString().split('T')[0],
		contexts: [],
		style: 'warm_family',
		layout: 'photo_text',
		theme: 'light',
	});

	// Fetch available categories
	useEffect(() => {
		if (!user?.id) return;

		const fetchCategories = async () => {
			try {
				const { data, error } = await supabase
					.from('entries')
					.select('category')
					.eq('user_id', user.id)
					.not('category', 'is', null);

				if (error) {
					console.error('[WIZARD] Error fetching categories:', error);
					return;
				}

				const categories = [...new Set(data.map((entry) => entry.category).filter(Boolean))];
				setAvailableCategories(categories as string[]);
			} catch (error) {
				console.error('[WIZARD] Error:', error);
			}
		};

		fetchCategories();
	}, [user?.id]);

	// Handle next step
	const handleNext = async () => {
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		if (currentStep < 5) {
			setCurrentStep((prev) => (prev + 1) as WizardStep);
		} else {
			handleGenerate();
		}
	};

	// Handle previous step
	const handlePrevious = async () => {
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		if (currentStep > 1) {
			setCurrentStep((prev) => (prev - 1) as WizardStep);
		}
	};

	// Handle generate book
	const handleGenerate = async () => {
		if (!user?.id) {
			console.log('[WIZARD] User not authenticated');
			return;
		}

		try {
			setIsGenerating(true);

			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session?.access_token) {
				console.log('[WIZARD] No access token');
				return;
			}

			const response = await fetch(API_URLS.BOOKS_GENERATE_DRAFT, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${session.access_token}`,
				},
				body: JSON.stringify({
					userId: user.id,
					periodStart: config.periodStart,
					periodEnd: config.periodEnd,
					contexts: config.contexts,
					style: config.style,
					layout: config.layout,
					theme: config.theme,
					diaryName: profile?.diary_name || 'Мой дневник',
					diaryEmoji: profile?.diary_emoji || '📝',
				}),
			});

			const result = await response.json();

			if (!result.success) {
				throw new Error(result.error || 'Не удалось создать черновик');
			}

			await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
			onComplete?.(result.draftId);
		} catch (error) {
			console.error('[WIZARD] Error generating book:', error);
			await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
		} finally {
			setIsGenerating(false);
		}
	};

	// Toggle context
	const toggleContext = async (context: string) => {
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		setConfig((prev) => ({
			...prev,
			contexts: prev.contexts.includes(context)
				? prev.contexts.filter((c) => c !== context)
				: [...prev.contexts, context],
		}));
	};

	// Validate step
	const isStepValid = () => {
		switch (currentStep) {
			case 1:
				return config.periodStart && config.periodEnd && config.periodStart <= config.periodEnd;
			case 2:
				return true;
			case 3:
				return config.style !== '';
			case 4:
				return config.layout !== '';
			case 5:
				return config.theme !== '';
			default:
				return false;
		}
	};

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<View style={styles.headerContent}>
					<View style={styles.headerIcon}>
						<Ionicons color={DesignTokens.colors.card} name="sparkles" size={24} />
					</View>
					<View style={styles.headerText}>
						<Text style={styles.headerTitle}>Создание книги</Text>
						<Text style={styles.headerSubtitle}>Шаг {currentStep} из 5</Text>
					</View>
				</View>

				{/* Progress Bar */}
				<View style={styles.progressBar}>
					<View style={[styles.progressFill, { width: `${(currentStep / 5) * 100}%` }]} />
				</View>
			</View>

			{/* Content */}
			<ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollView}>
				<View style={styles.card}>
					<Text style={styles.cardTitle}>
						{currentStep === 1 && 'Выберите период'}
						{currentStep === 2 && 'Выберите контексты'}
						{currentStep === 3 && 'Выберите стиль'}
						{currentStep === 4 && 'Выберите макет'}
						{currentStep === 5 && 'Выберите тему'}
					</Text>

					{/* Step 1: Period (simplified - text inputs) */}
					{currentStep === 1 && (
						<View style={styles.stepContent}>
							<Text style={styles.label}>Начало периода (YYYY-MM-DD)</Text>
							<TextInput
								onChangeText={(text) => setConfig({ ...config, periodStart: text })}
								placeholder="2025-01-01"
								style={styles.input}
								value={config.periodStart}
							/>
							<Text style={styles.label}>Конец периода (YYYY-MM-DD)</Text>
							<TextInput
								onChangeText={(text) => setConfig({ ...config, periodEnd: text })}
								placeholder="2025-01-31"
								style={styles.input}
								value={config.periodEnd}
							/>
							<Text style={styles.hint}>
								Выберите период для создания книги. Будут использованы записи из этого диапазона.
							</Text>
						</View>
					)}

					{/* Step 2: Contexts */}
					{currentStep === 2 && (
						<View style={styles.stepContent}>
							{availableCategories.length === 0 ? (
								<Text style={styles.hint}>
									У вас пока нет категорий в записях. Все записи будут включены в книгу.
								</Text>
							) : (
								<>
									<Text style={styles.hint}>Выберите категории записей для включения в книгу.</Text>
									{availableCategories.map((category) => (
										<Pressable
											key={category}
											onPress={() => toggleContext(category)}
											style={styles.checkboxRow}
										>
											<View
												style={[
													styles.checkbox,
													config.contexts.includes(category) && styles.checkboxChecked,
												]}
											>
												{config.contexts.includes(category) && (
													<Ionicons color={DesignTokens.colors.card} name="checkmark" size={16} />
												)}
											</View>
											<Text style={styles.checkboxLabel}>{category}</Text>
										</Pressable>
									))}
								</>
							)}
						</View>
					)}

					{/* Step 3: Style */}
					{currentStep === 3 && (
						<View style={styles.stepContent}>
							<Text style={styles.hint}>Выберите стиль повествования для вашей книги.</Text>
							<Pressable
								onPress={async () => {
									await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
									setConfig({ ...config, style: 'warm_family' });
								}}
								style={[
									styles.optionButton,
									config.style === 'warm_family' && styles.optionButtonActive,
								]}
							>
								<Text style={styles.optionTitle}>🏡 Семейная история</Text>
								<Text style={styles.optionDescription}>
									Теплое повествование о моментах единения, любви и совместного роста
								</Text>
							</Pressable>
							<Pressable
								onPress={async () => {
									await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
									setConfig({ ...config, style: 'biographical' });
								}}
								style={[
									styles.optionButton,
									config.style === 'biographical' && styles.optionButtonActive,
								]}
							>
								<Text style={styles.optionTitle}>📖 Биография</Text>
								<Text style={styles.optionDescription}>
									Фокус на личном развитии и ключевых моментах жизни
								</Text>
							</Pressable>
							<Pressable
								onPress={async () => {
									await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
									setConfig({ ...config, style: 'motivational' });
								}}
								style={[
									styles.optionButton,
									config.style === 'motivational' && styles.optionButtonActive,
								]}
							>
								<Text style={styles.optionTitle}>🚀 Мотивация</Text>
								<Text style={styles.optionDescription}>
									История успеха с акцентом на достижения и преодоление трудностей
								</Text>
							</Pressable>
						</View>
					)}

					{/* Step 4: Layout */}
					{currentStep === 4 && (
						<View style={styles.stepContent}>
							<Text style={styles.hint}>Выберите макет страниц для вашей книги.</Text>
							<Pressable
								onPress={async () => {
									await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
									setConfig({ ...config, layout: 'photo_text' });
								}}
								style={[
									styles.optionButton,
									config.layout === 'photo_text' && styles.optionButtonActive,
								]}
							>
								<Text style={styles.optionTitle}>📸 Фото + Текст</Text>
								<Text style={styles.optionDescription}>
									Фотографии с текстовым описанием на каждой странице
								</Text>
							</Pressable>
							<Pressable
								onPress={async () => {
									await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
									setConfig({ ...config, layout: 'text_only' });
								}}
								style={[
									styles.optionButton,
									config.layout === 'text_only' && styles.optionButtonActive,
								]}
							>
								<Text style={styles.optionTitle}>📝 Только текст</Text>
								<Text style={styles.optionDescription}>
									Классический текстовый формат без изображений
								</Text>
							</Pressable>
							<Pressable
								onPress={async () => {
									await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
									setConfig({ ...config, layout: 'minimal' });
								}}
								style={[
									styles.optionButton,
									config.layout === 'minimal' && styles.optionButtonActive,
								]}
							>
								<Text style={styles.optionTitle}>✨ Минимализм</Text>
								<Text style={styles.optionDescription}>
									Минималистичный дизайн с акцентом на содержание
								</Text>
							</Pressable>
						</View>
					)}

					{/* Step 5: Theme */}
					{currentStep === 5 && (
						<View style={styles.stepContent}>
							<Text style={styles.hint}>Выберите цветовую тему для вашей книги.</Text>
							<Pressable
								onPress={async () => {
									await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
									setConfig({ ...config, theme: 'light' });
								}}
								style={[styles.optionButton, config.theme === 'light' && styles.optionButtonActive]}
							>
								<Text style={styles.optionTitle}>☀️ Светлая</Text>
								<Text style={styles.optionDescription}>
									Классическая светлая тема с белым фоном
								</Text>
							</Pressable>
							<Pressable
								onPress={async () => {
									await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
									setConfig({ ...config, theme: 'dark' });
								}}
								style={[styles.optionButton, config.theme === 'dark' && styles.optionButtonActive]}
							>
								<Text style={styles.optionTitle}>🌙 Темная</Text>
								<Text style={styles.optionDescription}>Современная темная тема с темным фоном</Text>
							</Pressable>
						</View>
					)}

					{/* Navigation Buttons */}
					<View style={styles.navigationButtons}>
						{currentStep > 1 && (
							<Pressable
								onPress={handlePrevious}
								style={({ pressed }) => [
									styles.navButton,
									styles.navButtonOutline,
									pressed && styles.navButtonPressed,
								]}
							>
								<Ionicons color={DesignTokens.colors.text} name="chevron-back" size={16} />
								<Text style={styles.navButtonTextOutline}>Назад</Text>
							</Pressable>
						)}
						{currentStep < 5 ? (
							<Pressable
								disabled={!isStepValid()}
								onPress={handleNext}
								style={({ pressed }) => [
									styles.navButton,
									styles.navButtonPrimary,
									currentStep === 1 && styles.navButtonFull,
									!isStepValid() && styles.navButtonDisabled,
									pressed && styles.navButtonPressed,
								]}
							>
								<Text style={styles.navButtonTextPrimary}>Далее</Text>
								<Ionicons color={DesignTokens.colors.card} name="chevron-forward" size={16} />
							</Pressable>
						) : (
							<Pressable
								disabled={!isStepValid() || isGenerating}
								onPress={handleNext}
								style={({ pressed }) => [
									styles.navButton,
									styles.navButtonPrimary,
									(!isStepValid() || isGenerating) && styles.navButtonDisabled,
									pressed && styles.navButtonPressed,
								]}
							>
								{isGenerating ? (
									<>
										<ActivityIndicator color={DesignTokens.colors.card} size="small" />
										<Text style={styles.navButtonTextPrimary}>Создание...</Text>
									</>
								) : (
									<>
										<Ionicons color={DesignTokens.colors.card} name="sparkles" size={16} />
										<Text style={styles.navButtonTextPrimary}>Создать книгу</Text>
									</>
								)}
							</Pressable>
						)}
					</View>

					{onCancel && (
						<Pressable onPress={onCancel} style={styles.cancelButton}>
							<Text style={styles.cancelButtonText}>Отмена</Text>
						</Pressable>
					)}
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: DesignTokens.colors.background,
	},
	header: {
		backgroundColor: DesignTokens.colors.purple,
		padding: DesignTokens.spacing.lg,
	},
	headerContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: DesignTokens.spacing.md,
		marginBottom: DesignTokens.spacing.md,
	},
	headerIcon: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	headerText: {
		flex: 1,
	},
	headerTitle: {
		fontSize: DesignTokens.fontSizes.xl,
		fontWeight: DesignTokens.fontWeights.semibold,
		color: DesignTokens.colors.card,
	},
	headerSubtitle: {
		fontSize: DesignTokens.fontSizes.sm,
		color: DesignTokens.colors.card,
		opacity: 0.9,
	},
	progressBar: {
		height: 8,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		borderRadius: 4,
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		backgroundColor: DesignTokens.colors.card,
		borderRadius: 4,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: DesignTokens.spacing.md,
	},
	card: {
		backgroundColor: DesignTokens.colors.card,
		borderRadius: DesignTokens.borderRadius.lg,
		padding: DesignTokens.spacing.md,
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
	},
	cardTitle: {
		fontSize: DesignTokens.fontSizes.lg,
		fontWeight: DesignTokens.fontWeights.semibold,
		color: DesignTokens.colors.text,
		marginBottom: DesignTokens.spacing.md,
	},
	stepContent: {
		gap: DesignTokens.spacing.md,
	},
	label: {
		fontSize: DesignTokens.fontSizes.sm,
		fontWeight: DesignTokens.fontWeights.medium,
		color: DesignTokens.colors.text,
		marginBottom: DesignTokens.spacing.xs,
	},
	input: {
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
		borderRadius: DesignTokens.borderRadius.md,
		padding: DesignTokens.spacing.md,
		fontSize: DesignTokens.fontSizes.body,
		color: DesignTokens.colors.text,
		backgroundColor: DesignTokens.colors.background,
	},
	hint: {
		fontSize: DesignTokens.fontSizes.sm,
		color: DesignTokens.colors.textSecondary,
	},
	checkboxRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: DesignTokens.spacing.sm,
		paddingVertical: DesignTokens.spacing.sm,
	},
	checkbox: {
		width: 20,
		height: 20,
		borderWidth: 2,
		borderColor: DesignTokens.colors.border,
		borderRadius: 4,
		alignItems: 'center',
		justifyContent: 'center',
	},
	checkboxChecked: {
		backgroundColor: DesignTokens.colors.primary,
		borderColor: DesignTokens.colors.primary,
	},
	checkboxLabel: {
		fontSize: DesignTokens.fontSizes.body,
		color: DesignTokens.colors.text,
	},
	optionButton: {
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
		borderRadius: DesignTokens.borderRadius.md,
		padding: DesignTokens.spacing.md,
	},
	optionButtonActive: {
		borderColor: DesignTokens.colors.primary,
		backgroundColor: `${DesignTokens.colors.primary}10`,
	},
	optionTitle: {
		fontSize: DesignTokens.fontSizes.body,
		fontWeight: DesignTokens.fontWeights.medium,
		color: DesignTokens.colors.text,
		marginBottom: DesignTokens.spacing.xs,
	},
	optionDescription: {
		fontSize: DesignTokens.fontSizes.sm,
		color: DesignTokens.colors.textSecondary,
	},
	navigationButtons: {
		flexDirection: 'row',
		gap: DesignTokens.spacing.sm,
		marginTop: DesignTokens.spacing.md,
	},
	navButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: DesignTokens.spacing.sm,
		padding: DesignTokens.spacing.md,
		borderRadius: DesignTokens.borderRadius.md,
		flex: 1,
	},
	navButtonFull: {
		flex: 1,
	},
	navButtonPrimary: {
		backgroundColor: DesignTokens.colors.primary,
	},
	navButtonOutline: {
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
		backgroundColor: 'transparent',
	},
	navButtonDisabled: {
		opacity: 0.5,
	},
	navButtonPressed: {
		opacity: 0.7,
	},
	navButtonTextPrimary: {
		fontSize: DesignTokens.fontSizes.body,
		fontWeight: DesignTokens.fontWeights.medium,
		color: DesignTokens.colors.card,
	},
	navButtonTextOutline: {
		fontSize: DesignTokens.fontSizes.body,
		fontWeight: DesignTokens.fontWeights.medium,
		color: DesignTokens.colors.text,
	},
	cancelButton: {
		padding: DesignTokens.spacing.md,
		alignItems: 'center',
		marginTop: DesignTokens.spacing.sm,
	},
	cancelButtonText: {
		fontSize: DesignTokens.fontSizes.body,
		color: DesignTokens.colors.textSecondary,
	},
});
