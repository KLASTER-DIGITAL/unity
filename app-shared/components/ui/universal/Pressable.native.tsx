/**
 * Universal Pressable Component for UNITY-v2 (React Native)
 *
 * React Native implementation using Pressable + Reanimated
 *
 * TODO: Implement for React Native Expo migration (Q3 2025)
 *
 * @author UNITY Team
 * @date 2025-10-29
 */

import type React from 'react';
import { Pressable as RNPressable, StyleSheet, View } from 'react-native';

// import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface PressableProps {
  children: React.ReactNode;
  className?: string;
  style?: any;
  disabled?: boolean;
  pressScale?: number;
  hapticFeedback?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  testID?: string;
  accessibilityLabel?: string;
  role?: 'button' | 'link' | 'none';
}

/**
 * React Native Pressable implementation
 *
 * TODO: Add Reanimated scale animation
 * TODO: Add haptic feedback support
 */
export const Pressable: React.FC<PressableProps> = ({
  children,
  style,
  disabled = false,
  pressScale = 0.95,
  hapticFeedback = false,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  testID,
  accessibilityLabel,
  role = 'button',
}) => {
  // TODO: Implement Reanimated scale animation
  // const scale = useSharedValue(1);

  // const animatedStyle = useAnimatedStyle(() => {
  //   return {
  //     transform: [{ scale: scale.value }],
  //   };
  // });

  const handlePressIn = () => {
    // TODO: Animate scale down
    // scale.value = withSpring(pressScale);

    // TODO: Trigger haptic feedback if enabled
    // if (hapticFeedback) {
    //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // }

    onPressIn?.();
  };

  const handlePressOut = () => {
    // TODO: Animate scale up
    // scale.value = withSpring(1);

    onPressOut?.();
  };

  return (
    <RNPressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={role}
      disabled={disabled}
      onLongPress={onLongPress}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.pressable, style]}
      testID={testID}
    >
      {/* TODO: Wrap with Animated.View for scale animation */}
      <View>{children}</View>
    </RNPressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    // Base styles
  },
});

export default Pressable;
