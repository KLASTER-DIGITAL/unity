/**
 * SettingsScreen - FAQ Modal Component
 */

import { motion } from "motion/react";
import { X } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/components/ui/accordion";

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: any;
}

export function FAQModal({ isOpen, onClose, t }: FAQModalProps) {
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
          <h3 className="text-title-3 text-foreground">{t.faq || "FAQ"}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <p className="text-footnote text-muted-foreground mb-4">Часто задаваемые вопросы</p>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Как создать запись в дневнике?</AccordionTrigger>
            <AccordionContent>
              Нажмите кнопку "+" на главном экране, опишите ваше достижение или неудачу, и AI автоматически проанализирует запись.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Как работает AI-анализ?</AccordionTrigger>
            <AccordionContent>
              AI анализирует вашу запись, определяет тип события (достижение/неудача), эмоциональный тон и создает мотивационную карточку с советами.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Что такое мотивационные карточки?</AccordionTrigger>
            <AccordionContent>
              Это персонализированные сообщения от AI, которые помогают вам развивать полезные привычки на основе ваших записей.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>Как получить премиум-доступ?</AccordionTrigger>
            <AccordionContent>
              Премиум-функции включают дополнительные темы, автоматическое резервирование и расширенную аналитику. Свяжитесь с поддержкой для подключения.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>Как экспортировать данные?</AccordionTrigger>
            <AccordionContent>
              Перейдите в Настройки → Дополнительно → Экспортировать данные. Доступны форматы JSON, CSV и ZIP.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </motion.div>
    </>
  );
}

