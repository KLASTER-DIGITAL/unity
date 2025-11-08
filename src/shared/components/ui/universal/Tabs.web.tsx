/**
 * Universal Tabs Component - Web Implementation
 *
 * Uses Radix UI Tabs for web platform
 *
 * @module components/ui/universal/Tabs.web
 */

import * as TabsPrimitive from '@radix-ui/react-tabs';
import type React from 'react';
import { cn } from '../utils';

// ============================================================================
// TYPES
// ============================================================================

export type TabItem = {
	value: string;
	label: string;
	content: React.ReactNode;
	disabled?: boolean;
};

export type TabsProps = {
	/** Tab items */
	items: TabItem[];
	/** Default active tab value */
	defaultValue?: string;
	/** Controlled active tab value */
	value?: string;
	/** Callback when tab changes */
	onValueChange?: (value: string) => void;
	/** Custom className */
	className?: string;
	/** Tabs list className */
	listClassName?: string;
	/** Tab trigger className */
	triggerClassName?: string;
	/** Tab content className */
	contentClassName?: string;
};

// ============================================================================
// COMPONENT
// ============================================================================

export function Tabs({
	items,
	defaultValue,
	value,
	onValueChange,
	className,
	listClassName,
	triggerClassName,
	contentClassName,
}: TabsProps) {
	const initialValue = value || defaultValue || items[0]?.value;

	return (
		<TabsPrimitive.Root
			className={cn('flex flex-col gap-2', className)}
			defaultValue={initialValue}
			onValueChange={onValueChange}
			value={value}
		>
			<TabsPrimitive.List
				className={cn(
					'inline-flex h-9 w-fit items-center justify-center rounded-xl bg-muted p-[3px] text-muted-foreground',
					listClassName
				)}
			>
				{items.map((item) => (
					<TabsPrimitive.Trigger
						className={cn(
							'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1 font-medium text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow',
							triggerClassName
						)}
						disabled={item.disabled}
						key={item.value}
						value={item.value}
					>
						{item.label}
					</TabsPrimitive.Trigger>
				))}
			</TabsPrimitive.List>

			{items.map((item) => (
				<TabsPrimitive.Content
					className={cn('flex-1 outline-none data-[state=inactive]:hidden', contentClassName)}
					key={item.value}
					value={item.value}
				>
					{item.content}
				</TabsPrimitive.Content>
			))}
		</TabsPrimitive.Root>
	);
}

// ============================================================================
// UTILITIES
// ============================================================================

export const TabsUtils = {
	/**
	 * Validate tabs props
	 */
	validateProps: (props: TabsProps) => {
		const errors: string[] = [];

		if (!props.items || props.items.length === 0) {
			errors.push('items array cannot be empty');
		}

		if (props.value && props.defaultValue) {
			errors.push('Cannot use both value and defaultValue');
		}

		const values = props.items.map((item) => item.value);
		const uniqueValues = new Set(values);
		if (values.length !== uniqueValues.size) {
			errors.push('Tab values must be unique');
		}

		return {
			valid: errors.length === 0,
			errors,
		};
	},

	/**
	 * Find tab by value
	 */
	findTab: (items: TabItem[], value: string) => {
		return items.find((item) => item.value === value);
	},

	/**
	 * Get next tab value
	 */
	getNextTab: (items: TabItem[], currentValue: string) => {
		const currentIndex = items.findIndex((item) => item.value === currentValue);
		const nextIndex = (currentIndex + 1) % items.length;
		return items[nextIndex].value;
	},

	/**
	 * Get previous tab value
	 */
	getPreviousTab: (items: TabItem[], currentValue: string) => {
		const currentIndex = items.findIndex((item) => item.value === currentValue);
		const previousIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
		return items[previousIndex].value;
	},
};
