/**
 * Universal Navigation Adapter for UNITY-v2
 * 
 * Provides cross-platform navigation that works with both
 * React Router (Web) and React Navigation (React Native)
 * 
 * @author UNITY Team
 * @date 2025-01-18
 */

import { Platform } from './detection';

/**
 * Navigation route parameters
 */
export interface RouteParams {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Navigation options
 */
export interface NavigationOptions {
  replace?: boolean;
  reset?: boolean;
  animate?: boolean;
  params?: RouteParams;
}

/**
 * Universal navigation interface
 */
export interface NavigationAdapter {
  /**
   * Navigate to a route
   * @param route - Route name or path
   * @param options - Navigation options
   */
  navigate(route: string, options?: NavigationOptions): void;

  /**
   * Go back to previous route
   */
  goBack(): void;

  /**
   * Replace current route
   * @param route - Route name or path
   * @param options - Navigation options
   */
  replace(route: string, options?: NavigationOptions): void;

  /**
   * Reset navigation stack
   * @param route - Route name or path
   * @param options - Navigation options
   */
  reset(route: string, options?: NavigationOptions): void;

  /**
   * Get current route name
   * @returns Current route name
   */
  getCurrentRoute(): string;

  /**
   * Check if can go back
   * @returns True if can go back
   */
  canGoBack(): boolean;

  /**
   * Add navigation listener
   * @param event - Event type
   * @param callback - Callback function
   * @returns Unsubscribe function
   */
  addListener(event: string, callback: (data?: any) => void): () => void;
}

/**
 * Web navigation adapter using React Router
 */
class WebNavigationAdapter implements NavigationAdapter {
  private history: any = null;
  private location: any = null;

  constructor() {
    // Initialize with browser history if available
    if (Platform.isBrowser && typeof window !== 'undefined') {
      this.history = window.history;
      this.location = window.location;
    }
  }

  navigate(route: string, options?: NavigationOptions): void {
    if (!Platform.isBrowser) {
      console.warn('Navigation not available in non-browser environment');
      return;
    }

    try {
      const url = this.buildUrl(route, options?.params);
      
      if (options?.replace) {
        this.history?.replaceState(null, '', url);
      } else {
        this.history?.pushState(null, '', url);
      }

      // Dispatch popstate event to notify React Router
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }

  goBack(): void {
    if (!Platform.isBrowser) {
      console.warn('Navigation not available in non-browser environment');
      return;
    }

    try {
      this.history?.back();
    } catch (error) {
      console.error('Go back error:', error);
    }
  }

  replace(route: string, options?: NavigationOptions): void {
    this.navigate(route, { ...options, replace: true });
  }

  reset(route: string, options?: NavigationOptions): void {
    if (!Platform.isBrowser) {
      console.warn('Navigation not available in non-browser environment');
      return;
    }

    try {
      const url = this.buildUrl(route, options?.params);
      
      // Clear history by replacing current state
      this.history?.replaceState(null, '', url);
      
      // Dispatch popstate event
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (error) {
      console.error('Reset navigation error:', error);
    }
  }

  getCurrentRoute(): string {
    if (!Platform.isBrowser || !this.location) {
      return '/';
    }

    return this.location.pathname + this.location.search + this.location.hash;
  }

  canGoBack(): boolean {
    if (!Platform.isBrowser) {
      return false;
    }

    // Check if there's history to go back to
    return window.history.length > 1;
  }

  addListener(event: string, callback: (data?: any) => void): () => void {
    if (!Platform.isBrowser) {
      console.warn('Navigation listeners not available in non-browser environment');
      return () => {};
    }

    const eventMap: { [key: string]: string } = {
      'focus': 'focus',
      'blur': 'blur',
      'beforeRemove': 'beforeunload',
      'state': 'popstate'
    };

    const browserEvent = eventMap[event] || event;
    
    const wrappedCallback = (e: Event) => {
      callback({
        type: event,
        target: e.target,
        data: (e as any).state
      });
    };

    window.addEventListener(browserEvent, wrappedCallback);

    return () => {
      window.removeEventListener(browserEvent, wrappedCallback);
    };
  }

  private buildUrl(route: string, params?: RouteParams): string {
    if (!params || Object.keys(params).length === 0) {
      return route;
    }

    const url = new URL(route, window.location.origin);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });

    return url.pathname + url.search + url.hash;
  }
}

/**
 * React Native navigation adapter (placeholder)
 * This will be implemented when migrating to React Native
 */
class NativeNavigationAdapter implements NavigationAdapter {
  navigate(_route: string, _options?: NavigationOptions): void {
    // TODO: Implement with React Navigation
    console.warn('NativeNavigationAdapter not implemented yet');
  }

  goBack(): void {
    // TODO: Implement with React Navigation
    console.warn('NativeNavigationAdapter not implemented yet');
  }

  replace(_route: string, _options?: NavigationOptions): void {
    // TODO: Implement with React Navigation
    console.warn('NativeNavigationAdapter not implemented yet');
  }

  reset(_route: string, _options?: NavigationOptions): void {
    // TODO: Implement with React Navigation
    console.warn('NativeNavigationAdapter not implemented yet');
  }

  getCurrentRoute(): string {
    // TODO: Implement with React Navigation
    console.warn('NativeNavigationAdapter not implemented yet');
    return '/';
  }

  canGoBack(): boolean {
    // TODO: Implement with React Navigation
    console.warn('NativeNavigationAdapter not implemented yet');
    return false;
  }

  addListener(_event: string, _callback: (data?: any) => void): () => void {
    // TODO: Implement with React Navigation
    console.warn('NativeNavigationAdapter not implemented yet');
    return () => {};
  }
}

/**
 * Memory navigation adapter (fallback)
 */
class MemoryNavigationAdapter implements NavigationAdapter {
  private currentRoute = '/';
  private history: string[] = ['/'];
  private listeners: { [event: string]: Array<(data?: any) => void> } = {};

  navigate(route: string, options?: NavigationOptions): void {
    if (options?.replace) {
      this.history[this.history.length - 1] = route;
    } else {
      this.history.push(route);
    }
    
    this.currentRoute = route;
    this.emit('state', { route });
  }

  goBack(): void {
    if (this.history.length > 1) {
      this.history.pop();
      this.currentRoute = this.history[this.history.length - 1];
      this.emit('state', { route: this.currentRoute });
    }
  }

  replace(route: string, options?: NavigationOptions): void {
    this.navigate(route, { ...options, replace: true });
  }

  reset(route: string, _options?: NavigationOptions): void {
    this.history = [route];
    this.currentRoute = route;
    this.emit('state', { route });
  }

  getCurrentRoute(): string {
    return this.currentRoute;
  }

  canGoBack(): boolean {
    return this.history.length > 1;
  }

  addListener(event: string, callback: (data?: any) => void): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    this.listeners[event].push(callback);

    return () => {
      const index = this.listeners[event]?.indexOf(callback);
      if (index !== undefined && index > -1) {
        this.listeners[event].splice(index, 1);
      }
    };
  }

  private emit(event: string, data?: any): void {
    this.listeners[event]?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Navigation listener error:', error);
      }
    });
  }
}

/**
 * Universal navigation instance
 * Automatically selects the appropriate navigation adapter based on platform
 */
export const navigation: NavigationAdapter = Platform.select({
  web: new WebNavigationAdapter(),
  native: new NativeNavigationAdapter(),
  default: new MemoryNavigationAdapter()
});

/**
 * UNITY app routes
 */
const ROUTES = {
  // Auth routes
  WELCOME: '/',
  ONBOARDING: '/onboarding',
  AUTH: '/auth',

  // Main app routes
  HOME: '/home',
  HISTORY: '/history',
  ACHIEVEMENTS: '/achievements',
  REPORTS: '/reports',
  SETTINGS: '/settings',

  // Admin routes
  ADMIN_LOGIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',

  // Utility routes
  NOT_FOUND: '/404'
} as const;

type RouteKey = keyof typeof ROUTES;

/**
 * Navigation utilities and route definitions
 */
export const NavigationUtils = {
  routes: ROUTES,

  /**
   * Navigate to route with type safety
   */
  navigateTo(route: RouteKey, options?: NavigationOptions): void {
    const routePath = ROUTES[route];
    navigation.navigate(routePath, options);
  },

  /**
   * Check if current route matches
   */
  isCurrentRoute(route: RouteKey): boolean {
    const routePath = ROUTES[route];
    const currentRoute = navigation.getCurrentRoute();
    
    // Handle exact match and path prefix match
    return currentRoute === routePath || currentRoute.startsWith(routePath + '/');
  },

  /**
   * Get route with parameters
   */
  buildRoute(route: string, params: RouteParams): string {
    let builtRoute = route;
    
    // Replace path parameters (e.g., /user/:id)
    Object.entries(params).forEach(([key, value]) => {
      builtRoute = builtRoute.replace(`:${key}`, String(value));
    });
    
    return builtRoute;
  },

  /**
   * Parse route parameters from current URL
   */
  getRouteParams(): RouteParams {
    if (!Platform.isBrowser) {
      return {};
    }

    const params: RouteParams = {};
    const searchParams = new URLSearchParams(window.location.search);
    
    searchParams.forEach((value, key) => {
      // Try to parse as number or boolean
      if (value === 'true') {
        params[key] = true;
      } else if (value === 'false') {
        params[key] = false;
      } else if (!isNaN(Number(value))) {
        params[key] = Number(value);
      } else {
        params[key] = value;
      }
    });

    return params;
  }
};
