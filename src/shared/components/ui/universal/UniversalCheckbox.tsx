/**
 * Universal Checkbox Component
 * 
 * Cross-platform checkbox component
 * - Web: Radix UI Checkbox
 * - Native: Custom TouchableOpacity with checkmark
 * 
 * @module components/ui/universal/UniversalCheckbox
 */

import { Platform } from '@/shared/lib/platform';

// Import implementations
import * as WebCheckbox from './Checkbox.web';

// ============================================================================
// PLATFORM SELECT
// ============================================================================

const CheckboxComponents = Platform.select({
  web: WebCheckbox,
  native: WebCheckbox, // Placeholder to avoid bundling native deps
  default: WebCheckbox,
});

// ============================================================================
// EXPORTS
// ============================================================================

export const UniversalCheckbox = CheckboxComponents.Checkbox;
export const CheckboxUtils = CheckboxComponents.CheckboxUtils;

// Export types
export type { CheckboxProps } from './Checkbox.web';

// Export native for dynamic import
export { default as NativeCheckbox } from './Checkbox.native';

export default {
  Checkbox: UniversalCheckbox,
  CheckboxUtils,
};

