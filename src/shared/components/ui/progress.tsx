import * as ProgressPrimitive from '@radix-ui/react-progress';
import type React from 'react';
import { cn } from './utils';

const Progress = ({
	className,
	value,
	ref,
	...props
}: React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
	ref?: React.RefObject<React.ElementRef<typeof ProgressPrimitive.Root> | null>;
}) => (
	<ProgressPrimitive.Root
		// ✅ FIX: Added max-w-full to prevent progress bar from exceeding container width
		className={cn(
			'relative h-2 w-full max-w-full overflow-hidden rounded-full bg-secondary',
			className
		)}
		ref={ref}
		{...props}
	>
		<ProgressPrimitive.Indicator
			className="h-full w-full flex-1 bg-primary transition-all"
			// ✅ FIX: Clamp value between 0-100 to prevent overflow
			style={{ transform: `translateX(-${100 - Math.min(Math.max(value || 0, 0), 100)}%)` }}
		/>
	</ProgressPrimitive.Root>
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
