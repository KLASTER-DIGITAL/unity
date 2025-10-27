/**
 * Universal Select Component - Web Implementation
 * 
 * Uses Radix UI Select for web platform
 * 
 * @module components/ui/universal/Select.web
 */

import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { cn } from '../utils';

// ============================================================================
// TYPES
// ============================================================================

export interface SelectOption {
  /** Option value */
  value: string;
  /** Option label */
  label: string;
  /** Option disabled state */
  disabled?: boolean;
}

export interface SelectProps {
  /** Selected value */
  value?: string;
  /** Callback when value changes */
  onValueChange?: (value: string) => void;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Options array */
  options: SelectOption[];
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'default';
}

// ============================================================================
// COMPONENTS
// ============================================================================

export function Select({
  value,
  onValueChange,
  defaultValue,
  placeholder = 'Select an option',
  options,
  disabled,
  className,
  size = 'default',
}: SelectProps) {
  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      defaultValue={defaultValue}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        className={cn(
          'border-input data-placeholder:text-muted-foreground [&_svg:not([class*=\'text-\'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
          size === 'default' && 'h-9',
          size === 'sm' && 'h-8',
          className
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDownIcon className="size-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border shadow-md transition-colors duration-300'
          )}
          position="popper"
          sideOffset={4}
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={cn(
                  'focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-disabled:pointer-events-none data-disabled:opacity-50 transition-colors duration-200'
                )}
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  <SelectPrimitive.ItemIndicator>
                    <CheckIcon className="h-4 w-4" />
                  </SelectPrimitive.ItemIndicator>
                </span>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

// ============================================================================
// UTILITIES
// ============================================================================

export const SelectUtils = {
  /**
   * Validate Select props
   */
  validateProps: (props: SelectProps) => {
    const errors: string[] = [];

    if (!props.options || props.options.length === 0) {
      errors.push('Select must have at least one option');
    }

    if (props.options) {
      const values = props.options.map(opt => opt.value);
      const uniqueValues = new Set(values);
      if (values.length !== uniqueValues.size) {
        errors.push('Select options must have unique values');
      }
    }

    if (props.value && props.defaultValue) {
      errors.push('Select cannot have both value and defaultValue');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Find option by value
   */
  findOption: (options: SelectOption[], value: string) => {
    return options.find(opt => opt.value === value);
  },

  /**
   * Get option label by value
   */
  getLabel: (options: SelectOption[], value: string) => {
    const option = SelectUtils.findOption(options, value);
    return option?.label || value;
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  Select,
  SelectUtils,
};

