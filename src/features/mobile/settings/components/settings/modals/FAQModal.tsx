/**
 * SettingsScreen - FAQ Modal Component
 */

import { X } from "lucide-react";
import { motion } from "motion/react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/shared/components/ui/accordion";

type FAQModalProps = {
	isOpen: boolean;
	onClose: () => void;
	t: any;
};

export function FAQModal({ isOpen, onClose, t }: FAQModalProps) {
	if (!isOpen) {
		return null;
	}

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
					<h3 className="text-foreground text-title-3">{t.faq || "FAQ"}</h3>
					<button
						className="rounded-full p-1 transition-colors hover:bg-accent/10"
						onClick={onClose}
					>
						<X className="h-5 w-5 text-foreground" />
					</button>
				</div>

				<p className="mb-4 text-footnote text-muted-foreground">
					Часто задаваемые вопросы
				</p>

				<Accordion className="w-full" collapsible type="single">
					<AccordionItem value="item-1">
						<AccordionTrigger>Как создать запись в дневнике?</AccordionTrigger>
						<AccordionContent>
							Нажмите кнопку "+" на главном экране, опишите ваше достижение или
							неудачу, и AI автоматически проанализирует запись.
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item-2">
						<AccordionTrigger>Как работает AI-анализ?</AccordionTrigger>
						<AccordionContent>
							AI анализирует вашу запись, определяет тип события
							(достижение/неудача), эмоциональный тон и создает мотивационную
							карточку с советами.
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item-3">
						<AccordionTrigger>
							Что такое мотивационные карточки?
						</AccordionTrigger>
						<AccordionContent>
							Это персонализированные сообщения от AI, которые помогают вам
							развивать полезные привычки на основе ваших записей.
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item-4">
						<AccordionTrigger>Как получить премиум-доступ?</AccordionTrigger>
						<AccordionContent>
							Премиум-функции включают дополнительные темы, автоматическое
							резервирование и расширенную аналитику. Свяжитесь с поддержкой для
							подключения.
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item-5">
						<AccordionTrigger>Как экспортировать данные?</AccordionTrigger>
						<AccordionContent>
							Перейдите в Настройки → Дополнительно → Экспортировать данные.
							Доступны форматы JSON, CSV и ZIP.
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</motion.div>
		</>
	);
}
