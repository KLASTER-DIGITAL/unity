/**
 * Sentry Integration for UNITY-v2
 * 
 * Мониторинг ошибок и производительности в production
 * 
 * @author UNITY Team
 * @date 2025-10-21
 */

import * as Sentry from '@sentry/react';

/**
 * Инициализация Sentry
 * 
 * Вызывается один раз при старте приложения в main.tsx
 * 
 * @example
 * import { initSentry } from '@/shared/lib/monitoring/sentry';
 * initSentry();
 */
export function initSentry() {
  // Инициализируем только в production
  if (import.meta.env.PROD) {
    const dsn = import.meta.env.VITE_SENTRY_DSN;

    if (!dsn) {
      console.warn('⚠️ [Sentry] VITE_SENTRY_DSN не установлен. Sentry не будет работать.');
      return;
    }

    Sentry.init({
      dsn,
      
      // Интеграции
      integrations: [
        // Browser Tracing для мониторинга производительности
        Sentry.browserTracingIntegration({
          // Отслеживание навигации
          tracePropagationTargets: [
            'localhost',
            /^https:\/\/unity-wine\.vercel\.app/,
            /^https:\/\/.*\.vercel\.app/,
            /^https:\/\/.*\.supabase\.co/,
          ],
          // Настройки для медленных запросов
          tracingOrigins: [
            'localhost',
            /^https:\/\/unity-wine\.vercel\.app/,
            /^https:\/\/.*\.supabase\.co/,
          ],
        }),
        
        // Session Replay для воспроизведения ошибок
        Sentry.replayIntegration({
          // Маскируем чувствительные данные
          maskAllText: true,
          blockAllMedia: true,
        }),
        
        // Feedback для сбора отзывов пользователей
        Sentry.feedbackIntegration({
          colorScheme: 'system',
          showBranding: false,
        }),
      ],

      // Performance Monitoring
      tracesSampleRate: 0.3, // 30% транзакций для production (увеличено с 0.1)

      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% обычных сессий
      replaysOnErrorSampleRate: 1.0, // 100% сессий с ошибками

      // Profiling для медленных запросов
      profilesSampleRate: 0.3, // 30% профилирования (синхронизировано с traces)

      // Environment
      environment: import.meta.env.MODE,
      
      // Release tracking
      release: `unity-v2@${import.meta.env.VITE_APP_VERSION || 'unknown'}`,

      // Фильтрация ошибок
      beforeSend(event, hint) {
        // Игнорируем ошибки от расширений браузера
        if (event.exception?.values?.[0]?.stacktrace?.frames?.some(
          frame => frame.filename?.includes('chrome-extension://')
        )) {
          return null;
        }

        // Игнорируем ошибки сети (они не критичны)
        if (event.exception?.values?.[0]?.type === 'NetworkError') {
          return null;
        }

        // Добавляем дополнительный контекст
        if (hint.originalException instanceof Error) {
          event.contexts = {
            ...event.contexts,
            app: {
              version: import.meta.env.VITE_APP_VERSION,
              build: import.meta.env.VITE_BUILD_ID,
            },
          };
        }

        return event;
      },

      // Игнорируем определенные ошибки
      ignoreErrors: [
        // Ошибки от расширений браузера
        'top.GLOBALS',
        'originalCreateNotification',
        'canvas.contentDocument',
        'MyApp_RemoveAllHighlights',
        'atomicFindClose',
        
        // Ошибки сети
        'NetworkError',
        'Failed to fetch',
        'Load failed',
        
        // Ошибки от рекламных блокировщиков
        'adsbygoogle',
        
        // Случайные ошибки браузера
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
      ],
    });

    console.log('✅ [Sentry] Инициализирован для production');
  } else {
    console.log('ℹ️ [Sentry] Отключен в development режиме');
  }
}

/**
 * Захват исключения вручную
 * 
 * @example
 * try {
 *   riskyOperation();
 * } catch (error) {
 *   captureException(error, { tags: { section: 'payment' } });
 * }
 */
export function captureException(
  error: Error,
  context?: Sentry.CaptureContext
) {
  if (import.meta.env.PROD) {
    Sentry.captureException(error, context);
  } else {
    console.error('🔴 [Sentry Dev]', error, context);
  }
}

/**
 * Захват сообщения вручную
 * 
 * @example
 * captureMessage('User completed onboarding', {
 *   level: 'info',
 *   tags: { flow: 'onboarding' }
 * });
 */
export function captureMessage(
  message: string,
  context?: Sentry.CaptureContext
) {
  if (import.meta.env.PROD) {
    Sentry.captureMessage(message, context);
  } else {
    console.log('ℹ️ [Sentry Dev]', message, context);
  }
}

/**
 * Установка пользователя для Sentry
 * 
 * @example
 * setUser({
 *   id: user.id,
 *   email: user.email,
 *   username: user.name,
 * });
 */
export function setUser(user: Sentry.User | null) {
  if (import.meta.env.PROD) {
    Sentry.setUser(user);
  }
}

/**
 * Добавление breadcrumb (хлебная крошка) для отслеживания действий
 * 
 * @example
 * addBreadcrumb({
 *   category: 'auth',
 *   message: 'User logged in',
 *   level: 'info',
 * });
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  if (import.meta.env.PROD) {
    Sentry.addBreadcrumb(breadcrumb);
  }
}

/**
 * Установка тега для группировки ошибок
 * 
 * @example
 * setTag('page', 'admin-dashboard');
 */
export function setTag(key: string, value: string) {
  if (import.meta.env.PROD) {
    Sentry.setTag(key, value);
  }
}

/**
 * Установка контекста для дополнительной информации
 * 
 * @example
 * setContext('character', {
 *   name: 'Mighty Fighter',
 *   age: 19,
 *   attack_type: 'melee',
 * });
 */
export function setContext(name: string, context: Record<string, any>) {
  if (import.meta.env.PROD) {
    Sentry.setContext(name, context);
  }
}

/**
 * Создание custom span для мониторинга производительности
 *
 * @example
 * const span = startSpan('fetch-users', 'http.client');
 * try {
 *   const users = await fetchUsers();
 *   span.setStatus('ok');
 *   return users;
 * } catch (error) {
 *   span.setStatus('error');
 *   throw error;
 * } finally {
 *   span.finish();
 * }
 */
export function startSpan(name: string, op: string) {
  if (import.meta.env.PROD) {
    return Sentry.startSpan({ name, op }, (span) => span);
  }
  // Mock span для development
  return {
    setStatus: () => {},
    finish: () => {},
    setData: () => {},
  };
}

/**
 * Wrapper для async операций с автоматическим span
 *
 * @example
 * const users = await withSpan('fetch-users', 'http.client', async () => {
 *   return await fetchUsers();
 * });
 */
export async function withSpan<T>(
  name: string,
  op: string,
  callback: () => Promise<T>
): Promise<T> {
  if (import.meta.env.PROD) {
    return Sentry.startSpan({ name, op }, async () => {
      return await callback();
    });
  }
  return callback();
}

/**
 * Wrapper для ErrorBoundary с Sentry
 *
 * @example
 * <SentryErrorBoundary fallback={<ErrorFallback />}>
 *   <App />
 * </SentryErrorBoundary>
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

/**
 * HOC для обертывания компонентов с Sentry profiling
 *
 * @example
 * export default withProfiler(MyComponent);
 */
export const withProfiler = Sentry.withProfiler;

// Re-export Sentry для прямого использования если нужно
export { Sentry };

