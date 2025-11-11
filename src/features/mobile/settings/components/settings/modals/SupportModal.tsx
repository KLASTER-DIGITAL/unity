/**
 * SettingsScreen - Support Modal Component
 */

import { MessageCircle, Upload, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
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
	const [subject, setSubject] = useState('');
	const [message, setMessage] = useState('');
	const [screenshot, setScreenshot] = useState<File | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	if (!isOpen) {
		return null;
	}

	const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// Проверка размера (макс 5MB)
			if (file.size > 5 * 1024 * 1024) {
				toast.error('Файл слишком большой. Максимум 5MB');
				return;
			}
			// Проверка типа
			if (!file.type.startsWith('image/')) {
				toast.error('Можно загружать только изображения');
				return;
			}
			setScreenshot(file);
			toast.success('Скриншот прикреплен');
		}
	};

	const handleTelegramSupport = () => {
		// Открыть Telegram бот или канал поддержки
		window.open('https://t.me/unity_support_bot', '_blank');
		toast.info('Открываем Telegram для связи с поддержкой');
	};

	const handleSubmit = async () => {
		if (!subject.trim() || !message.trim()) {
			toast.error('Заполните тему и сообщение');
			return;
		}

		setIsSubmitting(true);

		try {
			// TODO: Реализовать отправку через Edge Function
			// const formData = new FormData();
			// formData.append('email', userEmail || '');
			// formData.append('subject', subject);
			// formData.append('message', message);
			// if (screenshot) {
			//   formData.append('screenshot', screenshot);
			// }
			//
			// const response = await fetch('/api/support-ticket', {
			//   method: 'POST',
			//   body: formData,
			// });

			// Временная заглушка
			await new Promise((resolve) => setTimeout(resolve, 1000));

			toast.success('Сообщение отправлено! Мы ответим в течение 24 часов.');
			setSubject('');
			setMessage('');
			setScreenshot(null);
			onClose();
		} catch (error) {
			console.error('Error submitting support ticket:', error);
			toast.error('Ошибка отправки. Попробуйте позже или свяжитесь через Telegram');
		} finally {
			setIsSubmitting(false);
		}
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
					<h3 className="text-foreground text-title-3">{t.contactSupport || 'Поддержка'}</h3>
					<button
						className="rounded-full p-1 transition-colors hover:bg-accent/10"
						onClick={onClose}
						type="button"
					>
						<X className="h-5 w-5 text-foreground" />
					</button>
				</div>

				<p className="mb-4 text-footnote text-muted-foreground">
					Выберите удобный способ связи с нами
				</p>

				{/* Кнопка Telegram */}
				<Button
					className="mb-4 w-full bg-(--ios-blue) hover:bg-(--ios-blue)/90"
					onClick={handleTelegramSupport}
				>
					<MessageCircle className="mr-2 h-4 w-4" />
					Связаться в Telegram
				</Button>

				<div className="relative mb-4">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-border border-t" />
					</div>
					<div className="relative flex justify-center text-caption-1">
						<span className="bg-card px-2 text-muted-foreground">или</span>
					</div>
				</div>

				{/* Форма обращения */}
				<div className="space-y-4">
					<div>
						<label
							className="mb-1 block font-medium text-footnote text-foreground"
							htmlFor="support-email"
						>
							Email
						</label>
						<Input
							className="bg-muted"
							disabled
							id="support-email"
							type="email"
							value={userEmail || ''}
						/>
					</div>
					<div>
						<label
							className="mb-1 block font-medium text-footnote text-foreground"
							htmlFor="support-subject"
						>
							Тема обращения
						</label>
						<Input
							id="support-subject"
							onChange={(e) => setSubject(e.target.value)}
							placeholder="Например: Проблема с AI-анализом"
							type="text"
							value={subject}
						/>
					</div>
					<div>
						<label
							className="mb-1 block font-medium text-footnote text-foreground"
							htmlFor="support-message"
						>
							Сообщение
						</label>
						<Textarea
							id="support-message"
							onChange={(e) => setMessage(e.target.value)}
							placeholder="Опишите вашу проблему или вопрос..."
							rows={6}
							value={message}
						/>
					</div>

					{/* Прикрепить скриншот */}
					<div>
						<label
							className="mb-1 block font-medium text-footnote text-foreground"
							htmlFor="screenshot-upload"
						>
							Скриншот (опционально)
						</label>
						<div className="flex items-center gap-2">
							<Button
								className="flex-1"
								onClick={() => document.getElementById('screenshot-upload')?.click()}
								type="button"
								variant="outline"
							>
								<Upload className="mr-2 h-4 w-4" />
								{screenshot ? screenshot.name : 'Прикрепить скриншот'}
							</Button>
							{screenshot && (
								<Button
									onClick={() => setScreenshot(null)}
									size="icon"
									type="button"
									variant="ghost"
								>
									<X className="h-4 w-4" />
								</Button>
							)}
						</div>
						<input
							accept="image/*"
							className="hidden"
							id="screenshot-upload"
							onChange={handleScreenshotUpload}
							type="file"
						/>
						<p className="mt-1 text-caption-2 text-muted-foreground">PNG, JPG, WEBP до 5MB</p>
					</div>

					<Button className="w-full" disabled={isSubmitting} onClick={handleSubmit}>
						{isSubmitting ? 'Отправка...' : 'Отправить'}
					</Button>
				</div>
			</motion.div>
		</>
	);
}
