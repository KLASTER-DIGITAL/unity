import { Skeleton } from '@/shared/components/ui/skeleton';

/**
 * Settings Screen Skeleton Component
 * Loading placeholder for SettingsScreen during data fetch
 * Matches exact layout for zero CLS
 */
export function SettingsScreenSkeleton() {
	return (
		<div className="min-h-screen bg-background pb-20">
			{/* Profile Header Skeleton */}
			<div className="border-b border-border bg-card p-4 transition-colors duration-300">
				<div className="flex items-center gap-4">
					{/* Avatar skeleton */}
					<Skeleton className="h-16 w-16 rounded-full" />

					{/* Profile info skeleton */}
					<div className="flex-1 space-y-2">
						<Skeleton className="h-6 w-32" />
						<Skeleton className="h-4 w-48" />
					</div>

					{/* Edit button skeleton */}
					<Skeleton className="h-10 w-10 rounded-lg" />
				</div>
			</div>

			{/* Notifications Section Skeleton */}
			<div className="border-b border-border p-4">
				<Skeleton className="mb-4 h-6 w-40" />
				<div className="space-y-4">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="flex items-center justify-between">
							<div className="flex-1 space-y-1">
								<Skeleton className="h-5 w-32" />
								<Skeleton className="h-4 w-48" />
							</div>
							<Skeleton className="h-6 w-12 rounded-full" />
						</div>
					))}
				</div>
			</div>

			{/* Theme Section Skeleton */}
			<div className="border-b border-border p-4">
				<Skeleton className="mb-4 h-6 w-40" />
				<div className="flex items-center justify-between">
					<div className="flex-1 space-y-1">
						<Skeleton className="h-5 w-32" />
						<Skeleton className="h-4 w-48" />
					</div>
					<Skeleton className="h-10 w-16 rounded-lg" />
				</div>
			</div>

			{/* Security Section Skeleton */}
			<div className="border-b border-border p-4">
				<Skeleton className="mb-4 h-6 w-40" />
				<div className="space-y-4">
					{[1, 2].map((i) => (
						<div key={i} className="flex items-center justify-between">
							<div className="flex-1 space-y-1">
								<Skeleton className="h-5 w-32" />
								<Skeleton className="h-4 w-48" />
							</div>
							<Skeleton className="h-6 w-12 rounded-full" />
						</div>
					))}
				</div>
			</div>

			{/* Offline Section Skeleton */}
			<div className="border-b border-border p-4">
				<Skeleton className="mb-4 h-6 w-40" />
				<div className="flex items-center justify-between">
					<div className="flex-1 space-y-1">
						<Skeleton className="h-5 w-32" />
						<Skeleton className="h-4 w-48" />
					</div>
					<Skeleton className="h-6 w-12 rounded-full" />
				</div>
			</div>

			{/* Categories Section Skeleton */}
			<div className="border-b border-border p-4">
				<Skeleton className="mb-4 h-6 w-40" />
				<Skeleton className="h-10 w-full rounded-lg" />
			</div>

			{/* Additional Section Skeleton */}
			<div className="border-b border-border p-4">
				<Skeleton className="mb-4 h-6 w-40" />
				<div className="space-y-4">
					{[1, 2].map((i) => (
						<div key={i} className="flex items-center justify-between">
							<div className="flex-1 space-y-1">
								<Skeleton className="h-5 w-32" />
								<Skeleton className="h-4 w-48" />
							</div>
							<Skeleton className="h-6 w-20 rounded-lg" />
						</div>
					))}
				</div>
			</div>

			{/* Support Section Skeleton */}
			<div className="p-4">
				<Skeleton className="mb-4 h-6 w-40" />
				<div className="space-y-3">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-10 w-full rounded-lg" />
					))}
				</div>
			</div>
		</div>
	);
}
