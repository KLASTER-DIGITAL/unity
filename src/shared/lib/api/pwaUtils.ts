/**
 * Утилиты для работы с PWA
 */

export interface PWAInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Проверяет, поддерживает ли браузер PWA установку
 */
export function isPWASupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Проверяет, установлено ли приложение как PWA
 */
export function isPWAInstalled(): boolean {
  // Проверка для браузеров с поддержкой display-mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Проверка для iOS Safari
  if ((window.navigator as any).standalone === true) {
    return true;
  }
  
  // Проверка параметра URL (если приложение открыто из PWA)
  if (document.referrer.startsWith('android-app://')) {
    return true;
  }
  
  return false;
}

/**
 * Проверяет, показывалось ли уже приглашение установки
 */
export function wasInstallPromptShown(): boolean {
  return localStorage.getItem('installPromptShown') === 'true';
}

/**
 * Помечает что приглашение установки было показано
 */
export function markInstallPromptAsShown(): void {
  localStorage.setItem('installPromptShown', 'true');
}

/**
 * Проверяет, включена ли PWA в админ-панели
 */
export function isPWAEnabled(): boolean {
  const pwaEnabled = localStorage.getItem('pwa-enabled');
  // По умолчанию true, если ключ не установлен
  return pwaEnabled !== 'false';
}

/**
 * Включает/выключает PWA
 */
export function setPWAEnabled(enabled: boolean): void {
  localStorage.setItem('pwa-enabled', enabled ? 'true' : 'false');
}

/**
 * Проверяет iOS Safari (PWA работает по-другому)
 */
export function isIOSSafari(): boolean {
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const webkit = /WebKit/.test(ua);
  const isIOSChrome = /CriOS/.test(ua);
  const isIOSFirefox = /FxiOS/.test(ua);
  
  return iOS && webkit && !isIOSChrome && !isIOSFirefox;
}

/**
 * Получает инструкции по установке для текущего браузера
 */
export function getInstallInstructions(): { platform: string; steps: string[] } {
  const ua = window.navigator.userAgent;
  
  // iOS Safari
  if (isIOSSafari()) {
    return {
      platform: 'iOS Safari',
      steps: [
        'Нажмите кнопку "Поделиться" внизу экрана',
        'Прокрутите вниз и нажмите "На экран Домой"',
        'Нажмите "Добавить" для установки'
      ]
    };
  }
  
  // Android Chrome
  if (/Chrome/.test(ua) && /Android/.test(ua)) {
    return {
      platform: 'Android Chrome',
      steps: [
        'Нажмите меню (три точки) в правом верхнем углу',
        'Выберите "Установить приложение" или "Добавить на главный экран"',
        'Подтвердите установку'
      ]
    };
  }
  
  // Desktop Chrome/Edge
  if (/Chrome|Edg/.test(ua) && !/Mobile/.test(ua)) {
    return {
      platform: 'Desktop (Chrome/Edge)',
      steps: [
        'Нажмите иконку установки в адресной строке',
        'Или откройте меню → "Установить приложение"',
        'Подтвердите установку'
      ]
    };
  }
  
  // Firefox Android
  if (/Firefox/.test(ua) && /Android/.test(ua)) {
    return {
      platform: 'Android Firefox',
      steps: [
        'Нажмите меню (три точки) в правом верхнем углу',
        'Выберите "Установить"',
        'Подтвердите установку'
      ]
    };
  }
  
  // Другие браузеры
  return {
    platform: 'Другой браузер',
    steps: [
      'Откройте меню браузера',
      'Найдите опцию "Добавить на главный экран" или "Установить"',
      'Следуйте инструкциям браузера'
    ]
  };
}

/**
 * Логирует детальную информацию о PWA для отладки
 */
export function logPWADebugInfo(): void {
  console.group('🔍 PWA Debug Information');
  
  console.log('PWA Support:', {
    serviceWorker: 'serviceWorker' in navigator,
    pushManager: 'PushManager' in window,
    beforeInstallPrompt: 'onbeforeinstallprompt' in window,
    notification: 'Notification' in window
  });
  
  console.log('Installation Status:', {
    isPWAInstalled: isPWAInstalled(),
    displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
    standalone: (window.navigator as any).standalone,
    wasPromptShown: wasInstallPromptShown()
  });
  
  console.log('PWA Settings:', {
    isPWAEnabled: isPWAEnabled(),
    pwaEnabledValue: localStorage.getItem('pwa-enabled')
  });
  
  console.log('Browser Info:', {
    userAgent: navigator.userAgent,
    isIOSSafari: isIOSSafari(),
    navigatorPlatform: navigator.platform,
    ...getInstallInstructions()
  });
  
  console.log('Service Worker:', {
    controller: navigator.serviceWorker?.controller,
    ready: navigator.serviceWorker?.ready
  });
  
  console.groupEnd();
}
