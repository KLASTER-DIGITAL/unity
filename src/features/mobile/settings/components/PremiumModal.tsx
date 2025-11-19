import { Check, Crown, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { useTranslation } from '@/shared/lib/i18n';

type PremiumModalProps = {
	open: boolean;
	onClose: () => void;
};

export function PremiumModal({ open, onClose }: PremiumModalProps) {
	const { t } = useTranslation();

	const premiumFeatures = [
		{
			title: t('premium.feature.unlimited.title', 'Неограниченные записи'),
			description: t(
				'premium.feature.unlimited.description',
				'Создавайте сколько угодно записей в месяц'
			),
			icon: '∞',
		},
		{
			title: t('premium.feature.offline.title', 'Offline режим'),
			description: t(
				'premium.feature.offline.description',
				'Работайте без интернета, автоматическая синхронизация'
			),
			icon: '📴',
		},
		{
			title: t('premium.feature.backup.title', 'Автоматическое резервирование'),
			description: t(
				'premium.feature.backup.description',
				'Облачное сохранение данных каждый день'
			),
			icon: '☁️',
		},
		{
			title: t('premium.feature.pdf.title', 'PDF-книги'),
			description: t(
				'premium.feature.pdf.description',
				'Генерация красивых PDF отчетов с AI-инсайтами'
			),
			icon: '📄',
		},
		{
			title: t('premium.feature.export.title', 'Расширенный экспорт'),
			description: t('premium.feature.export.description', 'Экспорт в JSON, CSV и ZIP форматах'),
			icon: '📦',
		},
		{
			title: t('premium.feature.analytics.title', 'Расширенная аналитика'),
			description: t(
				'premium.feature.analytics.description',
				'Детальные отчеты и графики прогресса'
			),
			icon: '📊',
		},
	];

	return (
		<AnimatePresence>
			{open && (
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
							<div className="flex items-center gap-responsive-sm">
								<Crown className="h-6 w-6 text-yellow-500" />
								<h3 className="text-foreground text-title-2">UNITY Premium</h3>
							</div>
							<button
								className="rounded-full p-1 transition-colors hover:bg-accent/10"
								onClick={onClose}
								type="button"
							>
								<X className="h-5 w-5 text-foreground" />
							</button>
						</div>

						<p className="mb-6 text-footnote text-muted-foreground">
							{t('premium.header.title', 'Получите максимум от вашего дневника достижений')}
						</p>

						<div className="space-y-6">
							{/* Pricing */}
							<div className="rounded-lg border-2 border-yellow-500/20 bg-linear-to-br from-yellow-500/10 to-orange-500/10 p-modal">
								<div className="text-center">
									<div className="text-foreground text-large-title">
										$4.99
										<span className="text-headline text-muted-foreground">
											{t('premium.pricing.monthly', '/месяц')}
										</span>
									</div>
									<p className="mt-2 text-footnote text-muted-foreground">
										{t('premium.pricing.yearly', 'или $49.99/год (экономия 17%)')}
									</p>
								</div>
							</div>

							{/* Features */}
							<div className="space-y-3">
								<h4 className="text-foreground text-headline">Что входит в Premium:</h4>
								{premiumFeatures.map((feature) => (
									<div className="flex items-start gap-responsive-sm" key={feature.title}>
										<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10">
											<Check className="h-4 w-4 text-green-700 dark:text-green-400" />
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-responsive-sm">
												<span className="text-headline">{feature.icon}</span>
												<h5 className="font-semibold text-footnote">{feature.title}</h5>
											</div>
											<p className="mt-1 text-caption-1 text-muted-foreground">
												{feature.description}
											</p>
										</div>
									</div>
								))}
							</div>

							{/* CTA */}
							<div className="space-y-3 pt-4">
								<Button
									className="w-full bg-linear-to-r from-yellow-500 to-orange-500 font-semibold text-white hover:from-yellow-600 hover:to-orange-600"
									onClick={() => {
										toast.info(
											t(
												'premium.cta.coming_soon',
												'Функция покупки Premium будет доступна в следующей версии'
											)
										);
										onClose();
									}}
								>
									<Crown className="mr-2 h-4 w-4" />
									{t('premium.cta.get', 'Получить Premium')}
								</Button>
								<Button className="w-full" onClick={onClose} variant="outline">
									{t('premium.cta.later', 'Может быть позже')}
								</Button>
							</div>

							{/* Footer */}
							<div className="border-border border-t pt-2 text-center text-caption-1 text-muted-foreground">
								<p>{t('premium.footer.trial', '✨ 7 дней бесплатно для новых пользователей')}</p>
								<p className="mt-1">
									{t('premium.footer.cancel', 'Отмена подписки в любое время')}
								</p>
							</div>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
