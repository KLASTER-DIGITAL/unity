/**
 * Universal Input Component - React Native Implementation
 *
 * Uses React Native TextInput with iOS-style design
 *
 * @module components/ui/universal/Input.native
 */

import type React from 'react';
import {
	TextInput as RNTextInput,
	type TextInputProps as RNTextInputProps,
	StyleSheet,
	Text,
	View,
	type ViewStyle,
} from 'react-native';
import { DesignTokens } from '../../../design-system/tokens';

// ============================================================================
// TYPES
// ============================================================================

export type InputProps = Omit<RNTextInputProps, 'style'> & {
	/** Custom style */
	style?: ViewStyle;
	/** Error state */
	error?: boolean;
	/** Error message */
	errorMessage?: string;
	/** Left icon */
	leftIcon?: React.ReactNode;
	/** Right icon */
	rightIcon?: React.ReactNode;
	/** Test ID */
	testID?: string;
	/** Accessibility label */
	accessibilityLabel?: string;
};

// ============================================================================
// COMPONENT
// ============================================================================

export function Input({
	style,
	error = false,
	errorMessage,
	leftIcon,
	rightIcon,
	testID,
	accessibilityLabel,
	editable = true,
	...props
}: InputProps) {
	return (
		<View style={[styles.container, style]}>
			<View
				style={[
					styles.inputWrapper,
					error && styles.inputWrapperError,
					!editable && styles.inputWrapperDisabled,
				]}
			>
				{/* Left Icon */}
				{leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

				{/* Input */}
				<RNTextInput
					accessibilityLabel={accessibilityLabel}
					editable={editable}
					placeholderTextColor={DesignTokens.colors.textTertiary}
					style={[
						styles.input,
						leftIcon && styles.inputWithLeftIcon,
						rightIcon && styles.inputWithRightIcon,
					]}
					testID={testID}
					{...props}
				/>

				{/* Right Icon */}
				{rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
			</View>

			{/* Error Message */}
			{error && errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
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
	inputWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		height: 44, // iOS minimum touch target
		borderRadius: DesignTokens.borderRadius.lg,
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
		backgroundColor: DesignTokens.colors.gray50,
		paddingHorizontal: DesignTokens.spacing.md,
	},
	inputWrapperError: {
		borderColor: DesignTokens.colors.destructive,
		borderWidth: 2,
	},
	inputWrapperDisabled: {
		opacity: 0.5,
		backgroundColor: DesignTokens.colors.muted,
	},
	input: {
		flex: 1,
		fontSize: DesignTokens.fontSizes.bodyLarge,
		color: DesignTokens.colors.text,
		padding: 0,
	},
	inputWithLeftIcon: {
		marginLeft: DesignTokens.spacing.sm,
	},
	inputWithRightIcon: {
		marginRight: DesignTokens.spacing.sm,
	},
	leftIcon: {
		marginRight: DesignTokens.spacing.xs,
	},
	rightIcon: {
		marginLeft: DesignTokens.spacing.xs,
	},
	errorMessage: {
		marginTop: DesignTokens.spacing.xs,
		fontSize: DesignTokens.fontSizes.caption,
		color: DesignTokens.colors.destructive,
	},
});

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
			props.keyboardType &&
			!['default', 'email-address', 'numeric', 'phone-pad', 'url'].includes(props.keyboardType)
		) {
			errors.push(`Invalid keyboard type: ${props.keyboardType}`);
		}

		return {
			valid: errors.length === 0,
			errors,
		};
	},
};
