/**
 * Universal Toast Component - React Native Implementation
 *
 * Uses react-native-toast-message for React Native
 */

import ToastMessage from 'react-native-toast-message';
import type { ToastProps } from './types';

/**
 * Toast API for React Native (react-native-toast-message)
 */
export const toast = {
	/**
	 * Show success toast
	 */
	success: (title: string, options?: Partial<ToastProps>) => {
		ToastMessage.show({
			type: 'success',
			text1: title,
			text2: options?.description,
			visibilityTime: options?.duration ?? 4000,
			onHide: options?.onDismiss,
		});
		return options?.id || '';
	},

	/**
	 * Show error toast
	 */
	error: (title: string, options?: Partial<ToastProps>) => {
		ToastMessage.show({
			type: 'error',
			text1: title,
			text2: options?.description,
			visibilityTime: options?.duration ?? 4000,
			onHide: options?.onDismiss,
		});
		return options?.id || '';
	},

	/**
	 * Show info toast
	 */
	info: (title: string, options?: Partial<ToastProps>) => {
		ToastMessage.show({
			type: 'info',
			text1: title,
			text2: options?.description,
			visibilityTime: options?.duration ?? 4000,
			onHide: options?.onDismiss,
		});
		return options?.id || '';
	},

	/**
	 * Show warning toast
	 */
	warning: (title: string, options?: Partial<ToastProps>) => {
		ToastMessage.show({
			type: 'warning',
			text1: title,
			text2: options?.description,
			visibilityTime: options?.duration ?? 4000,
			onHide: options?.onDismiss,
		});
		return options?.id || '';
	},

	/**
	 * Show default toast
	 */
	default: (title: string, options?: Partial<ToastProps>) => {
		ToastMessage.show({
			type: 'info',
			text1: title,
			text2: options?.description,
			visibilityTime: options?.duration ?? 4000,
			onHide: options?.onDismiss,
		});
		return options?.id || '';
	},

	/**
	 * Dismiss a toast by ID
	 */
	dismiss: (id?: string) => {
		ToastMessage.hide();
	},

	/**
	 * Show loading toast
	 */
	loading: (title: string, options?: Partial<ToastProps>) => {
		ToastMessage.show({
			type: 'info',
			text1: title,
			text2: options?.description,
			visibilityTime: options?.duration ?? Number.POSITIVE_INFINITY,
		});
		return options?.id || '';
	},

	/**
	 * Show promise toast
	 */
	promise: <T,>(
		promise: Promise<T>,
		options: {
			loading: string;
			success: string | ((data: T) => string);
			error: string | ((error: any) => string);
		}
	) => {
		ToastMessage.show({
			type: 'info',
			text1: options.loading,
		});

		promise
			.then((data) => {
				const successMessage =
					typeof options.success === 'function' ? options.success(data) : options.success;
				ToastMessage.show({
					type: 'success',
					text1: successMessage,
				});
			})
			.catch((error) => {
				const errorMessage =
					typeof options.error === 'function' ? options.error(error) : options.error;
				ToastMessage.show({
					type: 'error',
					text1: errorMessage,
				});
			});

		return '';
	},
};

/**
 * Toast Container Component for React Native
 */
export type ToasterProps = {
	position?: 'top' | 'bottom';
};

export function Toaster({ position = 'top' }: ToasterProps = {}) {
	return <ToastMessage position={position} />;
}
