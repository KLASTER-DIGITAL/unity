/**
 * Universal Checkbox Component - React Native Implementation
 *
 * Uses custom Pressable component for native platform
 *
 * @module components/ui/universal/Checkbox.native
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

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
	/** Custom className (ignored in React Native) */
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
	'aria-label': ariaLabel,
}: CheckboxProps) {
	const [internalChecked, setInternalChecked] = React.useState<boolean | 'indeterminate'>(
		defaultChecked ?? false
	);

	const isControlled = checked !== undefined;
	const currentValue = isControlled ? checked : internalChecked;

	const handlePress = () => {
		if (disabled) return;

		const newValue = currentValue !== true;

		if (!isControlled) {
			setInternalChecked(newValue);
		}
		onCheckedChange?.(newValue);
	};

	const getCheckboxStyle = (): ViewStyle => {
		if (currentValue === true) {
			return styles.checked;
		}
		if (currentValue === 'indeterminate') {
			return styles.indeterminate;
		}
		return styles.unchecked;
	};

	return (
		<Pressable
			accessibilityLabel={ariaLabel}
			accessibilityRole="checkbox"
			accessibilityState={{
				checked: currentValue === true,
				disabled,
			}}
			disabled={disabled}
			onPress={handlePress}
			style={({ pressed }) => [
				styles.container,
				getCheckboxStyle(),
				disabled && styles.disabled,
				pressed && !disabled && styles.pressed,
			]}
		>
			{currentValue === true && (
				<View style={styles.checkmark}>
					<Text style={styles.checkmarkText}>✓</Text>
				</View>
			)}
			{currentValue === 'indeterminate' && <View style={styles.indeterminateLine} />}
		</Pressable>
	);
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
	container: {
		width: 20,
		height: 20,
		borderRadius: 4,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	unchecked: {
		borderColor: '#d1d5db',
		backgroundColor: '#f9fafb',
	},
	checked: {
		borderColor: '#007aff',
		backgroundColor: '#007aff',
	},
	indeterminate: {
		borderColor: '#007aff',
		backgroundColor: '#007aff',
	},
	disabled: {
		opacity: 0.5,
	},
	pressed: {
		opacity: 0.7,
	},
	checkmark: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	checkmarkText: {
		color: '#ffffff',
		fontSize: 14,
		fontWeight: '600',
		lineHeight: 16,
	},
	indeterminateLine: {
		width: 10,
		height: 2,
		backgroundColor: '#ffffff',
		borderRadius: 1,
	},
});

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
