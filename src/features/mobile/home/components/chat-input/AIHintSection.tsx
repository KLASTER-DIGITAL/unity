// ✅ REACT NATIVE READY: Use Platform Adapter for animations

import { Sparkles, X } from 'lucide-react';
import { AnimatedPresence, motion } from '@/shared/lib/platform/animation';

type AIHintSectionProps = {
  showHint: boolean;
  messagesCount: number;
  onClose: () => void;
};

/**
 * AI Hint Section Component
 * Displays AI suggestions with glassmorphism design
 */
export function AIHintSection({ showHint, messagesCount, onClose }: AIHintSectionProps) {
  return (
    <AnimatedPresence>
      {messagesCount === 0 && showHint && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
          exit={{ opacity: 0, scale: 0.9 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative rounded-[16px] border border-border/20 bg-muted/10 p-card backdrop-blur-md transition-colors duration-300">
            {/* Close Button */}
            <button
              aria-label="Закрыть"
              className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-card/50 transition-colors duration-300 hover:bg-card"
              onClick={onClose}
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            <div className="flex items-start gap-responsive-sm pr-8">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <h4 className="mb-1 font-semibold! text-[13px]! text-foreground">AI подскажет</h4>
                <p className="font-normal! text-[11px]! text-muted-foreground leading-[16px]">
                  Опиши своё достижение, и я помогу структурировать запись, выбрать категорию и
                  отметить прогресс
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatedPresence>
  );
}
