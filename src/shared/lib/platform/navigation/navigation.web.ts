/**
 * Web Navigation Adapter
 * 
 * Uses window.history API for navigation
 * 
 * @module platform/navigation/web
 */

import type { NavigationAdapter, NavigationOptions, RouteParams } from '../navigation';
import { Platform } from '../index';

/**
 * Web navigation adapter using browser History API
 */
export class WebNavigationAdapter implements NavigationAdapter {
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

