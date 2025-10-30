/**
 * Performance Dashboard for i18n System
 *
 * Visual dashboard for monitoring i18n performance metrics
 */

import { Activity, AlertCircle, Download, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import {
	PerformanceMonitor,
	type PerformanceStats,
} from "./PerformanceMonitor";

export function PerformanceDashboard() {
	const [stats, setStats] = useState<PerformanceStats | null>(null);
	const [autoRefresh, setAutoRefresh] = useState(true);

	// Update stats
	const updateStats = () => {
		const currentStats = PerformanceMonitor.getStats();
		setStats(currentStats);
	};

	// Auto-refresh every 2 seconds
	useEffect(() => {
		updateStats();

		if (autoRefresh) {
			const interval = setInterval(updateStats, 2000);
			return () => clearInterval(interval);
		}
	}, [autoRefresh, updateStats]);

	// Export metrics
	const handleExport = () => {
		const data = PerformanceMonitor.export();
		const blob = new Blob([data], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `i18n-metrics-${Date.now()}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	// Clear metrics
	const handleClear = () => {
		if (confirm("Clear all performance metrics?")) {
			PerformanceMonitor.clear();
			updateStats();
		}
	};

	if (!stats) {
		return <div className="p-6">Loading metrics...</div>;
	}

	const getHealthStatus = () => {
		if (stats.errors > 10) {
			return { color: "red", label: "Critical" };
		}
		if (stats.cacheHitRate < 0.7) {
			return { color: "yellow", label: "Warning" };
		}
		if (stats.averageLookupTime > 10) {
			return { color: "yellow", label: "Warning" };
		}
		return { color: "green", label: "Healthy" };
	};

	const health = getHealthStatus();

	return (
		<div className="mx-auto max-w-7xl space-y-6 p-6">
			{/* Header */}
			<div className="rounded-lg bg-card p-6 shadow">
				<div className="mb-4 flex items-center justify-between">
					<div>
						<h1 className="font-bold text-2xl">i18n Performance Dashboard</h1>
						<p className="text-muted-foreground">
							Real-time monitoring of translation system
						</p>
					</div>

					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<span className="text-muted-foreground text-sm">Status:</span>
							<span
								className={`rounded-full px-3 py-1 font-semibold text-sm ${
									health.color === "green"
										? "bg-green-100 text-green-800"
										: health.color === "yellow"
											? "bg-yellow-100 text-yellow-800"
											: "bg-red-100 text-red-800"
								}`}
							>
								{health.label}
							</span>
						</div>
					</div>
				</div>

				{/* Controls */}
				<div className="flex gap-2">
					<button
						className={`rounded-lg px-4 py-2 font-semibold ${
							autoRefresh
								? "bg-blue-600 text-white"
								: "bg-muted text-foreground"
						}`}
						onClick={() => setAutoRefresh(!autoRefresh)}
					>
						{autoRefresh ? "Auto-Refresh ON" : "Auto-Refresh OFF"}
					</button>

					<button
						className="rounded-lg bg-muted px-4 py-2 font-semibold text-foreground hover:bg-muted"
						onClick={updateStats}
					>
						Refresh Now
					</button>

					<button
						className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
						onClick={handleExport}
					>
						<Download className="h-4 w-4" />
						Export
					</button>

					<button
						className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
						onClick={handleClear}
					>
						Clear
					</button>
				</div>
			</div>

			{/* Key Metrics */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				{/* Translation Lookups */}
				<div className="rounded-lg bg-card p-6 shadow">
					<div className="mb-2 flex items-center gap-3">
						<Activity className="h-5 w-5 text-blue-600" />
						<h3 className="font-semibold">Translation Lookups</h3>
					</div>
					<p className="font-bold text-3xl">{stats.translationLookups}</p>
					<p className="mt-1 text-muted-foreground text-sm">
						{stats.translationMisses} misses
					</p>
				</div>

				{/* Cache Hit Rate */}
				<div className="rounded-lg bg-card p-6 shadow">
					<div className="mb-2 flex items-center gap-3">
						<Zap className="h-5 w-5 text-yellow-600" />
						<h3 className="font-semibold">Cache Hit Rate</h3>
					</div>
					<p className="font-bold text-3xl">
						{(stats.cacheHitRate * 100).toFixed(1)}%
					</p>
					<p className="mt-1 text-muted-foreground text-sm">
						{stats.cacheHits} hits / {stats.cacheMisses} misses
					</p>
				</div>

				{/* Average Lookup Time */}
				<div className="rounded-lg bg-card p-6 shadow">
					<div className="mb-2 flex items-center gap-3">
						<TrendingUp className="h-5 w-5 text-green-600" />
						<h3 className="font-semibold">Avg Lookup Time</h3>
					</div>
					<p className="font-bold text-3xl">
						{stats.averageLookupTime.toFixed(2)}ms
					</p>
					<p className="mt-1 text-muted-foreground text-sm">
						P95: {stats.p95.toFixed(2)}ms
					</p>
				</div>

				{/* Errors */}
				<div className="rounded-lg bg-card p-6 shadow">
					<div className="mb-2 flex items-center gap-3">
						<AlertCircle className="h-5 w-5 text-red-600" />
						<h3 className="font-semibold">Errors</h3>
					</div>
					<p className="font-bold text-3xl">{stats.errors}</p>
					<p className="mt-1 truncate text-muted-foreground text-sm">
						{stats.lastError || "No errors"}
					</p>
				</div>
			</div>

			{/* Detailed Metrics */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* Translation Metrics */}
				<div className="rounded-lg bg-card p-6 shadow">
					<h2 className="mb-4 font-bold text-xl">Translation Metrics</h2>
					<div className="space-y-3">
						<MetricRow label="Total Lookups" value={stats.translationLookups} />
						<MetricRow label="Misses" value={stats.translationMisses} />
						<MetricRow
							label="Average Time"
							value={`${stats.averageLookupTime.toFixed(2)}ms`}
						/>
						<MetricRow
							label="P50 (Median)"
							value={`${stats.p50.toFixed(2)}ms`}
						/>
						<MetricRow label="P95" value={`${stats.p95.toFixed(2)}ms`} />
						<MetricRow label="P99" value={`${stats.p99.toFixed(2)}ms`} />
					</div>
				</div>

				{/* Cache Metrics */}
				<div className="rounded-lg bg-card p-6 shadow">
					<h2 className="mb-4 font-bold text-xl">Cache Metrics</h2>
					<div className="space-y-3">
						<MetricRow label="Cache Hits" value={stats.cacheHits} />
						<MetricRow label="Cache Misses" value={stats.cacheMisses} />
						<MetricRow
							label="Hit Rate"
							value={`${(stats.cacheHitRate * 100).toFixed(1)}%`}
						/>
						<MetricRow label="Cache Size" value={stats.cacheSize} />

						{/* Progress bar */}
						<div className="pt-2">
							<div className="mb-1 flex justify-between text-sm">
								<span>Hit Rate</span>
								<span>{(stats.cacheHitRate * 100).toFixed(1)}%</span>
							</div>
							<div className="h-2 w-full rounded-full bg-muted">
								<div
									className={`h-2 rounded-full ${
										stats.cacheHitRate >= 0.8
											? "bg-green-600"
											: stats.cacheHitRate >= 0.6
												? "bg-yellow-600"
												: "bg-red-600"
									}`}
									style={{ width: `${stats.cacheHitRate * 100}%` }}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Loading Metrics */}
				<div className="rounded-lg bg-card p-6 shadow">
					<h2 className="mb-4 font-bold text-xl">Loading Metrics</h2>
					<div className="space-y-3">
						<MetricRow label="Language Loads" value={stats.languageLoads} />
						<MetricRow
							label="Average Load Time"
							value={`${stats.averageLoadTime.toFixed(2)}ms`}
						/>
						<MetricRow
							label="Total Load Time"
							value={`${stats.totalLoadTime.toFixed(2)}ms`}
						/>
					</div>
				</div>

				{/* Memory Metrics */}
				<div className="rounded-lg bg-card p-6 shadow">
					<h2 className="mb-4 font-bold text-xl">Memory Metrics</h2>
					<div className="space-y-3">
						<MetricRow
							label="Current Usage"
							value={formatBytes(stats.memoryUsage)}
						/>
						<MetricRow
							label="Estimated Size"
							value={formatBytes(stats.estimatedSize)}
						/>
					</div>
				</div>
			</div>

			{/* Recommendations */}
			<div className="rounded-lg bg-card p-6 shadow">
				<h2 className="mb-4 font-bold text-xl">Recommendations</h2>
				<div className="space-y-2">
					{stats.cacheHitRate < 0.7 && (
						<Recommendation
							message="Cache hit rate is below 70%. Consider prefetching popular languages."
							type="warning"
						/>
					)}
					{stats.averageLookupTime > 10 && (
						<Recommendation
							message="Average lookup time is above 10ms. Check for performance bottlenecks."
							type="warning"
						/>
					)}
					{stats.errors > 0 && (
						<Recommendation
							message={`${stats.errors} errors detected. Last error: ${stats.lastError}`}
							type="error"
						/>
					)}
					{stats.cacheHitRate >= 0.8 &&
						stats.averageLookupTime <= 5 &&
						stats.errors === 0 && (
							<Recommendation
								message="All metrics are healthy! System is performing optimally."
								type="success"
							/>
						)}
				</div>
			</div>
		</div>
	);
}

// Helper Components

function MetricRow({
	label,
	value,
}: {
	label: string;
	value: string | number;
}) {
	return (
		<div className="flex items-center justify-between border-b py-2 last:border-b-0">
			<span className="text-muted-foreground">{label}</span>
			<span className="font-semibold">{value}</span>
		</div>
	);
}

function Recommendation({
	type,
	message,
}: {
	type: "success" | "warning" | "error";
	message: string;
}) {
	const colors = {
		success: "bg-green-50 border-green-200 text-green-800",
		warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
		error: "bg-red-50 border-red-200 text-red-800",
	};

	return (
		<div className={`rounded-lg border p-3 ${colors[type]}`}>
			<p className="text-sm">{message}</p>
		</div>
	);
}

function formatBytes(bytes: number): string {
	if (bytes === 0) {
		return "0 Bytes";
	}
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
}
