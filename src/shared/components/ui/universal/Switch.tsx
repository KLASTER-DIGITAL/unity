/**
 * Universal Switch Component for UNITY-v2
 *
 * Cross-platform switch that works on both Web and React Native
 * Replaces @radix-ui/react-switch
 *
 * @author UNITY Team
 * @date 2025-01-18
 */

import type React from 'react';
import { useState } from 'react';
import { cn } from '../utils';
import type { FormFieldProps, UniversalEventHandlers } from './types';

/**
 * Switch component props
 */
export interface SwitchProps extends FormFieldProps, UniversalEventHandlers {
	/**
	 * Switch checked state
	 */
	checked?: boolean;

	/**
	 * Default checked state
	 */
	defaultChecked?: boolean;

	/**
	 * Switch size
	 */
	size?: 'sm' | 'md' | 'lg';

	/**
	 * Switch color
	 */
	color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';

	/**
	 * Show labels
	 */
	showLabels?: boolean;

	/**
	 * On label text
	 */
	onLabel?: string;

	/**
	 * Off label text
	 */
	offLabel?: string;

	/**
	 * Change handler
	 */
	onCheckedChange?: (checked: boolean) => void;

	/**
	 * Icon when checked
	 */
	checkedIcon?: React.ReactNode;

	/**
	 * Icon when unchecked
	 */
	uncheckedIcon?: React.ReactNode;
}

/**
 * Web-specific switch implementation
 */
const WebSwitch = ({
	checked,
	defaultChecked = false,
	size = 'md',
	color = 'primary',
	showLabels = false,
	onLabel = 'On',
	offLabel = 'Off',
	disabled = false,
	className,
	onCheckedChange,
	onChange,
	onPress,
	checkedIcon,
	uncheckedIcon,
	testID,
	accessibilityLabel,
	ref,
	...props
}: SwitchProps & { ref?: React.RefObject<HTMLButtonElement | null> }) => {
	const [isChecked, setIsChecked] = useState(checked ?? defaultChecked);

	// Handle change
	const handleChange = () => {
		const newChecked = !isChecked;
		setIsChecked(newChecked);

		if (onCheckedChange) {
			onCheckedChange(newChecked);
		}
		if (onChange) {
			onChange(newChecked);
		}
		if (onPress) {
			onPress();
		}
	};

	// Size styles
	const sizeStyles = {
		sm: {
			switch: 'h-4 w-7',
			thumb: 'h-3 w-3 data-[state=checked]:translate-x-3',
			text: 'text-xs',
		},
		md: {
			switch: 'h-5 w-9',
			thumb: 'h-4 w-4 data-[state=checked]:translate-x-4',
			text: 'text-sm',
		},
		lg: {
			switch: 'h-6 w-11',
			thumb: 'h-5 w-5 data-[state=checked]:translate-x-5',
			text: 'text-base',
		},
	};

	// Color styles
	const colorStyles = {
		primary: 'data-[state=checked]:bg-primary',
		secondary: 'data-[state=checked]:bg-secondary',
		success: 'data-[state=checked]:bg-green-500',
		warning: 'data-[state=checked]:bg-yellow-500',
		error: 'data-[state=checked]:bg-red-500',
	};

	const currentSize = sizeStyles[size];
	const currentColor = colorStyles[color];

	return (
		<div className="flex items-center gap-2">
			{showLabels && !isChecked && (
				<span className={cn('text-muted-foreground', currentSize.text)}>{offLabel}</span>
			)}

			<button
				aria-checked={isChecked}
				aria-label={accessibilityLabel}
				className={cn(
					'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
					'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
					'disabled:cursor-not-allowed disabled:opacity-50',
					'data-[state=unchecked]:bg-input',
					currentSize.switch,
					currentColor,
					className
				)}
				data-state={isChecked ? 'checked' : 'unchecked'}
				data-testid={testID}
				disabled={disabled}
				onClick={handleChange}
				ref={ref}
				role="switch"
				type="button"
				{...props}
			>
				<span
					className={cn(
						'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform',
						'data-[state=unchecked]:translate-x-0',
						currentSize.thumb
					)}
					data-state={isChecked ? 'checked' : 'unchecked'}
				>
					{isChecked && checkedIcon && (
						<span className="flex h-full w-full items-center justify-center">{checkedIcon}</span>
					)}
					{!isChecked && uncheckedIcon && (
						<span className="flex h-full w-full items-center justify-center">{uncheckedIcon}</span>
					)}
				</span>
			</button>

			{showLabels && isChecked && (
				<span className={cn('text-foreground', currentSize.text)}>{onLabel}</span>
			)}
		</div>
	);
};

/**
 * React Native switch implementation (placeholder)
 * @deprecated Not used in PWA build - only for React Native
 */
// @ts-expect-error - Placeholder for React Native, not used in PWA build
const _NativeSwitch = ({
	checked,
	defaultChecked = false,
	size = 'md',
	color = 'primary',
	showLabels = false,
	onLabel = 'On',
	offLabel = 'Off',
	disabled = false,
	onCheckedChange,
	onChange,
	onPress,
	testID,
	accessibilityLabel,
	style,
	ref,
	...props
}: SwitchProps & { ref?: React.RefObject<any | null> }) => {
	// TODO: Implement React Native switch using Switch component
	// This is a placeholder for React Native implementation

	const [isChecked, setIsChecked] = useState(checked ?? defaultChecked);

	const handleChange = () => {
		const newChecked = !isChecked;
		setIsChecked(newChecked);

		if (onCheckedChange) {
			onCheckedChange(newChecked);
		}
		if (onChange) {
			onChange(newChecked);
		}
		if (onPress) {
			onPress();
		}
	};

	// Size dimensions
	const sizeDimensions = {
		sm: { width: 28, height: 16, thumbSize: 12 },
		md: { width: 36, height: 20, thumbSize: 16 },
		lg: { width: 44, height: 24, thumbSize: 20 },
	};

	// Color values
	const colorValues = {
		primary: '#007AFF',
		secondary: '#8E8E93',
		success: '#34C759',
		warning: '#FF9500',
		error: '#FF3B30',
	};

	const dimensions = sizeDimensions[size];
	const activeColor = colorValues[color];

	return (
		<div
			aria-label={accessibilityLabel}
			data-testid={testID}
			ref={ref}
			style={{
				flexDirection: 'row',
				alignItems: 'center',
				gap: 8,
				...style,
			}}
			{...props}
		>
			{showLabels && !isChecked && (
				<span style={{ color: '#8E8E93', fontSize: 14 }}>{offLabel}</span>
			)}

			<div
				onClick={disabled ? undefined : handleChange}
				role="switch"
				style={{
					width: dimensions.width,
					height: dimensions.height,
					borderRadius: dimensions.height / 2,
					backgroundColor: isChecked ? activeColor : '#E5E5EA',
					position: 'relative',
					cursor: disabled ? 'not-allowed' : 'pointer',
					opacity: disabled ? 0.5 : 1,
					transition: 'background-color 0.2s ease',
				}}
				tabIndex={disabled ? -1 : 0}
			>
				<div
					style={{
						width: dimensions.thumbSize,
						height: dimensions.thumbSize,
						borderRadius: dimensions.thumbSize / 2,
						backgroundColor: 'white',
						position: 'absolute',
						top: (dimensions.height - dimensions.thumbSize) / 2,
						left: isChecked
							? dimensions.width -
								dimensions.thumbSize -
								(dimensions.height - dimensions.thumbSize) / 2
							: (dimensions.height - dimensions.thumbSize) / 2,
						transition: 'left 0.2s ease',
						boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
					}}
				/>
			</div>

			{showLabels && isChecked && <span style={{ color: '#000', fontSize: 14 }}>{onLabel}</span>}
		</div>
	);
};

/**
 * Universal Switch component
 *
 * ✅ PWA + React Native Architecture:
 * - PWA build (src/): ONLY web implementation
 * - React Native build (/app/): Uses /app/shared/components/ui/universal/Switch.native.tsx
 */
export const Switch = WebSwitch as typeof WebSwitch & { displayName: string };

Switch.displayName = 'Switch';

/**
 * Switch utilities
 */
export const SwitchUtils = {
	/**
	 * Get switch color value
	 */
	getColorValue: (color: string) => {
		const colors = {
			primary: '#007AFF',
			secondary: '#8E8E93',
			success: '#34C759',
			warning: '#FF9500',
			error: '#FF3B30',
		};
		return colors[color as keyof typeof colors] || colors.primary;
	},

	/**
	 * Get switch size dimensions
	 */
	getSizeDimensions: (size: string) => {
		const sizes = {
			sm: { width: 28, height: 16, thumbSize: 12 },
			md: { width: 36, height: 20, thumbSize: 16 },
			lg: { width: 44, height: 24, thumbSize: 20 },
		};
		return sizes[size as keyof typeof sizes] || sizes.md;
	},

	/**
	 * Validate switch props
	 */
	validateProps: (props: SwitchProps) => {
		const errors: string[] = [];

		if (props.size && !['sm', 'md', 'lg'].includes(props.size)) {
			errors.push(`Invalid size: ${props.size}`);
		}

		if (
			props.color &&
			!['primary', 'secondary', 'success', 'warning', 'error'].includes(props.color)
		) {
			errors.push(`Invalid color: ${props.color}`);
		}

		return {
			valid: errors.length === 0,
			errors,
		};
	},
};

export default Switch;
