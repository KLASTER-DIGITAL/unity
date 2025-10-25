import React, { useState, useEffect } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/shared/components/ui/button';
import { useTranslation } from './useTranslation';
import { LanguageConfig } from './types';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'modal' | 'inline';
  showFlag?: boolean;
  showNativeName?: boolean;
  className?: string;
  onLanguageChange?: (language: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'dropdown',
  showFlag = true,
  showNativeName = true,
  className = '',
  onLanguageChange
}) => {
  const { currentLanguage, changeLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [languages, setLanguages] = useState<LanguageConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Загрузка доступных языков
  useEffect(() => {
    const loadLanguages = async () => {
      setIsLoading(true);
      try {
        // Временный список языков, пока не реализован API
        const fallbackLanguages: LanguageConfig[] = [
          { code: 'ru', name: 'Russian', native_name: 'Русский', flag: '🇷🇺', is_active: true },
          { code: 'en', name: 'English', native_name: 'English', flag: '🇺🇸', is_active: true },
          { code: 'es', name: 'Spanish', native_name: 'Español', flag: '🇪🇸', is_active: true },
          { code: 'de', name: 'German', native_name: 'Deutsch', flag: '🇩🇪', is_active: false },
          { code: 'fr', name: 'French', native_name: 'Français', flag: '🇫🇷', is_active: false },
          { code: 'zh', name: 'Chinese', native_name: '中文', flag: '🇨🇳', is_active: false },
          { code: 'ja', name: 'Japanese', native_name: '日本語', flag: '🇯🇵', is_active: false },
        ];
        
        setLanguages(fallbackLanguages);
      } catch (error) {
        console.error('Failed to load languages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguages();
  }, []);

  const currentLang = languages.find(lang => lang.code === currentLanguage);
  
  const handleLanguageSelect = async (languageCode: string) => {
    setIsOpen(false);
    await changeLanguage(languageCode as any);
    onLanguageChange?.(languageCode);
  };

  const renderLanguageOption = (language: LanguageConfig, isSelected: boolean) => (
    <motion.button
      key={language.code}
      onClick={() => handleLanguageSelect(language.code)}
      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
        isSelected 
          ? 'bg-primary/10 text-primary' 
          : 'hover:bg-gray-100 text-gray-700'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        {showFlag && (
          <span className="text-2xl">{language.flag}</span>
        )}
        <div className="text-left">
          <div className="font-medium">{language.name}</div>
          {showNativeName && (
            <div className="text-sm text-gray-500">{language.native_name}</div>
          )}
        </div>
      </div>
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.2 }}
        >
          <Check size={20} className="text-primary" />
        </motion.div>
      )}
    </motion.button>
  );

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {languages.map(language => (
          <Button
            key={language.code}
            variant={currentLanguage === language.code ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleLanguageSelect(language.code)}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {showFlag && <span>{language.flag}</span>}
            {showNativeName ? language.native_name : language.name}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 min-w-[140px]"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {showFlag && currentLang && (
              <span className="text-lg">{currentLang.flag}</span>
            )}
            <Globe size={16} />
            <span>
              {showNativeName && currentLang 
                ? currentLang.native_name 
                : currentLang?.name || currentLanguage
              }
            </span>
            <ChevronDown 
              size={16} 
              className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {variant === 'modal' ? (
              // Модальная версия
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-hidden"
                >
                  <h3 className="text-lg font-semibold mb-4">{t('select_language', 'Select Language')}</h3>
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {languages.map(language => 
                      renderLanguageOption(language, language.code === currentLanguage)
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="w-full mt-4"
                  >
                    {t('cancel_button' as any, 'Cancel')}
                  </Button>
                </motion.div>
              </div>
            ) : (
              // Выпадающая версия
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
              >
                {languages.map(language => 
                  renderLanguageOption(language, language.code === currentLanguage)
                )}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};