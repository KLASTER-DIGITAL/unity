/**
 * Two-Factor Authentication Setup Component
 * Allows super_admin to enable/disable 2FA
 */

import QRCode from 'qrcode';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { DangerousActionDialog } from '@/shared/components/ui/DangerousActionDialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
	generateBackupCodes,
	generateTOTPSecret,
	generateTOTPUri,
	hashBackupCode,
	verifyTOTPCode,
} from '@/shared/lib/auth/totp';
import { createClient } from '@/utils/supabase/client';

type TwoFactorSetupProps = {
	userId: string;
	userEmail: string;
};

export function TwoFactorSetup({ userId, userEmail }: TwoFactorSetupProps) {
	const [isEnabled, setIsEnabled] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSetupMode, setIsSetupMode] = useState(false);
	const [secret, setSecret] = useState('');
	const [qrCodeUrl, setQrCodeUrl] = useState('');
	const [verificationCode, setVerificationCode] = useState('');
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [showBackupCodes, setShowBackupCodes] = useState(false);
	const [showDisableDialog, setShowDisableDialog] = useState(false);

	const supabase = createClient();

	const loadTwoFactorStatus = useCallback(async () => {
		try {
			const { data, error } = await supabase
				.from('profiles')
				.select('two_factor_enabled')
				.eq('id', userId)
				.single();

			if (error) throw error;

			setIsEnabled(data?.two_factor_enabled || false);
		} catch (error) {
			console.error('Error loading 2FA status:', error);
			toast.error('Ошибка загрузки статуса 2FA');
		} finally {
			setIsLoading(false);
		}
	}, [supabase, userId]);

	// Load 2FA status on mount
	useEffect(() => {
		loadTwoFactorStatus();
	}, [loadTwoFactorStatus]);

	async function handleEnableTwoFactor() {
		setIsSetupMode(true);

		// Generate secret and QR code
		const newSecret = generateTOTPSecret();
		setSecret(newSecret);

		const uri = generateTOTPUri(newSecret, userEmail);
		const qrUrl = await QRCode.toDataURL(uri);
		setQrCodeUrl(qrUrl);

		// Generate backup codes
		const codes = generateBackupCodes(10);
		setBackupCodes(codes);
	}

	async function handleVerifyAndEnable() {
		if (!verificationCode || verificationCode.length !== 6) {
			toast.error('Введите 6-значный код');
			return;
		}

		setIsLoading(true);

		try {
			// Verify TOTP code
			const isValid = await verifyTOTPCode(secret, verificationCode);

			if (!isValid) {
				toast.error('Неверный код. Попробуйте снова.');
				setIsLoading(false);
				return;
			}

			// Hash backup codes
			const hashedCodes = await Promise.all(backupCodes.map((code) => hashBackupCode(code)));

			// Save to database
			const { error } = await supabase
				.from('profiles')
				.update({
					two_factor_enabled: true,
					two_factor_secret: secret,
					two_factor_backup_codes: hashedCodes,
					two_factor_verified_at: new Date().toISOString(),
				})
				.eq('id', userId);

			if (error) throw error;

			toast.success('2FA успешно включен!');
			setIsEnabled(true);
			setIsSetupMode(false);
			setShowBackupCodes(true);
		} catch (error) {
			console.error('Error enabling 2FA:', error);
			toast.error('Ошибка включения 2FA');
		} finally {
			setIsLoading(false);
		}
	}

	async function handleDisableTwoFactor() {
		setIsLoading(true);

		try {
			const { error } = await supabase
				.from('profiles')
				.update({
					two_factor_enabled: false,
					two_factor_secret: null,
					two_factor_backup_codes: null,
					two_factor_verified_at: null,
				})
				.eq('id', userId);

			if (error) throw error;

			toast.success('2FA отключен');
			setIsEnabled(false);
		} catch (error) {
			console.error('Error disabling 2FA:', error);
			toast.error('Ошибка отключения 2FA');
		} finally {
			setIsLoading(false);
		}
	}

	if (isLoading && !isSetupMode) {
		return <div>Загрузка...</div>;
	}

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Двухфакторная аутентификация (2FA)</CardTitle>
					<CardDescription>
						Дополнительный уровень защиты для вашего аккаунта супер-админа
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{!isEnabled && !isSetupMode && (
						<div className="space-y-4">
							<Alert>
								<AlertDescription>
									2FA добавляет дополнительный уровень безопасности, требуя код из
									приложения-аутентификатора при входе.
								</AlertDescription>
							</Alert>
							<Button onClick={handleEnableTwoFactor}>Включить 2FA</Button>
						</div>
					)}

					{isSetupMode && (
						<div className="space-y-4">
							<div>
								<h3 className="text-lg font-semibold mb-2">Шаг 1: Сканируйте QR код</h3>
								<p className="text-sm text-muted-foreground mb-4">
									Используйте приложение-аутентификатор (Google Authenticator, Authy, 1Password) для
									сканирования QR кода
								</p>
								{qrCodeUrl && (
									<img src={qrCodeUrl} alt="QR Code" className="w-64 h-64 mx-auto border rounded" />
								)}
								<p className="text-xs text-muted-foreground mt-2 text-center">
									Или введите код вручную:{' '}
									<code className="bg-muted px-2 py-1 rounded">{secret}</code>
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold mb-2">Шаг 2: Введите код подтверждения</h3>
								<Label htmlFor="verification-code">6-значный код из приложения</Label>
								<Input
									id="verification-code"
									type="text"
									maxLength={6}
									value={verificationCode}
									onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
									placeholder="000000"
									className="text-center text-2xl tracking-widest"
								/>
							</div>

							<div className="flex gap-2">
								<Button
									onClick={handleVerifyAndEnable}
									disabled={isLoading || verificationCode.length !== 6}
								>
									{isLoading ? 'Проверка...' : 'Подтвердить и включить'}
								</Button>
								<Button variant="outline" onClick={() => setIsSetupMode(false)}>
									Отмена
								</Button>
							</div>
						</div>
					)}

					{isEnabled && !showBackupCodes && (
						<div className="space-y-4">
							<Alert>
								<AlertDescription className="text-green-600">
									✅ 2FA включен. Ваш аккаунт защищен дополнительным уровнем безопасности.
								</AlertDescription>
							</Alert>
							<Button variant="destructive" onClick={() => setShowDisableDialog(true)}>
								Отключить 2FA
							</Button>
						</div>
					)}

					{showBackupCodes && (
						<div className="space-y-4">
							<Alert>
								<AlertDescription>
									⚠️ Сохраните эти резервные коды в безопасном месте. Они понадобятся если вы
									потеряете доступ к приложению-аутентификатору.
								</AlertDescription>
							</Alert>
							<div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded">
								{backupCodes.map((code) => (
									<code key={code} className="text-sm">
										{code}
									</code>
								))}
							</div>
							<Button onClick={() => setShowBackupCodes(false)}>Я сохранил коды</Button>
						</div>
					)}
				</CardContent>
			</Card>

			<DangerousActionDialog
				open={showDisableDialog}
				onOpenChange={setShowDisableDialog}
				onConfirm={handleDisableTwoFactor}
				title="Отключить 2FA?"
				description={
					<>
						<p className="font-semibold text-destructive">
							⚠️ Это снизит безопасность вашего аккаунта!
						</p>
						<p>
							Двухфакторная аутентификация защищает ваш аккаунт от несанкционированного доступа.
						</p>
					</>
				}
				confirmButtonText="Отключить 2FA"
			/>
		</>
	);
}
