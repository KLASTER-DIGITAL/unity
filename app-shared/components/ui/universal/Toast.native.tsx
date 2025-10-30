/**
 * Universal Toast Component - React Native Implementation
 *
 * Uses react-native-toast-message for native platform
 *
 * @module components/ui/universal/Toast.native
 */

import type React from "react";
import RNToast from "react-native-toast-message";

// ============================================================================
// TYPES
// ============================================================================

export interface ToastProps {
	/** Toast title */
	title?: string;
	/** Toast description */
	description?: string;
	/** Toast duration in ms */
	duration?: number;
	/** Toast action button */
	action?: {
		label: string;
		onClick: () => void;
	};
	/** Callback when toast is dismissed */
	onDismiss?: () => void;
	/** Toast ID */
	id?: string;
}

export interface ToasterProps {
	/** Toast position */
	position?:
		| "top"
		| "bottom"
		| "top-center"
		| "top-left"
		| "top-right"
		| "bottom-center"
		| "bottom-left"
		| "bottom-right";
	/** Theme */
	theme?: "light" | "dark" | "system";
	/** Rich colors */
	richColors?: boolean;
	/** Expand toasts */
	expand?: boolean;
	/** Visible toasts count */
	visibleToasts?: number;
	/** Show close button */
	closeButton?: boolean;
}

// ============================================================================
// TOAST API
// ============================================================================

export const toast = {
	/**
	 * Show success toast
	 */
	success: (title: string, options?: Partial<ToastProps>) => {
		RNToast.show({
			type: "success",
			text1: title,
			text2: options?.description,
			visibilityTime: options?.duration ?? 4000,
			onHide: options?.onDismiss,
		});
	},

	/**
	 * Show error toast
	 */
	error: (title: string, options?: Partial<ToastProps>) => {
		RNToast.show({
			type: "error",
			text1: title,
			text2: options?.description,
			visibilityTime: options?.duration ?? 4000,
			onHide: options?.onDismiss,
		});
	},

	/**
	 * Show warning toast
	 */
	warning: (title: string, options?: Partial<ToastProps>) => {
		RNToast.show({
			type: "info", // react-native-toast-message doesn't have warning type
			text1: title,
			text2: options?.description,
			visibilityTime: options?.duration ?? 4000,
			onHide: options?.onDismiss,
		});
	},

	/**
	 * Show info toast
	 */
	info: (title: string, options?: Partial<ToastProps>) => {
		RNToast.show({
			type: "info",
			text1: title,
			text2: options?.description,
			visibilityTime: options?.duration ?? 4000,
			onHide: options?.onDismiss,
		});
	},

	/**
	 * Show default toast
	 */
	message: (title: string, options?: Partial<ToastProps>) => {
		RNToast.show({
			type: "success", // Use success as default
			text1: title,
			text2: options?.description,
			visibilityTime: options?.duration ?? 4000,
			onHide: options?.onDismiss,
		});
	},

	/**
	 * Show loading toast
	 */
	loading: (title: string, options?: Partial<ToastProps>) => {
		RNToast.show({
			type: "info",
			text1: title,
			text2: options?.description,
			visibilityTime: options?.duration ?? 0, // Don't auto-hide loading
			onHide: options?.onDismiss,
		});
	},

	/**
	 * Show promise toast
	 */
	promise: async <T,>(
		promise: Promise<T>,
		messages: {
			loading: string;
			success: string | ((data: T) => string);
			error: string | ((error: any) => string);
		},
		options?: Partial<ToastProps>,
	): Promise<T> => {
		// Show loading toast
		toast.loading(messages.loading, options);

		try {
			const data = await promise;

			// Show success toast
			const successMessage =
				typeof messages.success === "function"
					? messages.success(data)
					: messages.success;
			toast.success(successMessage, options);

			return data;
		} catch (error) {
			// Show error toast
			const errorMessage =
				typeof messages.error === "function"
					? messages.error(error)
					: messages.error;
			toast.error(errorMessage, options);

			throw error;
		}
	},

	/**
	 * Dismiss toast
	 */
	dismiss: (id?: string) => {
		if (id) {
			// react-native-toast-message doesn't support dismissing by ID
			RNToast.hide();
		} else {
			RNToast.hide();
		}
	},

	/**
	 * Custom toast
	 */
	custom: (component: React.ReactNode, options?: Partial<ToastProps>) => {
		// react-native-toast-message doesn't support custom components easily
		// Fallback to info toast
		console.warn(
			"Custom toast not fully supported in React Native, using info toast",
		);
		toast.info("Custom toast", options);
	},
};

// ============================================================================
// TOASTER COMPONENT
// ============================================================================

export function Toaster({ position = "top" }: ToasterProps = {}) {
	// Map position to react-native-toast-message position
	const rnPosition = position.includes("top") ? "top" : "bottom";

	return (
		<RNToast
			position={rnPosition}
			// Additional config can be added here
		/>
	);
}

// ============================================================================
// EXPORTS
// ============================================================================

Toaster.displayName = "Toaster";

export default {
	toast,
	Toaster,
};
