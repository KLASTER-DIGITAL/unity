/**
 * Universal Tabs Component - React Native Implementation
 *
 * Uses React Native Pressable and View for native platform
 *
 * @module components/ui/universal/Tabs.native
 */

import type React from 'react';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DesignTokens } from '../../../design-system/tokens';

// ============================================================================
// TYPES
// ============================================================================

export type TabItem = {
	value: string;
	label: string;
	content: React.ReactNode;
	disabled?: boolean;
};

export type TabsProps = {
	/** Tab items */
	items: TabItem[];
	/** Default active tab value */
	defaultValue?: string;
	/** Controlled active tab value */
	value?: string;
	/** Callback when tab changes */
	onValueChange?: (value: string) => void;
};

// ============================================================================
// COMPONENT
// ============================================================================

export function Tabs({ items, defaultValue, value, onValueChange }: TabsProps) {
	const [internalValue, setInternalValue] = useState(defaultValue || items[0]?.value);

	const isControlled = value !== undefined;
	const currentValue = isControlled ? value : internalValue;

	const handleValueChange = (newValue: string) => {
		if (!isControlled) {
			setInternalValue(newValue);
		}
		onValueChange?.(newValue);
	};

	const activeItem = items.find((item) => item.value === currentValue);

	return (
		<View style={styles.container}>
			{/* Tabs List */}
			<ScrollView
				contentContainerStyle={styles.listContent}
				horizontal
				showsHorizontalScrollIndicator={false}
				style={styles.list}
			>
				{items.map((item) => {
					const isActive = item.value === currentValue;
					return (
						<Pressable
							disabled={item.disabled}
							key={item.value}
							onPress={() => handleValueChange(item.value)}
							style={({ pressed }) => [
								styles.trigger,
								isActive && styles.triggerActive,
								item.disabled && styles.triggerDisabled,
								pressed && styles.triggerPressed,
							]}
						>
							<Text
								style={[
									styles.triggerText,
									isActive && styles.triggerTextActive,
									item.disabled && styles.triggerTextDisabled,
								]}
							>
								{item.label}
							</Text>
						</Pressable>
					);
				})}
			</ScrollView>

			{/* Tab Content */}
			<View style={styles.content}>{activeItem?.content}</View>
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
	list: {
		backgroundColor: DesignTokens.colors.muted,
		borderRadius: DesignTokens.borderRadius.xl,
		padding: 3,
	},
	listContent: {
		flexDirection: 'row',
		gap: DesignTokens.spacing.xs,
	},
	trigger: {
		paddingHorizontal: DesignTokens.spacing.md,
		paddingVertical: DesignTokens.spacing.sm,
		borderRadius: DesignTokens.borderRadius.lg,
		minHeight: 36,
		justifyContent: 'center',
		alignItems: 'center',
	},
	triggerActive: {
		backgroundColor: DesignTokens.colors.background,
		...DesignTokens.shadows.sm,
	},
	triggerDisabled: {
		opacity: 0.5,
	},
	triggerPressed: {
		opacity: 0.7,
	},
	triggerText: {
		fontSize: DesignTokens.fontSizes.bodySmall,
		fontWeight: '500',
		color: DesignTokens.colors.textSecondary,
	},
	triggerTextActive: {
		color: DesignTokens.colors.text,
	},
	triggerTextDisabled: {
		opacity: 0.5,
	},
	content: {
		marginTop: DesignTokens.spacing.md,
	},
});

// ============================================================================
// UTILITIES
// ============================================================================

export const TabsUtils = {
	/**
	 * Validate tabs props
	 */
	validateProps: (props: TabsProps) => {
		const errors: string[] = [];

		if (!props.items || props.items.length === 0) {
			errors.push('items array cannot be empty');
		}

		if (props.value && props.defaultValue) {
			errors.push('Cannot use both value and defaultValue');
		}

		const values = props.items.map((item) => item.value);
		const uniqueValues = new Set(values);
		if (values.length !== uniqueValues.size) {
			errors.push('Tab values must be unique');
		}

		return {
			valid: errors.length === 0,
			errors,
		};
	},
};
