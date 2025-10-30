/**
 * Universal RadioGroup Component - React Native Implementation
 *
 * Uses Pressable with custom radio buttons for native platform
 *
 * @module components/ui/universal/RadioGroup.native
 */

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DesignTokens } from '../../../design-system/tokens';

// ============================================================================
// TYPES
// ============================================================================

export interface RadioGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Selected value */
  value?: string;
  /** Callback when value changes */
  onValueChange?: (value: string) => void;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Radio options */
  options: RadioGroupOption[];
  /** Custom className (ignored in native) */
  className?: string;
  /** Accessibility label */
  'aria-label'?: string;
  /** Test ID */
  testID?: string;
  /** Label text */
  label?: string;
  /** Layout direction */
  direction?: 'vertical' | 'horizontal';
}

// ============================================================================
// COMPONENT
// ============================================================================

export function RadioGroup({
  value,
  onValueChange,
  defaultValue,
  disabled,
  options,
  'aria-label': ariaLabel,
  testID,
  label,
  direction = 'vertical',
}: RadioGroupProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handlePress = (optionValue: string) => {
    if (!isControlled) {
      setInternalValue(optionValue);
    }
    onValueChange?.(optionValue);
  };

  return (
    <View style={styles.container} testID={testID}>
      {label && <Text style={styles.groupLabel}>{label}</Text>}
      <View
        accessibilityLabel={ariaLabel || label}
        accessibilityRole="radiogroup"
        style={[
          styles.optionsContainer,
          direction === 'horizontal' && styles.optionsContainerHorizontal,
        ]}
      >
        {options.map((option) => {
          const isSelected = currentValue === option.value;
          const isDisabled = disabled || option.disabled;

          return (
            <Pressable
              accessibilityLabel={option.label}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected, disabled: isDisabled }}
              disabled={isDisabled}
              key={option.value}
              onPress={() => !isDisabled && handlePress(option.value)}
              style={({ pressed }) => [
                styles.option,
                pressed && !isDisabled && styles.optionPressed,
              ]}
            >
              <View
                style={[
                  styles.radio,
                  isSelected && styles.radioSelected,
                  isDisabled && styles.radioDisabled,
                ]}
              >
                {isSelected && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.optionLabel, isDisabled && styles.optionLabelDisabled]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  groupLabel: {
    fontSize: DesignTokens.fontSize.sm,
    fontWeight: DesignTokens.fontWeight.medium,
    color: DesignTokens.colors.text,
    marginBottom: DesignTokens.spacing.sm,
  },
  optionsContainer: {
    gap: DesignTokens.spacing.sm,
  },
  optionsContainerHorizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.sm,
    paddingVertical: DesignTokens.spacing.xs,
  },
  optionPressed: {
    opacity: 0.7,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: DesignTokens.colors.border,
    backgroundColor: DesignTokens.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: DesignTokens.colors.primary,
  },
  radioDisabled: {
    opacity: 0.5,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: DesignTokens.colors.primary,
  },
  optionLabel: {
    fontSize: DesignTokens.fontSize.md,
    color: DesignTokens.colors.text,
  },
  optionLabelDisabled: {
    opacity: 0.5,
  },
});

// ============================================================================
// UTILITIES
// ============================================================================

export const RadioGroupUtils = {
  /**
   * Validate RadioGroup props
   */
  validateProps: (props: RadioGroupProps) => {
    const errors: string[] = [];

    if (props.value !== undefined && props.defaultValue !== undefined) {
      errors.push('RadioGroup cannot have both value and defaultValue');
    }

    if (!props.options || props.options.length === 0) {
      errors.push('RadioGroup must have at least one option');
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

RadioGroup.displayName = 'RadioGroup';

export default {
  RadioGroup,
  RadioGroupUtils,
};
