'use client';

// @ts-expect-error - recharts is not installed, this component is for future use
import { Pie, PieChart } from 'recharts';

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '../../chart';

export const description = 'A simple pie chart';

const chartData = [
	{ browser: 'chrome', visitors: 275, fill: 'var(--color-chrome)' },
	{ browser: 'safari', visitors: 200, fill: 'var(--color-safari)' },
	{ browser: 'firefox', visitors: 187, fill: 'var(--color-firefox)' },
	{ browser: 'edge', visitors: 173, fill: 'var(--color-edge)' },
	{ browser: 'other', visitors: 90, fill: 'var(--color-other)' },
];

const chartConfig = {
	visitors: {
		label: 'Visitors',
	},
	chrome: {
		label: 'Chrome',
		color: 'var(--chart-1)',
	},
	safari: {
		label: 'Safari',
		color: 'var(--chart-2)',
	},
	firefox: {
		label: 'Firefox',
		color: 'var(--chart-3)',
	},
	edge: {
		label: 'Edge',
		color: 'var(--chart-4)',
	},
	other: {
		label: 'Other',
		color: 'var(--chart-5)',
	},
} satisfies ChartConfig;

export function ChartPieSimple() {
	return (
		<div className="flex h-full w-full flex-col p-4">
			<div className="mb-2 text-center">
				<h3 className="font-semibold text-lg">Pie Chart</h3>
				<p className="text-muted-foreground text-sm">January - June 2024</p>
			</div>
			<div className="flex min-h-0 flex-1 items-center justify-center">
				<ChartContainer className="aspect-square h-80 w-80" config={chartConfig}>
					<PieChart>
						<ChartTooltip {...({ content: <ChartTooltipContent hideLabel /> } as any)} />
						<Pie data={chartData} dataKey="visitors" nameKey="browser" />
					</PieChart>
				</ChartContainer>
			</div>
		</div>
	);
}
