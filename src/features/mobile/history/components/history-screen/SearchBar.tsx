import { Filter, Search } from 'lucide-react';
import { useTranslation } from '@/shared/lib/i18n';

type SearchBarProps = {
	searchQuery: string;
	showFilters: boolean;
	activeFiltersCount: number;
	onSearchChange: (query: string) => void;
	onToggleFilters: () => void;
};

/**
 * Search Bar Component
 * Search input and filters toggle button
 */
export function SearchBar({
	searchQuery,
	showFilters: _showFilters,
	activeFiltersCount,
	onSearchChange,
	onToggleFilters,
}: SearchBarProps) {
	const { t } = useTranslation();

	return (
		<div className="flex items-center gap-3">
			{/* Search */}
			<div className="relative flex-1">
				<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 text-muted-foreground" />
				<input
					className="w-full rounded-[12px] border border-border bg-muted py-3 pr-4 pl-11 text-[15px]! text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder={t('history.search.placeholder', 'Поиск по записям...')}
					type="text"
					value={searchQuery}
				/>
			</div>

			{/* Filters Button */}
			<button
				className="flex shrink-0 items-center gap-2 rounded-[12px] bg-accent/10 px-4 py-3 font-medium! text-[14px]! text-accent transition-colors hover:bg-accent/20"
				onClick={onToggleFilters}
			>
				<Filter className="h-5 w-5" strokeWidth={2} />
				{activeFiltersCount > 0 && (
					<span className="rounded-full bg-accent px-2 py-0.5 text-[12px]! text-white">
						{activeFiltersCount}
					</span>
				)}
			</button>
		</div>
	);
}
