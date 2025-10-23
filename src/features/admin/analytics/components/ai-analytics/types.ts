/**
 * AI Analytics Tab - Type definitions
 */

export interface AIUsageLog {
  id: string;
  user_id: string;
  operation_type: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost: number;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

export interface AIStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  avgCostPerRequest: number;
  topUsers: Array<{ user_id: string; user_name: string; requests: number; cost: number }>;
  operationBreakdown: Array<{ operation: string; requests: number; cost: number }>;
  modelBreakdown: Array<{ model: string; requests: number; cost: number }>;
  dailyUsage: Array<{ date: string; requests: number; cost: number; tokens: number }>;
}

export interface AIRecommendation {
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  impact?: string;
}

export interface CostForecast {
  nextMonth: number;
  nextQuarter: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  percentageChange: number;
}

export type PeriodType = '7d' | '30d' | '90d' | 'all';

