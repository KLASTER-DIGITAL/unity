/**
 * Universal Toast Component
 *
 * ✅ PWA + React Native Architecture:
 * - PWA build (src/): ONLY web implementation (sonner)
 * - React Native build (/app/): Uses /app/shared/components/ui/universal/Toast.native.tsx
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

// ✅ PWA + React Native Architecture: ONLY import web module in PWA build
// React Native files are in /app/shared/ and NOT bundled by Vite
import * as WebToast from './Toast.web';

/**
 * Universal toast API
 * PWA build: ONLY web implementation (sonner)
 * React Native build: Uses /app/shared/components/ui/universal/Toast.native.tsx
 */
export const toast = WebToast.toast;

/**
 * Universal Toaster component
 * PWA build: ONLY web implementation (sonner)
 * React Native build: Uses /app/shared/components/ui/universal/Toast.native.tsx
 */
export const Toaster = WebToast.Toaster;

export type { ToasterProps } from './Toast.web';
/**
 * Re-export types
 */
export type { ToastProps } from './types';
