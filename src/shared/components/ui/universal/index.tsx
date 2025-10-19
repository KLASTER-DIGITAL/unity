/**
 * Universal Components for UNITY-v2
 *
 * Cross-platform components that work on both Web and React Native
 *
 * @author UNITY Team
 * @date 2025-01-18
 */

import React, { forwardRef } from 'react';

// Types and interfaces
export * from './types';

// Core components
export { Button, ButtonUtils } from './Button';
export type { ButtonProps } from './Button';

export { Select, SelectUtils } from './Select';
export type { SelectProps } from './Select';

export { Switch, SwitchUtils } from './Switch';
export type { SwitchProps } from './Switch';

export { Modal, ModalUtils } from './Modal';
export type { ExtendedModalProps as ModalProps } from './Modal';

// Re-export common types for convenience
export type {
  UniversalComponentProps,
  UniversalEventHandlers,
  UniversalLayoutProps,
  UniversalAnimationProps,
  FormFieldProps,
  SelectOption,
  ButtonVariant,
  ButtonSize,
  ModalSize,
  AnimationPreset,
  ColorScheme,
  ThemeTokens,
  ToastProps,
  LoadingState,
  ValidationResult
} from './types';

/**
 * Universal component utilities
 */
export const UniversalUtils = {
  /**
   * Validate all component props
   */
  validateAllProps: (componentType: string, props: any) => {
    switch (componentType) {
      case 'Button':
        return ButtonUtils.validateProps(props);
      case 'Select':
        return SelectUtils.validateProps(props);
      case 'Switch':
        return SwitchUtils.validateProps(props);
      case 'Modal':
        return ModalUtils.validateProps(props);
      default:
        return { valid: true, errors: [] };
    }
  },

  /**
   * Get component theme styles
   */
  getThemeStyles: (theme: 'light' | 'dark' = 'light') => {
    const lightTheme = {
      colors: {
        primary: '#007AFF',
        secondary: '#8E8E93',
        background: '#FFFFFF',
        surface: '#F2F2F7',
        text: '#000000',
        textSecondary: '#8E8E93',
        border: '#C7C7CC',
        error: '#FF3B30',
        warning: '#FF9500',
        success: '#34C759',
        info: '#007AFF'
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32
      },
      borderRadius: {
        sm: 4,
        md: 6,
        lg: 8,
        full: 9999
      },
      fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700'
      },
      shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)'
      }
    };

    const darkTheme = {
      ...lightTheme,
      colors: {
        ...lightTheme.colors,
        primary: '#0A84FF',
        background: '#000000',
        surface: '#1C1C1E',
        text: '#FFFFFF',
        textSecondary: '#8E8E93',
        border: '#38383A'
      }
    };

    return theme === 'dark' ? darkTheme : lightTheme;
  },

  /**
   * Create responsive styles
   */
  createResponsiveStyles: (styles: {
    mobile?: any;
    tablet?: any;
    desktop?: any;
  }) => {
    return {
      '@media (max-width: 768px)': styles.mobile || {},
      '@media (min-width: 769px) and (max-width: 1024px)': styles.tablet || {},
      '@media (min-width: 1025px)': styles.desktop || {}
    };
  },

  /**
   * Convert web styles to React Native styles
   */
  convertToNativeStyles: (webStyles: any) => {
    // Basic conversion mapping
    const conversion: Record<string, string> = {
      'background-color': 'backgroundColor',
      'border-color': 'borderColor',
      'border-width': 'borderWidth',
      'border-radius': 'borderRadius',
      'font-size': 'fontSize',
      'font-weight': 'fontWeight',
      'text-align': 'textAlign',
      'padding-top': 'paddingTop',
      'padding-bottom': 'paddingBottom',
      'padding-left': 'paddingLeft',
      'padding-right': 'paddingRight',
      'margin-top': 'marginTop',
      'margin-bottom': 'marginBottom',
      'margin-left': 'marginLeft',
      'margin-right': 'marginRight'
    };

    const nativeStyles: any = {};
    
    Object.entries(webStyles).forEach(([key, value]) => {
      const nativeKey = conversion[key] || key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      nativeStyles[nativeKey] = value;
    });

    return nativeStyles;
  },

  /**
   * Generate accessibility props
   */
  generateA11yProps: (props: {
    label?: string;
    hint?: string;
    role?: string;
    state?: string;
  }) => {
    return {
      accessibilityLabel: props.label,
      accessibilityHint: props.hint,
      accessibilityRole: props.role,
      accessibilityState: props.state ? { [props.state]: true } : undefined
    };
  }
};

/**
 * Component factory for creating universal components
 */
export const createUniversalComponent = <T extends UniversalComponentProps>(
  name: string,
  webComponent: React.ComponentType<T>,
  nativeComponent: React.ComponentType<T>
) => {
  const UniversalComponent = Platform.select({
    web: webComponent,
    native: nativeComponent,
    default: webComponent
  });

  UniversalComponent.displayName = name;
  return UniversalComponent;
};

/**
 * HOC for adding universal props to existing components
 */
export const withUniversalProps = <T extends object>(
  Component: React.ComponentType<T>
) => {
  return React.forwardRef<any, T & UniversalComponentProps>((props, ref) => {
    const { testID, accessibilityLabel, accessibilityHint, accessibilityRole, ...restProps } = props;
    
    const a11yProps = UniversalUtils.generateA11yProps({
      label: accessibilityLabel,
      hint: accessibilityHint,
      role: accessibilityRole
    });

    return (
      <Component
        ref={ref}
        data-testid={testID}
        {...a11yProps}
        {...(restProps as T)}
      />
    );
  });
};

/**
 * Hook for using universal theme
 */
export const useUniversalTheme = (colorScheme: ColorScheme = 'auto') => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    if (colorScheme === 'auto') {
      // Auto-detect system theme
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setTheme(mediaQuery.matches ? 'dark' : 'light');
      
      const handleChange = (e: MediaQueryListEvent) => {
        setTheme(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setTheme(colorScheme);
    }
  }, [colorScheme]);

  return {
    theme,
    themeStyles: UniversalUtils.getThemeStyles(theme),
    setTheme
  };
};

// Platform detection for components
import { Platform } from '../../../lib/platform';
import React from 'react';
