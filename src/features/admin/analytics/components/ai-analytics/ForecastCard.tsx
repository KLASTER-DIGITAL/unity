import { AlertTriangle, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import type { CostForecast } from './types';

/**
 * Forecast Card Component
 * Displays cost forecast for next month and quarter
 */
type ForecastCardProps = {
  forecast: CostForecast | null;
};

export function ForecastCard({ forecast }: ForecastCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[17px]!">
          <Target className="h-5 w-5 text-purple-500" />
          Прогноз затрат
        </CardTitle>
        <CardDescription className="font-normal! text-[13px]!">
          Прогнозирование расходов на основе текущих трендов
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!forecast ? (
          <p className="py-8 text-center text-[13px]! text-muted-foreground">
            Недостаточно данных для прогноза (минимум 7 дней)
          </p>
        ) : (
          <div className="space-y-4">
            {/* Next Month Forecast */}
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[13px]! text-muted-foreground">Следующий месяц</span>
                <span className="font-bold! text-[20px]! text-foreground">
                  ${forecast.nextMonth.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {forecast.trend === 'increasing' ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-red-500" />
                    <span className="text-[12px]! text-red-500">
                      Рост {Math.abs(forecast.percentageChange).toFixed(1)}%
                    </span>
                  </>
                ) : forecast.trend === 'decreasing' ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-green-500" />
                    <span className="text-[12px]! text-green-500">
                      Снижение {Math.abs(forecast.percentageChange).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <span className="text-[12px]! text-muted-foreground">Стабильно</span>
                )}
              </div>
            </div>

            {/* Next Quarter Forecast */}
            <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[13px]! text-muted-foreground">Следующий квартал</span>
                <span className="font-bold! text-[20px]! text-foreground">
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
                  Расходы растут быстрыми темпами. Рекомендуем пересмотреть стратегию использования
                  AI.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
