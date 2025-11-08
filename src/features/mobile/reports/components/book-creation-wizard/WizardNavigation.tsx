/**
 * Wizard Navigation Component
 */

import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { BookConfig, WizardStep } from './types';

type WizardNavigationProps = {
	currentStep: WizardStep;
	config: BookConfig;
	isGenerating: boolean;
	onPrevious: () => void;
	onNext: () => void;
	onGenerate: () => void;
	onCancel?: () => void;
};

export function WizardNavigation({
	currentStep,
	config,
	isGenerating,
	onPrevious,
	onNext,
	onGenerate,
	onCancel,
}: WizardNavigationProps) {
	const canProceed = () => {
		switch (currentStep) {
			case 1:
				return config.periodStart && config.periodEnd;
			case 2:
				return true; // Contexts are optional
			case 3:
				return config.style !== '';
			case 4:
				return config.layout !== '';
			default:
				return false;
		}
	};

	return (
		<div className="flex items-center justify-between gap-3 border-t border-border bg-card p-4 transition-colors duration-300">
			{/* Cancel / Previous */}
			{currentStep === 1 ? (
				<Button onClick={onCancel} size="lg" variant="outline">
					Отмена
				</Button>
			) : (
				<Button disabled={isGenerating} onClick={onPrevious} size="lg" variant="outline">
					<ChevronLeft className="mr-2 h-5 w-5" strokeWidth={2} />
					Назад
				</Button>
			)}

			{/* Next / Generate */}
			{currentStep === 4 ? (
				<Button disabled={!canProceed() || isGenerating} onClick={onGenerate} size="lg">
					<Sparkles className="mr-2 h-5 w-5" strokeWidth={2} />
					Создать книгу
				</Button>
			) : (
				<Button disabled={!canProceed() || isGenerating} onClick={onNext} size="lg">
					Далее
					<ChevronRight className="ml-2 h-5 w-5" strokeWidth={2} />
				</Button>
			)}
		</div>
	);
}
