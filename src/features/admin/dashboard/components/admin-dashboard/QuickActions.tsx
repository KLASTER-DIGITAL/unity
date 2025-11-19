import { Activity, CreditCard, Smartphone, Users } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';

/**
 * Quick Actions Component
 * Displays quick action buttons for common admin tasks
 */

export function QuickActions() {
	return (
		<Card className="border-border">
			<CardHeader>
				<CardTitle className="text-[17px]!">Быстрые действия</CardTitle>
				<CardDescription className="font-normal! text-[13px]!">
					Управление ключевыми функциями приложения
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Button
						className="h-auto justify-start border-border py-4"
						onClick={() =>
							window.dispatchEvent(
								new CustomEvent('admin-navigate', {
									detail: { tab: 'pwa', pwaSubTab: 'settings' },
								})
							)
						}
						variant="outline"
					>
						<div className="flex w-full items-center gap-3">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-(--radius) bg-accent/10">
								<Smartphone className="h-5 w-5 text-accent" />
							</div>
							<div className="flex-1 text-left">
								<p className="text-[15px]! text-foreground">Настройки PWA</p>
								<p className="font-normal! text-[13px]! text-muted-foreground">
									Управление установкой и обновлениями
								</p>
							</div>
						</div>
					</Button>

					<Button
						className="h-auto justify-start border-border py-4"
						onClick={() =>
							window.dispatchEvent(
								new CustomEvent('admin-navigate', {
									detail: { tab: 'pwa', pwaSubTab: 'push' },
								})
							)
						}
						variant="outline"
					>
						<div className="flex w-full items-center gap-3">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-(--radius) bg-accent/10">
								<Activity className="h-5 w-5 text-accent" />
							</div>
							<div className="flex-1 text-left">
								<p className="text-[15px]! text-foreground">Push-уведомления</p>
								<p className="font-normal! text-[13px]! text-muted-foreground">
									Настройка уведомлений
								</p>
							</div>
						</div>
					</Button>

					<Button
						className="h-auto justify-start border-border py-4"
						onClick={() =>
							window.dispatchEvent(new CustomEvent('admin-navigate', { detail: { tab: 'users' } }))
						}
						variant="outline"
					>
						<div className="flex w-full items-center gap-3">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-(--radius) bg-accent/10">
								<Users className="h-5 w-5 text-accent" />
							</div>
							<div className="flex-1 text-left">
								<p className="text-[15px]! text-foreground">Управление пользователями</p>
								<p className="font-normal! text-[13px]! text-muted-foreground">
									Просмотр и редактирование пользователей
								</p>
							</div>
						</div>
					</Button>

					<Button
						className="h-auto justify-start border-border py-4"
						onClick={() =>
							window.dispatchEvent(
								new CustomEvent('admin-navigate', {
									detail: { tab: 'subscriptions' },
								})
							)
						}
						variant="outline"
					>
						<div className="flex w-full items-center gap-3">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-(--radius) bg-accent/10">
								<CreditCard className="h-5 w-5 text-accent" />
							</div>
							<div className="flex-1 text-left">
								<p className="text-[15px]! text-foreground">Управление подписками</p>
								<p className="font-normal! text-[13px]! text-muted-foreground">
									Premium подписки и платежи
								</p>
							</div>
						</div>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
