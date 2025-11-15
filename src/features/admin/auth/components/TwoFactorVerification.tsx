/**
 * Two-Factor Verification Component
 * Shown after successful email/password login for super_admin with 2FA enabled
 */

import { ArrowLeft, Shield } from 'lucide-react';
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
import { Label } from '@/shared/components/ui/label';
import { verifyBackupCode, verifyTOTPCode } from '@/shared/lib/auth/totp';
import { createClient } from '@/utils/supabase/client';

type TwoFactorVerificationProps = {
	userId: string;
	userEmail: string;
	twoFactorSecret: string;
	backupCodes: string[];
	onVerified: () => void;
	onBack: () => void;
};

export function TwoFactorVerification({
	userId,
	userEmail,
	twoFactorSecret,
	backupCodes,
	onVerified,
	onBack,
}: TwoFactorVerificationProps) {
	const [code, setCode] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [useBackupCode, setUseBackupCode] = useState(false);
	const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

	const supabase = createClient();

	async function handleVerify() {
		if (!code || (useBackupCode ? code.length !== 8 : code.length !== 6)) {
			toast.error(useBackupCode ? 'Введите 8-значный резервный код' : 'Введите 6-значный код');
			return;
		}

		setIsLoading(true);

		try {
			// Check rate limit
			const { data: rateLimitData } = await supabase.rpc('check_2fa_rate_limit', {
				p_user_id: userId,
			});

			if (rateLimitData?.is_blocked) {
				const blockUntil = new Date(rateLimitData.block_until);
				const minutesLeft = Math.ceil((blockUntil.getTime() - Date.now()) / 60000);

				toast.error('Слишком много попыток', {
					description: `Попробуйте снова через ${minutesLeft} минут`,
				});
				setIsLoading(false);
				return;
			}

			setAttemptsRemaining(rateLimitData?.attempts_remaining ?? null);

			// Verify code
			let isValid = false;

			if (useBackupCode) {
				// Verify backup code
				isValid = await verifyBackupCode(code.toUpperCase(), backupCodes);
			} else {
				// Verify TOTP code
				isValid = await verifyTOTPCode(twoFactorSecret, code);
			}

			// Record attempt
			await supabase.rpc('record_2fa_attempt', {
				p_user_id: userId,
				p_code: useBackupCode ? 'BACKUP' : code,
				p_success: isValid,
				p_ip_address: null,
				p_user_agent: navigator.userAgent,
			});

			if (!isValid) {
				const remaining = attemptsRemaining !== null ? attemptsRemaining - 1 : null;
				toast.error('Неверный код', {
					description:
						remaining !== null && remaining > 0 ? `Осталось попыток: ${remaining}` : undefined,
				});
				setCode('');
				setIsLoading(false);
				return;
			}

			// If backup code was used, remove it from the list
			if (useBackupCode && isValid) {
				const hashedCode = backupCodes.find(async (hash) => {
					const { default: crypto } = await import('crypto');
					const hashedInput = crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');
					return hash === hashedInput;
				});

				if (hashedCode) {
					const updatedCodes = backupCodes.filter((c) => c !== hashedCode);
					await supabase
						.from('profiles')
						.update({ two_factor_backup_codes: updatedCodes })
						.eq('id', userId);

					toast.warning('Резервный код использован', {
						description: `Осталось кодов: ${updatedCodes.length}`,
					});
				}
			}

			toast.success('Код подтвержден');
			onVerified();
		} catch (error) {
			console.error('2FA verification error:', error);
			toast.error('Ошибка проверки кода');
			setIsLoading(false);
		}
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800"
		>
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<div className="flex items-center gap-2">
						<Shield className="h-6 w-6 text-blue-600" />
						<CardTitle className="text-2xl">Двухфакторная аутентификация</CardTitle>
					</div>
					<CardDescription>
						{useBackupCode
							? 'Введите 8-значный резервный код'
							: 'Введите 6-значный код из приложения-аутентификатора'}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="2fa-code">
							{useBackupCode ? 'Резервный код' : 'Код подтверждения'}
						</Label>
						<Input
							id="2fa-code"
							type="text"
							maxLength={useBackupCode ? 8 : 6}
							value={code}
							onChange={(e) => setCode(e.target.value.replace(/\D/g, '').toUpperCase())}
							placeholder={useBackupCode ? 'XXXXXXXX' : '000000'}
							className="text-center text-2xl tracking-widest"
							autoFocus
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									handleVerify();
								}
							}}
						/>
						{attemptsRemaining !== null && attemptsRemaining < 5 && (
							<p className="text-sm text-orange-600 dark:text-orange-400">
								⚠️ Осталось попыток: {attemptsRemaining}
							</p>
						)}
					</div>

					<Button
						onClick={handleVerify}
						disabled={isLoading || code.length < (useBackupCode ? 8 : 6)}
						className="w-full"
					>
						{isLoading ? 'Проверка...' : 'Подтвердить'}
					</Button>

					<div className="space-y-2">
						<Button
							variant="ghost"
							onClick={() => setUseBackupCode(!useBackupCode)}
							className="w-full"
						>
							{useBackupCode ? 'Использовать код из приложения' : 'Использовать резервный код'}
						</Button>

						<Button variant="ghost" onClick={onBack} className="w-full">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Назад к входу
						</Button>
					</div>

					<div className="text-xs text-muted-foreground text-center">
						<p>Вход как: {userEmail}</p>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
