/**
 * Universal Dialog Component - Web Implementation
 *
 * Uses Radix UI Dialog for web platform
 *
 * @module components/ui/universal/Dialog.web
 */

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import type React from 'react';
import { cn } from '../utils';

// ============================================================================
// TYPES
// ============================================================================

export type DialogProps = {
	/** Whether the dialog is open */
	open?: boolean;
	/** Callback when open state changes */
	onOpenChange?: (open: boolean) => void;
	/** Dialog content */
	children?: React.ReactNode;
	/** Default open state (uncontrolled) */
	defaultOpen?: boolean;
};

export type DialogContentProps = {
	/** Content children */
	children?: React.ReactNode;
	/** Custom className */
	className?: string;
	/** Show close button */
	showClose?: boolean;
	/** Close button aria label */
	closeLabel?: string;
};

export type DialogHeaderProps = {
	/** Header children */
	children?: React.ReactNode;
	/** Custom className */
	className?: string;
};

export type DialogFooterProps = {
	/** Footer children */
	children?: React.ReactNode;
	/** Custom className */
	className?: string;
};

export type DialogTitleProps = {
	/** Title text */
	children?: React.ReactNode;
	/** Custom className */
	className?: string;
};

export type DialogDescriptionProps = {
	/** Description text */
	children?: React.ReactNode;
	/** Custom className */
	className?: string;
};

// ============================================================================
// COMPONENTS
// ============================================================================

export function Dialog({ children, ...props }: DialogProps) {
	return <DialogPrimitive.Root {...props}>{children}</DialogPrimitive.Root>;
}

export function DialogTrigger({
	children,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
	return <DialogPrimitive.Trigger {...props}>{children}</DialogPrimitive.Trigger>;
}

export function DialogPortal({
	children,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
	return <DialogPrimitive.Portal {...props}>{children}</DialogPrimitive.Portal>;
}

export function DialogClose({
	children,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
	return <DialogPrimitive.Close {...props}>{children}</DialogPrimitive.Close>;
}

export function DialogOverlay({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
	return (
		<DialogPrimitive.Overlay
			className={cn(
				'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-(--z-modal-backdrop) bg-black/40 backdrop-blur-sm transition-colors duration-300 data-[state=closed]:animate-out data-[state=open]:animate-in',
				className
			)}
			{...props}
		/>
	);
}

export function DialogContent({
	className,
	children,
	showClose = true,
	closeLabel = 'Close',
	...props
}: DialogContentProps) {
	return (
		<DialogPortal>
			<DialogOverlay />
			<DialogPrimitive.Content
				className={cn(
					'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-(--z-modal) grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border border-border bg-card p-6 text-foreground shadow-lg transition-colors duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:max-w-lg',
					className
				)}
				{...props}
			>
				{children}
				{showClose && (
					<DialogPrimitive.Close className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0">
						<XIcon />
						<span className="sr-only">{closeLabel}</span>
					</DialogPrimitive.Close>
				)}
			</DialogPrimitive.Content>
		</DialogPortal>
	);
}

export function DialogHeader({ className, children, ...props }: DialogHeaderProps) {
	return (
		<div className={cn('flex flex-col gap-2 text-center sm:text-left', className)} {...props}>
			{children}
		</div>
	);
}

export function DialogFooter({ className, children, ...props }: DialogFooterProps) {
	return (
		<div
			className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
			{...props}
		>
			{children}
		</div>
	);
}

export function DialogTitle({ className, children, ...props }: DialogTitleProps) {
	return (
		<DialogPrimitive.Title
			className={cn('font-semibold text-lg leading-none tracking-tight', className)}
			{...props}
		>
			{children}
		</DialogPrimitive.Title>
	);
}

export function DialogDescription({ className, children, ...props }: DialogDescriptionProps) {
	return (
		<DialogPrimitive.Description
			className={cn('text-muted-foreground text-sm', className)}
			{...props}
		>
			{children}
		</DialogPrimitive.Description>
	);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
	Dialog,
	DialogTrigger,
	DialogPortal,
	DialogClose,
	DialogOverlay,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
};
