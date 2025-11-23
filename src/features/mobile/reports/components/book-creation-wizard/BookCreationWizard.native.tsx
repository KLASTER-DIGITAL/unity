import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import {
	ActivityIndicator,
	LayoutAnimation,
	Modal,
	Platform,
	Pressable,
	SafeAreaView,
	StyleSheet,
	Text,
	UIManager,
	View,
} from 'react-native';
import { DesignTokens } from '@/shared/design-system/tokens';
import { useBookCreation } from '../../hooks/useBookCreation';
import { Step0PlanType } from './Step0PlanType.native';
import { Step1Period } from './Step1Period.native';
import { Step2Contexts } from './Step2Contexts.native';
import { Step3Style } from './Step3Style.native';
import { Step4Layout } from './Step4Layout.native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
	if (UIManager.setLayoutAnimationEnabledExperimental) {
		UIManager.setLayoutAnimationEnabledExperimental(true);
	}
}

type BookCreationWizardProps = {
	onComplete?: (draftId: string) => void;
	onCancel?: () => void;
	onUpgrade?: () => void; // For Step 0
	existingBookId?: string; // For Edit -> Overwrite
};

export function BookCreationWizard({
	onComplete,
	onCancel,
	onUpgrade,
	existingBookId,
}: BookCreationWizardProps) {
	const {
		currentStep,
		config,
		isGenerating,
		showProgress,
		showSuccessModal,
		availableCategories,
		isPremium,
		setConfig,
		handleNext,
		handlePrevious,
		handleGenerate,
		handleGoToEditor,
	} = useBookCreation(onComplete, existingBookId);

	// Haptics on step change
	useEffect(() => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
	}, [currentStep]);

	// Validate step
	const isStepValid = () => {
		switch (currentStep) {
			case 0:
				return (config.planType as string) !== '';
			case 1:
				return config.periodStart && config.periodEnd && config.periodStart <= config.periodEnd;
			case 2:
				return true; // Contexts are optional
			case 3:
				return (config.style as string) !== '';
			case 4:
				return (config.layout as string) !== '';
			default:
				return false;
		}
	};

	const handleNextStep = async () => {
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		handleNext();
	};

	const handlePrevStep = async () => {
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		handlePrevious();
	};

	const handleGeneratePress = async () => {
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		handleGenerate();
	};

	// Render current step
	const renderStep = () => {
		switch (currentStep) {
			case 0:
				return (
					<Step0PlanType
						config={config}
						onConfigChange={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
						isPremium={isPremium}
						onUpgrade={onUpgrade || (() => {})}
					/>
				);
			case 1:
				return (
					<Step1Period
						config={config}
						onConfigChange={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
					/>
				);
			case 2:
				return (
					<Step2Contexts
						config={config}
						onConfigChange={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
						availableCategories={availableCategories}
					/>
				);
			case 3:
				return (
					<Step3Style
						config={config}
						onConfigChange={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
					/>
				);
			case 4:
				return (
					<Step4Layout
						config={config}
						onConfigChange={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
					/>
				);
			default:
				return null;
		}
	};

	// Calculate progress (0-4 steps = 5 total)
	// If Premium, we skip step 0, so steps are 1-4 (4 total)
	// But hook uses 0-4.
	// Let's just use currentStep / 4
	const progress = Math.min((currentStep + 1) / 5, 1);

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<View style={styles.headerContent}>
					<View style={styles.headerIcon}>
						<Ionicons color={DesignTokens.colors.card} name="sparkles" size={24} />
					</View>
					<View style={styles.headerText}>
						<Text style={styles.headerTitle}>
							{existingBookId ? 'Редактирование книги' : 'Создание книги'}
						</Text>
						<Text style={styles.headerSubtitle}>Шаг {currentStep + 1} из 5</Text>
					</View>
					{onCancel && (
						<Pressable onPress={onCancel} style={styles.closeButton}>
							<Ionicons name="close" size={24} color="#fff" />
						</Pressable>
					)}
				</View>

				{/* Progress Bar */}
				<View style={styles.progressBarContainer}>
					<View style={styles.progressBar}>
						<View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
					</View>
				</View>
			</View>

			{/* Content */}
			<View style={styles.contentContainer}>
				<View style={styles.stepContainer}>{renderStep()}</View>
			</View>

			{/* Footer Navigation */}
			<View style={styles.footer}>
				{currentStep > (isPremium ? 1 : 0) && (
					<Pressable
						onPress={handlePrevStep}
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

				{/* Next / Generate Button */}
				{currentStep < 4 ? (
					<Pressable
						disabled={!isStepValid()}
						onPress={handleNextStep}
						style={({ pressed }) => [
							styles.navButton,
							styles.navButtonPrimary,
							currentStep === 0 && styles.navButtonFull, // Full width on first step
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
						onPress={handleGeneratePress}
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
								<Text style={styles.navButtonTextPrimary}>
									{existingBookId ? 'Сохранение...' : 'Создание...'}
								</Text>
							</>
						) : (
							<>
								<Ionicons color={DesignTokens.colors.card} name="sparkles" size={16} />
								<Text style={styles.navButtonTextPrimary}>
									{existingBookId ? 'Сохранить изменения' : 'Создать книгу'}
								</Text>
							</>
						)}
					</Pressable>
				)}
			</View>

			{/* Success Modal */}
			<Modal visible={showSuccessModal} transparent animationType="fade">
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<View style={styles.successIcon}>
							<Ionicons name="checkmark" size={40} color="#fff" />
						</View>
						<Text style={styles.modalTitle}>Готово!</Text>
						<Text style={styles.modalText}>
							{existingBookId ? 'Книга успешно обновлена.' : 'Черновик книги успешно создан.'}
						</Text>
						<Pressable style={styles.modalButton} onPress={handleGoToEditor}>
							<Text style={styles.modalButtonText}>Открыть</Text>
						</Pressable>
					</View>
				</View>
			</Modal>

			{/* Progress Modal (Overlay) */}
			{showProgress && (
				<View style={styles.loadingOverlay}>
					<View style={styles.loadingContent}>
						<ActivityIndicator size="large" color={DesignTokens.colors.primary} />
						<Text style={styles.loadingText}>
							{existingBookId ? 'Обновляем книгу...' : 'Генерируем книгу...'}
						</Text>
						<Text style={styles.loadingSubtext}>Это может занять несколько секунд</Text>
					</View>
				</View>
			)}
		</SafeAreaView>
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
		paddingTop: DesignTokens.spacing.xl * 1.5, // Extra padding for status bar
		borderBottomLeftRadius: 24,
		borderBottomRightRadius: 24,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 5,
		zIndex: 10,
	},
	headerContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: DesignTokens.spacing.md,
		marginBottom: DesignTokens.spacing.lg,
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
		fontWeight: DesignTokens.fontWeights.bold,
		color: DesignTokens.colors.card,
	},
	headerSubtitle: {
		fontSize: DesignTokens.fontSizes.sm,
		color: DesignTokens.colors.card,
		opacity: 0.9,
	},
	closeButton: {
		padding: 8,
		backgroundColor: 'rgba(255,255,255,0.2)',
		borderRadius: 20,
	},
	progressBarContainer: {
		paddingHorizontal: 4,
	},
	progressBar: {
		height: 6,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		borderRadius: 3,
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		backgroundColor: DesignTokens.colors.card,
		borderRadius: 3,
	},
	contentContainer: {
		flex: 1,
	},
	stepContainer: {
		flex: 1,
		padding: DesignTokens.spacing.md,
	},
	footer: {
		padding: DesignTokens.spacing.md,
		paddingBottom: DesignTokens.spacing.xl,
		borderTopWidth: 1,
		borderTopColor: DesignTokens.colors.border,
		flexDirection: 'row',
		gap: DesignTokens.spacing.md,
		backgroundColor: DesignTokens.colors.background,
	},
	navButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: DesignTokens.spacing.sm,
		padding: DesignTokens.spacing.md,
		borderRadius: 16,
		flex: 1,
		height: 56,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
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
		backgroundColor: DesignTokens.colors.card,
	},
	navButtonDisabled: {
		opacity: 0.5,
		shadowOpacity: 0,
	},
	navButtonPressed: {
		opacity: 0.9,
		transform: [{ scale: 0.98 }],
	},
	navButtonTextPrimary: {
		fontSize: 16,
		fontWeight: '600',
		color: DesignTokens.colors.card,
	},
	navButtonTextOutline: {
		fontSize: 16,
		fontWeight: '600',
		color: DesignTokens.colors.text,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.6)',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
		backdropFilter: 'blur(10px)',
	},
	modalContent: {
		backgroundColor: '#fff',
		borderRadius: 24,
		padding: 32,
		alignItems: 'center',
		width: '100%',
		maxWidth: 320,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.2,
		shadowRadius: 20,
		elevation: 10,
	},
	successIcon: {
		width: 72,
		height: 72,
		borderRadius: 36,
		backgroundColor: '#34C759',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
		shadowColor: '#34C759',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 5,
	},
	modalTitle: {
		fontSize: 24,
		fontWeight: '700',
		color: '#000',
		marginBottom: 12,
	},
	modalText: {
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
		marginBottom: 32,
		lineHeight: 22,
	},
	modalButton: {
		backgroundColor: '#007AFF',
		paddingVertical: 16,
		paddingHorizontal: 32,
		borderRadius: 16,
		width: '100%',
		shadowColor: '#007AFF',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 5,
	},
	modalButtonText: {
		color: '#fff',
		fontSize: 17,
		fontWeight: '600',
		textAlign: 'center',
	},
	loadingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(255, 255, 255, 0.95)',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1000,
	},
	loadingContent: {
		alignItems: 'center',
		gap: 16,
	},
	loadingText: {
		fontSize: 18,
		fontWeight: '600',
		color: '#000',
		marginTop: 8,
	},
	loadingSubtext: {
		fontSize: 14,
		color: '#666',
	},
});
