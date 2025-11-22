/**
 * Step 1: Period Selection
 */

import { Calendar } from 'lucide-react';
import { Label } from '@/shared/components/ui/label';
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
		<div className="space-y-4">
			{/* Book Type Selection (Premium only) */}
			{isPremium && (
				<div>
					<Label>Тип книги</Label>
					<div className="mt-2 flex gap-2">
						<Button
							onClick={() => handleTypeChange('month')}
							size="sm"
							variant={config.type === 'month' ? 'default' : 'outline'}
						>
							Месяц
						</Button>
						<Button
							onClick={() => handleTypeChange('quarter')}
							size="sm"
							variant={config.type === 'quarter' ? 'default' : 'outline'}
						>
							Квартал
						</Button>
						<Button
							onClick={() => handleTypeChange('year')}
							size="sm"
							variant={config.type === 'year' ? 'default' : 'outline'}
						>
							Год
						</Button>
						<Button
							onClick={() => handleTypeChange('custom')}
							size="sm"
							variant={config.type === 'custom' ? 'default' : 'outline'}
						>
							Произвольный
						</Button>
					</div>
				</div>
			)}

			<div>
				<Label htmlFor="periodStart">Начало периода</Label>
				<div className="relative mt-2">
					<Calendar
						className="absolute top-3 left-3 h-5 w-5 text-muted-foreground"
						strokeWidth={2}
					/>
					<input
						className="w-full rounded-lg border bg-background py-2 pr-3 pl-10 transition-colors duration-300"
						id="periodStart"
						max={config.periodEnd}
						onChange={(e) => onConfigChange({ periodStart: e.target.value })}
						type="date"
						value={config.periodStart}
					/>
				</div>
			</div>

			<div>
				<Label htmlFor="periodEnd">Конец периода</Label>
				<div className="relative mt-2">
					<Calendar
						className="absolute top-3 left-3 h-5 w-5 text-muted-foreground"
						strokeWidth={2}
					/>
					<input
						className="w-full rounded-lg border bg-background py-2 pr-3 pl-10 transition-colors duration-300"
						id="periodEnd"
						max={new Date().toISOString().split('T')[0]}
						min={config.periodStart}
						onChange={(e) => onConfigChange({ periodEnd: e.target.value })}
						type="date"
						value={config.periodEnd}
					/>
				</div>
			</div>

			<div className="rounded-lg border border-border bg-muted/50 p-3 transition-colors duration-300">
				<p className="text-muted-foreground text-sm">
					💡 <strong>Совет:</strong> Выберите период с достаточным количеством записей (минимум 5)
					для создания интересной книги.
				</p>
			</div>
		</div>
	);
}
