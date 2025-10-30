/**
 * SettingsScreen - Support Modal Component
 */

import { X } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';

type SupportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  t: any;
};

export function SupportModal({ isOpen, onClose, userEmail, t }: SupportModalProps) {
  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    toast.success('Сообщение отправлено! Мы ответим в течение 24 часов.');
    onClose();
  };

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
          <h3 className="text-foreground text-title-3">
            {t.contactSupport || 'Связаться с поддержкой'}
          </h3>
          <button
            className="rounded-full p-1 transition-colors hover:bg-accent/10"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        <p className="mb-4 text-footnote text-muted-foreground">
          Напишите нам, и мы ответим в течение 24 часов
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block font-medium text-footnote text-foreground">Email</label>
            <Input className="bg-muted" disabled type="email" value={userEmail || ''} />
          </div>
          <div>
            <label className="mb-1 block font-medium text-footnote text-foreground">
              Тема обращения
            </label>
            <Input placeholder="Например: Проблема с AI-анализом" type="text" />
          </div>
          <div>
            <label className="mb-1 block font-medium text-footnote text-foreground">
              Сообщение
            </label>
            <Textarea placeholder="Опишите вашу проблему или вопрос..." rows={6} />
          </div>
          <Button className="w-full" onClick={handleSubmit}>
            Отправить
          </Button>
        </div>
      </motion.div>
    </>
  );
}
