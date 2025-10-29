/**
 * Universal Button Component for UNITY-v2
 * 
 * Cross-platform button that works on both Web and React Native
 * 
 * @author UNITY Team
 * @date 2025-01-18
 */

import React, { forwardRef } from 'react';
import { Platform } from '../../../lib/platform';
import { cn } from '../utils';
import { 
  UniversalComponentProps, 
  UniversalEventHandlers,
  UniversalAnimationProps,
  ButtonVariant,
  ButtonSize
} from './types';

/**
 * Button component props
 */
export interface ButtonProps 
  extends UniversalComponentProps, 
         UniversalEventHandlers, 
         UniversalAnimationProps {
  /**
   * Button variant
   */
  variant?: ButtonVariant;

  /**
   * Button size
   */
  size?: ButtonSize;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Icon to display before text
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon to display after text
   */
  rightIcon?: React.ReactNode;

  /**
   * Full width button
   */
  fullWidth?: boolean;

  /**
   * Button type (web only)
   */
  type?: 'button' | 'submit' | 'reset';

  /**
   * Click handler
   */
  onClick?: () => void;
}

/**
 * Web-specific button implementation
 */
const WebButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    className, 
    variant = 'default', 
    size = 'default',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled = false,
    type = 'button',
    onClick,
    onPress,
    testID,
    accessibilityLabel,
    ...props 
  }, ref) => {
    const handleClick = () => {
      if (onClick) onClick();
      if (onPress) onPress();
    };

    const baseClasses = [
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium',
      'transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      'disabled:pointer-events-none disabled:opacity-50',
      fullWidth && 'w-full'
    ].filter(Boolean).join(' ');

    const variantClasses = {
      default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
      outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline'
    };

    const sizeClasses = {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-10 rounded-md px-8',
      icon: 'h-9 w-9'
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || loading}
        onClick={handleClick}
        data-testid={testID}
        aria-label={accessibilityLabel}
        {...props}
      >
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
        )}
        {!loading && leftIcon && leftIcon}
        {children}
        {!loading && rightIcon && rightIcon}
      </button>
    );
  }
);

/**
 * Universal Button component
 *
 * ✅ PWA + React Native Architecture:
 * - PWA build (src/): ONLY web implementation
 * - React Native build (/app/): Uses /app/shared/components/ui/universal/Button.native.tsx
 */
export const Button = WebButton;

Button.displayName = 'Button';

/**
 * Button utilities
 */
export const ButtonUtils = {
  /**
   * Get button variant styles for custom implementations
   */
  getVariantStyles: (variant: ButtonVariant) => {
    const styles = {
      default: { backgroundColor: '#007AFF', color: 'white' },
      destructive: { backgroundColor: '#FF3B30', color: 'white' },
      outline: { backgroundColor: 'transparent', borderColor: '#C7C7CC', color: '#000' },
      secondary: { backgroundColor: '#F2F2F7', color: '#000' },
      ghost: { backgroundColor: 'transparent', color: '#007AFF' },
      link: { backgroundColor: 'transparent', color: '#007AFF', textDecoration: 'underline' }
    };
    return styles[variant] || styles.default;
  },

  /**
   * Get button size styles for custom implementations
   */
  getSizeStyles: (size: ButtonSize) => {
    const styles = {
      default: { padding: 12, fontSize: 14 },
      sm: { padding: 8, fontSize: 12 },
      lg: { padding: 16, fontSize: 16 },
      icon: { padding: 12, width: 36, height: 36 }
    };
    return styles[size] || styles.default;
  },

  /**
   * Validate button props
   */
  validateProps: (props: ButtonProps) => {
    const errors: string[] = [];
    
    if (props.variant && !['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'].includes(props.variant)) {
      errors.push(`Invalid variant: ${props.variant}`);
    }
    
    if (props.size && !['default', 'sm', 'lg', 'icon'].includes(props.size)) {
      errors.push(`Invalid size: ${props.size}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
};

export default Button;
