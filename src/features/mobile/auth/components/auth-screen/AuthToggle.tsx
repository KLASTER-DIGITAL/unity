import { motion } from "motion/react";
import type { AuthTranslations } from "./translations";

interface AuthToggleProps {
  isLogin: boolean;
  isLoading: boolean;
  translations: AuthTranslations;
  onToggle: () => void;
  onBack?: () => void;
}

/**
 * Auth Toggle Component
 * Toggle between login and registration modes
 */
export function AuthToggle({
  isLogin,
  isLoading,
  translations,
  onToggle,
  onBack
}: AuthToggleProps) {
  return (
    <>
      {/* Toggle Login/Signup */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <button
          type="button"
          onClick={onToggle}
          disabled={isLoading}
          className="!text-[14px] hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          <span className="text-[#868d95]">
            {isLogin ? translations.notRegisteredYet + ' ' : translations.alreadyHaveAccountAuth + ' '}
          </span>
          <span className="text-[#756ef3] !font-semibold">
            {isLogin ? translations.signUp : translations.signIn}
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
            ← {translations.back}
          </button>
        </motion.div>
      )}
    </>
  );
}

