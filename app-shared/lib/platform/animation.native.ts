/**
 * Native Animation Adapter (React Native Reanimated)
 *
 * Uses React Native Reanimated for React Native.
 *
 * This implementation uses dynamic import to avoid bundling
 * react-native-reanimated in web builds.
 */

import React, { useEffect, useState } from 'react';
import type {
	AnimatedPresenceProps,
	AnimatedViewProps,
	AnimationConfig,
	TransitionConfig,
} from './types';

// Type definitions for Reanimated (will be imported dynamically)
type ReanimatedModule = {
	default: {
		// biome-ignore lint/suspicious/noExplicitAny: React Native Reanimated types
		View: any;
		// biome-ignore lint/suspicious/noExplicitAny: React Native Reanimated types
		createAnimatedComponent: (component: any) => any;
	};
	// biome-ignore lint/suspicious/noExplicitAny: React Native Reanimated types
	useSharedValue: (initialValue: any) => any;
	// biome-ignore lint/suspicious/noExplicitAny: React Native Reanimated types
	useAnimatedStyle: (callback: () => any) => any;
	// biome-ignore lint/suspicious/noExplicitAny: React Native Reanimated types
	withTiming: (toValue: any, config?: any) => any;
	// biome-ignore lint/suspicious/noExplicitAny: React Native Reanimated types
	withSpring: (toValue: any, config?: any) => any;
	runOnJS: (callback: () => void) => void;
};

let Reanimated: ReanimatedModule | null = null;
let initialized = false;

/**
 * Initialize React Native Reanimated (lazy loading)
 */
async function initReanimated(): Promise<void> {
	if (initialized) return;

	try {
		// Check if we're in a React Native environment
		if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
			// Dynamic import to avoid bundling in web
			// Use string interpolation to prevent Vite from trying to resolve the import
			const moduleName = 'react-native-reanimated';
			Reanimated = await import(/* @vite-ignore */ moduleName);
			initialized = true;
		} else {
			throw new Error('react-native-reanimated is only available in React Native environment');
		}
	} catch (error) {
		console.error('Failed to load react-native-reanimated:', error);
		throw new Error(
			'react-native-reanimated is not available. Make sure react-native-reanimated is installed.'
		);
	}
}

/**
 * Convert AnimationConfig to Reanimated style
 */
function convertToReanimatedStyle(config: AnimationConfig | undefined): any {
	if (!config) return {};

	const style: any = {};

	if (config.opacity !== undefined) style.opacity = config.opacity;
	if (config.scale !== undefined) style.transform = [{ scale: config.scale }];
	if (config.rotate !== undefined) {
		style.transform = style.transform || [];
		style.transform.push({ rotate: `${config.rotate}deg` });
	}

	// Handle x and y translations
	if (config.x !== undefined || config.y !== undefined) {
		style.transform = style.transform || [];

		if (config.x !== undefined) {
			const xValue = typeof config.x === 'string' ? Number.parseFloat(config.x) : config.x;
			style.transform.push({ translateX: xValue });
		}

		if (config.y !== undefined) {
			const yValue = typeof config.y === 'string' ? Number.parseFloat(config.y) : config.y;
			style.transform.push({ translateY: yValue });
		}
	}

	return style;
}

/**
 * Get animation function based on transition config
 */
function getAnimationFunction(transition?: TransitionConfig): (toValue: any, config?: any) => any {
	if (!Reanimated) {
		throw new Error('Reanimated not initialized');
	}

	if (!transition || transition.type === 'spring') {
		const springConfig = transition as any;
		return (toValue: any) =>
			Reanimated?.withSpring(toValue, {
				stiffness: springConfig?.stiffness ?? 300,
				damping: springConfig?.damping ?? 30,
				mass: springConfig?.mass ?? 1,
				velocity: springConfig?.velocity ?? 0,
			});
	}
	const timingConfig = transition as any;
	return (toValue: any) =>
		Reanimated?.withTiming(toValue, {
			duration: timingConfig?.duration ?? 300,
			easing: timingConfig?.easing ?? 'ease',
		});
}

/**
 * Animated View component for React Native (Reanimated)
 */
export const AnimatedView: React.FC<AnimatedViewProps> = ({
	children,
	initial,
	animate,
	exit: _exit,
	transition,
	className: _className,
	style,
	onAnimationComplete,
}) => {
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		initReanimated()
			.then(() => setIsReady(true))
			.catch(console.error);
	}, []);

	if (!(isReady && Reanimated)) {
		// Fallback: render without animation
		return React.createElement('div', { style }, children);
	}

	const AnimatedViewComponent = Reanimated.default.View;

	// Create shared values for animation
	const initialStyle = convertToReanimatedStyle(initial);
	const animateStyle = convertToReanimatedStyle(animate);

	const animationFunc = getAnimationFunction(transition);

	// Create animated style
	const animatedStyle = Reanimated.useAnimatedStyle(() => {
		const result: any = {};

		// Animate opacity
		if (animateStyle.opacity !== undefined) {
			result.opacity = animationFunc(animateStyle.opacity);
		}

		// Animate transform
		if (animateStyle.transform) {
			result.transform = animateStyle.transform.map((t: any) => {
				const key = Object.keys(t)[0];
				return { [key]: animationFunc(t[key]) };
			});
		}

		// Call onAnimationComplete when animation finishes
		if (onAnimationComplete && Reanimated?.runOnJS) {
			// @ts-expect-error - Reanimated.runOnJS type is complex and not worth typing for PWA build
			Reanimated.runOnJS(onAnimationComplete)();
		}

		return result;
	});

	return React.createElement(
		AnimatedViewComponent,
		{
			style: [initialStyle, style, animatedStyle],
		},
		children
	);
};

/**
 * Animated Presence component for React Native
 *
 * Note: React Native Reanimated doesn't have a direct equivalent to AnimatePresence.
 * This is a simplified implementation that handles enter/exit animations.
 */
export const AnimatedPresence: React.FC<AnimatedPresenceProps> = ({
	children,
	mode: _mode,
	custom: _custom,
}) => {
	// For React Native, we'll use a simpler approach
	// The exit animations will be handled by the parent component
	return React.createElement(React.Fragment, {}, children);
};

/**
 * Create animated component
 *
 * Uses Reanimated.createAnimatedComponent
 */
export const createAnimated = (component: any) => {
	if (!Reanimated) {
		console.warn('createAnimated.native: Reanimated not initialized. Using fallback.');
		return component;
	}

	return Reanimated.default.createAnimatedComponent(component);
};

/**
 * Export motion-like API for compatibility
 *
 * Note: This is a simplified version for React Native.
 * For full motion API, use AnimatedView component.
 */
export const motion = {
	div: AnimatedView,
	span: AnimatedView,
	button: AnimatedView,
	View: AnimatedView,
} as any;
