/**
 * Animation Hooks
 * 
 * Platform-agnostic hooks for managing animation state.
 */

import { useState, useCallback } from 'react';
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

