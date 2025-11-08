/**
 * Universal Accordion Component - Web Implementation
 *
 * Uses Radix UI Accordion for web platform
 *
 * @module components/ui/universal/Accordion.web
 */

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDownIcon } from 'lucide-react';
import type React from 'react';
import { cn } from '../utils';

// ============================================================================
// TYPES
// ============================================================================

export type AccordionItem = {
	value: string;
	title: string;
	content: React.ReactNode;
	disabled?: boolean;
};

export type AccordionProps = {
	/** Accordion items */
	items: AccordionItem[];
	/** Type: single or multiple */
	type?: 'single' | 'multiple';
	/** Collapsible (only for type="single") */
	collapsible?: boolean;
	/** Default open values */
	defaultValue?: string | string[];
	/** Controlled open values */
	value?: string | string[];
	/** Callback when value changes */
	onValueChange?: (value: string | string[]) => void;
	/** Custom className */
	className?: string;
};

// ============================================================================
// COMPONENT
// ============================================================================

export function Accordion({
	items,
	type = 'single',
	collapsible = true,
	defaultValue,
	value,
	onValueChange,
	className,
}: AccordionProps) {
	return (
		<AccordionPrimitive.Root
			className={cn('w-full', className)}
			collapsible={type === 'single' ? collapsible : undefined}
			defaultValue={defaultValue}
			onValueChange={onValueChange as any}
			type={type as any}
			value={value as any}
		>
			{items.map((item) => (
				<AccordionPrimitive.Item
					className="border-b last:border-b-0"
					disabled={item.disabled}
					key={item.value}
					value={item.value}
				>
					<AccordionPrimitive.Header className="flex">
						<AccordionPrimitive.Trigger
							className={cn(
								'flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left font-medium text-sm outline-none transition-all hover:underline focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180'
							)}
						>
							{item.title}
							<ChevronDownIcon className="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200" />
						</AccordionPrimitive.Trigger>
					</AccordionPrimitive.Header>
					<AccordionPrimitive.Content className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
						<div className="pt-0 pb-4">{item.content}</div>
					</AccordionPrimitive.Content>
				</AccordionPrimitive.Item>
			))}
		</AccordionPrimitive.Root>
	);
}

// ============================================================================
// UTILITIES
// ============================================================================

export const AccordionUtils = {
	/**
	 * Validate accordion props
	 */
	validateProps: (props: AccordionProps) => {
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
			errors.push('Accordion item values must be unique');
		}

		if (props.type === 'single' && Array.isArray(props.value)) {
			errors.push('type="single" requires value to be a string, not an array');
		}

		if (props.type === 'multiple' && typeof props.value === 'string') {
			errors.push('type="multiple" requires value to be an array, not a string');
		}

		return {
			valid: errors.length === 0,
			errors,
		};
	},

	/**
	 * Find item by value
	 */
	findItem: (items: AccordionItem[], value: string) => {
		return items.find((item) => item.value === value);
	},

	/**
	 * Check if item is open
	 */
	isItemOpen: (value: string | string[] | undefined, itemValue: string) => {
		if (!value) return false;
		return Array.isArray(value) ? value.includes(itemValue) : value === itemValue;
	},
};
