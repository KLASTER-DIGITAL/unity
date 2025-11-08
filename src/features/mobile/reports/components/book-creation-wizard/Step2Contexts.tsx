/**
 * Step 2: Contexts Selection
 */

import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
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
			<div className="rounded-lg border border-border bg-muted/50 p-4 text-center transition-colors duration-300">
				<p className="text-muted-foreground">
					📝 У вас пока нет записей с категориями. Создайте записи, чтобы выбрать контексты для
					книги.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<p className="text-muted-foreground text-sm">Выберите категории для включения в книгу</p>
				<div className="flex gap-2">
					<button
						className="text-primary text-xs underline"
						onClick={handleSelectAll}
						type="button"
					>
						Выбрать все
					</button>
					<button
						className="text-muted-foreground text-xs underline"
						onClick={handleClearAll}
						type="button"
					>
						Очистить
					</button>
				</div>
			</div>

			<div className="space-y-2">
				{availableCategories.map((category) => (
					<div
						className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors duration-300 hover:bg-accent"
						key={category}
					>
						<Checkbox
							checked={config.contexts.includes(category)}
							id={`context-${category}`}
							onCheckedChange={() => handleToggleContext(category)}
						/>
						<Label
							className="flex-1 cursor-pointer text-sm font-medium"
							htmlFor={`context-${category}`}
						>
							{category}
						</Label>
					</div>
				))}
			</div>

			<div className="rounded-lg border border-border bg-muted/50 p-3 transition-colors duration-300">
				<p className="text-muted-foreground text-sm">
					💡 <strong>Совет:</strong> Если не выбрать категории, в книгу войдут все записи за
					выбранный период.
				</p>
			</div>
		</div>
	);
}
