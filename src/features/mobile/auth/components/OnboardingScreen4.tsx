import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { imgMicrophone, imgImage, imgPaperPlaneRight } from "@/imports/svg-w5pu5";
import { imgArrowRight, imgRectangle5904 } from "@/imports/svg-6xkhk";
import { Switch } from "@/components/ui/switch";
import { Bell, CheckCircle2, Clock } from "lucide-react";
import { TimePickerModal } from "@/components/TimePickerModal";
import { Confetti } from "@/shared/components/Confetti";

// Import modular components and types
import { ChatGPTInput } from "./onboarding4/ChatGPTInput";
import { onboarding4Translations as translations } from "./onboarding4/translations";
import type { OnboardingScreen4Props, NotificationSettings } from "./onboarding4/types";

// Re-export types for backward compatibility
export type { OnboardingScreen4Props, NotificationSettings };

// NOTE: Translations moved to ./onboarding4/translations.ts
// NOTE: ChatGPTInput component moved to ./onboarding4/ChatGPTInput.tsx

// Components in the style of OnboardingScreen3

function HabitsAndEntryForm({ 
  currentTranslations, 
  onNext, 
  onUpdate 
}: { 
  currentTranslations: any; 
  onNext: (entry: string, settings: NotificationSettings) => void;
  onUpdate?: (entry: string, settings: NotificationSettings) => void;
}) {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    selectedTime: 'none',
    morningTime: '08:00',
    eveningTime: '21:00',
    permissionGranted: false
  });
  const [firstEntry, setFirstEntry] = useState("");
  const [showPermissionRequest, setShowPermissionRequest] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState<{
    show: boolean;
    type: 'morning' | 'evening';
    title: string;
  }>({
    show: false,
    type: 'morning',
    title: ''
  });

  const handleNotificationSelect = (type: 'none' | 'morning' | 'evening' | 'both') => {
    const newSettings = {
      ...notificationSettings,
      selectedTime: type
    };
    
    setNotificationSettings(newSettings);
    onUpdate?.(firstEntry, newSettings);
    
    if (type !== 'none' && !notificationSettings.permissionGranted) {
      setShowPermissionRequest(true);
    }
  };

  const handleTimeClick = (type: 'morning' | 'evening') => {
    setShowTimePicker({
      show: true,
      type,
      title: type === 'morning' ? 'Утреннее напоминание' : 'Вечернее напоминание'
    });
  };

  const handleTimeSelect = (time: string) => {
    const newSettings = {
      ...notificationSettings,
      [showTimePicker.type === 'morning' ? 'morningTime' : 'eveningTime']: time
    };
    
    setNotificationSettings(newSettings);
    onUpdate?.(firstEntry, newSettings);
  };

  const handlePermissionRequest = async (allow: boolean) => {
    setShowPermissionRequest(false);
    
    if (allow) {
      try {
        const permission = await Notification.requestPermission();
        const newSettings = {
          ...notificationSettings,
          permissionGranted: permission === 'granted'
        };
        setNotificationSettings(newSettings);
        onUpdate?.(firstEntry, newSettings);
      } catch (error) {
        console.log('Notification permission request failed:', error);
      }
    } else {
      const newSettings = {
        ...notificationSettings,
        selectedTime: 'none'
      };
      setNotificationSettings(newSettings);
      onUpdate?.(firstEntry, newSettings);
    }
  };

  const handleEntryChange = (value: string) => {
    setFirstEntry(value);
    onUpdate?.(value, notificationSettings);
  };

  const handleNext = () => {
    onNext(firstEntry.trim(), notificationSettings);
  };

  return (
    <motion.div 
      className="absolute gap-6 grid grid-cols-[repeat(1,_minmax(0px,_1fr))] h-auto leading-[0] translate-x-[-50%] w-[335px] max-w-[calc(100%-32px)] px-4" 
      data-name="HabitsAndEntryForm" 
      style={{ 
        left: "50%",
        top: "min(120px, calc(50vh - 200px))"
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.7 }}
    >
      {/* Subtitle */}
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
        className="font-['Poppins:Regular',_'Noto_Sans:Regular',_sans-serif] relative self-start shrink-0 text-[#002055] dark:text-[#1a1a1a] text-[28px] tracking-[-1px] w-full"
        style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}
        key={currentTranslations.title}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="!leading-[28px] !text-[20px] !font-semibold !font-[Days_One]">{currentTranslations.title}</p>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        className="bg-[#756ef3]/10 rounded-xl p-4 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-[#756ef3]" />
          <h3 className="!text-[#756ef3] !text-[14px] !font-semibold">{currentTranslations.reminderTitle}</h3>
        </div>

        <div className="space-y-2">
          {/* Morning Option */}
          <motion.button
            onClick={() => handleNotificationSelect('morning')}
            className={`flex items-center justify-between bg-card rounded-lg p-3 w-full transition-all duration-200 ${
              notificationSettings.selectedTime === 'morning' ? 'ring-2 ring-[#756ef3] bg-[#756ef3]/5' : 'hover:bg-muted'
            }`}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                notificationSettings.selectedTime === 'morning' ? 'border-[#756ef3] bg-[#756ef3]' : 'border-border'
              }`}>
                {notificationSettings.selectedTime === 'morning' && (
                  <div className="w-2 h-2 rounded-full bg-card" />
                )}
              </div>
              <span className="!text-[#002055] dark:!text-[#1a1a1a] !text-[13px] !font-medium">{currentTranslations.morning}</span>
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleTimeClick('morning');
              }}
              className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
            >
              <Clock className="w-3 h-3 text-[#756ef3]" />
              <span className="!text-[#756ef3] !text-[13px] !font-medium">({notificationSettings.morningTime})</span>
            </div>
          </motion.button>
          
          {/* Evening Option */}
          <motion.button
            onClick={() => handleNotificationSelect('evening')}
            className={`flex items-center justify-between bg-card rounded-lg p-3 w-full transition-all duration-200 ${
              notificationSettings.selectedTime === 'evening' ? 'ring-2 ring-[#756ef3] bg-[#756ef3]/5' : 'hover:bg-muted'
            }`}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                notificationSettings.selectedTime === 'evening' ? 'border-[#756ef3] bg-[#756ef3]' : 'border-border'
              }`}>
                {notificationSettings.selectedTime === 'evening' && (
                  <div className="w-2 h-2 rounded-full bg-card" />
                )}
              </div>
              <span className="!text-[#002055] dark:!text-[#1a1a1a] !text-[13px] !font-medium">{currentTranslations.evening}</span>
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleTimeClick('evening');
              }}
              className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
            >
              <Clock className="w-3 h-3 text-[#756ef3]" />
              <span className="!text-[#756ef3] !text-[13px] !font-medium">({notificationSettings.eveningTime})</span>
            </div>
          </motion.button>
          
          {/* Both Times Option */}
          <motion.button
            onClick={() => handleNotificationSelect('both')}
            className={`flex items-center justify-between bg-card rounded-lg p-3 w-full transition-all duration-200 ${
              notificationSettings.selectedTime === 'both' ? 'ring-2 ring-[#756ef3] bg-[#756ef3]/5' : 'hover:bg-muted'
            }`}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                notificationSettings.selectedTime === 'both' ? 'border-[#756ef3] bg-[#756ef3]' : 'border-border'
              }`}>
                {notificationSettings.selectedTime === 'both' && (
                  <div className="w-2 h-2 rounded-full bg-card" />
                )}
              </div>
              <span className="!text-[#002055] dark:!text-[#1a1a1a] !text-[13px] !font-medium">{currentTranslations.both}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-[#756ef3]" />
              <span className="!text-[#756ef3] !text-[13px] !font-medium">
                ({notificationSettings.morningTime} & {notificationSettings.eveningTime})
              </span>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* First Entry Section */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div>
          <h3 className="!text-[#756ef3] !text-[14px] !font-semibold mb-1">{currentTranslations.firstEntryTitle}</h3>
          <p className="!text-[#002055] dark:!text-[#1a1a1a] !text-opacity-70 !text-[12px]">{currentTranslations.firstEntrySubtitle}</p>
        </div>

        <ChatGPTInput
          value={firstEntry}
          onChange={handleEntryChange}
          onSubmit={handleNext}
          placeholder={currentTranslations.placeholder}
        />
      </motion.div>



      {/* Permission Request Modal */}
      {showPermissionRequest && (
        <motion.div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4 pb-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          onClick={() => handlePermissionRequest(false)}
        >
          <motion.div
            className="bg-card rounded-[var(--radius)] p-6 w-full max-w-[300px] shadow-lg border border-border transition-colors duration-300"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-3 mb-6">
              <Bell className="w-12 h-12 text-[#756ef3] mx-auto" />
              <h3 className="!text-[17px] !font-semibold !text-[#002055] dark:!text-[#1a1a1a]">{currentTranslations.permissionRequest}</h3>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => handlePermissionRequest(false)}
                className="flex-1 py-3 px-4 rounded-[var(--radius)] bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-200 active:scale-95"
              >
                {currentTranslations.later}
              </button>
              <button
                onClick={() => handlePermissionRequest(true)}
                className="flex-1 py-3 px-4 rounded-[var(--radius)] bg-[#756ef3] text-white hover:bg-[#6b62e8] transition-all duration-200 active:scale-95"
              >
                {currentTranslations.allow}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Time Picker Modal */}
      <TimePickerModal
        isOpen={showTimePicker.show}
        onClose={() => setShowTimePicker({ ...showTimePicker, show: false })}
        onTimeSelect={handleTimeSelect}
        initialTime={showTimePicker.type === 'morning' ? notificationSettings.morningTime : notificationSettings.eveningTime}
        title={showTimePicker.title}
      />
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
  const handleClick = () => {
    console.log('[NextButton] onClick called, disabled:', disabled);
    if (!disabled) {
      console.log('[NextButton] Calling onNext...');
      onNext();
      console.log('[NextButton] onNext called successfully');
    } else {
      console.log('[NextButton] Click ignored - button is disabled');
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      className={`absolute h-[191px] w-[129px] max-w-[30vw] bg-transparent ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      style={{
        bottom: "max(-2px, calc(0px - 2vh))",
        right: "max(-1px, calc(0px - 1vw))",
        zIndex: 50
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
        rotate: disabled ? 0 : 2
      }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      <div
        className="absolute h-full w-full"
      >
        <div className="absolute bottom-0 left-[7.57%] right-0 top-0 pointer-events-none">
          <img className="block max-w-none size-full" src={imgRectangle5904} />
        </div>
        
        {/* Arrow integrated inside */}
        <div
          className={`absolute size-6 z-10 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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
        </div>
      </div>
    </motion.div>
  );
}

function Frame2087324620({ selectedLanguage, onNext, currentStep, totalSteps, onStepClick }: OnboardingScreen4Props) {
  const currentTranslations = translations[selectedLanguage as keyof typeof translations] || translations.ru;
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [formData, setFormData] = useState<{ entry: string; settings: NotificationSettings }>({
    entry: "",
    settings: {
      selectedTime: 'none',
      morningTime: '08:00',
      eveningTime: '21:00',
      permissionGranted: false
    }
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFormNext = async (entry: string, settings: NotificationSettings) => {
    console.log('[OnboardingScreen4] handleFormNext called:', { entry, settings });
    setFormData({ entry, settings });
    setIsFormComplete(true);

    // Show success animation if there's an entry
    if (entry.trim()) {
      console.log('[OnboardingScreen4] Showing success animation...');
      setShowSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('[OnboardingScreen4] Success animation complete');
    }

    console.log('[OnboardingScreen4] Calling onNext...');
    onNext(entry, settings);
    console.log('[OnboardingScreen4] onNext called successfully');
  };

  const handleFormUpdate = (entry: string, settings: NotificationSettings) => {
    console.log('[OnboardingScreen4] handleFormUpdate called:', {
      entry: entry.substring(0, 50) + '...',
      entryLength: entry.length,
      settings
    });
    setFormData({ entry, settings });
    // Форма считается завершенной, если есть текст ИЛИ настроены уведомления
    const isComplete = entry.trim().length > 0 || settings.selectedTime !== 'none';
    console.log('[OnboardingScreen4] isFormComplete:', isComplete);
    setIsFormComplete(isComplete);
  };

  return (
    <motion.div 
      className="content-center flex flex-wrap gap-0 h-screen items-center justify-center relative shrink-0 w-full max-w-[444px] mx-auto overflow-hidden scrollbar-hide"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <HabitsAndEntryForm 
        currentTranslations={currentTranslations} 
        onNext={handleFormNext}
        onUpdate={handleFormUpdate}
      />
      <Sliedbar currentStep={currentStep} totalSteps={totalSteps} onStepClick={onStepClick} />
      <NextButton
        onNext={() => handleFormNext(formData.entry, formData.settings)}
        disabled={!isFormComplete}
      />

      {/* Success Modal */}
      {showSuccess && (
        <>
          <Confetti trigger={showSuccess} duration={2000} particleCount={80} />
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 pb-24 scrollbar-hide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-card rounded-xl p-6 space-y-4 w-[300px] mx-4 text-center border border-border transition-colors duration-300"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              >
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
              </motion.div>
              <p className="!text-[16px] !text-[#002055] dark:!text-[#1a1a1a]">{currentTranslations.successMessage}</p>
            </motion.div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

export function OnboardingScreen4({ selectedLanguage, onNext, currentStep, totalSteps, onStepClick }: OnboardingScreen4Props) {
  return (
    <motion.div
      className="bg-white content-stretch flex gap-2.5 items-center justify-center relative size-full h-screen overflow-hidden scrollbar-hide transition-colors duration-300"
      data-name="Onboard 4"
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

      <Frame2087324620
        selectedLanguage={selectedLanguage}
        onNext={onNext}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onStepClick={onStepClick}
      />
    </motion.div>
  );
}