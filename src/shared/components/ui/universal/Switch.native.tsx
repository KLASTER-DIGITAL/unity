/**
 * Universal Switch Component - Native Implementation
 * 
 * Uses React Native Switch for native platform
 * 
 * @module components/ui/universal/Switch.native
 */

import { useState, useEffect } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface SwitchProps {
  /** Checked state */
  checked?: boolean;
  /** Callback when checked state changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
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

let Switch: any = null;

async function loadReactNative() {
  if (Switch) return;
  
  try {
    // @ts-expect-error - react-native is not installed in PWA build
    const RN = await import(/* @vite-ignore */ 'react-native');
    Switch = RN.Switch;
  } catch (error) {
    console.error('Failed to load React Native:', error);
  }
}

// ============================================================================
// COMPONENTS
// ============================================================================

export function UniversalSwitch({
  checked,
  onCheckedChange,
  defaultChecked = false,
  disabled,
  'aria-label': ariaLabel,
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const currentChecked = isControlled ? checked : internalChecked;

  useEffect(() => {
    loadReactNative();
  }, []);

  const handleValueChange = (value: boolean) => {
    if (!isControlled) {
      setInternalChecked(value);
    }
    onCheckedChange?.(value);
  };

  if (!Switch) {
    return null;
  }

  return (
    <Switch
      value={currentChecked}
      onValueChange={handleValueChange}
      disabled={disabled}
      accessibilityLabel={ariaLabel}
      // iOS colors
      trackColor={{ false: '#e5e5ea', true: '#007aff' }}
      thumbColor="#ffffff"
      ios_backgroundColor="#e5e5ea"
    />
  );
}

// ============================================================================
// UTILITIES
// ============================================================================

export const SwitchUtils = {
  /**
   * Validate Switch props
   */
  validateProps: (props: SwitchProps) => {
    const errors: string[] = [];

    if (props.checked !== undefined && props.defaultChecked !== undefined) {
      errors.push('Switch cannot have both checked and defaultChecked');
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
  Switch: UniversalSwitch,
  SwitchUtils,
};

