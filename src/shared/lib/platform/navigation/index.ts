/**
 * Navigation Platform Adapter
 *
 * Provides cross-platform navigation functionality:
 * - Web: window.history API
 * - Native: @react-navigation/native
 *
 * @module platform/navigation
 */

import { WebNavigationAdapter } from "./navigation.web";

// ✅ PWA + React Native Architecture: ONLY import web module in PWA build
// React Native implementation is in /app/shared/lib/platform/navigation.native.ts

// Re-export types from main navigation file
export type { NavigationAdapter, NavigationOptions } from "../navigation";

/**
 * Universal navigation instance
 * PWA build: ONLY web implementation
 * React Native build: Uses /app/shared/lib/platform/navigation.native.ts
 */
export const navigation = new WebNavigationAdapter();
