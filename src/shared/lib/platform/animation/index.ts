/**
 * Universal Animation System
 *
 * Platform-agnostic animation API that works in both React Web and React Native.
 *
 * Usage:
 * ```tsx
 * import { AnimatedView, AnimatedPresence, AnimationPresets } from '@/shared/lib/platform/animation';
 *
 * // Simple fade in
 * <AnimatedView {...AnimationPresets.fadeIn}>
 *   <div>Content</div>
 * </AnimatedView>
 *
 * // Custom animation
 * <AnimatedView
 *   initial={{ opacity: 0, y: 20 }}
 *   animate={{ opacity: 1, y: 0 }}
 *   transition={{ type: 'spring', stiffness: 300, damping: 30 }}
 * >
 *   <div>Content</div>
 * </AnimatedView>
 *
 * // Screen transitions
 * <AnimatedPresence mode="wait">
 *   {activeScreen === 'home' && (
 *     <AnimatedView key="home" {...ScreenTransitions.slideLeft(direction)}>
 *       <HomeScreen />
 *     </AnimatedView>
 *   )}
 * </AnimatedPresence>
 * ```
 */

// ✅ PWA + React Native Architecture: ONLY import web module in PWA build
// React Native files are in /app/shared/ and NOT bundled by Vite
import * as webModule from "./animation.web";

// Export web implementation (PWA build)
export const AnimatedView = webModule.AnimatedView;
export const AnimatedPresence = webModule.AnimatedPresence;
export const createAnimated = webModule.createAnimated;
export const motion = webModule.motion;

// Export convenience hooks
export { useAnimationState, useMotionValue, useTransform } from "./hooks";
// Export types
export type {
	AnimatedPresenceProps,
	AnimatedViewProps,
	AnimationConfig,
	SpringConfig,
	TimingConfig,
	TransitionConfig,
} from "./types";
// Export presets
export { AnimationPresets, ScreenTransitions } from "./types";
