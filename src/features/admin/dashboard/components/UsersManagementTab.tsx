import { Ban, CheckCircle, Mail, MoreVertical, RefreshCw, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Input } from '@/shared/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/shared/components/ui/table';
import { logUserAction } from '@/shared/lib/api/services/auditLog';
import { createClient } from '@/utils/supabase/client';

export function UsersManagementTab() {
	type UserRow = {
		id: string;
		name: string | null;
		email: string | null;
		status: string;
		registeredAt: string | null;
		lastActive: string | null;
		entriesCount: number | null;
		streak: number;
	};

	const [users, setUsers] = useState<UserRow[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'premium' | 'blocked'>('all');
	const [isLoading, setIsLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	// ✅ FIX: Define function BEFORE useEffect with useCallback
	const loadUsers = useCallback(async () => {
		try {
			setIsLoading(true);

			// Получаем токен авторизации
			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session?.access_token) {
				throw new Error('No session');
			}

			// Загружаем реальных пользователей (admin-users-api microservice)
			const response = await fetch(
				'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/admin-users-api',
				{
					headers: {
						Authorization: `Bearer ${session.access_token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			if (!response.ok) {
				throw new Error('Failed to load users');
			}

			const result = await response.json();

			// Преобразуем данные к нужному формату
			const formattedUsers: UserRow[] = result.users.map(
				(user: {
					id: string;
					name: string | null;
					email: string | null;
					isPremium?: boolean;
					createdAt: string | null;
					lastActivity: string | null;
					entriesCount: number | null;
					currentStreak?: number;
				}) => ({
					id: user.id,
					name: user.name,
					email: user.email,
					status: user.isPremium ? 'premium' : 'active',
					registeredAt: user.createdAt,
					lastActive: user.lastActivity,
					entriesCount: user.entriesCount,
					streak: user.currentStreak || 0, // ✅ FIXED: Use currentStreak from API
				})
			);

			setUsers(formattedUsers);
			setTotalPages(Math.ceil(result.total / 50));

			console.log(`Loaded ${formattedUsers.length} users`);
		} catch (error) {
			console.error('Error loading users:', error);
			toast.error('Ошибка загрузки пользователей');
			setUsers([]);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// ✅ FIX: useEffect AFTER function definition
	useEffect(() => {
		loadUsers();
	}, [loadUsers]);

	const handleTogglePremium = async (userId: string, currentStatus: string) => {
		try {
			const newIsPremium = currentStatus !== 'premium';

			// Получаем токен авторизации
			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session?.access_token) {
				throw new Error('No session');
			}

			if (newIsPremium) {
				// Активация Premium: создаем подписку
				const response = await fetch(
					'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/admin-subscriptions-api/subscriptions',
					{
						method: 'POST',
						headers: {
							Authorization: `Bearer ${session.access_token}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							userId,
							planType: 'monthly',
							status: 'active',
							amount: 499,
							currency: 'RUB',
							paymentMethod: 'manual',
							metadata: {
								activatedBy: 'admin',
								note: 'Активировано через админ-панель',
							},
						}),
					}
				);

				if (!response.ok) {
					throw new Error('Failed to activate subscription');
				}

				toast.success('Premium подписка активирована');

				// ✅ AUDIT LOG: Log premium activation
				await logUserAction('update', userId, {
					action: 'premium_activated',
					plan: 'monthly',
					amount: 499,
					currency: 'RUB',
					method: 'admin_panel',
				});
			} else {
				// Деактивация Premium: получаем активную подписку и отменяем её
				const getResponse = await fetch(
					`https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/admin-subscriptions-api/subscriptions/${userId}`,
					{
						headers: {
							Authorization: `Bearer ${session.access_token}`,
							'Content-Type': 'application/json',
						},
					}
				);

				if (!getResponse.ok) {
					throw new Error('Failed to get subscriptions');
				}

				const result = await getResponse.json();
				const activeSubscription = result.subscriptions?.find(
					(sub: { status: string }) => sub.status === 'active'
				);

				if (activeSubscription) {
					// Отменяем активную подписку
					const updateResponse = await fetch(
						`https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/admin-subscriptions-api/subscriptions/${activeSubscription.id}`,
						{
							method: 'PUT',
							headers: {
								Authorization: `Bearer ${session.access_token}`,
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								status: 'cancelled',
							}),
						}
					);

					if (!updateResponse.ok) {
						throw new Error('Failed to cancel subscription');
					}

					toast.success('Premium подписка отменена');

					// ✅ AUDIT LOG: Log premium cancellation
					await logUserAction('update', userId, {
						action: 'premium_cancelled',
						subscription_id: activeSubscription.id,
						method: 'admin_panel',
					});
				} else {
					toast.error('Активная подписка не найдена');
				}
			}

			loadUsers(); // Перезагружаем список
		} catch (error) {
			console.error('Error updating subscription:', error);
			toast.error('Ошибка обновления подписки');
		}
	};

	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			user.email.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
		return matchesSearch && matchesFilter;
	});

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'premium':
				return <Badge className="border-accent bg-accent/10 text-accent">Premium</Badge>;
			case 'active':
				return (
					<Badge className="border-green-500/20 bg-green-500/10 text-green-600" variant="outline">
						Активный
					</Badge>
				);
			case 'blocked':
				return <Badge variant="destructive">Заблокирован</Badge>;
			default:
				return <Badge variant="outline">Неактивный</Badge>;
		}
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Управление пользователями</CardTitle>
							<CardDescription>Просмотр и управление аккаунтами пользователей</CardDescription>
						</div>
						<Button
							className="gap-2"
							disabled={isLoading}
							onClick={loadUsers}
							size="sm"
							variant="outline"
						>
							<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
							Обновить
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Search and Filters */}
					<div className="flex flex-col gap-3 sm:flex-row">
						<div className="relative flex-1">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
							<Input
								autoComplete="off"
								className="pl-10"
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Поиск по имени или email..."
								value={searchQuery}
							/>
						</div>
						<div className="flex gap-2">
							<Button
								className="text-[13px]!"
								onClick={() => setFilterStatus('all')}
								variant={filterStatus === 'all' ? 'default' : 'outline'}
							>
								Все
							</Button>
							<Button
								className="text-[13px]!"
								onClick={() => setFilterStatus('active')}
								variant={filterStatus === 'active' ? 'default' : 'outline'}
							>
								Активные
							</Button>
							<Button
								className="text-[13px]!"
								onClick={() => setFilterStatus('premium')}
								variant={filterStatus === 'premium' ? 'default' : 'outline'}
							>
								Premium
							</Button>
						</div>
					</div>

					{/* Users Table */}
					<div className="overflow-hidden rounded-lg border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Пользователь</TableHead>
									<TableHead>Статус</TableHead>
									<TableHead>Зарегистрирован</TableHead>
									<TableHead>Записей</TableHead>
									<TableHead>Streak</TableHead>
									<TableHead className="text-right">Действия</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredUsers.map((user) => (
									<TableRow key={user.id}>
										<TableCell>
											<div>
												<div className="font-semibold! text-[14px]! text-foreground">
													{user.name}
												</div>
												<div className="font-normal! text-[12px]! text-muted-foreground">
													{user.email}
												</div>
											</div>
										</TableCell>
										<TableCell>{getStatusBadge(user.status)}</TableCell>
										<TableCell className="text-[13px]!">
											{user.registeredAt
												? new Date(user.registeredAt).toLocaleDateString('ru-RU')
												: '-'}
										</TableCell>
										<TableCell className="text-[13px]!">{user.entriesCount}</TableCell>
										<TableCell>
											<Badge className="bg-accent/10 text-accent" variant="outline">
												🔥 {user.streak}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button size="sm" variant="ghost">
														<MoreVertical className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem>
														<Mail className="mr-2 h-4 w-4" />
														Отправить email
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => handleTogglePremium(user.id, user.status)}
													>
														<CheckCircle className="mr-2 h-4 w-4" />
														{user.status === 'premium' ? 'Отменить Premium' : 'Выдать Premium'}
													</DropdownMenuItem>
													<DropdownMenuItem className="text-destructive">
														<Ban className="mr-2 h-4 w-4" />
														Заблокировать
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{isLoading && (
						<div className="py-8 text-center">
							<RefreshCw className="mx-auto mb-2 h-8 w-8 animate-spin text-muted-foreground" />
							<p className="text-muted-foreground">Загрузка...</p>
						</div>
					)}

					{!isLoading && filteredUsers.length === 0 && (
						<div className="py-8 text-center">
							<p className="text-muted-foreground">Пользователи не найдены</p>
						</div>
					)}

					{/* Pagination */}
					{!isLoading && totalPages > 1 && (
						<div className="flex items-center justify-between pt-4">
							<p className="text-muted-foreground">
								Страница {currentPage} из {totalPages}
							</p>
							<div className="flex gap-2">
								<Button
									disabled={currentPage === 1}
									onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
									size="sm"
									variant="outline"
								>
									Назад
								</Button>
								<Button
									disabled={currentPage === totalPages}
									onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
									size="sm"
									variant="outline"
								>
									Вперёд
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
