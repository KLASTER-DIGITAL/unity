/**
 * SettingsScreen - Support Modal Component
 */

import { motion } from "motion/react";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { toast } from "sonner";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  t: any;
}

export function SupportModal({ isOpen, onClose, userEmail, t }: SupportModalProps) {
  if (!isOpen) return null;

  const handleSubmit = () => {
    toast.success("Сообщение отправлено! Мы ответим в течение 24 часов.");
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
          <h3 className="text-title-3 text-foreground">{t.contactSupport || "Связаться с поддержкой"}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <p className="text-footnote text-muted-foreground mb-4">Напишите нам, и мы ответим в течение 24 часов</p>

        <div className="space-y-4">
          <div>
            <label className="text-footnote font-medium text-foreground mb-1 block">
              Email
            </label>
            <Input
              type="email"
              value={userEmail || ''}
              disabled
              className="bg-muted"
            />
          </div>
          <div>
            <label className="text-footnote font-medium text-foreground mb-1 block">
              Тема обращения
            </label>
            <Input
              type="text"
              placeholder="Например: Проблема с AI-анализом"
            />
          </div>
          <div>
            <label className="text-footnote font-medium text-foreground mb-1 block">
              Сообщение
            </label>
            <Textarea
              placeholder="Опишите вашу проблему или вопрос..."
              rows={6}
            />
          </div>
          <Button
            onClick={handleSubmit}
            className="w-full"
          >
            Отправить
          </Button>
        </div>
      </motion.div>
    </>
  );
}

