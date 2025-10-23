import { toast } from "sonner";
import type { AIStats, AIRecommendation, CostForecast, AIUsageLog, PeriodType } from "./types";

/**
 * AI Analytics Tab - Utility functions
 */

// Generate AI recommendations based on stats
export function generateRecommendations(stats: AIStats): AIRecommendation[] {
  const recs: AIRecommendation[] = [];

  // High cost alert
  if (stats.totalCost > 100) {
    recs.push({
      type: 'warning',
      title: 'Высокие расходы на AI',
      description: `Общая стоимость за период составляет $${stats.totalCost.toFixed(2)}. Рекомендуем оптимизировать использование API.`,
      impact: 'Критично'
    });
  }

  // Expensive model usage
  const expensiveModels = stats.modelBreakdown.filter(m =>
    m.model.includes('gpt-4') && m.requests > stats.totalRequests * 0.5
  );
  if (expensiveModels.length > 0) {
    recs.push({
      type: 'info',
      title: 'Оптимизация моделей',
      description: 'Более 50% запросов используют дорогие модели GPT-4. Рассмотрите использование GPT-3.5-turbo для простых задач.',
      impact: 'Экономия до 90%'
    });
  }

  // High average cost per request
  if (stats.avgCostPerRequest > 0.05) {
    recs.push({
      type: 'warning',
      title: 'Высокая средняя стоимость запроса',
      description: `Средняя стоимость запроса $${stats.avgCostPerRequest.toFixed(4)} выше нормы. Проверьте размеры промптов и контекста.`,
      impact: 'Средне'
    });
  }

  // Low usage - good news
  if (stats.totalCost < 10 && stats.totalRequests > 0) {
    recs.push({
      type: 'success',
      title: 'Эффективное использование',
      description: 'Расходы на AI находятся в пределах нормы. Продолжайте в том же духе!',
      impact: 'Отлично'
    });
  }

  // No usage
  if (stats.totalRequests === 0) {
    recs.push({
      type: 'info',
      title: 'Нет активности',
      description: 'За выбранный период не было AI запросов. Убедитесь, что API настроен корректно.',
      impact: 'Информация'
    });
  }

  return recs;
}

// Calculate cost forecast based on daily usage
export function calculateForecast(dailyUsage: Array<{ date: string; cost: number }>): CostForecast | null {
  if (dailyUsage.length < 7) return null;

  // Calculate average daily cost for last 7 days
  const last7Days = dailyUsage.slice(-7);
  const avgDailyCost = last7Days.reduce((sum, day) => sum + day.cost, 0) / 7;

  // Calculate trend
  const first3Days = last7Days.slice(0, 3).reduce((sum, day) => sum + day.cost, 0) / 3;
  const last3Days = last7Days.slice(-3).reduce((sum, day) => sum + day.cost, 0) / 3;
  const percentageChange = first3Days > 0 ? ((last3Days - first3Days) / first3Days) * 100 : 0;

  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (percentageChange > 10) trend = 'increasing';
  else if (percentageChange < -10) trend = 'decreasing';

  return {
    nextMonth: avgDailyCost * 30,
    nextQuarter: avgDailyCost * 90,
    trend,
    percentageChange
  };
}

// Export logs to CSV
export function exportToCSV(logs: AIUsageLog[], period: PeriodType): void {
  const csv = [
    ['Date', 'User', 'Operation', 'Model', 'Tokens', 'Cost'].join(','),
    ...logs.map(log => [
      new Date(log.created_at).toLocaleString('ru-RU'),
      log.user_name,
      log.operation_type,
      log.model,
      log.total_tokens,
      `$${log.estimated_cost.toFixed(6)}`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-usage-${period}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('CSV файл экспортирован');
}

