import { Brain, Download, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SimpleChart } from "@/shared/components/SimpleChart";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { Select } from "@/shared/components/ui/universal/Select.web";
import { createClient } from "@/utils/supabase/client";
import type {
	AIRecommendation,
	AIStats,
	AIUsageLog,
	CostForecast,
	PeriodType,
} from "./ai-analytics";
// Import modular components
import {
	calculateForecast,
	exportToCSV,
	ForecastCard,
	generateRecommendations,
	RecommendationsCard,
	StatsCards,
} from "./ai-analytics";

// Re-export types for backward compatibility
export type { AIUsageLog, AIStats, AIRecommendation, CostForecast };

export function AIAnalyticsTab() {
	const [isLoading, setIsLoading] = useState(false);
	const [logs, setLogs] = useState<AIUsageLog[]>([]);
	const [stats, setStats] = useState<AIStats>({
		totalRequests: 0,
		totalTokens: 0,
		totalCost: 0,
		avgCostPerRequest: 0,
		topUsers: [],
		operationBreakdown: [],
		modelBreakdown: [],
		dailyUsage: [],
	});
	const [period, setPeriod] = useState<PeriodType>("30d");
	const [recommendations, setRecommendations] = useState<AIRecommendation[]>(
		[],
	);
	const [forecast, setForecast] = useState<CostForecast | null>(null);

	useEffect(() => {
		loadAIAnalytics();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const loadAIAnalytics = async () => {
		setIsLoading(true);
		try {
			const supabase = createClient();

			// Calculate date range
			let startDate = new Date();
			if (period === "7d") {
				startDate.setDate(startDate.getDate() - 7);
			} else if (period === "30d") {
				startDate.setDate(startDate.getDate() - 30);
			} else if (period === "90d") {
				startDate.setDate(startDate.getDate() - 90);
			} else {
				startDate = new Date("2020-01-01"); // All time
			}

			// Fetch AI usage logs with user info
			const { data: logsData, error: logsError } = await supabase
				.from("openai_usage")
				.select(`
          *,
          profiles!user_id (
            name,
            email
          )
        `)
				.gte("created_at", startDate.toISOString())
				.order("created_at", { ascending: false })
				.limit(100);

			if (logsError) {
				throw logsError;
			}

			// Process logs
			const processedLogs: AIUsageLog[] = (logsData || []).map((log: any) => ({
				...log,
				user_name: log.profiles?.name || "Unknown",
				user_email: log.profiles?.email || "unknown@example.com",
			}));

			setLogs(processedLogs);

			// Calculate statistics
			const totalRequests = processedLogs.length;
			const totalTokens = processedLogs.reduce(
				(sum, log) => sum + (log.total_tokens || 0),
				0,
			);
			const totalCost = processedLogs.reduce(
				(sum, log) => sum + (log.estimated_cost || 0),
				0,
			);
			const avgCostPerRequest =
				totalRequests > 0 ? totalCost / totalRequests : 0;

			// Top users
			const userMap = new Map<
				string,
				{ user_id: string; user_name: string; requests: number; cost: number }
			>();
			processedLogs.forEach((log) => {
				const existing = userMap.get(log.user_id) || {
					user_id: log.user_id,
					user_name: log.user_name || "Unknown",
					requests: 0,
					cost: 0,
				};
				existing.requests += 1;
				existing.cost += log.estimated_cost || 0;
				userMap.set(log.user_id, existing);
			});
			const topUsers = Array.from(userMap.values())
				.sort((a, b) => b.cost - a.cost)
				.slice(0, 5);

			// Operation breakdown
			const operationMap = new Map<
				string,
				{ operation: string; requests: number; cost: number }
			>();
			processedLogs.forEach((log) => {
				const existing = operationMap.get(log.operation_type) || {
					operation: log.operation_type,
					requests: 0,
					cost: 0,
				};
				existing.requests += 1;
				existing.cost += log.estimated_cost || 0;
				operationMap.set(log.operation_type, existing);
			});
			const operationBreakdown = Array.from(operationMap.values());

			// Model breakdown
			const modelMap = new Map<
				string,
				{ model: string; requests: number; cost: number }
			>();
			processedLogs.forEach((log) => {
				const existing = modelMap.get(log.model) || {
					model: log.model,
					requests: 0,
					cost: 0,
				};
				existing.requests += 1;
				existing.cost += log.estimated_cost || 0;
				modelMap.set(log.model, existing);
			});
			const modelBreakdown = Array.from(modelMap.values());

			// Daily usage
			const dailyMap = new Map<
				string,
				{ date: string; requests: number; cost: number; tokens: number }
			>();
			processedLogs.forEach((log) => {
				const date = new Date(log.created_at).toLocaleDateString("ru-RU");
				const existing = dailyMap.get(date) || {
					date,
					requests: 0,
					cost: 0,
					tokens: 0,
				};
				existing.requests += 1;
				existing.cost += log.estimated_cost || 0;
				existing.tokens += log.total_tokens || 0;
				dailyMap.set(date, existing);
			});
			const dailyUsage = Array.from(dailyMap.values())
				.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
				.slice(-14); // Last 14 days

			const newStats = {
				totalRequests,
				totalTokens,
				totalCost,
				avgCostPerRequest,
				topUsers,
				operationBreakdown,
				modelBreakdown,
				dailyUsage,
			};

			setStats(newStats);

			// Generate recommendations
			const recs = generateRecommendations(newStats);
			setRecommendations(recs);

			// Calculate forecast
			const forecastData = calculateForecast(dailyUsage);
			setForecast(forecastData);

			toast.success("AI аналитика загружена");
		} catch (error: any) {
			console.error("Error loading AI analytics:", error);
			toast.error(`Ошибка загрузки: ${error.message}`);
		} finally {
			setIsLoading(false);
		}
	};

	// ✅ REMOVED: exportToCSV() moved to ./ai-analytics/utils.ts
	// ✅ REMOVED: generateRecommendations() moved to ./ai-analytics/utils.ts
	// ✅ REMOVED: calculateForecast() moved to ./ai-analytics/utils.ts

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="flex items-center gap-2 text-[26px]! text-foreground">
						<Brain className="h-7 w-7 text-accent" />
						AI Analytics
					</h3>
					<p className="font-normal! text-[15px]! text-muted-foreground">
						Аналитика использования OpenAI API
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Select
						className="w-[140px]"
						onValueChange={(value: any) => setPeriod(value)}
						options={[
							{ value: "7d", label: "7 дней" },
							{ value: "30d", label: "30 дней" },
							{ value: "90d", label: "90 дней" },
							{ value: "all", label: "Все время" },
						]}
						value={period}
					/>
					<Button
						className="gap-2"
						disabled={logs.length === 0}
						onClick={() => exportToCSV(logs, period)}
						size="sm"
						variant="outline"
					>
						<Download className="h-4 w-4" />
						Экспорт CSV
					</Button>
					<Button
						className="gap-2"
						disabled={isLoading}
						onClick={loadAIAnalytics}
						size="sm"
						variant="outline"
					>
						<RefreshCw
							className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
						/>
						Обновить
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<StatsCards stats={stats} />

			{/* AI Recommendations & Forecast */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<RecommendationsCard recommendations={recommendations} />
				<ForecastCard forecast={forecast} />
			</div>

			{/* Charts Row 1 */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* Daily Usage Chart */}
				<Card>
					<CardHeader>
						<CardTitle className="text-[17px]!">
							Использование по дням
						</CardTitle>
						<CardDescription className="font-normal! text-[13px]!">
							Запросы и стоимость за последние 14 дней
						</CardDescription>
					</CardHeader>
					<CardContent>
						<SimpleChart
							data={stats.dailyUsage}
							dataKey="requests"
							title="Использование по дням"
							type="line"
							xAxisKey="date"
						/>
					</CardContent>
				</Card>

				{/* Model Breakdown Pie Chart */}
				<Card>
					<CardHeader>
						<CardTitle className="text-[17px]!">
							Распределение по моделям
						</CardTitle>
						<CardDescription className="font-normal! text-[13px]!">
							Использование разных моделей OpenAI
						</CardDescription>
					</CardHeader>
					<CardContent>
						<SimpleChart
							data={stats.modelBreakdown}
							dataKey="requests"
							title="Распределение по моделям"
							type="pie"
							xAxisKey="model"
						/>
					</CardContent>
				</Card>
			</div>

			{/* Charts Row 2 */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* Operation Breakdown Bar Chart */}
				<Card>
					<CardHeader>
						<CardTitle className="text-[17px]!">
							Распределение по операциям
						</CardTitle>
						<CardDescription className="font-normal! text-[13px]!">
							Типы AI операций и их стоимость
						</CardDescription>
					</CardHeader>
					<CardContent>
						<SimpleChart
							data={stats.operationBreakdown}
							dataKey="requests"
							title="Распределение по операциям"
							type="bar"
							xAxisKey="operation"
						/>
					</CardContent>
				</Card>

				{/* Top Users */}
				<Card>
					<CardHeader>
						<CardTitle className="text-[17px]!">Топ пользователей</CardTitle>
						<CardDescription className="font-normal! text-[13px]!">
							Пользователи с наибольшими расходами
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{stats.topUsers.length === 0 ? (
								<p className="py-8 text-center text-[13px]! text-muted-foreground">
									Нет данных
								</p>
							) : (
								stats.topUsers.map((user, index) => (
									<div
										className="flex items-center justify-between rounded-lg bg-accent/5 p-3 transition-colors hover:bg-accent/10"
										key={user.user_id}
									>
										<div className="flex items-center gap-3">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 font-semibold! text-[13px]! text-accent">
												{index + 1}
											</div>
											<div>
												<p className="font-medium! text-[15px]! text-foreground">
													{user.user_name}
												</p>
												<p className="text-[13px]! text-muted-foreground">
													{user.requests} запросов
												</p>
											</div>
										</div>
										<Badge
											className="border-green-500/20 bg-green-500/10 text-green-600"
											variant="outline"
										>
											${user.cost.toFixed(4)}
										</Badge>
									</div>
								))
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Logs Table */}
			<Card>
				<CardHeader>
					<CardTitle className="text-[17px]!">Последние запросы</CardTitle>
					<CardDescription className="font-normal! text-[13px]!">
						100 последних AI запросов
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<RefreshCw className="h-6 w-6 animate-spin text-accent" />
						</div>
					) : logs.length === 0 ? (
						<div className="py-12 text-center">
							<Brain className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
							<p className="text-[15px]! text-muted-foreground">
								Нет данных за выбранный период
							</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="text-[13px]!">Дата</TableHead>
										<TableHead className="text-[13px]!">Пользователь</TableHead>
										<TableHead className="text-[13px]!">Операция</TableHead>
										<TableHead className="text-[13px]!">Модель</TableHead>
										<TableHead className="text-right text-[13px]!">
											Токены
										</TableHead>
										<TableHead className="text-right text-[13px]!">
											Стоимость
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{logs.map((log) => (
										<TableRow key={log.id}>
											<TableCell className="text-[13px]!">
												{new Date(log.created_at).toLocaleString("ru-RU", {
													day: "2-digit",
													month: "2-digit",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</TableCell>
											<TableCell className="text-[13px]!">
												<div>
													<p className="font-medium!">{log.user_name}</p>
													<p className="text-[11px]! text-muted-foreground">
														{log.user_email}
													</p>
												</div>
											</TableCell>
											<TableCell className="text-[13px]!">
												<Badge
													className="bg-accent/10 text-accent"
													variant="outline"
												>
													{log.operation_type}
												</Badge>
											</TableCell>
											<TableCell className="text-[13px]!">
												<Badge
													className="border-blue-500/20 bg-blue-500/10 text-blue-600"
													variant="outline"
												>
													{log.model}
												</Badge>
											</TableCell>
											<TableCell className="text-right font-mono! text-[13px]!">
												{log.total_tokens.toLocaleString()}
											</TableCell>
											<TableCell className="text-right font-mono! text-[13px]! text-green-600">
												${log.estimated_cost.toFixed(6)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
