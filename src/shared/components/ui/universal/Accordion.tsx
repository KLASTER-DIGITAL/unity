/**
 * Universal Accordion Component
 *
 * Cross-platform accordion component
 * - Web: Radix UI Accordion
 * - Native: React Native Pressable + Animated
 *
 * @module components/ui/universal/Accordion
 */

// Import web implementation
import * as WebAccordion from './Accordion.web';

/**
 * ✅ PWA + React Native Architecture:
 * - PWA build (src/): ONLY web implementation
 * - React Native build (/app/): Uses /app-shared/components/ui/universal/Accordion.native.tsx
 */
const platformAccordion = WebAccordion.Accordion;
const platformAccordionUtils = WebAccordion.AccordionUtils;

/**
 * Universal Accordion component
 */
export const Accordion = platformAccordion;

/**
 * Accordion utilities
 */
export const AccordionUtils = platformAccordionUtils;

/**
 * Export types
 */
export type { AccordionItem, AccordionProps } from './Accordion.web';

/**
 * Default export
 */
export default {
	Accordion,
	AccordionUtils,
};
