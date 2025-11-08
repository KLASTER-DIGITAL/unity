/**
 * Universal Slider Component - Web Implementation
 *
 * Uses Radix UI Slider for web platform
 *
 * @module components/ui/universal/Slider.web
 */

import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '../utils';

// ============================================================================
// TYPES
// ============================================================================

export type SliderProps = {
	/** Current value(s) */
	value?: number[];
	/** Default value(s) for uncontrolled component */
	defaultValue?: number[];
	/** Callback when value changes */
	onValueChange?: (value: number[]) => void;
	/** Minimum value */
	min?: number;
	/** Maximum value */
	max?: number;
	/** Step increment */
	step?: number;
	/** Disabled state */
	disabled?: boolean;
	/** Custom className */
	className?: string;
	/** Accessibility label */
	'aria-label'?: string;
};

// ============================================================================
// COMPONENT
// ============================================================================

export function Slider({
	value,
	defaultValue = [0],
	onValueChange,
	min = 0,
	max = 100,
	step = 1,
	disabled = false,
	className,
	'aria-label': ariaLabel,
}: SliderProps) {
	return (
		<SliderPrimitive.Root
			aria-label={ariaLabel}
			className={cn('relative flex w-full touch-none select-none items-center', className)}
			defaultValue={defaultValue}
			disabled={disabled}
			max={max}
			min={min}
			onValueChange={onValueChange}
			step={step}
			value={value}
		>
			<SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
				<SliderPrimitive.Range className="absolute h-full bg-primary" />
			</SliderPrimitive.Track>
			{(value || defaultValue).map((_, index) => (
				<SliderPrimitive.Thumb
					className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
					key={index}
				/>
			))}
		</SliderPrimitive.Root>
	);
}

// ============================================================================
// UTILITIES
// ============================================================================

export const SliderUtils = {
	/**
	 * Validate slider props
	 */
	validateProps: (props: SliderProps) => {
		const errors: string[] = [];

		if (props.min !== undefined && props.max !== undefined && props.min >= props.max) {
			errors.push('min must be less than max');
		}

		if (props.step !== undefined && props.step <= 0) {
			errors.push('step must be greater than 0');
		}

		if (props.value && props.defaultValue) {
			errors.push('Cannot use both value and defaultValue');
		}

		return {
			valid: errors.length === 0,
			errors,
		};
	},

	/**
	 * Format slider value for display
	 */
	formatValue: (value: number, decimals = 0) => {
		return value.toFixed(decimals);
	},

	/**
	 * Calculate percentage from value
	 */
	valueToPercentage: (value: number, min: number, max: number) => {
		return ((value - min) / (max - min)) * 100;
	},

	/**
	 * Calculate value from percentage
	 */
	percentageToValue: (percentage: number, min: number, max: number) => {
		return min + (percentage / 100) * (max - min);
	},
};
