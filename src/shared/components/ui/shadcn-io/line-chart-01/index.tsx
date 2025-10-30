'use client';

import React from 'react';
// @ts-expect-error - recharts is not installed, this component is for future use
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '../../chart';

export const description = 'An interactive line chart';

const chartData = [
  { date: '2024-04-01', desktop: 222, mobile: 150 },
  { date: '2024-04-02', desktop: 97, mobile: 180 },
  { date: '2024-04-03', desktop: 167, mobile: 120 },
  { date: '2024-04-04', desktop: 242, mobile: 260 },
  { date: '2024-04-05', desktop: 373, mobile: 290 },
  { date: '2024-04-06', desktop: 301, mobile: 340 },
  { date: '2024-04-07', desktop: 245, mobile: 180 },
  { date: '2024-04-08', desktop: 409, mobile: 320 },
  { date: '2024-04-09', desktop: 59, mobile: 110 },
  { date: '2024-04-10', desktop: 261, mobile: 190 },
  { date: '2024-04-11', desktop: 327, mobile: 350 },
  { date: '2024-04-12', desktop: 292, mobile: 210 },
  { date: '2024-04-13', desktop: 342, mobile: 380 },
  { date: '2024-04-14', desktop: 137, mobile: 220 },
  { date: '2024-04-15', desktop: 120, mobile: 170 },
  { date: '2024-04-16', desktop: 138, mobile: 190 },
  { date: '2024-04-17', desktop: 446, mobile: 360 },
  { date: '2024-04-18', desktop: 364, mobile: 410 },
  { date: '2024-04-19', desktop: 243, mobile: 180 },
  { date: '2024-04-20', desktop: 89, mobile: 150 },
  { date: '2024-04-21', desktop: 137, mobile: 200 },
  { date: '2024-04-22', desktop: 224, mobile: 170 },
  { date: '2024-04-23', desktop: 138, mobile: 230 },
  { date: '2024-04-24', desktop: 387, mobile: 290 },
  { date: '2024-04-25', desktop: 215, mobile: 250 },
  { date: '2024-04-26', desktop: 75, mobile: 130 },
  { date: '2024-04-27', desktop: 383, mobile: 420 },
  { date: '2024-04-28', desktop: 122, mobile: 180 },
  { date: '2024-04-29', desktop: 315, mobile: 240 },
  { date: '2024-04-30', desktop: 454, mobile: 380 },
];

const chartConfig = {
  views: {
    label: 'Page Views',
  },
  desktop: {
    label: 'Desktop',
    color: 'var(--chart-1)',
  },
  mobile: {
    label: 'Mobile',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export function ChartLineInteractive() {
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>('desktop');

  const total = React.useMemo(
    () => ({
      desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
      mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0),
    }),
    []
  );

  return (
    <div className="flex h-full w-full flex-col p-4">
      <div className="mb-4 flex flex-col items-stretch border-b pb-4 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1">
          <h3 className="font-semibold text-lg">Line Chart - Interactive</h3>
          <p className="text-muted-foreground text-sm">
            Showing total visitors for the last 3 months
          </p>
        </div>
        <div className="mt-4 flex sm:mt-0">
          {['desktop', 'mobile'].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                data-active={activeChart === chart}
                key={chart}
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">{chartConfig[chart].label}</span>
                <span className="font-bold text-lg leading-none sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <ChartContainer className="h-[250px] w-full" config={chartConfig}>
          <LineChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="date"
              minTickGap={32}
              tickFormatter={(value: string) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              {...({
                content: (
                  <ChartTooltipContent
                    className="w-[150px]"
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    }
                    nameKey="views"
                  />
                ),
              } as any)}
            />
            <Line
              dataKey={activeChart}
              dot={false}
              stroke={`var(--color-${activeChart})`}
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}
