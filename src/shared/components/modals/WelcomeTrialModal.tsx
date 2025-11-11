/**
 * Welcome Trial Modal
 *
 * Показывается новым пользователям после регистрации.
 * Информирует о 14-дневном Premium trial и его возможностях.
 *
 * Features:
 * - Centered modal with backdrop
 * - Premium features list with icons
 * - Gradient background for premium feel
 * - iOS Design System best practices
 * - Touch target 44x44px for button
 * - Responsive typography
 * - Smooth animations
 */

import { AnimatePresence, motion } from 'framer-motion';
import { Crown, Sparkles, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface WelcomeTrialModalProps {
	open: boolean;
	onClose: () => void;
}

export function WelcomeTrialModal({ open, onClose }: WelcomeTrialModalProps) {
	const trialFeatures = [
		{
			title: 'AI анализ записей',
			description: 'Умный анализ ваших мыслей и эмоций',
			icon: '🤖',
		},
		{
			title: 'Неограниченные записи',
			description: 'Создавайте сколько угодно записей в месяц',
			icon: '∞',
		},
		{
			title: 'Offline режим',
			description: 'Работайте без интернета с автосинхронизацией',
			icon: '📴',
		},
		{
			title: 'PDF-книги',
			description: 'Генерация красивых PDF с вашими записями',
			icon: '📄',
		},
		{
			title: 'Премиум-темы',
			description: 'Эксклюзивные цветовые схемы',
			icon: '🎨',
		},
		{
			title: 'Расширенная аналитика',
			description: 'Детальные отчеты и графики прогресса',
			icon: '📊',
		},
	];

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

					{/* Modal */}
					<motion.div
						animate={{ opacity: 1, scale: 1 }}
						className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
						exit={{ opacity: 0, scale: 0.95 }}
						initial={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.3, ease: 'easeOut' }}
					>
						<div className="relative w-full max-w-md overflow-hidden rounded-2xl border-border border bg-card shadow-2xl">
							{/* Close Button */}
							<button
								aria-label="Close"
								className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors hover:bg-muted"
								onClick={onClose}
								type="button"
							>
								<X className="h-4 w-4" strokeWidth={2} />
							</button>

							{/* Content */}
							<div className="p-4 sm:p-6">
								{/* Header */}
								<div className="mb-4 sm:mb-6 text-center">
									<div className="mb-2 sm:mb-3 flex justify-center">
										<div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-linear-to-r from-yellow-500 to-orange-500">
											<Crown className="h-6 w-6 sm:h-8 sm:w-8 text-white" strokeWidth={2.5} />
										</div>
									</div>
									<h2 className="mb-1.5 sm:mb-2 font-bold text-xl sm:text-2xl text-foreground">
										Добро пожаловать в UNITY!
									</h2>
									<p className="text-muted-foreground text-xs sm:text-sm">
										Вы получили{' '}
										<span className="font-semibold text-yellow-500">14 дней Premium</span> бесплатно
									</p>
								</div>

								{/* Features List */}
								<div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
									{trialFeatures.map((feature, index) => (
										<motion.div
											key={feature.title}
											animate={{ opacity: 1, x: 0 }}
											className="flex items-start gap-2 sm:gap-3 rounded-lg sm:rounded-xl border-border border bg-muted/30 p-2 sm:p-3 transition-colors duration-300"
											initial={{ opacity: 0, x: -20 }}
											transition={{ delay: 0.5 + index * 0.1 }}
										>
											<div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-base sm:text-xl">
												{feature.icon}
											</div>
											<div className="flex-1 min-w-0">
												<h3 className="font-semibold text-foreground text-xs sm:text-sm leading-tight">
													{feature.title}
												</h3>
												<p className="text-muted-foreground text-[10px] sm:text-xs leading-tight mt-0.5">
													{feature.description}
												</p>
											</div>
										</motion.div>
									))}
								</div>

								{/* Footer */}
								<div className="border-border border-t bg-muted/30 px-4 sm:px-6 py-3 sm:py-4 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6">
									<Button
										className="h-11 sm:h-12 w-full gap-2 bg-linear-to-r from-yellow-500 to-orange-500 font-semibold text-sm sm:text-base text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
										onClick={onClose}
										size="lg"
									>
										<Sparkles className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
										Начать использовать
									</Button>
								</div>
							</div>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
