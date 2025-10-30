import { Brain, DollarSign, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { AIStats } from './types';

/**
 * Stats Cards Component
 * Displays 4 key metrics: Total Requests, Total Tokens, Total Cost, Average Cost
 */
type StatsCardsProps = {
	stats: AIStats;
};

export function StatsCards({ stats }: StatsCardsProps) {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
			{/* Total Requests */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="font-medium! text-[13px]! text-muted-foreground">
						Всего запросов
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div className="font-bold! text-[28px]! text-foreground">{stats.totalRequests}</div>
						<div className="flex h-10 w-10 items-center justify-center rounded-(--radius) bg-accent/10">
							<Zap className="h-5 w-5 text-accent" />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Total Tokens */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="font-medium! text-[13px]! text-muted-foreground">
						Всего токенов
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div className="font-bold! text-[28px]! text-foreground">
							{stats.totalTokens.toLocaleString()}
						</div>
						<div className="flex h-10 w-10 items-center justify-center rounded-(--radius) bg-blue-500/10">
							<TrendingUp className="h-5 w-5 text-blue-500" />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Total Cost */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="font-medium! text-[13px]! text-muted-foreground">
						Общая стоимость
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div className="font-bold! text-[28px]! text-foreground">
							${stats.totalCost.toFixed(2)}
						</div>
						<div className="flex h-10 w-10 items-center justify-center rounded-(--radius) bg-green-500/10">
							<DollarSign className="h-5 w-5 text-green-500" />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Average Cost */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="font-medium! text-[13px]! text-muted-foreground">
						Средняя стоимость
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div className="font-bold! text-[28px]! text-foreground">
							${stats.avgCostPerRequest.toFixed(4)}
						</div>
						<div className="flex h-10 w-10 items-center justify-center rounded-(--radius) bg-orange-500/10">
							<Brain className="h-5 w-5 text-orange-500" />
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
