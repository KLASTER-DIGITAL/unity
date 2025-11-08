/**
 * Universal Input Component - Web Implementation
 *
 * Uses HTML input element with Tailwind CSS styling
 *
 * @module components/ui/universal/Input.web
 */

import type React from 'react';
import { cn } from '../utils';

// ============================================================================
// TYPES
// ============================================================================

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
	/** Custom className */
	className?: string;
	/** Input type */
	type?: string;
	/** Error state */
	error?: boolean;
	/** Error message */
	errorMessage?: string;
	/** Left icon */
	leftIcon?: React.ReactNode;
	/** Right icon */
	rightIcon?: React.ReactNode;
};

// ============================================================================
// COMPONENT
// ============================================================================

export function Input({
	className,
	type = 'text',
	error = false,
	errorMessage,
	leftIcon,
	rightIcon,
	...props
}: InputProps) {
	return (
		<div className="relative w-full">
			{/* Left Icon */}
			{leftIcon && (
				<div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
					{leftIcon}
				</div>
			)}

			{/* Input */}
			<input
				aria-invalid={error}
				className={cn(
					// Base styles
					'flex h-10 w-full min-w-0 rounded-lg border px-3 py-2 text-base outline-none transition-[color,box-shadow]',
					// Background & Border
					'border-border bg-muted/50',
					'dark:border-border dark:bg-muted/30',
					// Text & Placeholder
					'text-foreground placeholder:text-muted-foreground',
					// Focus state
					'focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20',
					'focus-visible:bg-background',
					// Selection
					'selection:bg-primary selection:text-primary-foreground',
					// Invalid state
					error &&
						'border-destructive ring-destructive/20 dark:ring-destructive/40 focus-visible:border-destructive focus-visible:ring-destructive/20',
					// Disabled state
					'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
					// File input
					'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm',
					// Responsive
					'md:h-9 md:text-sm',
					// Icon padding
					leftIcon && 'pl-10',
					rightIcon && 'pr-10',
					className
				)}
				data-slot="input"
				type={type}
				{...props}
			/>

			{/* Right Icon */}
			{rightIcon && (
				<div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
					{rightIcon}
				</div>
			)}

			{/* Error Message */}
			{error && errorMessage && <p className="mt-1 text-sm text-destructive">{errorMessage}</p>}
		</div>
	);
}

// ============================================================================
// UTILITIES
// ============================================================================

export const InputUtils = {
	/**
	 * Validate input props
	 */
	validateProps: (props: InputProps) => {
		const errors: string[] = [];

		if (
			props.type &&
			!['text', 'email', 'password', 'number', 'tel', 'url', 'search'].includes(props.type)
		) {
			errors.push(`Invalid input type: ${props.type}`);
		}

		return {
			valid: errors.length === 0,
			errors,
		};
	},

	/**
	 * Format input value
	 */
	formatValue: (value: string, type: string) => {
		switch (type) {
			case 'email':
				return value.toLowerCase().trim();
			case 'tel':
				return value.replace(/[^0-9+\-() ]/g, '');
			case 'number':
				return value.replace(/[^0-9.-]/g, '');
			default:
				return value;
		}
	},
};
