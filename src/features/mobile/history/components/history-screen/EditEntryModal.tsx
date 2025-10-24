import { motion, AnimatePresence } from "motion/react";
import { X, Save } from "lucide-react";
import { useTranslation } from "@/shared/lib/i18n";
import { CATEGORIES } from "./constants";

interface EditEntryModalProps {
  isOpen: boolean;
  editText: string;
  editCategory: string;
  isSaving: boolean;
  onClose: () => void;
  onTextChange: (text: string) => void;
  onCategoryChange: (category: string) => void;
  onSave: () => void;
}

/**
 * Edit Entry Modal Component
 * Modal for editing diary entry
 */
export function EditEntryModal({
  isOpen,
  editText,
  editCategory,
  isSaving,
  onClose,
  onTextChange,
  onCategoryChange,
  onSave
}: EditEntryModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isSaving ? onClose : undefined}
          className="fixed inset-0 bg-black/40 z-modal-backdrop backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="modal-bottom-sheet z-modal bg-card p-modal max-w-md mx-auto overflow-y-auto border-t border-border transition-colors duration-300 max-h-[85vh]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="!text-[18px] !font-semibold text-foreground">Редактировать запись</h3>
            <button
              onClick={() => !isSaving && onClose()}
              disabled={isSaving}
              className="p-1 hover:bg-accent/10 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5 text-foreground" strokeWidth={2} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Text Input */}
            <div>
              <label className="block !text-[13px] !font-medium text-muted-foreground mb-2">
                {t('entry_text', 'Текст записи')}
              </label>
              <textarea
                value={editText}
                onChange={(e) => onTextChange(e.target.value)}
                disabled={isSaving}
                rows={6}
                className="w-full px-4 py-3 bg-muted border border-border rounded-[12px] !text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:border-accent transition-colors resize-none disabled:opacity-50"
                placeholder={t('describe_achievement', 'Опишите ваше достижение...')}
              />
            </div>

            {/* Category Select */}
            <div>
              <label className="block !text-[13px] !font-medium text-muted-foreground mb-2">
                Категория
              </label>
              <select
                value={editCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                disabled={isSaving}
                className="w-full px-4 py-3 bg-muted border border-border rounded-[12px] !text-[15px] text-foreground outline-none focus:border-accent transition-colors disabled:opacity-50"
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => !isSaving && onClose()}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-muted text-foreground rounded-[12px] !text-[15px] !font-medium hover:bg-muted/80 transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={onSave}
                disabled={isSaving || !editText.trim()}
                className="flex-1 px-4 py-3 bg-accent text-white rounded-[12px] !text-[15px] !font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  "Сохранение..."
                ) : (
                  <>
                    <Save className="h-4 w-4" strokeWidth={2} />
                    Сохранить
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}

