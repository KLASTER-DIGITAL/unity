import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

/**
 * PWA Settings из админ-панели
 */
export interface PWASettings {
  // Основные настройки
  enableNotifications: boolean;
  enableOfflineMode: boolean;
  enableInstallPrompt: boolean;
  
  // Install Prompt настройки
  installPromptTiming: 'immediate' | 'after_visits' | 'after_time' | 'manual';
  installPromptVisitsCount: number; // После скольких визитов показывать (если timing = 'after_visits')
  installPromptDelayMinutes: number; // Через сколько минут показывать (если timing = 'after_time')
  installPromptLocation: 'onboarding' | 'user_cabinet' | 'both' | 'anywhere'; // ГДЕ показывать prompt

  // Тексты Install Prompt (мультиязычность через i18n, здесь только ключи)
  installPromptTitle: string;
  installPromptDescription: string;
  installPromptButtonText: string;
  installPromptSkipText: string;
}

/**
 * Дефолтные настройки PWA (если не загружены из админки)
 */
const DEFAULT_PWA_SETTINGS: PWASettings = {
  enableNotifications: true,
  enableOfflineMode: true,
  enableInstallPrompt: true,
  installPromptTiming: 'after_visits',
  installPromptVisitsCount: 3,
  installPromptDelayMinutes: 5,
  installPromptLocation: 'anywhere', // По умолчанию показывать везде
  installPromptTitle: 'pwa.install.title',
  installPromptDescription: 'pwa.install.description',
  installPromptButtonText: 'pwa.install.button',
  installPromptSkipText: 'pwa.install.skip',
};

/**
 * Hook для загрузки PWA настроек из админ-панели
 * 
 * @example
 * ```tsx
 * const { settings, isLoading, error } = usePWASettings();
 * 
 * if (settings.enableInstallPrompt && settings.installPromptTiming === 'after_visits') {
 *   const visitCount = getVisitCount();
 *   if (visitCount >= settings.installPromptVisitsCount) {
 *     showInstallPrompt();
 *   }
 * }
 * ```
 */
export function usePWASettings() {
  const [settings, setSettings] = useState<PWASettings>(DEFAULT_PWA_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPWASettings();
  }, []);

  const loadPWASettings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Загружаем настройки из admin_settings
      const { data, error: fetchError } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'pwa_settings')
        .single();

      if (fetchError) {
        // Если настройки не найдены - используем дефолтные
        if (fetchError.code === 'PGRST116') {
          console.log('[usePWASettings] Settings not found, using defaults');
          setSettings(DEFAULT_PWA_SETTINGS);
          return;
        }
        throw fetchError;
      }

      if (data?.value) {
        const loadedSettings = JSON.parse(data.value);
        
        // Мержим с дефолтными настройками (на случай если какие-то поля отсутствуют)
        setSettings({
          ...DEFAULT_PWA_SETTINGS,
          ...loadedSettings,
        });
        
        console.log('[usePWASettings] Settings loaded:', loadedSettings);
      } else {
        setSettings(DEFAULT_PWA_SETTINGS);
      }
    } catch (err: any) {
      console.error('[usePWASettings] Error loading settings:', err);
      setError(err.message);
      // При ошибке используем дефолтные настройки
      setSettings(DEFAULT_PWA_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    settings,
    isLoading,
    error,
    reload: loadPWASettings,
  };
}

/**
 * Утилита для проверки условий показа Install Prompt
 * @param settings - PWA настройки из админ-панели
 * @param currentLocation - текущая локация ('onboarding' | 'user_cabinet')
 */
export function shouldShowInstallPrompt(
  settings: PWASettings,
  currentLocation?: 'onboarding' | 'user_cabinet'
): boolean {
  // Если install prompt выключен в админке
  if (!settings.enableInstallPrompt) {
    console.log('[shouldShowInstallPrompt] Install prompt disabled in admin panel');
    return false;
  }

  // Проверяем локацию (ГДЕ показывать)
  if (currentLocation && settings.installPromptLocation !== 'anywhere') {
    const locationAllowed =
      settings.installPromptLocation === 'both' ||
      settings.installPromptLocation === currentLocation;

    if (!locationAllowed) {
      console.log(`[shouldShowInstallPrompt] Location not allowed: current=${currentLocation}, allowed=${settings.installPromptLocation}`);
      return false;
    }
  }

  // Проверяем уже показывали ли prompt
  const promptShown = localStorage.getItem('installPromptShown');
  if (promptShown === 'true') {
    console.log('[shouldShowInstallPrompt] Prompt already shown');
    return false;
  }

  // Проверяем уже установлено ли PWA
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;
  if (isStandalone) {
    console.log('[shouldShowInstallPrompt] PWA already installed');
    return false;
  }

  // Проверяем timing стратегию
  switch (settings.installPromptTiming) {
    case 'immediate':
      console.log('[shouldShowInstallPrompt] Immediate timing - show now');
      return true;

    case 'after_visits': {
      const visitCount = parseInt(localStorage.getItem('visitCount') || '0');
      const shouldShow = visitCount >= settings.installPromptVisitsCount;
      console.log(`[shouldShowInstallPrompt] After visits: ${visitCount}/${settings.installPromptVisitsCount} - ${shouldShow ? 'SHOW' : 'WAIT'}`);
      return shouldShow;
    }

    case 'after_time': {
      const firstVisit = localStorage.getItem('firstVisitTime');
      if (!firstVisit) {
        // Первый визит - сохраняем время
        localStorage.setItem('firstVisitTime', Date.now().toString());
        console.log('[shouldShowInstallPrompt] First visit - saving time');
        return false;
      }

      const minutesPassed = (Date.now() - parseInt(firstVisit)) / 1000 / 60;
      const shouldShow = minutesPassed >= settings.installPromptDelayMinutes;
      console.log(`[shouldShowInstallPrompt] After time: ${minutesPassed.toFixed(1)}/${settings.installPromptDelayMinutes} min - ${shouldShow ? 'SHOW' : 'WAIT'}`);
      return shouldShow;
    }

    case 'manual':
      console.log('[shouldShowInstallPrompt] Manual timing - do not show automatically');
      return false;

    default:
      console.warn('[shouldShowInstallPrompt] Unknown timing strategy:', settings.installPromptTiming);
      return false;
  }
}

/**
 * Утилита для инкремента счетчика визитов
 */
export function incrementVisitCount(): number {
  const currentCount = parseInt(localStorage.getItem('visitCount') || '0');
  const newCount = currentCount + 1;
  localStorage.setItem('visitCount', newCount.toString());
  console.log(`[incrementVisitCount] Visit count: ${currentCount} → ${newCount}`);
  return newCount;
}

/**
 * Утилита для сброса счетчиков (для тестирования)
 */
export function resetPWACounters(): void {
  localStorage.removeItem('visitCount');
  localStorage.removeItem('firstVisitTime');
  localStorage.removeItem('installPromptShown');
  console.log('[resetPWACounters] All PWA counters reset');
}

