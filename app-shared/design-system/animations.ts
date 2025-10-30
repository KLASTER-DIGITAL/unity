/**
 * Animation Utilities - UNITY-v2 React Native
 *
 * Reanimated 3 анимации для плавных переходов и жестов
 */

import { Easing, withSpring, withTiming } from 'react-native-reanimated';
import { DesignTokens } from './tokens';

// ============================================================================
// SPRING ANIMATIONS (iOS-style)
// ============================================================================

/**
 * Default spring config (iOS-like)
 */
export const springConfig = {
	damping: 15,
	stiffness: 150,
	mass: 1,
};

/**
 * Bouncy spring config
 */
export const bouncySpringConfig = {
	damping: 10,
	stiffness: 100,
	mass: 1,
};

/**
 * Stiff spring config (quick animations)
 */
export const stiffSpringConfig = {
	damping: 20,
	stiffness: 200,
	mass: 0.8,
};

// ============================================================================
// TIMING ANIMATIONS
// ============================================================================

/**
 * Default timing config
 */
export const timingConfig = {
	duration: DesignTokens.animationDuration.normal,
	easing: Easing.bezier(0.4, 0.0, 0.2, 1), // iOS default
};

/**
 * Fast timing config
 */
export const fastTimingConfig = {
	duration: DesignTokens.animationDuration.fast,
	easing: Easing.bezier(0.4, 0.0, 0.2, 1),
};

/**
 * Slow timing config
 */
export const slowTimingConfig = {
	duration: DesignTokens.animationDuration.slow,
	easing: Easing.bezier(0.4, 0.0, 0.2, 1),
};

// ============================================================================
// ANIMATION PRESETS
// ============================================================================

/**
 * Fade In animation
 */
export const fadeIn = (duration = DesignTokens.animationDuration.normal) => {
	'worklet';
	return withTiming(1, {
		duration,
		easing: Easing.bezier(0.4, 0.0, 0.2, 1),
	});
};

/**
 * Fade Out animation
 */
export const fadeOut = (duration = DesignTokens.animationDuration.normal) => {
	'worklet';
	return withTiming(0, {
		duration,
		easing: Easing.bezier(0.4, 0.0, 0.2, 1),
	});
};

/**
 * Scale In animation (spring)
 */
export const scaleIn = () => {
	'worklet';
	return withSpring(1, springConfig);
};

/**
 * Scale Out animation (spring)
 */
export const scaleOut = () => {
	'worklet';
	return withSpring(0, springConfig);
};

/**
 * Slide In From Bottom animation
 */
export const slideInFromBottom = (_distance = 100) => {
	'worklet';
	return withSpring(0, springConfig);
};

/**
 * Slide Out To Bottom animation
 */
export const slideOutToBottom = (distance = 100) => {
	'worklet';
	return withSpring(distance, springConfig);
};

/**
 * Bounce animation
 */
export const bounce = () => {
	'worklet';
	return withSpring(1, bouncySpringConfig);
};

// ============================================================================
// GESTURE ANIMATIONS
// ============================================================================

/**
 * Press animation (scale down)
 */
export const pressAnimation = (pressed: boolean) => {
	'worklet';
	return withSpring(pressed ? 0.95 : 1, stiffSpringConfig);
};

/**
 * Swipe animation
 */
export const swipeAnimation = (value: number) => {
	'worklet';
	return withSpring(value, springConfig);
};

// ============================================================================
// CARD ANIMATIONS
// ============================================================================

/**
 * Card entrance animation (fade + scale)
 */
export const cardEntranceAnimation = (delay = 0) => {
	'worklet';
	return {
		opacity: withTiming(1, {
			duration: DesignTokens.animationDuration.normal,
			easing: Easing.bezier(0.4, 0.0, 0.2, 1),
		}),
		transform: [
			{
				scale: withSpring(1, {
					...springConfig,
					delay,
				}),
			},
		],
	};
};

/**
 * Card exit animation (fade + scale)
 */
export const cardExitAnimation = () => {
	'worklet';
	return {
		opacity: withTiming(0, {
			duration: DesignTokens.animationDuration.fast,
			easing: Easing.bezier(0.4, 0.0, 0.2, 1),
		}),
		transform: [
			{
				scale: withSpring(0.9, stiffSpringConfig),
			},
		],
	};
};

// ============================================================================
// LIST ANIMATIONS
// ============================================================================

/**
 * Staggered list item animation
 */
export const staggeredListAnimation = (index: number, delay = 50) => {
	'worklet';
	return {
		opacity: withTiming(1, {
			duration: DesignTokens.animationDuration.normal,
			easing: Easing.bezier(0.4, 0.0, 0.2, 1),
		}),
		transform: [
			{
				translateY: withSpring(0, {
					...springConfig,
					delay: index * delay,
				}),
			},
		],
	};
};

// ============================================================================
// MODAL ANIMATIONS
// ============================================================================

/**
 * Modal entrance animation (slide from bottom)
 */
export const modalEntranceAnimation = () => {
	'worklet';
	return {
		opacity: withTiming(1, {
			duration: DesignTokens.animationDuration.normal,
			easing: Easing.bezier(0.4, 0.0, 0.2, 1),
		}),
		transform: [
			{
				translateY: withSpring(0, springConfig),
			},
		],
	};
};

/**
 * Modal exit animation (slide to bottom)
 */
export const modalExitAnimation = () => {
	'worklet';
	return {
		opacity: withTiming(0, {
			duration: DesignTokens.animationDuration.fast,
			easing: Easing.bezier(0.4, 0.0, 0.2, 1),
		}),
		transform: [
			{
				translateY: withSpring(100, stiffSpringConfig),
			},
		],
	};
};

// ============================================================================
// SKELETON ANIMATIONS
// ============================================================================

/**
 * Skeleton shimmer animation
 */
export const shimmerAnimation = () => {
	'worklet';
	return withTiming(1, {
		duration: 1500,
		easing: Easing.bezier(0.4, 0.0, 0.6, 1),
	});
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export const Animations = {
	// Configs
	springConfig,
	bouncySpringConfig,
	stiffSpringConfig,
	timingConfig,
	fastTimingConfig,
	slowTimingConfig,

	// Basic
	fadeIn,
	fadeOut,
	scaleIn,
	scaleOut,
	slideInFromBottom,
	slideOutToBottom,
	bounce,

	// Gestures
	pressAnimation,
	swipeAnimation,

	// Cards
	cardEntranceAnimation,
	cardExitAnimation,

	// Lists
	staggeredListAnimation,

	// Modals
	modalEntranceAnimation,
	modalExitAnimation,

	// Skeleton
	shimmerAnimation,
};

export default Animations;
