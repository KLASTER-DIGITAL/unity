import { useState } from "react";
import { motion } from "motion/react";
import { imgSliedbar, imgArrowRight, imgRectangle5904 } from "../imports/svg-6xkhk";

interface OnboardingScreen3Props {
  selectedLanguage: string;
  onNext: (diaryName: string, emoji: string) => void;
  onSkip: () => void;
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
}

const translations = {
  ru: {
    title: "Дай имя своему дневнику",
    subtitle: "Персонализируй свой путь к успеху",
    placeholder: "Название дневника",
    presets: ["Мой путь", "Достижения", "Я — молодец!"],
    skip: "Skip"
  },
  en: {
    title: "Name your diary",
    subtitle: "Personalize your path to success",
    placeholder: "Diary name",
    presets: ["My Path", "Achievements", "I'm Awesome!"],
    skip: "Skip"
  },
  es: {
    title: "Dale nombre a tu diario",
    subtitle: "Personaliza tu camino al éxito",
    placeholder: "Nombre del diario",
    presets: ["Mi Camino", "Logros", "¡Soy Genial!"],
    skip: "Skip"
  },
  de: {
    title: "Benenne dein Tagebuch",
    subtitle: "Personalisiere deinen Weg zum Erfolg",
    placeholder: "Tagebuch Name",
    presets: ["Mein Weg", "Erfolge", "Ich bin toll!"],
    skip: "Skip"
  },
  fr: {
    title: "Nomme ton journal",
    subtitle: "Personnalise ton chemin vers le succès",
    placeholder: "Nom du journal",
    presets: ["Mon Chemin", "Réussites", "Je suis génial!"],
    skip: "Skip"
  },
  zh: {
    title: "为你的日记命名",
    subtitle: "个性化你的成功之路",
    placeholder: "日记名称",
    presets: ["我的道路", "成就", "我很棒!"],
    skip: "跳过"
  },
  ja: {
    title: "日記に名前をつけよう",
    subtitle: "成功への道のりをパーソナライズ",
    placeholder: "日記の名前",
    presets: ["私の道", "成果", "私は素晴らしい!"],
    skip: "スキップ"
  }
};

const emojiOptions = ["🏆", "🚀", "💪", "🎯", "🌟"];

function PersonalizationForm({ currentTranslations, onNext, onUpdate }: { 
  currentTranslations: any; 
  onNext: (name: string, emoji: string) => void;
  onUpdate?: (name: string, emoji: string) => void;
}) {
  const [diaryName, setDiaryName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🏆");
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handlePresetClick = (preset: string) => {
    setDiaryName(preset);
    onUpdate?.(preset, selectedEmoji);
  };

  const handleNameChange = (value: string) => {
    setDiaryName(value);
    onUpdate?.(value, selectedEmoji);
  };

  const handleEmojiChange = (emoji: string) => {
    setSelectedEmoji(emoji);
    onUpdate?.(diaryName, emoji);
  };

  const handleNext = () => {
    if (diaryName.trim()) {
      onNext(diaryName.trim(), selectedEmoji);
    }
  };

  return (
    <motion.div 
      className="absolute gap-6 grid grid-cols-[repeat(1,_minmax(0px,_1fr))] h-auto leading-[0] translate-x-[-50%] w-[335px] max-w-[calc(100%-32px)] px-4" 
      data-name="PersonalizationForm" 
      style={{ 
        left: "50%",
        top: "min(180px, calc(50vh - 150px))"
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.7 }}
    >
      {/* Title */}
      <motion.div 
        className="font-['Poppins:Medium',_'Noto_Sans:Regular',_sans-serif] relative shrink-0 text-[#756ef3] text-[14px]" 
        style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}
        key={currentTranslations.subtitle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <p className="!leading-[18px] !font-[Days_One] !font-bold !text-[12px]">{currentTranslations.subtitle}</p>
      </motion.div>

      {/* Main Title */}
      <motion.div 
        className="font-['Poppins:Regular',_'Noto_Sans:Regular',_sans-serif] relative self-start shrink-0 text-[#002055] text-[28px] tracking-[-1px] w-full" 
        style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}
        key={currentTranslations.title}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="!leading-[33px] !text-[24px] !font-semibold !font-[Days_One]">{currentTranslations.title}</p>
      </motion.div>

      {/* Emoji Selection */}
      <motion.div
        className="flex gap-3 justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        {emojiOptions.map((emoji, index) => (
          <motion.button
            key={emoji}
            onClick={() => handleEmojiChange(emoji)}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 transition-all duration-300 ${
              selectedEmoji === emoji 
                ? 'border-[#756ef3] bg-[#756ef3]/10 scale-110' 
                : 'border-gray-200 hover:border-[#756ef3]/50'
            }`}
            whileHover={{ scale: selectedEmoji === emoji ? 1.1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
          >
            {emoji}
          </motion.button>
        ))}
      </motion.div>

      {/* Input Field */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <motion.input
          type="text"
          value={diaryName}
          onChange={(e) => handleNameChange(e.target.value)}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          placeholder={currentTranslations.placeholder}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#756ef3] focus:outline-none transition-all duration-300 text-center !text-[16px] !font-semibold"
          maxLength={30}
          animate={{
            scale: isInputFocused ? 1.02 : 1,
            boxShadow: isInputFocused 
              ? "0 4px 20px rgba(117, 110, 243, 0.2)" 
              : "0 2px 8px rgba(0, 0, 0, 0.1)"
          }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Character count indicator */}
        <motion.div
          className="absolute -bottom-6 right-2 text-xs text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: diaryName.length > 20 ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {diaryName.length}/30
        </motion.div>
      </motion.div>

      {/* Presets */}
      <motion.div
        className="flex flex-col gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <motion.p 
          className="text-center text-gray-500 !text-[12px] mb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.3 }}
        >
          Или выберите готовый вариант:
        </motion.p>
        
        {currentTranslations.presets.map((preset: string, index: number) => (
          <motion.button
            key={preset}
            onClick={() => handlePresetClick(preset)}
            className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 text-center !text-[14px] !font-semibold ${
              diaryName === preset 
                ? 'border-[#756ef3] bg-[#756ef3]/10 text-[#756ef3]' 
                : 'border-gray-200 hover:border-[#756ef3] hover:bg-[#756ef3]/5'
            }`}
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 4px 12px rgba(117, 110, 243, 0.15)"
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 + index * 0.1, duration: 0.2 }}
            >
              {preset}
            </motion.span>
          </motion.button>
        ))}
      </motion.div>

      {/* Form validation indicator */}
      <motion.div
        className="flex items-center justify-center gap-2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: diaryName.trim() ? 1 : 0,
          scale: diaryName.trim() ? 1 : 0.8 
        }}
        transition={{ duration: 0.3, type: "spring" }}
      >
        <motion.div
          className="w-3 h-3 rounded-full bg-green-500"
          animate={{ 
            scale: diaryName.trim() ? [1, 1.2, 1] : 0,
            opacity: diaryName.trim() ? 1 : 0
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
        <motion.span
          className="text-green-600 !text-[12px] !font-semibold"
          initial={{ opacity: 0, x: -10 }}
          animate={{ 
            opacity: diaryName.trim() ? 1 : 0,
            x: diaryName.trim() ? 0 : -10
          }}
          transition={{ duration: 0.3 }}
        >
          Готово! Нажмите стрелку →
        </motion.span>
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
        bottom: "min(40px, 8vh)",
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

function ArrowRight1({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`absolute size-6 bg-transparent border-0 cursor-pointer z-10 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      data-name="Arrow - Right"
      style={{
        bottom: "min(69px, 15vh)",
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

function NextButton({ onNext, disabled }: { onNext: () => void; disabled: boolean }) {
  return (
    <motion.div 
      className="absolute contents" 
      style={{
        bottom: "max(-2px, calc(0px - 2vh))",
        right: "max(-1px, calc(0px - 1vw))"
      }}
      data-name="Next Button"
      initial={{ opacity: 0, scale: 0.8, x: 50 }}
      animate={{ 
        opacity: disabled ? 0.5 : 1, 
        scale: 1,
        x: 0
      }}
      transition={{ delay: 0.6, duration: 0.6, type: "spring" }}
      whileHover={{ 
        scale: disabled ? 1 : 1.05,
        rotate: disabled ? 0 : 0
      }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      <button
        onClick={onNext}
        disabled={disabled}
        className={`absolute h-[191px] w-[129px] max-w-[30vw] bg-transparent border-0 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        style={{
          bottom: "max(-2px, calc(0px - 2vh))",
          right: "max(-1px, calc(0px - 1vw))"
        }}
      >
        <div className="absolute bottom-0 left-[7.57%] right-0 top-0 pointer-events-none">
          <img className="block max-w-none size-full" src={imgRectangle5904} />
        </div>
      </button>
      <ArrowRight1 onClick={onNext} disabled={disabled} />
    </motion.div>
  );
}

function SkipButton({ onSkip, currentTranslations }: { onSkip: () => void; currentTranslations: any }) {
  return (
    <motion.div 
      className="absolute flex flex-col font-['Poppins:Regular',_sans-serif] justify-center leading-[0] not-italic text-[#002055] text-[14px] text-center translate-x-[-50%] translate-y-[-50%]" 
      style={{ 
        top: "min(calc(50% + 334.5px), calc(100vh - 40px))",
        left: "min(58.01px, 15vw)"
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      <button 
        onClick={onSkip}
        className="bg-transparent border-0 cursor-pointer p-2"
      >
        <motion.p 
          className="leading-[14px] whitespace-nowrap"
          key={currentTranslations.skip}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {currentTranslations.skip}
        </motion.p>
      </button>
    </motion.div>
  );
}

function Frame2087324619({ selectedLanguage, onNext, onSkip, currentStep, totalSteps, onStepClick }: OnboardingScreen3Props) {
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
      />
      <SkipButton onSkip={onSkip} currentTranslations={currentTranslations} />
    </motion.div>
  );
}

export function OnboardingScreen3({ selectedLanguage, onNext, onSkip, currentStep, totalSteps, onStepClick }: OnboardingScreen3Props) {
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
        onSkip={onSkip}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onStepClick={onStepClick}
      />
    </motion.div>
  );
}