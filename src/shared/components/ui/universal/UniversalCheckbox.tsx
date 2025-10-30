/**
 * Universal Checkbox Component
 *
 * Cross-platform checkbox component
 * - Web: Radix UI Checkbox
 * - Native: Custom TouchableOpacity with checkmark
 *
 * @module components/ui/universal/UniversalCheckbox
 */

// Import implementations
import * as WebCheckbox from "./Checkbox.web";

// ============================================================================
// PLATFORM SELECT
// ============================================================================

/**
 * ✅ PWA + React Native Architecture:
 * - PWA build (src/): ONLY web implementation
 * - React Native build (/app/): Uses /app/shared/components/ui/universal/Checkbox.native.tsx
 */
const CheckboxComponents = WebCheckbox;

// ============================================================================
// EXPORTS
// ============================================================================

export const UniversalCheckbox = CheckboxComponents.Checkbox;
export const CheckboxUtils = CheckboxComponents.CheckboxUtils;

// Export types
export type { CheckboxProps } from "./Checkbox.web";

// Note: NativeCheckbox is NOT exported to avoid bundling react-native in web build
// Native version is loaded dynamically when needed in React Native environment

export default {
	Checkbox: UniversalCheckbox,
	CheckboxUtils,
};
