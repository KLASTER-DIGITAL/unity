'use client';

/**
 * @deprecated This component is deprecated and will be removed in a future version.
 * Please use the Universal RadioGroup component from '@/shared/components/ui/universal/RadioGroup' instead.
 *
 * Migration guide:
 * - Old (compositional API):
 *   <RadioGroup value={value} onValueChange={onChange}>
 *     <div className="flex items-center space-x-2">
 *       <RadioGroupItem value="option1" id="r1" />
 *       <Label htmlFor="r1">Option 1</Label>
 *     </div>
 *   </RadioGroup>
 *
 * - New (props-based API):
 *   <RadioGroup
 *     value={value}
 *     onValueChange={onChange}
 *     options={[
 *       { value: 'option1', label: 'Option 1' },
 *       { value: 'option2', label: 'Option 2' }
 *     ]}
 *   />
 *
 * Benefits of Universal RadioGroup:
 * - Works on both web (Radix UI) and React Native (TouchableOpacity)
 * - Simpler API with options array
 * - Better performance with Platform Adapter
 * - Ready for React Native migration
 */

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { CircleIcon } from 'lucide-react';
import type React from 'react';

import { cn } from './utils';

function RadioGroup({
	className,
	...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
	return (
		<RadioGroupPrimitive.Root
			className={cn('grid gap-3', className)}
			data-slot="radio-group"
			{...props}
		/>
	);
}

function RadioGroupItem({
	className,
	...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
	return (
		<RadioGroupPrimitive.Item
			className={cn(
				'aspect-square size-4 shrink-0 rounded-full border border-input text-primary shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40',
				className
			)}
			data-slot="radio-group-item"
			{...props}
		>
			<RadioGroupPrimitive.Indicator
				className="relative flex items-center justify-center"
				data-slot="radio-group-indicator"
			>
				<CircleIcon className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 size-2 fill-primary" />
			</RadioGroupPrimitive.Indicator>
		</RadioGroupPrimitive.Item>
	);
}

export { RadioGroup, RadioGroupItem };
