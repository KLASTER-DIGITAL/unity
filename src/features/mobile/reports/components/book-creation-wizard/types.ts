/**
 * Types for Book Creation Wizard
 */

export type BookCreationWizardProps = {
	onComplete?: (draftId: string) => void;
	onCancel?: () => void;
	onGoToLibrary?: () => void;
};

export type WizardStep = 0 | 1 | 2 | 3 | 4;

export type BookConfig = {
	planType: 'free' | 'premium' | '';
	type: 'month' | 'quarter' | 'year' | 'family' | 'custom';
	periodStart: string;
	periodEnd: string;
	contexts: string[];
	style: 'warm_family' | 'biographical' | 'motivational' | '';
	layout: 'photo_text' | 'text_only' | 'minimal' | '';
};

export type BookStyle = 'warm_family' | 'biographical' | 'motivational';
export type BookLayout = 'photo_text' | 'text_only' | 'minimal';

export type WizardState = {
	currentStep: WizardStep;
	isGenerating: boolean;
	showProgress: boolean;
	generatedDraftId: string | null;
	availableCategories: string[];
	userId: string | null;
	diaryName: string;
	diaryEmoji: string;
	generationError: string | null;
	config: BookConfig;
};
