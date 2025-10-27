/**
 * Push Subscription Manager
 * 
 * Компонент для управления push подписками в PWA (для пользователей)
 * - Запрос разрешения на уведомления
 * - Подписка/отписка от push
 * - Отображение статуса подписки
 */

import { useState, useEffect } from 'react';
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  isPushSubscribed,
  initWebPush,
} from '@/shared/lib/notifications/webPush';
import { trackPushDenied, trackPushSubscribed, trackPushUnsubscribed } from '@/shared/lib/analytics/pwa-tracking';

interface PushSubscriptionManagerProps {
  userId: string;
  onSubscriptionChange?: (isSubscribed: boolean) => void;
}

export function PushSubscriptionManager({ userId, onSubscriptionChange }: PushSubscriptionManagerProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkSupport();
    checkSubscription();
    initWebPush(userId);
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
    <div className="bg-card rounded-xl p-4 border border-border transition-colors duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-callout font-semibold text-foreground mb-2">
            🔔 Push Уведомления
          </h3>

          {permission === 'denied' && (
            <div className="mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg transition-colors duration-300">
              <p className="text-footnote text-destructive">
                ❌ Уведомления запрещены. Разрешите их в настройках браузера.
              </p>
            </div>
          )}

          {permission === 'granted' && isSubscribed && (
            <div className="mb-3 p-3 bg-[var(--ios-green)]/10 border border-[var(--ios-green)]/20 rounded-lg transition-colors duration-300">
              <p className="text-footnote text-[var(--ios-green)]">
                ✅ Вы подписаны на уведомления
              </p>
            </div>
          )}

          {permission === 'default' && (
            <p className="text-footnote text-muted-foreground mb-3">
              Получайте уведомления о новых достижениях и напоминания
            </p>
          )}

          {permission === 'granted' && !isSubscribed && (
            <p className="text-footnote text-muted-foreground mb-3">
              Подпишитесь на уведомления, чтобы не пропустить важные события
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {!isSubscribed ? (
          <button
            onClick={handleSubscribe}
            disabled={isLoading || permission === 'denied'}
            className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? 'Подписка...' : '🔔 Подписаться'}
          </button>
        ) : (
          <button
            onClick={handleUnsubscribe}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 disabled:opacity-50 transition-all duration-200"
          >
            {isLoading ? 'Отписка...' : '🔕 Отписаться'}
          </button>
        )}
      </div>

      {permission === 'denied' && (
        <div className="mt-3 text-caption-2 text-muted-foreground">
          <p className="font-semibold mb-1">Как разрешить уведомления:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Chrome: Настройки → Конфиденциальность → Уведомления</li>
            <li>Firefox: Настройки → Приватность → Разрешения</li>
            <li>Safari: Настройки → Веб-сайты → Уведомления</li>
          </ul>
        </div>
      )}
    </div>
  );
}

