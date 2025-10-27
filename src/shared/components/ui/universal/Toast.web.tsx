/**
 * Universal Toast Component - Web Implementation
 * 
 * Uses sonner for React Web (PWA)
 */

import { toast as sonnerToast, Toaster as SonnerToaster } from 'sonner';
import type { ToastProps } from './types';

/**
 * Toast API for Web (sonner)
 */
export const toast = {
  /**
   * Show success toast
   */
  success: (title: string, options?: Partial<ToastProps>) => {
    return sonnerToast.success(title, {
      description: options?.description,
      duration: options?.duration ?? 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
      onDismiss: options?.onDismiss,
      id: options?.id,
    });
  },

  /**
   * Show error toast
   */
  error: (title: string, options?: Partial<ToastProps>) => {
    return sonnerToast.error(title, {
      description: options?.description,
      duration: options?.duration ?? 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
      onDismiss: options?.onDismiss,
      id: options?.id,
    });
  },

  /**
   * Show info toast
   */
  info: (title: string, options?: Partial<ToastProps>) => {
    return sonnerToast.info(title, {
      description: options?.description,
      duration: options?.duration ?? 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
      onDismiss: options?.onDismiss,
      id: options?.id,
    });
  },

  /**
   * Show warning toast
   */
  warning: (title: string, options?: Partial<ToastProps>) => {
    return sonnerToast.warning(title, {
      description: options?.description,
      duration: options?.duration ?? 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
      onDismiss: options?.onDismiss,
      id: options?.id,
    });
  },

  /**
   * Show default toast
   */
  default: (title: string, options?: Partial<ToastProps>) => {
    return sonnerToast(title, {
      description: options?.description,
      duration: options?.duration ?? 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
      onDismiss: options?.onDismiss,
      id: options?.id,
    });
  },

  /**
   * Dismiss a toast by ID
   */
  dismiss: (id?: string) => {
    if (id) {
      sonnerToast.dismiss(id);
    } else {
      sonnerToast.dismiss();
    }
  },

  /**
   * Show loading toast
   */
  loading: (title: string, options?: Partial<ToastProps>) => {
    return sonnerToast.loading(title, {
      description: options?.description,
      duration: options?.duration ?? Infinity,
      id: options?.id,
    });
  },

  /**
   * Show promise toast
   */
  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, options);
  },
};

/**
 * Toast Container Component for Web
 */
export interface ToasterProps {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  theme?: 'light' | 'dark' | 'system';
  richColors?: boolean;
  expand?: boolean;
  visibleToasts?: number;
  closeButton?: boolean;
}

export function Toaster({
  position = 'top-center',
  theme = 'system',
  richColors = true,
  expand = false,
  visibleToasts = 3,
  closeButton = false,
}: ToasterProps = {}) {
  return (
    <SonnerToaster
      position={position}
      theme={theme}
      richColors={richColors}
      expand={expand}
      visibleToasts={visibleToasts}
      closeButton={closeButton}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
    />
  );
}

