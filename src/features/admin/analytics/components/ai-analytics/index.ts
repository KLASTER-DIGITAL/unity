/**
 * AI Analytics Tab - Modular exports
 */

export { StatsCards } from "./StatsCards";
export { RecommendationsCard } from "./RecommendationsCard";
export { ForecastCard } from "./ForecastCard";
export { generateRecommendations, calculateForecast, exportToCSV } from "./utils";
export type {
  AIUsageLog,
  AIStats,
  AIRecommendation,
  CostForecast,
  PeriodType
} from "./types";

