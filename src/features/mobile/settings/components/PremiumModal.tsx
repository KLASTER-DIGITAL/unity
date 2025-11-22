import { Crown, X } from 'lucide-react';
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
						className="modal-bottom-sheet z-modal mx-auto max-w-md overflow-y-auto border-border border-t bg-card transition-colors duration-300"
						exit={{ opacity: 0, y: 100 }}
						initial={{ opacity: 0, y: 100 }}
						style={{ maxHeight: '90vh', padding: 'clamp(12px, 3vw, 16px)' }}
					>
						{/* Header - компактный */}
						<div className="mb-3 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Crown className="h-5 w-5 text-yellow-500" />
								<h3 className="text-foreground text-[17px] font-semibold">
									{t('premium.header.title_short', 'Premium')}
								</h3>
							</div>
							<button
								className="rounded-full p-1 transition-colors hover:bg-accent/10"
								onClick={onClose}
								type="button"
							>
								<X className="h-5 w-5 text-foreground" />
							</button>
						</div>

						{/* Pricing - компактный */}
						<div className="mb-3 rounded-lg border-2 border-yellow-500/20 bg-linear-to-br from-yellow-500/10 to-orange-500/10 p-3 text-center">
							<div className="text-foreground text-[24px] font-bold">
								$4.99
								<span className="ml-1 text-[14px] font-normal text-muted-foreground">
									{t('premium.pricing.monthly', '/месяц')}
								</span>
							</div>
							<p className="mt-1 text-[12px] text-muted-foreground">
								{t('premium.pricing.yearly_short', '$49.99/год (-17%)')}
							</p>
						</div>

						{/* Features - компактная сетка 2x3 БЕЗ описаний */}
						<div className="mb-3">
							<h4 className="mb-2 text-[14px] font-semibold text-foreground">
								{t('premium.features.title', 'Что входит:')}
							</h4>
							<div className="grid grid-cols-2 gap-2">
								{premiumFeatures.map((feature) => (
									<div
										className="flex items-center gap-2 rounded-lg border border-border bg-background p-2 transition-colors duration-300"
										key={feature.title}
									>
										<span className="text-[20px]">{feature.icon}</span>
										<span className="text-[12px] font-medium text-foreground leading-tight">
											{feature.title}
										</span>
									</div>
								))}
							</div>
						</div>

						{/* CTA - компактные кнопки */}
						<div className="space-y-2">
							<Button
								className="h-11 w-full bg-linear-to-r from-yellow-500 to-orange-500 text-[15px] font-semibold text-white hover:from-yellow-600 hover:to-orange-600"
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
							<Button className="h-11 w-full text-[15px]" onClick={onClose} variant="outline">
								{t('premium.cta.later', 'Может быть позже')}
							</Button>
						</div>

						{/* Footer - компактный */}
						<div className="mt-3 border-border border-t pt-2 text-center text-[11px] text-muted-foreground">
							<p>{t('premium.footer.trial_short', '✨ 7 дней бесплатно')}</p>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
