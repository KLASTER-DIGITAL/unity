/**
 * Bar Chart Component (Chart.js)
 *
 * Lazy loaded для уменьшения bundle size
 */

import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	type ChartData,
	type ChartOptions,
	Legend,
	LinearScale,
	Title,
	Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
	data: ChartData<'bar'>;
	options?: ChartOptions<'bar'>;
}

export default function BarChart({ data, options }: BarChartProps) {
	return <Bar data={data} options={options} />;
}
