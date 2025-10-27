/**
 * Universal Checkbox Component - Web Implementation
 * 
 * Uses Radix UI Checkbox for web platform
 * 
 * @module components/ui/universal/Checkbox.web
 */

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';
import { cn } from '../utils';

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
  /** Custom className */
  className?: string;
  /** Accessibility label */
  'aria-label'?: string;
}

// ============================================================================
// COMPONENTS
// ============================================================================

export function Checkbox({
  checked,
  onCheckedChange,
  defaultChecked,
  disabled,
  className,
  'aria-label': ariaLabel,
}: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      defaultChecked={defaultChecked}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'peer bg-input-background dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 size-4 shrink-0 rounded-[4px] border shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current transition-none">
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
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

