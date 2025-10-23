/**
 * PWA Analytics Tracking
 * 
 * Отслеживает все PWA события для аналитики:
 * - Показы install prompt
 * - Установки PWA
 * - Отказы от установки
 * - Использование в standalone режиме
 * - Push notifications разрешения
 * 
 * Все события сохраняются в таблицу `usage` для последующего анализа
 */

import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

/**
 * Базовая функция для отправки события в usage таблицу
 */
async function trackEvent(
  userId: string | null,
  operationType: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const { error } = await supabase.from('usage').insert({
      user_id: userId,
      operation_type: operationType,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        standalone: window.matchMedia('(display-mode: standalone)').matches,
      },
    });

    if (error) {
      console.error(`[PWA Analytics] Failed to track ${operationType}:`, error);
    } else {
      console.log(`[PWA Analytics] Tracked: ${operationType}`, metadata);
    }
  } catch (error) {
    console.error(`[PWA Analytics] Error tracking ${operationType}:`, error);
  }
}

/**
 * Отслеживает показ install prompt
 */
export async function trackInstallPromptShown(userId: string | null): Promise<void> {
  await trackEvent(userId, 'pwa_install_prompt_shown', {
    location: window.location.pathname,
    referrer: document.referrer,
  });
}

/**
 * Отслеживает принятие установки PWA
 */
export async function trackInstallAccepted(userId: string | null): Promise<void> {
  try {
    // Отправляем событие в usage
    await trackEvent(userId, 'pwa_install_accepted', {
      location: window.location.pathname,
    });

    // Обновляем профиль пользователя (если залогинен)
    if (userId) {
      const { error } = await supabase
        .from('profiles')
        .update({ pwa_installed: true })
        .eq('id', userId);

      if (error) {
        console.error('[PWA Analytics] Failed to update profile:', error);
      }
    }
  } catch (error) {
    console.error('[PWA Analytics] Error tracking install accepted:', error);
  }
}

/**
 * Отслеживает отказ от установки PWA
 */
export async function trackInstallDismissed(userId: string | null, reason?: string): Promise<void> {
  await trackEvent(userId, 'pwa_install_dismissed', {
    location: window.location.pathname,
    reason: reason || 'user_dismissed',
  });
}

/**
 * Отслеживает использование в standalone режиме
 * Вызывается при запуске приложения
 */
export async function trackStandaloneUsage(userId: string | null): Promise<void> {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  if (isStandalone) {
    await trackEvent(userId, 'pwa_standalone_usage', {
      location: window.location.pathname,
    });
  }
}

/**
 * Отслеживает разрешение на push notifications
 */
export async function trackPushPermission(
  userId: string | null,
  permission: NotificationPermission
): Promise<void> {
  await trackEvent(userId, 'pwa_push_permission', {
    permission,
    location: window.location.pathname,
  });
}

/**
 * Отслеживает отказ от push notifications
 */
export async function trackPushDenied(userId: string | null): Promise<void> {
  await trackEvent(userId, 'pwa_push_denied', {
    location: window.location.pathname,
  });
}

/**
 * Отслеживает успешную подписку на push
 */
export async function trackPushSubscribed(userId: string | null): Promise<void> {
  await trackEvent(userId, 'pwa_push_subscribed', {
    location: window.location.pathname,
  });
}

/**
 * Отслеживает отписку от push
 */
export async function trackPushUnsubscribed(userId: string | null): Promise<void> {
  await trackEvent(userId, 'pwa_push_unsubscribed', {
    location: window.location.pathname,
  });
}

/**
 * Отслеживает обновление Service Worker
 */
export async function trackServiceWorkerUpdate(userId: string | null): Promise<void> {
  await trackEvent(userId, 'pwa_sw_update', {
    location: window.location.pathname,
  });
}

/**
 * Отслеживает ошибку Service Worker
 */
export async function trackServiceWorkerError(
  userId: string | null,
  error: string
): Promise<void> {
  await trackEvent(userId, 'pwa_sw_error', {
    error,
    location: window.location.pathname,
  });
}

/**
 * Отслеживает offline режим
 */
export async function trackOfflineMode(userId: string | null, isOnline: boolean): Promise<void> {
  await trackEvent(userId, isOnline ? 'pwa_online' : 'pwa_offline', {
    location: window.location.pathname,
  });
}

/**
 * Получает статистику PWA событий для пользователя
 */
export async function getPWAStats(userId: string): Promise<{
  installPromptShown: number;
  installAccepted: number;
  installDismissed: number;
  standaloneUsage: number;
  pushPermissions: number;
}> {
  try {
    const { data, error } = await supabase
      .from('usage')
      .select('operation_type')
      .eq('user_id', userId)
      .in('operation_type', [
        'pwa_install_prompt_shown',
        'pwa_install_accepted',
        'pwa_install_dismissed',
        'pwa_standalone_usage',
        'pwa_push_permission',
      ]);

    if (error) {
      console.error('[PWA Analytics] Failed to get stats:', error);
      return {
        installPromptShown: 0,
        installAccepted: 0,
        installDismissed: 0,
        standaloneUsage: 0,
        pushPermissions: 0,
      };
    }

    const stats = {
      installPromptShown: data.filter(d => d.operation_type === 'pwa_install_prompt_shown').length,
      installAccepted: data.filter(d => d.operation_type === 'pwa_install_accepted').length,
      installDismissed: data.filter(d => d.operation_type === 'pwa_install_dismissed').length,
      standaloneUsage: data.filter(d => d.operation_type === 'pwa_standalone_usage').length,
      pushPermissions: data.filter(d => d.operation_type === 'pwa_push_permission').length,
    };

    return stats;
  } catch (error) {
    console.error('[PWA Analytics] Error getting stats:', error);
    return {
      installPromptShown: 0,
      installAccepted: 0,
      installDismissed: 0,
      standaloneUsage: 0,
      pushPermissions: 0,
    };
  }
}

/**
 * Получает общую статистику PWA для админ-панели
 */
export async function getAdminPWAStats(): Promise<{
  totalInstalls: number;
  totalPromptShown: number;
  totalDismissed: number;
  conversionRate: number;
}> {
  try {
    const { data, error } = await supabase
      .from('usage')
      .select('operation_type')
      .in('operation_type', [
        'pwa_install_prompt_shown',
        'pwa_install_accepted',
        'pwa_install_dismissed',
      ]);

    if (error) {
      console.error('[PWA Analytics] Failed to get admin stats:', error);
      return {
        totalInstalls: 0,
        totalPromptShown: 0,
        totalDismissed: 0,
        conversionRate: 0,
      };
    }

    const totalPromptShown = data.filter(d => d.operation_type === 'pwa_install_prompt_shown').length;
    const totalInstalls = data.filter(d => d.operation_type === 'pwa_install_accepted').length;
    const totalDismissed = data.filter(d => d.operation_type === 'pwa_install_dismissed').length;
    const conversionRate = totalPromptShown > 0 ? (totalInstalls / totalPromptShown) * 100 : 0;

    return {
      totalInstalls,
      totalPromptShown,
      totalDismissed,
      conversionRate,
    };
  } catch (error) {
    console.error('[PWA Analytics] Error getting admin stats:', error);
    return {
      totalInstalls: 0,
      totalPromptShown: 0,
      totalDismissed: 0,
      conversionRate: 0,
    };
  }
}

/**
 * Инициализирует PWA analytics при запуске приложения
 */
export async function initPWAAnalytics(userId: string | null): Promise<void> {
  // Отслеживаем standalone usage
  await trackStandaloneUsage(userId);

  // Отслеживаем online/offline события
  window.addEventListener('online', () => trackOfflineMode(userId, true));
  window.addEventListener('offline', () => trackOfflineMode(userId, false));

  console.log('[PWA Analytics] Initialized');
}

