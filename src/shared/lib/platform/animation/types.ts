/**
 * Universal Animation Types
 * 
 * Platform-agnostic animation types that work in both React Web and React Native.
 * Inspired by Framer Motion API but simplified for cross-platform compatibility.
 */

import type { ReactNode } from 'react';

/**
 * Animation configuration
 */
export interface AnimationConfig {
  x?: number | string;
  y?: number | string;
  opacity?: number;
  scale?: number;
  rotate?: number;
  duration?: number;
  delay?: number;
}

/**
 * Spring animation configuration
 */
export interface SpringConfig {
  type: 'spring';
  stiffness?: number;
  damping?: number;
  mass?: number;
  velocity?: number;
}

/**
 * Timing animation configuration
 */
export interface TimingConfig {
  type: 'timing';
  duration?: number;
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

/**
 * Transition configuration
 */
export type TransitionConfig = SpringConfig | TimingConfig;

/**
 * Animated View Props
 */
export interface AnimatedViewProps {
  children: ReactNode;
  initial?: AnimationConfig;
  animate?: AnimationConfig;
  exit?: AnimationConfig;
  transition?: TransitionConfig;
  className?: string;
  style?: React.CSSProperties;
  onAnimationComplete?: () => void;
}

/**
 * Animated Presence Props
 */
export interface AnimatedPresenceProps {
  children: ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
  custom?: any;
}

/**
 * Animation Presets
 */
export const AnimationPresets = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  // Slide animations
  slideInLeft: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  },
  
  slideInRight: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  },
  
  slideInUp: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
  },
  
  slideInDown: {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
  },
  
  // Scale animations
  scaleIn: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  },
  
  // Spring transitions
  springTransition: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  },
  
  smoothTransition: {
    type: 'spring' as const,
    stiffness: 260,
    damping: 20,
  },
  
  fastTransition: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 40,
  },
} as const;

/**
 * Screen transition presets (for MobileApp.tsx)
 */
export const ScreenTransitions = {
  // Slide from right to left (forward navigation)
  slideLeft: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
    transition: AnimationPresets.springTransition,
  },

  // Slide from left to right (backward navigation)
  slideRight: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
    transition: AnimationPresets.springTransition,
  },

  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { type: 'timing' as const, duration: 300 },
  },
} as const;

