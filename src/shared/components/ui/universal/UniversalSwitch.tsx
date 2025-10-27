/**
 * Universal Switch Component
 * 
 * Cross-platform switch/toggle component
 * - Web: Radix UI Switch
 * - Native: React Native Switch
 * 
 * @module components/ui/universal/UniversalSwitch
 */

import { Platform } from '@/shared/lib/platform';

// Import implementations
import * as WebSwitch from './Switch.web';

// ============================================================================
// PLATFORM SELECT
// ============================================================================

const SwitchComponents = Platform.select({
  web: WebSwitch,
  native: WebSwitch, // Placeholder to avoid bundling native deps
  default: WebSwitch,
});

// ============================================================================
// EXPORTS
// ============================================================================

export const UniversalSwitch = SwitchComponents.Switch;
export const SwitchUtils = SwitchComponents.SwitchUtils;

// Export types
export type { SwitchProps } from './Switch.web';

// Export native for dynamic import
export { default as NativeSwitch } from './Switch.native';

export default {
  Switch: UniversalSwitch,
  SwitchUtils,
};

