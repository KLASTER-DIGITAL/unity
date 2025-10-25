import { Target, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import type { CostForecast } from "./types";

/**
 * Forecast Card Component
 * Displays cost forecast for next month and quarter
 */
interface ForecastCardProps {
  forecast: CostForecast | null;
}

export function ForecastCard({ forecast }: ForecastCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[17px]! flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-500" />
          Прогноз затрат
        </CardTitle>
        <CardDescription className="text-[13px]! font-normal!">
          Прогнозирование расходов на основе текущих трендов
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!forecast ? (
          <p className="text-center text-muted-foreground text-[13px]! py-8">
            Недостаточно данных для прогноза (минимум 7 дней)
          </p>
        ) : (
          <div className="space-y-4">
            {/* Next Month Forecast */}
            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px]! text-muted-foreground">Следующий месяц</span>
                <span className="text-[20px]! font-bold! text-foreground">
                  ${forecast.nextMonth.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {forecast.trend === 'increasing' ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-red-500" />
                    <span className="text-[12px]! text-red-500">
                      Рост {Math.abs(forecast.percentageChange).toFixed(1)}%
                    </span>
                  </>
                ) : forecast.trend === 'decreasing' ? (
                  <>
                    <TrendingDown className="w-4 h-4 text-green-500" />
                    <span className="text-[12px]! text-green-500">
                      Снижение {Math.abs(forecast.percentageChange).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <span className="text-[12px]! text-muted-foreground">
                    Стабильно
                  </span>
                )}
              </div>
            </div>

            {/* Next Quarter Forecast */}
            <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px]! text-muted-foreground">Следующий квартал</span>
                <span className="text-[20px]! font-bold! text-foreground">
                  ${forecast.nextQuarter.toFixed(2)}
                </span>
              </div>
              <p className="text-[12px]! text-muted-foreground">
                Прогноз на 90 дней при текущем уровне использования
              </p>
            </div>

            {/* Warning for rapid growth */}
            {forecast.trend === 'increasing' && forecast.percentageChange > 20 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-[14px]!">Внимание!</AlertTitle>
                <AlertDescription className="text-[13px]!">
                  Расходы растут быстрыми темпами. Рекомендуем пересмотреть стратегию использования AI.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

