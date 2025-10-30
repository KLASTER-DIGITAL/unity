/**
 * SettingsScreen - Language Selection Modal Component
 */

import { X } from 'lucide-react';
import { motion } from 'motion/react';

type Language = {
  code: string;
  name: string;
  native_name: string;
  flag: string;
};

type LanguageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  languages: Language[];
  currentLanguage?: string;
  onLanguageChange: (code: string) => void;
  t: any;
};

export function LanguageModal({
  isOpen,
  onClose,
  languages,
  currentLanguage,
  onLanguageChange,
  t,
}: LanguageModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <motion.div
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-modal-backdrop bg-black/40 backdrop-blur-sm"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="modal-bottom-sheet z-modal mx-auto max-w-md overflow-y-auto border-border border-t bg-card p-modal transition-colors duration-300"
        exit={{ opacity: 0, y: 100 }}
        initial={{ opacity: 0, y: 100 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-foreground text-title-3">{t.language || 'Выбрать язык'}</h3>
          <button
            className="rounded-full p-1 transition-colors hover:bg-accent/10"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        <p className="mb-4 text-footnote text-muted-foreground">
          Выберите язык интерфейса приложения
        </p>

        <div className="space-y-2">
          {languages.map((language) => (
            <button
              className={`flex w-full items-center justify-between rounded-xl p-4 transition-all ${
                currentLanguage === language.code
                  ? 'border-2 border-primary bg-primary/10'
                  : 'border border-border bg-card hover:bg-accent/5'
              }`}
              key={language.code}
              onClick={() => onLanguageChange(language.code)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{language.flag}</span>
                <div className="text-left">
                  <p className="font-medium text-foreground">{language.native_name}</p>
                  <p className="text-muted-foreground text-sm">{language.name}</p>
                </div>
              </div>
              {currentLanguage === language.code && (
                <div className="rounded-full bg-primary p-1.5">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </>
  );
}
