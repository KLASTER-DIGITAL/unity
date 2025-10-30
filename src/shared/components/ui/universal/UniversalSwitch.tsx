/**
 * Universal Switch Component
 *
 * Cross-platform switch/toggle component
 * - Web: Radix UI Switch
 * - Native: React Native Switch
 *
 * @module components/ui/universal/UniversalSwitch
 */

// Import implementations
import * as WebSwitch from './Switch.web';

// ============================================================================
// PLATFORM SELECT
// ============================================================================

/**
 * ✅ PWA + React Native Architecture:
 * - PWA build (src/): ONLY web implementation
 * - React Native build (/app/): Uses /app/shared/components/ui/universal/Switch.native.tsx
 */
const SwitchComponents = WebSwitch;

// ============================================================================
// EXPORTS
// ============================================================================

export const UniversalSwitch = SwitchComponents.Switch;
export const SwitchUtils = SwitchComponents.SwitchUtils;

// Export types
export type { SwitchProps } from './Switch.web';

// Note: NativeSwitch is NOT exported to avoid bundling react-native in web build
// Native version is loaded dynamically when needed in React Native environment

export default {
	Switch: UniversalSwitch,
	SwitchUtils,
};
