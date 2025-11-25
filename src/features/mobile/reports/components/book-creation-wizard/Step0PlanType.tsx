/**
 * Step 0: Plan Type Selection (FREE vs PREMIUM)
 * Only shown for FREE users
 */

import { BookOpen, Sparkles } from 'lucide-react';
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
		<div className="space-y-6">
			<div className="text-center mb-6">
				<h3 className="text-xl font-bold text-white mb-2">Выберите тип книги</h3>
				<p className="text-white/60 text-sm">
					Создайте простую книгу-дневник или AI-книгу с глубоким анализом
				</p>
			</div>

			{/* FREE Option */}
			<button
				className={`w-full relative group overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 ${
					config.planType === 'free'
						? 'border-white/40 bg-white/10 shadow-lg shadow-white/5'
						: 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
				}`}
				onClick={() => onConfigChange({ planType: 'free' })}
				type="button"
			>
				<div className="mb-4 flex items-start justify-between">
					<div className="flex items-center gap-4">
						<div className="rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 p-3 shadow-inner">
							<BookOpen className="h-6 w-6 text-white" strokeWidth={2} />
						</div>
						<div>
							<h3 className="font-bold text-lg text-white">Простая книга</h3>
							<p className="text-white/50 text-sm font-medium">Бесплатно</p>
						</div>
					</div>
					<div
						className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
							config.planType === 'free'
								? 'border-white bg-white'
								: 'border-white/30 bg-transparent'
						}`}
					>
						{config.planType === 'free' && <div className="h-2.5 w-2.5 rounded-full bg-black" />}
					</div>
				</div>

				<ul className="space-y-2 text-sm pl-1">
					<li className="flex items-center gap-3 text-white/80">
						<div className="h-1.5 w-1.5 rounded-full bg-white/40" />
						<span>Список всех записей за период</span>
					</li>
					<li className="flex items-center gap-3 text-white/80">
						<div className="h-1.5 w-1.5 rounded-full bg-white/40" />
						<span>Базовая статистика</span>
					</li>
					<li className="flex items-center gap-3 text-white/80">
						<div className="h-1.5 w-1.5 rounded-full bg-white/40" />
						<span>Фото-коллаж (до 9 фото)</span>
					</li>
				</ul>
			</button>

			{/* PREMIUM Option */}
			<button
				className={`w-full relative group overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 ${
					config.planType === 'premium'
						? 'border-purple-400/50 bg-purple-500/20 shadow-lg shadow-purple-500/20'
						: 'border-white/10 bg-gradient-to-br from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 hover:border-purple-500/30'
				}`}
				onClick={() => {
					if (!isPremium) {
						onUpgrade();
					} else {
						onConfigChange({ planType: 'premium' });
					}
				}}
				type="button"
			>
				{/* Shimmer effect */}
				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />

				<div className="mb-4 flex items-start justify-between relative z-10">
					<div className="flex items-center gap-4">
						<div className="rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 p-3 shadow-lg shadow-purple-500/30">
							<Sparkles className="h-6 w-6 text-white" strokeWidth={2} />
						</div>
						<div>
							<h3 className="font-bold text-lg text-white">AI-книга</h3>
							<p className="text-purple-300 text-sm font-bold tracking-wide">PREMIUM</p>
						</div>
					</div>
					<div
						className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
							config.planType === 'premium'
								? 'border-purple-400 bg-purple-500'
								: 'border-white/30 bg-transparent'
						}`}
					>
						{config.planType === 'premium' && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
					</div>
				</div>

				<ul className="space-y-2 text-sm pl-1 relative z-10">
					<li className="flex items-center gap-3 text-white/90">
						<Sparkles className="h-3 w-3 text-purple-400" />
						<span>
							<strong>AI-анализ</strong> записей и эмоций
						</span>
					</li>
					<li className="flex items-center gap-3 text-white/90">
						<Sparkles className="h-3 w-3 text-purple-400" />
						<span>
							<strong>Главы</strong> по людям и сферам жизни
						</span>
					</li>
					<li className="flex items-center gap-3 text-white/90">
						<Sparkles className="h-3 w-3 text-purple-400" />
						<span>
							<strong>Эмоциональный обзор</strong> периода
						</span>
					</li>
					<li className="flex items-center gap-3 text-white/90">
						<Sparkles className="h-3 w-3 text-purple-400" />
						<span>
							<strong>Выводы и инсайты</strong> от AI
						</span>
					</li>
				</ul>

				{!isPremium && (
					<div className="mt-4 rounded-lg bg-purple-500/20 border border-purple-500/30 px-3 py-2 text-center">
						<p className="text-purple-200 text-xs font-semibold uppercase tracking-wider">
							Требуется Premium подписка
						</p>
					</div>
				)}
			</button>

			<div className="rounded-xl bg-white/5 border border-white/10 p-4">
				<p className="text-white/60 text-xs leading-relaxed text-center">
					💡 <strong>Совет:</strong> Начните с простой книги, а затем перейдите на Premium для
					полного опыта с AI-анализом.
				</p>
			</div>
		</div>
	);
}
