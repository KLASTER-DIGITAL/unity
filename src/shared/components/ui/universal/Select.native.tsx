/**
 * Universal Select Component - Native Implementation
 * 
 * Uses React Native Picker for native platform
 * 
 * @module components/ui/universal/Select.native
 */

import { useState, useEffect } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface SelectOption {
  /** Option value */
  value: string;
  /** Option label */
  label: string;
  /** Option disabled state */
  disabled?: boolean;
}

export interface SelectProps {
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
  /** Custom className (ignored in native) */
  className?: string;
  /** Size variant (ignored in native) */
  size?: 'sm' | 'default';
}

// ============================================================================
// DYNAMIC IMPORTS
// ============================================================================

let Picker: any = null;
let View: any = null;
let Text: any = null;
let TouchableOpacity: any = null;
let Modal: any = null;
let StyleSheet: any = null;
let ScrollView: any = null;
let Platform: any = null;

async function loadReactNative() {
  if (Picker) return;
  
  try {
    // @ts-expect-error - react-native is not installed in PWA build
    const RN = await import(/* @vite-ignore */ 'react-native');
    View = RN.View;
    Text = RN.Text;
    TouchableOpacity = RN.TouchableOpacity;
    Modal = RN.Modal;
    StyleSheet = RN.StyleSheet;
    ScrollView = RN.ScrollView;
    Platform = RN.Platform;

    // Try to load @react-native-picker/picker
    try {
      // @ts-expect-error - @react-native-picker/picker is not installed in PWA build
      const PickerModule = await import(/* @vite-ignore */ '@react-native-picker/picker');
      Picker = PickerModule.Picker;
    } catch {
      // Fallback to custom implementation if picker not available
      console.warn('@react-native-picker/picker not available, using custom implementation');
    }
  } catch (error) {
    console.error('Failed to load React Native:', error);
  }
}

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
}: SelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [modalVisible, setModalVisible] = useState(false);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  useEffect(() => {
    loadReactNative();
  }, []);

  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    setModalVisible(false);
  };

  const selectedOption = options.find(opt => opt.value === currentValue);
  const displayText = selectedOption?.label || placeholder;

  if (!View || !Text || !TouchableOpacity || !Modal || !ScrollView) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 6,
      backgroundColor: '#ffffff',
      minHeight: 36,
    },
    triggerDisabled: {
      opacity: 0.5,
      backgroundColor: '#f3f4f6',
    },
    triggerText: {
      fontSize: 14,
      color: '#111827',
    },
    placeholderText: {
      fontSize: 14,
      color: '#9ca3af',
    },
    chevron: {
      fontSize: 16,
      color: '#6b7280',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: '#ffffff',
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      maxHeight: '60%',
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
      fontSize: 16,
      fontWeight: '600',
      color: '#111827',
    },
    closeButton: {
      padding: 4,
    },
    closeButtonText: {
      fontSize: 18,
      color: '#6b7280',
    },
    optionsList: {
      padding: 8,
    },
    option: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 6,
    },
    optionSelected: {
      backgroundColor: '#eff6ff',
    },
    optionDisabled: {
      opacity: 0.5,
    },
    optionText: {
      fontSize: 14,
      color: '#111827',
    },
    optionTextSelected: {
      color: '#2563eb',
      fontWeight: '600',
    },
  });

  // If Picker is available, use it (iOS/Android native picker)
  if (Picker && Platform?.OS === 'ios') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.trigger, disabled && styles.triggerDisabled]}
          onPress={() => !disabled && setModalVisible(true)}
          disabled={disabled}
        >
          <Text style={currentValue ? styles.triggerText : styles.placeholderText}>
            {displayText}
          </Text>
          <Text style={styles.chevron}>▼</Text>
        </TouchableOpacity>

        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{placeholder}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={currentValue}
                onValueChange={handleValueChange}
              >
                {!currentValue && (
                  <Picker.Item label={placeholder} value="" enabled={false} />
                )}
                {options.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    enabled={!option.disabled}
                  />
                ))}
              </Picker>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  // Custom implementation for Android or when Picker is not available
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.trigger, disabled && styles.triggerDisabled]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <Text style={currentValue ? styles.triggerText : styles.placeholderText}>
          {displayText}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{placeholder}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsList}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    currentValue === option.value && styles.optionSelected,
                    option.disabled && styles.optionDisabled,
                  ]}
                  onPress={() => !option.disabled && handleValueChange(option.value)}
                  disabled={option.disabled}
                >
                  <Text
                    style={[
                      styles.optionText,
                      currentValue === option.value && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ============================================================================
// UTILITIES
// ============================================================================

export const SelectUtils = {
  validateProps: (props: SelectProps) => {
    const errors: string[] = [];

    if (!props.options || props.options.length === 0) {
      errors.push('Select must have at least one option');
    }

    if (props.options) {
      const values = props.options.map(opt => opt.value);
      const uniqueValues = new Set(values);
      if (values.length !== uniqueValues.size) {
        errors.push('Select options must have unique values');
      }
    }

    if (props.value && props.defaultValue) {
      errors.push('Select cannot have both value and defaultValue');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  findOption: (options: SelectOption[], value: string) => {
    return options.find(opt => opt.value === value);
  },

  getLabel: (options: SelectOption[], value: string) => {
    const option = SelectUtils.findOption(options, value);
    return option?.label || value;
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  Select,
  SelectUtils,
};

