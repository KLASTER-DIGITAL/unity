/**
 * Universal Slider Component - React Native Implementation
 *
 * Uses @react-native-community/slider for native platform
 *
 * @module components/ui/universal/Slider.native
 */

import RNSlider from '@react-native-community/slider';
import { StyleSheet, View } from 'react-native';
import { DesignTokens } from '../../../design-system/tokens';

// ============================================================================
// TYPES
// ============================================================================

export type SliderProps = {
	/** Current value(s) - only single value supported in React Native */
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
	'aria-label': ariaLabel,
}: SliderProps) {
	const [internalValue, setInternalValue] = React.useState(defaultValue[0] || 0);

	const isControlled = value !== undefined;
	const currentValue = isControlled ? value[0] : internalValue;

	const handleValueChange = (newValue: number) => {
		if (!isControlled) {
			setInternalValue(newValue);
		}
		onValueChange?.([newValue]);
	};

	return (
		<View style={styles.container}>
			<RNSlider
				accessibilityLabel={ariaLabel}
				disabled={disabled}
				maximumTrackTintColor={DesignTokens.colors.muted}
				maximumValue={max}
				minimumTrackTintColor={DesignTokens.colors.primary}
				minimumValue={min}
				onValueChange={handleValueChange}
				step={step}
				style={styles.slider}
				thumbTintColor={DesignTokens.colors.background}
				value={currentValue}
			/>
		</View>
	);
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
	container: {
		width: '100%',
		paddingVertical: DesignTokens.spacing.sm,
	},
	slider: {
		width: '100%',
		height: 40,
	},
});

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

		if (props.value && props.value.length > 1) {
			errors.push('React Native Slider only supports single value (range sliders not supported)');
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
