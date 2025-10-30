/**
 * Offline Platform Adapter
 *
 * Platform-agnostic offline storage for Web and React Native.
 *
 * Usage:
 * ```typescript
 * import { offlineStorage, mediaStorage, networkAdapter } from '@/shared/lib/platform/offline';
 *
 * // Initialize
 * await offlineStorage.initialize();
 *
 * // Add pending entry
 * await offlineStorage.addPendingEntry(entry);
 *
 * // Check network status
 * const isOnline = await networkAdapter.isOnline();
 * ```
 *
 * @author UNITY Team
 * @date 2025-10-28
 */

// ✅ PWA + React Native Architecture: ONLY import web module in PWA build
// React Native implementation is in /app/shared/lib/platform/offline.native.ts
import { mediaStorage, networkAdapter, offlineStorage } from './offline.web';

// Export types
export type {
	CachedEntry,
	MediaStorageAdapter,
	NetworkAdapter,
	OfflineStorageAdapter,
	PendingEntry,
	SyncQueueItem,
} from './types';

// Export web implementations (PWA build)
export { offlineStorage, mediaStorage, networkAdapter };
