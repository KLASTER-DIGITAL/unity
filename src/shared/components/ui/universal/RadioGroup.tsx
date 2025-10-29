/**
 * Universal RadioGroup Component
 * 
 * Platform-agnostic radio group that works in both React Web and React Native.
 * 
 * Usage:
 * ```tsx
 * import { RadioGroup } from '@/shared/components/ui/universal/RadioGroup';
 * 
 * const options = [
 *   { value: 'option1', label: 'Option 1', description: 'First option' },
 *   { value: 'option2', label: 'Option 2', description: 'Second option' },
 *   { value: 'option3', label: 'Option 3', disabled: true },
 * ];
 * 
 * // Controlled
 * <RadioGroup
 *   value={selectedValue}
 *   onValueChange={setSelectedValue}
 *   options={options}
 * />
 * 
 * // Uncontrolled
 * <RadioGroup
 *   defaultValue="option1"
 *   onValueChange={(value) => console.log(value)}
 *   options={options}
 * />
 * 
 * // Horizontal orientation
 * <RadioGroup
 *   value={selectedValue}
 *   onValueChange={setSelectedValue}
 *   options={options}
 *   orientation="horizontal"
 * />
 * ```
 */

// Import web implementation
import * as WebRadioGroup from './RadioGroup.web';

/**
 * ✅ PWA + React Native Architecture:
 * - PWA build (src/): ONLY web implementation
 * - React Native build (/app/): Uses /app/shared/components/ui/universal/RadioGroup.native.tsx
 */
const platformRadioGroup = WebRadioGroup.RadioGroup;
const platformRadioGroupUtils = WebRadioGroup.RadioGroupUtils;

/**
 * Universal RadioGroup component
 */
export const RadioGroup = platformRadioGroup;

/**
 * RadioGroup utilities
 */
export const RadioGroupUtils = platformRadioGroupUtils;

/**
 * Re-export types
 */
export type { RadioGroupProps, RadioGroupOption } from './RadioGroup.web';

