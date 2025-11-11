/**
 * Line Chart Component (Chart.js)
 *
 * Lazy loaded для уменьшения bundle size
 */

import {
	CategoryScale,
	Chart as ChartJS,
	Filler,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Title,
	Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler
);

interface LineChartProps {
	data: any;
	options?: any;
}

export default function LineChart({ data, options }: LineChartProps) {
	return <Line data={data} options={options} />;
}
