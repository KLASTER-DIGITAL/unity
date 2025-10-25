import { signUpWithEmail, signInWithEmail, signInWithGoogle, signInWithFacebook } from "@/utils/auth";
import { createClient } from "@/utils/supabase/client";
import { getUserProfile } from "@/shared/lib/api";
import { toast } from "sonner";
import type { UserData } from "./types";

interface TelegramAuthParams {
  response: any;
  selectedLanguage: string;
  supabase: ReturnType<typeof createClient>;
  handleComplete?: (userData: UserData) => void;
  setIsTelegramLoading: (loading: boolean) => void;
}

/**
 * Handle Telegram authentication
 */
export async function handleTelegramAuth({
  response,
  selectedLanguage,
  supabase,
  handleComplete,
  setIsTelegramLoading
}: TelegramAuthParams) {
  setIsTelegramLoading(true);
  try {
    console.log('Telegram auth data received:', response);
    
    const response_data = await fetch(
      `https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/telegram-auth`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTg2OTQsImV4cCI6MjA3NTYzNDY5NH0.OnBM1BIQMVgJur2nM4gZGDW-PWWwSR92DpJHhPpqB88`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTg2OTQsImV4cCI6MjA3NTYzNDY5NH0.OnBM1BIQMVgJur2nM4gZGDW-PWWwSR92DpJHhPpqB88'
        },
        body: JSON.stringify({ 
          telegramData: response,
          action: 'auth'
        })
      }
    );

    if (response_data.ok) {
      const data = await response_data.json();
      console.log('Telegram auth response:', data);
      
      if (data.session) {
        await supabase.auth.setSession(data.session);
      }

      toast.success("Авторизация через Telegram успешна! 👋");

      // Проверяем существующую сессию после авторизации
      const sessionResult = await supabase.auth.getSession();
      if (sessionResult.data.session) {
        // Сессия установлена, обновляем состояние приложения напрямую
        console.log('Session established, updating app state...');

        // Загружаем профиль пользователя
        try {
          const profile = await getUserProfile(data.user.id);

          const userData: UserData = {
            id: data.user.id,
            email: data.user.email,
            name: `${response.first_name} ${response.last_name || ''}`.trim(),
            diaryData: {
              name: profile?.diaryName || 'Мой дневник',
              emoji: profile?.diaryEmoji || '🏆'
            },
            diaryName: profile?.diaryName || 'Мой дневник',
            diaryEmoji: profile?.diaryEmoji || '🏆',
            language: profile?.language || selectedLanguage,
            notificationSettings: profile?.notificationSettings || {
              selectedTime: 'none',
              morningTime: '08:00',
              eveningTime: '21:00',
              permissionGranted: false
            },
            onboardingCompleted: profile?.onboardingCompleted || false,
            createdAt: profile?.createdAt || new Date().toISOString(),
            telegramData: {
              id: response.id,
              username: response.username,
              photo_url: response.photo_url
            }
          };

          // Вызываем handleComplete с данными пользователя
          handleComplete?.(userData);
        } catch (profileError) {
          console.error('Error loading profile:', profileError);
          // Создаем базовые данные пользователя даже если не удалось загрузить профиль
          const userData: UserData = {
            id: data.user.id,
            email: data.user.email,
            name: `${response.first_name} ${response.last_name || ''}`.trim(),
            diaryData: {
              name: 'Мой дневник',
              emoji: '🏆'
            },
            diaryName: 'Мой дневник',
            diaryEmoji: '🏆',
            language: selectedLanguage,
            notificationSettings: {
              selectedTime: 'none',
              morningTime: '08:00',
              eveningTime: '21:00',
              permissionGranted: false
            },
            onboardingCompleted: false,
            createdAt: new Date().toISOString(),
            telegramData: {
              id: response.id,
              username: response.username,
              photo_url: response.photo_url
            }
          };

          handleComplete?.(userData);
        }
        return;
      }

      const userData: UserData = {
        id: data.user.id,
        email: data.user.email,
        name: `${response.first_name} ${response.last_name || ''}`.trim(),
        diaryData: {
          name: 'Мой дневник',
          emoji: '🏆'
        },
        diaryName: 'Мой дневник',
        diaryEmoji: '🏆',
        language: selectedLanguage,
        notificationSettings: {
          selectedTime: 'none',
          morningTime: '08:00',
          eveningTime: '21:00',
          permissionGranted: false
        },
        onboardingCompleted: false,
        createdAt: new Date().toISOString(),
        telegramData: {
          id: response.id,
          username: response.username,
          photo_url: response.photo_url
        }
      };

      handleComplete?.(userData);
    } else {
      const errorData = await response_data.json();
      throw new Error(errorData.error || 'Failed to process Telegram authentication');
    }
  } catch (error: any) {
    console.error('Telegram auth error:', error);
    toast.error("Ошибка авторизации через Telegram", {
      description: error.message
    });
  } finally {
    setIsTelegramLoading(false);
  }
}

interface EmailAuthParams {
  isLogin: boolean;
  email: string;
  password: string;
  name?: string;
  selectedLanguage: string;
  onboardingData?: any;
  handleComplete?: (userData: UserData) => void;
  setIsLoading: (loading: boolean) => void;
}

/**
 * Handle email authentication (login or signup)
 */
export async function handleEmailAuth({
  isLogin,
  email,
  password,
  name,
  selectedLanguage,
  onboardingData,
  handleComplete,
  setIsLoading
}: EmailAuthParams) {
  setIsLoading(true);
  
  try {
    if (isLogin) {
      // Вход
      const result = await signInWithEmail(email, password);

      if (result.success && result.user && result.profile) {
        // ✅ REMOVED: Проверка роли super_admin убрана
        // Теперь App.tsx автоматически редиректит super_admin на /?view=admin
        // через checkAccessAndRedirect() в useEffect

        toast.success("Добро пожаловать! 👋");
        handleComplete?.({
          id: result.user.id,
          email: result.user.email,
          name: result.profile.name || 'Пользователь',
          role: result.profile.role,
          diaryData: {
            name: result.profile.diaryName || 'Мой дневник',
            emoji: result.profile.diaryEmoji || '🏆'
          },
          diaryName: result.profile.diaryName || 'Мой дневник',
          diaryEmoji: result.profile.diaryEmoji || '🏆',
          language: result.profile.language || 'ru',
          notificationSettings: result.profile.notificationSettings || {
            selectedTime: 'none',
            morningTime: '09:00',
            eveningTime: '21:00',
            permissionGranted: false
          },
          onboardingCompleted: result.profile.onboardingCompleted ?? false,
          createdAt: result.profile.createdAt || new Date().toISOString()
        });
      } else {
        toast.error("Ошибка входа", {
          description: result.error || "Проверьте email и пароль"
        });
      }
    } else {
      // Регистрация
      const result = await signUpWithEmail(email, password, {
        name: name || 'Пользователь',
        diaryName: onboardingData?.diaryName || 'Мой дневник',
        diaryEmoji: onboardingData?.diaryEmoji || '🏆',
        language: onboardingData?.language || selectedLanguage,
        notificationSettings: onboardingData?.notificationSettings,
        firstEntry: onboardingData?.firstEntry
      });
      
      if (result.success && result.user && result.profile) {
        const userData: UserData = {
          id: result.user.id,
          email: result.user.email,
          name: result.profile.name || 'Пользователь',
          diaryData: {
            name: result.profile.diaryName || 'Мой дневник',
            emoji: result.profile.diaryEmoji || '🏆'
          },
          diaryName: result.profile.diaryName || 'Мой дневник',
          diaryEmoji: result.profile.diaryEmoji || '🏆',
          language: result.profile.language || 'ru',
          notificationSettings: result.profile.notificationSettings || {
            selectedTime: 'none',
            morningTime: '09:00',
            eveningTime: '21:00',
            permissionGranted: false
          },
          onboardingCompleted: result.profile.onboardingCompleted ?? false,
          createdAt: result.profile.createdAt || new Date().toISOString()
        };

        toast.success("Аккаунт создан! 🎉");
        handleComplete?.(userData);
      } else {
        toast.error("Ошибка регистрации", {
          description: result.error || "Попробуйте другой email"
        });
      }
    }
  } catch (error: any) {
    console.error("Auth error:", error);
    toast.error("Произошла ошибка", {
      description: error.message
    });
  } finally {
    setIsLoading(false);
  }
}

interface SocialAuthParams {
  provider: string;
  setIsLoading: (loading: boolean) => void;
}

/**
 * Handle social authentication (Google, Facebook, Telegram)
 */
export async function handleSocialAuth({
  provider,
  setIsLoading
}: SocialAuthParams) {
  setIsLoading(true);
  
  try {
    let result;
    
    switch (provider) {
      case 'google':
        result = await signInWithGoogle();
        toast.success("Авторизация через Google...");
        break;
      case 'facebook':
        result = await signInWithFacebook();
        toast.success("Авторизация через Facebook...");
        break;
      case 'telegram':
        // Telegram авторизация обрабатывается через Telegram Login Widget
        // который вызывает глобальный обработчик onTelegramAuth
        toast.success("Авторизация через Telegram...");
        break;
    }
    
    if (result && !result.success && result.error) {
      toast.error("Ошибка авторизации", {
        description: result.error
      });
      setIsLoading(false);
    }
    // OAuth редирект произойдет автоматически
  } catch (error: any) {
    console.error(`${provider} auth error:`, error);
    toast.error("Произошла ошибка", {
      description: error.message
    });
    setIsLoading(false);
  }
}

