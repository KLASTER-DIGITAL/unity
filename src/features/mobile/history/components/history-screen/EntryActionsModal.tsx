import { motion, AnimatePresence } from "motion/react";
import { X, Edit, Trash2 } from "lucide-react";
import type { DiaryEntry } from "@/shared/lib/api";

interface EntryActionsModalProps {
  entry: DiaryEntry | null;
  onClose: () => void;
  onEdit: (entry: DiaryEntry) => void;
  onDelete: (entryId: string) => void;
}

/**
 * Entry Actions Modal Component
 * Modal for entry actions (edit, delete)
 */
export function EntryActionsModal({
  entry,
  onClose,
  onEdit,
  onDelete
}: EntryActionsModalProps) {
  if (!entry) return null;

  return (
    <AnimatePresence>
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
          className="modal-bottom-sheet z-modal bg-card p-modal max-w-md mx-auto overflow-y-auto border-t border-border transition-colors duration-300 max-h-[85vh]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px]! font-semibold! text-foreground">Действия</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-accent/10 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-foreground" strokeWidth={2} />
            </button>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onEdit(entry)}
              className="w-full flex items-center gap-3 p-3 text-foreground hover:bg-accent/10 rounded-[12px] transition-colors"
            >
              <Edit className="h-5 w-5" strokeWidth={2} />
              <span className="text-[15px]! font-medium!">Редактировать</span>
            </button>

            <button
              onClick={() => onDelete(entry.id)}
              className="w-full flex items-center gap-3 p-3 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-[12px] transition-colors"
            >
              <Trash2 className="h-5 w-5" strokeWidth={2} />
              <span className="text-[15px]! font-medium!">Удалить запись</span>
            </button>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}

