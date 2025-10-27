/**
 * Universal RadioGroup Component - Native Implementation
 * 
 * Uses TouchableOpacity for React Native
 */

import React, { useState } from 'react';

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

  return React.createElement(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: orientation === 'horizontal' ? 'row' : 'column',
        gap: '12px',
      },
    },
    options.map((option) => {
      const isSelected = value === option.value;
      const isDisabled = option.disabled || disabled;

      return React.createElement(
        'div',
        {
          key: option.value,
          onClick: () => !isDisabled && handlePress(option.value),
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            opacity: isDisabled ? 0.5 : 1,
          },
        },
        [
          // Radio button
          React.createElement(
            'div',
            {
              key: 'radio',
              style: {
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                backgroundColor: 'var(--background)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              },
            },
            isSelected && React.createElement(
              'div',
              {
                style: {
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                },
              }
            )
          ),
          
          // Label
          React.createElement(
            'div',
            {
              key: 'label',
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              },
            },
            [
              React.createElement(
                'div',
                {
                  key: 'label-text',
                  style: {
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--foreground)',
                  },
                },
                option.label
              ),
              option.description && React.createElement(
                'div',
                {
                  key: 'description',
                  style: {
                    fontSize: '12px',
                    color: 'var(--muted-foreground)',
                  },
                },
                option.description
              ),
            ]
          ),
        ]
      );
    })
  );
}

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

