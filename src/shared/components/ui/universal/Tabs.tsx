/**
 * Universal Tabs Component
 *
 * Cross-platform tabs component
 * - Web: Radix UI Tabs
 * - Native: React Native Pressable + View
 *
 * @module components/ui/universal/Tabs
 */

// Import web implementation
import * as WebTabs from './Tabs.web';

/**
 * ✅ PWA + React Native Architecture:
 * - PWA build (src/): ONLY web implementation
 * - React Native build (/app/): Uses /app-shared/components/ui/universal/Tabs.native.tsx
 */
const platformTabs = WebTabs.Tabs;
const platformTabsUtils = WebTabs.TabsUtils;

/**
 * Universal Tabs component
 */
export const Tabs = platformTabs;

/**
 * Tabs utilities
 */
export const TabsUtils = platformTabsUtils;

/**
 * Export types
 */
export type { TabItem, TabsProps } from './Tabs.web';

/**
 * Default export
 */
export default {
	Tabs,
	TabsUtils,
};
