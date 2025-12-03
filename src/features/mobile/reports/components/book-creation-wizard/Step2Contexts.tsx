/**
 * Step 2: Contexts Selection
 * ✅ FIX: Исправлена видимость текста для темной темы
 */

import { cn } from '@/shared/components/ui/utils';
import type { BookConfig } from './types';

type Step2ContextsProps = {
	config: BookConfig;
	availableCategories: string[];
	onConfigChange: (updates: Partial<BookConfig>) => void;
};

export function Step2Contexts({ config, availableCategories, onConfigChange }: Step2ContextsProps) {
	const handleToggleContext = (category: string) => {
		const newContexts = config.contexts.includes(category)
			? config.contexts.filter((c) => c !== category)
			: [...config.contexts, category];
		onConfigChange({ contexts: newContexts });
	};

	const handleSelectAll = () => {
		onConfigChange({ contexts: availableCategories });
	};

	const handleClearAll = () => {
		onConfigChange({ contexts: [] });
	};

	if (availableCategories.length === 0) {
		return (
			<div className="rounded-xl bg-muted/50 border border-border p-6 text-center">
				<p className="text-muted-foreground text-sm leading-relaxed">
					📝 У вас пока нет записей с категориями. Создайте записи, чтобы выбрать контексты для
					книги.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between flex-wrap gap-2">
				<p className="text-foreground text-sm">Выберите категории для включения в книгу</p>
				<div className="flex gap-3">
					<button
						className="text-primary text-xs font-medium hover:text-primary/80 transition-colors"
						onClick={handleSelectAll}
						type="button"
					>
						Все
					</button>
					<button
						className="text-muted-foreground text-xs font-medium hover:text-foreground transition-colors"
						onClick={handleClearAll}
						type="button"
					>
						Очистить
					</button>
				</div>
			</div>

			<div className="flex flex-wrap gap-2">
				{availableCategories.map((category) => {
					const isSelected = config.contexts.includes(category);
					return (
						<button
							className={cn(
								'px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
								isSelected
									? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
									: 'bg-muted text-foreground border border-border hover:bg-accent hover:text-accent-foreground'
							)}
							key={category}
							onClick={() => handleToggleContext(category)}
							type="button"
						>
							{category}
						</button>
					);
				})}
			</div>

			<div className="rounded-xl bg-muted/50 border border-border p-4">
				<p className="text-muted-foreground text-xs leading-relaxed text-center">
					💡 <strong className="text-foreground">Совет:</strong> Если не выбрать категории, в книгу
					войдут все записи за выбранный период.
				</p>
			</div>
		</div>
	);
}
