/**
 * Universal RadioGroup Component - Web Implementation
 *
 * Uses Radix UI for React Web (PWA)
 */

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { CircleIcon } from 'lucide-react';
import { cn } from '../utils';

export type RadioGroupOption = {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
};

export type RadioGroupProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: RadioGroupOption[];
  disabled?: boolean;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  name?: string;
  required?: boolean;
};

/**
 * RadioGroup Component for Web (Radix UI)
 */
export function RadioGroup({
  value,
  defaultValue,
  onValueChange,
  options,
  disabled = false,
  className,
  orientation = 'vertical',
  name,
  required = false,
}: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      className={cn(
        'grid gap-3',
        orientation === 'horizontal' && 'auto-cols-fr grid-flow-col',
        className
      )}
      defaultValue={defaultValue}
      disabled={disabled}
      name={name}
      onValueChange={onValueChange}
      orientation={orientation}
      required={required}
      value={value}
    >
      {options.map((option) => (
        <div className="flex items-center space-x-2" key={option.value}>
          <RadioGroupPrimitive.Item
            className={cn(
              'border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50',
              'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
              'aria-invalid:border-destructive dark:bg-input/30',
              'aspect-square size-4 shrink-0 rounded-full border shadow-xs',
              'outline-none transition-[color,box-shadow] focus-visible:ring-[3px]',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            disabled={option.disabled || disabled}
            id={`radio-${option.value}`}
            value={option.value}
          >
            <RadioGroupPrimitive.Indicator className="relative flex items-center justify-center">
              <CircleIcon className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 size-2 fill-primary" />
            </RadioGroupPrimitive.Indicator>
          </RadioGroupPrimitive.Item>

          <label
            className={cn(
              'cursor-pointer font-medium text-sm leading-none',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              (option.disabled || disabled) && 'cursor-not-allowed opacity-70'
            )}
            htmlFor={`radio-${option.value}`}
          >
            <div>{option.label}</div>
            {option.description && (
              <div className="mt-0.5 font-normal text-muted-foreground text-xs">
                {option.description}
              </div>
            )}
          </label>
        </div>
      ))}
    </RadioGroupPrimitive.Root>
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
      const values = props.options.map((opt) => opt.value);
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
  getSelectedOption: (options: RadioGroupOption[], value?: string) =>
    options.find((opt) => opt.value === value),

  /**
   * Check if value is valid
   */
  isValidValue: (options: RadioGroupOption[], value: string) =>
    options.some((opt) => opt.value === value),
};
