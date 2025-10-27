/**
 * Universal Select Component
 * 
 * Cross-platform select/dropdown component
 * - Web: Radix UI Select
 * - Native: React Native Picker / Custom Modal
 * 
 * @module components/ui/universal/UniversalSelect
 */

import { Platform } from '@/shared/lib/platform';

// Import implementations
import * as WebSelect from './Select.web';

// ============================================================================
// PLATFORM SELECT
// ============================================================================

const SelectComponents = Platform.select({
  web: WebSelect,
  native: WebSelect, // Placeholder to avoid bundling native deps
  default: WebSelect,
});

// ============================================================================
// EXPORTS
// ============================================================================

export const UniversalSelect = SelectComponents.Select;
export const SelectUtils = SelectComponents.SelectUtils;

// Export types
export type { SelectProps, SelectOption } from './Select.web';

// Export native for dynamic import
export { default as NativeSelect } from './Select.native';

export default {
  Select: UniversalSelect,
  SelectUtils,
};

