import { useState } from "react";
import { motion } from "motion/react";

// Import modular components
import {
  PersonalizationForm,
  Sliedbar,
  NextButton,
  translations
} from "./onboarding3";
import type { OnboardingScreen3Props } from "./onboarding3";

// Re-export types for backward compatibility
export type { OnboardingScreen3Props };

// ✅ REMOVED: PersonalizationForm moved to ./onboarding3/PersonalizationForm.tsx
// ✅ REMOVED: Sliedbar moved to ./onboarding3/Sliedbar.tsx
// ✅ REMOVED: ArrowRight, ArrowRight1, NextButton moved to ./onboarding3/NextButton.tsx

function Frame2087324619({ selectedLanguage, onNext, currentStep, totalSteps, onStepClick }: OnboardingScreen3Props) {
  const currentTranslations = translations[selectedLanguage as keyof typeof translations] || translations.ru;
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [formData, setFormData] = useState({ name: "", emoji: "🏆" });

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
      className="content-center flex flex-wrap gap-0 h-screen items-center justify-center relative shrink-0 w-full max-w-[444px] mx-auto overflow-hidden scrollbar-hide"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PersonalizationForm 
        currentTranslations={currentTranslations} 
        onNext={handlePersonalizationNext}
        onUpdate={handleFormUpdate}
      />
      <Sliedbar currentStep={currentStep} totalSteps={totalSteps} onStepClick={onStepClick} />
      <NextButton
        onNext={() => handlePersonalizationNext(formData.name || currentTranslations.presets[0], formData.emoji)}
        disabled={!isFormComplete}
        validationMessage={currentTranslations.validationError}
      />
    </motion.div>
  );
}

export function OnboardingScreen3({ selectedLanguage, onNext, currentStep, totalSteps, onStepClick }: OnboardingScreen3Props) {
  return (
    <motion.div
      className="bg-white content-stretch flex gap-2.5 items-center justify-center relative size-full h-screen overflow-hidden scrollbar-hide"
      data-name="Onboard 3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background elements */}
      <motion.div
        className="absolute top-10 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-[#756ef3]/10 to-[#756ef3]/5"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      <motion.div
        className="absolute top-32 right-16 w-12 h-12 rounded-full bg-gradient-to-br from-[#8B78FF]/20 to-[#5451D6]/10"
        animate={{
          scale: [1, 0.8, 1],
          x: [0, 10, 0],
          y: [0, -5, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute bottom-24 left-20 w-6 h-6 rounded-full bg-gradient-to-br from-[#756ef3]/15 to-transparent"
        animate={{
          scale: [0.5, 1, 0.5],
          opacity: [0.2, 0.8, 0.2]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <Frame2087324619
        selectedLanguage={selectedLanguage}
        onNext={onNext}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onStepClick={onStepClick}
      />
    </motion.div>
  );
}
export default OnboardingScreen3;
