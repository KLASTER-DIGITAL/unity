import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { ChevronDown, Check } from "lucide-react";
import { PriorityOptimizedImage } from "@/shared/components/OptimizedImage";
import { imgEllipse22, imgEllipse13, imgEllipse14, imgEllipse15, imgEllipse20, imgEllipse21, imgEllipse12, imgEllipse11, imgEllipse23, imgEllipse27, imgEllipse36, imgEllipse32, imgEllipse33, imgEllipse34, imgEllipse29, imgEllipse30, imgEllipse24, imgEllipse25, imgEllipse35 } from "@/imports/svg-lqmvp";
// Import hero image directly for Vite to process
import heroImageSrc from "@/assets/bd383d77e5f7766d755b15559de65d5ccfa62e27.webp";

// Новая i18n система
import { useTranslation } from "@/shared/lib/i18n";
import { LottiePreloader } from "@/shared/components/LottiePreloader";

interface WelcomeScreenProps {
  onNext: (language: string) => void;
  onSkip?: () => void;
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
}

interface Language {
  id?: string;
  code: string;
  name: string;
  native_name: string;
  flag: string;
  is_active?: boolean;
  enabled?: boolean; // Поддержка обоих полей (is_active и enabled)
}

// Fallback языки на случай, если API недоступен
const fallbackLanguages: Language[] = [
  { id: '1', code: "ru", name: "Russian", native_name: "Русский", flag: "🇷🇺", is_active: true },
  { id: '2', code: "en", name: "English", native_name: "English", flag: "🇬🇧", is_active: true },
  { id: '3', code: "es", name: "Spanish", native_name: "Español", flag: "🇪🇸", is_active: true },
  { id: '4', code: "de", name: "German", native_name: "Deutsch", flag: "🇩🇪", is_active: true },
  { id: '5', code: "fr", name: "French", native_name: "Français", flag: "🇫🇷", is_active: true },
  { id: '6', code: "zh", name: "Chinese", native_name: "中文", flag: "🇨🇳", is_active: true },
  { id: '7', code: "ja", name: "Japanese", native_name: "日本語", flag: "🇯🇵", is_active: true },
];

export function WelcomeScreen({ onNext, onSkip, currentStep: _currentStep, totalSteps: _totalSteps, onStepClick: _onStepClick }: WelcomeScreenProps) {
  const { t, changeLanguage, currentLanguage: i18nLanguage, isLoaded } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18nLanguage || "ru");
  const [showDropdown, setShowDropdown] = useState(false);
  const [languages, setLanguages] = useState<Language[]>(fallbackLanguages);
  const [_isLoadingLanguages, setIsLoadingLanguages] = useState(true);

  // Загрузка языков из API (публичный endpoint с ANON_KEY)
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translations-api/languages`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
          }
        });
        if (response.ok) {
          const data = await response.json();
          // translations-api возвращает массив напрямую
          const loadedLanguages = Array.isArray(data) ? data : (data.languages || fallbackLanguages);
          // Фильтруем только активные языки
          const activeLanguages = loadedLanguages.filter((lang: Language) => lang.is_active || lang.enabled);
          setLanguages(activeLanguages.length > 0 ? activeLanguages : fallbackLanguages);
          console.log('✅ Loaded languages from API:', activeLanguages.length);
        } else {
          console.error('Failed to load languages:', response.status);
          setLanguages(fallbackLanguages);
        }
      } catch (error) {
        console.error('Error loading languages:', error);
        setLanguages(fallbackLanguages);
      } finally {
        setIsLoadingLanguages(false);
      }
    };

    loadLanguages();
  }, []);

  const selectedLang = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  // Синхронизируем выбранный язык с i18n системой
  useEffect(() => {
    if (selectedLanguage !== i18nLanguage) {
      changeLanguage(selectedLanguage);
    }
  }, [selectedLanguage, i18nLanguage, changeLanguage]);

  // ✅ FIX: Показываем загрузку, пока переводы не загрузились
  if (!isLoaded) {
    return (
      <div className="bg-white w-full h-screen max-w-md mx-auto">
        <LottiePreloader
          showMessage={false}
          minDuration={5000}
          animationType="initial"
          size="sm"
        />
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white relative w-full h-screen flex flex-col overflow-hidden scrollbar-hide"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Top Section - Purple Background with Image + Language Selector */}
      <div className="relative shrink-0 overflow-hidden" style={{ height: 'min(50vh, 400px)' }}>
        {/* Generated Image Background - адаптивная с WebP оптимизацией */}
        <div className="absolute inset-0">
          <PriorityOptimizedImage
            src={heroImageSrc}
            alt="Welcome background"
            className="w-full h-full object-cover"
            priority={true}
          />
        </div>

        {/* Decorative ellipses - только для больших экранов */}
        <div className="absolute inset-0 hidden sm:block pointer-events-none">
          <div className="absolute left-[-150px] size-[282px] top-[-87px]">
            <div className="absolute inset-[-10.284%]">
              <img className="block max-w-none size-full" src={imgEllipse12} alt="" />
            </div>
          </div>
          <div className="absolute left-[94px] size-[340px] top-[-145px]">
            <div className="absolute inset-[-8.529%]">
              <img className="block max-w-none size-full" src={imgEllipse11} alt="" />
            </div>
          </div>
          
          <div className="absolute left-[201px] size-[46px] top-[35px]">
            <div className="absolute inset-[-43.478%]">
              <img className="block max-w-none size-full" src={imgEllipse23} alt="" />
            </div>
          </div>
          <div className="absolute left-[150px] size-[46px] top-[31px]">
            <div className="absolute inset-[-43.478%]">
              <img className="block max-w-none size-full" src={imgEllipse23} alt="" />
            </div>
          </div>
          <div className="absolute left-[98px] size-28 top-[-29px]">
            <div className="absolute inset-[-31.25%]">
              <img className="block max-w-none size-full" src={imgEllipse27} alt="" />
            </div>
          </div>
          <div className="absolute left-[81px] size-28 top-[-27px]">
            <div className="absolute inset-[-107.143%]">
              <img className="block max-w-none size-full" src={imgEllipse36} alt="" />
            </div>
          </div>
          <div className="absolute left-[215px] size-[78px] top-[25px]">
            <div className="absolute inset-[-153.846%]">
              <img className="block max-w-none size-full" src={imgEllipse32} alt="" />
            </div>
          </div>
          <div className="absolute left-[169px] size-[78px] top-[18px]">
            <div className="absolute inset-[-175.641%]">
              <img className="block max-w-none size-full" src={imgEllipse33} alt="" />
            </div>
          </div>
          <div className="absolute left-[290px] size-[78px] top-[19px]">
            <div className="absolute inset-[-25.641%]">
              <img className="block max-w-none size-full" src={imgEllipse34} alt="" />
            </div>
          </div>
          <div className="absolute left-[-63px] size-[183px] top-[-55px]">
            <div className="absolute inset-[-15.847%]">
              <img className="block max-w-none size-full" src={imgEllipse29} alt="" />
            </div>
          </div>
          <div className="absolute left-[-23px] size-[46px] top-[31px]">
            <div className="absolute inset-[-63.044%]">
              <img className="block max-w-none size-full" src={imgEllipse30} alt="" />
            </div>
          </div>
          <div className="absolute left-[267px] size-[46px] top-[35px]">
            <div className="absolute inset-[-43.478%]">
              <img className="block max-w-none size-full" src={imgEllipse24} alt="" />
            </div>
          </div>
          <div className="absolute left-[319px] size-[46px] top-[37px]">
            <div className="absolute inset-[-63.044%]">
              <img className="block max-w-none size-full" src={imgEllipse25} alt="" />
            </div>
          </div>
          <div className="absolute left-[74px] size-28 top-[-29px]">
            <div className="absolute inset-[-125%]">
              <img className="block max-w-none size-full" src={imgEllipse35} alt="" />
            </div>
          </div>
        </div>

        {/* Language Dropdown - над белым блоком */}
        <motion.div 
          className="relative z-20 flex justify-center pt-safe"
          style={{ paddingTop: 'max(env(safe-area-inset-top), 24px)' }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="relative mt-4">
            <Button
              onClick={() => setShowDropdown(!showDropdown)}
              className="bg-card box-border flex h-14 items-center justify-between min-w-[230px] pl-[22px] pr-[13px] py-0 rounded-[10px] text-muted-foreground border-0 shadow-lg hover:bg-accent/5"
              style={{
                fontFamily: "'Inter', var(--font-family-primary)",
                fontSize: '12px',
                fontWeight: '400'
              }}
            >
              <div className="flex items-center gap-2">
                <span>{selectedLang.flag}</span>
                <span>{selectedLang.native_name}</span>
              </div>
              <motion.div
                animate={{ rotate: showDropdown ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={18} className="text-[#6b6b6b]" />
              </motion.div>
            </Button>

          </div>
        </motion.div>
      </div>

      {/* Bottom Section - White Block with Content */}
      <div
        className="relative flex-1 bg-linear-to-b from-[#ffffff] to-[#f8f6ff] rounded-t-[30px] flex flex-col overflow-hidden"
        style={{
          marginTop: '-30px', // Перекрытие для плавного перехода
          zIndex: 10
        }}
      >
        {/* Decorative dots row - на границе белого блока */}
        <div className="absolute left-0 right-0 top-0 h-10 pointer-events-none hidden sm:block">
          <div className="absolute left-2.5 size-[46px] top-0">
            <div className="absolute inset-[-58.696%]">
              <img className="block max-w-none size-full" src={imgEllipse15} alt="" />
            </div>
          </div>
          <div className="absolute left-[62px] size-[46px] top-[2px]">
            <div className="absolute inset-[-58.696%]">
              <img className="block max-w-none size-full" src={imgEllipse15} alt="" />
            </div>
          </div>
          <div className="absolute left-[120px] size-[46px] top-[-4px]">
            <div className="absolute inset-[-58.696%]">
              <img className="block max-w-none size-full" src={imgEllipse15} alt="" />
            </div>
          </div>
          <div className="absolute left-[178px] size-[46px] top-[-8px]">
            <div className="absolute inset-[-58.696%]">
              <img className="block max-w-none size-full" src={imgEllipse15} alt="" />
            </div>
          </div>
          <div className="absolute left-[227px] size-[46px] top-0">
            <div className="absolute inset-[-58.696%]">
              <img className="block max-w-none size-full" src={imgEllipse15} alt="" />
            </div>
          </div>
          <div className="absolute left-[293px] size-[46px] top-0">
            <div className="absolute inset-[-58.696%]">
              <img className="block max-w-none size-full" src={imgEllipse20} alt="" />
            </div>
          </div>
          <div className="absolute left-[332px] size-[46px] top-[-4px]">
            <div className="absolute inset-[-58.696%]">
              <img className="block max-w-none size-full" src={imgEllipse15} alt="" />
            </div>
          </div>
          <div className="absolute left-[345px] size-[46px] top-[2px]">
            <div className="absolute inset-[-58.696%]">
              <img className="block max-w-none size-full" src={imgEllipse21} alt="" />
            </div>
          </div>
        </div>

        {/* More decorative ellipses in white section */}
        <div className="absolute inset-0 pointer-events-none hidden sm:block">
          <div className="absolute left-[99px] size-[97px] top-[20px]">
            <div className="absolute inset-[-27.835%]">
              <img className="block max-w-none size-full" src={imgEllipse22} alt="" />
            </div>
          </div>
          <div className="absolute left-[94px] size-[340px] top-0">
            <div className="absolute inset-[-18.235%]">
              <img className="block max-w-none size-full" src={imgEllipse13} alt="" />
            </div>
          </div>
          <div className="absolute left-[-144px] size-[340px] top-[10px]">
            <div className="absolute inset-[-18.235%]">
              <img className="block max-w-none size-full" src={imgEllipse14} alt="" />
            </div>
          </div>
        </div>

        {/* Content Container - ЦЕНТРИРОВАННЫЙ */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-4">
          {/* Logo */}
          <motion.div 
            className="text-center mb-4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
          >
            <h1 
              className="text-[#756ef3] mb-0"
              style={{
                fontFamily: "'Poller One', serif",
                fontSize: 'clamp(36px, 10vw, 46px)',
                lineHeight: '1.1'
              }}
            >
              UNITY
            </h1>
          </motion.div>

          {/* Title and Subtitle */}
          <motion.div 
            className="text-center max-w-[320px]"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.7 }}
            key={selectedLanguage}
          >
            <motion.h2
              className="text-[#2f394b] mb-2"
              style={{
                fontFamily: "'Open Sans', var(--font-family-primary)",
                fontWeight: '700',
                fontSize: 'clamp(28px, 8vw, 37px)',
                lineHeight: '1.2',
                letterSpacing: '-0.8px'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {t('welcomeTitle', 'Создавай дневник побед')}
            </motion.h2>

            <motion.p
              className="text-[#8d8d8d]"
              style={{
                fontFamily: "'Open Sans', var(--font-family-primary)",
                fontWeight: '700',
                fontSize: '14px',
                lineHeight: '1.7',
                opacity: '0.6'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {t('subtitle', 'История ваших побед — день за днём')}
            </motion.p>
          </motion.div>
        </div>

        {/* Buttons Section - ПОДНЯТО ВЫШЕ для предотвращения перекрытия */}
        <motion.div
          className="relative z-10 w-full px-6"
          style={{
            paddingBottom: 'max(env(safe-area-inset-bottom, 48px), 64px)',
          }}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <div className="max-w-xs mx-auto">
            {/* Skip Button - НАД кнопкой Начать */}
            {onSkip && (
              <motion.button
                onClick={onSkip}
                className="w-full mb-5 text-center py-3 text-[#8d8d8d] hover:text-[#756ef3] transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                style={{
                  fontFamily: "'Inter', var(--font-family-primary)",
                  fontWeight: '500',
                  fontSize: '15px'
                }}
              >
                {t('alreadyHaveAccount', 'У меня уже есть аккаунт')}
              </motion.button>
            )}
            
            {/* Button Container with Shadow */}
            <div className="relative">
              {/* Button Shadow - БЕЗ перекрытия Skip */}
              <div 
                className="absolute inset-0 rounded-[15px] opacity-60"
                style={{ 
                  background: 'linear-gradient(135.96deg, #8B78FF 0%, #5451D6 101.74%)',
                  filter: 'blur(16px)',
                  transform: 'translateY(4px)'
                }}
              />
              
              {/* Main Button */}
              <Button
                onClick={() => onNext(selectedLanguage)}
                className="relative w-full h-[60px] rounded-[15px] text-white border-0 shadow-none hover:scale-[1.02] transition-transform duration-200"
                style={{
                  background: 'linear-gradient(135.96deg, #8B78FF 0%, #5451D6 101.74%)',
                  fontFamily: "'Inter', var(--font-family-primary)",
                  fontWeight: '600',
                  fontSize: '20px',
                  lineHeight: '24px'
                }}
              >
                <motion.span
                  key={selectedLanguage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {t('startButton', 'Начать')}
                </motion.span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Language Selection Popup - полноэкранный попап с размытым фоном */}
      {showDropdown && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center px-4"
          style={{ zIndex: 999999 }}
          onClick={() => setShowDropdown(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, type: "spring", damping: 25 }}
            className="bg-card rounded-[20px] w-[280px] max-h-[65vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Language List */}
            <div className="overflow-y-auto max-h-[65vh]">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={async () => {
                    setSelectedLanguage(language.code as any);
                    setShowDropdown(false);
                    // ✅ FIX: Вызываем changeLanguage для переключения языка в i18n системе
                    await changeLanguage(language.code as any);
                  }}
                  className="w-full flex items-center justify-between pl-[22px] pr-[13px] h-14 text-left hover:bg-accent/5 active:bg-accent/10 transition-colors"
                  style={{
                    fontFamily: "'Inter', var(--font-family-primary)",
                    fontSize: '12px',
                    fontWeight: '400'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>{language.flag}</span>
                    <span className="text-[#6b6b6b]">{language.native_name}</span>
                  </div>
                  {selectedLanguage === language.code && (
                    <Check size={16} className="text-[#8B78FF]" strokeWidth={2} />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default WelcomeScreen;
