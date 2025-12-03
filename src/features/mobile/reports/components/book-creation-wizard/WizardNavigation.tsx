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
		<div className="flex items-center justify-between gap-4 w-full">
			{/* Cancel / Previous */}
			{currentStep === 1 ? (
				<Button
					onClick={onCancel}
					size="lg"
					variant="ghost"
					className="text-muted-foreground hover:text-foreground hover:bg-accent shrink-0"
				>
					Отмена
				</Button>
			) : (
				<Button
					disabled={isGenerating}
					onClick={onPrevious}
					size="lg"
					variant="ghost"
					className="text-muted-foreground hover:text-foreground hover:bg-accent shrink-0"
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
					className="flex-1 min-w-[140px] border-0 shadow-lg shadow-purple-500/20 font-semibold"
					style={{
						background: 'linear-gradient(to right, #a855f7, #3b82f6)',
						color: '#ffffff',
					}} // ✅ FIX: Явно задаем градиент и белый цвет текста для гарантированной видимости
				>
					<Sparkles className="mr-2 h-5 w-5" strokeWidth={2} style={{ color: '#ffffff' }} />
					<span className="whitespace-nowrap font-semibold" style={{ color: '#ffffff' }}>
						Создать книгу
					</span>
				</Button>
			) : (
				<Button
					disabled={!canProceed() || isGenerating}
					onClick={onNext}
					size="lg"
					className="bg-primary text-primary-foreground hover:bg-primary/90 border-0 flex-1 min-w-[100px]"
				>
					<span className="whitespace-nowrap">Далее</span>
					<ChevronRight className="ml-2 h-5 w-5" strokeWidth={2} />
				</Button>
			)}
		</div>
	);
}
