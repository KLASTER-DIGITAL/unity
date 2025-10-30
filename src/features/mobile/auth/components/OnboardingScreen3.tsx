import { motion } from 'motion/react';
import { useState } from 'react';
import type { OnboardingScreen3Props } from './onboarding3';
// Import modular components
import { NextButton, PersonalizationForm, Sliedbar, translations } from './onboarding3';

// Re-export types for backward compatibility
export type { OnboardingScreen3Props };

// ✅ REMOVED: PersonalizationForm moved to ./onboarding3/PersonalizationForm.tsx
// ✅ REMOVED: Sliedbar moved to ./onboarding3/Sliedbar.tsx
// ✅ REMOVED: ArrowRight, ArrowRight1, NextButton moved to ./onboarding3/NextButton.tsx

function Frame2087324619({
  selectedLanguage,
  onNext,
  currentStep,
  totalSteps,
  onStepClick,
}: OnboardingScreen3Props) {
  const currentTranslations =
    translations[selectedLanguage as keyof typeof translations] || translations.ru;
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [formData, setFormData] = useState({ name: '', emoji: '🏆' });

  const handlePersonalizationNext = (name: string, emoji: string) => {
    setFormData({ name, emoji });
    setIsFormComplete(true);
    onNext(name, emoji);
  };

  const handleFormUpdate = (name: string, emoji: string) => {
    setFormData({ name, emoji });
    setIsFormComplete(name.trim().length > 0);
  };

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="scrollbar-hide relative mx-auto flex h-screen w-full max-w-[444px] shrink-0 flex-wrap content-center items-center justify-center gap-0 overflow-hidden"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <PersonalizationForm
        currentTranslations={currentTranslations}
        onNext={handlePersonalizationNext}
        onUpdate={handleFormUpdate}
      />
      <Sliedbar currentStep={currentStep} onStepClick={onStepClick} totalSteps={totalSteps} />
      <NextButton
        disabled={!isFormComplete}
        onNext={() =>
          handlePersonalizationNext(formData.name || currentTranslations.presets[0], formData.emoji)
        }
        validationMessage={currentTranslations.validationError}
      />
    </motion.div>
  );
}

export function OnboardingScreen3({
  selectedLanguage,
  onNext,
  currentStep,
  totalSteps,
  onStepClick,
}: OnboardingScreen3Props) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="scrollbar-hide relative flex size-full h-screen content-stretch items-center justify-center gap-2.5 overflow-hidden bg-card"
      data-name="Onboard 3"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
          opacity: [0.3, 0.6, 0.3],
        }}
        className="absolute top-10 left-10 h-20 w-20 rounded-full bg-linear-to-br from-[#756ef3]/10 to-[#756ef3]/5"
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'linear',
        }}
      />

      <motion.div
        animate={{
          scale: [1, 0.8, 1],
          x: [0, 10, 0],
          y: [0, -5, 0],
        }}
        className="absolute top-32 right-16 h-12 w-12 rounded-full bg-linear-to-br from-[#8B78FF]/20 to-[#5451D6]/10"
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        animate={{
          scale: [0.5, 1, 0.5],
          opacity: [0.2, 0.8, 0.2],
        }}
        className="absolute bottom-24 left-20 h-6 w-6 rounded-full bg-linear-to-br from-[#756ef3]/15 to-transparent"
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />

      <Frame2087324619
        currentStep={currentStep}
        onNext={onNext}
        onStepClick={onStepClick}
        selectedLanguage={selectedLanguage}
        totalSteps={totalSteps}
      />
    </motion.div>
  );
}
export default OnboardingScreen3;
