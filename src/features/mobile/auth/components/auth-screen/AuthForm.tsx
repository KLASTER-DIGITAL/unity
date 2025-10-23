import { motion } from "motion/react";
import type { AuthTranslations } from "./translations";

interface AuthFormProps {
  isLogin: boolean;
  isLoading: boolean;
  name: string;
  email: string;
  password: string;
  translations: AuthTranslations;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * Auth Form Component
 * Email/password authentication form
 */
export function AuthForm({
  isLogin,
  isLoading,
  name,
  email,
  password,
  translations,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit
}: AuthFormProps) {
  return (
    <motion.form
      onSubmit={onSubmit}
      className="space-y-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* Name (only for registration) */}
      {!isLogin && (
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={translations.yourName}
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
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder={translations.yourEmail}
          className="w-full h-[60px] px-6 bg-input-background border-2 border-[#756ef3] rounded-[var(--radius)] outline-none transition-all duration-200 placeholder:text-[#848a94] text-[#002055]"
          required
        />
      </div>

      {/* Password */}
      <div className="relative">
        <input
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder={translations.password}
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
          "Загрузка..."
        ) : (
          isLogin ? translations.signIn : translations.signUp
        )}
      </motion.button>
    </motion.form>
  );
}

