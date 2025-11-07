/**
 * Universal Dialog Component - React Native Implementation
 *
 * Uses React Native Modal for native platform
 *
 * @module components/ui/universal/Dialog.native
 */

import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
	/** Custom className (ignored in React Native) */
	className?: string;
	/** Show close button */
	showClose?: boolean;
	/** Close button aria label */
	closeLabel?: string;
};

export type DialogHeaderProps = {
	/** Header children */
	children?: React.ReactNode;
	/** Custom className (ignored in React Native) */
	className?: string;
};

export type DialogFooterProps = {
	/** Footer children */
	children?: React.ReactNode;
	/** Custom className (ignored in React Native) */
	className?: string;
};

export type DialogTitleProps = {
	/** Title text */
	children?: React.ReactNode;
	/** Custom className (ignored in React Native) */
	className?: string;
};

export type DialogDescriptionProps = {
	/** Description text */
	children?: React.ReactNode;
	/** Custom className (ignored in React Native) */
	className?: string;
};

// ============================================================================
// CONTEXT
// ============================================================================

type DialogContextValue = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext() {
	const context = React.useContext(DialogContext);
	if (!context) {
		throw new Error('Dialog components must be used within Dialog');
	}
	return context;
}

// ============================================================================
// COMPONENTS
// ============================================================================

export function Dialog({ children, open, onOpenChange, defaultOpen }: DialogProps) {
	const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);

	const isControlled = open !== undefined;
	const currentOpen = isControlled ? open : internalOpen;

	const handleOpenChange = (newOpen: boolean) => {
		if (!isControlled) {
			setInternalOpen(newOpen);
		}
		onOpenChange?.(newOpen);
	};

	return (
		<DialogContext.Provider value={{ open: currentOpen, onOpenChange: handleOpenChange }}>
			{children}
		</DialogContext.Provider>
	);
}

export function DialogTrigger({ children, ...props }: { children: React.ReactNode }) {
	const { onOpenChange } = useDialogContext();

	return (
		<Pressable onPress={() => onOpenChange(true)} {...props}>
			{children}
		</Pressable>
	);
}

export function DialogContent({
	children,
	showClose = true,
	closeLabel = 'Close',
}: DialogContentProps) {
	const { open, onOpenChange } = useDialogContext();

	return (
		<Modal
			animationType="fade"
			onRequestClose={() => onOpenChange(false)}
			transparent
			visible={open}
		>
			<Pressable onPress={() => onOpenChange(false)} style={styles.overlay}>
				<Pressable onPress={(e) => e.stopPropagation()} style={styles.content}>
					<ScrollView style={styles.scrollView}>{children}</ScrollView>
					{showClose && (
						<Pressable
							accessibilityLabel={closeLabel}
							onPress={() => onOpenChange(false)}
							style={styles.closeButton}
						>
							<Text style={styles.closeButtonText}>✕</Text>
						</Pressable>
					)}
				</Pressable>
			</Pressable>
		</Modal>
	);
}

export function DialogHeader({ children }: DialogHeaderProps) {
	return <View style={styles.header}>{children}</View>;
}

export function DialogFooter({ children }: DialogFooterProps) {
	return <View style={styles.footer}>{children}</View>;
}

export function DialogTitle({ children }: DialogTitleProps) {
	return <Text style={styles.title}>{children}</Text>;
}

export function DialogDescription({ children }: DialogDescriptionProps) {
	return <Text style={styles.description}>{children}</Text>;
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 16,
	},
	content: {
		backgroundColor: '#ffffff',
		borderRadius: 12,
		width: '100%',
		maxWidth: 500,
		maxHeight: '80%',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	scrollView: {
		padding: 24,
	},
	closeButton: {
		position: 'absolute',
		top: 16,
		right: 16,
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: '#f3f4f6',
		alignItems: 'center',
		justifyContent: 'center',
	},
	closeButtonText: {
		fontSize: 18,
		color: '#6b7280',
		fontWeight: '600',
	},
	header: {
		marginBottom: 16,
	},
	footer: {
		marginTop: 24,
		flexDirection: 'row',
		justifyContent: 'flex-end',
		gap: 8,
	},
	title: {
		fontSize: 20,
		fontWeight: '600',
		color: '#111827',
		marginBottom: 8,
	},
	description: {
		fontSize: 14,
		color: '#6b7280',
		lineHeight: 20,
	},
});

// ============================================================================
// EXPORTS
// ============================================================================

export default {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
};
