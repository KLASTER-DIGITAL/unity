/**
 * Universal Input Component
 *
 * Cross-platform input component
 * - Web: HTML input with Tailwind CSS
 * - Native: React Native TextInput
 *
 * @module components/ui/universal/Input
 */

// Import web implementation
import * as WebInput from './Input.web';

/**
 * ✅ PWA + React Native Architecture:
 * - PWA build (src/): ONLY web implementation
 * - React Native build (/app/): Uses /app-shared/components/ui/universal/Input.native.tsx
 */
const platformInput = WebInput.Input;
const platformInputUtils = WebInput.InputUtils;

/**
 * Universal Input component
 */
export const Input = platformInput;

/**
 * Input utilities
 */
export const InputUtils = platformInputUtils;

/**
 * Export types
 */
export type { InputProps } from './Input.web';

/**
 * Default export
 */
export default {
	Input,
	InputUtils,
};
