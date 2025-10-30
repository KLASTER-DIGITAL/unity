/**
 * Universal Select Component
 *
 * Cross-platform select/dropdown component
 * - Web: Radix UI Select
 * - Native: React Native Picker / Custom Modal
 *
 * @module components/ui/universal/UniversalSelect
 */

// Import implementations
import * as WebSelect from './Select.web';

// ============================================================================
// PLATFORM SELECT
// ============================================================================

/**
 * ✅ PWA + React Native Architecture:
 * - PWA build (src/): ONLY web implementation
 * - React Native build (/app/): Uses /app/shared/components/ui/universal/Select.native.tsx
 */
const SelectComponents = WebSelect;

// ============================================================================
// EXPORTS
// ============================================================================

export const UniversalSelect = SelectComponents.Select;
export const SelectUtils = SelectComponents.SelectUtils;

// Export types
export type { SelectOption, SelectProps } from './Select.web';

// Note: NativeSelect is NOT exported to avoid bundling react-native in web build
// Native version is loaded dynamically when needed in React Native environment

export default {
  Select: UniversalSelect,
  SelectUtils,
};
