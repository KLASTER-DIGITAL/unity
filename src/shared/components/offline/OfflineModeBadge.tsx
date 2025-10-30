/**
 * Offline Mode Badge
 *
 * Compact badge showing offline mode status and pending sync count.
 * Displays at the top center of the screen when offline or when there are pending syncs.
 *
 * Features:
 * - Shows "Offline Mode" text with 📴 icon
 * - Displays pending sync count in a pill
 * - Smooth fade in/out animation
 * - Auto-hides when online and no pending syncs
 *
 * @author UNITY Team
 * @date 2025-10-28
 */

import { CloudOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useOfflineMode } from "@/shared/lib/offline";

/**
 * Offline Mode Badge Component
 *
 * Usage:
 * ```tsx
 * <OfflineModeBadge />
 * ```
 */
export function OfflineModeBadge() {
	const { isOnline, pendingCount } = useOfflineMode();

	// Show badge when offline OR when there are pending syncs
	const shouldShow = !isOnline || pendingCount > 0;

	if (!shouldShow) {
		return null;
	}

	return (
		<AnimatePresence>
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="-translate-x-1/2 fixed top-2 left-1/2 z-50 max-w-md"
				exit={{ opacity: 0, y: -10 }}
				initial={{ opacity: 0, y: -10 }}
				transition={{ duration: 0.2, ease: "easeOut" }}
			>
				<div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 font-medium text-muted-foreground text-xs shadow-lg transition-colors duration-300">
					{/* Icon */}
					<CloudOff aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />

					{/* Text */}
					<span className="whitespace-nowrap">Offline Mode</span>

					{/* Pending count pill */}
					{pendingCount > 0 && (
						<motion.span
							animate={{ scale: 1 }}
							aria-label={`${pendingCount} записей ожидают синхронизации`}
							className="rounded-full bg-primary/20 px-1.5 py-0.5 font-semibold text-primary text-xs transition-colors duration-300"
							initial={{ scale: 0 }}
						>
							{pendingCount}
						</motion.span>
					)}
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
