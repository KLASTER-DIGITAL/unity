import { motion } from "motion/react";
import TelegramLoginButton from 'react-telegram-login';
import { imgApple, imgGroup659 } from "@/imports/svg-ok0q3";
import { facebookIconSvg } from "@/imports/social-icons";
import type { AuthTranslations } from "./translations";

interface SocialAuthButtonsProps {
  isLogin: boolean;
  isLoading: boolean;
  translations: AuthTranslations;
  onSocialAuth: (provider: string) => void;
  onTelegramAuth: (response: any) => void;
}

/**
 * Social Auth Buttons Component
 * Apple, Google, Facebook, Telegram authentication buttons
 */
export function SocialAuthButtons({
  isLogin,
  isLoading,
  translations,
  onSocialAuth,
  onTelegramAuth
}: SocialAuthButtonsProps) {
  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <p className="text-[#868d95] text-center mb-6 text-[14px]!">
        {isLogin ? translations.signInWith : translations.signUpWith}
      </p>
      
      <div className="flex justify-center gap-4">
        {/* Apple */}
        <button 
          type="button" 
          onClick={() => onSocialAuth('apple')}
          disabled={isLoading}
          className="h-[58px] w-[60px] hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          <img className="block w-full h-full object-cover" src={imgApple} alt="Apple" />
        </button>
        
        {/* Google */}
        <button
          type="button"
          onClick={() => onSocialAuth('google')}
          disabled={isLoading}
          className="relative h-[58px] w-[60px] bg-card rounded-(--radius) border border-border hover:border-primary transition-all duration-200 disabled:opacity-50"
        >
          <img className="absolute inset-0 m-auto w-6 h-6" src={imgGroup659} alt="Google" />
        </button>

        {/* Facebook */}
        <button 
          type="button"
          onClick={() => onSocialAuth('facebook')}
          disabled={isLoading}
          className="h-[58px] w-[60px] hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          <img className="block w-full h-full object-cover" src={facebookIconSvg} alt="Facebook" />
        </button>

        {/* Telegram */}
        <div className="relative h-[58px] w-[60px]">
          <TelegramLoginButton
            botName="diary_bookai_bot"
            dataOnauth={onTelegramAuth}
            buttonSize="large"
            cornerRadius="8"
            requestAccess="write"
            usePic={false}
            lang="ru"
          />
        </div>
      </div>
    </motion.div>
  );
}

