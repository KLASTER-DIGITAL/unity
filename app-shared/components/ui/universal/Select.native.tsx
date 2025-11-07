/**
 * Universal Select Component - React Native Implementation
 *
 * Uses custom Modal + Pressable for native platform
 * (Picker component will be added when @react-native-picker/picker is installed)
 *
 * @module components/ui/universal/Select.native
 */

import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

export type SelectOption = {
	/** Option value */
	value: string;
	/** Option label */
	label: string;
	/** Option disabled state */
	disabled?: boolean;
};

export type SelectProps = {
	/** Selected value */
	value?: string;
	/** Callback when value changes */
	onValueChange?: (value: string) => void;
	/** Default value (uncontrolled) */
	defaultValue?: string;
	/** Placeholder text */
	placeholder?: string;
	/** Options array */
	options: SelectOption[];
	/** Disabled state */
	disabled?: boolean;
	/** Custom className (ignored in React Native) */
	className?: string;
	/** Size variant */
	size?: 'sm' | 'default';
};

// ============================================================================
// COMPONENTS
// ============================================================================

export function Select({
	value,
	onValueChange,
	defaultValue,
	placeholder = 'Select an option',
	options,
	disabled,
	size = 'default',
}: SelectProps) {
	const [internalValue, setInternalValue] = React.useState(defaultValue || '');
	const [modalVisible, setModalVisible] = React.useState(false);

	const isControlled = value !== undefined;
	const currentValue = isControlled ? value : internalValue;

	const selectedOption = options.find((opt) => opt.value === currentValue);

	const handleSelect = (optionValue: string) => {
		if (!isControlled) {
			setInternalValue(optionValue);
		}
		onValueChange?.(optionValue);
		setModalVisible(false);
	};

	const getContainerStyle = (): ViewStyle => {
		return size === 'sm' ? styles.containerSm : styles.containerDefault;
	};

	return (
		<>
			<Pressable
				disabled={disabled}
				onPress={() => !disabled && setModalVisible(true)}
				style={({ pressed }) => [
					styles.trigger,
					getContainerStyle(),
					disabled && styles.disabled,
					pressed && !disabled && styles.pressed,
				]}
			>
				<Text style={[styles.triggerText, !selectedOption && styles.placeholderText]}>
					{selectedOption?.label || placeholder}
				</Text>
				<Text style={styles.chevron}>▼</Text>
			</Pressable>

			<Modal
				animationType="slide"
				onRequestClose={() => setModalVisible(false)}
				transparent
				visible={modalVisible}
			>
				<Pressable onPress={() => setModalVisible(false)} style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>{placeholder}</Text>
							<Pressable onPress={() => setModalVisible(false)}>
								<Text style={styles.modalClose}>✕</Text>
							</Pressable>
						</View>

						<ScrollView style={styles.optionsList}>
							{options.map((option) => (
								<Pressable
									disabled={option.disabled}
									key={option.value}
									onPress={() => handleSelect(option.value)}
									style={({ pressed }) => [
										styles.option,
										option.value === currentValue && styles.optionSelected,
										option.disabled && styles.optionDisabled,
										pressed && !option.disabled && styles.optionPressed,
									]}
								>
									<Text
										style={[
											styles.optionText,
											option.value === currentValue && styles.optionTextSelected,
											option.disabled && styles.optionTextDisabled,
										]}
									>
										{option.label}
									</Text>
									{option.value === currentValue && <Text style={styles.checkmark}>✓</Text>}
								</Pressable>
							))}
						</ScrollView>
					</View>
				</Pressable>
			</Modal>
		</>
	);
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
	trigger: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderWidth: 1,
		borderColor: '#d1d5db',
		borderRadius: 6,
		backgroundColor: '#f9fafb',
		paddingHorizontal: 12,
	},
	containerDefault: {
		height: 36,
	},
	containerSm: {
		height: 32,
	},
	triggerText: {
		fontSize: 14,
		color: '#111827',
		flex: 1,
	},
	placeholderText: {
		color: '#9ca3af',
	},
	chevron: {
		fontSize: 12,
		color: '#9ca3af',
		marginLeft: 8,
	},
	disabled: {
		opacity: 0.5,
	},
	pressed: {
		opacity: 0.7,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'flex-end',
	},
	modalContent: {
		backgroundColor: '#ffffff',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		maxHeight: '70%',
	},
	modalHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#e5e7eb',
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#111827',
	},
	modalClose: {
		fontSize: 24,
		color: '#9ca3af',
	},
	optionsList: {
		padding: 8,
	},
	option: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 12,
		borderRadius: 8,
	},
	optionSelected: {
		backgroundColor: '#eff6ff',
	},
	optionDisabled: {
		opacity: 0.5,
	},
	optionPressed: {
		backgroundColor: '#f3f4f6',
	},
	optionText: {
		fontSize: 16,
		color: '#111827',
		flex: 1,
	},
	optionTextSelected: {
		color: '#007aff',
		fontWeight: '600',
	},
	optionTextDisabled: {
		color: '#9ca3af',
	},
	checkmark: {
		fontSize: 18,
		color: '#007aff',
		fontWeight: '600',
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

export default {
	Select,
	SelectUtils,
};
