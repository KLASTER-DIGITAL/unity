/**
 * Universal Toast Component
 * 
 * Platform-agnostic toast notifications that work in both React Web and React Native.
 * 
 * Usage:
 * ```tsx
 * import { toast, Toaster } from '@/shared/components/ui/universal/Toast';
 * 
 * // In your root component
 * <Toaster position="top-center" />
 * 
 * // Show toasts
 * toast.success('Success!');
 * toast.error('Error!', { description: 'Something went wrong' });
 * toast.info('Info message');
 * toast.warning('Warning!');
 * 
 * // With action
 * toast.success('File uploaded', {
 *   action: {
 *     label: 'Undo',
 *     onClick: () => console.log('Undo clicked')
 *   }
 * });
 * 
 * // Promise toast
 * toast.promise(
 *   fetchData(),
 *   {
 *     loading: 'Loading...',
 *     success: 'Data loaded!',
 *     error: 'Failed to load data'
 *   }
 * );
 * ```
 */

import { Platform } from '@/shared/lib/platform';

// Import web and native implementations
import * as WebToast from './Toast.web';

// Platform-specific exports
const platformToast = Platform.select({
  web: WebToast.toast,
  native: WebToast.toast, // Placeholder - will be replaced with NativeToast in RN
  default: WebToast.toast,
});

const platformToaster = Platform.select({
  web: WebToast.Toaster,
  native: WebToast.Toaster, // Placeholder - will be replaced with NativeToaster in RN
  default: WebToast.Toaster,
});

/**
 * Universal toast API
 */
export const toast = platformToast;

/**
 * Universal Toaster component
 */
export const Toaster = platformToaster;

/**
 * Re-export types
 */
export type { ToastProps } from './types';
export type { ToasterProps } from './Toast.web';

