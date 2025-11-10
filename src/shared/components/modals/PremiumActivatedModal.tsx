import { Check, Crown, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@/shared/components/ui/button';

type PremiumActivatedModalProps = {
	open: boolean;
	onClose: () => void;
};

/**
 * Premium Activated Modal
 *
 * Показывается когда супер-админ активирует Premium подписку для пользователя.
 * Отображается по центру экрана с анимацией и списком всех Premium возможностей.
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
export function PremiumActivatedModal({ open, onClose }: PremiumActivatedModalProps) {
	const premiumFeatures = [
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
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<motion.div
							animate={{ opacity: 1, scale: 1, y: 0 }}
							className="relative w-full max-w-md overflow-hidden rounded-3xl border-border border bg-card shadow-2xl"
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{ type: 'spring', duration: 0.4, bounce: 0.3 }}
						>
							{/* Close Button */}
							<button
								aria-label="Close"
								className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors hover:bg-muted"
								onClick={onClose}
							>
								<X className="h-4 w-4" strokeWidth={2} />
							</button>

							{/* Header with gradient */}
							<div className="bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20 px-6 py-8 text-center">
								<motion.div
									animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
									className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg"
									transition={{ duration: 0.6, delay: 0.2 }}
								>
									<Crown className="h-10 w-10 text-white" strokeWidth={2.5} />
								</motion.div>

								<motion.h2
									animate={{ opacity: 1, y: 0 }}
									className="mb-2 font-bold text-2xl text-foreground"
									initial={{ opacity: 0, y: 10 }}
									transition={{ delay: 0.3 }}
								>
									🎉 Premium активирован!
								</motion.h2>

								<motion.p
									animate={{ opacity: 1, y: 0 }}
									className="text-muted-foreground text-sm"
									initial={{ opacity: 0, y: 10 }}
									transition={{ delay: 0.4 }}
								>
									Теперь доступны все возможности UNITY
								</motion.p>
							</div>

							{/* Features List */}
							<div className="max-h-[400px] space-y-3 overflow-y-auto px-6 py-6">
								{premiumFeatures.map((feature, index) => (
									<motion.div
										key={feature.title}
										animate={{ opacity: 1, x: 0 }}
										className="flex items-start gap-3 rounded-xl border-border border bg-muted/30 p-3 transition-colors duration-300"
										initial={{ opacity: 0, x: -20 }}
										transition={{ delay: 0.5 + index * 0.1 }}
									>
										<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xl">
											{feature.icon}
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<h3 className="font-semibold text-foreground text-sm">{feature.title}</h3>
												<Check className="h-4 w-4 text-green-500" strokeWidth={2.5} />
											</div>
											<p className="mt-0.5 text-muted-foreground text-xs">{feature.description}</p>
										</div>
									</motion.div>
								))}
							</div>

							{/* Footer */}
							<div className="border-border border-t bg-muted/30 px-6 py-4">
								<Button
									className="h-12 w-full gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
									onClick={onClose}
									size="lg"
								>
									<Sparkles className="h-5 w-5" strokeWidth={2} />
									Начать использовать
								</Button>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
}
