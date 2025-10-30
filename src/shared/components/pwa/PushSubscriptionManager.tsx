/**
 * Push Subscription Manager
 *
 * Компонент для управления push подписками в PWA (для пользователей)
 * - Запрос разрешения на уведомления
 * - Подписка/отписка от push
 * - Отображение статуса подписки
 */

import { useEffect, useState } from 'react';
import {
  trackPushDenied,
  trackPushSubscribed,
  trackPushUnsubscribed,
} from '@/shared/lib/analytics/pwa-tracking';
import {
  getNotificationPermission,
  initWebPush,
  isPushSubscribed,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/shared/lib/notifications/webPush';

type PushSubscriptionManagerProps = {
  userId: string;
  onSubscriptionChange?: (isSubscribed: boolean) => void;
};

export function PushSubscriptionManager({
  userId,
  onSubscriptionChange,
}: PushSubscriptionManagerProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkSupport();
    checkSubscription();
    initWebPush(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  /**
   * Проверяет поддержку Web Push API
   */
  const checkSupport = () => {
    const supported = isPushSupported();
    setIsSupported(supported);

    if (supported) {
      const currentPermission = getNotificationPermission();
      setPermission(currentPermission);
    }
  };

  /**
   * Проверяет текущую подписку
   */
  const checkSubscription = async () => {
    const subscribed = await isPushSubscribed();
    setIsSubscribed(subscribed);
    onSubscriptionChange?.(subscribed);
  };

  /**
   * Подписывается на push уведомления
   */
  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const subscription = await subscribeToPush(userId);

      if (subscription) {
        setIsSubscribed(true);
        setPermission('granted');
        trackPushSubscribed(userId);
        onSubscriptionChange?.(true);
        alert('✅ Вы подписались на уведомления!');
      } else {
        const currentPermission = getNotificationPermission();
        setPermission(currentPermission);

        if (currentPermission === 'denied') {
          trackPushDenied(userId);
          alert('❌ Вы запретили уведомления. Разрешите их в настройках браузера.');
        } else {
          alert('❌ Не удалось подписаться на уведомления');
        }
      }
    } catch (error) {
      console.error('Error subscribing to push:', error);
      alert('❌ Ошибка при подписке на уведомления');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Отписывается от push уведомлений
   */
  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      const success = await unsubscribeFromPush(userId);

      if (success) {
        setIsSubscribed(false);
        trackPushUnsubscribed(userId);
        onSubscriptionChange?.(false);
        alert('✅ Вы отписались от уведомлений');
      } else {
        alert('❌ Не удалось отписаться от уведомлений');
      }
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      alert('❌ Ошибка при отписке от уведомлений');
    } finally {
      setIsLoading(false);
    }
  };

  // Если не поддерживается, не показываем компонент
  if (!isSupported) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-colors duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-2 font-semibold text-callout text-foreground">🔔 Push Уведомления</h3>

          {permission === 'denied' && (
            <div className="mb-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 transition-colors duration-300">
              <p className="text-destructive text-footnote">
                ❌ Уведомления запрещены. Разрешите их в настройках браузера.
              </p>
            </div>
          )}

          {permission === 'granted' && isSubscribed && (
            <div className="mb-3 rounded-lg border border-(--ios-green)/20 bg-(--ios-green)/10 p-3 transition-colors duration-300">
              <p className="text-(--ios-green) text-footnote">✅ Вы подписаны на уведомления</p>
            </div>
          )}

          {permission === 'default' && (
            <p className="mb-3 text-footnote text-muted-foreground">
              Получайте уведомления о новых достижениях и напоминания
            </p>
          )}

          {permission === 'granted' && !isSubscribed && (
            <p className="mb-3 text-footnote text-muted-foreground">
              Подпишитесь на уведомления, чтобы не пропустить важные события
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {!isSubscribed ? (
          <button
            className="flex-1 rounded-xl bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading || permission === 'denied'}
            onClick={handleSubscribe}
          >
            {isLoading ? 'Подписка...' : '🔔 Подписаться'}
          </button>
        ) : (
          <button
            className="flex-1 rounded-xl bg-muted px-4 py-2.5 font-medium text-foreground transition-all duration-200 hover:bg-muted/80 disabled:opacity-50"
            disabled={isLoading}
            onClick={handleUnsubscribe}
          >
            {isLoading ? 'Отписка...' : '🔕 Отписаться'}
          </button>
        )}
      </div>

      {permission === 'denied' && (
        <div className="mt-3 text-caption-2 text-muted-foreground">
          <p className="mb-1 font-semibold">Как разрешить уведомления:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>Chrome: Настройки → Конфиденциальность → Уведомления</li>
            <li>Firefox: Настройки → Приватность → Разрешения</li>
            <li>Safari: Настройки → Веб-сайты → Уведомления</li>
          </ul>
        </div>
      )}
    </div>
  );
}
