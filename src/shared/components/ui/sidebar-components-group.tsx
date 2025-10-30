'use client';

import { Slot } from '@radix-ui/react-slot';
import type React from 'react';
import { cn } from './utils';

/**
 * Sidebar group
 * Container for related sidebar items
 */
export function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
			data-sidebar="group"
			data-slot="sidebar-group"
			{...props}
		/>
	);
}

/**
 * Sidebar group label
 * Title/header for a sidebar group
 */
export function SidebarGroupLabel({
	className,
	asChild = false,
	...props
}: React.ComponentProps<'div'> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : 'div';

	return (
		<Comp
			className={cn(
				'flex h-8 shrink-0 items-center rounded-md px-2 font-medium text-sidebar-foreground/70 text-xs outline-hidden ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
				'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
				className
			)}
			data-sidebar="group-label"
			data-slot="sidebar-group-label"
			{...props}
		/>
	);
}

/**
 * Sidebar group action
 * Action button for a sidebar group (e.g., add, settings)
 */
export function SidebarGroupAction({
	className,
	asChild = false,
	...props
}: React.ComponentProps<'button'> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : 'button';

	return (
		<Comp
			className={cn(
				'absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-hidden ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
				// Increases the hit area of the button on mobile.
				'after:-inset-2 after:absolute md:after:hidden',
				'group-data-[collapsible=icon]:hidden',
				className
			)}
			data-sidebar="group-action"
			data-slot="sidebar-group-action"
			{...props}
		/>
	);
}

/**
 * Sidebar group content
 * Content area within a sidebar group
 */
export function SidebarGroupContent({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn('w-full text-sm', className)}
			data-sidebar="group-content"
			data-slot="sidebar-group-content"
			{...props}
		/>
	);
}
