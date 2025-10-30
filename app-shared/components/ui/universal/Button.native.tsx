/**
 * Universal Button Component - React Native Implementation
 *
 * Uses React Native Pressable with iOS-style design
 *
 * @module components/ui/universal/Button.native
 */

import type React from "react";
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	type TextStyle,
	View,
	type ViewStyle,
} from "react-native";
import { DesignTokens } from "../../../design-system/tokens";

// ============================================================================
// TYPES
// ============================================================================

export type ButtonVariant =
	| "default"
	| "destructive"
	| "outline"
	| "secondary"
	| "ghost"
	| "link";
export type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps {
	/** Button children */
	children?: React.ReactNode;
	/** Button variant */
	variant?: ButtonVariant;
	/** Button size */
	size?: ButtonSize;
	/** Loading state */
	loading?: boolean;
	/** Icon to display before text */
	leftIcon?: React.ReactNode;
	/** Icon to display after text */
	rightIcon?: React.ReactNode;
	/** Full width button */
	fullWidth?: boolean;
	/** Disabled state */
	disabled?: boolean;
	/** Click handler */
	onClick?: () => void;
	/** Press handler (React Native) */
	onPress?: () => void;
	/** Test ID */
	testID?: string;
	/** Accessibility label */
	accessibilityLabel?: string;
	/** Custom style */
	style?: ViewStyle;
	/** Custom text style */
	textStyle?: TextStyle;
}

// ============================================================================
// STYLES
// ============================================================================

const getVariantStyles = (
	variant: ButtonVariant,
	pressed: boolean,
): ViewStyle => {
	const baseStyle: ViewStyle = {
		borderRadius: DesignTokens.borderRadius.md,
		borderWidth: 1,
	};

	switch (variant) {
		case "default":
			return {
				...baseStyle,
				backgroundColor: pressed
					? DesignTokens.colors.primaryDark
					: DesignTokens.colors.primary,
				borderColor: "transparent",
			};
		case "destructive":
			return {
				...baseStyle,
				backgroundColor: pressed ? "#c41e3a" : DesignTokens.colors.error,
				borderColor: "transparent",
			};
		case "outline":
			return {
				...baseStyle,
				backgroundColor: pressed
					? DesignTokens.colors.surfaceHover
					: "transparent",
				borderColor: DesignTokens.colors.border,
			};
		case "secondary":
			return {
				...baseStyle,
				backgroundColor: pressed
					? DesignTokens.colors.surfaceHover
					: DesignTokens.colors.surface,
				borderColor: "transparent",
			};
		case "ghost":
			return {
				...baseStyle,
				backgroundColor: pressed
					? DesignTokens.colors.surfaceHover
					: "transparent",
				borderColor: "transparent",
			};
		case "link":
			return {
				...baseStyle,
				backgroundColor: "transparent",
				borderColor: "transparent",
				borderWidth: 0,
			};
		default:
			return baseStyle;
	}
};

const getVariantTextStyles = (variant: ButtonVariant): TextStyle => {
	switch (variant) {
		case "default":
		case "destructive":
			return {
				color: "#FFFFFF",
			};
		case "outline":
		case "ghost":
			return {
				color: DesignTokens.colors.text,
			};
		case "secondary":
			return {
				color: DesignTokens.colors.text,
			};
		case "link":
			return {
				color: DesignTokens.colors.primary,
				textDecorationLine: "underline",
			};
		default:
			return {
				color: DesignTokens.colors.text,
			};
	}
};

const getSizeStyles = (size: ButtonSize): ViewStyle => {
	switch (size) {
		case "sm":
			return {
				paddingHorizontal: DesignTokens.spacing.sm,
				paddingVertical: DesignTokens.spacing.xs,
				minHeight: 32,
			};
		case "lg":
			return {
				paddingHorizontal: DesignTokens.spacing.lg,
				paddingVertical: DesignTokens.spacing.md,
				minHeight: 48,
			};
		case "icon":
			return {
				width: 40,
				height: 40,
				padding: 0,
			};
		default:
			return {
				paddingHorizontal: DesignTokens.spacing.md,
				paddingVertical: DesignTokens.spacing.sm,
				minHeight: 40,
			};
	}
};

const getSizeTextStyles = (size: ButtonSize): TextStyle => {
	switch (size) {
		case "sm":
			return {
				fontSize: DesignTokens.fontSize.sm,
			};
		case "lg":
			return {
				fontSize: DesignTokens.fontSize.lg,
			};
		case "icon":
			return {
				fontSize: DesignTokens.fontSize.md,
			};
		default:
			return {
				fontSize: DesignTokens.fontSize.md,
			};
	}
};

// ============================================================================
// COMPONENT
// ============================================================================

export function Button({
	children,
	variant = "default",
	size = "default",
	loading = false,
	leftIcon,
	rightIcon,
	fullWidth = false,
	disabled = false,
	onClick,
	onPress,
	testID,
	accessibilityLabel,
	style,
	textStyle,
}: ButtonProps) {
	const handlePress = () => {
		if (onClick) onClick();
		if (onPress) onPress();
	};

	return (
		<Pressable
			accessibilityLabel={accessibilityLabel}
			accessibilityRole="button"
			disabled={disabled || loading}
			onPress={handlePress}
			style={({ pressed }) => [
				styles.base,
				getVariantStyles(variant, pressed),
				getSizeStyles(size),
				fullWidth && styles.fullWidth,
				(disabled || loading) && styles.disabled,
				style,
			]}
			testID={testID}
		>
			<View style={styles.content}>
				{loading && (
					<ActivityIndicator
						color={
							variant === "default" || variant === "destructive"
								? "#FFFFFF"
								: DesignTokens.colors.primary
						}
						size="small"
						style={styles.loader}
					/>
				)}
				{!loading && leftIcon && <View style={styles.icon}>{leftIcon}</View>}
				{typeof children === "string" ? (
					<Text
						style={[
							styles.text,
							getVariantTextStyles(variant),
							getSizeTextStyles(size),
							(disabled || loading) && styles.disabledText,
							textStyle,
						]}
					>
						{children}
					</Text>
				) : (
					children
				)}
				{!loading && rightIcon && <View style={styles.icon}>{rightIcon}</View>}
			</View>
		</Pressable>
	);
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
	base: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	content: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: DesignTokens.spacing.xs,
	},
	text: {
		fontWeight: DesignTokens.fontWeight.medium,
		textAlign: "center",
	},
	icon: {
		flexDirection: "row",
		alignItems: "center",
	},
	loader: {
		marginRight: DesignTokens.spacing.xs,
	},
	fullWidth: {
		width: "100%",
	},
	disabled: {
		opacity: 0.5,
	},
	disabledText: {
		opacity: 0.5,
	},
});

// ============================================================================
// UTILITIES
// ============================================================================

export const ButtonUtils = {
	/**
	 * Validate Button props
	 */
	validateProps: (props: ButtonProps) => {
		const errors: string[] = [];

		if (props.loading && (props.leftIcon || props.rightIcon)) {
			errors.push("Button cannot have icons when loading");
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

Button.displayName = "Button";

export default Button;
