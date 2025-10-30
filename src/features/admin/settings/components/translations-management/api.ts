import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import type { Language, MissingTranslation, Translation } from './types';

const supabase = createClient();

/**
 * Load all translations from the server
 */
export async function loadTranslations(): Promise<Translation[]> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Ошибка авторизации');
      return [];
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translations-management`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.translations || [];
    }
    const error = await response.json();
    toast.error(error.error || 'Ошибка загрузки переводов');
    return [];
  } catch (error) {
    console.error('Error loading translations:', error);
    toast.error('Ошибка соединения с сервером');
    return [];
  }
}

/**
 * Load all languages from the server
 */
export async function loadLanguages(): Promise<Language[]> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return [];
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translations-management/languages`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.languages || [];
    }
    return [];
  } catch (error) {
    console.error('Error loading languages:', error);
    return [];
  }
}

/**
 * Load missing translation keys from the server
 */
export async function loadMissingKeys(): Promise<MissingTranslation[]> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return [];
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translations-management/missing`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.missing || [];
    }
    return [];
  } catch (error) {
    console.error('Error loading missing keys:', error);
    return [];
  }
}

/**
 * Save a translation to the server
 */
export async function saveTranslation(
  translationKey: string,
  langCode: string,
  translationValue: string
): Promise<boolean> {
  if (!(translationKey && translationValue.trim())) {
    toast.error('Введите текст перевода');
    return false;
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Ошибка авторизации');
      return false;
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translations-management`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          translation_key: translationKey,
          lang_code: langCode,
          translation_value: translationValue,
        }),
      }
    );

    if (response.ok) {
      toast.success('Перевод сохранен! 🌍');
      return true;
    }
    const error = await response.json();
    toast.error(error.error || 'Ошибка сохранения');
    return false;
  } catch (error) {
    console.error('Error saving translation:', error);
    toast.error('Ошибка соединения с сервером');
    return false;
  }
}

/**
 * Auto-translate missing keys using AI
 */
export async function autoTranslate(
  sourceLanguage: string,
  targetLanguages: string[]
): Promise<{ success: boolean; message?: string; totalCost?: number }> {
  if (!sourceLanguage || targetLanguages.length === 0) {
    toast.error('Выберите исходный язык и целевые языки');
    return { success: false };
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Ошибка авторизации');
      return { success: false };
    }

    toast.info('Запуск автоперевода... ⏳');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-translate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceLanguage,
          targetLanguages,
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: data.message,
        totalCost: data.totalCost,
      };
    }
    const error = await response.json();
    toast.error(error.error || 'Ошибка автоперевода');
    return { success: false };
  } catch (error) {
    console.error('Error auto-translating:', error);
    toast.error('Ошибка соединения с сервером');
    return { success: false };
  }
}
