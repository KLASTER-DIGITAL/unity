/**
 * Universal Modal Component - React Native Implementation
 *
 * Uses React Native Modal with iOS-style design
 *
 * @module components/ui/universal/Modal.native
 */

import type React from 'react';
import {
	Dimensions,
	Pressable,
	Modal as RNModal,
	ScrollView,
	StyleSheet,
	Text,
	View,
	type ViewStyle,
} from 'react-native';
import { DesignTokens } from '../../../design-system/tokens';

// ============================================================================
// TYPES
// ============================================================================

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
	/** Modal open state */
	open?: boolean;
	/** Callback when open state changes */
	onOpenChange?: (open: boolean) => void;
	/** Modal title */
	title?: string;
	/** Modal description */
	description?: string;
	/** Modal size */
	size?: ModalSize;
	/** Can be closed */
	closable?: boolean;
	/** Show backdrop */
	backdrop?: boolean;
	/** Close on backdrop press */
	closeOnBackdrop?: boolean;
	/** Show close button */
	showCloseButton?: boolean;
	/** Custom close button */
	closeButton?: React.ReactNode;
	/** Modal content */
	children?: React.ReactNode;
	/** Custom header */
	header?: React.ReactNode;
	/** Custom footer */
	footer?: React.ReactNode;
	/** Test ID */
	testID?: string;
	/** Accessibility label */
	accessibilityLabel?: string;
	/** Custom style */
	style?: ViewStyle;
}

// ============================================================================
// HELPERS
// ============================================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const getSizeStyles = (size: ModalSize): ViewStyle => {
	switch (size) {
		case 'sm':
			return {
				width: Math.min(SCREEN_WIDTH * 0.8, 400),
				maxHeight: SCREEN_HEIGHT * 0.5,
			};
		case 'md':
			return {
				width: Math.min(SCREEN_WIDTH * 0.9, 500),
				maxHeight: SCREEN_HEIGHT * 0.7,
			};
		case 'lg':
			return {
				width: Math.min(SCREEN_WIDTH * 0.95, 700),
				maxHeight: SCREEN_HEIGHT * 0.8,
			};
		case 'xl':
			return {
				width: Math.min(SCREEN_WIDTH * 0.95, 900),
				maxHeight: SCREEN_HEIGHT * 0.9,
			};
		case 'full':
			return {
				width: SCREEN_WIDTH,
				height: SCREEN_HEIGHT,
				borderRadius: 0,
			};
		default:
			return {
				width: Math.min(SCREEN_WIDTH * 0.9, 500),
				maxHeight: SCREEN_HEIGHT * 0.7,
			};
	}
};

// ============================================================================
// COMPONENT
// ============================================================================

export function Modal({
	open = false,
	onOpenChange,
	title,
	description,
	size = 'md',
	closable = true,
	backdrop = true,
	closeOnBackdrop = true,
	showCloseButton = true,
	closeButton,
	children,
	header,
	footer,
	testID,
	accessibilityLabel,
	style,
}: ModalProps) {
	const handleClose = () => {
		if (closable && onOpenChange) {
			onOpenChange(false);
		}
	};

	const handleBackdropPress = () => {
		if (closeOnBackdrop) {
			handleClose();
		}
	};

	return (
		<RNModal
			accessibilityLabel={accessibilityLabel}
			animationType="fade"
			onRequestClose={handleClose}
			testID={testID}
			transparent={backdrop}
			visible={open}
		>
			<View style={styles.container}>
				{/* Backdrop */}
				{backdrop && (
					<Pressable
						accessibilityLabel="Close modal"
						accessibilityRole="button"
						onPress={handleBackdropPress}
						style={styles.backdrop}
					/>
				)}

				{/* Modal Content */}
				<View style={[styles.modal, getSizeStyles(size), style]}>
					{/* Header */}
					{(title || description || header || showCloseButton) && (
						<View style={styles.header}>
							<View style={styles.headerContent}>
								{header || (
									<>
										{title && <Text style={styles.title}>{title}</Text>}
										{description && <Text style={styles.description}>{description}</Text>}
									</>
								)}
							</View>
							{showCloseButton && closable && (
								<Pressable
									accessibilityLabel="Close"
									accessibilityRole="button"
									onPress={handleClose}
									style={styles.closeButton}
								>
									{closeButton || <Text style={styles.closeButtonText}>✕</Text>}
								</Pressable>
							)}
						</View>
					)}

					{/* Body */}
					<ScrollView
						contentContainerStyle={styles.bodyContent}
						showsVerticalScrollIndicator={true}
						style={styles.body}
					>
						{children}
					</ScrollView>

					{/* Footer */}
					{footer && <View style={styles.footer}>{footer}</View>}
				</View>
			</View>
		</RNModal>
	);
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modal: {
		backgroundColor: DesignTokens.colors.background,
		borderRadius: DesignTokens.borderRadius.lg,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
		overflow: 'hidden',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		padding: DesignTokens.spacing.lg,
		borderBottomWidth: 1,
		borderBottomColor: DesignTokens.colors.border,
	},
	headerContent: {
		flex: 1,
	},
	title: {
		fontSize: DesignTokens.fontSize.lg,
		fontWeight: DesignTokens.fontWeight.semibold,
		color: DesignTokens.colors.text,
	},
	description: {
		fontSize: DesignTokens.fontSize.sm,
		color: DesignTokens.colors.textSecondary,
		marginTop: DesignTokens.spacing.xs,
	},
	closeButton: {
		padding: DesignTokens.spacing.xs,
		marginLeft: DesignTokens.spacing.md,
	},
	closeButtonText: {
		fontSize: DesignTokens.fontSize.xl,
		color: DesignTokens.colors.textSecondary,
	},
	body: {
		flex: 1,
	},
	bodyContent: {
		padding: DesignTokens.spacing.lg,
	},
	footer: {
		padding: DesignTokens.spacing.lg,
		borderTopWidth: 1,
		borderTopColor: DesignTokens.colors.border,
	},
});

// ============================================================================
// UTILITIES
// ============================================================================

export const ModalUtils = {
	/**
	 * Validate Modal props
	 */
	validateProps: (props: ModalProps) => {
		const errors: string[] = [];

		if (!props.closable && props.closeOnBackdrop) {
			errors.push('Modal cannot close on backdrop if not closable');
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

Modal.displayName = 'Modal';

export default Modal;
