import { motion } from 'motion/react';
import { facebookIconSvg } from '@/imports/social-icons';
import { imgApple, imgGroup659 } from '@/imports/svg-ok0q3';
import { TelegramLoginWidget } from '@/shared/components/TelegramLoginWidget';
import { useTranslation } from '@/shared/lib/i18n';

type SocialAuthButtonsProps = {
	isLogin: boolean;
	isLoading: boolean;
	onSocialAuth: (provider: string) => void;
	onTelegramAuth: (response: any) => void;
};

/**
 * Social Auth Buttons Component
 * Apple, Google, Facebook, Telegram authentication buttons
 */
export function SocialAuthButtons({
	isLogin,
	isLoading,
	onSocialAuth,
	onTelegramAuth,
}: SocialAuthButtonsProps) {
	const { t } = useTranslation();

	return (
		<motion.div
			animate={{ opacity: 1 }}
			className="mb-6"
			initial={{ opacity: 0 }}
			transition={{ duration: 0.5, delay: 0.2 }}
		>
			<p className="mb-6 text-center text-[#868d95] text-[14px]!">
				{isLogin ? t('auth.signInWith') : t('auth.signUpWith')}
			</p>

			<div className="flex justify-center gap-4">
				{/* Apple */}
				<button
					className="h-[58px] w-[60px] transition-opacity hover:opacity-80 disabled:opacity-50"
					disabled={isLoading}
					onClick={() => onSocialAuth('apple')}
					type="button"
				>
					<img alt="Apple" className="block h-full w-full object-cover" src={imgApple} />
				</button>

				{/* Google */}
				<button
					className="relative h-[58px] w-[60px] rounded-(--radius) border border-border bg-card transition-all duration-200 hover:border-primary disabled:opacity-50"
					disabled={isLoading}
					onClick={() => onSocialAuth('google')}
					type="button"
				>
					<img alt="Google" className="absolute inset-0 m-auto h-6 w-6" src={imgGroup659} />
				</button>

				{/* Facebook */}
				<button
					className="h-[58px] w-[60px] transition-opacity hover:opacity-80 disabled:opacity-50"
					disabled={isLoading}
					onClick={() => onSocialAuth('facebook')}
					type="button"
				>
					<img alt="Facebook" className="block h-full w-full object-cover" src={facebookIconSvg} />
				</button>

				{/* Telegram */}
				<div className="relative h-[58px] w-[60px]">
					<TelegramLoginWidget
						botName="diary_bookai_bot"
						buttonSize="large"
						cornerRadius={8}
						lang="ru"
						onAuth={onTelegramAuth}
						requestAccess="write"
						usePic={false}
					/>
				</div>
			</div>
		</motion.div>
	);
}
