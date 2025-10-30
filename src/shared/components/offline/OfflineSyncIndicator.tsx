/**
 * Offline Sync Indicator
 *
 * Shows pending offline entries and sync status.
 * Displays at the top of the screen when there are pending syncs.
 */

import { AlertCircle, Cloud, CloudOff, RefreshCw, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import {
	deleteFailedEntry,
	getPendingEntries,
	retryFailedEntry,
	syncPendingEntries,
} from "@/shared/lib/offline/backgroundSync";
import type { PendingEntry } from "@/shared/lib/offline/indexedDB";

type OfflineSyncIndicatorProps = {
	userId: string;
};

export function OfflineSyncIndicator({ userId }: OfflineSyncIndicatorProps) {
	const [isOnline, setIsOnline] = useState(navigator.onLine);
	const [pendingEntries, setPendingEntries] = useState<PendingEntry[]>([]);
	const [isSyncing, setIsSyncing] = useState(false);
	const [showDetails, setShowDetails] = useState(false);

	// Load pending entries
	const loadPendingEntries = async () => {
		try {
			const entries = await getPendingEntries(userId);
			setPendingEntries(entries);
		} catch (error) {
			console.error(
				"[OfflineSyncIndicator] Failed to load pending entries:",
				error,
			);
		}
	};

	// Handle online/offline events
	useEffect(() => {
		const handleOnline = () => {
			setIsOnline(true);
			loadPendingEntries();
		};

		const handleOffline = () => {
			setIsOnline(false);
		};

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		// Load initial pending entries
		loadPendingEntries();

		// Listen for sync events from Service Worker
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.addEventListener("message", (event) => {
				if (
					event.data.type === "ENTRY_SYNCED" ||
					event.data.type === "ENTRY_SYNC_FAILED"
				) {
					loadPendingEntries();
				}
			});
		}

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, [
		// Load initial pending entries
		loadPendingEntries,
	]);

	// Manual sync
	const handleManualSync = async () => {
		if (!isOnline) {
			return;
		}

		setIsSyncing(true);
		try {
			await syncPendingEntries();
			await loadPendingEntries();
		} catch (error) {
			console.error("[OfflineSyncIndicator] Manual sync failed:", error);
		} finally {
			setIsSyncing(false);
		}
	};

	// Retry failed entry
	const handleRetry = async (entryId: string) => {
		try {
			await retryFailedEntry(entryId);
			await loadPendingEntries();
		} catch (error) {
			console.error("[OfflineSyncIndicator] Retry failed:", error);
		}
	};

	// Delete failed entry
	const handleDelete = async (entryId: string) => {
		try {
			await deleteFailedEntry(entryId);
			await loadPendingEntries();
		} catch (error) {
			console.error("[OfflineSyncIndicator] Delete failed:", error);
		}
	};

	const pendingCount = pendingEntries.filter(
		(e) => e.syncStatus === "pending",
	).length;
	const failedCount = pendingEntries.filter(
		(e) => e.syncStatus === "failed",
	).length;
	const syncingCount = pendingEntries.filter(
		(e) => e.syncStatus === "syncing",
	).length;

	// Don't show if no pending entries
	if (pendingEntries.length === 0) {
		return null;
	}

	return (
		<AnimatePresence>
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="fixed top-0 right-0 left-0 z-50 bg-linear-to-r from-blue-500 to-purple-500 text-white shadow-lg"
				exit={{ opacity: 0, y: -20 }}
				initial={{ opacity: 0, y: -20 }}
			>
				<div className="mx-auto max-w-md px-4 py-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							{isOnline ? (
								<Cloud className="h-5 w-5" />
							) : (
								<CloudOff className="h-5 w-5" />
							)}

							<div className="flex flex-col">
								<span className="font-medium text-sm">
									{isOnline ? "Синхронизация..." : "Вы офлайн"}
								</span>
								<span className="text-xs opacity-90">
									{pendingCount > 0 && `${pendingCount} записей ожидают`}
									{syncingCount > 0 && ` • ${syncingCount} синхронизируются`}
									{failedCount > 0 && ` • ${failedCount} ошибок`}
								</span>
							</div>
						</div>

						<div className="flex items-center gap-2">
							{isOnline && (
								<button
									className="rounded-lg p-2 transition-colors duration-300 hover:bg-muted/20 disabled:opacity-50"
									disabled={isSyncing}
									onClick={handleManualSync}
								>
									<RefreshCw
										className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
									/>
								</button>
							)}

							<button
								className="rounded-lg p-2 transition-colors duration-300 hover:bg-muted/20"
								onClick={() => setShowDetails(!showDetails)}
							>
								{showDetails ? (
									<X className="h-4 w-4" />
								) : (
									<AlertCircle className="h-4 w-4" />
								)}
							</button>
						</div>
					</div>

					{/* Details panel */}
					<AnimatePresence>
						{showDetails && (
							<motion.div
								animate={{ height: "auto", opacity: 1 }}
								className="mt-3 space-y-2 overflow-hidden"
								exit={{ height: 0, opacity: 0 }}
								initial={{ height: 0, opacity: 0 }}
							>
								{pendingEntries.map((entry) => (
									<div
										className="rounded-lg bg-muted/10 p-3 backdrop-blur-sm transition-colors duration-300"
										key={entry.id}
									>
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0 flex-1">
												<p className="truncate font-medium text-sm">
													{entry.text.substring(0, 50)}
													{entry.text.length > 50 && "..."}
												</p>
												<div className="mt-1 flex items-center gap-2">
													{entry.syncStatus === "pending" && (
														<span className="flex items-center gap-1 text-xs opacity-75">
															<Cloud className="h-3 w-3" />
															Ожидает
														</span>
													)}
													{entry.syncStatus === "syncing" && (
														<span className="flex items-center gap-1 text-xs opacity-75">
															<RefreshCw className="h-3 w-3 animate-spin" />
															Синхронизация...
														</span>
													)}
													{entry.syncStatus === "failed" && (
														<span className="flex items-center gap-1 text-xs opacity-75">
															<AlertCircle className="h-3 w-3" />
															Ошибка ({entry.retryCount}/3)
														</span>
													)}
												</div>
												{entry.lastError && (
													<p className="mt-1 text-xs opacity-75">
														{entry.lastError}
													</p>
												)}
											</div>

											{entry.syncStatus === "failed" && (
												<div className="flex gap-1">
													<button
														className="rounded p-1.5 transition-colors duration-300 hover:bg-muted/20"
														onClick={() => handleRetry(entry.id)}
														title="Повторить"
													>
														<RefreshCw className="h-3.5 w-3.5" />
													</button>
													<button
														className="rounded p-1.5 transition-colors duration-300 hover:bg-muted/20"
														onClick={() => handleDelete(entry.id)}
														title="Удалить"
													>
														<X className="h-3.5 w-3.5" />
													</button>
												</div>
											)}
										</div>
									</div>
								))}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}

export default OfflineSyncIndicator;
