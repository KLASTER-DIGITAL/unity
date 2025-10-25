import React, { useState } from "react";
import { motion } from "motion/react";
import { createClient } from "@/utils/supabase/client";

// Import modular components, handlers and types
import {
  authTranslations,
  Ellipse,
  AuthForm,
  SocialAuthButtons,
  AuthToggle,
  handleTelegramAuth,
  handleEmailAuth,
  handleSocialAuth
} from "./auth-screen";
import type { AuthScreenProps } from "./auth-screen";

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

  const handleTelegramResponse = (response: any) => handleTelegramAuth({
    response,
    selectedLanguage,
    supabase,
    handleComplete,
    setIsTelegramLoading
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleEmailAuth({
      isLogin,
      email,
      password,
      name,
      selectedLanguage,
      onboardingData,
      handleComplete,
      setIsLoading
    });
  };

  const handleSocialAuthClick = (provider: string) => handleSocialAuth({
    provider,
    setIsLoading
  });

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
            <p className="text-accent text-[16px]! font-semibold!">{contextText}</p>
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
          <p className="text-[#868d95] text-[14px]! leading-relaxed max-w-[300px]">
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
          onSocialAuth={handleSocialAuthClick}
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

export default AuthScreen;
