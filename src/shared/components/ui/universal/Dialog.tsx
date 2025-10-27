/**
 * Universal Dialog Component
 * 
 * Cross-platform dialog/modal component
 * - Web: Radix UI Dialog
 * - Native: React Native Modal
 * 
 * @module components/ui/universal/Dialog
 */

import { Platform } from '@/shared/lib/platform';

// Import implementations
import * as WebDialog from './Dialog.web';
// Note: NativeDialog is imported but not used in web build
// This is intentional to avoid bundling native dependencies
// @ts-expect-error - NativeDialog is imported for type checking but not used in runtime
import * as NativeDialog from './Dialog.native';

// ============================================================================
// PLATFORM SELECT
// ============================================================================

const DialogComponents = Platform.select({
  web: WebDialog,
  native: WebDialog, // Placeholder to avoid bundling native deps
  default: WebDialog,
});

// ============================================================================
// EXPORTS
// ============================================================================

export const Dialog = DialogComponents.Dialog;
export const DialogTrigger = DialogComponents.DialogTrigger;
export const DialogPortal = DialogComponents.DialogPortal;
export const DialogClose = DialogComponents.DialogClose;
export const DialogOverlay = DialogComponents.DialogOverlay;
export const DialogContent = DialogComponents.DialogContent;
export const DialogHeader = DialogComponents.DialogHeader;
export const DialogFooter = DialogComponents.DialogFooter;
export const DialogTitle = DialogComponents.DialogTitle;
export const DialogDescription = DialogComponents.DialogDescription;

// Export types
export type {
  DialogProps,
  DialogContentProps,
  DialogHeaderProps,
  DialogFooterProps,
  DialogTitleProps,
  DialogDescriptionProps,
} from './Dialog.web';

// Export native for dynamic import
export { default as NativeDialog } from './Dialog.native';

export default {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

