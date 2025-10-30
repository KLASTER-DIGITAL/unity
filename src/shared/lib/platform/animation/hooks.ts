/**
 * Animation Hooks
 *
 * Platform-agnostic hooks for managing animation state.
 */

import { useMotionValue as useMotionValueWeb, useTransform as useTransformWeb } from 'motion/react';
import { useCallback, useState } from 'react';
import type { AnimationConfig } from './types';

/**
 * Hook for managing animation state
 */
export function useAnimationState(initialState: AnimationConfig = {}) {
  const [animationState, setAnimationState] = useState<AnimationConfig>(initialState);

  const animate = useCallback((newState: AnimationConfig) => {
    setAnimationState(newState);
  }, []);

  const reset = useCallback(() => {
    setAnimationState(initialState);
  }, [initialState]);

  return {
    animationState,
    animate,
    reset,
  };
}

/**
 * Hook for creating a motion value
 * Web: Framer Motion useMotionValue
 * Native: React Native Reanimated useSharedValue (TODO: Q3 2025)
 */
export function useMotionValue(initial: number) {
  // For now, always use web implementation
  // TODO: Add platform detection and native implementation for Q3 2025
  return useMotionValueWeb(initial);
}

/**
 * Hook for transforming a motion value
 * Web: Framer Motion useTransform
 * Native: React Native Reanimated useDerivedValue (TODO: Q3 2025)
 */
export function useTransform(value: any, input: number[], output: number[]) {
  // For now, always use web implementation
  // TODO: Add platform detection and native implementation for Q3 2025
  return useTransformWeb(value, input, output);
}
