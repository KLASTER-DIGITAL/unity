/**
 * Universal Pressable Component for UNITY-v2
 * 
 * Cross-platform pressable element with scale animation on press
 * 
 * Web: Uses Framer Motion (motion.div + whileTap)
 * Native: Uses React Native Pressable + Reanimated (TODO: /app/shared/components/ui/universal/Pressable.native.tsx)
 * 
 * @author UNITY Team
 * @date 2025-10-29
 */

import { forwardRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '../utils';
import {
  UniversalComponentProps,
  UniversalEventHandlers,
} from './types';

/**
 * Pressable component props
 */
export interface PressableProps 
  extends UniversalComponentProps, 
         UniversalEventHandlers {
  /**
   * Scale value when pressed (0-1)
   * @default 0.95
   */
  pressScale?: number;

  /**
   * Enable haptic feedback on press (native only)
   * @default false
   */
  hapticFeedback?: boolean;

  /**
   * Press handler
   */
  onPress?: () => void;

  /**
   * Long press handler
   */
  onLongPress?: () => void;

  /**
   * Press in handler (when touch starts)
   */
  onPressIn?: () => void;

  /**
   * Press out handler (when touch ends)
   */
  onPressOut?: () => void;

  /**
   * Role for accessibility
   */
  role?: 'button' | 'link' | 'none';

  /**
   * Tab index for keyboard navigation (web only)
   */
  tabIndex?: number;

  /**
   * Aria label for accessibility
   */
  'aria-label'?: string;
}

/**
 * Web-specific Pressable implementation using Framer Motion
 */
const WebPressable = forwardRef<HTMLDivElement, PressableProps>(
  ({ 
    children, 
    className, 
    style,
    disabled = false,
    pressScale = 0.95,
    onPress,
    onLongPress,
    onPressIn,
    onPressOut,
    testID,
    accessibilityLabel,
    role = 'button',
    tabIndex = 0,
    'aria-label': ariaLabel,
    ...props 
  }, ref) => {
    const handleClick = () => {
      if (!disabled && onPress) {
        onPress();
      }
    };

    const handleMouseDown = () => {
      if (!disabled && onPressIn) {
        onPressIn();
      }
    };

    const handleMouseUp = () => {
      if (!disabled && onPressOut) {
        onPressOut();
      }
    };

    // Long press implementation for web
    let longPressTimer: ReturnType<typeof setTimeout> | null = null;

    const handleLongPressStart = () => {
      if (!disabled && onLongPress) {
        longPressTimer = setTimeout(() => {
          onLongPress();
        }, 500); // 500ms for long press
      }
    };

    const handleLongPressEnd = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    };

    return (
      <motion.div
        ref={ref}
        role={role}
        tabIndex={disabled ? -1 : tabIndex}
        className={cn(
          'cursor-pointer select-none',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        style={style}
        onClick={handleClick}
        onMouseDown={() => {
          handleMouseDown();
          handleLongPressStart();
        }}
        onMouseUp={() => {
          handleMouseUp();
          handleLongPressEnd();
        }}
        onMouseLeave={handleLongPressEnd}
        onTouchStart={() => {
          onPressIn?.();
          handleLongPressStart();
        }}
        onTouchEnd={() => {
          onPressOut?.();
          handleLongPressEnd();
        }}
        whileTap={{ scale: disabled ? 1 : pressScale }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        data-testid={testID}
        aria-label={ariaLabel || accessibilityLabel}
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

/**
 * Universal Pressable component
 *
 * ✅ PWA + React Native Architecture:
 * - PWA build (src/): ONLY web implementation (Framer Motion)
 * - React Native build (/app/): Uses /app/shared/components/ui/universal/Pressable.native.tsx (Pressable + Reanimated)
 */
export const Pressable = WebPressable;

Pressable.displayName = 'Pressable';

export default Pressable;

