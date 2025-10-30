import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * Entry Card Skeleton Component
 * Loading placeholder for EntryCard during data fetch
 * Matches the structure of EntryCard for seamless transition
 */
export function EntryCardSkeleton() {
	return (
		<div className="rounded-[16px] border border-border bg-card p-4">
			{/* Header: Category icon + name + date + actions button */}
			<div className="mb-3 flex items-start justify-between">
				<div className="flex items-center gap-2">
					{/* Category icon skeleton */}
					<Skeleton className="h-8 w-8 rounded-[8px]" />

					<div className="space-y-1.5">
						{/* Category name skeleton */}
						<Skeleton className="h-[14px] w-20" />
						{/* Date skeleton */}
						<Skeleton className="h-[12px] w-16" />
					</div>
				</div>

				{/* Actions button skeleton */}
				<Skeleton className="h-6 w-6 rounded-[6px]" />
			</div>

			{/* Entry text skeleton - 2-3 lines */}
			<div className="mb-3 space-y-2">
				<Skeleton className="h-[15px] w-full" />
				<Skeleton className="h-[15px] w-full" />
				<Skeleton className="h-[15px] w-3/4" />
			</div>

			{/* Tags skeleton - sentiment + 2 tags */}
			<div className="flex flex-wrap items-center gap-2">
				<Skeleton className="h-6 w-20 rounded-[6px]" />
				<Skeleton className="h-6 w-16 rounded-[6px]" />
				<Skeleton className="h-6 w-24 rounded-[6px]" />
			</div>
		</div>
	);
}
