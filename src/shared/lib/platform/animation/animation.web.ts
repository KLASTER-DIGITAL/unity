/**
 * Web Animation Adapter (Framer Motion)
 * 
 * Uses Framer Motion for React Web (PWA).
 */

import React from 'react';
import { motion, AnimatePresence as FramerAnimatePresence } from 'motion/react';
import type { AnimatedViewProps, AnimatedPresenceProps } from './types';

/**
 * Animated View component for Web (Framer Motion)
 */
export const AnimatedView: React.FC<AnimatedViewProps> = ({
  children,
  initial,
  animate,
  exit,
  transition,
  className,
  style,
  onAnimationComplete,
}) => {
  return React.createElement(
    motion.div,
    {
      initial,
      animate,
      exit,
      transition,
      className,
      style,
      onAnimationComplete,
    },
    children
  );
};

/**
 * Animated Presence component for Web (Framer Motion)
 */
export const AnimatedPresence: React.FC<AnimatedPresenceProps> = ({
  children,
  mode = 'wait',
  custom,
}) => {
  return React.createElement(
    FramerAnimatePresence,
    {
      mode,
      custom,
    },
    children
  );
};

/**
 * Create animated component
 */
export const createAnimated = (component: any) => {
  return motion(component);
};

/**
 * Export motion for advanced use cases
 */
export { motion };

