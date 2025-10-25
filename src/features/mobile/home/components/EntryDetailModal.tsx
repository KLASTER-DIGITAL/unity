import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { type DiaryEntry } from "@/shared/lib/api";
import { MediaPreview } from "@/features/mobile/media";

interface EntryDetailModalProps {
  entry: DiaryEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EntryDetailModal({ entry, isOpen, onClose }: EntryDetailModalProps) {
  if (!entry) return null;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSentimentColor = (sentiment: string): string => {
    switch (sentiment) {
      case 'positive': return 'bg-[var(--ios-green)]/10 text-[var(--ios-green)]';
      case 'neutral': return 'bg-[var(--ios-blue)]/10 text-[var(--ios-blue)]';
      case 'negative': return 'bg-[var(--ios-red)]/10 text-[var(--ios-red)]';
      default: return 'bg-muted text-foreground';
    }
  };

  const getSentimentLabel = (sentiment: string): string => {
    switch (sentiment) {
      case 'positive': return '😊 Позитив';
      case 'neutral': return '😐 Нейтрал';
      case 'negative': return '😔 Грусть';
      default: return 'Неизвестно';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-modal-backdrop backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            data-testid="entry-details"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="modal-bottom-sheet z-modal bg-card max-w-md mx-auto overflow-y-auto border-t border-border transition-colors duration-300 max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px]! font-semibold! text-foreground">Запись</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-accent/10 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-foreground" strokeWidth={2} />
              </button>
            </div>

            {/* Date */}
            <div className="mb-4">
              <p className="text-[13px]! text-muted-foreground">
                {formatDate(entry.createdAt)}
              </p>
            </div>

            {/* Category & Sentiment */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-[12px]! font-medium! ${getSentimentColor(entry.sentiment)}`}>
                {getSentimentLabel(entry.sentiment)}
              </span>
              {entry.category && (
                <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-[12px]!">
                  {entry.category}
                </span>
              )}
            </div>

            {/* Media Preview */}
            {entry.media && entry.media.length > 0 && (
              <div className="mb-4">
                <MediaPreview media={entry.media} />
              </div>
            )}

            {/* Title */}
            {entry.text && (
              <h3 className="text-[18px]! font-semibold! text-foreground mb-3">
                {entry.text.split('\n')[0]}
              </h3>
            )}

            {/* Full Text */}
            <div className="mb-6">
              <p className="text-[15px]! text-foreground leading-[22px] whitespace-pre-wrap">
                {entry.text}
              </p>
            </div>

            {/* Tags */}
            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {entry.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-muted text-muted-foreground rounded-[6px] text-[11px]! font-medium! border border-muted-foreground/30 dark:border-muted-foreground/50">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

