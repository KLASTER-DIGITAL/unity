/**
 * Step 1: Period Selection
 */

import { Calendar } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { BookConfig } from './types';

type Step1PeriodProps = {
	config: BookConfig;
	onConfigChange: (updates: Partial<BookConfig>) => void;
	isPremium?: boolean;
};

export function Step1Period({ config, onConfigChange, isPremium = false }: Step1PeriodProps) {
	// Auto-set period based on type
	const handleTypeChange = (type: BookConfig['type']) => {
		const today = new Date();
		const updates: Partial<BookConfig> = { type };

		if (type === 'month') {
			const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
			updates.periodStart = firstDay.toISOString().split('T')[0];
			updates.periodEnd = today.toISOString().split('T')[0];
		} else if (type === 'quarter') {
			const quarter = Math.floor(today.getMonth() / 3);
			const firstDay = new Date(today.getFullYear(), quarter * 3, 1);
			updates.periodStart = firstDay.toISOString().split('T')[0];
			updates.periodEnd = today.toISOString().split('T')[0];
		} else if (type === 'year') {
			const firstDay = new Date(today.getFullYear(), 0, 1);
			updates.periodStart = firstDay.toISOString().split('T')[0];
			updates.periodEnd = today.toISOString().split('T')[0];
		}

		onConfigChange(updates);
	};

	return (
		<div className="space-y-6">
			{/* Book Type Selection (Premium only) */}
			{isPremium && (
				<div>
					<label className="block text-white text-sm font-semibold mb-3">Тип книги</label>
					<div className="flex gap-2">
						<Button
							onClick={() => handleTypeChange('month')}
							size="sm"
							variant={config.type === 'month' ? 'default' : 'outline'}
							className={
								config.type === 'month'
									? 'bg-white text-black hover:bg-white/90'
									: 'bg-white/10 text-white border-white/20 hover:bg-white/20'
							}
						>
							Месяц
						</Button>
						<Button
							onClick={() => handleTypeChange('quarter')}
							size="sm"
							variant={config.type === 'quarter' ? 'default' : 'outline'}
							className={
								config.type === 'quarter'
									? 'bg-white text-black hover:bg-white/90'
									: 'bg-white/10 text-white border-white/20 hover:bg-white/20'
							}
						>
							Квартал
						</Button>
						<Button
							onClick={() => handleTypeChange('year')}
							size="sm"
							variant={config.type === 'year' ? 'default' : 'outline'}
							className={
								config.type === 'year'
									? 'bg-white text-black hover:bg-white/90'
									: 'bg-white/10 text-white border-white/20 hover:bg-white/20'
							}
						>
							Год
						</Button>
						<Button
							onClick={() => handleTypeChange('custom')}
							size="sm"
							variant={config.type === 'custom' ? 'default' : 'outline'}
							className={
								config.type === 'custom'
									? 'bg-white text-black hover:bg-white/90'
									: 'bg-white/10 text-white border-white/20 hover:bg-white/20'
							}
						>
							Произвольный
						</Button>
					</div>
				</div>
			)}

			<div>
				<label htmlFor="periodStart" className="block text-white text-sm font-semibold mb-3">
					Начало периода
				</label>
				<div className="relative">
					<Calendar
						className="absolute top-3.5 left-4 h-5 w-5 text-white/40 pointer-events-none"
						strokeWidth={2}
					/>
					<input
						className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pr-4 pl-12 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
						id="periodStart"
						max={config.periodEnd}
						onChange={(e) => onConfigChange({ periodStart: e.target.value })}
						type="date"
						value={config.periodStart}
					/>
				</div>
			</div>

			<div>
				<label htmlFor="periodEnd" className="block text-white text-sm font-semibold mb-3">
					Конец периода
				</label>
				<div className="relative">
					<Calendar
						className="absolute top-3.5 left-4 h-5 w-5 text-white/40 pointer-events-none"
						strokeWidth={2}
					/>
					<input
						className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pr-4 pl-12 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
						id="periodEnd"
						max={new Date().toISOString().split('T')[0]}
						min={config.periodStart}
						onChange={(e) => onConfigChange({ periodEnd: e.target.value })}
						type="date"
						value={config.periodEnd}
					/>
				</div>
			</div>

			<div className="rounded-xl bg-white/5 border border-white/10 p-4">
				<p className="text-white/60 text-xs leading-relaxed text-center">
					💡 <strong>Совет:</strong> Выберите период с достаточным количеством записей (минимум 5)
					для создания интересной книги.
				</p>
			</div>
		</div>
	);
}
