import { Zap, TrendingUp, DollarSign, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { AIStats } from "./types";

/**
 * Stats Cards Component
 * Displays 4 key metrics: Total Requests, Total Tokens, Total Cost, Average Cost
 */
interface StatsCardsProps {
  stats: AIStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Requests */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="!text-[13px] !font-medium text-muted-foreground">Всего запросов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="!text-[28px] !font-bold text-foreground">{stats.totalRequests}</div>
            <div className="w-10 h-10 rounded-[var(--radius)] bg-accent/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Tokens */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="!text-[13px] !font-medium text-muted-foreground">Всего токенов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="!text-[28px] !font-bold text-foreground">{stats.totalTokens.toLocaleString()}</div>
            <div className="w-10 h-10 rounded-[var(--radius)] bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Cost */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="!text-[13px] !font-medium text-muted-foreground">Общая стоимость</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="!text-[28px] !font-bold text-foreground">${stats.totalCost.toFixed(2)}</div>
            <div className="w-10 h-10 rounded-[var(--radius)] bg-green-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Cost */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="!text-[13px] !font-medium text-muted-foreground">Средняя стоимость</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="!text-[28px] !font-bold text-foreground">${stats.avgCostPerRequest.toFixed(4)}</div>
            <div className="w-10 h-10 rounded-[var(--radius)] bg-orange-500/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

