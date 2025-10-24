/**
 * Prefetch utilities for lazy-loaded components
 * Improves perceived performance by preloading components before they're needed
 */

/**
 * Prefetch a lazy-loaded component
 * @param importFn - The import function returned by React.lazy
 */
export function prefetchComponent(importFn: () => Promise<any>): void {
  // Start loading the component in the background
  importFn().catch((error) => {
    console.error('[Prefetch] Failed to prefetch component:', error);
  });
}

/**
 * Prefetch multiple components in parallel
 * @param importFns - Array of import functions
 */
export async function prefetchComponents(importFns: Array<() => Promise<any>>): Promise<void> {
  try {
    await Promise.all(importFns.map(fn => fn()));
  } catch (error) {
    console.error('[Prefetch] Failed to prefetch components:', error);
  }
}

/**
 * Prefetch component on hover (for links/buttons)
 * @param importFn - The import function to prefetch
 */
export function createHoverPrefetch(importFn: () => Promise<any>) {
  let prefetched = false;
  
  return () => {
    if (!prefetched) {
      prefetched = true;
      prefetchComponent(importFn);
    }
  };
}

/**
 * Prefetch component on idle (when browser is idle)
 * @param importFn - The import function to prefetch
 * @param timeout - Timeout in ms (default: 2000)
 */
export function prefetchOnIdle(importFn: () => Promise<any>, timeout = 2000): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      prefetchComponent(importFn);
    }, { timeout });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      prefetchComponent(importFn);
    }, timeout);
  }
}

/**
 * Prefetch component on interaction (click, touch, focus)
 * @param element - DOM element to attach listeners to
 * @param importFn - The import function to prefetch
 */
export function prefetchOnInteraction(
  element: HTMLElement | null,
  importFn: () => Promise<any>
): () => void {
  if (!element) return () => {};

  let prefetched = false;
  
  const handleInteraction = () => {
    if (!prefetched) {
      prefetched = true;
      prefetchComponent(importFn);
    }
  };

  element.addEventListener('mouseenter', handleInteraction, { once: true });
  element.addEventListener('touchstart', handleInteraction, { once: true });
  element.addEventListener('focus', handleInteraction, { once: true });

  // Cleanup function
  return () => {
    element.removeEventListener('mouseenter', handleInteraction);
    element.removeEventListener('touchstart', handleInteraction);
    element.removeEventListener('focus', handleInteraction);
  };
}

/**
 * Prefetch based on viewport visibility (Intersection Observer)
 * @param element - DOM element to observe
 * @param importFn - The import function to prefetch
 * @param options - Intersection Observer options
 */
export function prefetchOnVisible(
  element: HTMLElement | null,
  importFn: () => Promise<any>,
  options: IntersectionObserverInit = { rootMargin: '50px' }
): () => void {
  if (!element || !('IntersectionObserver' in window)) {
    return () => {};
  }

  let prefetched = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !prefetched) {
        prefetched = true;
        prefetchComponent(importFn);
        observer.disconnect();
      }
    });
  }, options);

  observer.observe(element);

  // Cleanup function
  return () => {
    observer.disconnect();
  };
}

/**
 * Smart prefetch strategy based on connection speed
 * Only prefetches on fast connections (4G, WiFi)
 */
export function smartPrefetch(importFn: () => Promise<any>): void {
  // Check if Network Information API is available
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) {
    // No connection info, prefetch anyway
    prefetchOnIdle(importFn);
    return;
  }

  const effectiveType = connection.effectiveType;
  const saveData = connection.saveData;

  // Don't prefetch if user has data saver enabled
  if (saveData) {
    console.log('[Prefetch] Data saver enabled, skipping prefetch');
    return;
  }

  // Only prefetch on fast connections
  if (effectiveType === '4g' || effectiveType === 'wifi') {
    prefetchOnIdle(importFn);
  } else {
    console.log('[Prefetch] Slow connection detected, skipping prefetch');
  }
}

/**
 * Prefetch routes based on user navigation patterns
 * Predicts next route and prefetches it
 */
export class RoutePrefetcher {
  private routes: Map<string, () => Promise<any>> = new Map();
  private navigationHistory: string[] = [];
  private maxHistoryLength = 10;

  /**
   * Register a route for prefetching
   */
  registerRoute(path: string, importFn: () => Promise<any>): void {
    this.routes.set(path, importFn);
  }

  /**
   * Track navigation to a route
   */
  trackNavigation(path: string): void {
    this.navigationHistory.push(path);
    
    // Keep history limited
    if (this.navigationHistory.length > this.maxHistoryLength) {
      this.navigationHistory.shift();
    }

    // Predict and prefetch next route
    this.predictAndPrefetch();
  }

  /**
   * Predict next route based on history and prefetch it
   */
  private predictAndPrefetch(): void {
    if (this.navigationHistory.length < 2) return;

    // Simple prediction: if user went A -> B multiple times, prefetch B when on A
    const currentRoute = this.navigationHistory[this.navigationHistory.length - 1];
    const patterns = this.findPatterns();

    const nextRoute = patterns.get(currentRoute);
    if (nextRoute) {
      const importFn = this.routes.get(nextRoute);
      if (importFn) {
        smartPrefetch(importFn);
      }
    }
  }

  /**
   * Find navigation patterns in history
   */
  private findPatterns(): Map<string, string> {
    const patterns = new Map<string, Map<string, number>>();

    // Analyze navigation history
    for (let i = 0; i < this.navigationHistory.length - 1; i++) {
      const from = this.navigationHistory[i];
      const to = this.navigationHistory[i + 1];

      if (!patterns.has(from)) {
        patterns.set(from, new Map());
      }

      const transitions = patterns.get(from)!;
      transitions.set(to, (transitions.get(to) || 0) + 1);
    }

    // Find most common transition for each route
    const predictions = new Map<string, string>();
    patterns.forEach((transitions, from) => {
      let maxCount = 0;
      let mostCommon = '';

      transitions.forEach((count, to) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommon = to;
        }
      });

      if (mostCommon) {
        predictions.set(from, mostCommon);
      }
    });

    return predictions;
  }
}

/**
 * Global route prefetcher instance
 */
export const routePrefetcher = new RoutePrefetcher();

