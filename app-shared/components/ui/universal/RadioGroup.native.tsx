/**
 * Universal RadioGroup Component - React Native Implementation
 *
 * Uses custom Pressable components for native platform
 *
 * @module components/ui/universal/RadioGroup.native
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

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

// ============================================================================
// COMPONENTS
// ============================================================================

export function RadioGroup({
	value,
	defaultValue,
	onValueChange,
	options,
	disabled = false,
	orientation = 'vertical',
}: RadioGroupProps) {
	const [internalValue, setInternalValue] = React.useState(defaultValue || '');

	const isControlled = value !== undefined;
	const currentValue = isControlled ? value : internalValue;

	const handleSelect = (optionValue: string) => {
		if (disabled) return;

		if (!isControlled) {
			setInternalValue(optionValue);
		}
		onValueChange?.(optionValue);
	};

	return (
		<View style={[styles.container, orientation === 'horizontal' && styles.containerHorizontal]}>
			{options.map((option) => {
				const isSelected = currentValue === option.value;
				const isDisabled = disabled || option.disabled;

				return (
					<Pressable
						accessibilityRole="radio"
						accessibilityState={{
							checked: isSelected,
							disabled: isDisabled,
						}}
						disabled={isDisabled}
						key={option.value}
						onPress={() => handleSelect(option.value)}
						style={({ pressed }) => [
							styles.option,
							isDisabled && styles.optionDisabled,
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
							{isSelected && <View style={styles.radioIndicator} />}
						</View>

						<View style={styles.labelContainer}>
							<Text style={[styles.label, isDisabled && styles.labelDisabled]}>{option.label}</Text>
							{option.description && (
								<Text style={[styles.description, isDisabled && styles.descriptionDisabled]}>
									{option.description}
								</Text>
							)}
						</View>
					</Pressable>
				);
			})}
		</View>
	);
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
	container: {
		gap: 12,
	},
	containerHorizontal: {
		flexDirection: 'row',
	},
	option: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 8,
	},
	optionDisabled: {
		opacity: 0.5,
	},
	optionPressed: {
		opacity: 0.7,
	},
	radio: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: '#d1d5db',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#ffffff',
	},
	radioSelected: {
		borderColor: '#007aff',
	},
	radioDisabled: {
		backgroundColor: '#f3f4f6',
	},
	radioIndicator: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: '#007aff',
	},
	labelContainer: {
		flex: 1,
	},
	label: {
		fontSize: 14,
		fontWeight: '500',
		color: '#111827',
		lineHeight: 20,
	},
	labelDisabled: {
		color: '#9ca3af',
	},
	description: {
		fontSize: 12,
		color: '#6b7280',
		marginTop: 2,
		lineHeight: 16,
	},
	descriptionDisabled: {
		color: '#9ca3af',
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

export default {
	RadioGroup,
	RadioGroupUtils,
};
