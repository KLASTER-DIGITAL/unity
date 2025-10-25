/**
 * 🚀 LAZY LOADING UTILITIES
 * Dynamic imports with preloading and error handling
 */

import { lazy, ComponentType } from 'react';

interface LazyLoadOptions {
  /**
   * Delay before loading (ms)
   * Useful for preventing flash of loading state
   */
  delay?: number;

  /**
   * Preload the component
   * Useful for components that will likely be needed soon
   */
  preload?: boolean;

  /**
   * Retry failed imports
   */
  retry?: number;
}

/**
 * Enhanced lazy loading with retry logic
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  _options: LazyLoadOptions = {}
): React.LazyExoticComponent<T> {
  const { delay = 0, retry = 3 } = _options;

  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      const attemptImport = async (attemptsLeft: number) => {
        try {
          // Add delay if specified
          if (delay > 0) {
            await new Promise(r => setTimeout(r, delay));
          }

          const module = await importFunc();
          resolve(module);
        } catch (error) {
          if (attemptsLeft <= 0) {
            console.error('Failed to load component after retries:', error);
            reject(error);
            return;
          }

          console.warn(`Import failed, retrying... (${attemptsLeft} attempts left)`);
          
          // Exponential backoff
          const backoffDelay = (retry - attemptsLeft + 1) * 1000;
          await new Promise(r => setTimeout(r, backoffDelay));
          
          attemptImport(attemptsLeft - 1);
        }
      };

      attemptImport(retry);
    });
  });
}

/**
 * Preload a lazy component
 */
export function preloadComponent<T extends ComponentType<any>>(
  LazyComponent: React.LazyExoticComponent<T>
): void {
  // @ts-ignore - accessing internal _ctor
  const componentPromise = LazyComponent._ctor?.();
  
  if (componentPromise) {
    componentPromise.catch((error: Error) => {
      console.error('Failed to preload component:', error);
    });
  }
}

/**
 * Lazy load with automatic preloading on hover/focus
 */
export function lazyWithPreload<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  // // options: LazyLoadOptions = {}
): {
  Component: React.LazyExoticComponent<T>;
  preload: () => void;
} {
  let preloadPromise: Promise<{ default: T }> | null = null;

  const preload = () => {
    if (!preloadPromise) {
      console.log('🚀 Preloading component...');
      preloadPromise = importFunc();
    }
    return preloadPromise;
  };

  const Component = lazy(() => {
    if (preloadPromise) {
      return preloadPromise;
    }
    return importFunc();
  });

  return { Component, preload };
}

/**
 * Route-based code splitting helper
 */
export const routes = {
  // Mobile routes
  home: () => lazyWithRetry(() => import('@/features/mobile/home/components/AchievementHomeScreen')),
  history: () => lazyWithRetry(() => import('@/features/mobile/history/components/HistoryScreen')),
  achievements: () => lazyWithRetry(() => import('@/features/mobile/achievements/components/AchievementsScreen')),
  reports: () => lazyWithRetry(() => import('@/features/mobile/reports/components/ReportsScreen')),
  settings: () => lazyWithRetry(() => import('@/features/mobile/settings/components/SettingsScreen')),
  
  // Admin routes
  adminDashboard: () => lazyWithRetry(() => import('@/features/admin/dashboard/components/AdminDashboard')),
  
  // Auth routes
  welcome: () => lazyWithRetry(() => import('@/features/mobile/auth/components/WelcomeScreen')),
  auth: () => lazyWithRetry(() => import('@/features/mobile/auth/components/AuthScreenNew')),
  onboarding2: () => lazyWithRetry(() => import('@/features/mobile/auth/components/OnboardingScreen2')),
  onboarding3: () => lazyWithRetry(() => import('@/features/mobile/auth/components/OnboardingScreen3')),
  onboarding4: () => lazyWithRetry(() => import('@/features/mobile/auth/components/OnboardingScreen4')),
};

/**
 * Preload critical routes
 */
export function preloadCriticalRoutes() {
  console.log('🚀 Preloading critical routes...');
  
  // Preload home screen (most likely next screen after auth)
  const HomeScreen = routes.home();
  preloadComponent(HomeScreen);
  
  // Preload settings (frequently accessed)
  const SettingsScreen = routes.settings();
  preloadComponent(SettingsScreen);
}

/**
 * Preload route on link hover
 */
export function createPreloadLink(
  routeName: keyof typeof routes,
  onMouseEnter?: () => void
) {
  return {
    onMouseEnter: () => {
      const LazyComponent = routes[routeName]() as any;
      preloadComponent(LazyComponent);
      onMouseEnter?.();
    },
    onFocus: () => {
      const LazyComponent = routes[routeName]() as any;
      preloadComponent(LazyComponent);
    }
  };
}

/**
 * Bundle size analyzer helper
 */
export function logBundleSize(componentName: string, startTime: number) {
  const loadTime = performance.now() - startTime;
  console.log(`📦 [BUNDLE] ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
  
  // Log performance entry if available
  const entries = performance.getEntriesByType('resource');
  const componentEntry = entries.find(entry => 
    entry.name.includes(componentName.toLowerCase())
  );
  
  if (componentEntry) {
    const size = (componentEntry as any).transferSize;
    if (size) {
      console.log(`📦 [BUNDLE] ${componentName} size: ${(size / 1024).toFixed(2)}KB`);
    }
  }
}

