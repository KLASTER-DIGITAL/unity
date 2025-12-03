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
import { useEffect, useState } from 'react';
import { haptics } from '@/shared/lib/platform/haptics';
import { useBookCreation } from '../../hooks/useBookCreation';
import { BookCreationSuccessModal } from '../BookCreationSuccessModal';
import { BookGenerationProgress } from '../BookGenerationProgress';
import { PremiumUpsellModal } from '../PremiumUpsellModal';
import { Step0PlanType } from './Step0PlanType';
import { Step1Period } from './Step1Period';
import { Step2Contexts } from './Step2Contexts';
import { Step3Style } from './Step3Style';
import { Step4Layout } from './Step4Layout';
import { WizardNavigation } from './WizardNavigation';

type BookCreationWizardProps = {
	onComplete?: (draftId: string) => void;
	onCancel?: () => void;
	onGoToLibrary?: () => void;
	existingBookId?: string;
};

export function BookCreationWizard({
	onComplete,
	onCancel,
	onGoToLibrary,
	existingBookId,
}: BookCreationWizardProps) {
	const {
		currentStep,
		config,
		handleNext,
		handlePrevious,
		handleGenerate,
		handleRetry,
		handleProgressComplete,
		handleGoToEditor,
		isGenerating,
		showProgress,
		showSuccessModal, // ✅ FIX: Используем состояние из хука вместо локального
		generatedDraftId: _generatedDraftId,
		availableCategories,
		generationError,
		isPremium,
		isLoadingUser,
		setConfig,
		setShowProgress,
		setShowSuccessModal, // ✅ FIX: Добавляем setter для управления модалкой
	} = useBookCreation(onComplete, existingBookId);

	const [showUpsellModal, setShowUpsellModal] = useState(false);

	// Haptic feedback on step change
	useEffect(() => {
		if (currentStep > 0) {
			void haptics.trigger('light');
		}
	}, [currentStep]);

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
		onGoToLibrary?.(); // ✅ FIX: Переход на полку книг
	};

	const handleGoToEditorFromModal = () => {
		setShowSuccessModal(false);
		handleGoToEditor(); // ✅ FIX: Переход к редактору книги
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
			{/* Background Effects */}
			<div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
				<div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[100px] dark:bg-purple-500/20" />
				<div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[100px] dark:bg-blue-500/20" />
			</div>

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
				onGoToLibrary={handleGoToEditorFromModal} // ✅ FIX: Переход к редактору
				onClose={handleGoToLibraryFromModal} // ✅ FIX: Переход на полку книг
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

			{/* Wizard Content - скрываем когда показывается модальное окно успеха */}
			{!showSuccessModal && (
				<div className="relative z-10 flex flex-col h-full max-w-md mx-auto w-full">
					{isLoadingUser ? (
						<div className="flex-1 flex items-center justify-center">
							<div className="text-center">
								<div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
								<p className="text-muted-foreground text-sm font-medium">Загрузка...</p>
							</div>
						</div>
					) : (
						<>
							{/* Header & Progress */}
							<div className="pt-6 pb-2 px-6">
								{(() => {
									// ✅ FIX: Always show 5 steps (0-4) for consistency
									const totalSteps = 5;
									const displayStep = currentStep + 1;

									const progress =
										totalSteps > 1 ? ((displayStep - 1) / (totalSteps - 1)) * 100 : 0;

									return (
										<div className="space-y-4">
											{/* Progress Bar */}
											<div className="h-1 w-full bg-muted rounded-full overflow-hidden">
												<motion.div
													className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
													initial={{ width: 0 }}
													animate={{ width: `${progress}%` }}
													transition={{ duration: 0.5, ease: 'easeInOut' }}
												/>
											</div>

											{/* Title */}
											<div className="text-center">
												<motion.h2
													key={currentStep}
													initial={{ opacity: 0, y: 10 }}
													animate={{ opacity: 1, y: 0 }}
													className="text-xl font-bold text-foreground"
												>
													{getStepTitle()}
												</motion.h2>
											</div>
										</div>
									);
								})()}
							</div>

							{/* Main Content Area */}
							<div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide">
								<div className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-5 shadow-2xl min-h-[400px] flex flex-col">
									<AnimatePresence mode="wait">
										<motion.div
											key={currentStep}
											initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
											animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
											exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
											transition={{ duration: 0.4, ease: 'easeOut' }}
											className="flex-1"
										>
											{currentStep === 0 && (
												<Step0PlanType
													config={config}
													isPremium={isPremium}
													onConfigChange={(updates) =>
														setConfig((prev) => ({ ...prev, ...updates }))
													}
													onUpgrade={() => setShowUpsellModal(true)}
												/>
											)}
											{currentStep === 1 && (
												<Step1Period
													config={config}
													onConfigChange={(updates) =>
														setConfig((prev) => ({ ...prev, ...updates }))
													}
													isPremium={isPremium}
												/>
											)}
											{currentStep === 2 && (
												<Step2Contexts
													availableCategories={availableCategories}
													config={config}
													onConfigChange={(updates) =>
														setConfig((prev) => ({ ...prev, ...updates }))
													}
												/>
											)}
											{currentStep === 3 && (
												<Step3Style
													config={config}
													onConfigChange={(updates) =>
														setConfig((prev) => ({ ...prev, ...updates }))
													}
													isPremium={isPremium}
													onUpgrade={() => setShowUpsellModal(true)}
												/>
											)}
											{currentStep === 4 && (
												<Step4Layout
													config={config}
													onConfigChange={(updates) =>
														setConfig((prev) => ({ ...prev, ...updates }))
													}
													isPremium={isPremium}
													onUpgrade={() => setShowUpsellModal(true)}
												/>
											)}
										</motion.div>
									</AnimatePresence>

									{/* Error Display */}
									<AnimatePresence>
										{generationError && (
											<motion.div
												initial={{ opacity: 0, height: 0, marginTop: 0 }}
												animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
												exit={{ opacity: 0, height: 0, marginTop: 0 }}
												className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 overflow-hidden"
											>
												<p className="mb-2 font-semibold text-red-400">❌ Ошибка генерации</p>
												<p className="mb-3 text-sm text-white/70">{generationError}</p>
												<button
													className="w-full rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 py-2 text-sm font-medium text-red-200 transition-colors"
													onClick={handleRetry}
													type="button"
												>
													Повторить попытку
												</button>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							</div>

							{/* Navigation */}
							<div className="p-4 pb-8">
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
					)}
				</div>
			)}
		</>
	);
}
