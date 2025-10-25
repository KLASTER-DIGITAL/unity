/**
 * Performance Monitoring System for UNITY-v2
 * 
 * Tracks Core Web Vitals and custom performance metrics
 * 
 * @author UNITY Team
 * @date 2025-10-24
 */

import { Platform } from '../platform';

/**
 * Core Web Vitals metrics
 */
export interface WebVitalsMetrics {
  // Largest Contentful Paint (LCP) - Loading performance
  lcp?: number;
  
  // First Input Delay (FID) - Interactivity
  fid?: number;
  
  // Cumulative Layout Shift (CLS) - Visual stability
  cls?: number;
  
  // First Contentful Paint (FCP) - Loading
  fcp?: number;
  
  // Time to First Byte (TTFB) - Server response
  ttfb?: number;
  
  // Interaction to Next Paint (INP) - Responsiveness
  inp?: number;
}

/**
 * Custom performance metrics
 */
export interface CustomMetrics {
  // Time to Interactive
  tti?: number;
  
  // Total Blocking Time
  tbt?: number;
  
  // Speed Index
  speedIndex?: number;
  
  // Bundle size
  bundleSize?: number;
  
  // Memory usage
  memoryUsage?: number;
  
  // API response times
  apiResponseTimes?: Record<string, number>;
}

/**
 * Performance entry
 */
export interface PerformanceEntry {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

/**
 * Performance thresholds (based on Google's recommendations)
 */
export const PERFORMANCE_THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  fcp: { good: 1800, poor: 3000 },
  ttfb: { good: 800, poor: 1800 },
  inp: { good: 200, poor: 500 }
};

/**
 * Performance Monitor
 */
export class PerformanceMonitor {
  private metrics: Map<string, PerformanceEntry> = new Map();
  private observers: PerformanceObserver[] = [];
  private listeners: Array<(entry: PerformanceEntry) => void> = [];

  constructor() {
    if (Platform.isBrowser) {
      this.initializeObservers();
    }
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    try {
      // Observe LCP
      this.observeLCP();
      
      // Observe FID
      this.observeFID();
      
      // Observe CLS
      this.observeCLS();
      
      // Observe FCP
      this.observeFCP();
      
      // Observe TTFB
      this.observeTTFB();
      
      // Observe INP
      this.observeINP();
    } catch (error) {
      console.error('Failed to initialize performance observers:', error);
    }
  }

  /**
   * Observe Largest Contentful Paint (LCP)
   */
  private observeLCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        
        if (lastEntry) {
          this.recordMetric('lcp', lastEntry.renderTime || lastEntry.loadTime);
        }
      });
      
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn('LCP observation not supported:', error);
    }
  }

  /**
   * Observe First Input Delay (FID)
   */
  private observeFID(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric('fid', entry.processingStart - entry.startTime);
        });
      });
      
      observer.observe({ type: 'first-input', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FID observation not supported:', error);
    }
  }

  /**
   * Observe Cumulative Layout Shift (CLS)
   */
  private observeCLS(): void {
    try {
      let clsValue = 0;
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.recordMetric('cls', clsValue);
          }
        });
      });
      
      observer.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn('CLS observation not supported:', error);
    }
  }

  /**
   * Observe First Contentful Paint (FCP)
   */
  private observeFCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('fcp', entry.startTime);
          }
        });
      });
      
      observer.observe({ type: 'paint', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FCP observation not supported:', error);
    }
  }

  /**
   * Observe Time to First Byte (TTFB)
   */
  private observeTTFB(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.responseStart > 0) {
            this.recordMetric('ttfb', entry.responseStart - entry.requestStart);
          }
        });
      });
      
      observer.observe({ type: 'navigation', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn('TTFB observation not supported:', error);
    }
  }

  /**
   * Observe Interaction to Next Paint (INP)
   */
  private observeINP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        let maxDuration = 0;
        
        entries.forEach((entry: any) => {
          if (entry.duration > maxDuration) {
            maxDuration = entry.duration;
          }
        });
        
        if (maxDuration > 0) {
          this.recordMetric('inp', maxDuration);
        }
      });
      
      observer.observe({ type: 'event', buffered: true } as any);
      this.observers.push(observer);
    } catch (error) {
      console.warn('INP observation not supported:', error);
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(name: string, value: number): void {
    const rating = this.getRating(name, value);
    const entry: PerformanceEntry = {
      name,
      value,
      rating,
      timestamp: Date.now()
    };
    
    this.metrics.set(name, entry);
    this.notifyListeners(entry);
    
    // Log in development
    if (import.meta.env.DEV) {
      console.log(`📊 Performance: ${name.toUpperCase()} = ${value.toFixed(2)}ms (${rating})`);
    }
  }

  /**
   * Get rating for a metric
   */
  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = PERFORMANCE_THRESHOLDS[name as keyof typeof PERFORMANCE_THRESHOLDS];
    
    if (!threshold) return 'good';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Get all metrics
   */
  getMetrics(): WebVitalsMetrics {
    return {
      lcp: this.metrics.get('lcp')?.value,
      fid: this.metrics.get('fid')?.value,
      cls: this.metrics.get('cls')?.value,
      fcp: this.metrics.get('fcp')?.value,
      ttfb: this.metrics.get('ttfb')?.value,
      inp: this.metrics.get('inp')?.value
    };
  }

  /**
   * Get metric by name
   */
  getMetric(name: string): PerformanceEntry | undefined {
    return this.metrics.get(name);
  }

  /**
   * Add listener for performance entries
   */
  addListener(callback: (entry: PerformanceEntry) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(entry: PerformanceEntry): void {
    this.listeners.forEach(callback => {
      try {
        callback(entry);
      } catch (error) {
        console.error('Performance listener error:', error);
      }
    });
  }

  /**
   * Disconnect all observers
   */
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.listeners = [];
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Report Web Vitals to analytics
 */
export function reportWebVitals(onPerfEntry?: (entry: PerformanceEntry) => void): void {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    performanceMonitor.addListener(onPerfEntry);
  }
}

