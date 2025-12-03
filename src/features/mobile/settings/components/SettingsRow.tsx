import { ChevronRight, type LucideIcon } from 'lucide-react';
import type React from 'react';
import { Switch } from '@/shared/components/ui/switch';
import { cn } from '@/shared/components/ui/utils';

type SettingsRowProps = {
	icon: LucideIcon;
	iconColor?: string;
	iconBgColor?: string;
	title: string;
	description?: string;
	onClick?: () => void;
	rightElement?: 'chevron' | 'switch' | 'custom' | 'none';
	switchChecked?: boolean;
	onSwitchChange?: (checked: boolean) => void;
	customRightElement?: React.ReactNode;
	className?: string;
	disabled?: boolean;
};

export const SettingsRow: React.FC<SettingsRowProps> = ({
	icon: Icon,
	iconColor = 'text-(--ios-blue)',
	iconBgColor = 'bg-(--ios-blue)/10',
	title,
	description,
	onClick,
	rightElement = 'chevron',
	switchChecked = false,
	onSwitchChange,
	customRightElement,
	className,
	disabled = false,
}) => {
	const handleClick = (e: React.MouseEvent) => {
		// For switch rows, toggle the switch when clicking anywhere on the row
		if (rightElement === 'switch' && onSwitchChange && !disabled) {
			// Don't toggle if clicking directly on the switch itself (it handles its own state)
			if (!(e.target as HTMLElement).closest('[role="switch"]')) {
				onSwitchChange(!switchChecked);
				return;
			}
		}
		// Allow onClick even when disabled (for premium modal trigger)
		if (onClick) {
			onClick();
		}
	};

	const handleSwitchChange = (checked: boolean) => {
		if (!disabled && onSwitchChange) {
			onSwitchChange(checked);
		}
	};

	// ✅ FIX: Use <div> instead of <button> when rightElement is 'switch' OR 'custom' with onSwitchChange
	// Radix UI Switch renders a <button> internally, so we can't nest it inside another <button>
	// Also, customRightElement might contain a <button>, so we need to use <div> to avoid nesting
	const Container =
		rightElement === 'switch' || (rightElement === 'custom' && onSwitchChange) ? 'div' : 'button';
	const containerProps =
		rightElement === 'switch' || (rightElement === 'custom' && onSwitchChange)
			? {
					onClick: handleClick,
					role: 'button',
					tabIndex: disabled ? -1 : 0,
					onKeyDown: (e: React.KeyboardEvent) => {
						if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
							e.preventDefault();
							handleClick(e as unknown as React.MouseEvent);
						}
					},
				}
			: {
					type: 'button' as const,
					onClick: handleClick,
				};

	return (
		<Container
			{...containerProps}
			className={cn(
				'flex w-full items-center justify-between p-row text-left transition-colors',
				// iOS HIG: minimum 44px touch target
				'min-h-[44px]',
				// Make entire row clickable for switch
				rightElement === 'switch' &&
					!disabled &&
					'cursor-pointer hover:bg-muted active:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
				// Regular onClick behavior
				!disabled &&
					onClick &&
					rightElement !== 'switch' &&
					'cursor-pointer hover:bg-muted active:bg-accent/10',
				disabled && onClick && 'cursor-pointer hover:bg-muted active:bg-accent/10',
				className
			)}
		>
			<div className="flex min-w-0 flex-1 items-center gap-responsive-md">
				{/* Icon */}
				<div className={cn('shrink-0 rounded-xl p-2.5', iconBgColor)}>
					<Icon className={cn('h-5 w-5', iconColor)} strokeWidth={2} />
				</div>

				{/* Text Content */}
				<div className="min-w-0 flex-1">
					<h4 className="text-foreground text-headline leading-tight">{title}</h4>
					{description && (
						<p className="mt-0.5 text-footnote text-muted-foreground leading-tight">
							{description}
						</p>
					)}
				</div>
			</div>

			{/* Right Element */}
			<div className="ml-3 shrink-0">
				{rightElement === 'chevron' && (
					<ChevronRight className="h-5 w-5 text-muted-foreground" strokeWidth={2} />
				)}
				{rightElement === 'switch' && (
					<Switch
						checked={switchChecked}
						disabled={disabled}
						onCheckedChange={handleSwitchChange}
					/>
				)}
				{rightElement === 'custom' && customRightElement}
			</div>
		</Container>
	);
};

type SettingsSectionProps = {
	title: string;
	children: React.ReactNode;
	className?: string;
};

export const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children, className }) => (
	<div className={cn('px-4 pt-6 pb-2', className)}>
		<h3 className="mb-3 px-2 text-center font-semibold text-muted-foreground text-xs uppercase tracking-wider">
			{title}
		</h3>
		<div className="divide-y divide-border overflow-hidden rounded-2xl border-0 bg-card shadow-sm transition-colors duration-300">
			{children}
		</div>
	</div>
);
