/**
 * Native Animation Adapter (React Native Reanimated)
 * 
 * Uses React Native Reanimated for React Native.
 * 
 * NOTE: This is a PLACEHOLDER implementation for future React Native migration.
 * Will be implemented in Q3 2025 when migrating to React Native Expo.
 */

import React from 'react';
import type { AnimatedViewProps, AnimatedPresenceProps } from './types';

/**
 * Animated View component for React Native (Reanimated)
 * 
 * TODO: Implement with React Native Reanimated when migrating to RN
 */
export const AnimatedView: React.FC<AnimatedViewProps> = ({
  children,
  initial: _initial,
  animate: _animate,
  exit: _exit,
  transition: _transition,
  className,
  style,
  onAnimationComplete: _onAnimationComplete,
}) => {
  // PLACEHOLDER: Return children without animation for now
  // Will be replaced with Reanimated implementation
  console.warn('AnimatedView.native: Not implemented yet. Using fallback.');
  
  return React.createElement(
    'div',
    {
      className,
      style,
    },
    children
  );
};

/**
 * Animated Presence component for React Native
 * 
 * TODO: Implement with React Native Reanimated when migrating to RN
 */
export const AnimatedPresence: React.FC<AnimatedPresenceProps> = ({
  children,
  mode: _mode,
  custom: _custom,
}) => {
  // PLACEHOLDER: Return children without animation for now
  console.warn('AnimatedPresence.native: Not implemented yet. Using fallback.');
  
  return React.createElement(React.Fragment, {}, children);
};

/**
 * Create animated component
 * 
 * TODO: Implement with Reanimated.createAnimatedComponent
 */
export const createAnimated = (component: any) => {
  console.warn('createAnimated.native: Not implemented yet. Using fallback.');
  return component;
};

/**
 * Export placeholder for motion
 */
export const motion = {
  div: 'div',
  span: 'span',
  button: 'button',
} as any;

