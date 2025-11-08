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
import { BookGenerationProgress } from '../BookGenerationProgress';
import { DEFAULT_PERIOD_DAYS } from './constants';
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

export function BookCreationWizard({ onComplete, onCancel }: BookCreationWizardProps) {
	const [currentStep, setCurrentStep] = useState<WizardStep>(1);
	const [isGenerating, setIsGenerating] = useState(false);
	const [showProgress, setShowProgress] = useState(false);
	const [generatedDraftId, setGeneratedDraftId] = useState<string | null>(null);
	const [availableCategories, setAvailableCategories] = useState<string[]>([]);
	const [userId, setUserId] = useState<string | null>(null);
	const [diaryName, setDiaryName] = useState<string>('');
	const [diaryEmoji, setDiaryEmoji] = useState<string>('');
	const [generationError, setGenerationError] = useState<string | null>(null);

	const [config, setConfig] = useState<BookConfig>({
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
					.select('diary_name, diary_emoji')
					.eq('id', session.user.id)
					.single();

				if (profile) {
					setDiaryName(profile.diary_name || '');
					setDiaryEmoji(profile.diary_emoji || '');
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
		if (currentStep < 4) {
			setCurrentStep((prev) => (prev + 1) as WizardStep);
		}
	};

	const handlePrevious = () => {
		if (currentStep > 1) {
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
			onComplete?.(generatedDraftId);
		}
	};

	const getStepTitle = () => {
		switch (currentStep) {
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

			{/* Wizard */}
			<div className="flex h-full flex-col">
				{/* Progress Bar */}
				<div className="border-b border-border bg-card p-4 transition-colors duration-300">
					<div className="mb-2 flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Шаг {currentStep} из 4</span>
						<span className="font-medium">{Math.round((currentStep / 4) * 100)}%</span>
					</div>
					<Progress className="h-2" value={(currentStep / 4) * 100} />
				</div>

				{/* Content */}
				<div className="max-h-[calc(100vh-180px)] overflow-y-auto p-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-base sm:text-lg">{getStepTitle()}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 sm:space-y-4">
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
