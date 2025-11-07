/**
 * Universal Switch Component - React Native Implementation
 *
 * Uses React Native Switch for native platform
 *
 * @module components/ui/universal/Switch.native
 */

import React from 'react';
import { Platform, Switch as RNSwitch, StyleSheet } from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

export type SwitchProps = {
	/** Checked state */
	checked?: boolean;
	/** Callback when checked state changes */
	onCheckedChange?: (checked: boolean) => void;
	/** Default checked state (uncontrolled) */
	defaultChecked?: boolean;
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

export function Switch({
	checked,
	onCheckedChange,
	defaultChecked,
	disabled,
	'aria-label': ariaLabel,
}: SwitchProps) {
	const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false);

	const isControlled = checked !== undefined;
	const currentValue = isControlled ? checked : internalChecked;

	const handleValueChange = (value: boolean) => {
		if (!isControlled) {
			setInternalChecked(value);
		}
		onCheckedChange?.(value);
	};

	return (
		<RNSwitch
			accessibilityLabel={ariaLabel}
			disabled={disabled}
			ios_backgroundColor="#e5e5ea"
			onValueChange={handleValueChange}
			style={styles.switch}
			thumbColor="#ffffff"
			trackColor={{
				false: '#e5e5ea',
				true: '#007aff',
			}}
			value={currentValue}
		/>
	);
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
	switch: {
		transform: Platform.select({
			android: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
			ios: [],
		}),
	},
});

// ============================================================================
// UTILITIES
// ============================================================================

export const SwitchUtils = {
	/**
	 * Validate Switch props
	 */
	validateProps: (props: SwitchProps) => {
		const errors: string[] = [];

		if (props.checked !== undefined && props.defaultChecked !== undefined) {
			errors.push('Switch cannot have both checked and defaultChecked');
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
	Switch,
	SwitchUtils,
};
