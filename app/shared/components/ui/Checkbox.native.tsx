/**
 * Universal Checkbox Component - Native Implementation
 * 
 * Uses custom TouchableOpacity with checkmark for native platform
 * 
 * @module components/ui/universal/Checkbox.native
 */

import { useState, useEffect } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface CheckboxProps {
  /** Checked state */
  checked?: boolean | 'indeterminate';
  /** Callback when checked state changes */
  onCheckedChange?: (checked: boolean | 'indeterminate') => void;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean | 'indeterminate';
  /** Disabled state */
  disabled?: boolean;
  /** Custom className (ignored in native) */
  className?: string;
  /** Accessibility label */
  'aria-label'?: string;
}

// ============================================================================
// DYNAMIC IMPORTS
// ============================================================================

let View: any = null;
let Text: any = null;
let TouchableOpacity: any = null;
let StyleSheet: any = null;

async function loadReactNative() {
  if (View) return;
  
  try {
    // @ts-expect-error - react-native is not installed in PWA build
    const RN = await import(/* @vite-ignore */ 'react-native');
    View = RN.View;
    Text = RN.Text;
    TouchableOpacity = RN.TouchableOpacity;
    StyleSheet = RN.StyleSheet;
  } catch (error) {
    console.error('Failed to load React Native:', error);
  }
}

// ============================================================================
// COMPONENTS
// ============================================================================

export function Checkbox({
  checked,
  onCheckedChange,
  defaultChecked = false,
  disabled,
  'aria-label': ariaLabel,
}: CheckboxProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const currentChecked = isControlled ? checked : internalChecked;

  useEffect(() => {
    loadReactNative();
  }, []);

  const handlePress = () => {
    if (disabled) return;

    const newValue = currentChecked === 'indeterminate' ? true : !currentChecked;
    
    if (!isControlled) {
      setInternalChecked(newValue);
    }
    onCheckedChange?.(newValue);
  };

  if (!View || !Text || !TouchableOpacity) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      width: 16,
      height: 16,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: currentChecked ? '#007aff' : '#d1d5db',
      backgroundColor: currentChecked ? '#007aff' : '#ffffff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    containerDisabled: {
      opacity: 0.5,
    },
    checkmark: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    indeterminate: {
      width: 8,
      height: 2,
      backgroundColor: '#ffffff',
      borderRadius: 1,
    },
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      accessibilityLabel={ariaLabel}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: currentChecked === true }}
    >
      <View style={[styles.container, disabled && styles.containerDisabled]}>
        {currentChecked === 'indeterminate' ? (
          <View style={styles.indeterminate} />
        ) : currentChecked ? (
          <Text style={styles.checkmark}>✓</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// UTILITIES
// ============================================================================

export const CheckboxUtils = {
  /**
   * Validate Checkbox props
   */
  validateProps: (props: CheckboxProps) => {
    const errors: string[] = [];

    if (props.checked !== undefined && props.defaultChecked !== undefined) {
      errors.push('Checkbox cannot have both checked and defaultChecked');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  Checkbox,
  CheckboxUtils,
};

