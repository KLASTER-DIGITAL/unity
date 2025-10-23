/**
 * usePushAnalytics Hook
 * 
 * Отслеживает события push уведомлений от Service Worker
 * и сохраняет их в аналитику
 */

import { useEffect } from 'react';
import { trackPushOpened, trackPushClosed, trackPushDelivered } from '@/shared/lib/analytics/push-analytics';

interface PushEventData {
  type: 'PUSH_DELIVERED' | 'PUSH_CLICKED' | 'PUSH_CLOSED';
  data?: {
    notification_id?: string;
    url?: string;
    [key: string]: any;
  };
}

/**
 * Hook для отслеживания push событий от Service Worker
 */
export function usePushAnalytics(userId?: string) {
  useEffect(() => {
    if (!userId) return;

    // Обработчик сообщений от Service Worker
    const handleMessage = async (event: MessageEvent<PushEventData>) => {
      if (!event.data || !event.data.type) return;

      const { type, data } = event.data;
      const notificationId = data?.notification_id;

      console.log('[Push Analytics] Received event from SW:', type, data);

      try {
        switch (type) {
          case 'PUSH_DELIVERED':
            await trackPushDelivered(userId, notificationId, data);
            console.log('[Push Analytics] Tracked: push_delivered');
            break;

          case 'PUSH_CLICKED':
            await trackPushOpened(userId, notificationId, data);
            console.log('[Push Analytics] Tracked: push_opened');
            break;

          case 'PUSH_CLOSED':
            await trackPushClosed(userId, notificationId, data);
            console.log('[Push Analytics] Tracked: push_closed');
            break;

          default:
            console.warn('[Push Analytics] Unknown event type:', type);
        }
      } catch (error) {
        console.error('[Push Analytics] Failed to track event:', error);
      }
    };

    // Регистрируем обработчик
    navigator.serviceWorker?.addEventListener('message', handleMessage);

    console.log('[Push Analytics] Initialized for user:', userId);

    // Очистка при размонтировании
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
      console.log('[Push Analytics] Cleaned up');
    };
  }, [userId]);
}

/**
 * Hook для инициализации push аналитики в приложении
 * Использовать в корневом компоненте (App.tsx)
 */
export function useInitPushAnalytics(userId?: string) {
  usePushAnalytics(userId);

  useEffect(() => {
    if (!userId) return;

    // Проверяем поддержку Service Worker
    if (!('serviceWorker' in navigator)) {
      console.warn('[Push Analytics] Service Worker not supported');
      return;
    }

    // Проверяем что Service Worker зарегистрирован
    navigator.serviceWorker.ready.then((registration) => {
      console.log('[Push Analytics] Service Worker ready:', registration);
    }).catch((error) => {
      console.error('[Push Analytics] Service Worker not ready:', error);
    });
  }, [userId]);
}

