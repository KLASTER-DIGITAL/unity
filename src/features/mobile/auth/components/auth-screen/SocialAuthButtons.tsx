// ✅ FIX: Все импорты удалены, компонент возвращает null

type SocialAuthButtonsProps = {
	isLogin: boolean;
	isLoading: boolean;
	onSocialAuth: (provider: string) => void;
	onTelegramAuth: (response: unknown) => void;
};

/**
 * Social Auth Buttons Component
 * Apple, Google, Facebook, Telegram authentication buttons
 */
export function SocialAuthButtons(_props: SocialAuthButtonsProps) {
	// ✅ FIX: Скрыть авторизацию через социальные сети
	return null;
}
