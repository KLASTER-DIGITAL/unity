/**
 * Universal Select Component - React Native Implementation
 *
 * Uses @react-native-picker/picker for native platform
 *
 * @module components/ui/universal/Select.native
 */

import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { DesignTokens } from '../../../design-system/tokens';

// ============================================================================
// TYPES
// ============================================================================

export interface SelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

export interface SelectProps {
	/** Selected value */
	value?: string;
	/** Callback when value changes */
	onValueChange?: (value: string) => void;
	/** Default value (uncontrolled) */
	defaultValue?: string;
	/** Disabled state */
	disabled?: boolean;
	/** Placeholder text */
	placeholder?: string;
	/** Select options */
	options: SelectOption[];
	/** Custom className (ignored in native) */
	className?: string;
	/** Accessibility label */
	'aria-label'?: string;
	/** Test ID */
	testID?: string;
	/** Label text */
	label?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Select({
	value,
	onValueChange,
	defaultValue,
	disabled,
	placeholder = 'Select an option',
	options,
	'aria-label': ariaLabel,
	testID,
	label,
}: SelectProps) {
	const [internalValue, setInternalValue] = useState(defaultValue || '');
	const isControlled = value !== undefined;
	const currentValue = isControlled ? value : internalValue;

	const handleValueChange = (itemValue: string) => {
		if (!isControlled) {
			setInternalValue(itemValue);
		}
		onValueChange?.(itemValue);
	};

	return (
		<View style={styles.container}>
			{label && <Text style={styles.label}>{label}</Text>}
			<View style={[styles.pickerContainer, disabled && styles.pickerContainerDisabled]}>
				<Picker
					accessibilityLabel={ariaLabel || label}
					enabled={!disabled}
					itemStyle={styles.pickerItem}
					onValueChange={handleValueChange}
					selectedValue={currentValue}
					style={styles.picker}
					testID={testID}
				>
					{placeholder && !currentValue && (
						<Picker.Item
							color={DesignTokens.colors.textSecondary}
							enabled={false}
							label={placeholder}
							value=""
						/>
					)}
					{options.map((option) => (
						<Picker.Item
							color={option.disabled ? DesignTokens.colors.textSecondary : DesignTokens.colors.text}
							enabled={!option.disabled}
							key={option.value}
							label={option.label}
							value={option.value}
						/>
					))}
				</Picker>
			</View>
		</View>
	);
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
	container: {
		width: '100%',
	},
	label: {
		fontSize: DesignTokens.fontSize.sm,
		fontWeight: DesignTokens.fontWeight.medium,
		color: DesignTokens.colors.text,
		marginBottom: DesignTokens.spacing.xs,
	},
	pickerContainer: {
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
		borderRadius: DesignTokens.borderRadius.md,
		backgroundColor: DesignTokens.colors.background,
		overflow: 'hidden',
		...Platform.select({
			ios: {
				// iOS picker has no border, so we add container styling
			},
			android: {
				// Android picker styling
			},
		}),
	},
	pickerContainerDisabled: {
		opacity: 0.5,
		backgroundColor: DesignTokens.colors.surface,
	},
	picker: {
		...Platform.select({
			ios: {
				height: 180, // iOS picker needs explicit height
			},
			android: {
				height: 50,
				color: DesignTokens.colors.text,
			},
		}),
	},
	pickerItem: {
		...Platform.select({
			ios: {
				fontSize: DesignTokens.fontSize.md,
				color: DesignTokens.colors.text,
			},
		}),
	},
});

// ============================================================================
// UTILITIES
// ============================================================================

export const SelectUtils = {
	/**
	 * Validate Select props
	 */
	validateProps: (props: SelectProps) => {
		const errors: string[] = [];

		if (props.value !== undefined && props.defaultValue !== undefined) {
			errors.push('Select cannot have both value and defaultValue');
		}

		if (!props.options || props.options.length === 0) {
			errors.push('Select must have at least one option');
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

Select.displayName = 'Select';

export default {
	Select,
	SelectUtils,
};
