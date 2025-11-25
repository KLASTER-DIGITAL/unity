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
		<div className="flex items-center justify-between gap-4">
			{/* Cancel / Previous */}
			{currentStep === 1 ? (
				<Button
					onClick={onCancel}
					size="lg"
					variant="ghost"
					className="text-white/60 hover:text-white hover:bg-white/10"
				>
					Отмена
				</Button>
			) : (
				<Button
					disabled={isGenerating}
					onClick={onPrevious}
					size="lg"
					variant="ghost"
					className="text-white/60 hover:text-white hover:bg-white/10"
				>
					<ChevronLeft className="mr-2 h-5 w-5" strokeWidth={2} />
					Назад
				</Button>
			)}

			{/* Next / Generate */}
			{currentStep === 4 ? (
				<Button
					disabled={!canProceed() || isGenerating}
					onClick={onGenerate}
					size="lg"
					className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-lg shadow-purple-500/20"
				>
					<Sparkles className="mr-2 h-5 w-5" strokeWidth={2} />
					Создать книгу
				</Button>
			) : (
				<Button
					disabled={!canProceed() || isGenerating}
					onClick={onNext}
					size="lg"
					className="bg-white text-black hover:bg-white/90 border-0"
				>
					Далее
					<ChevronRight className="ml-2 h-5 w-5" strokeWidth={2} />
				</Button>
			)}
		</div>
	);
}
