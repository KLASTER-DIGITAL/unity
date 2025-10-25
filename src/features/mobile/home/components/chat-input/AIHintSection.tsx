import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X } from "lucide-react";

interface AIHintSectionProps {
  showHint: boolean;
  messagesCount: number;
  onClose: () => void;
}

/**
 * AI Hint Section Component
 * Displays AI suggestions with glassmorphism design
 */
export function AIHintSection({ showHint, messagesCount, onClose }: AIHintSectionProps) {
  return (
    <AnimatePresence>
      {messagesCount === 0 && showHint && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <div className="backdrop-blur-md bg-white/10 dark:bg-black/10 rounded-[16px] p-card border border-white/20 relative">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-card/50 hover:bg-card transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            <div className="flex items-start gap-responsive-sm pr-8">
              <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[13px]! font-semibold! text-foreground mb-1">
                  AI подскажет
                </h4>
                <p className="text-[11px]! font-normal! text-muted-foreground leading-[16px]">
                  Опиши своё достижение, и я помогу структурировать запись, выбрать категорию и отметить прогресс
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

