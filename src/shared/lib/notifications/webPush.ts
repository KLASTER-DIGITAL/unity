/**
 * Web Push API Client Library
 * 
 * Handles:
 * - Push notification permissions
 * - Service Worker registration
 * - Push subscription management
 * - Subscription storage in Supabase
 */

import { createClient } from '@/utils/supabase/client';
import { getBrowserInfo } from '@/shared/lib/pwa/pushNotificationSupport';

const supabase = createClient();

// VAPID public key - будет храниться в admin_settings
let VAPID_PUBLIC_KEY: string | null = null;

/**
 * Загружает VAPID public key из admin_settings
 */
async function loadVapidPublicKey(): Promise<string> {
  if (VAPID_PUBLIC_KEY) {
    return VAPID_PUBLIC_KEY;
  }

  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'vapid_public_key')
      .single();

    if (error) {
      console.error('[Web Push] Failed to load VAPID public key:', error);
      throw new Error('VAPID public key not configured');
    }

    VAPID_PUBLIC_KEY = data.value;
    return data.value;
  } catch (error) {
    console.error('[Web Push] Error loading VAPID public key:', error);
    throw error;
  }
}

/**
 * Конвертирует base64 строку в Uint8Array для VAPID key
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Проверяет поддержку Web Push API
 */
export function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Получает текущий статус разрешения на уведомления
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Запрашивает разрешение на push уведомления
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('[Web Push] Notifications not supported');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('[Web Push] Permission result:', permission);
    return permission;
  } catch (error) {
    console.error('[Web Push] Error requesting permission:', error);
    return 'denied';
  }
}

/**
 * Регистрирует Service Worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[Web Push] Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('[Web Push] Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('[Web Push] Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Получает активную push subscription
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription;
  } catch (error) {
    console.error('[Web Push] Error getting subscription:', error);
    return null;
  }
}

/**
 * Создает новую push subscription
 */
export async function subscribeToPush(userId: string): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    console.warn('[Web Push] Push not supported');
    return null;
  }

  try {
    // Проверяем разрешение
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('[Web Push] Permission not granted:', permission);
      return null;
    }

    // Регистрируем Service Worker
    const registration = await registerServiceWorker();
    if (!registration) {
      console.error('[Web Push] Service Worker registration failed');
      return null;
    }

    // Ждем пока Service Worker станет активным
    await navigator.serviceWorker.ready;

    // Загружаем VAPID public key
    const vapidPublicKey = await loadVapidPublicKey();
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    // Создаем subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    console.log('[Web Push] Subscription created:', subscription);

    // Сохраняем subscription в БД
    await savePushSubscription(userId, subscription);

    return subscription;
  } catch (error) {
    console.error('[Web Push] Error subscribing to push:', error);
    return null;
  }
}

/**
 * Сохраняет push subscription в Supabase
 */
async function savePushSubscription(
  userId: string,
  subscription: PushSubscription
): Promise<void> {
  try {
    const subscriptionJson = subscription.toJSON();
    const browserInfo = getBrowserInfo();

    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: userId,
        endpoint: subscriptionJson.endpoint!,
        p256dh: subscriptionJson.keys!.p256dh!,
        auth: subscriptionJson.keys!.auth!,
        user_agent: navigator.userAgent,
        browser_info: browserInfo,
        is_active: true,
        last_used_at: new Date().toISOString(),
      },
      {
        onConflict: 'endpoint',
      }
    );

    if (error) {
      console.error('[Web Push] Failed to save subscription:', error);
      throw error;
    }

    console.log('[Web Push] Subscription saved to database');
  } catch (error) {
    console.error('[Web Push] Error saving subscription:', error);
    throw error;
  }
}

/**
 * Отписывается от push уведомлений
 */
export async function unsubscribeFromPush(userId: string): Promise<boolean> {
  try {
    const subscription = await getPushSubscription();
    if (!subscription) {
      console.warn('[Web Push] No active subscription');
      return false;
    }

    // Отписываемся от push
    const success = await subscription.unsubscribe();
    console.log('[Web Push] Unsubscribed:', success);

    if (success) {
      // Деактивируем subscription в БД
      const { error } = await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('endpoint', subscription.endpoint);

      if (error) {
        console.error('[Web Push] Failed to deactivate subscription:', error);
      }
    }

    return success;
  } catch (error) {
    console.error('[Web Push] Error unsubscribing:', error);
    return false;
  }
}

/**
 * Проверяет активна ли push subscription
 */
export async function isPushSubscribed(): Promise<boolean> {
  const subscription = await getPushSubscription();
  return subscription !== null;
}

/**
 * Получает все активные subscriptions пользователя из БД
 */
export async function getUserPushSubscriptions(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Web Push] Failed to get subscriptions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Web Push] Error getting subscriptions:', error);
    return [];
  }
}

/**
 * Инициализирует Web Push для пользователя
 */
export async function initWebPush(userId: string): Promise<void> {
  if (!isPushSupported()) {
    console.warn('[Web Push] Push not supported on this browser');
    return;
  }

  try {
    // Проверяем есть ли уже subscription
    const existingSubscription = await getPushSubscription();
    
    if (existingSubscription) {
      console.log('[Web Push] Existing subscription found');
      // Обновляем last_used_at
      await savePushSubscription(userId, existingSubscription);
    } else {
      console.log('[Web Push] No existing subscription');
    }
  } catch (error) {
    console.error('[Web Push] Error initializing Web Push:', error);
  }
}

