import { Search, Filter } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  showFilters: boolean;
  activeFiltersCount: number;
  onSearchChange: (query: string) => void;
  onToggleFilters: () => void;
}

/**
 * Search Bar Component
 * Search input and filters toggle button
 */
export function SearchBar({
  searchQuery,
  showFilters: _showFilters,
  activeFiltersCount,
  onSearchChange,
  onToggleFilters
}: SearchBarProps) {
  return (
    <div className="flex gap-3 items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск по записям..."
          className="w-full pl-11 pr-4 py-3 bg-muted border border-border rounded-[12px] text-[15px]! text-foreground placeholder:text-muted-foreground outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Filters Button */}
      <button
        onClick={onToggleFilters}
        className="flex items-center gap-2 px-4 py-3 bg-accent/10 text-accent rounded-[12px] text-[14px]! font-medium! hover:bg-accent/20 transition-colors flex-shrink-0"
      >
        <Filter className="h-5 w-5" strokeWidth={2} />
        {activeFiltersCount > 0 && (
          <span className="bg-accent text-white px-2 py-0.5 rounded-full text-[12px]!">
            {activeFiltersCount}
          </span>
        )}
      </button>
    </div>
  );
}

