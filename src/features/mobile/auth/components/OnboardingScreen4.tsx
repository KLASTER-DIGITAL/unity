import { useState } from "react";
import { motion } from "motion/react";
import { TimePickerModal } from "@/components/TimePickerModal";

// Import modular components and types
import {
  ChatGPTInput,
  NotificationSettings,
  PermissionModal,
  SuccessModal,
  Sliedbar,
  NextButton,
  BackgroundElements,
  onboarding4Translations as translations,
  type OnboardingScreen4Props,
  type NotificationSettingsType
} from "./onboarding4";

// Re-export types for backward compatibility
export type { OnboardingScreen4Props, NotificationSettingsType };

// NOTE: Translations moved to ./onboarding4/translations.ts
// NOTE: ChatGPTInput component moved to ./onboarding4/ChatGPTInput.tsx

// Components in the style of OnboardingScreen3

function HabitsAndEntryForm({
  currentTranslations,
  onNext,
  onUpdate
}: {
  currentTranslations: any;
  onNext: (entry: string, settings: NotificationSettingsType) => void;
  onUpdate?: (entry: string, settings: NotificationSettingsType) => void;
}) {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsType>({
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
      const newSettings: NotificationSettingsType = {
        ...notificationSettings,
        selectedTime: 'none' as const
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
        <p className="!leading-[28px] text-[20px]! font-semibold! font-![Days_One]">{currentTranslations.title}</p>
      </motion.div>

      <NotificationSettings
        selectedTime={notificationSettings.selectedTime}
        morningTime={notificationSettings.morningTime}
        eveningTime={notificationSettings.eveningTime}
        reminderTitle={currentTranslations.reminderTitle}
        morningLabel={currentTranslations.morning}
        eveningLabel={currentTranslations.evening}
        bothLabel={currentTranslations.both}
        onSelect={handleNotificationSelect}
        onTimeClick={handleTimeClick}
      />

      {/* First Entry Section */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div>
          <h3 className="!text-[#756ef3] text-[14px]! font-semibold! mb-1">{currentTranslations.firstEntryTitle}</h3>
          <p className="!text-[#002055] dark:!text-[#1a1a1a] !text-opacity-70 text-[12px]!">{currentTranslations.firstEntrySubtitle}</p>
        </div>

        <ChatGPTInput
          value={firstEntry}
          onChange={handleEntryChange}
          onSubmit={handleNext}
          placeholder={currentTranslations.placeholder}
        />
      </motion.div>



      <PermissionModal
        isOpen={showPermissionRequest}
        title={currentTranslations.permissionRequest}
        laterLabel={currentTranslations.later}
        allowLabel={currentTranslations.allow}
        onAllow={() => handlePermissionRequest(true)}
        onLater={() => handlePermissionRequest(false)}
      />

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

// NOTE: Sliedbar, NextButton components moved to ./onboarding4/

function Frame2087324620({ selectedLanguage, onNext, currentStep, totalSteps, onStepClick }: OnboardingScreen4Props) {
  const currentTranslations = translations[selectedLanguage as keyof typeof translations] || translations.ru;
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [formData, setFormData] = useState<{ entry: string; settings: NotificationSettingsType }>({
    entry: "",
    settings: {
      selectedTime: 'none',
      morningTime: '08:00',
      eveningTime: '21:00',
      permissionGranted: false
    }
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFormNext = async (entry: string, settings: NotificationSettingsType) => {
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

  const handleFormUpdate = (entry: string, settings: NotificationSettingsType) => {
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

      <SuccessModal isOpen={showSuccess} message={currentTranslations.successMessage} />
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
      <BackgroundElements />

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
export default OnboardingScreen4;
