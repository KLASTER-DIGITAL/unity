/**
 * Universal RadioGroup Component - Native Implementation
 *
 * Uses React Native components for mobile (iOS/Android)
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface RadioGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface RadioGroupProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: RadioGroupOption[];
  disabled?: boolean;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  name?: string;
  required?: boolean;
}

/**
 * RadioGroup Component for React Native
 */
export function RadioGroup({
  value: controlledValue,
  defaultValue,
  onValueChange,
  options,
  disabled = false,
  className: _className,
  orientation = 'vertical',
  name: _name,
  required: _required,
}: RadioGroupProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  
  // Use controlled value if provided, otherwise use uncontrolled
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const handlePress = (optionValue: string) => {
    if (disabled) return;

    const option = options.find(opt => opt.value === optionValue);
    if (option?.disabled) return;

    // Update uncontrolled value
    if (controlledValue === undefined) {
      setUncontrolledValue(optionValue);
    }

    // Call onChange callback
    onValueChange?.(optionValue);
  };

  return (
    <View style={[
      styles.container,
      orientation === 'horizontal' && styles.horizontal
    ]}>
      {options.map((option) => {
        const isSelected = value === option.value;
        const isDisabled = option.disabled || disabled;

        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => handlePress(option.value)}
            disabled={isDisabled}
            style={[
              styles.option,
              orientation === 'horizontal' && styles.optionHorizontal,
              isDisabled && styles.optionDisabled
            ]}
            activeOpacity={0.7}
          >
            {/* Radio Circle */}
            <View style={[
              styles.radioOuter,
              isSelected && styles.radioOuterSelected,
              isDisabled && styles.radioOuterDisabled
            ]}>
              {isSelected && (
                <View style={[
                  styles.radioInner,
                  isDisabled && styles.radioInnerDisabled
                ]} />
              )}
            </View>

            {/* Label and Description */}
            <View style={styles.labelContainer}>
              <Text style={[
                styles.label,
                isDisabled && styles.labelDisabled
              ]}>
                {option.label}
              </Text>
              {option.description && (
                <Text style={[
                  styles.description,
                  isDisabled && styles.descriptionDisabled
                ]}>
                  {option.description}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  horizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
  },
  optionHorizontal: {
    marginRight: 16,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB', // gray-300
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  radioOuterSelected: {
    borderColor: '#007AFF', // iOS blue
  },
  radioOuterDisabled: {
    borderColor: '#E5E7EB', // gray-200
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF', // iOS blue
  },
  radioInnerDisabled: {
    backgroundColor: '#9CA3AF', // gray-400
  },
  labelContainer: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
    color: '#111827', // gray-900
    lineHeight: 24,
  },
  labelDisabled: {
    color: '#9CA3AF', // gray-400
  },
  description: {
    fontSize: 14,
    color: '#6B7280', // gray-500
    lineHeight: 20,
  },
  descriptionDisabled: {
    color: '#D1D5DB', // gray-300
  },
});

/**
 * RadioGroup utilities
 */
export const RadioGroupUtils = {
  /**
   * Validate RadioGroup props
   */
  validateProps: (props: RadioGroupProps) => {
    const errors: string[] = [];

    if (!props.options || props.options.length === 0) {
      errors.push('RadioGroup must have at least one option');
    }

    if (props.options) {
      const values = props.options.map(opt => opt.value);
      const uniqueValues = new Set(values);
      if (values.length !== uniqueValues.size) {
        errors.push('RadioGroup options must have unique values');
      }
    }

    if (props.value && props.defaultValue) {
      errors.push('RadioGroup cannot have both value and defaultValue');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Get selected option
   */
  getSelectedOption: (options: RadioGroupOption[], value?: string) => {
    return options.find(opt => opt.value === value);
  },

  /**
   * Check if value is valid
   */
  isValidValue: (options: RadioGroupOption[], value: string) => {
    return options.some(opt => opt.value === value);
  },
};

