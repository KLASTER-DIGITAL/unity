/**
 * Universal Dialog Component - React Native Implementation
 *
 * Uses React Native Modal with iOS-style design
 * Simplified version of Modal for dialog-specific use cases
 *
 * @module components/ui/universal/Dialog.native
 */

import type React from 'react';
import { Dimensions, Modal as RNModal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DesignTokens } from '../../../design-system/tokens';

// ============================================================================
// TYPES
// ============================================================================

export type DialogProps = {
	/** Whether the dialog is open */
	open?: boolean;
	/** Callback when open state changes */
	onOpenChange?: (open: boolean) => void;
	/** Dialog content */
	children?: React.ReactNode;
	/** Default open state (uncontrolled) */
	defaultOpen?: boolean;
};

export type DialogContentProps = {
	/** Content children */
	children?: React.ReactNode;
	/** Show close button */
	showClose?: boolean;
	/** Close button aria label */
	closeLabel?: string;
};

export type DialogHeaderProps = {
	/** Header children */
	children?: React.ReactNode;
};

export type DialogFooterProps = {
	/** Footer children */
	children?: React.ReactNode;
};

export type DialogTitleProps = {
	/** Title text */
	children?: React.ReactNode;
};

export type DialogDescriptionProps = {
	/** Description text */
	children?: React.ReactNode;
};

// ============================================================================
// HELPERS
// ============================================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Dialog Root Component
 */
export function Dialog({ children, open = false, onOpenChange }: DialogProps) {
	return (
		<RNModal
			animationType="fade"
			onRequestClose={() => onOpenChange?.(false)}
			transparent
			visible={open}
		>
			{children}
		</RNModal>
	);
}

/**
 * Dialog Trigger (not used in React Native, kept for API compatibility)
 */
export function DialogTrigger({ children }: { children?: React.ReactNode }) {
	return <>{children}</>;
}

/**
 * Dialog Portal (not used in React Native, kept for API compatibility)
 */
export function DialogPortal({ children }: { children?: React.ReactNode }) {
	return <>{children}</>;
}

/**
 * Dialog Close (not used in React Native, kept for API compatibility)
 */
export function DialogClose({ children }: { children?: React.ReactNode }) {
	return <>{children}</>;
}

/**
 * Dialog Overlay
 */
export function DialogOverlay() {
	return <View style={styles.overlay} />;
}

/**
 * Dialog Content
 */
export function DialogContent({ children }: DialogContentProps) {
	return (
		<View style={styles.container}>
			<DialogOverlay />
			<View style={styles.content}>
				<ScrollView bounces={false} showsVerticalScrollIndicator={false}>
					{children}
				</ScrollView>
			</View>
		</View>
	);
}

/**
 * Dialog Header
 */
export function DialogHeader({ children }: DialogHeaderProps) {
	return <View style={styles.header}>{children}</View>;
}

/**
 * Dialog Footer
 */
export function DialogFooter({ children }: DialogFooterProps) {
	return <View style={styles.footer}>{children}</View>;
}

/**
 * Dialog Title
 */
export function DialogTitle({ children }: DialogTitleProps) {
	return <Text style={styles.title}>{children}</Text>;
}

/**
 * Dialog Description
 */
export function DialogDescription({ children }: DialogDescriptionProps) {
	return <Text style={styles.description}>{children}</Text>;
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
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	content: {
		width: Math.min(SCREEN_WIDTH * 0.9, 500),
		maxHeight: SCREEN_HEIGHT * 0.8,
		backgroundColor: DesignTokens.colors.card,
		borderRadius: DesignTokens.borderRadius.lg,
		padding: DesignTokens.spacing.lg,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 8,
		elevation: 5,
	},
	header: {
		marginBottom: DesignTokens.spacing.md,
	},
	footer: {
		marginTop: DesignTokens.spacing.md,
		flexDirection: 'row',
		justifyContent: 'flex-end',
		gap: DesignTokens.spacing.sm,
	},
	title: {
		fontSize: DesignTokens.typography.fontSize.xl,
		fontWeight: DesignTokens.typography.fontWeight.semibold,
		color: DesignTokens.colors.text,
		marginBottom: DesignTokens.spacing.xs,
	},
	description: {
		fontSize: DesignTokens.typography.fontSize.sm,
		color: DesignTokens.colors.textSecondary,
		lineHeight: DesignTokens.typography.lineHeight.relaxed,
	},
});

// ============================================================================
// UTILITIES
// ============================================================================

export const DialogUtils = {
	/**
	 * Validate dialog props
	 */
	validateProps: (props: DialogProps) => {
		const errors: string[] = [];

		if (props.open !== undefined && typeof props.open !== 'boolean') {
			errors.push('open must be a boolean');
		}

		if (props.onOpenChange !== undefined && typeof props.onOpenChange !== 'function') {
			errors.push('onOpenChange must be a function');
		}

		return {
			valid: errors.length === 0,
			errors,
		};
	},
};
