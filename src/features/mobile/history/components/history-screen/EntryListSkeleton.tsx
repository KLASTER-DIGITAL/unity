import { EntryCardSkeleton } from './EntryCardSkeleton';

type EntryListSkeletonProps = {
	/**
	 * Number of skeleton cards to display
	 * @default 3
	 */
	count?: number;
};

/**
 * Entry List Skeleton Component
 * Loading placeholder for list of entries during data fetch
 * Shows multiple EntryCardSkeleton components with proper spacing
 */
export function EntryListSkeleton({ count = 3 }: EntryListSkeletonProps) {
	return (
		<div className="space-y-3">
			{Array.from({ length: count }, (_, index) => `skeleton-${count}-${index}`).map((key) => (
				<EntryCardSkeleton key={key} />
			))}
		</div>
	);
}
