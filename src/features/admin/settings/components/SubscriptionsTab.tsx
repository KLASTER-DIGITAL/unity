import { DollarSign, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/shared/components/ui/table';

export function SubscriptionsTab() {
	const [subscriptions, setSubscriptions] = useState<any[]>([]);
	const [stats, _setStats] = useState({
		totalRevenue: 47_280,
		activeSubscriptions: 156,
		churnRate: 3.2,
		mrr: 15_600,
	});

	useEffect(() => {
		loadSubscriptions();
		// biome-ignore lint/correctness/useExhaustiveDependencies: loadSubscriptions is stable
	}, []);

	const loadSubscriptions = async () => {
		try {
			// TODO: Загрузка подписок с сервера
			setSubscriptions([
				{
					id: '1',
					userName: 'Алексей Иванов',
					userEmail: 'alexey@example.com',
					plan: 'premium_monthly',
					status: 'active',
					startDate: '2024-02-01',
					nextBillingDate: '2024-04-01',
					amount: 399,
				},
				{
					id: '2',
					userName: 'Мария Петрова',
					userEmail: 'maria@example.com',
					plan: 'premium_yearly',
					status: 'active',
					startDate: '2024-01-15',
					nextBillingDate: '2025-01-15',
					amount: 3990,
				},
			]);
		} catch (error) {
			console.error('Error loading subscriptions:', error);
		}
	};

	const getPlanBadge = (plan: string) => {
		if (plan === 'premium_yearly') {
			return <Badge className="border-accent bg-accent/10 text-accent">Годовая</Badge>;
		}
		return <Badge variant="outline">Месячная</Badge>;
	};

	const getStatusBadge = (status: string) => {
		if (status === 'active') {
			return <Badge className="border-green-500/20 bg-green-500/10 text-green-600">Активна</Badge>;
		}
		return (
			<Badge className="bg-muted" variant="outline">
				Отменена
			</Badge>
		);
	};

	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
							<DollarSign className="h-4 w-4" />
							Общий доход
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-semibold text-foreground">
							{stats.totalRevenue.toLocaleString()} ₽
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
							<Users className="h-4 w-4" />
							Активных подписок
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-semibold text-foreground">
							{stats.activeSubscriptions}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
							<TrendingUp className="h-4 w-4" />
							MRR
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-semibold text-foreground">
							{stats.mrr.toLocaleString()} ₽
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
							<TrendingUp className="h-4 w-4" />
							Churn Rate
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-semibold text-foreground">{stats.churnRate}%</div>
					</CardContent>
				</Card>
			</div>

			{/* Subscriptions Table */}
			<Card>
				<CardHeader>
					<CardTitle className="text-xl font-semibold">Активные подписки</CardTitle>
					<CardDescription>Управление премиум-подписками пользователей</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="overflow-hidden rounded-lg border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Пользователь</TableHead>
									<TableHead>План</TableHead>
									<TableHead>Статус</TableHead>
									<TableHead>Дата начала</TableHead>
									<TableHead>След. платеж</TableHead>
									<TableHead className="text-right">Сумма</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{subscriptions.map((sub) => (
									<TableRow key={sub.id}>
										<TableCell>
											<div>
												<div className="text-sm font-semibold text-foreground">{sub.userName}</div>
												<div className="text-xs font-normal text-muted-foreground">
													{sub.userEmail}
												</div>
											</div>
										</TableCell>
										<TableCell>{getPlanBadge(sub.plan)}</TableCell>
										<TableCell>{getStatusBadge(sub.status)}</TableCell>
										<TableCell className="text-sm">{sub.startDate}</TableCell>
										<TableCell className="text-sm">{sub.nextBillingDate}</TableCell>
										<TableCell className="text-right text-sm font-semibold">
											{sub.amount} ₽
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
