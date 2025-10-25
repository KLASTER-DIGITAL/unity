import { motion } from "motion/react";
import { PriorityOptimizedImage } from "@/shared/components/OptimizedImage";
import { imgCircle, imgSliedbar, imgArrowRight, imgRectangle5904 } from "@/imports/svg-6xkhk";
// Import hero image directly for Vite to process
import heroImageSrc from "@/assets/5f4bd000111b1df6537a53aaf570a9424e39fbcf.webp";

interface OnboardingScreen2Props {
  selectedLanguage: string;
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
}

const translations = {
  ru: {
    subtitle: "Твои маленькие шаги — большие победы",
    title: "Фиксируй достижения и смотри, как растёт твой прогресс"
  },
  en: {
    subtitle: "Your small steps — big victories",
    title: "Track achievements and watch your progress grow"
  },
  es: {
    subtitle: "Tus pequeños pasos — grandes victorias",
    title: "Rastrea logros y observa cómo crece tu progreso"
  },
  de: {
    subtitle: "Deine kleinen Schritte — große Siege",
    title: "Verfolge Erfolge und sieh, wie dein Fortschritt wächst"
  },
  fr: {
    subtitle: "Tes petits pas — de grandes victoires",
    title: "Suivez les réalisations et regardez votre progrès grandir"
  },
  zh: {
    subtitle: "你的小步骤——大胜利",
    title: "跟踪成就，观看你的进步增长"
  },
  ja: {
    subtitle: "あなたの小さな一歩—大きな勝利",
    title: "成果を追跡し、進歩の成長を見る"
  }
};

function Circle() {
  return (
    <motion.div 
      className="relative shrink-0 pointer-events-none" 
      data-name="Circle"
      style={{
        height: 'clamp(300px, 48vh, 434px)',
        width: 'min(369px, 90vw)',
        marginTop: 'min(10px, 1vh)'
      }}
      initial={{ opacity: 0, rotate: -10, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        rotate: 0, 
        scale: 1,
        y: [0, -5, 0]
      }}
      transition={{ 
        delay: 0.2, 
        duration: 1,
        y: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      <img className="block max-w-none size-full" src={imgCircle} />
    </motion.div>
  );
}

function Text({ currentTranslations }: { currentTranslations: any }) {
  return (
    <motion.div 
      className="absolute gap-3 grid grid-cols-[repeat(1,_minmax(0px,_1fr))] grid-rows-[repeat(2,_minmax(0px,_1fr))] leading-[0] translate-x-[-50%] px-4" 
      data-name="Text" 
      style={{ 
        left: "50%",
        top: "clamp(300px, calc(100vh - 270px), 453px)",
        width: 'min(335px, calc(100vw - 32px))',
        height: 'clamp(100px, 13vh, 133px)'
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.7 }}
    >
      <motion.div 
        className="[grid-area:1_/_1] font-['Poppins:Medium',_'Noto_Sans:Regular',_sans-serif] relative shrink-0 text-[#756ef3] text-[14px]" 
        style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}
        key={currentTranslations.subtitle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <p className="leading-[18px] font-[Days_One] font-bold font-normal text-[12px]">{currentTranslations.subtitle}</p>
      </motion.div>
      <motion.div
        className="[grid-area:2_/_1] font-['Poppins:Regular',_'Noto_Sans:Regular',_sans-serif] relative self-start shrink-0 text-[#002055] dark:text-[#1a1a1a] text-[28px] tracking-[-1px] w-full"
        style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}
        key={currentTranslations.title}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="!leading-[33px] text-[24px]! font-semibold! font-![Days_One]">{currentTranslations.title}</p>
      </motion.div>
    </motion.div>
  );
}

function Sliedbar({ currentStep, totalSteps, onStepClick }: { currentStep: number; totalSteps: number; onStepClick: (step: number) => void }) {
  return (
    <motion.div 
      className="absolute flex items-center gap-[8px]" 
      data-name="Sliedbar" 
      style={{ 
        bottom: "max(calc(env(safe-area-inset-bottom, 20px) + 85px), 85px)",
        left: "min(25px, 8vw)"
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
      {Array.from({ length: totalSteps }, (_, index) => (
        <motion.button
          key={index}
          onClick={() => onStepClick(index + 1)}
          className={`h-[6px] rounded-[4px] cursor-pointer border-0 p-0 transition-all duration-300 hover:scale-110 ${
            index === 0 ? 'w-[25px]' : 'w-[8px]'
          }`}
          style={{
            background: 'linear-gradient(135.96deg, #8B78FF 0%, #5451D6 101.74%)',
            opacity: index < currentStep ? 1 : 0.4
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: index < currentStep ? 1 : 0.3 }}
          transition={{ delay: 0.8 + index * 0.1, duration: 0.8, ease: "easeOut" }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        />
      ))}
    </motion.div>
  );
}

function ArrowRight() {
  return (
    <div className="relative size-full" data-name="Arrow - Right">
      <div className="absolute inset-[-5%_-6.22%]">
        <img className="block max-w-none size-full" src={imgArrowRight} />
      </div>
    </div>
  );
}

function ArrowRight1({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute size-6 bg-transparent border-0 cursor-pointer z-10" 
      data-name="Arrow - Right"
      style={{
        bottom: "max(env(safe-area-inset-bottom, 20px), 20px)",
        right: "min(46px, 12vw)"
      }}
    >
      <div className="absolute flex inset-[23.75%_17.71%_26.04%_19.79%] items-center justify-center pointer-events-none">
        <div className="flex-none h-[15px] rotate-[270deg] w-[12.049px]">
          <ArrowRight />
        </div>
      </div>
    </button>
  );
}

function NextButton({ onNext }: { onNext: () => void }) {
  return (
    <motion.div 
      className="absolute contents" 
      style={{
        bottom: "max(env(safe-area-inset-bottom, 0px), 0px)",
        right: "max(-1px, calc(0px - 1vw))"
      }}
      data-name="Next Button"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.6, type: "spring" }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <button
        onClick={onNext}
        className="absolute bg-transparent border-0 cursor-pointer"
        style={{
          bottom: "max(env(safe-area-inset-bottom, 0px), 0px)",
          right: "max(-1px, calc(0px - 1vw))",
          height: 'min(191px, 25vh)',
          width: 'min(129px, 30vw)'
        }}
      >
        <div className="absolute bottom-0 left-[7.57%] right-0 top-0 pointer-events-none">
          <img className="block max-w-none size-full" src={imgRectangle5904} />
        </div>
      </button>
      <ArrowRight1 onClick={onNext} />
    </motion.div>
  );
}



function Frame2087324618({ selectedLanguage, onNext, currentStep, totalSteps, onStepClick }: OnboardingScreen2Props) {
  const currentTranslations = translations[selectedLanguage as keyof typeof translations] || translations.ru;

  return (
    <motion.div 
      className="content-center flex flex-wrap gap-0 h-screen items-center justify-center relative shrink-0 w-full max-w-[444px] mx-auto overflow-hidden scrollbar-hide"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Circle />
      <motion.div
        className="absolute translate-x-[-50%] rounded-lg overflow-hidden"
        data-name="image 1569"
        style={{
          left: "50%",
          top: "clamp(0px, -5vh, 15px)",
          height: 'min(379px, 50vh)',
          width: 'min(314px, 85vw)',
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <PriorityOptimizedImage
          src={heroImageSrc}
          alt="Onboarding illustration"
          className="w-full h-full object-cover"
          priority={true}
        />
      </motion.div>
      <Text currentTranslations={currentTranslations} />
      <Sliedbar currentStep={currentStep} totalSteps={totalSteps} onStepClick={onStepClick} />
      <NextButton onNext={onNext} />
    </motion.div>
  );
}

export function OnboardingScreen2({ selectedLanguage, onNext, currentStep, totalSteps, onStepClick }: OnboardingScreen2Props) {
  return (
    <div className="bg-white content-stretch flex gap-2.5 items-center justify-center relative size-full h-screen overflow-hidden scrollbar-hide" data-name="Onboard 2">
      <Frame2087324618
        selectedLanguage={selectedLanguage}
        onNext={onNext}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onStepClick={onStepClick}
      />
    </div>
  );
}
export default OnboardingScreen2;
