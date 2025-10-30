/**
 * OnboardingScreen3 - Type definitions
 */

export type OnboardingScreen3Props = {
  selectedLanguage: string;
  onNext: (diaryName: string, emoji: string) => void;
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
};

export type PersonalizationFormProps = {
  currentTranslations: any;
  onNext: (name: string, emoji: string) => void;
  onUpdate?: (name: string, emoji: string) => void;
};

export type SliedbarProps = {
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
};

export type NextButtonProps = {
  onNext: () => void;
  disabled: boolean;
  validationMessage?: string;
};

export type ArrowRight1Props = {
  onClick: () => void;
  disabled: boolean;
};
