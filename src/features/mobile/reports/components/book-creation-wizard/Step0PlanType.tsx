/**
 * Step 0: Plan Type Selection (FREE vs PREMIUM)
 * Only shown for FREE users
 */

import { BookOpen, Sparkles } from 'lucide-react';
import { Label } from '@/shared/components/ui/label';
import type { BookConfig } from './types';

type Step0PlanTypeProps = {
	config: BookConfig;
	onConfigChange: (updates: Partial<BookConfig>) => void;
	isPremium: boolean;
	onUpgrade: () => void;
};

export function Step0PlanType({
	config,
	onConfigChange,
	isPremium,
	onUpgrade,
}: Step0PlanTypeProps) {
	// If user is Premium, auto-select premium and skip this step
	if (isPremium) {
		if (config.planType !== 'premium') {
			onConfigChange({ planType: 'premium' });
		}
		return null;
	}

	return (
		<div className="space-y-4">
			<div className="mb-4">
				<Label className="text-base">Выберите тип книги</Label>
				<p className="text-muted-foreground mt-2 text-sm">
					Создайте простую книгу-дневник или AI-книгу с глубоким анализом
				</p>
			</div>

			{/* FREE Option */}
			<button
				className={`w-full rounded-lg border p-4 text-left transition-all duration-300 ${
					config.planType === 'free'
						? 'border-primary bg-primary/10 ring-2 ring-primary'
						: 'border-border bg-background hover:border-primary/50'
				}`}
				onClick={() => onConfigChange({ planType: 'free' })}
				type="button"
			>
				<div className="mb-3 flex items-start justify-between">
					<div className="flex items-center gap-3">
						<div
							className={`rounded-full p-2 transition-colors duration-300 ${
								config.planType === 'free' ? 'bg-primary text-primary-foreground' : 'bg-muted'
							}`}
						>
							<BookOpen className="h-5 w-5" strokeWidth={2} />
						</div>
						<div>
							<h3 className="font-semibold">Простая книга</h3>
							<p className="text-muted-foreground text-sm">Бесплатно</p>
						</div>
					</div>
					<div
						className={`h-5 w-5 rounded-full border-2 transition-all duration-300 ${
							config.planType === 'free'
								? 'border-primary bg-primary'
								: 'border-muted-foreground/30'
						}`}
					>
						{config.planType === 'free' && (
							<div className="flex h-full items-center justify-center">
								<div className="h-2 w-2 rounded-full bg-primary-foreground" />
							</div>
						)}
					</div>
				</div>

				<ul className="ml-11 space-y-1 text-sm">
					<li className="flex items-start gap-2">
						<span className="text-muted-foreground">✓</span>
						<span>Список всех записей за период</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-muted-foreground">✓</span>
						<span>Базовая статистика</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-muted-foreground">✓</span>
						<span>Фото-коллаж (до 9 фото)</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-muted-foreground">✓</span>
						<span>Быстрая генерация ({'<'}5 сек)</span>
					</li>
				</ul>
			</button>

			{/* PREMIUM Option (with Upsell) */}
			<button
				className={`w-full rounded-lg border p-4 text-left transition-all duration-300 ${
					config.planType === 'premium'
						? 'border-primary bg-primary/10 ring-2 ring-primary'
						: 'border-border bg-background hover:border-primary/50'
				}`}
				onClick={() => {
					if (!isPremium) {
						// Show Premium Upsell Modal
						onUpgrade();
					} else {
						onConfigChange({ planType: 'premium' });
					}
				}}
				type="button"
			>
				<div className="mb-3 flex items-start justify-between">
					<div className="flex items-center gap-3">
						<div
							className={`rounded-full p-2 transition-colors duration-300 ${
								config.planType === 'premium'
									? 'bg-gradient-to-br from-primary to-primary/70 text-primary-foreground'
									: 'bg-gradient-to-br from-primary/20 to-primary/10'
							}`}
						>
							<Sparkles className="h-5 w-5" strokeWidth={2} />
						</div>
						<div>
							<h3 className="font-semibold">AI-книга</h3>
							<p className="text-primary text-sm font-medium">Premium</p>
						</div>
					</div>
					<div
						className={`h-5 w-5 rounded-full border-2 transition-all duration-300 ${
							config.planType === 'premium'
								? 'border-primary bg-primary'
								: 'border-muted-foreground/30'
						}`}
					>
						{config.planType === 'premium' && (
							<div className="flex h-full items-center justify-center">
								<div className="h-2 w-2 rounded-full bg-primary-foreground" />
							</div>
						)}
					</div>
				</div>

				<ul className="ml-11 space-y-1 text-sm">
					<li className="flex items-start gap-2">
						<span className="text-primary">✨</span>
						<span>
							<strong>AI-анализ</strong> записей и эмоций
						</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-primary">✨</span>
						<span>
							<strong>Главы</strong> по людям и сферам жизни
						</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-primary">✨</span>
						<span>
							<strong>Эмоциональный обзор</strong> периода
						</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-primary">✨</span>
						<span>
							<strong>Выводы и инсайты</strong> от AI
						</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-primary">✨</span>
						<span>
							<strong>Редактор</strong> с возможностью изменений
						</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-primary">✨</span>
						<span>
							<strong>Автоматическая генерация</strong> каждый месяц
						</span>
					</li>
				</ul>

				{!isPremium && (
					<div className="ml-11 mt-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
						<p className="text-primary text-sm font-medium">→ Требуется Premium подписка</p>
					</div>
				)}
			</button>

			<div className="rounded-lg border border-border bg-muted/50 p-3 transition-colors duration-300">
				<p className="text-muted-foreground text-sm">
					💡 <strong>Совет:</strong> Начните с простой книги, а затем перейдите на Premium для
					полного опыта с AI-анализом.
				</p>
			</div>
		</div>
	);
}
