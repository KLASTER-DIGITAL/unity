/**
 * Universal Slider Component
 *
 * Cross-platform slider component
 * - Web: Radix UI Slider
 * - Native: @react-native-community/slider
 *
 * @module components/ui/universal/Slider
 */

// Import web implementation
import * as WebSlider from './Slider.web';

/**
 * ✅ PWA + React Native Architecture:
 * - PWA build (src/): ONLY web implementation
 * - React Native build (/app/): Uses /app-shared/components/ui/universal/Slider.native.tsx
 */
const platformSlider = WebSlider.Slider;
const platformSliderUtils = WebSlider.SliderUtils;

/**
 * Universal Slider component
 */
export const Slider = platformSlider;

/**
 * Slider utilities
 */
export const SliderUtils = platformSliderUtils;

/**
 * Export types
 */
export type { SliderProps } from './Slider.web';

/**
 * Default export
 */
export default {
	Slider,
	SliderUtils,
};
