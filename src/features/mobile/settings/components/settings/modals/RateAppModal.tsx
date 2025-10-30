/**
 * SettingsScreen - Rate App Modal Component
 */

import { Star, X } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';

type RateAppModalProps = {
	isOpen: boolean;
	onClose: () => void;
};

export function RateAppModal({ isOpen, onClose }: RateAppModalProps) {
	if (!isOpen) {
		return null;
	}

	const handleSubmit = () => {
		toast.success('Спасибо за вашу оценку! ⭐');
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
					<h3 className="text-foreground text-title-3">Оценить приложение</h3>
					<button
						className="rounded-full p-1 transition-colors hover:bg-accent/10"
						onClick={onClose}
					>
						<X className="h-5 w-5 text-foreground" />
					</button>
				</div>

				<p className="mb-6 text-footnote text-muted-foreground">
					Ваше мнение помогает нам стать лучше
				</p>

				<div className="space-y-6">
					{/* Star Rating */}
					<div className="space-y-3">
						<label className="font-medium text-footnote text-foreground">Ваша оценка</label>
						<div className="flex justify-center gap-responsive-sm py-4">
							{[1, 2, 3, 4, 5].map((star) => (
								<button className="transition-transform hover:scale-110" key={star} type="button">
									<Star className="h-10 w-10 fill-yellow-400 text-yellow-400" />
								</button>
							))}
						</div>
						<p className="text-center text-footnote text-muted-foreground">Отлично! 🎉</p>
					</div>

					{/* Comment */}
					<div className="space-y-2">
						<label className="font-medium text-footnote text-foreground">
							Комментарий (необязательно)
						</label>
						<Textarea
							className="resize-none"
							placeholder="Расскажите, что вам понравилось или что можно улучшить..."
							rows={4}
						/>
					</div>

					<Button className="w-full" onClick={handleSubmit}>
						Отправить отзыв
					</Button>
				</div>
			</motion.div>
		</>
	);
}
