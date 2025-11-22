import { motion } from 'motion/react';
import type React from 'react';
import { useState } from 'react';
import { useTranslation } from '@/shared/lib/i18n';
import { createClient } from '@/utils/supabase/client';
import type { AuthScreenProps } from './auth-screen';
// Import modular components, handlers and types
import {
	AuthForm,
	AuthToggle,
	Ellipse,
	handleEmailAuth,
	handleSocialAuth,
	handleTelegramAuth,
	SocialAuthButtons,
} from './auth-screen';

// Re-export types for backward compatibility
export type { AuthScreenProps };

export function AuthScreen({
	onComplete,
	onAuthComplete,
	onBack,
	showTopBar = true,
	contextText = 'Сохраним твои успехи?',
	selectedLanguage = 'ru',
	initialMode = 'register',
	onboardingData,
}: AuthScreenProps) {
	// Используем onAuthComplete если передан, иначе onComplete
	const handleComplete = onAuthComplete || onComplete;
	const [isLogin, setIsLogin] = useState(initialMode === 'login');
	const [isLoading, setIsLoading] = useState(false);
	const [_isTelegramLoading, setIsTelegramLoading] = useState(false);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	// Получаем переводы из БД через useTranslation hook
	const { t } = useTranslation();

	// Supabase клиент для работы с сессиями
	const supabase = createClient();

	const handleTelegramResponse = (response: unknown) =>
		handleTelegramAuth({
			response,
			selectedLanguage,
			supabase,
			handleComplete,
			setIsTelegramLoading,
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
			setIsLoading,
		});
	};

	const handleSocialAuthClick = (provider: string) =>
		handleSocialAuth({
			provider,
			setIsLoading,
		});

	return (
		<div className="scrollbar-hide relative flex min-h-screen flex-col overflow-x-hidden bg-background">
			<Ellipse />

			<div className="relative z-10 flex flex-1 flex-col justify-start px-6 pt-16 pb-8">
				{/* Контекстный текст */}
				{!showTopBar && contextText && (
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						className="mb-8 text-center"
						initial={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.5 }}
					>
						<p className="font-semibold! text-[16px]! text-accent">{contextText}</p>
					</motion.div>
				)}

				{/* Заголовки */}
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className="mb-8 text-left"
					initial={{ opacity: 0, y: 20 }}
					transition={{ duration: 0.5 }}
				>
					<h1 className="mb-3 text-[#002055]">{isLogin ? t('auth.signIn') : t('auth.signUp')}</h1>
					<p className="max-w-[300px] text-[#868d95] text-[14px]! leading-relaxed">
						{isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
					</p>
				</motion.div>

				{/* Форма */}
				<AuthForm
					email={email}
					isLoading={isLoading}
					isLogin={isLogin}
					name={name}
					onEmailChange={setEmail}
					onNameChange={setName}
					onPasswordChange={setPassword}
					onSubmit={handleEmailSubmit}
					password={password}
				/>

				{/* Social Login */}
				<SocialAuthButtons
					isLoading={isLoading}
					isLogin={isLogin}
					onSocialAuth={handleSocialAuthClick}
					onTelegramAuth={handleTelegramResponse}
				/>

				{/* Toggle Login/Signup & Back Button */}
				<AuthToggle
					isLoading={isLoading}
					isLogin={isLogin}
					onBack={onBack}
					onToggle={() => setIsLogin(!isLogin)}
				/>
			</div>
		</div>
	);
}

export default AuthScreen;
