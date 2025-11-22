/**
 * Book Generation Progress Modal
 *
 * Shows progress while AI generates book draft.
 * Provides visual feedback and estimated time.
 *
 * @author UNITY Team
 * @date 2025-11-07
 */

import { Book, Check, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';

export type BookGenerationProgressProps = {
	isOpen: boolean;
	onClose?: () => void;
	onComplete?: () => void;
};

type GenerationStep = {
	id: string;
	label: string;
	duration: number; // seconds
	icon: React.ReactNode;
};

const GENERATION_STEPS: GenerationStep[] = [
	{
		id: 'loading',
		label: 'Загрузка записей из дневника...',
		duration: 5,
		icon: <Book className="h-5 w-5" strokeWidth={2} />,
	},
	{
		id: 'analyzing',
		label: 'Анализ контекстов и настроений...',
		duration: 10,
		icon: <Sparkles className="h-5 w-5" strokeWidth={2} />,
	},
	{
		id: 'generating',
		label: 'Генерация структуры книги...',
		duration: 30,
		icon: <Sparkles className="h-5 w-5 animate-spin" strokeWidth={2} />,
	},
	{
		id: 'creating',
		label: 'Создание черновика...',
		duration: 10,
		icon: <Book className="h-5 w-5" strokeWidth={2} />,
	},
	{
		id: 'done',
		label: 'Готово!',
		duration: 2,
		icon: <Check className="h-5 w-5" strokeWidth={2} />,
	},
];

export function BookGenerationProgress({
	isOpen,
	onClose,
	onComplete,
}: BookGenerationProgressProps) {
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		if (!isOpen) {
			setCurrentStepIndex(0);
			setProgress(0);
			return;
		}

		// ✅ Prevent multiple calls to onComplete
		let completed = false;

		// Simulate progress through steps
		const totalDuration = GENERATION_STEPS.reduce((sum, step) => sum + step.duration, 0);
		let elapsed = 0;

		const interval = setInterval(() => {
			elapsed += 0.5;
			const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
			setProgress(newProgress);

			// Update current step
			let cumulativeDuration = 0;
			for (let i = 0; i < GENERATION_STEPS.length; i++) {
				cumulativeDuration += GENERATION_STEPS[i].duration;
				if (elapsed < cumulativeDuration) {
					setCurrentStepIndex(i);
					break;
				}
			}

			// Complete when done (only once)
			if (elapsed >= totalDuration && !completed) {
				completed = true;
				clearInterval(interval);
				setTimeout(() => {
					onComplete?.();
				}, 1000);
			}
		}, 500);

		return () => {
			clearInterval(interval);
			completed = true; // Prevent call if component unmounts
		};
	}, [isOpen, onComplete]);

	if (!isOpen) return null;

	const currentStep = GENERATION_STEPS[currentStepIndex];
	const estimatedTimeLeft = Math.ceil(
		GENERATION_STEPS.slice(currentStepIndex).reduce((sum, step) => sum + step.duration, 0)
	);

	return (
		<div className="scrollbar-hide fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
			<div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8">
				{/* Header */}
				<div className="mb-6 text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[--ios-purple] sm:h-20 sm:w-20">
						<Sparkles className="h-8 w-8 text-white sm:h-10 sm:w-10" strokeWidth={2} />
					</div>
					<h2 className="mb-2 text-xl font-semibold sm:text-2xl">✨ Создаем твою книгу...</h2>
					<p className="text-muted-foreground text-sm sm:text-base">
						Собираем воспоминания и создаем персональную историю
					</p>
				</div>

				{/* Progress Bar */}
				<div className="mb-6">
					<Progress className="h-2" value={progress} />
					<div className="mt-2 flex items-center justify-between text-xs text-muted-foreground sm:text-sm">
						<span>{Math.round(progress)}%</span>
						<span>~{estimatedTimeLeft} сек</span>
					</div>
				</div>

				{/* Current Step */}
				<div className="mb-6 rounded-lg border border-border bg-muted/50 p-4">
					<div className="flex items-center gap-3">
						<div className="text-primary">{currentStep.icon}</div>
						<p className="flex-1 text-sm font-medium sm:text-base">{currentStep.label}</p>
					</div>
				</div>

				{/* Note: Success modal will be shown after completion */}
			</div>
		</div>
	);
}
