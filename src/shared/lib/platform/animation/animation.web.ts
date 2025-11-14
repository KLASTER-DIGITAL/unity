/**
 * Web Animation Adapter (Framer Motion)
 *
 * Uses Framer Motion for React Web (PWA).
 */

import { AnimatePresence as FramerAnimatePresence, motion } from 'motion/react';
import React from 'react';
import type { AnimatedPresenceProps, AnimatedViewProps } from './types';

/**
 * Animated View component for Web (Framer Motion)
 */
export const AnimatedView: React.FC<AnimatedViewProps> = ({
	children,
	initial,
	animate,
	exit,
	transition,
	className,
	style,
	onAnimationComplete,
}) =>
	React.createElement(
		motion.div,
		{
			initial: initial as any,
			animate: animate as any,
			exit: exit as any,
			transition: transition as any,
			className,
			style,
			onAnimationComplete,
		},
		children
	);

/**
 * Animated Presence component for Web (Framer Motion)
 */
export const AnimatedPresence: React.FC<AnimatedPresenceProps> = ({
	children,
	mode, // ✅ FIX: Убрали дефолтное значение 'wait' - теперь mode опциональный
	custom,
}) =>
	React.createElement(
		FramerAnimatePresence,
		{
			mode,
			custom,
		},
		children
	);

/**
 * Create animated component
 */
export const createAnimated = (component: any) => motion(component);

/**
 * Export motion for advanced use cases
 */
export { motion };
