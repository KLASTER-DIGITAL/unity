"use client";

import type React from "react";
import { cn } from "./utils";

export type ChartConfig = {
	[key: string]: {
		label: string;
		color?: string;
	};
};

export interface ChartContainerProps
	extends React.HTMLAttributes<HTMLDivElement> {
	config: ChartConfig;
	children: React.ReactNode;
}

export const ChartContainer = ({
	config,
	children,
	className,
	ref,
	...props
}: ChartContainerProps & { ref?: React.RefObject<HTMLDivElement | null> }) => (
	<div
		className={cn("w-full", className)}
		ref={ref}
		style={
			{
				"--color-chrome": "hsl(12, 76%, 61%)",
				"--color-safari": "hsl(173, 58%, 39%)",
				"--color-firefox": "hsl(197, 37%, 24%)",
				"--color-edge": "hsl(43, 74%, 66%)",
				"--color-other": "hsl(210, 40%, 98%)",
				"--color-desktop": "hsl(220, 70%, 50%)",
				"--color-mobile": "hsl(160, 60%, 45%)",
				"--color-views": "hsl(30, 80%, 55%)",
				...Object.entries(config).reduce(
					(acc, [key, value]) => ({
						...acc,
						[`--color-${key}`]: value.color,
					}),
					{},
				),
			} as React.CSSProperties
		}
		{...props}
	>
		{children}
	</div>
);
ChartContainer.displayName = "ChartContainer";

export type ChartTooltipProps = {
	children: React.ReactNode;
	className?: string;
};

export const ChartTooltip = ({ children, className }: ChartTooltipProps) => (
	<div
		className={cn(
			"fade-in-0 zoom-in-95 z-50 min-w-[8rem] animate-in overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-popover-foreground text-sm shadow-md",
			className,
		)}
	>
		{children}
	</div>
);

export type ChartTooltipContentProps = {
	className?: string;
	nameKey?: string;
	labelFormatter?: (value: any) => string;
	hideLabel?: boolean;
};

export const ChartTooltipContent = ({
	className,
	nameKey,
	labelFormatter,
	hideLabel = false,
}: ChartTooltipContentProps) => (
	<div className={cn("grid gap-1.5", className)}>
		{!hideLabel && (
			<div className="flex items-center gap-2.5 px-2.5 py-1.5">
				<div className="h-2.5 w-2.5 rounded-full bg-primary" />
				<span className="font-medium text-sm">
					{labelFormatter ? labelFormatter(nameKey) : nameKey}
				</span>
			</div>
		)}
	</div>
);
