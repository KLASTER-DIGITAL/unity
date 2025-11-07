import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui/select';
import { API_URLS } from '@/shared/lib/api/config/urls';
import { createClient } from '@/utils/supabase/client';

type SubscriptionModalProps = {
	isOpen: boolean;
	onClose: () => void;
	userId: string;
	userName?: string;
	onSuccess?: () => void;
};

export function SubscriptionModal({
	isOpen,
	onClose,
	userId,
	userName,
	onSuccess,
}: SubscriptionModalProps) {
	const [planType, setPlanType] = useState<'monthly' | 'yearly' | 'lifetime'>('monthly');
	const [status, setStatus] = useState<'active' | 'cancelled' | 'expired' | 'pending'>('active');
	const [amount, setAmount] = useState('499');
	const [currency, _setCurrency] = useState('RUB');
	const [paymentMethod, _setPaymentMethod] = useState<'stripe' | 'manual' | 'promo'>('manual');
	const [isSaving, setIsSaving] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			setIsSaving(true);

			// Получаем токен авторизации
			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session?.access_token) {
				throw new Error('No session');
			}

			// Создаем подписку
			const response = await fetch(`${API_URLS.ADMIN_SUBSCRIPTIONS}/subscriptions`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${session.access_token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					userId,
					planType,
					status,
					paymentMethod,
					amount: Number.parseFloat(amount),
					currency,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to create subscription');
			}

			toast.success('Подписка успешно создана');
			onSuccess?.();
			onClose();
		} catch (error) {
			console.error('Error creating subscription:', error);
			toast.error('Ошибка создания подписки');
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog onOpenChange={onClose} open={isOpen}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Создать подписку</DialogTitle>
					<DialogDescription>
						{userName ? `Создание подписки для ${userName}` : 'Создание новой подписки'}
					</DialogDescription>
				</DialogHeader>

				<form className="space-y-4" onSubmit={handleSubmit}>
					{/* Plan Type */}
					<div className="space-y-2">
						<Label htmlFor="planType">Тип подписки</Label>
						<Select onValueChange={(value: string) => setPlanType(value as typeof planType)} value={planType}>
							<SelectTrigger id="planType">
								<SelectValue placeholder="Выберите тип" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="monthly">Месячная</SelectItem>
								<SelectItem value="yearly">Годовая</SelectItem>
								<SelectItem value="lifetime">Пожизненная</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Status */}
					<div className="space-y-2">
						<Label htmlFor="status">Статус</Label>
						<Select onValueChange={(value: string) => setStatus(value as typeof status)} value={status}>
							<SelectTrigger id="status">
								<SelectValue placeholder="Выберите статус" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="active">Активна</SelectItem>
								<SelectItem value="pending">Ожидает</SelectItem>
								<SelectItem value="cancelled">Отменена</SelectItem>
								<SelectItem value="expired">Истекла</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Amount */}
					<div className="space-y-2">
						<Label htmlFor="amount">Сумма</Label>
						<Input
							id="amount"
							onChange={(e) => setAmount(e.target.value)}
							placeholder="499"
							type="number"
							value={amount}
						/>
					</div>

					<DialogFooter>
						<Button disabled={isSaving} onClick={onClose} type="button" variant="outline">
							Отмена
						</Button>
						<Button disabled={isSaving} type="submit">
							{isSaving ? 'Создание...' : 'Создать'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
