/**
 * OnboardingScreen3 - Type definitions
 */

export interface OnboardingScreen3Props {
  selectedLanguage: string;
  onNext: (diaryName: string, emoji: string) => void;
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
}

export interface PersonalizationFormProps {
  currentTranslations: any;
  onNext: (name: string, emoji: string) => void;
  onUpdate?: (name: string, emoji: string) => void;
}

export interface SliedbarProps {
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
}

export interface NextButtonProps {
  onNext: () => void;
  disabled: boolean;
  validationMessage?: string;
}

export interface ArrowRight1Props {
  onClick: () => void;
  disabled: boolean;
}

