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

import { motion } from 'motion/react';
import type { RefObject } from 'react';
import { cn } from '../utils';
import type { UniversalComponentProps, UniversalEventHandlers } from './types';

/**
 * Pressable component props
 */
export interface PressableProps extends UniversalComponentProps, UniversalEventHandlers {
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
const WebPressable = ({
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
  ref,
  ...props
}: PressableProps & { ref?: RefObject<HTMLDivElement | null> }) => {
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
      aria-disabled={disabled}
      aria-label={ariaLabel || accessibilityLabel}
      className={cn(
        'cursor-pointer select-none',
        disabled && 'pointer-events-none cursor-not-allowed opacity-50',
        className
      )}
      data-testid={testID}
      onClick={handleClick}
      onMouseDown={() => {
        handleMouseDown();
        handleLongPressStart();
      }}
      onMouseLeave={handleLongPressEnd}
      onMouseUp={() => {
        handleMouseUp();
        handleLongPressEnd();
      }}
      onTouchEnd={() => {
        onPressOut?.();
        handleLongPressEnd();
      }}
      onTouchStart={() => {
        onPressIn?.();
        handleLongPressStart();
      }}
      ref={ref}
      role={role}
      style={style}
      tabIndex={disabled ? -1 : tabIndex}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      whileTap={{ scale: disabled ? 1 : pressScale }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Universal Pressable component
 *
 * ✅ PWA + React Native Architecture:
 * - PWA build (src/): ONLY web implementation (Framer Motion)
 * - React Native build (/app/): Uses /app/shared/components/ui/universal/Pressable.native.tsx (Pressable + Reanimated)
 */
export const Pressable = WebPressable as typeof WebPressable & { displayName: string };

Pressable.displayName = 'Pressable';

export default Pressable;
