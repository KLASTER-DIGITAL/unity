/**
 * Universal Button Component - React Native Implementation
 * 
 * Uses React Native Pressable for mobile (iOS/Android)
 */

import React, { forwardRef } from 'react';
import { 
  Pressable, 
  Text, 
  View, 
  ActivityIndicator, 
  StyleSheet,
  ViewStyle,
  TextStyle,
  PressableProps
} from 'react-native';
import type { ButtonProps } from './Button';

/**
 * Native Button implementation using React Native Pressable
 */
export const NativeButton = forwardRef<View, ButtonProps>(
  ({ 
    children, 
    variant = 'default', 
    size = 'default',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled = false,
    onPress,
    onClick,
    testID,
    accessibilityLabel,
    style,
    ...props 
  }, ref) => {
    const handlePress = () => {
      if (onPress) onPress();
      if (onClick) onClick();
    };

    const isDisabled = disabled || loading;

    // Get variant styles
    const variantStyles = getVariantStyles(variant);
    const sizeStyles = getSizeStyles(size);

    return (
      <Pressable
        ref={ref}
        onPress={isDisabled ? undefined : handlePress}
        disabled={isDisabled}
        testID={testID}
        accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        style={({ pressed }) => [
          styles.button,
          variantStyles.container,
          sizeStyles.container,
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          pressed && !isDisabled && styles.pressed,
          style as ViewStyle
        ]}
        {...(props as PressableProps)}
      >
        <View style={styles.content}>
          {loading && (
            <ActivityIndicator 
              size="small" 
              color={variantStyles.text.color}
              style={styles.loader}
            />
          )}
          {!loading && leftIcon && (
            <View style={styles.icon}>{leftIcon}</View>
          )}
          {typeof children === 'string' ? (
            <Text style={[
              styles.text,
              variantStyles.text,
              sizeStyles.text
            ]}>
              {children}
            </Text>
          ) : (
            children
          )}
          {!loading && rightIcon && (
            <View style={styles.icon}>{rightIcon}</View>
          )}
        </View>
      </Pressable>
    );
  }
);

NativeButton.displayName = 'NativeButton';

/**
 * Get variant-specific styles
 */
function getVariantStyles(variant: string) {
  const variants: Record<string, { container: ViewStyle; text: TextStyle }> = {
    default: {
      container: { backgroundColor: '#007AFF' },
      text: { color: '#FFFFFF' }
    },
    destructive: {
      container: { backgroundColor: '#FF3B30' },
      text: { color: '#FFFFFF' }
    },
    outline: {
      container: { 
        backgroundColor: 'transparent', 
        borderWidth: 1, 
        borderColor: '#C7C7CC' 
      },
      text: { color: '#000000' }
    },
    secondary: {
      container: { backgroundColor: '#F2F2F7' },
      text: { color: '#000000' }
    },
    ghost: {
      container: { backgroundColor: 'transparent' },
      text: { color: '#007AFF' }
    },
    link: {
      container: { backgroundColor: 'transparent' },
      text: { color: '#007AFF', textDecorationLine: 'underline' }
    }
  };

  return variants[variant] || variants.default;
}

/**
 * Get size-specific styles
 */
function getSizeStyles(size: string) {
  const sizes: Record<string, { container: ViewStyle; text: TextStyle }> = {
    default: {
      container: { paddingVertical: 12, paddingHorizontal: 16 },
      text: { fontSize: 16 }
    },
    sm: {
      container: { paddingVertical: 8, paddingHorizontal: 12 },
      text: { fontSize: 14 }
    },
    lg: {
      container: { paddingVertical: 16, paddingHorizontal: 24 },
      text: { fontSize: 18 }
    },
    icon: {
      container: { 
        width: 44, 
        height: 44, 
        paddingVertical: 0, 
        paddingHorizontal: 0 
      },
      text: { fontSize: 16 }
    }
  };

  return sizes[size] || sizes.default;
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginRight: 4,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
});

