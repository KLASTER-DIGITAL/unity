import { Calendar, CheckCircle2, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@/shared/components/ui/button';

type AllCardsViewedModalProps = {
	open: boolean;
	onClose: () => void;
};

/**
 * All Cards Viewed Modal
 *
 * Показывается когда пользователь просмотрел все AI Insights карточки.
 * Информирует что новые карточки будут доступны завтра.
 *
 * Features:
 * - Centered modal with backdrop
 * - Success animation
 * - Gradient background
 * - iOS Design System best practices
 * - Touch target 44x44px for button
 * - Responsive typography
 * - Smooth animations
 */
export function AllCardsViewedModal({ open, onClose }: AllCardsViewedModalProps) {
	return (
		<AnimatePresence>
			{open && (
				<>
					{/* Backdrop */}
					<motion.div
						animate={{ opacity: 1 }}
						className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						onClick={onClose}
						transition={{ duration: 0.2 }}
					/>

					{/* Modal Container */}
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<motion.div
							animate={{ scale: 1, opacity: 1 }}
							className="relative w-full max-w-sm overflow-hidden rounded-[24px] bg-card shadow-2xl"
							exit={{ scale: 0.95, opacity: 0 }}
							initial={{ scale: 0.95, opacity: 0 }}
							transition={{ type: 'spring', damping: 25, stiffness: 300 }}
						>
							{/* Close Button */}
							<button
								className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted/80 backdrop-blur-sm transition-colors hover:bg-muted"
								onClick={onClose}
								type="button"
							>
								<X className="h-4 w-4 text-muted-foreground" />
							</button>

							{/* Header with gradient */}
							<div className="relative overflow-hidden bg-linear-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 px-6 pt-8 pb-6">
								{/* Success Icon */}
								<motion.div
									animate={{ scale: 1, rotate: 0 }}
									className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-green-500 to-emerald-600 shadow-lg"
									initial={{ scale: 0, rotate: -180 }}
									transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
								>
									<CheckCircle2 className="h-10 w-10 text-white" strokeWidth={2.5} />
								</motion.div>

								{/* Title */}
								<motion.h2
									animate={{ opacity: 1, y: 0 }}
									className="text-center font-semibold text-foreground text-xl"
									initial={{ opacity: 0, y: 10 }}
									transition={{ delay: 0.2 }}
								>
									Все карточки просмотрены! 🎉
								</motion.h2>
							</div>

							{/* Content */}
							<div className="px-6 py-6">
								{/* Message */}
								<motion.div
									animate={{ opacity: 1, y: 0 }}
									className="mb-6 space-y-4"
									initial={{ opacity: 0, y: 10 }}
									transition={{ delay: 0.3 }}
								>
									<div className="flex items-start gap-3 rounded-[16px] border border-border/20 bg-muted/30 p-4">
										<Calendar className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={2} />
										<div>
											<p className="font-medium text-foreground text-sm">Новые карточки завтра</p>
											<p className="mt-1 text-muted-foreground text-xs leading-relaxed">
												Создавайте записи сегодня, и завтра получите новые AI инсайты на основе
												ваших мыслей
											</p>
										</div>
									</div>

									<div className="flex items-start gap-3 rounded-[16px] border border-border/20 bg-muted/30 p-4">
										<Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={2} />
										<div>
											<p className="font-medium text-foreground text-sm">Продолжайте писать</p>
											<p className="mt-1 text-muted-foreground text-xs leading-relaxed">
												Чем больше записей вы создаете, тем точнее AI понимает ваши паттерны и дает
												полезные инсайты
											</p>
										</div>
									</div>
								</motion.div>

								{/* CTA Button */}
								<motion.div
									animate={{ opacity: 1, y: 0 }}
									initial={{ opacity: 0, y: 10 }}
									transition={{ delay: 0.4 }}
								>
									<Button
										className="h-12 w-full gap-2 bg-linear-to-r from-green-500 to-emerald-600 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
										onClick={onClose}
										size="lg"
									>
										<Sparkles className="h-5 w-5" strokeWidth={2} />
										Понятно
									</Button>
								</motion.div>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
}
