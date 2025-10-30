import { Check, Crown, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";

type PremiumModalProps = {
	open: boolean;
	onClose: () => void;
};

export function PremiumModal({ open, onClose }: PremiumModalProps) {
	const premiumFeatures = [
		{
			title: "Offline режим",
			description: "Работайте без интернета, автоматическая синхронизация",
			icon: "📴",
		},
		{
			title: "Премиум-темы",
			description: "Закат, Океан, Лес - эксклюзивные цветовые схемы",
			icon: "🎨",
		},
		{
			title: "Автоматическое резервирование",
			description: "Облачное сохранение данных каждый день",
			icon: "☁️",
		},
		{
			title: "Расширенный экспорт",
			description: "Экспорт в JSON, CSV и ZIP форматах",
			icon: "📦",
		},
		{
			title: "Приоритетная поддержка",
			description: "Ответ на ваши вопросы в течение 24 часов",
			icon: "⚡",
		},
		{
			title: "Расширенная аналитика",
			description: "Детальные отчеты и графики прогресса",
			icon: "📊",
		},
		{
			title: "Без рекламы",
			description: "Никаких отвлекающих баннеров и объявлений",
			icon: "🚫",
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
							>
								<X className="h-5 w-5 text-foreground" />
							</button>
						</div>

						<p className="mb-6 text-footnote text-muted-foreground">
							Получите максимум от вашего дневника достижений
						</p>

						<div className="space-y-6">
							{/* Pricing */}
							<div className="rounded-lg border-2 border-yellow-500/20 bg-linear-to-br from-yellow-500/10 to-orange-500/10 p-modal">
								<div className="text-center">
									<div className="text-foreground text-large-title">
										$4.99
										<span className="text-headline text-muted-foreground">
											/месяц
										</span>
									</div>
									<p className="mt-2 text-footnote text-muted-foreground">
										или $49.99/год (экономия 17%)
									</p>
								</div>
							</div>

							{/* Features */}
							<div className="space-y-3">
								<h4 className="text-foreground text-headline">
									Что входит в Premium:
								</h4>
								{premiumFeatures.map((feature, index) => (
									<div
										className="flex items-start gap-responsive-sm"
										key={index}
									>
										<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-500/10">
											<Check className="h-4 w-4 text-green-700 dark:text-green-400" />
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-responsive-sm">
												<span className="text-headline">{feature.icon}</span>
												<h5 className="font-semibold text-footnote">
													{feature.title}
												</h5>
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
											"Функция покупки Premium будет доступна в следующей версии",
										);
										onClose();
									}}
								>
									<Crown className="mr-2 h-4 w-4" />
									Получить Premium
								</Button>
								<Button className="w-full" onClick={onClose} variant="outline">
									Может быть позже
								</Button>
							</div>

							{/* Footer */}
							<div className="border-border border-t pt-2 text-center text-caption-1 text-muted-foreground">
								<p>✨ 7 дней бесплатно для новых пользователей</p>
								<p className="mt-1">Отмена подписки в любое время</p>
							</div>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
