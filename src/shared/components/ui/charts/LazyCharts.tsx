import { lazy, Suspense } from 'react';

// Lazy load chart components для оптимизации производительности
// Эти компоненты используют recharts - тяжелую библиотеку для графиков

// Bar Chart Components
const BarChart01 = lazy(() =>
  import('../shadcn-io/bar-chart-01').then((module) => ({ default: module.ChartBarInteractive }))
);

// Line Chart Components
const LineChart01 = lazy(() =>
  import('../shadcn-io/line-chart-01').then((module) => ({ default: module.ChartLineInteractive }))
);

// Pie Chart Components
const PieChart01 = lazy(() =>
  import('../shadcn-io/pie-chart-01').then((module) => ({ default: module.ChartPieSimple }))
);

// Chart Loading Component
const ChartLoadingFallback = () => (
  <div className="flex h-64 w-full items-center justify-center rounded-lg border-2 border-border border-dashed bg-muted">
    <div className="text-center">
      <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-blue-500 border-b-2" />
      <p className="text-muted-foreground text-sm">Загрузка графика...</p>
    </div>
  </div>
);

// Wrapper Components with Suspense

export const LazyBarChart = (props: any) => (
  <Suspense fallback={<ChartLoadingFallback />}>
    <BarChart01 {...props} />
  </Suspense>
);

export const LazyLineChart = (props: any) => (
  <Suspense fallback={<ChartLoadingFallback />}>
    <LineChart01 {...props} />
  </Suspense>
);

export const LazyPieChart = (props: any) => (
  <Suspense fallback={<ChartLoadingFallback />}>
    <PieChart01 {...props} />
  </Suspense>
);

// UsageChart component (currently not implemented)
// export const LazyUsageChart = (props: any) => (
//   <Suspense fallback={<ChartLoadingFallback />}>
//     <UsageChart {...props} />
//   </Suspense>
// );

// Preload функции для критических графиков
export const preloadCharts = {
  barChart: () => import('../shadcn-io/bar-chart-01'),
  lineChart: () => import('../shadcn-io/line-chart-01'),
  pieChart: () => import('../shadcn-io/pie-chart-01'),
};

// Hook для preloading графиков при hover
export const useChartPreload = () => {
  const preloadOnHover = (chartType: keyof typeof preloadCharts) => ({
    onMouseEnter: () => preloadCharts[chartType](),
    onFocus: () => preloadCharts[chartType](),
  });

  return { preloadOnHover };
};

// Экспорт всех lazy chart компонентов
export {
  LazyBarChart as BarChart,
  LazyLineChart as LineChart,
  LazyPieChart as PieChart,
  // LazyUsageChart as UsageChart // Not implemented yet
};

// Экспорт для обратной совместимости
export default {
  BarChart: LazyBarChart,
  LineChart: LazyLineChart,
  PieChart: LazyPieChart,
  // UsageChart: LazyUsageChart, // Not implemented yet
  preloadCharts,
  useChartPreload,
};
