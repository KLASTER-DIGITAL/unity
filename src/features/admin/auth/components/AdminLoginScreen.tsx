import { ArrowLeft, Eye, EyeOff, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { createClient } from '@/utils/supabase/client';

type AdminLoginScreenProps = {
	onComplete: (userData: any) => void;
	onBack: () => void;
};

export function AdminLoginScreen({ onComplete, onBack }: AdminLoginScreenProps) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log('🔐 [AdminLoginScreen] handleLogin called');

		if (!(email && password)) {
			toast.error('Заполните все поля');
			return;
		}

		setIsLoading(true);
		console.log('🔐 [AdminLoginScreen] Starting login process...');

		try {
			const supabase = createClient();
			console.log('🔐 [AdminLoginScreen] Supabase client created');

			// 🔒 SECURITY: Проверка rate limit ПЕРЕД попыткой входа
			console.log('🔒 [AdminLoginScreen] Checking rate limit...');
			const { data: rateLimitData, error: rateLimitError } = await supabase.rpc(
				'check_admin_login_rate_limit',
				{
					p_email: email,
					p_ip_address: null, // TODO: получить IP через Edge Function
				}
			);

			if (rateLimitError) {
				console.error('Rate limit check error:', rateLimitError);
				// Продолжаем даже если проверка не удалась (fail-open для доступности)
			} else if (rateLimitData?.is_blocked) {
				const blockUntil = new Date(rateLimitData.block_until);
				const minutesLeft = Math.ceil((blockUntil.getTime() - Date.now()) / 60000);

				toast.error('Слишком много попыток входа', {
					description: `Попробуйте снова через ${minutesLeft} минут`,
				});
				setIsLoading(false);
				return;
			} else if (rateLimitData) {
				setAttemptsRemaining(rateLimitData.attempts_remaining);
				console.log('🔒 [AdminLoginScreen] Attempts remaining:', rateLimitData.attempts_remaining);
			}

			// Вход через Supabase
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				console.error('Sign in error:', error);

				// 🔒 SECURITY: Записать неудачную попытку
				await supabase.rpc('record_admin_login_attempt', {
					p_email: email,
					p_success: false,
					p_ip_address: null,
					p_user_agent: navigator.userAgent,
				});

				// Обновить счетчик попыток
				if (attemptsRemaining !== null && attemptsRemaining > 1) {
					toast.error('Неверный email или пароль', {
						description: `Осталось попыток: ${attemptsRemaining - 1}`,
					});
				} else {
					toast.error('Неверный email или пароль');
				}

				setIsLoading(false);
				return;
			}

			if (!data.session) {
				toast.error('Не удалось войти в систему');
				setIsLoading(false);
				return;
			}

			console.log('🔐 [AdminLoginScreen] Session created, fetching profile from DB...');

			// Получаем профиль пользователя напрямую из БД (как PWA пользователи)
			// Это быстрее и надежнее чем через Edge Function
			const { data: profileData, error: profileError } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', data.user.id)
				.single();

			if (profileError) {
				console.error('Profile fetch error:', profileError);
				toast.error('Ошибка загрузки профиля');
				setIsLoading(false);
				return;
			}

			if (!profileData) {
				console.error('Profile not found for user:', data.user.id);
				toast.error('Профиль не найден');
				setIsLoading(false);
				return;
			}

			console.log(
				'🔐 [AdminLoginScreen] Profile loaded:',
				profileData.email,
				'role:',
				profileData.role
			);

			// 🔒 SECURITY: Проверка роли - только super_admin может войти в админ-панель
			if (profileData.role !== 'super_admin') {
				toast.error('Доступ запрещен', {
					description: 'У вас нет прав доступа к панели администратора',
				});
				// Выходим из системы
				await supabase.auth.signOut();
				setIsLoading(false);
				return;
			}

			// Формируем userData в том же формате что и раньше
			const userData = {
				id: data.user.id,
				email: data.user.email,
				name: profileData.name,
				role: profileData.role,
				diaryData: {
					name: profileData.diary_name,
					emoji: profileData.diary_emoji,
				},
				language: profileData.language,
				notificationSettings: profileData.notification_settings,
				createdAt: profileData.created_at,
				profile: {
					id: profileData.id,
					name: profileData.name,
					email: profileData.email,
					role: profileData.role,
					diaryName: profileData.diary_name,
					diaryEmoji: profileData.diary_emoji,
					language: profileData.language,
					notificationSettings: profileData.notification_settings,
					onboardingCompleted: profileData.onboarding_completed,
					createdAt: profileData.created_at,
				},
			};

			console.log(
				'🔐 [AdminLoginScreen] Admin login successful:',
				userData.email,
				'role:',
				userData.role
			);

			// 🔒 SECURITY: Записать успешную попытку
			await supabase.rpc('record_admin_login_attempt', {
				p_email: email,
				p_success: true,
				p_ip_address: null,
				p_user_agent: navigator.userAgent,
			});

			toast.success('Вход выполнен успешно');

			// Вызываем onComplete для перехода к админ-панели
			console.log('🔐 [AdminLoginScreen] Calling onComplete...');
			onComplete(userData);
			console.log('🔐 [AdminLoginScreen] onComplete called');
		} catch (error) {
			console.error('Login error:', error);
			toast.error('Ошибка входа. Попробуйте снова.');
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="w-full max-w-md"
				initial={{ opacity: 0, y: 20 }}
				transition={{ duration: 0.4 }}
			>
				<Card className="shadow-lg">
					<CardHeader className="space-y-4 pb-6 text-center">
						{/* Back Button */}
						<button
							type="button"
							className="absolute top-6 left-6 flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-accent/10"
							onClick={onBack}
						>
							<ArrowLeft className="h-5 w-5 text-foreground" />
						</button>

						{/* Logo */}
						<div className="flex justify-center">
							<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
								<Shield className="h-8 w-8 text-white" />
							</div>
						</div>

						<div className="space-y-2">
							<CardTitle className="text-foreground">Панель администратора</CardTitle>
							<CardDescription>Вход только для супер-администратора</CardDescription>
						</div>
					</CardHeader>

					<CardContent>
						<form className="space-y-4" onSubmit={handleLogin}>
							{/* Email Input */}
							<div className="space-y-2">
								<label className="text-foreground" htmlFor="admin-email">
									Email
								</label>
								<Input
									autoComplete="email"
									className="h-12"
									disabled={isLoading}
									id="admin-email"
									onChange={(e) => setEmail(e.target.value)}
									placeholder="admin@example.com"
									required
									type="email"
									value={email}
								/>
							</div>

							{/* Password Input */}
							<div className="space-y-2">
								<label className="text-foreground" htmlFor="admin-password">
									Пароль
								</label>
								<div className="relative">
									<Input
										autoComplete="current-password"
										className="h-12 pr-12"
										disabled={isLoading}
										id="admin-password"
										onChange={(e) => setPassword(e.target.value)}
										placeholder="Введите пароль"
										required
										type={showPassword ? 'text' : 'password'}
										value={password}
									/>
									<button
										className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground transition-colors hover:text-foreground"
										onClick={() => setShowPassword(!showPassword)}
										tabIndex={-1}
										type="button"
									>
										{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
									</button>
								</div>
							</div>

							{/* Login Button */}
							<Button
								className="mt-6 h-12 w-full bg-accent text-white hover:bg-accent/90"
								disabled={isLoading}
								type="submit"
							>
								{isLoading ? 'Загрузка...' : 'Войти'}
							</Button>

							{/* Security Notice */}
							<div className="mt-6 rounded-lg bg-muted p-4">
								<div className="flex items-start gap-3">
									<Shield className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
									<div className="text-muted-foreground">
										<p className="mb-1">Защищенный доступ</p>
										<p>
											Только для пользователей с ролью{' '}
											<span className="font-semibold text-foreground">super_admin</span>
										</p>
										{attemptsRemaining !== null && attemptsRemaining < 5 && (
											<p className="mt-2 text-sm text-orange-600 dark:text-orange-400">
												⚠️ Осталось попыток: {attemptsRemaining}
											</p>
										)}
									</div>
								</div>
							</div>
						</form>
					</CardContent>
				</Card>

				{/* Additional Info */}
				<div className="mt-6 text-center text-muted-foreground">
					<p>
						Нет доступа?{' '}
						<button
							type="button"
							className="font-semibold text-accent hover:underline"
							onClick={onBack}
						>
							Вернуться на главную
						</button>
					</p>
				</div>
			</motion.div>
		</div>
	);
}
