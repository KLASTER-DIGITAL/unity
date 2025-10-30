/**
 * Animated Pressable Component
 *
 * Pressable с анимацией нажатия (scale down)
 */

import * as Haptics from "expo-haptics";
import type React from "react";
import { Pressable, type PressableProps } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { Animations } from "../../design-system/animations";

const AnimatedPressableComponent = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps extends PressableProps {
	children: React.ReactNode;
	scaleValue?: number;
	enableHaptics?: boolean;
	hapticStyle?: "light" | "medium" | "heavy";
}

export function AnimatedPressable({
	children,
	scaleValue = 0.95,
	enableHaptics = true,
	hapticStyle = "light",
	onPressIn,
	onPressOut,
	onPress,
	...props
}: AnimatedPressableProps) {
	const scale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const handlePressIn = (event: any) => {
		scale.value = withSpring(scaleValue, Animations.stiffSpringConfig);

		if (enableHaptics) {
			const hapticMap = {
				light: Haptics.ImpactFeedbackStyle.Light,
				medium: Haptics.ImpactFeedbackStyle.Medium,
				heavy: Haptics.ImpactFeedbackStyle.Heavy,
			};
			Haptics.impactAsync(hapticMap[hapticStyle]);
		}

		onPressIn?.(event);
	};

	const handlePressOut = (event: any) => {
		scale.value = withSpring(1, Animations.springConfig);
		onPressOut?.(event);
	};

	const handlePress = (event: any) => {
		onPress?.(event);
	};

	return (
		<AnimatedPressableComponent
			{...props}
			onPress={handlePress}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			style={[animatedStyle, props.style]}
		>
			{children}
		</AnimatedPressableComponent>
	);
}
