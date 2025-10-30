import { motion } from 'motion/react';
import { useState } from 'react';
import { TimePickerModal } from '@/components/TimePickerModal';

// Import modular components and types
import {
  BackgroundElements,
  ChatGPTInput,
  NextButton,
  NotificationSettings,
  type NotificationSettingsType,
  type OnboardingScreen4Props,
  PermissionModal,
  Sliedbar,
  SuccessModal,
  onboarding4Translations as translations,
} from './onboarding4';

// Re-export types for backward compatibility
export type { OnboardingScreen4Props, NotificationSettingsType };

// NOTE: Translations moved to ./onboarding4/translations.ts
// NOTE: ChatGPTInput component moved to ./onboarding4/ChatGPTInput.tsx

// Components in the style of OnboardingScreen3

function HabitsAndEntryForm({
  currentTranslations,
  onNext,
  onUpdate,
}: {
  currentTranslations: any;
  onNext: (entry: string, settings: NotificationSettingsType) => void;
  onUpdate?: (entry: string, settings: NotificationSettingsType) => void;
}) {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsType>({
    selectedTime: 'none',
    morningTime: '08:00',
    eveningTime: '21:00',
    permissionGranted: false,
  });
  const [firstEntry, setFirstEntry] = useState('');
  const [showPermissionRequest, setShowPermissionRequest] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState<{
    show: boolean;
    type: 'morning' | 'evening';
    title: string;
  }>({
    show: false,
    type: 'morning',
    title: '',
  });

  const handleNotificationSelect = (type: 'none' | 'morning' | 'evening' | 'both') => {
    const newSettings = {
      ...notificationSettings,
      selectedTime: type,
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
      title: type === 'morning' ? 'Утреннее напоминание' : 'Вечернее напоминание',
    });
  };

  const handleTimeSelect = (time: string) => {
    const newSettings = {
      ...notificationSettings,
      [showTimePicker.type === 'morning' ? 'morningTime' : 'eveningTime']: time,
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
          permissionGranted: permission === 'granted',
        };
        setNotificationSettings(newSettings);
        onUpdate?.(firstEntry, newSettings);
      } catch (error) {
        console.log('Notification permission request failed:', error);
      }
    } else {
      const newSettings: NotificationSettingsType = {
        ...notificationSettings,
        selectedTime: 'none' as const,
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
      animate={{ opacity: 1, y: 0 }}
      className="absolute grid h-auto w-[335px] max-w-[calc(100%-32px)] translate-x-[-50%] grid-cols-[repeat(1,_minmax(0px,_1fr))] gap-6 px-4 leading-[0]"
      data-name="HabitsAndEntryForm"
      initial={{ opacity: 0, y: 30 }}
      style={{
        left: '50%',
        top: 'min(120px, calc(50vh - 200px))',
      }}
      transition={{ delay: 0.4, duration: 0.7 }}
    >
      {/* Subtitle */}
      <motion.div
        animate={{ opacity: 1 }}
        className="relative shrink-0 font-['Poppins:Medium',_'Noto_Sans:Regular',_sans-serif] text-[#756ef3] text-[14px]"
        initial={{ opacity: 0 }}
        key={currentTranslations.subtitle}
        style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <p className="!leading-[18px] font-![Days_One] font-bold! text-[12px]!">
          {currentTranslations.subtitle}
        </p>
      </motion.div>

      {/* Main Title */}
      <motion.div
        animate={{ opacity: 1 }}
        className="relative w-full shrink-0 self-start font-['Poppins:Regular',_'Noto_Sans:Regular',_sans-serif] text-[#002055] text-[28px] tracking-[-1px] dark:text-[#1a1a1a]"
        initial={{ opacity: 0 }}
        key={currentTranslations.title}
        style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}
        transition={{ duration: 0.3 }}
      >
        <p className="!leading-[28px] font-![Days_One] font-semibold! text-[20px]!">
          {currentTranslations.title}
        </p>
      </motion.div>

      <NotificationSettings
        bothLabel={currentTranslations.both}
        eveningLabel={currentTranslations.evening}
        eveningTime={notificationSettings.eveningTime}
        morningLabel={currentTranslations.morning}
        morningTime={notificationSettings.morningTime}
        onSelect={handleNotificationSelect}
        onTimeClick={handleTimeClick}
        reminderTitle={currentTranslations.reminderTitle}
        selectedTime={notificationSettings.selectedTime}
      />

      {/* First Entry Section */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div>
          <h3 className="!text-[#756ef3] mb-1 font-semibold! text-[14px]!">
            {currentTranslations.firstEntryTitle}
          </h3>
          <p className="!text-[#002055] dark:!text-[#1a1a1a] !text-opacity-70 text-[12px]!">
            {currentTranslations.firstEntrySubtitle}
          </p>
        </div>

        <ChatGPTInput
          onChange={handleEntryChange}
          onSubmit={handleNext}
          placeholder={currentTranslations.placeholder}
          value={firstEntry}
        />
      </motion.div>

      <PermissionModal
        allowLabel={currentTranslations.allow}
        isOpen={showPermissionRequest}
        laterLabel={currentTranslations.later}
        onAllow={() => handlePermissionRequest(true)}
        onLater={() => handlePermissionRequest(false)}
        title={currentTranslations.permissionRequest}
      />

      {/* Time Picker Modal */}
      <TimePickerModal
        initialTime={
          showTimePicker.type === 'morning'
            ? notificationSettings.morningTime
            : notificationSettings.eveningTime
        }
        isOpen={showTimePicker.show}
        onClose={() => setShowTimePicker({ ...showTimePicker, show: false })}
        onTimeSelect={handleTimeSelect}
        title={showTimePicker.title}
      />
    </motion.div>
  );
}

// NOTE: Sliedbar, NextButton components moved to ./onboarding4/

function Frame2087324620({
  selectedLanguage,
  onNext,
  currentStep,
  totalSteps,
  onStepClick,
}: OnboardingScreen4Props) {
  const currentTranslations =
    translations[selectedLanguage as keyof typeof translations] || translations.ru;
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [formData, setFormData] = useState<{ entry: string; settings: NotificationSettingsType }>({
    entry: '',
    settings: {
      selectedTime: 'none',
      morningTime: '08:00',
      eveningTime: '21:00',
      permissionGranted: false,
    },
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
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('[OnboardingScreen4] Success animation complete');
    }

    console.log('[OnboardingScreen4] Calling onNext...');
    onNext(entry, settings);
    console.log('[OnboardingScreen4] onNext called successfully');
  };

  const handleFormUpdate = (entry: string, settings: NotificationSettingsType) => {
    console.log('[OnboardingScreen4] handleFormUpdate called:', {
      entry: `${entry.substring(0, 50)}...`,
      entryLength: entry.length,
      settings,
    });
    setFormData({ entry, settings });
    // Форма считается завершенной, если есть текст ИЛИ настроены уведомления
    const isComplete = entry.trim().length > 0 || settings.selectedTime !== 'none';
    console.log('[OnboardingScreen4] isFormComplete:', isComplete);
    setIsFormComplete(isComplete);
  };

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="scrollbar-hide relative mx-auto flex h-screen w-full max-w-[444px] shrink-0 flex-wrap content-center items-center justify-center gap-0 overflow-hidden"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <HabitsAndEntryForm
        currentTranslations={currentTranslations}
        onNext={handleFormNext}
        onUpdate={handleFormUpdate}
      />
      <Sliedbar currentStep={currentStep} onStepClick={onStepClick} totalSteps={totalSteps} />
      <NextButton
        disabled={!isFormComplete}
        onNext={() => handleFormNext(formData.entry, formData.settings)}
      />

      <SuccessModal isOpen={showSuccess} message={currentTranslations.successMessage} />
    </motion.div>
  );
}

export function OnboardingScreen4({
  selectedLanguage,
  onNext,
  currentStep,
  totalSteps,
  onStepClick,
}: OnboardingScreen4Props) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="scrollbar-hide relative flex size-full h-screen content-stretch items-center justify-center gap-2.5 overflow-hidden bg-card transition-colors duration-300"
      data-name="Onboard 4"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <BackgroundElements />

      <Frame2087324620
        currentStep={currentStep}
        onNext={onNext}
        onStepClick={onStepClick}
        selectedLanguage={selectedLanguage}
        totalSteps={totalSteps}
      />
    </motion.div>
  );
}
export default OnboardingScreen4;
