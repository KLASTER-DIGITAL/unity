import { Search } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

export type FilterType = 'all' | 'earned' | 'in-progress';
export type SortType = 'rarity' | 'progress' | 'date' | 'name';

interface AchievementsFiltersProps {
	filter: FilterType;
	onFilterChange: (filter: FilterType) => void;
	sort: SortType;
	onSortChange: (sort: SortType) => void;
	search: string;
	onSearchChange: (search: string) => void;
	earnedCount: number;
	inProgressCount: number;
	totalCount: number;
}

export function AchievementsFilters({
	filter,
	onFilterChange,
	sort,
	onSortChange,
	search,
	onSearchChange,
	earnedCount,
	inProgressCount,
	totalCount,
}: AchievementsFiltersProps) {
	return (
		<div className="mb-6 space-y-4 px-4">
			{/* Filter Tabs */}
			<Tabs value={filter} onValueChange={(value) => onFilterChange(value as FilterType)}>
				<TabsList className="grid w-full grid-cols-3 transition-colors duration-300">
					<TabsTrigger
						value="all"
						className="transition-colors duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
					>
						Все ({totalCount})
					</TabsTrigger>
					<TabsTrigger
						value="earned"
						className="transition-colors duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
					>
						Получено ({earnedCount})
					</TabsTrigger>
					<TabsTrigger
						value="in-progress"
						className="transition-colors duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
					>
						В процессе ({inProgressCount})
					</TabsTrigger>
				</TabsList>
			</Tabs>

			{/* Search and Sort */}
			<div className="flex gap-3">
				{/* Search Input */}
				<div className="relative flex-1">
					<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors duration-300" />
					<Input
						type="text"
						placeholder="Поиск достижений..."
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						className="pl-9 transition-colors duration-300"
					/>
				</div>

				{/* Sort Select */}
				<Select value={sort} onValueChange={(value) => onSortChange(value as SortType)}>
					<SelectTrigger className="w-[140px] transition-colors duration-300">
						<SelectValue placeholder="Сортировка" />
					</SelectTrigger>
					<SelectContent className="transition-colors duration-300">
						<SelectItem value="rarity">По редкости</SelectItem>
						<SelectItem value="progress">По прогрессу</SelectItem>
						<SelectItem value="date">По дате</SelectItem>
						<SelectItem value="name">По названию</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
