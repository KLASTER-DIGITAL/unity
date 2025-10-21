import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { signUpWithEmail, signInWithEmail, signInWithGoogle, signInWithFacebook, signInWithApple, signInWithTelegram } from "@/utils/auth";
import { createClient } from "@/utils/supabase/client";
import { getUserProfile } from "@/utils/api";
import { toast } from "sonner";
import { imgEllipse, imgApple, imgGroup659 } from "@/imports/svg-ok0q3";
import { facebookIconSvg } from "@/imports/social-icons";
import { imgTelegramSvgrepoCom1 } from "@/imports/svg-jjwu7";
import TelegramLoginButton from 'react-telegram-login';

// Переводы для AuthScreen
const translations = {
  ru: {
    signIn: 'Войти',
    signUp: 'Регистрация',
    signInWith: 'Войти через',
    signUpWith: 'Регистрация через',
    yourEmail: 'Ваш email',
    yourName: 'Ваше имя',
    password: 'Пароль',
    welcomeBack: 'Добро пожаловать!',
    createAccount: 'Создать аккаунт',
    notRegisteredYet: 'Еще не зарегистрированы?',
    alreadyHaveAccountAuth: 'Уже есть аккаунт?',
    back: 'Назад'
  },
  en: {
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signInWith: 'Sign in with',
    signUpWith: 'Sign up with',
    yourEmail: 'Your email',
    yourName: 'Your name',
    password: 'Password',
    welcomeBack: 'Welcome back!',
    createAccount: 'Create account',
    notRegisteredYet: 'Not registered yet?',
    alreadyHaveAccountAuth: 'Already have an account?',
    back: 'Back'
  },
  es: {
    signIn: 'Iniciar sesión',
    signUp: 'Registrarse',
    signInWith: 'Iniciar sesión con',
    signUpWith: 'Registrarse con',
    yourEmail: 'Tu email',
    yourName: 'Tu nombre',
    password: 'Contraseña',
    welcomeBack: '¡Bienvenido de vuelta!',
    createAccount: 'Crear cuenta',
    notRegisteredYet: '¿Aún no registrado?',
    alreadyHaveAccountAuth: '¿Ya tienes cuenta?',
    back: 'Atrás'
  },
  de: {
    signIn: 'Anmelden',
    signUp: 'Registrieren',
    signInWith: 'Anmelden mit',
    signUpWith: 'Registrieren mit',
    yourEmail: 'Deine E-Mail',
    yourName: 'Dein Name',
    password: 'Passwort',
    welcomeBack: 'Willkommen zurück!',
    createAccount: 'Konto erstellen',
    notRegisteredYet: 'Noch nicht registriert?',
    alreadyHaveAccountAuth: 'Bereits ein Konto?',
    back: 'Zurück'
  },
  fr: {
    signIn: 'Se connecter',
    signUp: 'S\'inscrire',
    signInWith: 'Se connecter avec',
    signUpWith: 'S\'inscrire avec',
    yourEmail: 'Ton email',
    yourName: 'Ton nom',
    password: 'Mot de passe',
    welcomeBack: 'Bon retour !',
    createAccount: 'Créer un compte',
    notRegisteredYet: 'Pas encore inscrit ?',
    alreadyHaveAccountAuth: 'Déjà un compte ?',
    back: 'Retour'
  },
  zh: {
    signIn: '登录',
    signUp: '注册',
    signInWith: '使用以下方式登录',
    signUpWith: '使用以下方式注册',
    yourEmail: '你的邮箱',
    yourName: '你的姓名',
    password: '密码',
    welcomeBack: '欢迎回来！',
    createAccount: '创建账户',
    notRegisteredYet: '还没有注册？',
    alreadyHaveAccountAuth: '已经有账户了？',
    back: '返回'
  },
  ja: {
    signIn: 'サインイン',
    signUp: 'サインアップ',
    signInWith: 'でサインイン',
    signUpWith: 'でサインアップ',
    yourEmail: 'あなたのメール',
    yourName: 'あなたの名前',
    password: 'パスワード',
    welcomeBack: 'おかえりなさい！',
    createAccount: 'アカウントを作成',
    notRegisteredYet: 'まだ登録していませんか？',
    alreadyHaveAccountAuth: 'すでにアカウントをお持ちですか？',
    back: '戻る'
  }
};

// Декоративный элемент
function Ellipse() {
  return (
    <div className="absolute right-4 top-20 w-16 h-12 pointer-events-none z-0">
      <img className="block w-full h-full object-contain" src={imgEllipse} alt="" />
    </div>
  );
}

interface OnboardingData {
  language: string;
  diaryName: string;
  diaryEmoji: string;
  notificationSettings: {
    selectedTime: 'none' | 'morning' | 'evening' | 'both';
    morningTime: string;
    eveningTime: string;
    permissionGranted: boolean;
  };
  firstEntry: string;
}

interface AuthScreenProps {
  onComplete?: (userData: any) => void;
  onAuthComplete?: (userData: any) => void;
  onBack?: () => void;
  showTopBar?: boolean;
  contextText?: string;
  selectedLanguage?: string;
  initialMode?: 'login' | 'register';
  onboardingData?: OnboardingData;
}

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
  const currentTranslations = translations[selectedLanguage as keyof typeof translations] || translations.ru;
  
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
        <motion.form
          onSubmit={handleEmailSubmit}
          className="space-y-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Name (только для регистрации) */}
          {!isLogin && (
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={currentTranslations.yourName}
                className="w-full h-[60px] px-6 bg-input-background border-2 border-[#756ef3] rounded-[var(--radius)] outline-none transition-all duration-200 placeholder:text-[#848a94] text-[#002055]"
                required
              />
            </div>
          )}

          {/* Email */}
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={currentTranslations.yourEmail}
              className="w-full h-[60px] px-6 bg-input-background border-2 border-[#756ef3] rounded-[var(--radius)] outline-none transition-all duration-200 placeholder:text-[#848a94] text-[#002055]"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={currentTranslations.password}
              className="w-full h-[60px] px-6 bg-input-background border-2 border-[#756ef3] rounded-[var(--radius)] outline-none transition-all duration-200 placeholder:text-[#848a94] text-[#002055]"
              required
              minLength={6}
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#756ef3] text-white rounded-[var(--radius)] shadow-[0px_8px_24px_rgba(117,110,243,0.3)] hover:bg-[#6b62e8] transition-all duration-200 active:scale-98 flex items-center justify-center disabled:opacity-50"
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              isLogin ? currentTranslations.signIn : currentTranslations.signUp
            )}
          </motion.button>
        </motion.form>

        {/* Social Login */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-[#868d95] text-center mb-6 !text-[14px]">
            {isLogin ? currentTranslations.signInWith : currentTranslations.signUpWith}
          </p>
          
          <div className="flex justify-center gap-4">
            {/* Apple */}
            <button 
              type="button" 
              onClick={() => handleSocialAuth('apple')}
              disabled={isLoading}
              className="h-[58px] w-[60px] hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              <img className="block w-full h-full object-cover" src={imgApple} alt="Apple" />
            </button>
            
            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialAuth('google')}
              disabled={isLoading}
              className="relative h-[58px] w-[60px] bg-card rounded-[var(--radius)] border border-border hover:border-primary transition-all duration-200 disabled:opacity-50"
            >
              <img className="absolute inset-0 m-auto w-6 h-6" src={imgGroup659} alt="Google" />
            </button>

            {/* Facebook */}
            <button 
              type="button"
              onClick={() => handleSocialAuth('facebook')}
              disabled={isLoading}
              className="h-[58px] w-[60px] hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              <img className="block w-full h-full object-cover" src={facebookIconSvg} alt="Facebook" />
            </button>

            {/* Telegram */}
            <div className="relative h-[58px] w-[60px]">
              <TelegramLoginButton
                botName="diary_bookai_bot"
                dataOnauth={handleTelegramResponse}
                buttonSize="large"
                cornerRadius="8"
                requestAccess="write"
                usePic={false}
                lang="ru"
              />
            </div>
          </div>
        </motion.div>

        {/* Toggle Login/Signup */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            disabled={isLoading}
            className="!text-[14px] hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            <span className="text-[#868d95]">
              {isLogin ? currentTranslations.notRegisteredYet + ' ' : currentTranslations.alreadyHaveAccountAuth + ' '}
            </span>
            <span className="text-[#756ef3] !font-semibold">
              {isLogin ? currentTranslations.signUp : currentTranslations.signIn}
            </span>
          </button>
        </motion.div>

        {/* Back Button */}
        {onBack && (
          <motion.div
            className="text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              className="text-[#868d95] !text-[13px] hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              ← {currentTranslations.back}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
