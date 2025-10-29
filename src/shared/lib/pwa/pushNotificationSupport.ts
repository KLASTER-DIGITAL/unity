/**
 * Утилиты для проверки поддержки Push Notifications на разных браузерах
 * 
 * Поддержка Push Notifications:
 * - Chrome/Edge (Desktop & Android): ✅ Полная поддержка
 * - Firefox (Desktop & Android): ✅ Полная поддержка
 * - Safari (Desktop): ✅ Поддержка с macOS 13+ (Ventura)
 * - Safari (iOS): ❌ НЕТ поддержки (iOS 16.4+ только Web Push API, но НЕ Service Worker Push)
 * - Opera (Desktop & Android): ✅ Полная поддержка
 * - Samsung Internet: ✅ Полная поддержка
 */

export interface BrowserInfo {
  name: string;
  version: string;
  os: string;
  isMobile: boolean;
}

export interface PushSupportInfo {
  isSupported: boolean;
  reason?: string;
  browserInfo: BrowserInfo;
  features: {
    serviceWorker: boolean;
    pushManager: boolean;
    notifications: boolean;
    permissions: boolean;
  };
}

/**
 * Определяет информацию о браузере
 */
export function getBrowserInfo(): BrowserInfo {
  const ua = navigator.userAgent;
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
  
  let name = 'Unknown';
  let version = 'Unknown';
  let os = 'Unknown';

  // Определяем OS
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';

  // Определяем браузер
  if (/Edg\//i.test(ua)) {
    name = 'Edge';
    version = ua.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
  } else if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) {
    name = 'Chrome';
    version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
  } else if (/Firefox/i.test(ua)) {
    name = 'Firefox';
    version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
  } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    name = 'Safari';
    version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
  } else if (/OPR\//i.test(ua)) {
    name = 'Opera';
    version = ua.match(/OPR\/(\d+)/)?.[1] || 'Unknown';
  } else if (/SamsungBrowser/i.test(ua)) {
    name = 'Samsung Internet';
    version = ua.match(/SamsungBrowser\/(\d+)/)?.[1] || 'Unknown';
  }

  return { name, version, os, isMobile };
}

/**
 * Проверяет поддержку Push Notifications
 */
export function checkPushSupport(): PushSupportInfo {
  const browserInfo = getBrowserInfo();
  
  const features = {
    serviceWorker: 'serviceWorker' in navigator,
    pushManager: 'PushManager' in window,
    notifications: 'Notification' in window,
    permissions: 'permissions' in navigator,
  };

  // iOS Safari - НЕТ поддержки Service Worker Push
  if (browserInfo.os === 'iOS') {
    return {
      isSupported: false,
      reason: 'iOS Safari не поддерживает Push Notifications через Service Worker. Используйте нативное приложение или Web Push API (ограниченная поддержка).',
      browserInfo,
      features,
    };
  }

  // Safari на macOS - требуется версия 16+
  if (browserInfo.name === 'Safari' && browserInfo.os === 'macOS') {
    const version = parseInt(browserInfo.version);
    if (version < 16) {
      return {
        isSupported: false,
        reason: `Safari ${browserInfo.version} не поддерживает Push Notifications. Требуется Safari 16+ (macOS Ventura или новее).`,
        browserInfo,
        features,
      };
    }
  }

  // Проверяем наличие всех необходимых API
  if (!features.serviceWorker) {
    return {
      isSupported: false,
      reason: 'Service Worker не поддерживается в этом браузере.',
      browserInfo,
      features,
    };
  }

  if (!features.pushManager) {
    return {
      isSupported: false,
      reason: 'Push Manager API не поддерживается в этом браузере.',
      browserInfo,
      features,
    };
  }

  if (!features.notifications) {
    return {
      isSupported: false,
      reason: 'Notifications API не поддерживается в этом браузере.',
      browserInfo,
      features,
    };
  }

  // Все проверки пройдены
  return {
    isSupported: true,
    browserInfo,
    features,
  };
}

/**
 * Запрашивает разрешение на Push Notifications
 */
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('Notifications API не поддерживается');
  }

  const permission = await Notification.requestPermission();
  console.log('[Push] Permission result:', permission);
  return permission;
}

/**
 * Подписывается на Push Notifications
 */
export async function subscribeToPush(vapidPublicKey: string): Promise<PushSubscription> {
  const support = checkPushSupport();
  
  if (!support.isSupported) {
    throw new Error(support.reason || 'Push Notifications не поддерживаются');
  }

  // Проверяем разрешение
  if (Notification.permission !== 'granted') {
    const permission = await requestPushPermission();
    if (permission !== 'granted') {
      throw new Error('Разрешение на уведомления не получено');
    }
  }

  // Получаем Service Worker registration
  const registration = await navigator.serviceWorker.ready;
  
  // Подписываемся на Push
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
  });

  console.log('[Push] Subscription created:', subscription);
  return subscription;
}

/**
 * Отписывается от Push Notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    const result = await subscription.unsubscribe();
    console.log('[Push] Unsubscribed:', result);
    return result;
  }
  
  return false;
}

/**
 * Получает текущую подписку
 */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  return await registration.pushManager.getSubscription();
}

/**
 * Отправляет тестовое уведомление (локальное, не через Push API)
 */
export async function sendTestNotification(title: string, body: string, icon?: string): Promise<void> {
  if (!('Notification' in window)) {
    throw new Error('Notifications API не поддерживается');
  }

  if (Notification.permission !== 'granted') {
    const permission = await requestPushPermission();
    if (permission !== 'granted') {
      throw new Error('Разрешение на уведомления не получено');
    }
  }

  // Если есть Service Worker, используем его
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      icon: icon || '/icon-192x192.png',
      badge: '/icon-96x96.png',
      // vibrate: [200, 100, 200], // Not supported in NotificationOptions type
      tag: 'test-notification',
      requireInteraction: false,
    } as any);
  } else {
    // Fallback на обычное уведомление
    new Notification(title, {
      body,
      icon: icon || '/icon-192x192.png',
    });
  }
}

/**
 * Конвертирует VAPID ключ из base64 в Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
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
 * Получает рекомендации по поддержке Push для текущего браузера
 */
export function getPushRecommendations(): string[] {
  const support = checkPushSupport();
  const recommendations: string[] = [];

  if (support.isSupported) {
    recommendations.push('✅ Ваш браузер полностью поддерживает Push Notifications');
    recommendations.push('💡 Рекомендуем запросить разрешение у пользователя');
  } else {
    recommendations.push(`❌ ${support.reason}`);
    
    if (support.browserInfo.os === 'iOS') {
      recommendations.push('💡 Для iOS рекомендуем использовать нативное приложение');
      recommendations.push('💡 Или используйте альтернативные методы уведомлений (email, SMS)');
    } else if (support.browserInfo.name === 'Safari') {
      recommendations.push('💡 Обновите Safari до версии 16+ (macOS Ventura)');
      recommendations.push('💡 Или используйте Chrome/Firefox для полной поддержки');
    } else {
      recommendations.push('💡 Обновите браузер до последней версии');
      recommendations.push('💡 Или используйте Chrome/Firefox/Edge');
    }
  }

  return recommendations;
}

