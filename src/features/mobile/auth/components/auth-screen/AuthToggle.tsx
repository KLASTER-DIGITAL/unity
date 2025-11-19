import { motion } from 'motion/react';
import { useTranslation } from '@/shared/lib/i18n';

type AuthToggleProps = {
	isLogin: boolean;
	isLoading: boolean;
	onToggle: () => void;
	onBack?: () => void;
};

/**
 * Auth Toggle Component
 * Toggle between login and registration modes
 */
export function AuthToggle({ isLogin, isLoading, onToggle, onBack }: AuthToggleProps) {
	const { t } = useTranslation();

	return (
		<>
			{/* Toggle Login/Signup */}
			<motion.div
				animate={{ opacity: 1 }}
				className="text-center"
				initial={{ opacity: 0 }}
				transition={{ duration: 0.5, delay: 0.3 }}
			>
				<button
					className="text-[14px]! transition-opacity hover:opacity-80 disabled:opacity-50"
					disabled={isLoading}
					onClick={onToggle}
					type="button"
				>
					<span className="text-[#868d95]">
						{isLogin ? `${t('auth.notRegisteredYet')} ` : `${t('auth.alreadyHaveAccountAuth')} `}
					</span>
					<span className="font-semibold! text-[#756ef3]">
						{isLogin ? t('auth.signUp') : t('auth.signIn')}
					</span>
				</button>
			</motion.div>

			{/* Back Button */}
			{onBack && (
				<motion.div
					animate={{ opacity: 1 }}
					className="mt-4 text-center"
					initial={{ opacity: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
				>
					<button
						className="text-[#868d95] text-[13px]! transition-opacity hover:opacity-80 disabled:opacity-50"
						disabled={isLoading}
						onClick={onBack}
						type="button"
					>
						← {t('auth.back')}
					</button>
				</motion.div>
			)}
		</>
	);
}
