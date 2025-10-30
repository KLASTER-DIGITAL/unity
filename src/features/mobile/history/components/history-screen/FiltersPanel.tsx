import { AnimatePresence, motion } from "motion/react";

type FiltersPanelProps = {
	showFilters: boolean;
	categories: string[];
	selectedCategory: string | null;
	selectedSentiment: string | null;
	onCategoryChange: (category: string | null) => void;
	onSentimentChange: (sentiment: string | null) => void;
};

/**
 * Filters Panel Component
 * Category and sentiment filters
 */
export function FiltersPanel({
	showFilters,
	categories,
	selectedCategory,
	selectedSentiment,
	onCategoryChange,
	onSentimentChange,
}: FiltersPanelProps) {
	return (
		<AnimatePresence>
			{showFilters && (
				<motion.div
					animate={{ height: "auto", opacity: 1 }}
					className="overflow-hidden border-border border-b bg-card transition-colors duration-300"
					exit={{ height: 0, opacity: 0 }}
					initial={{ height: 0, opacity: 0 }}
				>
					<div className="px-6 py-4">
						{/* Categories */}
						<div className="mb-4" data-testid="category-filter">
							<p className="mb-2 font-medium! text-[13px]! text-muted-foreground">
								Категория
							</p>
							<div className="flex flex-wrap gap-2">
								<button
									className={`rounded-[8px] px-3 py-1.5 text-[13px]! transition-colors ${
										!selectedCategory
											? "bg-accent text-white"
											: "bg-muted text-foreground hover:bg-accent/10"
									}`}
									onClick={() => onCategoryChange(null)}
								>
									Все
								</button>
								{categories.map((cat) => (
									<button
										className={`rounded-[8px] px-3 py-1.5 text-[13px]! transition-colors ${
											selectedCategory === cat
												? "bg-accent text-white"
												: "bg-muted text-foreground hover:bg-accent/10"
										}`}
										key={cat}
										onClick={() => onCategoryChange(cat)}
									>
										{cat}
									</button>
								))}
							</div>
						</div>

						{/* Sentiment */}
						<div>
							<p className="mb-2 font-medium! text-[13px]! text-muted-foreground">
								Настроение
							</p>
							<div className="flex gap-2">
								<button
									className={`rounded-[8px] px-3 py-1.5 text-[13px]! transition-colors ${
										!selectedSentiment
											? "bg-accent text-white"
											: "bg-muted text-foreground hover:bg-accent/10"
									}`}
									onClick={() => onSentimentChange(null)}
								>
									Все
								</button>
								<button
									className={`rounded-[8px] px-3 py-1.5 text-[13px]! transition-colors ${
										selectedSentiment === "positive"
											? "bg-green-500 text-white"
											: "bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400"
									}`}
									onClick={() => onSentimentChange("positive")}
								>
									Позитив
								</button>
								<button
									className={`rounded-[8px] px-3 py-1.5 text-[13px]! transition-colors ${
										selectedSentiment === "neutral"
											? "bg-primary text-white"
											: "bg-primary/10 text-primary hover:bg-primary/20"
									}`}
									onClick={() => onSentimentChange("neutral")}
								>
									Нейтрал
								</button>
							</div>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
