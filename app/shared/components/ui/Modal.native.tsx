/**
 * Universal Modal Component - React Native Implementation
 * 
 * Uses React Native Modal for mobile (iOS/Android)
 */

import React, { forwardRef } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
  ViewStyle,
} from 'react-native';
import type { ExtendedModalProps } from './Modal';

/**
 * Native Modal implementation using React Native Modal
 */
export const NativeModal = forwardRef<View, ExtendedModalProps>(
  ({ 
    open = false,
    onOpenChange,
    children,
    title,
    description,
    closeButton = true,
    closeOnBackdrop = true,
    size = 'default',
    className,
    testID,
    accessibilityLabel,
    style,
    ...props 
  }, ref) => {
    const handleClose = () => {
      onOpenChange?.(false);
    };

    const handleBackdropPress = () => {
      if (closeOnBackdrop) {
        handleClose();
      }
    };

    // Get size-specific styles
    const sizeStyles = getSizeStyles(size);

    return (
      <RNModal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        {...props}
      >
        <Pressable 
          style={styles.backdrop}
          onPress={handleBackdropPress}
        >
          <Pressable 
            style={[
              styles.container,
              sizeStyles.container,
              style as ViewStyle
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View ref={ref} style={styles.content}>
              {/* Header */}
              {(title || closeButton) && (
                <View style={styles.header}>
                  <View style={styles.headerText}>
                    {title && (
                      <Text style={styles.title}>{title}</Text>
                    )}
                    {description && (
                      <Text style={styles.description}>{description}</Text>
                    )}
                  </View>
                  {closeButton && (
                    <TouchableOpacity
                      onPress={handleClose}
                      style={styles.closeButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={styles.closeIcon}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Body */}
              <ScrollView 
                style={styles.body}
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </RNModal>
    );
  }
);

NativeModal.displayName = 'NativeModal';

/**
 * Get size-specific styles
 */
function getSizeStyles(size: string) {
  const sizes: Record<string, { container: ViewStyle }> = {
    sm: {
      container: { 
        maxWidth: 400,
        width: '90%',
      }
    },
    default: {
      container: { 
        maxWidth: 500,
        width: '90%',
      }
    },
    lg: {
      container: { 
        maxWidth: 700,
        width: '95%',
      }
    },
    xl: {
      container: { 
        maxWidth: 900,
        width: '95%',
      }
    },
    full: {
      container: { 
        width: '100%',
        height: '100%',
        maxWidth: undefined,
      }
    }
  };

  return sizes[size] || sizes.default;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 28,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginTop: 4,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  closeIcon: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '400',
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});

