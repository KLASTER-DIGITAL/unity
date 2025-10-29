/**
 * Universal Toast Component - Native Implementation
 * 
 * Uses react-native-toast-message for React Native
 */

import React, { useEffect, useState } from 'react';
import type { ToastProps } from './types';

// Type definitions for react-native-toast-message
type ToastMessageModule = {
  default: {
    show: (config: any) => void;
    hide: () => void;
  };
  BaseToast: any;
};

let ToastMessage: ToastMessageModule | null = null;
let initialized = false;

/**
 * Initialize react-native-toast-message (lazy loading)
 */
async function initToastMessage(): Promise<void> {
  if (initialized) return;

  try {
    // Check if we're in a React Native environment
    if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
      // Dynamic import to avoid bundling in web
      // Use string interpolation to prevent Vite from trying to resolve the import
      const moduleName = 'react-native-toast-message';
      ToastMessage = await import(/* @vite-ignore */ moduleName);
      initialized = true;
    } else {
      throw new Error('react-native-toast-message is only available in React Native environment');
    }
  } catch (error) {
    console.error('Failed to load react-native-toast-message:', error);
    throw new Error('react-native-toast-message is not available. Make sure react-native-toast-message is installed.');
  }
}

/**
 * Toast API for React Native (react-native-toast-message)
 */
export const toast = {
  /**
   * Show success toast
   */
  success: (title: string, options?: Partial<ToastProps>) => {
    if (!ToastMessage) {
      console.warn('ToastMessage not initialized');
      return;
    }

    ToastMessage.default.show({
      type: 'success',
      text1: title,
      text2: options?.description,
      visibilityTime: options?.duration ?? 4000,
      onHide: options?.onDismiss,
      props: {
        action: options?.action,
      },
    });
  },

  /**
   * Show error toast
   */
  error: (title: string, options?: Partial<ToastProps>) => {
    if (!ToastMessage) {
      console.warn('ToastMessage not initialized');
      return;
    }

    ToastMessage.default.show({
      type: 'error',
      text1: title,
      text2: options?.description,
      visibilityTime: options?.duration ?? 4000,
      onHide: options?.onDismiss,
      props: {
        action: options?.action,
      },
    });
  },

  /**
   * Show info toast
   */
  info: (title: string, options?: Partial<ToastProps>) => {
    if (!ToastMessage) {
      console.warn('ToastMessage not initialized');
      return;
    }

    ToastMessage.default.show({
      type: 'info',
      text1: title,
      text2: options?.description,
      visibilityTime: options?.duration ?? 4000,
      onHide: options?.onDismiss,
      props: {
        action: options?.action,
      },
    });
  },

  /**
   * Show warning toast
   */
  warning: (title: string, options?: Partial<ToastProps>) => {
    if (!ToastMessage) {
      console.warn('ToastMessage not initialized');
      return;
    }

    ToastMessage.default.show({
      type: 'warning',
      text1: title,
      text2: options?.description,
      visibilityTime: options?.duration ?? 4000,
      onHide: options?.onDismiss,
      props: {
        action: options?.action,
      },
    });
  },

  /**
   * Show default toast
   */
  default: (title: string, options?: Partial<ToastProps>) => {
    if (!ToastMessage) {
      console.warn('ToastMessage not initialized');
      return;
    }

    ToastMessage.default.show({
      type: 'info',
      text1: title,
      text2: options?.description,
      visibilityTime: options?.duration ?? 4000,
      onHide: options?.onDismiss,
      props: {
        action: options?.action,
      },
    });
  },

  /**
   * Dismiss toast
   */
  dismiss: () => {
    if (!ToastMessage) {
      console.warn('ToastMessage not initialized');
      return;
    }

    ToastMessage.default.hide();
  },

  /**
   * Show loading toast
   */
  loading: (title: string, options?: Partial<ToastProps>) => {
    if (!ToastMessage) {
      console.warn('ToastMessage not initialized');
      return;
    }

    ToastMessage.default.show({
      type: 'info',
      text1: title,
      text2: options?.description,
      visibilityTime: options?.duration ?? 0, // 0 means infinite
      autoHide: false,
    });
  },

  /**
   * Show promise toast
   */
  promise: async <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    // Show loading toast
    toast.loading(options.loading);

    try {
      const result = await promise;
      
      // Show success toast
      const successMessage = typeof options.success === 'function' 
        ? options.success(result) 
        : options.success;
      
      toast.success(successMessage);
      
      return result;
    } catch (error) {
      // Show error toast
      const errorMessage = typeof options.error === 'function' 
        ? options.error(error) 
        : options.error;
      
      toast.error(errorMessage);
      
      throw error;
    }
  },
};

/**
 * Toast Container Component for React Native
 */
export interface ToasterProps {
  position?: 'top' | 'bottom';
}

export function Toaster({ position = 'top' }: ToasterProps = {}) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initToastMessage().then(() => setIsReady(true)).catch(console.error);
  }, []);

  if (!isReady || !ToastMessage) {
    // Fallback: render nothing
    return null;
  }

  const ToastMessageComponent = ToastMessage.default;

  // @ts-expect-error - ToastMessageComponent type is complex and not worth typing for PWA build
  return React.createElement(ToastMessageComponent, {
    position,
  });
}

