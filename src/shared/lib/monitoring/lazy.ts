/**
 * Lazy Sentry Monitoring Wrapper
 *
 * Предоставляет lazy-loaded версии Sentry функций для уменьшения initial bundle
 *
 * @author UNITY Team
 * @date 2025-10-28
 */

let sentryModule: any = null;

/**
 * Lazy load Sentry module
 */
async function loadSentry() {
  if (!sentryModule) {
    sentryModule = await import('./index');
  }
  return sentryModule;
}

/**
 * Set user context (lazy loaded)
 */
export async function setUser(user: { id: string; email?: string; username?: string } | null) {
  if (!import.meta.env.PROD) {
    console.log('ℹ️ [Sentry Lazy] setUser (dev mode):', user);
    return;
  }

  try {
    const sentry = await loadSentry();
    sentry.setUser(user);
  } catch (error) {
    console.error('❌ [Sentry Lazy] Failed to set user:', error);
  }
}

/**
 * Add breadcrumb (lazy loaded)
 */
export async function addBreadcrumb(breadcrumb: {
  category?: string;
  message: string;
  level?: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';
  data?: Record<string, any>;
}) {
  if (!import.meta.env.PROD) {
    console.log('ℹ️ [Sentry Lazy] addBreadcrumb (dev mode):', breadcrumb);
    return;
  }

  try {
    const sentry = await loadSentry();
    sentry.addBreadcrumb(breadcrumb);
  } catch (error) {
    console.error('❌ [Sentry Lazy] Failed to add breadcrumb:', error);
  }
}

/**
 * Capture exception (lazy loaded)
 */
export async function captureException(error: Error, context?: any) {
  if (!import.meta.env.PROD) {
    console.error('🔴 [Sentry Lazy] captureException (dev mode):', error, context);
    return;
  }

  try {
    const sentry = await loadSentry();
    sentry.captureException(error, context);
  } catch (err) {
    console.error('❌ [Sentry Lazy] Failed to capture exception:', err);
  }
}

/**
 * Capture message (lazy loaded)
 */
export async function captureMessage(message: string, context?: any) {
  if (!import.meta.env.PROD) {
    console.log('ℹ️ [Sentry Lazy] captureMessage (dev mode):', message, context);
    return;
  }

  try {
    const sentry = await loadSentry();
    sentry.captureMessage(message, context);
  } catch (error) {
    console.error('❌ [Sentry Lazy] Failed to capture message:', error);
  }
}
