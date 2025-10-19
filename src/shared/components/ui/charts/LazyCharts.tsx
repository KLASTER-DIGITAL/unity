import { Suspense, lazy } from "react";
import { LoadingScreen } from "@/shared/components/LoadingScreen";

// Lazy load chart components для оптимизации производительности
// Эти компоненты используют recharts - тяжелую библиотеку для графиков

// Bar Chart Components
const BarChart01 = lazy(() => import("../shadcn-io/bar-chart-01").then(module => ({ default: module.ChartBarInteractive })));

// Line Chart Components  
const LineChart01 = lazy(() => import("../shadcn-io/line-chart-01").then(module => ({ default: module.ChartLineInteractive })));

// Pie Chart Components
const PieChart01 = lazy(() => import("../shadcn-io/pie-chart-01").then(module => ({ default: module.ChartPieSimple })));

// Admin Usage Chart (тяжелый компонент с recharts)
const UsageChart = lazy(() => import("../../../../components/screens/admin/settings/api/UsageChart").then(module => ({ default: module.UsageChart })));

// Chart Loading Component
const ChartLoadingFallback = () => (
  <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
      <p className="text-sm text-gray-500">Загрузка графика...</p>
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

export const LazyUsageChart = (props: any) => (
  <Suspense fallback={<ChartLoadingFallback />}>
    <UsageChart {...props} />
  </Suspense>
);

// Preload функции для критических графиков
export const preloadCharts = {
  barChart: () => import("../shadcn-io/bar-chart-01"),
  lineChart: () => import("../shadcn-io/line-chart-01"), 
  pieChart: () => import("../shadcn-io/pie-chart-01"),
  usageChart: () => import("../../../../components/screens/admin/settings/api/UsageChart")
};

// Hook для preloading графиков при hover
export const useChartPreload = () => {
  const preloadOnHover = (chartType: keyof typeof preloadCharts) => {
    return {
      onMouseEnter: () => preloadCharts[chartType](),
      onFocus: () => preloadCharts[chartType]()
    };
  };

  return { preloadOnHover };
};

// Экспорт всех lazy chart компонентов
export {
  LazyBarChart as BarChart,
  LazyLineChart as LineChart, 
  LazyPieChart as PieChart,
  LazyUsageChart as UsageChart
};

// Экспорт для обратной совместимости
export default {
  BarChart: LazyBarChart,
  LineChart: LazyLineChart,
  PieChart: LazyPieChart,
  UsageChart: LazyUsageChart,
  preloadCharts,
  useChartPreload
};
