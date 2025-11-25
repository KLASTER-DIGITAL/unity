/**
 * Book Creation Wizard - Main Component
 *
 * 4-step wizard for creating a personalized PDF book.
 * Enhanced with Framer Motion animations and confetti effects.
 *
 * @author UNITY Team
 * @date 2025-11-23
 */

import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { useBookCreation } from '../../hooks/useBookCreation';
import { BookCreationSuccessModal } from '../BookCreationSuccessModal';
import { BookGenerationProgress } from '../BookGenerationProgress';
import { PremiumUpsellModal } from '../PremiumUpsellModal';
import { Step0PlanType } from './Step0PlanType';
import { Step1Period } from './Step1Period';
import { Step2Contexts } from './Step2Contexts';
import { Step3Style } from './Step3Style';
import { Step4Layout } from './Step4Layout';
import type { BookCreationWizardProps } from './types';
import { WizardNavigation } from './WizardNavigation';

export function BookCreationWizard({
	onComplete,
	onCancel,
	onGoToLibrary,
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
		showUpsellModal,
		isLoadingUser,
		generationError,
		setConfig,
		setShowProgress,
		setShowSuccessModal,
		setShowUpsellModal,
		handleNext,
		handlePrevious,
		handleGenerate,
		handleRetry,
		handleProgressComplete,
		handleGoToEditor,
	} = useBookCreation(onComplete, existingBookId);

	// 🎉 Trigger confetti on success
	useEffect(() => {
		if (showSuccessModal) {
			const duration = 3 * 1000;
			const animationEnd = Date.now() + duration;
			const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

			const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

			const interval: ReturnType<typeof setInterval> = setInterval(() => {
				const timeLeft = animationEnd - Date.now();

				if (timeLeft <= 0) {
					return clearInterval(interval);
				}

				const particleCount = 50 * (timeLeft / duration);
				confetti({
					...defaults,
					particleCount,
					origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
				});
				confetti({
					...defaults,
					particleCount,
					origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
				});
			}, 250);

			return () => clearInterval(interval);
		}
	}, [showSuccessModal]);

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
					error={generationError}
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
			{isLoadingUser ? (
				<div className="flex h-full items-center justify-center">
					<div className="text-center">
						<div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
						<p className="text-muted-foreground text-sm">Загрузка...</p>
					</div>
				</div>
			) : (
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
						<Card className="overflow-hidden border-none shadow-none sm:border sm:shadow-sm">
							<CardHeader>
								<motion.div
									key={currentStep}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.3 }}
								>
									<CardTitle className="text-base sm:text-lg">{getStepTitle()}</CardTitle>
								</motion.div>
							</CardHeader>
							<CardContent className="space-y-3 sm:space-y-4">
								<AnimatePresence mode="wait">
									<motion.div
										key={currentStep}
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -20 }}
										transition={{ duration: 0.3 }}
									>
										{currentStep === 0 && (
											<Step0PlanType
												config={config}
												isPremium={isPremium}
												onConfigChange={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
												onUpgrade={() => setShowUpsellModal(true)}
											/>
										)}
										{currentStep === 1 && (
											<Step1Period
												config={config}
												onConfigChange={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
												isPremium={isPremium}
											/>
										)}
										{currentStep === 2 && (
											<Step2Contexts
												availableCategories={availableCategories}
												config={config}
												onConfigChange={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
											/>
										)}
										{currentStep === 3 && (
											<Step3Style
												config={config}
												onConfigChange={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
											/>
										)}
										{currentStep === 4 && (
											<Step4Layout
												config={config}
												onConfigChange={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
											/>
										)}
									</motion.div>
								</AnimatePresence>

								{/* Error Display */}
								{generationError && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: 'auto' }}
										className="rounded-lg border border-destructive bg-destructive/10 p-4"
									>
										<p className="mb-2 font-semibold text-destructive">❌ Ошибка генерации</p>
										<p className="mb-3 text-sm text-destructive">{generationError}</p>
										<button
											className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors duration-300 hover:bg-destructive/90"
											onClick={handleRetry}
											type="button"
										>
											Повторить попытку
										</button>
									</motion.div>
								)}

								{/* Final step hint */}
								{currentStep === 4 && (
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										className="rounded-lg border border-border bg-muted/50 p-3 transition-colors duration-300"
									>
										<p className="text-muted-foreground text-sm">
											{existingBookId
												? 'Сейчас книга будет обновлена. Старая версия будет удалена.'
												: 'Сейчас будет создан черновик книги. На следующем шаге ты сможешь отредактировать её.'}
										</p>
									</motion.div>
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
			)}
		</>
	);
}
