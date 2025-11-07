import { Check, Crown, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { API_URLS } from '@/shared/lib/api/config/urls';
import { createClient } from '@/utils/supabase/client';

type SubscriptionInfoModalProps = {
	open: boolean;
	onClose: () => void;
	userId: string;
};

type Subscription = {
	id: string;
	plan_type: 'monthly' | 'yearly' | 'lifetime';
	status: 'active' | 'cancelled' | 'expired' | 'pending';
	start_date: string;
	end_date?: string;
	auto_renew: boolean;
	amount?: number;
	currency?: string;
};

export function SubscriptionInfoModal({ open, onClose, userId }: SubscriptionInfoModalProps) {
	const [subscription, setSubscription] = useState<Subscription | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (open && userId) {
			loadSubscription();
		}
	}, [open, userId]);

	const loadSubscription = async () => {
		try {
			setIsLoading(true);

			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session?.access_token) {
				throw new Error('No session');
			}

			// Получаем активную подписку пользователя
			const response = await fetch(`${API_URLS.ADMIN_SUBSCRIPTIONS}/subscriptions/${userId}`, {
				headers: {
					Authorization: `Bearer ${session.access_token}`,
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				throw new Error('Failed to load subscription');
			}

			const result = await response.json();
			const activeSubscription = result.subscriptions?.find(
				(sub: Subscription) => sub.status === 'active'
			);

			setSubscription(activeSubscription || null);
		} catch (error) {
			console.error('Error loading subscription:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const getPlanName = (planType: string) => {
		switch (planType) {
			case 'monthly':
				return 'Месячная';
			case 'yearly':
				return 'Годовая';
			case 'lifetime':
				return 'Пожизненная';
			default:
				return planType;
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'active':
				return (
					<Badge className="border-green-500/20 bg-green-500/10 text-green-600">Активна</Badge>
				);
			case 'cancelled':
				return <Badge variant="outline">Отменена</Badge>;
			case 'expired':
				return <Badge variant="destructive">Истекла</Badge>;
			case 'pending':
				return <Badge variant="secondary">Ожидает</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const premiumFeatures = [
		{ title: 'Offline режим', icon: '📴' },
		{ title: 'Премиум-темы', icon: '🎨' },
		{ title: 'Автоматическое резервирование', icon: '☁️' },
		{ title: 'Расширенный экспорт', icon: '📦' },
		{ title: 'Приоритетная поддержка', icon: '⚡' },
		{ title: 'Расширенная аналитика', icon: '📊' },
	];

	return (
		<AnimatePresence>
			{open && (
				<>
					<motion.div
						animate={{ opacity: 1 }}
						className="fixed inset-0 z-modal bg-black/50 backdrop-blur-sm"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						onClick={onClose}
					/>

					<motion.div
						animate={{ opacity: 1, y: 0 }}
						className="modal-bottom-sheet z-modal mx-auto max-w-md overflow-y-auto border-border border-t bg-card p-modal transition-colors duration-300"
						exit={{ opacity: 0, y: 100 }}
						initial={{ opacity: 0, y: 100 }}
					>
						<div className="mb-4 flex items-center justify-between">
							<div className="flex items-center gap-responsive-sm">
								<Crown className="h-6 w-6 text-yellow-500" />
								<h3 className="text-foreground text-title-2">UNITY Premium</h3>
							</div>
							<button
								className="rounded-full p-1 transition-colors hover:bg-accent/10"
								onClick={onClose}
							>
								<X className="h-5 w-5 text-foreground" />
							</button>
						</div>

						{isLoading ? (
							<div className="py-8 text-center text-muted-foreground">Загрузка...</div>
						) : subscription ? (
							<div className="space-y-4">
								{/* Subscription Info */}
								<div className="space-y-3 rounded-lg border-border border bg-muted/30 p-4">
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground text-sm">Тип подписки</span>
										<span className="font-medium text-foreground">
											{getPlanName(subscription.plan_type)}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground text-sm">Статус</span>
										{getStatusBadge(subscription.status)}
									</div>
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground text-sm">Дата начала</span>
										<span className="font-medium text-foreground">
											{new Date(subscription.start_date).toLocaleDateString('ru-RU')}
										</span>
									</div>
									{subscription.end_date && (
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground text-sm">Дата окончания</span>
											<span className="font-medium text-foreground">
												{new Date(subscription.end_date).toLocaleDateString('ru-RU')}
											</span>
										</div>
									)}
									{subscription.amount && (
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground text-sm">Стоимость</span>
											<span className="font-medium text-foreground">
												{subscription.amount} {subscription.currency || 'RUB'}
											</span>
										</div>
									)}
								</div>

								{/* Premium Features */}
								<div className="space-y-3">
									<h4 className="font-semibold text-foreground text-sm">Доступные возможности</h4>
									<div className="grid grid-cols-2 gap-2">
										{premiumFeatures.map((feature) => (
											<div
												key={feature.title}
												className="flex items-center gap-2 rounded-lg border-border border bg-background p-3 transition-colors duration-300"
											>
												<span className="text-xl">{feature.icon}</span>
												<span className="text-foreground text-xs">{feature.title}</span>
											</div>
										))}
									</div>
								</div>

								<Button className="w-full" onClick={onClose} variant="outline">
									Закрыть
								</Button>
							</div>
						) : (
							<div className="space-y-4">
								<p className="text-center text-muted-foreground text-sm">
									У вас нет активной подписки Premium
								</p>

								{/* Premium Features */}
								<div className="space-y-3">
									<h4 className="font-semibold text-foreground text-sm">Возможности Premium</h4>
									<div className="grid grid-cols-2 gap-2">
										{premiumFeatures.map((feature) => (
											<div
												key={feature.title}
												className="flex items-center gap-2 rounded-lg border-border border bg-background p-3 transition-colors duration-300"
											>
												<span className="text-xl">{feature.icon}</span>
												<span className="text-foreground text-xs">{feature.title}</span>
											</div>
										))}
									</div>
								</div>

								<Button className="w-full" onClick={onClose} variant="outline">
									Закрыть
								</Button>
							</div>
						)}
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
