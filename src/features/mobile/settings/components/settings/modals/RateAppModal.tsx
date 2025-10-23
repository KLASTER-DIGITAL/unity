/**
 * SettingsScreen - Rate App Modal Component
 */

import { motion } from "motion/react";
import { X, Star } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { toast } from "sonner";

interface RateAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RateAppModal({ isOpen, onClose }: RateAppModalProps) {
  if (!isOpen) return null;

  const handleSubmit = () => {
    toast.success("Спасибо за вашу оценку! ⭐");
    onClose();
  };

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
          <h3 className="text-title-3 text-foreground">Оценить приложение</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <p className="text-footnote text-muted-foreground mb-6">Ваше мнение помогает нам стать лучше</p>

        <div className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-3">
            <label className="text-footnote font-medium text-foreground">Ваша оценка</label>
            <div className="flex gap-responsive-sm justify-center py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-transform hover:scale-110"
                >
                  <Star className="h-10 w-10 fill-yellow-400 text-yellow-400" />
                </button>
              ))}
            </div>
            <p className="text-center text-footnote text-muted-foreground">Отлично! 🎉</p>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-footnote font-medium text-foreground">Комментарий (необязательно)</label>
            <Textarea
              placeholder="Расскажите, что вам понравилось или что можно улучшить..."
              rows={4}
              className="resize-none"
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full"
          >
            Отправить отзыв
          </Button>
        </div>
      </motion.div>
    </>
  );
}

