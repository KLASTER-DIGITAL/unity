/**
 * Screen Transition Configurations
 *
 * iOS-style transitions для React Native Expo Router
 * Максимально близко к PWA версии (Framer Motion)
 */

import type { StackNavigationOptions } from '@react-navigation/stack';

/**
 * Slide from right transition (iOS default)
 * Используется для forward navigation
 */
export const slideFromRight: StackNavigationOptions = {
  animation: 'slide_from_right',
  animationDuration: 300,
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  customAnimationOnGesture: true,
  fullScreenGestureEnabled: true,
};

/**
 * Slide from left transition
 * Используется для backward navigation
 */
export const slideFromLeft: StackNavigationOptions = {
  animation: 'slide_from_left',
  animationDuration: 300,
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  customAnimationOnGesture: true,
  fullScreenGestureEnabled: true,
};

/**
 * Fade transition
 * Используется для модальных окон и overlay screens
 */
export const fade: StackNavigationOptions = {
  animation: 'fade',
  animationDuration: 200,
  gestureEnabled: false,
};

/**
 * Slide from bottom transition (iOS modal)
 * Используется для модальных окон
 */
export const slideFromBottom: StackNavigationOptions = {
  animation: 'slide_from_bottom',
  animationDuration: 300,
  gestureEnabled: true,
  gestureDirection: 'vertical',
  customAnimationOnGesture: true,
};

/**
 * Default transition config
 * iOS-style slide from right
 */
export const defaultTransition: StackNavigationOptions = slideFromRight;

/**
 * Tab transition config
 * Используется для переходов между табами
 *
 * Note: В Expo Router tabs transitions настраиваются через
 * кастомный TabBar компонент с Reanimated анимациями
 */
export const tabTransition = {
  duration: 300,
  easing: 'ease-in-out' as const,
};
