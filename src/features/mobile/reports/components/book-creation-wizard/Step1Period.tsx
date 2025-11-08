/**
 * Step 1: Period Selection
 */

import { Calendar } from 'lucide-react';
import { Label } from '@/shared/components/ui/label';
import type { BookConfig } from './types';

type Step1PeriodProps = {
	config: BookConfig;
	onConfigChange: (updates: Partial<BookConfig>) => void;
};

export function Step1Period({ config, onConfigChange }: Step1PeriodProps) {
	return (
		<div className="space-y-4">
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
