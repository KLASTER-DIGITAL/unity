/**
 * Universal Checkbox Component - React Native Implementation
 *
 * Uses Pressable with custom checkmark for native platform
 *
 * @module components/ui/universal/Checkbox.native
 */

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DesignTokens } from '../../../design-system/tokens';

// ============================================================================
// TYPES
// ============================================================================

export interface CheckboxProps {
	/** Checked state */
	checked?: boolean;
	/** Callback when checked state changes */
	onCheckedChange?: (checked: boolean) => void;
	/** Default checked state (uncontrolled) */
	defaultChecked?: boolean;
	/** Disabled state */
	disabled?: boolean;
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

export function Checkbox({
	checked,
	onCheckedChange,
	defaultChecked = false,
	disabled,
	'aria-label': ariaLabel,
	testID,
	label,
}: CheckboxProps) {
	const [internalChecked, setInternalChecked] = useState(defaultChecked);
	const isControlled = checked !== undefined;
	const currentChecked = isControlled ? checked : internalChecked;

	const handlePress = () => {
		const newValue = !currentChecked;
		if (!isControlled) {
			setInternalChecked(newValue);
		}
		onCheckedChange?.(newValue);
	};

	return (
		<Pressable
			accessibilityLabel={ariaLabel || label}
			accessibilityRole="checkbox"
			accessibilityState={{ checked: currentChecked, disabled }}
			disabled={disabled}
			onPress={handlePress}
			style={({ pressed }) => [styles.container, pressed && !disabled && styles.pressed]}
			testID={testID}
		>
			<View
				style={[
					styles.checkbox,
					currentChecked && styles.checkboxChecked,
					disabled && styles.checkboxDisabled,
				]}
			>
				{currentChecked && <Text style={styles.checkmark}>✓</Text>}
			</View>
			{label && <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>}
		</Pressable>
	);
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: DesignTokens.spacing.sm,
	},
	pressed: {
		opacity: 0.7,
	},
	checkbox: {
		width: 20,
		height: 20,
		borderRadius: DesignTokens.borderRadius.sm,
		borderWidth: 2,
		borderColor: DesignTokens.colors.border,
		backgroundColor: DesignTokens.colors.background,
		alignItems: 'center',
		justifyContent: 'center',
	},
	checkboxChecked: {
		backgroundColor: DesignTokens.colors.primary,
		borderColor: DesignTokens.colors.primary,
	},
	checkboxDisabled: {
		opacity: 0.5,
	},
	checkmark: {
		color: '#FFFFFF',
		fontSize: 14,
		fontWeight: 'bold',
	},
	label: {
		fontSize: DesignTokens.fontSize.md,
		color: DesignTokens.colors.text,
	},
	labelDisabled: {
		opacity: 0.5,
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

Checkbox.displayName = 'Checkbox';

export default {
	Checkbox,
	CheckboxUtils,
};
