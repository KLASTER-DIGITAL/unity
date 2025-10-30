import { motion } from "motion/react";
import type { AuthTranslations } from "./translations";

type AuthFormProps = {
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
};

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
	onSubmit,
}: AuthFormProps) {
	return (
		<motion.form
			animate={{ opacity: 1, y: 0 }}
			className="mb-8 space-y-6"
			initial={{ opacity: 0, y: 20 }}
			onSubmit={onSubmit}
			transition={{ duration: 0.5, delay: 0.1 }}
		>
			{/* Name (only for registration) */}
			{!isLogin && (
				<div className="relative">
					<input
						className="h-[60px] w-full rounded-(--radius) border-2 border-[#756ef3] bg-input-background px-6 text-[#002055] outline-none transition-all duration-200 placeholder:text-[#848a94]"
						onChange={(e) => onNameChange(e.target.value)}
						placeholder={translations.yourName}
						required
						type="text"
						value={name}
					/>
				</div>
			)}

			{/* Email */}
			<div className="relative">
				<input
					className="h-[60px] w-full rounded-(--radius) border-2 border-[#756ef3] bg-input-background px-6 text-[#002055] outline-none transition-all duration-200 placeholder:text-[#848a94]"
					onChange={(e) => onEmailChange(e.target.value)}
					placeholder={translations.yourEmail}
					required
					type="email"
					value={email}
				/>
			</div>

			{/* Password */}
			<div className="relative">
				<input
					className="h-[60px] w-full rounded-(--radius) border-2 border-[#756ef3] bg-input-background px-6 text-[#002055] outline-none transition-all duration-200 placeholder:text-[#848a94]"
					minLength={6}
					onChange={(e) => onPasswordChange(e.target.value)}
					placeholder={translations.password}
					required
					type="password"
					value={password}
				/>
			</div>

			{/* Submit Button */}
			<motion.button
				className="flex h-12 w-full items-center justify-center rounded-(--radius) bg-[#756ef3] text-white shadow-[0px_8px_24px_rgba(117,110,243,0.3)] transition-all duration-200 hover:bg-[#6b62e8] active:scale-98 disabled:opacity-50"
				disabled={isLoading}
				type="submit"
				whileTap={{ scale: isLoading ? 1 : 0.98 }}
			>
				{isLoading
					? "Загрузка..."
					: isLogin
						? translations.signIn
						: translations.signUp}
			</motion.button>
		</motion.form>
	);
}
