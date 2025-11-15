import { Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { createClient } from '@/utils/supabase/client';
import { TwoFactorSetup } from './TwoFactorSetup';

export function SecurityTab() {
	const [userId, setUserId] = useState<string>('');
	const [userEmail, setUserEmail] = useState<string>('');
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		loadUserData();
	}, []);

	async function loadUserData() {
		try {
			const supabase = createClient();
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();

			if (error) throw error;

			if (user) {
				setUserId(user.id);
				setUserEmail(user.email || '');
			}
		} catch (error) {
			console.error('Error loading user data:', error);
			toast.error('Ошибка загрузки данных пользователя');
		} finally {
			setIsLoading(false);
		}
	}

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Shield className="h-5 w-5 text-primary" />
							<CardTitle>Безопасность</CardTitle>
						</div>
						<CardDescription>Загрузка...</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Shield className="h-5 w-5 text-primary" />
						<CardTitle>Безопасность</CardTitle>
					</div>
					<CardDescription>Настройки безопасности вашего аккаунта</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Two-Factor Authentication */}
					<div>
						<h3 className="mb-4 font-semibold text-lg">Двухфакторная аутентификация (2FA)</h3>
						<TwoFactorSetup userId={userId} userEmail={userEmail} />
					</div>

					{/* Future: Other security settings */}
					{/* 
					<div>
						<h3 className="mb-4 font-semibold text-lg">Активные сессии</h3>
						<p className="text-muted-foreground text-sm">
							Управление активными сессиями (в разработке)
						</p>
					</div>
					*/}
				</CardContent>
			</Card>
		</div>
	);
}
