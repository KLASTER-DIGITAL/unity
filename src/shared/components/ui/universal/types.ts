/**
 * Universal Component Types for UNITY-v2
 * 
 * Shared types and interfaces for cross-platform components
 * 
 * @author UNITY Team
 * @date 2025-01-18
 */

import { ReactNode } from 'react';

/**
 * Base props for all universal components
 */
export interface UniversalComponentProps {
  /**
   * Component children
   */
  children?: ReactNode;

  /**
   * Custom CSS class name (Web only)
   */
  className?: string;

  /**
   * Custom styles (React Native compatible)
   */
  style?: any;

  /**
   * Test ID for testing
   */
  testID?: string;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;

  /**
   * Accessibility hint
   */
  accessibilityHint?: string;

  /**
   * Accessibility role
   */
  accessibilityRole?: string;

  /**
   * Disabled state
   */
  disabled?: boolean;
}

/**
 * Universal button variants
 */
export type ButtonVariant = 
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link';

/**
 * Universal button sizes
 */
export type ButtonSize = 
  | 'default'
  | 'sm'
  | 'lg'
  | 'icon';

/**
 * Universal input types
 */
export type InputType = 
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search';

/**
 * Universal modal sizes
 */
export type ModalSize = 
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | 'full';

/**
 * Universal animation presets
 */
export type AnimationPreset = 
  | 'fade'
  | 'slide'
  | 'scale'
  | 'bounce'
  | 'none';

/**
 * Universal color scheme
 */
export type ColorScheme = 
  | 'light'
  | 'dark'
  | 'auto';

/**
 * Universal theme tokens
 */
export interface ThemeTokens {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  
  fontWeight: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

/**
 * Platform-specific style mapping
 */
export interface PlatformStyles {
  web?: any;
  native?: any;
  default?: any;
}

/**
 * Universal event handlers
 */
export interface UniversalEventHandlers {
  onPress?: () => void;
  onLongPress?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
}

/**
 * Universal layout props
 */
export interface UniversalLayoutProps {
  flex?: number;
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  padding?: number | string;
  paddingHorizontal?: number | string;
  paddingVertical?: number | string;
  margin?: number | string;
  marginHorizontal?: number | string;
  marginVertical?: number | string;
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
}

/**
 * Universal animation props
 */
export interface UniversalAnimationProps {
  animate?: boolean;
  animationDuration?: number;
  animationDelay?: number;
  animationPreset?: AnimationPreset;
  animationEasing?: string;
}

/**
 * Select option interface
 */
export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  icon?: ReactNode;
  description?: string;
}

/**
 * Form field props
 */
export interface FormFieldProps extends UniversalComponentProps {
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  value?: any;
  defaultValue?: any;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

/**
 * Modal props
 */
export interface ModalProps extends UniversalComponentProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  closable?: boolean;
  backdrop?: boolean;
  animation?: AnimationPreset;
}

/**
 * Toast props
 */
export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

/**
 * Loading state interface
 */
export interface LoadingState {
  loading: boolean;
  error?: string | null;
  data?: any;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Universal component ref interface
 */
export interface UniversalComponentRef {
  focus?: () => void;
  blur?: () => void;
  measure?: () => { width: number; height: number; x: number; y: number };
}

/**
 * Platform detection utilities for components
 */
export interface ComponentPlatformUtils {
  isWeb: boolean;
  isNative: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  hasHover: boolean;
}
