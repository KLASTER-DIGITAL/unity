import React, { useState } from "react";
import { motion } from "motion/react";
import { signUpWithEmail, signInWithEmail, signInWithGoogle, signInWithFacebook } from "@/utils/auth";
import { createClient } from "@/utils/supabase/client";
import { getUserProfile } from "@/shared/lib/api";
import { toast } from "sonner";

// Import modular components and types
import {
  authTranslations,
  Ellipse,
  AuthForm,
  SocialAuthButtons,
  AuthToggle
} from "./auth-screen";
import type { AuthScreenProps, UserData } from "./auth-screen";

// Re-export types for backward compatibility
export type { AuthScreenProps };



export function AuthScreen({
  onComplete,
  onAuthComplete,
  onBack,
  showTopBar = true,
  contextText = "Сохраним твои успехи?",
  selectedLanguage = "ru",
  initialMode = 'register',
  onboardingData
}: AuthScreenProps) {
  // Используем onAuthComplete если передан, иначе onComplete
  const handleComplete = onAuthComplete || onComplete;
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [isLoading, setIsLoading] = useState(false);
  const [isTelegramLoading, setIsTelegramLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Получаем переводы для выбранного языка
  const currentTranslations = authTranslations[selectedLanguage as keyof typeof authTranslations] || authTranslations.ru;
  
  // Supabase клиент для работы с сессиями
  const supabase = createClient();

  const handleTelegramResponse = async (response: any) => {
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

            const userData = {
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
            const userData = {
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

        const userData = {
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
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        // Вход
        const result = await signInWithEmail(email, password);

        if (result.success && result.user && result.profile) {
          // 🔒 SECURITY: Проверка роли - супер-админ не может войти через PWA
          if (result.profile.role === 'super_admin') {
            toast.error("Доступ запрещен", {
              description: "Используйте /?view=admin для входа в админ-панель"
            });
            // Выходим из системы
            const supabase = createClient();
            await supabase.auth.signOut();
            setIsLoading(false);
            return;
          }

          toast.success("Добро пожаловать! 👋");
          handleComplete?.({
            id: result.user.id,
            email: result.user.email,
            name: result.profile.name,
            role: result.profile.role, // Добавляем role
            diaryData: {
              name: result.profile.diaryName,
              emoji: result.profile.diaryEmoji
            },
            diaryName: result.profile.diaryName,
            diaryEmoji: result.profile.diaryEmoji,
            language: result.profile.language,
            notificationSettings: result.profile.notificationSettings,
            onboardingCompleted: result.profile.onboardingCompleted, // ✅ Передаем статус онбординга
            createdAt: result.profile.createdAt
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
          const userData = {
            id: result.user.id,
            email: result.user.email,
            name: result.profile.name,
            diaryData: {
              name: result.profile.diaryName,
              emoji: result.profile.diaryEmoji
            },
            diaryName: result.profile.diaryName,
            diaryEmoji: result.profile.diaryEmoji,
            language: result.profile.language,
            notificationSettings: result.profile.notificationSettings,
            onboardingCompleted: result.profile.onboardingCompleted,
            createdAt: result.profile.createdAt
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
  };

  const handleSocialAuth = async (provider: string) => {
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
      
      if (!result.success && result.error) {
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
  };

  return (
    <div className="bg-background relative min-h-screen flex flex-col overflow-x-hidden scrollbar-hide">
      <Ellipse />
      
      <div className="flex-1 flex flex-col justify-start px-6 pt-16 pb-8 relative z-10">
        
        {/* Контекстный текст */}
        {!showTopBar && contextText && (
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-accent !text-[16px] !font-semibold">{contextText}</p>
          </motion.div>
        )}
        
        {/* Заголовки */}
        <motion.div
          className="text-left mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-[#002055] mb-3">
            {isLogin ? currentTranslations.signIn : currentTranslations.signUp}
          </h1>
          <p className="text-[#868d95] !text-[14px] leading-relaxed max-w-[300px]">
            {isLogin 
              ? currentTranslations.welcomeBack
              : currentTranslations.createAccount
            }
          </p>
        </motion.div>

        {/* Форма */}
        <AuthForm
          isLogin={isLogin}
          isLoading={isLoading}
          name={name}
          email={email}
          password={password}
          translations={currentTranslations}
          onNameChange={setName}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleEmailSubmit}
        />

        {/* Social Login */}
        <SocialAuthButtons
          isLogin={isLogin}
          isLoading={isLoading}
          translations={currentTranslations}
          onSocialAuth={handleSocialAuth}
          onTelegramAuth={handleTelegramResponse}
        />

        {/* Toggle Login/Signup & Back Button */}
        <AuthToggle
          isLogin={isLogin}
          isLoading={isLoading}
          translations={currentTranslations}
          onToggle={() => setIsLogin(!isLogin)}
          onBack={onBack}
        />
      </div>
    </div>
  );
}
