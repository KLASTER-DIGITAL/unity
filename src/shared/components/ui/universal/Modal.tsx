/**
 * Universal Modal Component for UNITY-v2
 * 
 * Cross-platform modal that works on both Web and React Native
 * Replaces @radix-ui/react-dialog
 * 
 * @author UNITY Team
 * @date 2025-01-18
 */

import React, { useEffect, forwardRef } from 'react';
import { Platform } from '../../../lib/platform';
import { cn } from '../utils';
import { XIcon } from 'lucide-react';
import {
  UniversalEventHandlers,
  ModalProps,
  ModalSize
} from './types';

/**
 * Extended Modal component props
 */
export interface ExtendedModalProps extends ModalProps, UniversalEventHandlers {
  /**
   * Modal content
   */
  children: React.ReactNode;

  /**
   * Header content
   */
  header?: React.ReactNode;

  /**
   * Footer content
   */
  footer?: React.ReactNode;

  /**
   * Close on backdrop click
   */
  closeOnBackdrop?: boolean;

  /**
   * Close on escape key
   */
  closeOnEscape?: boolean;

  /**
   * Show close button
   */
  showCloseButton?: boolean;

  /**
   * Custom close button
   */
  closeButton?: React.ReactNode;

  /**
   * Z-index for modal
   */
  zIndex?: number;

  /**
   * Custom backdrop color
   */
  backdropColor?: string;

  /**
   * Prevent body scroll (web only)
   */
  preventBodyScroll?: boolean;
}

/**
 * Web-specific modal implementation
 */
const WebModal = forwardRef<HTMLDivElement, ExtendedModalProps>(
  ({ 
    open = false,
    onOpenChange,
    title,
    description,
    size = 'md',
    closable = true,
    backdrop = true,
    animation = 'fade',
    closeOnBackdrop = true,
    closeOnEscape = true,
    showCloseButton = true,
    closeButton,
    zIndex = 50,
    backdropColor = 'rgba(0, 0, 0, 0.5)',
    preventBodyScroll = true,
    children,
    header,
    footer,
    className,
    testID,
    accessibilityLabel,
    ...props 
  }, ref) => {
    // Handle escape key
    useEffect(() => {
      if (!open || !closeOnEscape) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onOpenChange) {
          onOpenChange(false);
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [open, closeOnEscape, onOpenChange]);

    // Prevent body scroll
    useEffect(() => {
      if (!open || !preventBodyScroll) return;

      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalStyle;
      };
    }, [open, preventBodyScroll]);

    if (!open) return null;

    // Size styles
    const sizeStyles = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full h-full'
    };

    // Animation styles
    const animationStyles = {
      fade: 'animate-in fade-in-0 duration-200',
      slide: 'animate-in slide-in-from-bottom-4 duration-300',
      scale: 'animate-in zoom-in-95 duration-200',
      bounce: 'animate-in zoom-in-95 duration-300',
      none: ''
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && closeOnBackdrop && onOpenChange) {
        onOpenChange(false);
      }
    };

    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center p-4',
          animationStyles[animation]
        )}
        style={{ zIndex }}
        data-testid={testID}
        aria-label={accessibilityLabel}
      >
        {/* Backdrop */}
        {backdrop && (
          <div
            className="fixed inset-0 bg-black/50"
            style={{ backgroundColor: backdropColor }}
            onClick={handleBackdropClick}
          />
        )}

        {/* Modal Content */}
        <div
          ref={ref}
          className={cn(
            'relative bg-background rounded-lg shadow-lg border max-h-[90vh] overflow-hidden',
            'flex flex-col w-full',
            sizeStyles[size],
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby={description ? 'modal-description' : undefined}
          {...props}
        >
          {/* Header */}
          {(title || description || header || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex-1">
                {header || (
                  <>
                    {title && (
                      <h2 id="modal-title" className="text-lg font-semibold">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p id="modal-description" className="text-sm text-muted-foreground mt-1">
                        {description}
                      </p>
                    )}
                  </>
                )}
              </div>
              
              {closable && showCloseButton && (
                <button
                  type="button"
                  className="ml-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => onOpenChange && onOpenChange(false)}
                  aria-label="Close modal"
                >
                  {closeButton || <XIcon className="h-4 w-4" />}
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t p-6">
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }
);

/**
 * React Native modal implementation (placeholder)
 */
const NativeModal = forwardRef<any, ExtendedModalProps>(
  ({ 
    open = false,
    onOpenChange,
    title,
    description,
    size = 'md',
    closable = true,
    backdrop = true,
    closeOnBackdrop = true,
    showCloseButton = true,
    children,
    header,
    footer,
    testID,
    accessibilityLabel,
    style,
    ...props 
  }, ref) => {
    // TODO: Implement React Native modal using Modal component
    // This is a placeholder for React Native implementation
    
    if (!open) return null;

    const handleBackdropPress = () => {
      if (closeOnBackdrop && onOpenChange) {
        onOpenChange(false);
      }
    };

    return (
      <div
        ref={ref}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          ...style
        }}
        data-testid={testID}
        aria-label={accessibilityLabel}
        {...props}
      >
        {/* Backdrop */}
        {backdrop && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
            onClick={handleBackdropPress}
          />
        )}

        {/* Modal Content */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 8,
            maxWidth: size === 'full' ? '100%' : size === 'lg' ? 400 : size === 'xl' ? 500 : 300,
            width: '100%',
            maxHeight: '90%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}
        >
          {/* Header */}
          {(title || description || header || showCloseButton) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#E5E5EA'
              }}
            >
              <div style={{ flex: 1 }}>
                {header || (
                  <>
                    {title && (
                      <h2 style={{ fontSize: 18, fontWeight: '600', margin: 0 }}>
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p style={{ fontSize: 14, color: '#8E8E93', margin: '4px 0 0 0' }}>
                        {description}
                      </p>
                    )}
                  </>
                )}
              </div>
              
              {closable && showCloseButton && (
                <button
                  type="button"
                  style={{
                    marginLeft: 16,
                    padding: 4,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    borderRadius: 4
                  }}
                  onClick={() => onOpenChange && onOpenChange(false)}
                  aria-label="Close modal"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div
              style={{
                borderTopWidth: 1,
                borderTopColor: '#E5E5EA',
                padding: 16
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }
);

/**
 * Universal Modal component
 */
export const Modal = Platform.select({
  web: WebModal,
  native: NativeModal,
  default: WebModal
});

Modal.displayName = 'Modal';

/**
 * Modal utilities
 */
export const ModalUtils = {
  /**
   * Get modal size styles
   */
  getSizeStyles: (size: ModalSize) => {
    const styles = {
      sm: { maxWidth: 300 },
      md: { maxWidth: 400 },
      lg: { maxWidth: 500 },
      xl: { maxWidth: 600 },
      full: { maxWidth: '100%', height: '100%' }
    };
    return styles[size] || styles.md;
  },

  /**
   * Validate modal props
   */
  validateProps: (props: ExtendedModalProps) => {
    const errors: string[] = [];
    
    if (props.size && !['sm', 'md', 'lg', 'xl', 'full'].includes(props.size)) {
      errors.push(`Invalid size: ${props.size}`);
    }
    
    if (props.animation && !['fade', 'slide', 'scale', 'bounce', 'none'].includes(props.animation)) {
      errors.push(`Invalid animation: ${props.animation}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
};

export default Modal;
