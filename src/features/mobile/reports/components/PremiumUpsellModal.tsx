/**
 * Premium Upsell Modal
 * Shown to FREE users when they try to create AI books
 */

import { Check, Sparkles, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

type PremiumUpsellModalProps = {
	onClose: () => void;
	onUpgrade: () => void;
};

export function PremiumUpsellModal({ onClose, onUpgrade }: PremiumUpsellModalProps) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-background shadow-2xl">
				{/* Header */}
				<div className="sticky top-0 z-10 border-b border-border bg-background/95 p-4 backdrop-blur">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-2">
							<div className="rounded-full bg-gradient-to-br from-primary to-primary/70 p-2">
								<Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2} />
							</div>
							<div>
								<h2 className="text-lg font-semibold">Перейди на Premium</h2>
								<p className="text-muted-foreground text-sm">Создавай AI-книги о своей жизни</p>
							</div>
						</div>
						<button
							className="text-muted-foreground transition-colors duration-300 hover:text-foreground"
							onClick={onClose}
							type="button"
						>
							<X className="h-5 w-5" strokeWidth={2} />
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="space-y-6 p-6">
					{/* Benefits */}
					<div className="space-y-3">
						<h3 className="font-medium">Что входит в Premium:</h3>
						<ul className="space-y-3">
							<li className="flex items-start gap-3">
								<div className="mt-0.5 rounded-full bg-primary/10 p-1">
									<Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
								</div>
								<div>
									<p className="font-medium">AI-анализ записей</p>
									<p className="text-muted-foreground text-sm">
										Глубокий анализ эмоций, событий и инсайтов за период
									</p>
								</div>
							</li>
							<li className="flex items-start gap-3">
								<div className="mt-0.5 rounded-full bg-primary/10 p-1">
									<Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
								</div>
								<div>
									<p className="font-medium">Главы по людям и сферам</p>
									<p className="text-muted-foreground text-sm">
										Отдельные главы: Семья, Работа, Здоровье, Духовность и другие
									</p>
								</div>
							</li>
							<li className="flex items-start gap-3">
								<div className="mt-0.5 rounded-full bg-primary/10 p-1">
									<Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
								</div>
								<div>
									<p className="font-medium">Эмоциональный обзор</p>
									<p className="text-muted-foreground text-sm">
										Динамика настроений, тренды и паттерны периода
									</p>
								</div>
							</li>
							<li className="flex items-start gap-3">
								<div className="mt-0.5 rounded-full bg-primary/10 p-1">
									<Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
								</div>
								<div>
									<p className="font-medium">Выводы и благодарность</p>
									<p className="text-muted-foreground text-sm">
										AI помогает увидеть рост и сформулировать благодарность
									</p>
								</div>
							</li>
							<li className="flex items-start gap-3">
								<div className="mt-0.5 rounded-full bg-primary/10 p-1">
									<Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
								</div>
								<div>
									<p className="font-medium">Редактор книги</p>
									<p className="text-muted-foreground text-sm">
										Изменяй текст, добавляй фото, создавай новые версии
									</p>
								</div>
							</li>
							<li className="flex items-start gap-3">
								<div className="mt-0.5 rounded-full bg-primary/10 p-1">
									<Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
								</div>
								<div>
									<p className="font-medium">Автоматическая генерация</p>
									<p className="text-muted-foreground text-sm">
										Книга автоматически создается каждый месяц
									</p>
								</div>
							</li>
							<li className="flex items-start gap-3">
								<div className="mt-0.5 rounded-full bg-primary/10 p-1">
									<Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
								</div>
								<div>
									<p className="font-medium">3 стиля на выбор</p>
									<p className="text-muted-foreground text-sm">
										Теплый семейный, Биографический, Мотивационный
									</p>
								</div>
							</li>
						</ul>
					</div>

					{/* Comparison */}
					<div className="rounded-lg border border-border bg-muted/30 p-4">
						<h4 className="mb-3 font-medium">Сравнение:</h4>
						<div className="space-y-2 text-sm">
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Простая книга (FREE)</span>
								<span>Список записей</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-primary font-medium">AI-книга (Premium)</span>
								<span className="text-primary font-medium">История жизни</span>
							</div>
						</div>
					</div>

					{/* CTA */}
					<div className="space-y-3">
						<Button
							className="w-full bg-gradient-to-r from-primary to-primary/80 font-medium hover:from-primary/90 hover:to-primary/70"
							onClick={onUpgrade}
							size="lg"
						>
							<Sparkles className="mr-2 h-5 w-5" strokeWidth={2} />
							Перейти на Premium
						</Button>
						<Button className="w-full" onClick={onClose} size="lg" variant="outline">
							Создать простую книгу
						</Button>
					</div>

					<p className="text-muted-foreground text-center text-xs">
						Вы всегда можете обновить книгу до AI-версии позже
					</p>
				</div>
			</div>
		</div>
	);
}
