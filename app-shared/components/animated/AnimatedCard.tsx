/**
 * Animated Card Component
 *
 * Card с анимацией появления (fade + scale)
 */

import type React from 'react';
import { useEffect } from 'react';
import type { ViewProps } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Animations } from '../../design-system/animations';
import { DesignTokens } from '../../design-system/tokens';

interface AnimatedCardProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
  index?: number;
  staggerDelay?: number;
}

export function AnimatedCard({
  children,
  delay = 0,
  index = 0,
  staggerDelay = 50,
  style,
  ...props
}: AnimatedCardProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const translateY = useSharedValue(20);

  useEffect(() => {
    const totalDelay = delay + index * staggerDelay;

    // Fade in
    opacity.value = withTiming(1, {
      duration: DesignTokens.animationDuration.normal,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
    });

    // Scale in
    scale.value = withSpring(1, {
      ...Animations.springConfig,
      delay: totalDelay,
    });

    // Slide in
    translateY.value = withSpring(0, {
      ...Animations.springConfig,
      delay: totalDelay,
    });
  }, [delay, index, staggerDelay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Animated.View {...props} style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}
