/**
 * Universal Toast Component - React Native Implementation
 *
 * Uses custom implementation with Animated API for React Native
 */

import React from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ToastProps } from './types';

// ============================================================================
// TYPES
// ============================================================================

type ToastItem = ToastProps & {
	id: string;
	variant: 'default' | 'success' | 'error' | 'warning' | 'info';
};

// ============================================================================
// TOAST MANAGER
// ============================================================================

class ToastManager {
	private toasts: ToastItem[] = [];
	private listeners: Array<(toasts: ToastItem[]) => void> = [];

	subscribe(listener: (toasts: ToastItem[]) => void) {
		this.listeners.push(listener);
		return () => {
			this.listeners = this.listeners.filter((l) => l !== listener);
		};
	}

	private notify() {
		for (const listener of this.listeners) {
			listener([...this.toasts]);
		}
	}

	private show(variant: ToastItem['variant'], title: string, options?: Partial<ToastProps>) {
		const id = options?.id || `toast-${Date.now()}-${Math.random()}`;
		const toast: ToastItem = {
			id,
			title,
			variant,
			duration: options?.duration ?? 4000,
			description: options?.description,
			action: options?.action,
			onDismiss: options?.onDismiss,
		};

		this.toasts.push(toast);
		this.notify();

		// Auto dismiss
		setTimeout(() => {
			this.dismiss(id);
		}, toast.duration);

		return id;
	}

	success(title: string, options?: Partial<ToastProps>) {
		return this.show('success', title, options);
	}

	error(title: string, options?: Partial<ToastProps>) {
		return this.show('error', title, options);
	}

	info(title: string, options?: Partial<ToastProps>) {
		return this.show('info', title, options);
	}

	warning(title: string, options?: Partial<ToastProps>) {
		return this.show('warning', title, options);
	}

	dismiss(id: string) {
		const toast = this.toasts.find((t) => t.id === id);
		if (toast?.onDismiss) {
			toast.onDismiss();
		}
		this.toasts = this.toasts.filter((t) => t.id !== id);
		this.notify();
	}
}

const toastManager = new ToastManager();

// ============================================================================
// TOAST API
// ============================================================================

export const toast = {
	success: (title: string, options?: Partial<ToastProps>) => toastManager.success(title, options),
	error: (title: string, options?: Partial<ToastProps>) => toastManager.error(title, options),
	info: (title: string, options?: Partial<ToastProps>) => toastManager.info(title, options),
	warning: (title: string, options?: Partial<ToastProps>) => toastManager.warning(title, options),
	dismiss: (id: string) => toastManager.dismiss(id),
};

// ============================================================================
// TOAST CONTAINER COMPONENT
// ============================================================================

export function ToastContainer() {
	const [toasts, setToasts] = React.useState<ToastItem[]>([]);

	React.useEffect(() => {
		return toastManager.subscribe(setToasts);
	}, []);

	return (
		<View pointerEvents="box-none" style={styles.container}>
			{toasts.map((item) => (
				<ToastItem key={item.id} toast={item} />
			))}
		</View>
	);
}

// ============================================================================
// TOAST ITEM COMPONENT
// ============================================================================

function ToastItem({ toast: item }: { toast: ToastItem }) {
	const opacity = React.useRef(new Animated.Value(0)).current;
	const translateY = React.useRef(new Animated.Value(-20)).current;

	React.useEffect(() => {
		Animated.parallel([
			Animated.timing(opacity, {
				toValue: 1,
				duration: 200,
				useNativeDriver: true,
			}),
			Animated.timing(translateY, {
				toValue: 0,
				duration: 200,
				useNativeDriver: true,
			}),
		]).start();
	}, []);

	const getBackgroundColor = () => {
		switch (item.variant) {
			case 'success':
				return '#10b981';
			case 'error':
				return '#ef4444';
			case 'warning':
				return '#f59e0b';
			case 'info':
				return '#3b82f6';
			default:
				return '#374151';
		}
	};

	return (
		<Animated.View
			style={[
				styles.toast,
				{
					opacity,
					transform: [{ translateY }],
					backgroundColor: getBackgroundColor(),
				},
			]}
		>
			<View style={styles.toastContent}>
				<Text style={styles.toastTitle}>{item.title}</Text>
				{item.description && <Text style={styles.toastDescription}>{item.description}</Text>}
			</View>
			{item.action && (
				<TouchableOpacity
					onPress={() => {
						item.action?.onClick();
						toastManager.dismiss(item.id);
					}}
					style={styles.toastAction}
				>
					<Text style={styles.toastActionText}>{item.action.label}</Text>
				</TouchableOpacity>
			)}
		</Animated.View>
	);
}

// ============================================================================
// STYLES
// ============================================================================

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 50,
		left: 0,
		right: 0,
		alignItems: 'center',
		zIndex: 9999,
	},
	toast: {
		width: width - 32,
		marginBottom: 8,
		padding: 16,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	toastContent: {
		flex: 1,
	},
	toastTitle: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 4,
	},
	toastDescription: {
		color: '#ffffff',
		fontSize: 14,
		opacity: 0.9,
	},
	toastAction: {
		marginLeft: 12,
		paddingHorizontal: 12,
		paddingVertical: 6,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		borderRadius: 6,
	},
	toastActionText: {
		color: '#ffffff',
		fontSize: 14,
		fontWeight: '600',
	},
});

// ============================================================================
// EXPORTS
// ============================================================================

export default {
	toast,
	ToastContainer,
};
