import type React from 'react';

import { cn } from './utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
	return (
		<input
			className={cn(
				// Base styles
				'flex h-10 w-full min-w-0 rounded-lg border px-3 py-2 text-base outline-none transition-[color,box-shadow]',
				// Background & Border
				'border-border bg-muted/50',
				'dark:border-border dark:bg-muted/30',
				// Text & Placeholder
				'text-foreground placeholder:text-muted-foreground',
				// Focus state
				'focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20',
				'focus-visible:bg-background',
				// Selection
				'selection:bg-primary selection:text-primary-foreground',
				// Invalid state
				'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
				// Disabled state
				'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
				// File input
				'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm',
				// Responsive
				'md:h-9 md:text-sm',
				className
			)}
			data-slot="input"
			type={type}
			{...props}
		/>
	);
}

export { Input };
