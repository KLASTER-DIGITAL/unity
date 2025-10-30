/**
 * Network Status Indicator
 *
 * Dynamic status indicator showing online/syncing/offline state.
 * Displays as a colored dot (🟢🟡🔴) with pulsing animation when syncing.
 *
 * States:
 * - 🟢 Green: Online and synced
 * - 🟡 Yellow: Syncing (with pulsing animation)
 * - 🔴 Red: Offline
 *
 * @author UNITY Team
 * @date 2025-10-28
 */

import { memo } from 'react';
import { useOfflineMode } from '@/shared/lib/offline';

/**
 * Network Status Indicator Component
 *
 * Usage:
 * ```tsx
 * <div className="relative">
 *   <Avatar>...</Avatar>
 *   <NetworkStatusIndicator />
 * </div>
 * ```
 */
export const NetworkStatusIndicator = memo(function NetworkStatusIndicator() {
	const { isOnline, syncInProgress } = useOfflineMode();

	// Determine status color based on online state and sync progress
	const getStatusColor = (): string => {
		if (!isOnline) {
			return 'bg-red-500'; // 🔴 Offline
		}
		if (syncInProgress) {
			return 'bg-yellow-500'; // 🟡 Syncing
		}
		return 'bg-green-500'; // 🟢 Online
	};

	// Determine status label for accessibility
	const getStatusLabel = (): string => {
		if (!isOnline) {
			return 'Offline';
		}
		if (syncInProgress) {
			return 'Синхронизация';
		}
		return 'Online';
	};

	const statusColor = getStatusColor();
	const statusLabel = getStatusLabel();

	return (
		<span
			aria-label={statusLabel}
			className="absolute right-0 bottom-0 z-20 flex h-4 w-4"
			title={statusLabel}
		>
			{/* Pulsing ring - only show when syncing */}
			{syncInProgress && (
				<span
					aria-hidden="true"
					className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-500 opacity-75"
				/>
			)}

			{/* Status dot with white border for visibility */}
			<span
				aria-hidden="true"
				className={`relative inline-flex h-4 w-4 rounded-full ${statusColor} ring-2 ring-white transition-colors duration-300`}
			/>
		</span>
	);
});
