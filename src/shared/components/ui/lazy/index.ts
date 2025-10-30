// Lazy Loading Components для оптимизации производительности
// Используйте эти компоненты вместо прямого импорта тяжелых UI элементов

// Chart Components (recharts - тяжелая библиотека)
export {
	BarChart,
	LineChart,
	PieChart,
	// UsageChart, // Not implemented yet
	preloadCharts,
	useChartPreload,
} from "../charts/LazyCharts";

// UI Components (анимации и сложные интерактивные элементы)
export {
	AnimatedModal,
	AnimatedTooltip,
	BackgroundGradient,
	Card3D,
	ColorPicker,
	Counter,
	Gantt,
	MagneticButton,
	MotionHighlight,
	Pill,
	preloadComponents,
	Rating,
	ShimmeringText,
	Sparkles,
	Status,
	Tabs,
	Terminal,
	useComponentPreload,
} from "./LazyComponents";

// Utility функции для preloading
export const preloadAll = {
	charts: async () => {
		const { preloadCharts } = await import("../charts/LazyCharts");
		await Promise.all([
			preloadCharts.barChart(),
			preloadCharts.lineChart(),
			preloadCharts.pieChart(),
			// preloadCharts.usageChart() // Not implemented yet
		]);
	},

	components: async () => {
		const { preloadComponents } = await import("./LazyComponents");
		await Promise.all([
			preloadComponents.card3d(),
			preloadComponents.animatedModal(),
			preloadComponents.colorPicker(),
			preloadComponents.gantt(),
			preloadComponents.terminal(),
		]);
	},

	all: async () => {
		await Promise.all([preloadAll.charts(), preloadAll.components()]);
	},
};

// Hook для preloading всех компонентов
export const useLazyPreload = () => {
	const preloadOnInteraction = () => ({
		onMouseEnter: () => preloadAll.all(),
		onFocus: () => preloadAll.all(),
	});

	return { preloadOnInteraction, preloadAll };
};
