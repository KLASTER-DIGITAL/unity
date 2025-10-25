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

// ✅ FIX UNITY-V2-H: Статический импорт вместо require() для production build
import * as webModule from './animation.web';
import * as nativeModule from './animation.native';

// Platform detection
const isWeb = typeof window !== 'undefined' && !('ReactNativeWebView' in window);

// Export platform-specific implementation
export const AnimatedView = isWeb ? webModule.AnimatedView : nativeModule.AnimatedView;
export const AnimatedPresence = isWeb ? webModule.AnimatedPresence : nativeModule.AnimatedPresence;
export const createAnimated = isWeb ? webModule.createAnimated : nativeModule.createAnimated;
export const motion = isWeb ? webModule.motion : nativeModule.motion;

// Export types
export type {
  AnimationConfig,
  SpringConfig,
  TimingConfig,
  TransitionConfig,
  AnimatedViewProps,
  AnimatedPresenceProps,
} from './types';

// Export presets
export { AnimationPresets, ScreenTransitions } from './types';

// Export convenience hooks
export { useAnimationState } from './hooks';

