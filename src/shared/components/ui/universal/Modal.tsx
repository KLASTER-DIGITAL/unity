/**
 * Universal Modal Component for UNITY-v2
 *
 * Cross-platform modal that works on both Web and React Native
 * Replaces @radix-ui/react-dialog
 *
 * @author UNITY Team
 * @date 2025-01-18
 */

import { XIcon } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { cn } from '../utils';
import type { ModalProps, ModalSize, UniversalEventHandlers } from './types';

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
const WebModal = ({
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
  ref,
  ...props
}: ExtendedModalProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
  // Handle escape key
  useEffect(() => {
    if (!(open && closeOnEscape)) {
      return;
    }

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
    if (!(open && preventBodyScroll)) {
      return;
    }

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [open, preventBodyScroll]);

  if (!open) {
    return null;
  }

  // Size styles
  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full h-full',
  };

  // Animation styles
  const animationStyles = {
    fade: 'animate-in fade-in-0 duration-200',
    slide: 'animate-in slide-in-from-bottom-4 duration-300',
    scale: 'animate-in zoom-in-95 duration-200',
    bounce: 'animate-in zoom-in-95 duration-300',
    none: '',
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdrop && onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <div
      aria-label={accessibilityLabel}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        animationStyles[animation]
      )}
      data-testid={testID}
      style={{ zIndex }}
    >
      {/* Backdrop */}
      {backdrop && (
        <div
          className="fixed inset-0 bg-black/50"
          onClick={handleBackdropClick}
          style={{ backgroundColor: backdropColor }}
        />
      )}

      {/* Modal Content */}
      <div
        aria-describedby={description ? 'modal-description' : undefined}
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-modal="true"
        className={cn(
          'relative max-h-[90vh] overflow-hidden rounded-lg border bg-background shadow-lg',
          'flex w-full flex-col',
          sizeStyles[size],
          className
        )}
        ref={ref}
        role="dialog"
        {...props}
      >
        {/* Header */}
        {(title || description || header || showCloseButton) && (
          <div className="flex items-center justify-between border-b p-6">
            <div className="flex-1">
              {header || (
                <>
                  {title && (
                    <h2 className="font-semibold text-lg" id="modal-title">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1 text-muted-foreground text-sm" id="modal-description">
                      {description}
                    </p>
                  )}
                </>
              )}
            </div>

            {closable && showCloseButton && (
              <button
                aria-label="Close modal"
                className="ml-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={() => onOpenChange?.(false)}
                type="button"
              >
                {closeButton || <XIcon className="h-4 w-4" />}
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">{children}</div>

        {/* Footer */}
        {footer && <div className="border-t p-6">{footer}</div>}
      </div>
    </div>
  );
};

/**
 * Universal Modal component
 *
 * ✅ PWA + React Native Architecture:
 * - PWA build (src/): ONLY web implementation
 * - React Native build (/app/): Uses /app/shared/components/ui/universal/Modal.native.tsx
 */
export const Modal = WebModal as typeof WebModal & { displayName: string };

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
      full: { maxWidth: '100%', height: '100%' },
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

    if (
      props.animation &&
      !['fade', 'slide', 'scale', 'bounce', 'none'].includes(props.animation)
    ) {
      errors.push(`Invalid animation: ${props.animation}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

export default Modal;
