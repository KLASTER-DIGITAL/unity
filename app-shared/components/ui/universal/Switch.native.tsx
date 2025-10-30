/**
 * Universal Switch Component - React Native Implementation
 *
 * Uses React Native Switch with iOS-style design
 *
 * @module components/ui/universal/Switch.native
 */

import { useState } from 'react';
import { Switch as RNSwitch } from 'react-native';
import { DesignTokens } from '../../../design-system/tokens';

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
  /** Test ID */
  testID?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Switch({
  checked,
  onCheckedChange,
  defaultChecked = false,
  disabled,
  'aria-label': ariaLabel,
  testID,
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const currentChecked = isControlled ? checked : internalChecked;

  const handleValueChange = (value: boolean) => {
    if (!isControlled) {
      setInternalChecked(value);
    }
    onCheckedChange?.(value);
  };

  return (
    <RNSwitch
      accessibilityLabel={ariaLabel}
      disabled={disabled}
      ios_backgroundColor={DesignTokens.colors.border}
      onValueChange={handleValueChange}
      testID={testID}
      // iOS colors matching web design
      thumbColor="#FFFFFF"
      trackColor={{
        false: DesignTokens.colors.border,
        true: DesignTokens.colors.primary,
      }}
      value={currentChecked}
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

Switch.displayName = 'Switch';

export default {
  Switch,
  SwitchUtils,
};
