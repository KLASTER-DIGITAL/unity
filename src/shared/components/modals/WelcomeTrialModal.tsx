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
 * - ✅ MOBILE OPTIMIZED: max-h-[80vh] для iPhone SE (375x667)
 * - ✅ i18n READY: useTranslation() hook
 */

import { AnimatePresence, motion } from 'framer-motion';
import { Crown, Sparkles, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useTranslation } from '@/shared/lib/i18n';

interface WelcomeTrialModalProps {
	open: boolean;
	onClose: () => void;
}

export function WelcomeTrialModal({ open, onClose }: WelcomeTrialModalProps) {
	const { t } = useTranslation();

	// ✅ OPTIMIZED: Reduced from 6 to 4 features for iPhone SE (375x667)
	const trialFeatures = [
		{
			title: t('welcomeTrial.feature.aiAnalysis.title', 'AI анализ записей'),
			description: t(
				'welcomeTrial.feature.aiAnalysis.description',
				'Умный анализ ваших мыслей и эмоций'
			),
			icon: '🤖',
		},
		{
			title: t('welcomeTrial.feature.unlimitedEntries.title', 'Неограниченные записи'),
			description: t(
				'welcomeTrial.feature.unlimitedEntries.description',
				'Создавайте сколько угодно записей в месяц'
			),
			icon: '∞',
		},
		{
			title: t('welcomeTrial.feature.pdfBooks.title', 'PDF-книги'),
			description: t(
				'welcomeTrial.feature.pdfBooks.description',
				'Генерация красивых PDF с вашими записями'
			),
			icon: '📄',
		},
		{
			title: t('welcomeTrial.feature.analytics.title', 'Расширенная аналитика'),
			description: t(
				'welcomeTrial.feature.analytics.description',
				'Детальные отчеты и графики прогресса'
			),
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

					{/* Modal - ✅ MOBILE OPTIMIZED: max-h-[80vh] для iPhone SE */}
					<motion.div
						animate={{ opacity: 1, scale: 1 }}
						className="fixed inset-0 z-50 flex items-center justify-center p-2"
						exit={{ opacity: 0, scale: 0.95 }}
						initial={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.3, ease: 'easeOut' }}
					>
						<div className="relative w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl border-border border bg-card shadow-2xl">
							{/* Close Button */}
							<button
								aria-label="Close"
								className="sticky top-2 right-2 z-10 ml-auto mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors hover:bg-muted"
								onClick={onClose}
								type="button"
							>
								<X className="h-4 w-4" strokeWidth={2} />
							</button>

							{/* Content */}
							<div className="px-4 pb-4 pt-0">
								{/* Header */}
								<div className="mb-3 text-center">
									<div className="mb-2 flex justify-center">
										<div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">
											<Crown className="h-6 w-6 text-white" strokeWidth={2.5} />
										</div>
									</div>
									<h2 className="mb-1.5 font-bold text-lg text-foreground">
										{t('welcomeTrial.title', 'Добро пожаловать в UNITY!')}
									</h2>
									<p className="text-muted-foreground text-xs">
										{t('welcomeTrial.youReceived', 'Вы получили')}{' '}
										<span className="font-semibold text-yellow-500">
											{t('welcomeTrial.premiumDays', '7 дней Premium')}
										</span>{' '}
										{t('welcomeTrial.free', 'бесплатно')}
									</p>
								</div>

								{/* Features List - ✅ COMPACT: уменьшенные отступы для iPhone SE */}
								<div className="mb-3 space-y-2">
									{trialFeatures.map((feature, index) => (
										<motion.div
											key={feature.title}
											animate={{ opacity: 1, x: 0 }}
											className="flex items-start gap-2 rounded-lg border-border border bg-muted/30 p-2 transition-colors duration-300"
											initial={{ opacity: 0, x: -20 }}
											transition={{ duration: 0.2 }}
										>
											<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm">
												{feature.icon}
											</div>
											<div className="flex-1 min-w-0">
												<h3 className="font-semibold text-foreground text-xs leading-tight">
													{feature.title}
												</h3>
												<p className="text-muted-foreground text-[10px] leading-tight mt-0.5">
													{feature.description}
												</p>
											</div>
										</motion.div>
									))}
								</div>

								{/* Footer - ✅ STICKY: прилипает к низу модального окна */}
								<div className="sticky bottom-0 border-border border-t bg-card px-4 py-3 -mx-4 -mb-4">
									<Button
										className="h-11 w-full gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 font-semibold text-sm text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
										onClick={onClose}
										size="lg"
									>
										<Sparkles className="h-4 w-4" strokeWidth={2} />
										{t('welcomeTrial.startUsing', 'Начать использовать')}
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
