/**
 * Line Chart Component (Chart.js)
 *
 * Lazy loaded для уменьшения bundle size
 */

import {
	CategoryScale,
	type ChartData,
	Chart as ChartJS,
	type ChartOptions,
	Legend,
	LineElement,
	PointElement,
	Title,
	Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LineElement, PointElement, Title, Tooltip, Legend);

interface LineChartProps {
	data: ChartData<'line'>;
	options?: ChartOptions<'line'>;
}

export default function LineChart({ data, options }: LineChartProps) {
	return <Line data={data} options={options} />;
}
