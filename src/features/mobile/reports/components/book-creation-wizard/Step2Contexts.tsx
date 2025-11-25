/**
 * Step 2: Contexts Selection
 */

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
			<div className="rounded-xl bg-white/5 border border-white/10 p-6 text-center">
				<p className="text-white/70 text-sm leading-relaxed">
					📝 У вас пока нет записей с категориями. Создайте записи, чтобы выбрать контексты для
					книги.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<p className="text-white/70 text-sm">Выберите категории для включения в книгу</p>
				<div className="flex gap-3">
					<button
						className="text-white/90 text-xs font-medium hover:text-white transition-colors"
						onClick={handleSelectAll}
						type="button"
					>
						Все
					</button>
					<button
						className="text-white/50 text-xs font-medium hover:text-white/70 transition-colors"
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
							className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
								isSelected
									? 'bg-white text-black shadow-lg shadow-white/20'
									: 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 hover:text-white'
							}`}
							key={category}
							onClick={() => handleToggleContext(category)}
							type="button"
						>
							{category}
						</button>
					);
				})}
			</div>

			<div className="rounded-xl bg-white/5 border border-white/10 p-4">
				<p className="text-white/60 text-xs leading-relaxed text-center">
					💡 <strong>Совет:</strong> Если не выбрать категории, в книгу войдут все записи за
					выбранный период.
				</p>
			</div>
		</div>
	);
}
