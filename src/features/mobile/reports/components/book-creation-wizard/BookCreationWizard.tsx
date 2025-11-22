/**
 * Book Creation Wizard - Main Component
 *
 * 4-step wizard for creating a personalized PDF book.
 *
 * @author UNITY Team
 * @date 2025-11-08
 */

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { createClient } from '@/utils/supabase/client';
import { BookCreationSuccessModal } from '../BookCreationSuccessModal';
import { BookGenerationProgress } from '../BookGenerationProgress';
import { PremiumUpsellModal } from '../PremiumUpsellModal';
import { DEFAULT_PERIOD_DAYS } from './constants';
import { Step0PlanType } from './Step0PlanType';
import { Step1Period } from './Step1Period';
import { Step2Contexts } from './Step2Contexts';
import { Step3Style } from './Step3Style';
import { Step4Layout } from './Step4Layout';
import type { BookConfig, BookCreationWizardProps, WizardStep } from './types';
import {
	checkFreeTierLimit,
	fetchAvailableCategories,
	generateBookDraft,
	validateMinimumEntries,
} from './utils';
import { WizardNavigation } from './WizardNavigation';

export function BookCreationWizard({
	onComplete,
	onCancel,
	onGoToLibrary,
}: BookCreationWizardProps) {
	const [currentStep, setCurrentStep] = useState<WizardStep>(0);
	const [isGenerating, setIsGenerating] = useState(false);
	const [showProgress, setShowProgress] = useState(false);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [generatedDraftId, setGeneratedDraftId] = useState<string | null>(null);
	const [availableCategories, setAvailableCategories] = useState<string[]>([]);
	const [userId, setUserId] = useState<string | null>(null);
	const [diaryName, setDiaryName] = useState<string>('');
	const [diaryEmoji, setDiaryEmoji] = useState<string>('');
	const [generationError, setGenerationError] = useState<string | null>(null);
	const [isPremium, setIsPremium] = useState(false);
	const [showUpsellModal, setShowUpsellModal] = useState(false);

	const [config, setConfig] = useState<BookConfig>({
		planType: '' as any,
		periodStart: new Date(Date.now() - DEFAULT_PERIOD_DAYS * 24 * 60 * 60 * 1000)
			.toISOString()
			.split('T')[0],
		periodEnd: new Date().toISOString().split('T')[0],
		contexts: [],
		style: '' as any,
		layout: '' as any,
	});

	// Get user ID and profile from session
	useEffect(() => {
		const getUserData = async () => {
			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (session?.user?.id) {
				setUserId(session.user.id);

				const { data: profile } = await supabase
					.from('profiles')
					.select('diary_name, diary_emoji, is_premium')
					.eq('id', session.user.id)
					.single();

				if (profile) {
					setDiaryName(profile.diary_name || '');
					setDiaryEmoji(profile.diary_emoji || '');
					setIsPremium(profile.is_premium || false);

					// Auto-select plan type for Premium users
					if (profile.is_premium) {
						setConfig((prev) => ({ ...prev, planType: 'premium' }));
						setCurrentStep(1); // Skip step 0 for Premium
					}
				}
			}
		};
		getUserData();
	}, []);

	// Fetch available categories
	useEffect(() => {
		if (!userId) return;

		const loadCategories = async () => {
			const categories = await fetchAvailableCategories(userId);
			setAvailableCategories(categories);
		};

		loadCategories();
	}, [userId]);

	const handleConfigChange = (updates: Partial<BookConfig>) => {
		setConfig((prev) => ({ ...prev, ...updates }));
	};

	const handleNext = () => {
		// Skip steps for FREE users
		if (config.planType === 'free') {
			if (currentStep === 0)
				setCurrentStep(1); // 0 → 1 (period)
			else if (currentStep === 1)
				setCurrentStep(2); // 1 → 2 (contexts)
			else if (currentStep === 2) {
				// FREE: skip style and layout, go directly to generation
				handleGenerateBook();
			}
		} else {
			// PREMIUM: full flow
			if (currentStep < 4) {
				setCurrentStep((prev) => (prev + 1) as WizardStep);
			}
		}
	};

	const handlePrevious = () => {
		if (currentStep > 0) {
			setCurrentStep((prev) => (prev - 1) as WizardStep);
		}
	};

	const handleGenerate = async () => {
		if (!userId) {
			toast.error('Ошибка', { description: 'Пользователь не авторизован' });
			return;
		}

		try {
			setIsGenerating(true);
			setShowProgress(true);

			// Validate minimum entries
			const { valid, count } = await validateMinimumEntries(
				userId,
				config.periodStart,
				config.periodEnd,
				config.contexts
			);

			if (!valid) {
				toast.error('Недостаточно записей', {
					description: `Найдено ${count} записей. Минимум 5 записей требуется для создания книги.`,
				});
				setIsGenerating(false);
				setShowProgress(false);
				return;
			}

			// Check free tier limit
			const supabase = createClient();
			const { data: profile } = await supabase
				.from('profiles')
				.select('is_premium')
				.eq('id', userId)
				.single();

			const isPremium = profile?.is_premium || false;
			const { canGenerate } = await checkFreeTierLimit(userId, isPremium);

			if (!canGenerate) {
				toast.error('Лимит исчерпан', {
					description:
						'Free пользователи могут создавать 1 книгу в месяц. Перейдите на Premium для неограниченной генерации.',
				});
				setIsGenerating(false);
				setShowProgress(false);
				return;
			}

			// Generate book draft
			const result = await generateBookDraft(config, userId, diaryName, diaryEmoji);

			if (!result.success) {
				throw new Error(result.error || 'Не удалось создать черновик');
			}

			setGeneratedDraftId(result.draftId || null);
			setGenerationError(null);
			toast.success('Черновик книги создан!');
		} catch (error) {
			console.error('[WIZARD] Error generating book:', error);
			const errorMessage =
				error instanceof Error ? error.message : 'Произошла ошибка при создании книги';
			setGenerationError(errorMessage);
			toast.error('Ошибка генерации', { description: errorMessage });
			setShowProgress(false);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleRetry = () => {
		setGenerationError(null);
		handleGenerate();
	};

	const handleProgressComplete = () => {
		setShowProgress(false);
		if (generatedDraftId) {
			// Show success modal instead of immediately calling onComplete
			setShowSuccessModal(true);
		}
	};

	const handleGoToEditor = () => {
		setShowSuccessModal(false);
		if (generatedDraftId) {
			onComplete?.(generatedDraftId);
		}
	};

	const handleGoToLibraryFromModal = () => {
		setShowSuccessModal(false);
		onGoToLibrary?.();
	};

	const getStepTitle = () => {
		switch (currentStep) {
			case 0:
				return 'Выберите тип книги';
			case 1:
				return 'Выберите период';
			case 2:
				return 'Выберите контексты';
			case 3:
				return 'Выберите стиль';
			case 4:
				return 'Выберите макет';
			default:
				return '';
		}
	};

	return (
		<>
			{/* Progress Modal */}
			{showProgress && (
				<BookGenerationProgress
					isOpen={showProgress}
					onClose={() => setShowProgress(false)}
					onComplete={handleProgressComplete}
				/>
			)}

			{/* Success Modal */}
			<BookCreationSuccessModal
				isOpen={showSuccessModal}
				// Primary CTA → открыть редактор книги
				onGoToLibrary={handleGoToEditor}
				// Secondary CTA → перейти на полку
				onClose={handleGoToLibraryFromModal}
			/>

			{/* Premium Upsell Modal */}
			{showUpsellModal && (
				<PremiumUpsellModal
					onClose={() => {
						setShowUpsellModal(false);
						setConfig((prev) => ({ ...prev, planType: 'free' }));
					}}
					onUpgrade={() => {
						window.location.href = '/premium';
					}}
				/>
			)}

			{/* Wizard */}
			<div className="flex h-full flex-col">
				{/* Progress Bar */}
				<div className="border-b border-border bg-card p-4 transition-colors duration-300">
					{(() => {
						// Calculate total steps and current step for display
						let totalSteps: number;
						let displayStep: number;

						if (isPremium && config.planType === 'premium') {
							// Premium: Step0 skipped, so 4 steps (1, 2, 3, 4)
							totalSteps = 4;
							displayStep = currentStep; // currentStep is already 1, 2, 3, 4
						} else if (config.planType === 'free') {
							// FREE: Step0 + Step1 + Step2 (skip 3, 4)
							totalSteps = 3;
							displayStep = currentStep + 1; // Convert 0-based to 1-based
						} else {
							// Default: Step0 + 1 + 2 + 3 + 4 = 5 steps
							totalSteps = 5;
							displayStep = currentStep + 1; // Convert 0-based to 1-based
						}

						const progress =
							totalSteps > 1 ? Math.round(((displayStep - 1) / (totalSteps - 1)) * 100) : 0;

						return (
							<>
								<div className="mb-2 flex items-center justify-between text-sm">
									<span className="text-muted-foreground">
										Шаг {displayStep} из {totalSteps}
									</span>
									<span className="font-medium">{progress}%</span>
								</div>
								<Progress className="h-2" value={progress} />
							</>
						);
					})()}
				</div>

				{/* Content */}
				<div className="max-h-[calc(100vh-180px)] overflow-y-auto p-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-base sm:text-lg">{getStepTitle()}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 sm:space-y-4">
							{currentStep === 0 && (
								<Step0PlanType
									config={config}
									isPremium={isPremium}
									onConfigChange={handleConfigChange}
									onUpgrade={() => setShowUpsellModal(true)}
								/>
							)}
							{currentStep === 1 && (
								<Step1Period config={config} onConfigChange={handleConfigChange} />
							)}
							{currentStep === 2 && (
								<Step2Contexts
									availableCategories={availableCategories}
									config={config}
									onConfigChange={handleConfigChange}
								/>
							)}
							{currentStep === 3 && (
								<Step3Style config={config} onConfigChange={handleConfigChange} />
							)}
							{currentStep === 4 && (
								<Step4Layout config={config} onConfigChange={handleConfigChange} />
							)}

							{/* Error Display */}
							{generationError && (
								<div className="rounded-lg border border-destructive bg-destructive/10 p-4">
									<p className="mb-2 font-semibold text-destructive">❌ Ошибка генерации</p>
									<p className="mb-3 text-sm text-destructive">{generationError}</p>
									<button
										className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors duration-300 hover:bg-destructive/90"
										onClick={handleRetry}
										type="button"
									>
										Повторить попытку
									</button>
								</div>
							)}

							{/* Final step hint */}
							{currentStep === 4 && (
								<div className="rounded-lg border border-border bg-muted/50 p-3 transition-colors duration-300">
									<p className="text-muted-foreground text-sm">
										Сейчас будет создан черновик книги. На следующем шаге ты сможешь отредактировать
										её и сохранить финальную PDF‑версию для скачивания.
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Navigation */}
				<WizardNavigation
					config={config}
					currentStep={currentStep}
					isGenerating={isGenerating}
					onCancel={onCancel}
					onGenerate={handleGenerate}
					onNext={handleNext}
					onPrevious={handlePrevious}
				/>
			</div>
		</>
	);
}
