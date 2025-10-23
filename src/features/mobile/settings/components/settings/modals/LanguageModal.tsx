/**
 * SettingsScreen - Language Selection Modal Component
 */

import { motion } from "motion/react";
import { X } from "lucide-react";

interface Language {
  code: string;
  name: string;
  native_name: string;
  flag: string;
}

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  languages: Language[];
  currentLanguage?: string;
  onLanguageChange: (code: string) => void;
  t: any;
}

export function LanguageModal({ 
  isOpen, 
  onClose, 
  languages, 
  currentLanguage, 
  onLanguageChange,
  t 
}: LanguageModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-modal-backdrop backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="modal-bottom-sheet z-modal bg-card p-modal max-w-md mx-auto overflow-y-auto border-t border-border transition-colors duration-300"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-title-3 text-foreground">{t.language || "Выбрать язык"}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <p className="text-footnote text-muted-foreground mb-4">Выберите язык интерфейса приложения</p>

        <div className="space-y-2">
          {languages.map(language => (
            <button
              key={language.code}
              onClick={() => onLanguageChange(language.code)}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                currentLanguage === language.code
                  ? 'bg-primary/10 border-2 border-primary'
                  : 'bg-card border border-border hover:bg-accent/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{language.flag}</span>
                <div className="text-left">
                  <p className="font-medium text-foreground">{language.native_name}</p>
                  <p className="text-sm text-muted-foreground">{language.name}</p>
                </div>
              </div>
              {currentLanguage === language.code && (
                <div className="p-1.5 bg-primary rounded-full">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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

