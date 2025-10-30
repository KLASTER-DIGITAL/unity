/**
 * Native Navigation Adapter for React Native
 *
 * Uses @react-navigation/native for navigation
 *
 * @module platform/navigation/native
 */

import type { NavigationAdapter, NavigationOptions } from '../navigation';

/**
 * React Native navigation adapter using @react-navigation/native
 *
 * Note: This implementation uses dynamic import to avoid bundling
 * @react-navigation/native in web builds. The actual navigation will be
 * imported at runtime when running on React Native.
 */
export class NativeNavigationAdapter implements NavigationAdapter {
  private navigationRef: any = null;
  private initialized = false;

  /**
   * Initialize React Navigation (lazy loading)
   * Note: This method is intentionally unused in PWA build
   */
  // @ts-expect-error - init method is for future React Native implementation
  private async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Check if we're in a React Native environment
      if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
        // Dynamic import to avoid bundling in web
        const { navigationRef } = await import('@/shared/lib/navigation-ref');
        this.navigationRef = navigationRef;
        this.initialized = true;
      } else {
        throw new Error('@react-navigation/native is only available in React Native environment');
      }
    } catch (error) {
      console.error('Failed to load React Navigation:', error);
      throw new Error(
        '@react-navigation/native is not available. Make sure @react-navigation/native is installed.'
      );
    }
  }

  navigate(route: string, options?: NavigationOptions): void {
    try {
      if (!this.initialized) {
        console.warn('Navigation not initialized yet');
        return;
      }

      if (!this.navigationRef?.current) {
        console.warn('Navigation ref not available');
        return;
      }

      // Parse route to get screen name and params
      const { screen, params } = this.parseRoute(route, options?.params);

      this.navigationRef.current.navigate(screen, params);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }

  goBack(): void {
    try {
      if (!this.initialized) {
        console.warn('Navigation not initialized yet');
        return;
      }

      if (!this.navigationRef?.current) {
        console.warn('Navigation ref not available');
        return;
      }

      if (this.navigationRef.current.canGoBack()) {
        this.navigationRef.current.goBack();
      }
    } catch (error) {
      console.error('Go back error:', error);
    }
  }

  replace(route: string, options?: NavigationOptions): void {
    try {
      if (!this.initialized) {
        console.warn('Navigation not initialized yet');
        return;
      }

      if (!this.navigationRef?.current) {
        console.warn('Navigation ref not available');
        return;
      }

      const { screen, params } = this.parseRoute(route, options?.params);

      // Use dispatch with replace action
      this.navigationRef.current.dispatch({
        type: 'REPLACE',
        payload: { name: screen, params },
      });
    } catch (error) {
      console.error('Replace navigation error:', error);
    }
  }

  reset(route: string, options?: NavigationOptions): void {
    try {
      if (!this.initialized) {
        console.warn('Navigation not initialized yet');
        return;
      }

      if (!this.navigationRef?.current) {
        console.warn('Navigation ref not available');
        return;
      }

      const { screen, params } = this.parseRoute(route, options?.params);

      // Reset navigation stack
      this.navigationRef.current.reset({
        index: 0,
        routes: [{ name: screen, params }],
      });
    } catch (error) {
      console.error('Reset navigation error:', error);
    }
  }

  getCurrentRoute(): string {
    try {
      if (!this.initialized) {
        return '/';
      }

      if (!this.navigationRef?.current) {
        return '/';
      }

      const currentRoute = this.navigationRef.current.getCurrentRoute();
      return currentRoute?.name || '/';
    } catch (error) {
      console.error('Get current route error:', error);
      return '/';
    }
  }

  canGoBack(): boolean {
    try {
      if (!this.initialized) {
        return false;
      }

      if (!this.navigationRef?.current) {
        return false;
      }

      return this.navigationRef.current.canGoBack();
    } catch (error) {
      console.error('Can go back error:', error);
      return false;
    }
  }

  addListener(event: string, callback: (data?: any) => void): () => void {
    try {
      if (!this.initialized) {
        console.warn('Navigation not initialized yet');
        return () => {};
      }

      if (!this.navigationRef?.current) {
        console.warn('Navigation ref not available');
        return () => {};
      }

      // Map web events to React Navigation events
      const eventMap: { [key: string]: string } = {
        focus: 'focus',
        blur: 'blur',
        beforeRemove: 'beforeRemove',
        state: 'state',
      };

      const nativeEvent = eventMap[event] || event;

      const unsubscribe = this.navigationRef.current.addListener(nativeEvent, callback);

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    } catch (error) {
      console.error('Add listener error:', error);
      return () => {};
    }
  }

  /**
   * Parse route string to screen name and params
   */
  private parseRoute(route: string, additionalParams?: any): { screen: string; params?: any } {
    // Remove leading slash
    const cleanRoute = route.startsWith('/') ? route.slice(1) : route;

    // Split by ? to separate path and query params
    const [path, queryString] = cleanRoute.split('?');

    // Parse query params
    const params: any = { ...additionalParams };

    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
    }

    // Map web routes to React Navigation screen names
    const screenMap: { [key: string]: string } = {
      '': 'Home',
      home: 'Home',
      history: 'History',
      achievements: 'Achievements',
      reports: 'Reports',
      settings: 'Settings',
      profile: 'Profile',
      admin: 'Admin',
    };

    const screen = screenMap[path] || path || 'Home';

    return { screen, params: Object.keys(params).length > 0 ? params : undefined };
  }
}
