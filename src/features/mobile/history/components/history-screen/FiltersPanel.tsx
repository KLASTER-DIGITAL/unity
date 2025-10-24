import { motion, AnimatePresence } from "motion/react";

interface FiltersPanelProps {
  showFilters: boolean;
  categories: string[];
  selectedCategory: string | null;
  selectedSentiment: string | null;
  onCategoryChange: (category: string | null) => void;
  onSentimentChange: (sentiment: string | null) => void;
}

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
  onSentimentChange
}: FiltersPanelProps) {
  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-card border-b border-border overflow-hidden transition-colors duration-300"
        >
          <div className="px-6 py-4">
            {/* Categories */}
            <div className="mb-4" data-testid="category-filter">
              <p className="!text-[13px] !font-medium text-muted-foreground mb-2">
                Категория
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => onCategoryChange(null)}
                  className={`px-3 py-1.5 rounded-[8px] !text-[13px] transition-colors ${
                    !selectedCategory
                      ? 'bg-accent text-white'
                      : 'bg-muted text-foreground hover:bg-accent/10'
                  }`}
                >
                  Все
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => onCategoryChange(cat)}
                    className={`px-3 py-1.5 rounded-[8px] !text-[13px] transition-colors ${
                      selectedCategory === cat
                        ? 'bg-accent text-white'
                        : 'bg-muted text-foreground hover:bg-accent/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Sentiment */}
            <div>
              <p className="!text-[13px] !font-medium text-muted-foreground mb-2">
                Настроение
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onSentimentChange(null)}
                  className={`px-3 py-1.5 rounded-[8px] !text-[13px] transition-colors ${
                    !selectedSentiment
                      ? 'bg-accent text-white'
                      : 'bg-muted text-foreground hover:bg-accent/10'
                  }`}
                >
                  Все
                </button>
                <button
                  onClick={() => onSentimentChange('positive')}
                  className={`px-3 py-1.5 rounded-[8px] !text-[13px] transition-colors ${
                    selectedSentiment === 'positive'
                      ? 'bg-green-500 text-white'
                      : 'bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20'
                  }`}
                >
                  Позитив
                </button>
                <button
                  onClick={() => onSentimentChange('neutral')}
                  className={`px-3 py-1.5 rounded-[8px] !text-[13px] transition-colors ${
                    selectedSentiment === 'neutral'
                      ? 'bg-primary text-white'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
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

