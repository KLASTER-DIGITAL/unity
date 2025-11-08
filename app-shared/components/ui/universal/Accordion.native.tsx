/**
 * Universal Accordion Component - React Native Implementation
 *
 * Uses React Native Pressable and Animated for native platform
 *
 * @module components/ui/universal/Accordion.native
 */

import type React from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { DesignTokens } from '../../../design-system/tokens';

// ============================================================================
// TYPES
// ============================================================================

export type AccordionItem = {
	value: string;
	title: string;
	content: React.ReactNode;
	disabled?: boolean;
};

export type AccordionProps = {
	/** Accordion items */
	items: AccordionItem[];
	/** Type: single or multiple */
	type?: 'single' | 'multiple';
	/** Collapsible (only for type="single") */
	collapsible?: boolean;
	/** Default open values */
	defaultValue?: string | string[];
	/** Controlled open values */
	value?: string | string[];
	/** Callback when value changes */
	onValueChange?: (value: string | string[]) => void;
};

// ============================================================================
// COMPONENT
// ============================================================================

export function Accordion({
	items,
	type = 'single',
	collapsible = true,
	defaultValue,
	value,
	onValueChange,
}: AccordionProps) {
	const [internalValue, setInternalValue] = useState<string | string[]>(
		defaultValue || (type === 'multiple' ? [] : '')
	);

	const isControlled = value !== undefined;
	const currentValue = isControlled ? value : internalValue;

	const handleToggle = (itemValue: string) => {
		let newValue: string | string[];

		if (type === 'single') {
			// Single mode
			if (currentValue === itemValue && collapsible) {
				newValue = '';
			} else {
				newValue = itemValue;
			}
		} else {
			// Multiple mode
			const currentArray = Array.isArray(currentValue) ? currentValue : [];
			if (currentArray.includes(itemValue)) {
				newValue = currentArray.filter((v) => v !== itemValue);
			} else {
				newValue = [...currentArray, itemValue];
			}
		}

		if (!isControlled) {
			setInternalValue(newValue);
		}
		onValueChange?.(newValue);
	};

	const isItemOpen = (itemValue: string) => {
		if (Array.isArray(currentValue)) {
			return currentValue.includes(itemValue);
		}
		return currentValue === itemValue;
	};

	return (
		<View style={styles.container}>
			{items.map((item, index) => (
				<AccordionItemComponent
					isLast={index === items.length - 1}
					isOpen={isItemOpen(item.value)}
					item={item}
					key={item.value}
					onToggle={() => handleToggle(item.value)}
				/>
			))}
		</View>
	);
}

// ============================================================================
// ACCORDION ITEM COMPONENT
// ============================================================================

type AccordionItemComponentProps = {
	item: AccordionItem;
	isOpen: boolean;
	isLast: boolean;
	onToggle: () => void;
};

function AccordionItemComponent({ item, isOpen, isLast, onToggle }: AccordionItemComponentProps) {
	const rotation = useSharedValue(isOpen ? 180 : 0);
	const height = useSharedValue(isOpen ? 1 : 0);

	// Update animations when isOpen changes
	React.useEffect(() => {
		rotation.value = withTiming(isOpen ? 180 : 0, {
			duration: 200,
			easing: Easing.bezier(0.4, 0.0, 0.2, 1),
		});
		height.value = withTiming(isOpen ? 1 : 0, {
			duration: 200,
			easing: Easing.bezier(0.4, 0.0, 0.2, 1),
		});
	}, [isOpen, rotation, height]);

	const chevronStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${rotation.value}deg` }],
	}));

	const contentStyle = useAnimatedStyle(() => ({
		opacity: height.value,
		maxHeight: height.value * 1000, // Large number to accommodate content
	}));

	return (
		<View style={[styles.item, !isLast && styles.itemBorder]}>
			<Pressable
				disabled={item.disabled}
				onPress={onToggle}
				style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
			>
				<Text style={[styles.title, item.disabled && styles.titleDisabled]}>{item.title}</Text>
				<Animated.Text style={[styles.chevron, chevronStyle]}>▼</Animated.Text>
			</Pressable>

			<Animated.View style={[styles.content, contentStyle]}>{item.content}</Animated.View>
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
	item: {
		paddingVertical: DesignTokens.spacing.sm,
	},
	itemBorder: {
		borderBottomWidth: 1,
		borderBottomColor: DesignTokens.colors.border,
	},
	trigger: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: DesignTokens.spacing.md,
	},
	triggerPressed: {
		opacity: 0.7,
	},
	title: {
		flex: 1,
		fontSize: DesignTokens.fontSizes.bodySmall,
		fontWeight: '500',
		color: DesignTokens.colors.text,
	},
	titleDisabled: {
		opacity: 0.5,
	},
	chevron: {
		fontSize: 12,
		color: DesignTokens.colors.textSecondary,
		marginLeft: DesignTokens.spacing.md,
	},
	content: {
		overflow: 'hidden',
		paddingBottom: DesignTokens.spacing.md,
	},
});

// ============================================================================
// UTILITIES
// ============================================================================

export const AccordionUtils = {
	/**
	 * Validate accordion props
	 */
	validateProps: (props: AccordionProps) => {
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
			errors.push('Accordion item values must be unique');
		}

		return {
			valid: errors.length === 0,
			errors,
		};
	},
};
