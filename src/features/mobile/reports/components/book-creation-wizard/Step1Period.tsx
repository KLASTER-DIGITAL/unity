/**
 * Step 1: Period Selection
 * ✅ FIX: Улучшенный UI с Popover + Calendar для выбора дат
 */

import { Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { cn } from '@/shared/components/ui/utils';
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

	const [startDateOpen, setStartDateOpen] = useState(false);
	const [endDateOpen, setEndDateOpen] = useState(false);

	const startDate = config.periodStart ? new Date(config.periodStart) : undefined;
	const endDate = config.periodEnd ? new Date(config.periodEnd) : undefined;
	const maxDate = new Date();
	const minEndDate = config.periodStart ? new Date(config.periodStart) : undefined;

	return (
		<div className="space-y-6 max-w-full">
			{/* Book Type Selection (Premium only) */}
			{isPremium && (
				<div className="w-full">
					<div className="block text-sm font-semibold mb-3 text-foreground">Тип книги</div>
					<div className="flex flex-wrap gap-2">
						<Button
							onClick={() => handleTypeChange('month')}
							size="sm"
							variant={config.type === 'month' ? 'default' : 'outline'}
							className={cn(
								'flex-1 min-w-[80px] max-w-[120px]',
								config.type === 'month'
									? 'bg-primary text-primary-foreground hover:bg-primary/90'
									: 'bg-card text-foreground border-border hover:bg-accent'
							)}
						>
							Месяц
						</Button>
						<Button
							onClick={() => handleTypeChange('quarter')}
							size="sm"
							variant={config.type === 'quarter' ? 'default' : 'outline'}
							className={cn(
								'flex-1 min-w-[80px] max-w-[120px]',
								config.type === 'quarter'
									? 'bg-primary text-primary-foreground hover:bg-primary/90'
									: 'bg-card text-foreground border-border hover:bg-accent'
							)}
						>
							Квартал
						</Button>
						<Button
							onClick={() => handleTypeChange('year')}
							size="sm"
							variant={config.type === 'year' ? 'default' : 'outline'}
							className={cn(
								'flex-1 min-w-[80px] max-w-[120px]',
								config.type === 'year'
									? 'bg-primary text-primary-foreground hover:bg-primary/90'
									: 'bg-card text-foreground border-border hover:bg-accent'
							)}
						>
							Год
						</Button>
						<Button
							onClick={() => handleTypeChange('custom')}
							size="sm"
							variant={config.type === 'custom' ? 'default' : 'outline'}
							className={cn(
								'flex-1 min-w-[80px] max-w-[120px]',
								config.type === 'custom'
									? 'bg-primary text-primary-foreground hover:bg-primary/90'
									: 'bg-card text-foreground border-border hover:bg-accent'
							)}
						>
							Произвольный
						</Button>
					</div>
				</div>
			)}

			{/* Start Date Picker */}
			<div className="w-full">
				<label className="block text-sm font-semibold mb-3 text-foreground">Начало периода</label>
				<Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className={cn(
								'w-full justify-start text-left font-normal',
								!startDate && 'text-muted-foreground'
							)}
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{startDate ? (
								<span>
									{startDate.toLocaleDateString('ru-RU', {
										day: '2-digit',
										month: '2-digit',
										year: 'numeric',
									})}
								</span>
							) : (
								<span>Выберите дату</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							mode="single"
							selected={startDate}
							onSelect={(date) => {
								if (date) {
									onConfigChange({ periodStart: date.toISOString().split('T')[0] });
									setStartDateOpen(false);
								}
							}}
							disabled={(date) => date > maxDate || (endDate ? date > endDate : false)}
							initialFocus
						/>
					</PopoverContent>
				</Popover>
			</div>

			{/* End Date Picker */}
			<div className="w-full">
				<label className="block text-sm font-semibold mb-3 text-foreground">Конец периода</label>
				<Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className={cn(
								'w-full justify-start text-left font-normal',
								!endDate && 'text-muted-foreground'
							)}
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{endDate ? (
								<span>
									{endDate.toLocaleDateString('ru-RU', {
										day: '2-digit',
										month: '2-digit',
										year: 'numeric',
									})}
								</span>
							) : (
								<span>Выберите дату</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							mode="single"
							selected={endDate}
							onSelect={(date) => {
								if (date) {
									onConfigChange({ periodEnd: date.toISOString().split('T')[0] });
									setEndDateOpen(false);
								}
							}}
							disabled={(date) => date > maxDate || (minEndDate ? date < minEndDate : false)}
							initialFocus
						/>
					</PopoverContent>
				</Popover>
			</div>

			<div className="rounded-xl bg-muted/50 border border-border p-4">
				<p className="text-muted-foreground text-xs leading-relaxed text-center">
					💡 <strong className="text-foreground">Совет:</strong> Выберите период с достаточным
					количеством записей (минимум 5) для создания интересной книги.
				</p>
			</div>
		</div>
	);
}
