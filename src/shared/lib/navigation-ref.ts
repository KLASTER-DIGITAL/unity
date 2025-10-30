/**
 * React Navigation Reference
 *
 * Global navigation reference for React Native
 * This allows navigation from outside React components
 *
 * @module lib/navigation-ref
 */

import { createRef } from 'react';

/**
 * Navigation container ref
 * Used by NativeNavigationAdapter to navigate programmatically
 */
export const navigationRef = createRef<any>();

/**
 * Check if navigation is ready
 */
export function isNavigationReady(): boolean {
  return navigationRef.current !== null;
}

/**
 * Navigate to a screen
 */
export function navigate(name: string, params?: any): void {
  if (navigationRef.current) {
    navigationRef.current.navigate(name, params);
  } else {
    console.warn('Navigation ref is not ready');
  }
}

/**
 * Go back
 */
export function goBack(): void {
  if (navigationRef.current?.canGoBack()) {
    navigationRef.current.goBack();
  } else {
    console.warn('Cannot go back');
  }
}

/**
 * Reset navigation stack
 */
export function reset(state: any): void {
  if (navigationRef.current) {
    navigationRef.current.reset(state);
  } else {
    console.warn('Navigation ref is not ready');
  }
}
