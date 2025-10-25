import { useState } from "react";
import { motion } from "motion/react";
import { emojiOptions } from "./constants";
import type { PersonalizationFormProps } from "./types";

/**
 * Personalization Form Component
 * Allows user to name their diary and select an emoji
 */
export function PersonalizationForm({ currentTranslations, onNext, onUpdate }: PersonalizationFormProps) {
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
        <p className="!leading-[18px] font-![Days_One] font-bold! text-[12px]!">{currentTranslations.subtitle}</p>
      </motion.div>

      {/* Main Title */}
      <motion.div
        className="font-['Poppins:Regular',_'Noto_Sans:Regular',_sans-serif] relative self-start shrink-0 text-[#002055] dark:text-[#1a1a1a] text-[28px] tracking-[-1px] w-full"
        style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}
        key={currentTranslations.title}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="!leading-[33px] text-[24px]! font-semibold! font-![Days_One]">{currentTranslations.title}</p>
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
                : 'border-border hover:border-[#756ef3]/50'
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
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#756ef3] focus:outline-none transition-all duration-300 text-center text-[16px]! font-semibold! bg-white text-gray-900"
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
          className="absolute -bottom-6 right-2 text-xs text-[#8d8d8d]"
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
          className="text-center text-[#8d8d8d] text-[12px]! mb-1"
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
            className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 text-center text-[14px]! font-semibold! ${
              diaryName === preset
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-primary hover:bg-primary/5'
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
          className="text-green-600 text-[12px]! font-semibold!"
          initial={{ opacity: 0, x: -10 }}
          animate={{
            opacity: diaryName.trim() ? 1 : 0,
            x: diaryName.trim() ? 0 : -10
          }}
          transition={{ duration: 0.3 }}
        >
          {currentTranslations.readyMessage}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

