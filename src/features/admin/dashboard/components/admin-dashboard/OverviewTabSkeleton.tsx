import { Skeleton } from '@/shared/components/ui/skeleton';

/**
 * Overview Tab Skeleton Component
 * Loading placeholder for admin dashboard overview tab
 * Matches exact layout of OverviewTab for zero CLS
 */
export function OverviewTabSkeleton() {
	return (
		<div className="space-y-6">
			{/* Header with Refresh */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-5 w-64" />
				</div>
				<Skeleton className="h-10 w-28 rounded-md" />
			</div>

			{/* Stats Cards - 4 columns */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6 xl:grid-cols-4">
				{[...Array(4)].map((_, i) => (
					<div
						className="rounded-lg border border-border bg-card p-6 transition-colors duration-300"
						key={i}
					>
						<div className="flex items-center justify-between">
							<div className="space-y-3 flex-1">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-8 w-20" />
								<Skeleton className="h-3 w-24" />
							</div>
							<Skeleton className="h-12 w-12 rounded-full" />
						</div>
					</div>
				))}
			</div>

			{/* Additional Stats - 2 columns */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
				{[...Array(2)].map((_, i) => (
					<div
						className="rounded-lg border border-border bg-card p-6 transition-colors duration-300"
						key={i}
					>
						<div className="flex items-center justify-between">
							<div className="space-y-3 flex-1">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-8 w-20" />
								<Skeleton className="h-3 w-24" />
							</div>
							<Skeleton className="h-12 w-12 rounded-full" />
						</div>
					</div>
				))}
			</div>

			{/* Quick Actions */}
			<div className="rounded-lg border border-border bg-card p-6 transition-colors duration-300">
				<Skeleton className="mb-4 h-6 w-40" />
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					{[...Array(4)].map((_, i) => (
						<Skeleton className="h-24 w-full rounded-md" key={i} />
					))}
				</div>
			</div>

			{/* System Status */}
			<div className="rounded-lg border border-border bg-card p-6 transition-colors duration-300">
				<Skeleton className="mb-4 h-6 w-40" />
				<div className="space-y-3">
					{[...Array(3)].map((_, i) => (
						<div className="flex items-center justify-between" key={i}>
							<div className="flex items-center gap-3">
								<Skeleton className="h-10 w-10 rounded-full" />
								<div className="space-y-2">
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-3 w-24" />
								</div>
							</div>
							<Skeleton className="h-6 w-16 rounded-full" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
