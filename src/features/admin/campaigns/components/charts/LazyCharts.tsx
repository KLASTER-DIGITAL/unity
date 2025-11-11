/**
 * Lazy Loaded Chart.js Components
 *
 * Code splitting для Chart.js компонентов
 * Уменьшает initial bundle size на ~30 KB
 */

import { lazy, Suspense } from 'react';

// Lazy load Chart.js components
const LineChartComponent = lazy(() => import('./LineChart'));
const BarChartComponent = lazy(() => import('./BarChart'));

// Loading fallback
function ChartLoadingFallback() {
	return (
		<div className="flex h-full items-center justify-center">
			<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
		</div>
	);
}

// Lazy Line Chart wrapper
export function LazyLineChart(props: any) {
	return (
		<Suspense fallback={<ChartLoadingFallback />}>
			<LineChartComponent {...props} />
		</Suspense>
	);
}

// Lazy Bar Chart wrapper
export function LazyBarChart(props: any) {
	return (
		<Suspense fallback={<ChartLoadingFallback />}>
			<BarChartComponent {...props} />
		</Suspense>
	);
}
