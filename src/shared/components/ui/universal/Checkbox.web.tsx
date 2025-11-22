/**
 * Universal Checkbox Component - Web Implementation
 *
 * Uses Radix UI Checkbox for web platform
 *
 * @module components/ui/universal/Checkbox.web
 */

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';
import type React from 'react';
import { cn } from '../utils';

// ============================================================================
// TYPES
// ============================================================================

export type CheckboxProps = {
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
};

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
	const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (event) => {
		if (disabled) return;
		if (event.key === ' ' || event.code === 'Space') {
			event.preventDefault();
			onCheckedChange?.(checked === true ? false : true);
		}
	};

	return (
		<CheckboxPrimitive.Root
			aria-label={ariaLabel}
			checked={checked}
			className={cn(
				'peer size-4 shrink-0 rounded-[4px] border bg-input-background shadow-xs outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:data-[state=checked]:bg-primary',
				className
			)}
			defaultChecked={defaultChecked}
			disabled={disabled}
			onCheckedChange={onCheckedChange}
			onKeyDown={handleKeyDown}
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
